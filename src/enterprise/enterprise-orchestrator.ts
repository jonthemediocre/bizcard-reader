import { EnterpriseAuthService, EnterpriseAuthConfig, TenantProfile } from './auth/enterprise-auth-service';
import { EnterpriseBillingService, BillingConfig } from './billing/enterprise-billing-service';
import { Logger } from '../utils/logger';
import { AuthResult, UserProfile } from './types/auth-types';

export interface EnterpriseConfig {
  auth: EnterpriseAuthConfig;
  billing: BillingConfig;
  environment: 'development' | 'staging' | 'production';
  features: {
    multiTenancy: boolean;
    enterpriseBilling: boolean;
    ssoEnabled: boolean;
    complianceMode: boolean;
  };
}

export interface EnterpriseContext {
  tenant: TenantProfile;
  user: UserProfile;
  permissions: string[];
  subscription: {
    plan: string;
    status: string;
    limits: Record<string, number>;
  };
}

export interface EnterpriseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  tenantId?: string;
  userId?: string;
  timestamp: Date;
}

export class EnterpriseOrchestrator {
  private authService: EnterpriseAuthService;
  private billingService: EnterpriseBillingService;
  private logger: Logger;
  private config: EnterpriseConfig;

  constructor(config: EnterpriseConfig) {
    this.config = config;
    this.logger = new Logger('EnterpriseOrchestrator');
    
    // Initialize enterprise services
    this.authService = new EnterpriseAuthService(config.auth);
    this.billingService = new EnterpriseBillingService(config.billing);
    
    this.logger.info('Enterprise Orchestrator initialized', {
      environment: config.environment,
      features: config.features
    });
  }

