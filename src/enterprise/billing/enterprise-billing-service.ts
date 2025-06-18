import Stripe from 'stripe';
import { Logger } from '../../utils/logger';
import { TenantProfile } from '../auth/enterprise-auth-service';

export interface BillingConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  webhookSecret: string;
  environment: 'test' | 'live';
  defaultCurrency: string;
  taxCalculationEnabled: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'business' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    maxUsers: number;
    maxCardsPerMonth: number;
    maxIntegrations: number;
    maxStorageGB: number;
    apiCallsPerMonth: number;
  };
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface BillingCustomer {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  email: string;
  companyName: string;
  billingAddress?: BillingAddress;
  taxId?: string;
  paymentMethods: PaymentMethod[];
  created: Date;
  updated: Date;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'ach';
  isDefault: boolean;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  created: Date;
}

export interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  planId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  quantity: number;
  metadata: Record<string, string>;
  created: Date;
  updated: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  subscriptionId?: string;
  stripeInvoiceId: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  lineItems: InvoiceLineItem[];
  created: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface UsageRecord {
  tenantId: string;
  metric: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, string>;
}

export interface BillingUsage {
  tenantId: string;
  planLimits: SubscriptionPlan['limits'];
  currentUsage: {
    users: number;
    cardsProcessed: number;
    integrations: number;
    storageUsedGB: number;
    apiCalls: number;
  };
  periodStart: Date;
  periodEnd: Date;
  overageCharges: {
    metric: string;
    overage: number;
    rate: number;
    charge: number;
  }[];
}

export class EnterpriseBillingService {
  private stripe: Stripe;
  private config: BillingConfig;
  private logger: Logger;

