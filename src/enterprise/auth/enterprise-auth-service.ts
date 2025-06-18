import { AuthConfig, UserProfile, TenantContext, AuthResult } from '../types/auth-types';
import { Logger } from '../../utils/logger';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface EnterpriseAuthConfig extends AuthConfig {
  auth0Domain: string;
  auth0ClientId: string;
  auth0ClientSecret: string;
  samlEnabled: boolean;
  ssoProviders: string[];
  multiTenantMode: boolean;
  tenantIsolation: 'strict' | 'shared' | 'hybrid';
}

export interface TenantProfile {
  tenantId: string;
  domain: string;
  name: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  settings: {
    ssoEnabled: boolean;
    samlConfig?: SAMLConfig;
    brandingConfig?: BrandingConfig;
    securityPolicies: SecurityPolicies;
  };
  created: Date;
  lastAccessed: Date;
}

export interface SAMLConfig {
  entityId: string;
  ssoUrl: string;
  x509Certificate: string;
  attributeMapping: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface BrandingConfig {
  logoUrl?: string;
  primaryColor?: string;
  companyName?: string;
  customDomain?: string;
}

export interface SecurityPolicies {
  mfaRequired: boolean;
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  ipWhitelist?: string[];
  deviceTrust: boolean;
}

export class EnterpriseAuthService {
  private config: EnterpriseAuthConfig;
  private logger: Logger;
  private tenantCache: Map<string, TenantProfile> = new Map();

  constructor(config: EnterpriseAuthConfig) {
    this.config = config;
    this.logger = new Logger('EnterpriseAuthService');
  }

  /**
   * Authenticate user with multi-tenant context
   */
  async authenticateUser(
    email: string, 
    password: string, 
    tenantDomain?: string
  ): Promise<AuthResult> {
    try {
      this.logger.info('Authenticating user', { email, tenantDomain });

      // 1. Resolve tenant context
      const tenant = await this.resolveTenant(email, tenantDomain);
      
      // 2. Check if SSO is required for this tenant
      if (tenant.settings.ssoEnabled) {
        return await this.initiateSSOFlow(email, tenant);
      }

      // 3. Standard authentication
      const authResult = await this.validateCredentials(email, password, tenant);
      
      // 4. Generate tenant-scoped JWT
      const token = await this.generateTenantToken(authResult.user, tenant);
      
      // 5. Update tenant access tracking
      await this.updateTenantAccess(tenant.tenantId);

      return {
        success: true,
        user: authResult.user,
        tenant,
        token,
        expiresIn: this.config.tokenExpiry,
        requiresMFA: tenant.settings.securityPolicies.mfaRequired
      };

    } catch (error) {
      this.logger.error('Authentication failed', { email, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * SSO/SAML authentication flow
   */
  async initiateSSOFlow(email: string, tenant: TenantProfile): Promise<AuthResult> {
    this.logger.info('Initiating SSO flow', { email, tenantId: tenant.tenantId });

    if (!tenant.settings.samlConfig) {
      throw new Error('SAML configuration not found for tenant');
    }

    // Generate SAML request
    const samlRequest = await this.generateSAMLRequest(tenant.settings.samlConfig, email);
    
    return {
      success: true,
      redirectUrl: `${tenant.settings.samlConfig.ssoUrl}?SAMLRequest=${encodeURIComponent(samlRequest)}`,
      requiresRedirect: true,
      tenant
    };
  }

  /**
   * Process SAML response
   */
  async processSAMLResponse(samlResponse: string, tenantId: string): Promise<AuthResult> {
    try {
      const tenant = await this.getTenant(tenantId);
      if (!tenant || !tenant.settings.samlConfig) {
        throw new Error('SAML configuration not found');
      }

      // Validate and parse SAML response
      const userProfile = await this.parseSAMLResponse(samlResponse, tenant.settings.samlConfig);
      
      // Create or update user in tenant context
      const user = await this.createOrUpdateUser(userProfile, tenant);
      
      // Generate tenant-scoped token
      const token = await this.generateTenantToken(user, tenant);

      return {
        success: true,
        user,
        tenant,
        token,
        expiresIn: this.config.tokenExpiry
      };

    } catch (error) {
      this.logger.error('SAML response processing failed', { error });
      throw error;
    }
  }

  /**
   * Resolve tenant from email domain or explicit domain
   */
  private async resolveTenant(email: string, tenantDomain?: string): Promise<TenantProfile> {
    let domain = tenantDomain;
    
    if (!domain) {
      // Extract domain from email
      domain = email.split('@')[1];
    }

    // Check cache first
    const cacheKey = `tenant:${domain}`;
    if (this.tenantCache.has(cacheKey)) {
      return this.tenantCache.get(cacheKey)!;
    }

    // Fetch from database (mock implementation)
    const tenant = await this.fetchTenantByDomain(domain);
    
    // Cache for performance
    this.tenantCache.set(cacheKey, tenant);
    
    return tenant;
  }

  /**
   * Generate tenant-scoped JWT token
   */
  private async generateTenantToken(user: UserProfile, tenant: TenantProfile): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.tenantId,
      tenantDomain: tenant.domain,
      role: user.role,
      permissions: user.permissions,
      plan: tenant.plan,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (this.config.tokenExpiry || 3600)
    };

    return jwt.sign(payload, this.config.jwtSecret, {
      algorithm: 'HS256',
      issuer: `bizcard-reader:${tenant.tenantId}`,
      audience: tenant.domain
    });
  }

  /**
   * Validate JWT token with tenant context
   */
  async validateToken(token: string): Promise<{ valid: boolean; payload?: any; tenant?: TenantProfile }> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;
      
      // Fetch tenant context
      const tenant = await this.getTenant(decoded.tenantId);
      
      // Validate tenant is still active
      if (!tenant) {
        return { valid: false };
      }

      return {
        valid: true,
        payload: decoded,
        tenant
      };

    } catch (error) {
      this.logger.error('Token validation failed', { error });
      return { valid: false };
    }
  }

