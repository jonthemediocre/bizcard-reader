// Enterprise Stripe Billing System - Genesis v4Σ.2 Implementation  
// Implements THEPLAN.md requirements: Stripe integration, subscription management, tier-based billing

import Stripe from 'stripe';
import { Request, Response } from 'express';
import { enterpriseAuth } from './enterprise-jwt-auth';
import express from 'express';

interface BillingConfig {
  stripeSecretKey: string;
  stripePublicKey: string;
  webhookSecret: string;
  currency: string;
  supportEmail: string;
}

interface SubscriptionTier {
  id: string;
  name: string;
  priceId: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    apiCalls: number;
    storage: number; // GB
    users: number;
    exports: number;
  };
}

interface BillingEvent {
  type: string;
  customerId: string;
  subscriptionId?: string;
  amount?: number;
  timestamp: Date;
  metadata?: any;
}

export class StripeBillingSystem {
  private stripe: Stripe;
  private config: BillingConfig;
  private subscriptionTiers: Map<string, SubscriptionTier>;

  constructor(config: BillingConfig) {
    this.config = config;
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-05-28.basil'
    });
    
    this.initializeSubscriptionTiers();
  }

  private initializeSubscriptionTiers() {
    this.subscriptionTiers = new Map([
      ['free', {
        id: 'free',
        name: 'Free',
        priceId: '', // No Stripe price for free tier
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          '100 business card scans/month',
          'Basic OCR',
          'CSV export',
          'Email support'
        ],
        limits: {
          apiCalls: 100,
          storage: 1,
          users: 1,
          exports: 10
        }
      }],
      ['pro', {
        id: 'pro',
        name: 'Professional',
        priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: [
          '1,000 business card scans/month',
          'Advanced OCR with AI enhancement',
          'CRM integrations (Salesforce, HubSpot)',
          'Multiple export formats',
          'Priority email support',
          'Custom fields'
        ],
        limits: {
          apiCalls: 1000,
          storage: 10,
          users: 5,
          exports: 100
        }
      }],
      ['business', {
        id: 'business',
        name: 'Business',
        priceId: 'price_business_monthly', // Replace with actual Stripe price ID
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          '5,000 business card scans/month',
          'Premium OCR with custom training',
          'Advanced CRM integrations',
          'API access',
          'Team collaboration',
          'Phone + email support',
          'Custom branding'
        ],
        limits: {
          apiCalls: 5000,
          storage: 50,
          users: 25,
          exports: 500
        }
      }],
      ['enterprise', {
        id: 'enterprise',
        name: 'Enterprise',
        priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
        monthlyPrice: 299,
        yearlyPrice: 2990,
        features: [
          'Unlimited business card scans',
          'Custom OCR models',
          'White-label solution',
          'SSO/SAML authentication',
          'Advanced analytics',
          'Dedicated support',
          'SLA guarantees',
          'On-premise deployment option'
        ],
        limits: {
          apiCalls: -1, // Unlimited
          storage: -1, // Unlimited
          users: -1, // Unlimited
          exports: -1 // Unlimited
        }
      }]
    ]);
  }

  // Customer Management
  async createCustomer(user: any): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          tenantId: user.tenantId,
          tier: user.tier || 'free'
        }
      });

      console.log(`Customer created: ${customer.id} for user ${user.id}`);
      return customer;
    } catch (error) {
      console.error('Failed to create Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Failed to retrieve customer:', error);
      return null;
    }
  }

  // Subscription Management
  async createSubscription(customerId: string, priceId: string, quantity = 1): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
          quantity
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          tier: this.getTierByPriceId(priceId)
        }
      });

      console.log(`Subscription created: ${subscription.id} for customer ${customerId}`);
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        metadata: {
          tier: this.getTierByPriceId(newPriceId)
        }
      });

      console.log(`Subscription updated: ${subscriptionId} to price ${newPriceId}`);
      return updatedSubscription;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately
      });

      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      }

      console.log(`Subscription ${immediately ? 'cancelled' : 'scheduled for cancellation'}: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Payment Methods
  async createPaymentIntent(amount: number, customerId: string, currency = 'usd'): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: { enabled: true }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      return paymentMethod;
    } catch (error) {
      console.error('Failed to attach payment method:', error);
      throw new Error('Failed to attach payment method');
    }
  }

  // Usage Tracking and Billing
  async recordUsage(subscriptionItemId: string, quantity: number, timestamp?: number): Promise<void> {
    try {
      await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: timestamp || Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      );
    } catch (error) {
      console.error('Failed to record usage:', error);
      throw error;
    }
  }

  async getUsageRecords(subscriptionItemId: string, limit: number = 100): Promise<any> {
    try {
      const usageRecords = await this.stripe.subscriptionItems.listUsageRecordSummaries(
        subscriptionItemId,
        { limit }
      );
      return usageRecords;
    } catch (error) {
      console.error('Failed to get usage records:', error);
      throw error;
    }
  }

  // Webhook Handling
  async handleWebhook(req: express.Request, res: express.Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send('Webhook signature verification failed');
      return;
    }

    try {
      await this.processWebhookEvent(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).send('Webhook processing failed');
    }
  }

  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const tier = subscription.metadata.tier;
    
    // Update user's tier in your database
    console.log(`Subscription created for customer ${customerId}, tier: ${tier}`);
    
    // Here you would update the user's tier in your database
    // await this.updateUserTier(customerId, tier);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    const tier = subscription.metadata.tier;
    
    console.log(`Subscription updated for customer ${customerId}, new tier: ${tier}`);
    
    // Update user's tier and access
    // await this.updateUserTier(customerId, tier);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    console.log(`Subscription cancelled for customer ${customerId}`);
    
    // Downgrade user to free tier
    // await this.updateUserTier(customerId, 'free');
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    
    console.log(`Payment succeeded for customer ${customerId}, amount: ${invoice.amount_paid}`);
    
    // Reset usage counters, send receipt, etc.
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    
    console.log(`Payment failed for customer ${customerId}`);
    
    // Send payment failure notification, suspend access if needed
  }

  // Utility Methods
  private getTierByPriceId(priceId: string): string {
    for (const [tierId, tier] of this.subscriptionTiers) {
      if (tier.priceId === priceId) {
        return tierId;
      }
    }
    return 'free';
  }

  async getTierInfo(tierId: string): Promise<SubscriptionTier | null> {
    return this.subscriptionTiers.get(tierId) || null;
  }

  async getAllTiers(): Promise<SubscriptionTier[]> {
    return Array.from(this.subscriptionTiers.values());
  }

  // Pricing and Plans API
  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          tier: this.getTierByPriceId(priceId)
        }
      });

      return session;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async createBillingPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      return session;
    } catch (error) {
      console.error('Failed to create billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  // Tier Enforcement
  async checkTierLimits(userId: string, action: 'api_call' | 'storage' | 'export'): Promise<{ allowed: boolean; limit: number; current: number; tier: string }> {
    // This would integrate with your usage tracking system
    // For now, return mock data
    return {
      allowed: true,
      limit: 1000,
      current: 150,
      tier: 'pro'
    };
  }

  async validateTierAccess(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const tierConfig = this.getTierInfo(user.tier);
    if (!tierConfig) {
      res.status(500).json({ error: 'Invalid tier configuration' });
      return;
    }

    // Apply rate limiting based on tier
    const rateLimiter = this.createRateLimiter(user.tier);
    rateLimiter(req, res, (err?: any) => {
      if (err) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          tier: user.tier,
          resetTime: new Date(Date.now() + tierConfig.rateLimitWindow).toISOString()
        });
        return;
      }
      next();
    });
  }
}

// Factory function
export const createBillingSystem = (config: BillingConfig) => new StripeBillingSystem(config);

// Default configuration (replace with environment variables)
export const defaultBillingConfig: BillingConfig = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your-secret-key',
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || 'pk_test_your-public-key',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your-webhook-secret',
  currency: 'usd',
  supportEmail: 'billing@bizcard-enterprise.com'
};

// Export singleton instance
export const billingSystem = createBillingSystem(defaultBillingConfig); 