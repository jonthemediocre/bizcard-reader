// Enterprise Authentication Tests - Genesis v4Σ.2
// Tests for JWT, RBAC, multi-tenancy, and enterprise features

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { EnterpriseAuthService, EnterpriseUser } from '../fix_output/enterprise-jwt-auth';

describe('EnterpriseAuthService', () => {
  let authService: EnterpriseAuthService;
  let mockUser: EnterpriseUser;

  beforeEach(() => {
    authService = new EnterpriseAuthService();
    mockUser = {
      id: 'user-123',
      email: 'test@enterprise.com',
      name: 'Test User',
      role: 'admin',
      tenantId: 'tenant-456',
      tier: 'enterprise',
      permissions: ['read', 'write', 'admin'],
      ssoProvider: 'google',
      lastLogin: new Date(),
      createdAt: new Date()
    };
  });

  describe('JWT Token Management', () => {
    test('should generate valid access token', () => {
      const token = authService.generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    test('should generate valid refresh token', () => {
      const refreshToken = authService.generateRefreshToken(mockUser.id);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
    });

    test('should verify access token correctly', () => {
      const token = authService.generateAccessToken(mockUser);
      const decoded = authService.verifyAccessToken(token);
      
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.tenantId).toBe(mockUser.tenantId);
      expect(decoded.tier).toBe(mockUser.tier);
    });

    test('should reject invalid token', () => {
      expect(() => {
        authService.verifyAccessToken('invalid.token.here');
      }).toThrow('Invalid or expired access token');
    });

    test('should verify refresh token correctly', () => {
      const refreshToken = authService.generateRefreshToken(mockUser.id);
      const decoded = authService.verifyRefreshToken(refreshToken);
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('Password Management', () => {
    test('should hash password securely', async () => {
      const password = 'securePassword123!';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hash length
    });

    test('should verify password correctly', async () => {
      const password = 'testPassword456!';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await authService.verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Middleware Authentication', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('should authenticate valid token', () => {
      const token = authService.generateAccessToken(mockUser);
      mockReq.headers.authorization = `Bearer ${token}`;
      
      authService.authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(mockUser.id);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject missing token', () => {
      authService.authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid token format', () => {
      mockReq.headers.authorization = 'Bearer invalid.token';
      
      authService.authenticateToken(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role-Based Access Control', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        user: {
          id: mockUser.id,
          role: 'admin'
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('should allow access for correct role', () => {
      const middleware = authService.requireRole(['admin', 'super_admin']);
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should deny access for insufficient role', () => {
      mockReq.user.role = 'user';
      const middleware = authService.requireRole(['admin', 'super_admin']);
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        required: ['admin', 'super_admin'],
        current: 'user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Tenant Isolation', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        user: {
          tenantId: 'tenant-123'
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('should set tenant context', () => {
      authService.requireTenant(mockReq, mockRes, mockNext);
      
      expect(mockReq.tenantId).toBe('tenant-123');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject request without tenant', () => {
      delete mockReq.user.tenantId;
      
      authService.requireTenant(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Tier-Based Access Control', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;

    beforeEach(() => {
      mockReq = {
        user: {
          tier: 'business'
        }
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    test('should allow access for sufficient tier', () => {
      const middleware = authService.requireTier('pro');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    test('should deny access for insufficient tier', () => {
      mockReq.user.tier = 'free';
      const middleware = authService.requireTier('enterprise');
      
      middleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(402);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Upgrade required',
        currentTier: 'free',
        requiredTier: 'enterprise',
        upgradeUrl: '/pricing'
      });
    });
  });

  describe('Rate Limiting Configuration', () => {
    test('should return correct limits for each tier', () => {
      expect(authService.getRateLimitByTier('free')).toEqual({
        requests: 100,
        window: 3600
      });

      expect(authService.getRateLimitByTier('enterprise')).toEqual({
        requests: 100000,
        window: 3600
      });
    });

    test('should default to free tier for unknown tier', () => {
      expect(authService.getRateLimitByTier('unknown')).toEqual({
        requests: 100,
        window: 3600
      });
    });
  });

  describe('Security Logging', () => {
    test('should log security events', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      authService.logSecurityEvent('login_success', 'user-123', {
        ip: '192.168.1.1',
        userAgent: 'test-agent',
        success: true
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_EVENT:',
        expect.stringContaining('login_success')
      );
      
      consoleSpy.mockRestore();
    });
  });
});

// Integration Tests
describe('Enterprise Auth Integration', () => {
  test('should handle complete authentication flow', async () => {
    const authService = new EnterpriseAuthService();
    const user: EnterpriseUser = {
      id: 'int-test-user',
      email: 'integration@test.com',
      name: 'Integration Test',
      role: 'admin',
      tenantId: 'int-tenant',
      tier: 'enterprise',
      permissions: ['read', 'write', 'admin'],
      lastLogin: new Date(),
      createdAt: new Date()
    };

    // Generate tokens
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user.id);

    // Verify tokens
    const decodedAccess = authService.verifyAccessToken(accessToken);
    const decodedRefresh = authService.verifyRefreshToken(refreshToken);

    expect(decodedAccess.id).toBe(user.id);
    expect(decodedRefresh.userId).toBe(user.id);

    // Test password flow
    const password = 'IntegrationTest123!';
    const hashedPassword = await authService.hashPassword(password);
    const passwordValid = await authService.verifyPassword(password, hashedPassword);

    expect(passwordValid).toBe(true);
  });
}); 