  /**
   * Create tenant-isolated user session
   */
  async createTenantSession(user: UserProfile, tenant: TenantProfile): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionData = {
      sessionId,
      userId: user.id,
      tenantId: tenant.tenantId,
      created: new Date(),
      lastAccessed: new Date(),
      ipAddress: null, // To be set by middleware
      userAgent: null  // To be set by middleware
    };

    // Store session (Redis recommended for production)
    await this.storeSession(sessionId, sessionData);
    
    return sessionId;
  }

  // Mock implementations - replace with actual database calls
  private async fetchTenantByDomain(domain: string): Promise<TenantProfile> {
    // Mock tenant data - replace with database query
    return {
      tenantId: crypto.randomUUID(),
      domain,
      name: `${domain} Organization`,
      plan: 'business',
      settings: {
        ssoEnabled: false,
        securityPolicies: {
          mfaRequired: false,
          sessionTimeout: 480, // 8 hours
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          deviceTrust: false
        }
      },
      created: new Date(),
      lastAccessed: new Date()
    };
  }

  private async getTenant(tenantId: string): Promise<TenantProfile | null> {
    // Mock implementation - replace with database query
    return this.tenantCache.get(`tenant:${tenantId}`) || null;
  }

  private async validateCredentials(email: string, password: string, tenant: TenantProfile): Promise<{ user: UserProfile }> {
    // Mock implementation - replace with actual credential validation
    return {
      user: {
        id: crypto.randomUUID(),
        email,
        firstName: 'Mock',
        lastName: 'User',
        role: 'user',
        permissions: ['read', 'write'],
        tenantId: tenant.tenantId,
        created: new Date(),
        lastLogin: new Date()
      }
    };
  }

  private async generateSAMLRequest(samlConfig: SAMLConfig, email: string): Promise<string> {
    // Mock SAML request generation - replace with actual SAML library
    return Buffer.from(`<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
      <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${samlConfig.entityId}</saml:Issuer>
    </samlp:AuthnRequest>`).toString('base64');
  }

  private async parseSAMLResponse(samlResponse: string, samlConfig: SAMLConfig): Promise<UserProfile> {
    // Mock SAML response parsing - replace with actual SAML library
    return {
      id: crypto.randomUUID(),
      email: 'mock@example.com',
      firstName: 'SAML',
      lastName: 'User',
      role: 'user',
      permissions: ['read', 'write'],
      tenantId: '',
      created: new Date(),
      lastLogin: new Date()
    };
  }

  private async createOrUpdateUser(userProfile: UserProfile, tenant: TenantProfile): Promise<UserProfile> {
    // Mock user creation - replace with database operations
    return { ...userProfile, tenantId: tenant.tenantId };
  }

  private async updateTenantAccess(tenantId: string): Promise<void> {
    // Mock tenant access update - replace with database update
    this.logger.info('Updated tenant access', { tenantId });
  }

  private async storeSession(sessionId: string, sessionData: any): Promise<void> {
    // Mock session storage - replace with Redis or database
    this.logger.info('Session stored', { sessionId });
  }
} 