  /**
   * Complete enterprise onboarding flow
   */
  async onboardEnterpriseTenant(
    companyName: string,
    adminEmail: string,
    domain: string,
    plan: 'business' | 'enterprise'
  ): Promise<EnterpriseOperationResult<{ tenant: TenantProfile; authResult: AuthResult }>> {
    try {
      this.logger.info('Starting enterprise onboarding', { companyName, adminEmail, domain, plan });

      // 1. Create tenant profile
      const tenant: TenantProfile = {
        tenantId: crypto.randomUUID(),
        domain,
        name: companyName,
        plan,
        settings: {
          ssoEnabled: plan === 'enterprise',
          securityPolicies: {
            mfaRequired: plan === 'enterprise',
            sessionTimeout: plan === 'enterprise' ? 240 : 480, // 4h for enterprise, 8h for business
            passwordPolicy: {
              minLength: plan === 'enterprise' ? 12 : 8,
              requireUppercase: true,
              requireNumbers: true,
              requireSpecialChars: plan === 'enterprise'
            },
            deviceTrust: plan === 'enterprise'
          }
        },
        created: new Date(),
        lastAccessed: new Date()
      };

      // 2. Create billing customer
      const billingCustomer = await this.billingService.createCustomer(tenant, adminEmail);

      // 3. Set up initial subscription (trial period)
      const subscription = await this.billingService.createSubscription(
        billingCustomer.id,
        `${plan}_plan`,
        undefined,
        30 // 30-day trial
      );

      // 4. Create admin user account
      const authResult = await this.authService.authenticateUser(
        adminEmail,
        'temp_password', // In production, this would be handled differently
        domain
      );

      this.logger.info('Enterprise onboarding completed', {
        tenantId: tenant.tenantId,
        billingCustomerId: billingCustomer.id,
        subscriptionId: subscription.id
      });

      return {
        success: true,
        data: { tenant, authResult },
        tenantId: tenant.tenantId,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Enterprise onboarding failed', { companyName, adminEmail, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Onboarding failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Authenticate user with enterprise context
   */
  async authenticateWithContext(
    email: string,
    password: string,
    tenantDomain?: string
  ): Promise<EnterpriseOperationResult<EnterpriseContext>> {
    try {
      const authResult = await this.authService.authenticateUser(email, password, tenantDomain);
      
      if (!authResult.success || !authResult.user || !authResult.tenant) {
        return {
          success: false,
          error: authResult.error || 'Authentication failed',
          timestamp: new Date()
        };
      }

      // Get billing context
      const billingUsage = await this.billingService.getBillingUsage(authResult.tenant.tenantId);

      const enterpriseContext: EnterpriseContext = {
        tenant: authResult.tenant,
        user: authResult.user,
        permissions: authResult.user.permissions,
        subscription: {
          plan: authResult.tenant.plan,
          status: 'active', // Would be fetched from subscription service
          limits: billingUsage.planLimits
        }
      };

      return {
        success: true,
        data: enterpriseContext,
        tenantId: authResult.tenant.tenantId,
        userId: authResult.user.id,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Authentication with context failed', { email, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process business card with enterprise context and billing
   */
  async processBusinessCardEnterprise(
    tenantId: string,
    userId: string,
    cardData: any
  ): Promise<EnterpriseOperationResult<any>> {
    try {
      this.logger.info('Processing business card with enterprise context', { tenantId, userId });

      // 1. Check usage limits
      const billingUsage = await this.billingService.getBillingUsage(tenantId);
      if (billingUsage.currentUsage.cardsProcessed >= billingUsage.planLimits.maxCardsPerMonth) {
        return {
          success: false,
          error: 'Monthly card processing limit exceeded',
          tenantId,
          userId,
          timestamp: new Date()
        };
      }

      // 2. Process the card (mock implementation)
      const processedCard = {
        id: crypto.randomUUID(),
        tenantId,
        userId,
        extractedData: {
          name: cardData.name || 'Unknown',
          email: cardData.email || '',
          company: cardData.company || '',
          phone: cardData.phone || ''
        },
        processed: new Date(),
        confidence: 0.95
      };

      // 3. Record usage for billing
      await this.billingService.recordUsage(tenantId, 'cards_processed', 1);

      // 4. Store processed card (mock)
      this.logger.info('Business card processed successfully', {
        cardId: processedCard.id,
        tenantId,
        userId
      });

      return {
        success: true,
        data: processedCard,
        tenantId,
        userId,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Business card processing failed', { tenantId, userId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        tenantId,
        userId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get enterprise dashboard data
   */
  async getEnterpriseDashboard(tenantId: string): Promise<EnterpriseOperationResult<any>> {
    try {
      const billingUsage = await this.billingService.getBillingUsage(tenantId);

      const dashboardData = {
        usage: {
          cardsProcessed: billingUsage.currentUsage.cardsProcessed,
          cardsLimit: billingUsage.planLimits.maxCardsPerMonth,
          usagePercentage: (billingUsage.currentUsage.cardsProcessed / billingUsage.planLimits.maxCardsPerMonth) * 100
        },
        subscription: {
          plan: 'business', // Would be fetched from subscription service
          status: 'active',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        analytics: {
          totalCards: billingUsage.currentUsage.cardsProcessed,
          activeUsers: billingUsage.currentUsage.users,
          integrations: billingUsage.currentUsage.integrations
        }
      };

      return {
        success: true,
        data: dashboardData,
        tenantId,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Dashboard data retrieval failed', { tenantId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dashboard data unavailable',
        tenantId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Handle enterprise billing webhook
   */
  async handleBillingWebhook(payload: string, signature: string): Promise<EnterpriseOperationResult<void>> {
    try {
      await this.billingService.handleWebhook(payload, signature);
      
      return {
        success: true,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Billing webhook handling failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
        timestamp: new Date()
      };
    }
  }

  /**
   * Upgrade enterprise subscription
   */
  async upgradeSubscription(
    tenantId: string,
    newPlan: 'pro' | 'business' | 'enterprise'
  ): Promise<EnterpriseOperationResult<any>> {
    try {
      this.logger.info('Upgrading subscription', { tenantId, newPlan });

      // In production, this would:
      // 1. Update Stripe subscription
      // 2. Update tenant settings
      // 3. Apply new limits
      // 4. Send confirmation email

      return {
        success: true,
        data: { message: 'Subscription upgraded successfully', newPlan },
        tenantId,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Subscription upgrade failed', { tenantId, newPlan, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upgrade failed',
        tenantId,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get enterprise health status
   */
  getHealthStatus(): EnterpriseOperationResult<any> {
    return {
      success: true,
      data: {
        status: 'healthy',
        services: {
          auth: 'operational',
          billing: 'operational',
          logging: 'operational'
        },
        environment: this.config.environment,
        features: this.config.features,
        version: '1.0.0'
      },
      timestamp: new Date()
    };
  }
} 