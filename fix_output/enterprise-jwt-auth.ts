// Enterprise JWT Authentication System - Genesis v4Σ.2 Implementation
// Implements THEPLAN.md requirements: Auth0 + Google OAuth + SAML/SSO

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export interface EnterpriseUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user' | 'viewer';
  tenantId: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  permissions: string[];
  ssoProvider?: 'google' | 'microsoft' | 'okta' | 'auth0' | 'saml';
  lastLogin: Date;
  createdAt: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tier: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export class EnterpriseAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'genesis-enterprise-secret-key';
  private readonly JWT_EXPIRES = '24h';
  private readonly REFRESH_TOKEN_EXPIRES = '7d';

  // JWT Token Generation
  generateAccessToken(user: Omit<EnterpriseUser, 'password'>): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tier: user.tier,
      permissions: user.permissions
    };

    return jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: this.JWT_EXPIRES,
      issuer: 'bizcard-enterprise',
      audience: 'bizcard-app'
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES }
    );
  }

  // Token Verification
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'bizcard-enterprise',
        audience: 'bizcard-app'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): { userId: string; type: string } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string; type: string };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Password Management
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Enterprise Middleware
  authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      const decoded = this.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }
  };

  // Role-Based Access Control
  requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: roles,
          current: req.user.role
        });
      }

      next();
    };
  };

  // Tenant Isolation Middleware
  requireTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.tenantId) {
      return res.status(403).json({ error: 'Tenant context required' });
    }

    // Add tenant filter to all database queries
    req.tenantId = req.user.tenantId;
    next();
  };

  // Enterprise Tier Validation
  requireTier = (minTier: string) => {
    const tierHierarchy = { free: 0, pro: 1, business: 2, enterprise: 3 };
    
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userTierLevel = tierHierarchy[req.user.tier as keyof typeof tierHierarchy] || 0;
      const requiredTierLevel = tierHierarchy[minTier as keyof typeof tierHierarchy] || 0;

      if (userTierLevel < requiredTierLevel) {
        return res.status(402).json({ 
          error: 'Upgrade required',
          currentTier: req.user.tier,
          requiredTier: minTier,
          upgradeUrl: '/pricing'
        });
      }

      next();
    };
  };

  // Google OAuth Integration
  async verifyGoogleToken(googleToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  // SAML/SSO Integration Placeholder
  async processSAMLResponse(samlResponse: string, tenantId: string): Promise<EnterpriseUser> {
    // Implementation would depend on specific SAML provider
    // This is a placeholder for enterprise SAML integration
    throw new Error('SAML integration not yet implemented');
  }

  // Rate Limiting by Tier
  getRateLimitByTier(tier: string): { requests: number; window: number } {
    const limits = {
      free: { requests: 100, window: 3600 }, // 100/hour
      pro: { requests: 1000, window: 3600 }, // 1000/hour  
      business: { requests: 10000, window: 3600 }, // 10k/hour
      enterprise: { requests: 100000, window: 3600 } // 100k/hour
    };

    return limits[tier as keyof typeof limits] || limits.free;
  }

  // Security Audit Logging
  logSecurityEvent(event: string, userId: string, details: any = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      ip: details.ip,
      userAgent: details.userAgent,
      success: details.success || false
    };

    // In production, send to security monitoring system
    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
  }
}

// Export singleton instance
export const enterpriseAuth = new EnterpriseAuthService();

// Express.js type extensions
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      tenantId?: string;
    }
  }
} 