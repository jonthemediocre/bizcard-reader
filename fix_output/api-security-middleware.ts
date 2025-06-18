// Enterprise API Security Middleware - Genesis v4Σ.2 Implementation
// Implements THEPLAN.md requirements: Enterprise security, CORS, input validation, rate limiting

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import { enterpriseAuth } from './enterprise-jwt-auth';

interface SecurityConfig {
  enableCORS: boolean;
  enableHelmet: boolean;
  enableRateLimit: boolean;
  enableInputValidation: boolean;
  enableCSP: boolean;
  trustedDomains: string[];
}

export class APISecurityMiddleware {
  private config: SecurityConfig = {
    enableCORS: true,
    enableHelmet: true,
    enableRateLimit: true,
    enableInputValidation: true,
    enableCSP: true,
    trustedDomains: [
      'https://app.bizcard-enterprise.com',
      'https://staging.bizcard-enterprise.com',
      'https://api.bizcard-enterprise.com'
    ]
  };

  // CORS Configuration for Enterprise Multi-Domain
  getCORSConfig() {
    return cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in trusted domains
        if (this.config.trustedDomains.includes(origin)) {
          return callback(null, true);
        }

        // Allow localhost for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'X-Tenant-ID',
        'X-Client-Version'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      maxAge: 86400 // 24 hours
    });
  }

  // Helmet Security Headers Configuration
  getHelmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "https://js.stripe.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://api.stripe.com", "https://api.openai.com"],
          frameSrc: ["'self'", "https://js.stripe.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  // Rate Limiting by Tier (from THEPLAN.md pricing)
  createRateLimiter(tier: 'free' | 'pro' | 'business' | 'enterprise' = 'free') {
    const limits = enterpriseAuth.getRateLimitByTier(tier);
    
    return rateLimit({
      windowMs: limits.window * 1000, // Convert to milliseconds
      max: limits.requests,
      message: {
        error: 'Rate limit exceeded',
        tier,
        limit: limits.requests,
        window: `${limits.window / 3600} hour(s)`,
        upgradeUrl: '/pricing'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req: Request) => {
        // Use tenant ID + user ID for rate limiting
        const user = req.user;
        return user ? `${user.tenantId}:${user.id}` : req.ip;
      },
      skip: (req: Request) => {
        // Skip rate limiting for enterprise super admins
        return req.user?.role === 'super_admin' && req.user?.tier === 'enterprise';
      }
    });
  }

  // Input Validation Schemas
  static getValidationSchemas() {
    return {
      // Business Card Upload Validation
      businessCardUpload: [
        body('image')
          .isBase64()
          .withMessage('Image must be valid base64'),
        body('fileName')
          .isLength({ min: 1, max: 255 })
          .withMessage('File name must be 1-255 characters')
          .matches(/^[a-zA-Z0-9._-]+$/)
          .withMessage('File name contains invalid characters'),
        body('fileSize')
          .isInt({ min: 1, max: 10485760 }) // 10MB max
          .withMessage('File size must be between 1 byte and 10MB')
      ],

      // User Registration Validation
      userRegistration: [
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Valid email required'),
        body('password')
          .isLength({ min: 8, max: 128 })
          .withMessage('Password must be 8-128 characters')
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('Password must contain uppercase, lowercase, number, and special character'),
        body('name')
          .isLength({ min: 1, max: 100 })
          .withMessage('Name must be 1-100 characters')
          .matches(/^[a-zA-Z\s'-]+$/)
          .withMessage('Name contains invalid characters')
      ],

      // Contact Data Validation
      contactData: [
        body('name')
          .optional()
          .isLength({ max: 100 })
          .withMessage('Name too long'),
        body('email')
          .optional()
          .isEmail()
          .normalizeEmail()
          .withMessage('Invalid email format'),
        body('phone')
          .optional()
          .matches(/^\+?[\d\s\-\(\)\.]+$/)
          .withMessage('Invalid phone number format'),
        body('company')
          .optional()
          .isLength({ max: 200 })
          .withMessage('Company name too long')
      ],

      // API Key Validation
      apiKeyValidation: [
        body('name')
          .isLength({ min: 1, max: 50 })
          .withMessage('API key name must be 1-50 characters'),
        body('permissions')
          .isArray({ min: 1 })
          .withMessage('At least one permission required'),
        body('permissions.*')
          .isIn(['read', 'write', 'admin'])
          .withMessage('Invalid permission')
      ],

      // Tenant Management
      tenantManagement: [
        body('name')
          .isLength({ min: 1, max: 100 })
          .withMessage('Tenant name required'),
        body('domain')
          .optional()
          .isFQDN()
          .withMessage('Invalid domain format'),
        body('settings.maxUsers')
          .optional()
          .isInt({ min: 1, max: 10000 })
          .withMessage('Max users must be 1-10000')
      ]
    };
  }

  // Input Sanitization Middleware
  static sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize all string inputs to prevent XSS
    const sanitizeValue = (value: any): any => {
      if (typeof value === 'string') {
        // Remove potentially dangerous HTML/JS
        return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
      } else if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      } else if (typeof value === 'object' && value !== null) {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }
      return value;
    };

    // Sanitize request body
    if (req.body) {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeValue(req.query);
    }

    next();
  };

  // Validation Error Handler
  static handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((error: any) => ({
          field: error.path || error.param || 'unknown',
          message: error.msg || error.message || 'Validation failed',
          value: error.value || error.input || 'unknown'
        }))
      });
    }
    
    next();
  };

  // Security Headers Middleware
  static securityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    next();
  };

  // Request Logging for Security Audit
  static auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Log request details
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      tenantId: req.user?.tenantId,
      tier: req.user?.tier
    };

    // Log response completion
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log('API_AUDIT:', JSON.stringify({
        ...logData,
        statusCode: res.statusCode,
        duration,
        success: res.statusCode < 400
      }));
    });

    next();
  };

  // File Upload Security
  static fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
    // Check file size limits by tier
    const maxSize = req.user?.tier === 'enterprise' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB vs 10MB
    
    if (req.body.fileSize && req.body.fileSize > maxSize) {
      return res.status(413).json({
        error: 'File too large',
        maxSize,
        currentTier: req.user?.tier || 'free',
        upgradeUrl: '/pricing'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (req.body.fileType && !allowedTypes.includes(req.body.fileType)) {
      return res.status(400).json({
        error: 'Invalid file type',
        allowedTypes
      });
    }

    next();
  };

  // API Key Validation Middleware
  static validateAPIKey = async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // Validate API key format
    if (!/^biz_[a-zA-Z0-9]{32}$/.test(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key format' });
    }

    // Here you would validate against your API key store
    // For now, we'll add to request context
    req.apiKey = apiKey;
    
    next();
  };
}

// Export middleware factory
export const createSecurityMiddleware = () => new APISecurityMiddleware();

// Export individual middleware functions
export const {
  sanitizeInput,
  handleValidationErrors,
  securityHeaders,
  auditLogger,
  fileUploadSecurity,
  validateAPIKey
} = APISecurityMiddleware;

// Express.js type extensions
declare global {
  namespace Express {
    interface Request {
      apiKey?: string;
    }
  }
} 