/**
 * @file auth-config.ts
 * @description Enterprise Authentication Configuration
 * @version 1.0
 * @audit-note Implements multi-tenant auth with Google OAuth, SSO, and RBAC
 */

export interface AuthConfig {
  providers: AuthProvider[];
  multiTenant: boolean;
  rbac: RBACConfig;
  session: SessionConfig;
  security: SecurityConfig;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml' | 'oidc' | 'ldap';
  config: Record<string, any>;
  enabled: boolean;
  tenantSpecific?: boolean;
}

export interface RBACConfig {
  roles: Role[];
  permissions: Permission[];
  defaultRole: string;
  hierarchical: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  tier: 'free' | 'pro' | 'business' | 'enterprise';
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface SessionConfig {
  duration: number;
  refreshable: boolean;
  multiDevice: boolean;
  mfaRequired: boolean;
}

export interface SecurityConfig {
  passwordPolicy: PasswordPolicy;
  mfa: MFAConfig;
  audit: AuditConfig;
  encryption: EncryptionConfig;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
  maxAge: number;
}

export interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email' | 'hardware')[];
  required: boolean;
  gracePeriod: number;
}

export interface AuditConfig {
  enabled: boolean;
  events: string[];
  retention: number;
  realtime: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  keyRotation: number;
  atRest: boolean;
  inTransit: boolean;
}

// Enterprise Auth Configuration
export const enterpriseAuthConfig: AuthConfig = {
  providers: [
    {
      id: 'google',
      name: 'Google OAuth',
      type: 'oauth',
      config: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: ['openid', 'profile', 'email'],
        hostedDomain: process.env.GOOGLE_HOSTED_DOMAIN
      },
      enabled: true,
      tenantSpecific: false
    },
    {
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      type: 'oidc',
      config: {
        issuer: process.env.AZURE_AD_ISSUER,
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET
      },
      enabled: true,
      tenantSpecific: true
    },
    {
      id: 'okta',
      name: 'Okta',
      type: 'saml',
      config: {
        entryPoint: process.env.OKTA_ENTRY_POINT,
        cert: process.env.OKTA_CERT,
        issuer: process.env.OKTA_ISSUER
      },
      enabled: true,
      tenantSpecific: true
    }
  ],
  multiTenant: true,
  rbac: {
    roles: [
      {
        id: 'super-admin',
        name: 'Super Administrator',
        description: 'Full system access across all tenants',
        permissions: ['*'],
        tier: 'enterprise'
      },
      {
        id: 'tenant-admin',
        name: 'Tenant Administrator',
        description: 'Full access within tenant',
        permissions: [
          'tenant:manage',
          'users:manage',
          'billing:view',
          'settings:manage',
          'integrations:manage'
        ],
        tier: 'business'
      },
      {
        id: 'team-lead',
        name: 'Team Lead',
        description: 'Team management and advanced features',
        permissions: [
          'team:manage',
          'cards:bulk',
          'analytics:view',
          'integrations:use'
        ],
        tier: 'pro'
      },
      {
        id: 'user',
        name: 'Standard User',
        description: 'Basic platform access',
        permissions: [
          'cards:process',
          'contacts:manage',
          'profile:manage'
        ],
        tier: 'free'
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        permissions: [
          'cards:view',
          'contacts:view'
        ],
        tier: 'free'
      }
    ],
    permissions: [
      { id: 'tenant:manage', name: 'Manage Tenant', resource: 'tenant', action: 'manage' },
      { id: 'users:manage', name: 'Manage Users', resource: 'users', action: 'manage' },
      { id: 'cards:process', name: 'Process Cards', resource: 'cards', action: 'process' },
      { id: 'cards:bulk', name: 'Bulk Process Cards', resource: 'cards', action: 'bulk' },
      { id: 'analytics:view', name: 'View Analytics', resource: 'analytics', action: 'view' },
      { id: 'integrations:manage', name: 'Manage Integrations', resource: 'integrations', action: 'manage' }
    ],
    defaultRole: 'user',
    hierarchical: true
  },
  session: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    refreshable: true,
    multiDevice: true,
    mfaRequired: false
  },
  security: {
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventReuse: 5,
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    },
    mfa: {
      enabled: true,
      methods: ['totp', 'email'],
      required: false,
      gracePeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    audit: {
      enabled: true,
      events: [
        'auth:login',
        'auth:logout',
        'auth:failed',
        'user:created',
        'user:updated',
        'role:assigned',
        'permission:granted'
      ],
      retention: 365 * 24 * 60 * 60 * 1000, // 1 year
      realtime: true
    },
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 30 * 24 * 60 * 60 * 1000, // 30 days
      atRest: true,
      inTransit: true
    }
  }
};

// Tier-based feature access
export const tierFeatures = {
  free: {
    cardsPerMonth: 50,
    teamMembers: 1,
    integrations: 0,
    analytics: false,
    api: false,
    support: 'community'
  },
  pro: {
    cardsPerMonth: 500,
    teamMembers: 10,
    integrations: 3,
    analytics: true,
    api: false,
    support: 'email'
  },
  business: {
    cardsPerMonth: 2000,
    teamMembers: 50,
    integrations: 10,
    analytics: true,
    api: true,
    support: 'priority'
  },
  enterprise: {
    cardsPerMonth: -1, // unlimited
    teamMembers: -1, // unlimited
    integrations: -1, // unlimited
    analytics: true,
    api: true,
    support: 'dedicated'
  }
};

export default enterpriseAuthConfig; 