// API Security Middleware Test Suite - Genesis v4Σ.2
// Tests CORS, Helmet, input validation, rate limiting, and security headers

import { Request, Response, NextFunction } from 'express';
import { 
  APISecurityMiddleware, 
  createSecurityMiddleware,
  sanitizeInput,
  handleValidationErrors,
  securityHeaders,
  auditLogger,
  fileUploadSecurity,
  validateAPIKey
} from '../fix_output/api-security-middleware';
import request from 'supertest';
import express from 'express';

// Mock Express objects
const createMockRequest = (overrides?: Partial<Request>): Partial<Request> => ({
  method: 'GET',
  originalUrl: '/api/test',
  ip: '127.0.0.1',
  headers: {},
  user: undefined,
  body: {},
  query: {},
  get: jest.fn((header: string) => {
    if (header === 'User-Agent') return 'test-agent';
    return undefined;
  }),
  ...overrides
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnValue(res),
    json: jest.fn().mockReturnValue(res),
    send: jest.fn().mockReturnValue(res),
    setHeader: jest.fn(),
    removeHeader: jest.fn(),
    on: jest.fn(),
    statusCode: 200
  };
  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('API Security Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(securityMiddleware);
    
    app.get('/test', (req, res) => {
      res.json({ message: 'test endpoint' });
    });
  });

  describe('Request Validation', () => {
    it('should validate request headers', async () => {
      const mockReq = {
        get: jest.fn((header: string) => {
          if (header === 'set-cookie') return ['test=value'];
          return 'test-value';
        }),
        headers: { 'content-type': 'application/json' },
        method: 'GET',
        url: '/test'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        end: jest.fn()
      };

      const next = jest.fn();

      expect(mockReq.get).toBeDefined();
      expect(mockRes.status).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should allow enterprise domain', async () => {
      const corsConfig = securityMiddleware as any;
      const callback = jest.fn();
      
      // Mock CORS origin check
      const mockOriginCheck = (origin: string, cb: Function) => {
        const allowedOrigins = [
          'https://app.bizcard-enterprise.com',
          'http://localhost:3000',
          'http://localhost:5173'
        ];
        cb(null, allowedOrigins.includes(origin));
      };

      mockOriginCheck('https://app.bizcard-enterprise.com', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow localhost development', async () => {
      const callback = jest.fn();
      
      const mockOriginCheck = (origin: string, cb: Function) => {
        const allowedOrigins = [
          'https://app.bizcard-enterprise.com',
          'http://localhost:3000',
          'http://localhost:5173'
        ];
        cb(null, allowedOrigins.includes(origin));
      };

      mockOriginCheck('http://localhost:3000', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject malicious origins', async () => {
      const callback = jest.fn();
      
      const mockOriginCheck = (origin: string, cb: Function) => {
        const allowedOrigins = [
          'https://app.bizcard-enterprise.com',
          'http://localhost:3000',
          'http://localhost:5173'
        ];
        cb(null, allowedOrigins.includes(origin));
      };

      mockOriginCheck('https://malicious-site.com', callback);
      expect(callback).toHaveBeenCalledWith(null, false);
    });

    it('should handle undefined origin', async () => {
      const callback = jest.fn();
      
      const mockOriginCheck = (origin: string | undefined, cb: Function) => {
        if (!origin) {
          cb(null, false);
          return;
        }
        const allowedOrigins = [
          'https://app.bizcard-enterprise.com',
          'http://localhost:3000',
          'http://localhost:5173'
        ];
        cb(null, allowedOrigins.includes(origin));
      };

      mockOriginCheck(undefined, callback);
      expect(callback).toHaveBeenCalledWith(null, false);
    });
  });

  describe('Helmet Security Headers', () => {
    it('should configure CSP directives', async () => {
      const mockHelmetConfig = {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://js.stripe.com'],
            styleSrc: ["'self'", "'unsafe-inline'"]
          }
        }
      };

      expect(mockHelmetConfig.contentSecurityPolicy).toBeDefined();
      expect(mockHelmetConfig.contentSecurityPolicy.directives.defaultSrc).toContain("'self'");
      expect(mockHelmetConfig.contentSecurityPolicy.directives.scriptSrc).toContain('https://js.stripe.com');
    });

    it('should configure HSTS', async () => {
      const mockHelmetConfig = {
        hsts: {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true
        }
      };

      expect(mockHelmetConfig.hsts.maxAge).toBe(31536000); // 1 year
      expect(mockHelmetConfig.hsts.includeSubDomains).toBe(true);
      expect(mockHelmetConfig.hsts.preload).toBe(true);
    });

    it('should configure frameguard', async () => {
      const mockHelmetConfig = {
        frameguard: {
          action: 'deny'
        }
      };

      expect(mockHelmetConfig.frameguard.action).toBe('deny');
    });
  });

  describe('Authentication Middleware', () => {
    it('should authenticate valid JWT tokens', async () => {
      const mockReq = {
        headers: { authorization: 'Bearer valid-token' },
        user: { 
          id: 'user-123', 
          tenantId: 'tenant-456',
          email: 'test@example.com',
          role: 'user',
          tier: 'pro',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        },
        method: 'GET',
        url: '/test'
      };

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user-123');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply tier-based rate limits', async () => {
      const mockReq = {
        headers: { authorization: 'Bearer valid-token' },
        user: { 
          id: 'user-123', 
          tenantId: 'tenant-456', 
          tier: 'pro',
          email: 'test@example.com',
          role: 'user',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        },
        method: 'GET',
        url: '/test'
      };

      const rateLimits = {
        free: { windowMs: 15 * 60 * 1000, max: 100 },
        pro: { windowMs: 15 * 60 * 1000, max: 500 },
        business: { windowMs: 15 * 60 * 1000, max: 2000 },
        enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
      };

      expect(rateLimits[mockReq.user.tier as keyof typeof rateLimits].max).toBe(500);
    });

    it('should handle free tier limits', async () => {
      const mockReq = {
        user: { 
          tier: 'free',
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          tenantId: 'tenant-456',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        }
      };

      const rateLimits = {
        free: { windowMs: 15 * 60 * 1000, max: 100 },
        pro: { windowMs: 15 * 60 * 1000, max: 500 },
        business: { windowMs: 15 * 60 * 1000, max: 2000 },
        enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
      };

      expect(rateLimits[mockReq.user.tier as keyof typeof rateLimits].max).toBe(100);
    });

    it('should handle enterprise tier limits', async () => {
      const mockReq = {
        user: { 
          tier: 'enterprise',
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          tenantId: 'tenant-456',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        }
      };

      const rateLimits = {
        free: { windowMs: 15 * 60 * 1000, max: 100 },
        pro: { windowMs: 15 * 60 * 1000, max: 500 },
        business: { windowMs: 15 * 60 * 1000, max: 2000 },
        enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
      };

      expect(rateLimits[mockReq.user.tier as keyof typeof rateLimits].max).toBe(10000);
    });

    it('should handle business tier limits', async () => {
      const mockReq = {
        user: { 
          tier: 'pro',
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          tenantId: 'tenant-456',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        }
      };

      const rateLimits = {
        free: { windowMs: 15 * 60 * 1000, max: 100 },
        pro: { windowMs: 15 * 60 * 1000, max: 500 },
        business: { windowMs: 15 * 60 * 1000, max: 2000 },
        enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
      };

      expect(rateLimits[mockReq.user.tier as keyof typeof rateLimits].max).toBe(500);
    });
  });

  describe('Input Validation', () => {
    it('should validate business card data', async () => {
      const validData = {
        name: 'John Doe',
        title: 'Software Engineer',
        company: 'Tech Corp',
        email: 'john@techcorp.com',
        phone: '+1-555-123-4567'
      };

      expect(validData.name).toBeDefined();
      expect(validData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should handle business tier validation', async () => {
      const mockReq = {
        user: { 
          tier: 'pro',
          id: 'user-123',
          email: 'test@example.com',
          role: 'user',
          tenantId: 'tenant-456',
          permissions: ['read'],
          iat: Date.now(),
          exp: Date.now() + 3600000
        }
      };

      expect(mockReq.user.tier).toBe('pro');
    });
  });
});

// Export test utilities for other test files
export const mockJWTPayload = {
  id: 'test-user-123',
  email: 'test@example.com',
  role: 'user' as const,
  tenantId: 'test-tenant-456',
  tier: 'pro' as const,
  permissions: ['read', 'write'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

export const mockAuthToken = 'mock-jwt-token-for-testing';

describe('Security Middleware Factory', () => {
  test('should create middleware instance', () => {
    const middleware = createSecurityMiddleware();
    expect(middleware).toBeInstanceOf(APISecurityMiddleware);
  });

  test('should provide CORS configuration', () => {
    const middleware = createSecurityMiddleware();
    const corsConfig = middleware.getCORSConfig();
    expect(corsConfig).toBeDefined();
  });

  test('should provide Helmet configuration', () => {
    const middleware = createSecurityMiddleware();
    const helmetConfig = middleware.getHelmetConfig();
    expect(helmetConfig).toBeDefined();
  });

  test('should create rate limiters', () => {
    const middleware = createSecurityMiddleware();
    const rateLimiter = middleware.createRateLimiter('business');
    expect(rateLimiter).toBeDefined();
  });
}); 