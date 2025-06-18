export interface AuthConfig {
  jwtSecret: string;
  tokenExpiry: number; // seconds
  refreshTokenExpiry: number; // seconds
  issuer: string;
  audience: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  tenantId: string;
  created: Date;
  lastLogin: Date;
  avatar?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
}

export interface TenantContext {
  tenantId: string;
  domain: string;
  name: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  isActive: boolean;
  features: string[];
  limits: {
    maxUsers: number;
    maxCardsPerMonth: number;
    maxIntegrations: number;
    maxStorageGB: number;
  };
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  tenant?: TenantContext | any; // Allow TenantProfile from enterprise-auth-service
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  redirectUrl?: string;
  requiresRedirect?: boolean;
  requiresMFA?: boolean;
  mfaToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantDomain?: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  tenantDomain?: string;
  plan?: 'free' | 'pro' | 'business' | 'enterprise';
}

export interface TokenPayload {
  userId: string;
  email: string;
  tenantId: string;
  tenantDomain: string;
  role: string;
  permissions: string[];
  plan: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface SessionData {
  sessionId: string;
  userId: string;
  tenantId: string;
  created: Date;
  lastAccessed: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  isActive: boolean;
}

export interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  backupCodes: string[];
  totpSecret?: string;
}

export interface AuthMiddlewareOptions {
  requireAuth: boolean;
  requireTenant: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  allowedPlans?: string[];
}

export interface PasswordResetRequest {
  email: string;
  tenantDomain?: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  tenantId: string;
}

export interface LogoutRequest {
  token: string;
  allDevices?: boolean;
}

export interface AuthError extends Error {
  code: string;
  statusCode: number;
  tenantId?: string;
  userId?: string;
} 