  constructor(config: BillingConfig) {
    this.config = config;
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2023-10-16'
    });
    this.logger = new Logger('EnterpriseBillingService');
  }

  /**
   * Create billing customer for tenant
   */
  async createCustomer(tenant: TenantProfile, billingEmail: string): Promise<BillingCustomer> {
    try {
      this.logger.info('Creating billing customer', { tenantId: tenant.tenantId, billingEmail });

      // Create Stripe customer
      const stripeCustomer = await this.stripe.customers.create({
        email: billingEmail,
        name: tenant.name,
        metadata: {
          tenantId: tenant.tenantId,
          domain: tenant.domain,
          plan: tenant.plan
        }
      });

      const billingCustomer: BillingCustomer = {
        id: crypto.randomUUID(),
        tenantId: tenant.tenantId,
        stripeCustomerId: stripeCustomer.id,
        email: billingEmail,
        companyName: tenant.name,
        paymentMethods: [],
        created: new Date(),
        updated: new Date()
      };

      // Store in database
      await this.storeBillingCustomer(billingCustomer);

      return billingCustomer;

    } catch (error) {
      this.logger.error('Failed to create billing customer', { tenantId: tenant.tenantId, error });
      throw error;
    }
  }

  /**
   * Create subscription for customer
   */
  async createSubscription(
    customerId: string,
    planId: string,
    paymentMethodId?: string,
    trialDays?: number
  ): Promise<Subscription> {
    try {
      const customer = await this.getBillingCustomer(customerId);
      const plan = await this.getSubscriptionPlan(planId);

      if (!customer || !plan) {
        throw new Error('Customer or plan not found');
      }

      this.logger.info('Creating subscription', { 
        customerId, 
        planId, 
        tenantId: customer.tenantId 
      });

      // Create Stripe subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customer.stripeCustomerId,
        items: [{ price: plan.stripePriceId! }],
        metadata: {
          tenantId: customer.tenantId,
          planId: plan.id
        }
      };

      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      if (trialDays) {
        subscriptionParams.trial_period_days = trialDays;
      }

      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionParams);

      const subscription: Subscription = {
        id: crypto.randomUUID(),
        tenantId: customer.tenantId,
        customerId: customer.id,
        planId: plan.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status as Subscription['status'],
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        quantity: stripeSubscription.items.data[0]?.quantity || 1,
        metadata: stripeSubscription.metadata,
        created: new Date(),
        updated: new Date()
      };

      // Store in database
      await this.storeSubscription(subscription);

      return subscription;

    } catch (error) {
      this.logger.error('Failed to create subscription', { customerId, planId, error });
      throw error;
    }
  }

  /**
   * Process usage-based billing
   */
  async recordUsage(tenantId: string, metric: string, value: number): Promise<void> {
    try {
      const usageRecord: UsageRecord = {
        tenantId,
        metric,
        value,
        timestamp: new Date()
      };

      // Store usage record
      await this.storeUsageRecord(usageRecord);

      // Check if usage exceeds plan limits
      const billingUsage = await this.calculateBillingUsage(tenantId);
      if (this.hasOverage(billingUsage)) {
        await this.processOverageCharges(tenantId, billingUsage);
      }

      this.logger.info('Usage recorded', { tenantId, metric, value });

    } catch (error) {
      this.logger.error('Failed to record usage', { tenantId, metric, value, error });
      throw error;
    }
  }

  /**
   * Generate enterprise invoice
   */
  async generateEnterpriseInvoice(
    tenantId: string,
    lineItems: InvoiceLineItem[],
    dueDate: Date
  ): Promise<Invoice> {
    try {
      const customer = await this.getBillingCustomerByTenant(tenantId);
      if (!customer) {
        throw new Error('Billing customer not found');
      }

      this.logger.info('Generating enterprise invoice', { tenantId, lineItems: lineItems.length });

      // Create Stripe invoice
      const stripeInvoice = await this.stripe.invoices.create({
        customer: customer.stripeCustomerId,
        collection_method: 'send_invoice',
        days_until_due: Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        metadata: {
          tenantId,
          type: 'enterprise_custom'
        }
      });

      // Add line items
      for (const item of lineItems) {
        await this.stripe.invoiceItems.create({
          customer: customer.stripeCustomerId,
          invoice: stripeInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_amount: item.unitAmount,
          currency: this.config.defaultCurrency
        });
      }

      // Finalize invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(stripeInvoice.id);

      const invoice: Invoice = {
        id: crypto.randomUUID(),
        tenantId,
        customerId: customer.id,
        stripeInvoiceId: finalizedInvoice.id,
        number: finalizedInvoice.number!,
        status: finalizedInvoice.status as Invoice['status'],
        amountDue: finalizedInvoice.amount_due,
        amountPaid: finalizedInvoice.amount_paid,
        currency: finalizedInvoice.currency,
        dueDate,
        hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url || undefined,
        invoicePdf: finalizedInvoice.invoice_pdf || undefined,
        lineItems,
        created: new Date()
      };

      // Store in database
      await this.storeInvoice(invoice);

      return invoice;

    } catch (error) {
      this.logger.error('Failed to generate enterprise invoice', { tenantId, error });
      throw error;
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      this.logger.info('Processing webhook', { type: event.type, id: event.id });

      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          this.logger.info('Unhandled webhook event', { type: event.type });
      }

    } catch (error) {
      this.logger.error('Webhook processing failed', { error });
      throw error;
    }
  }

  /**
   * Get billing usage for tenant
   */
  async getBillingUsage(tenantId: string): Promise<BillingUsage> {
    return await this.calculateBillingUsage(tenantId);
  }

  // Private helper methods
  private async calculateBillingUsage(tenantId: string): Promise<BillingUsage> {
    // Mock implementation - replace with actual usage calculation
    const subscription = await this.getActiveSubscription(tenantId);
    const plan = subscription ? await this.getSubscriptionPlan(subscription.planId) : null;

    return {
      tenantId,
      planLimits: plan?.limits || {
        maxUsers: 0,
        maxCardsPerMonth: 0,
        maxIntegrations: 0,
        maxStorageGB: 0,
        apiCallsPerMonth: 0
      },
      currentUsage: {
        users: 5,
        cardsProcessed: 150,
        integrations: 2,
        storageUsedGB: 1.2,
        apiCalls: 2500
      },
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      overageCharges: []
    };
  }

  private hasOverage(usage: BillingUsage): boolean {
    return usage.currentUsage.users > usage.planLimits.maxUsers ||
           usage.currentUsage.cardsProcessed > usage.planLimits.maxCardsPerMonth ||
           usage.currentUsage.integrations > usage.planLimits.maxIntegrations ||
           usage.currentUsage.storageUsedGB > usage.planLimits.maxStorageGB ||
           usage.currentUsage.apiCalls > usage.planLimits.apiCallsPerMonth;
  }

  private async processOverageCharges(tenantId: string, usage: BillingUsage): Promise<void> {
    this.logger.info('Processing overage charges', { tenantId });
    // Implementation for overage charge processing
  }

  // Mock database operations - replace with actual database calls
  private async storeBillingCustomer(customer: BillingCustomer): Promise<void> {
    this.logger.info('Storing billing customer', { customerId: customer.id });
  }

  private async getBillingCustomer(customerId: string): Promise<BillingCustomer | null> {
    return null; // Mock implementation
  }

  private async getBillingCustomerByTenant(tenantId: string): Promise<BillingCustomer | null> {
    return null; // Mock implementation
  }

  private async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    return null; // Mock implementation
  }

  private async storeSubscription(subscription: Subscription): Promise<void> {
    this.logger.info('Storing subscription', { subscriptionId: subscription.id });
  }

  private async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    return null; // Mock implementation
  }

  private async storeUsageRecord(record: UsageRecord): Promise<void> {
    this.logger.info('Storing usage record', { tenantId: record.tenantId, metric: record.metric });
  }

  private async storeInvoice(invoice: Invoice): Promise<void> {
    this.logger.info('Storing invoice', { invoiceId: invoice.id });
  }

  // Webhook handlers
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.info('Subscription updated', { subscriptionId: subscription.id });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    this.logger.info('Subscription deleted', { subscriptionId: subscription.id });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    this.logger.info('Invoice payment succeeded', { invoiceId: invoice.id });
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.info('Invoice payment failed', { invoiceId: invoice.id });
  }
} 