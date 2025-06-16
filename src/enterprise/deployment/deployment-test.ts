/**
 * @file deployment-test.ts
 * @description Enterprise Deployment Readiness Test
 * @version 1.0
 * @audit-note Tests vault integration, authentication, and enterprise readiness
 */

import { VaultFactory, SecretsManager } from '../vault/vault-config';
import { AuthenticationService } from '../auth/auth-service';
import { checkVaultHealth } from '../../mcp/vault-manager';

export interface DeploymentCheck {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
  details?: any;
}

export interface DeploymentReport {
  overall: 'ready' | 'not_ready' | 'partial';
  score: number;
  maxScore: number;
  checks: DeploymentCheck[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    critical_failures: number;
  };
}

export class DeploymentReadinessTest {
  private vault: any;
  private secretsManager: SecretsManager;
  private authService: AuthenticationService;
  private checks: DeploymentCheck[] = [];

  constructor() {
    this.vault = VaultFactory.createVault(process.env.NODE_ENV || 'development');
    this.secretsManager = new SecretsManager(this.vault);
    this.authService = new AuthenticationService();
  }

  /**
   * Run all deployment readiness tests
   */
  async runAll(): Promise<DeploymentReport> {
    console.log('🚀 Starting Enterprise Deployment Readiness Test...\n');
    
    this.checks = [];

    // Critical infrastructure tests
    await this.testVaultConnection();
    await this.testSecretRetrieval();
    await this.testAuthenticationService();
    await this.testDatabaseConfig();
    await this.testPaymentConfig();
    await this.testSSLConfig();

    // Enterprise features tests
    await this.testOAuthConfiguration();
    await this.testJWTConfiguration();
    await this.testMultiTenancy();

    // Security tests
    await this.testSecurityHeaders();
    await this.testEncryption();

    // Performance tests
    await this.testCacheConfiguration();
    await this.testLoadHandling();

    return this.generateReport();
  }

  /**
   * Test vault connection and health
   */
  private async testVaultConnection(): Promise<void> {
    try {
      const health = await checkVaultHealth();
      
      this.addCheck({
        component: 'Vault Connection',
        status: health.healthy ? 'pass' : 'fail',
        message: health.message,
        critical: true,
        details: health
      });
    } catch (error) {
      this.addCheck({
        component: 'Vault Connection',
        status: 'fail',
        message: `Vault connection failed: ${error}`,
        critical: true,
        details: { error: error }
      });
    }
  }

  /**
   * Test secret retrieval from vault
   */
  private async testSecretRetrieval(): Promise<void> {
    const testSecrets = [
      'jwt_secret',
      'google_client_id',
      'google_client_secret',
      'database_password',
      'stripe_secret_key'
    ];

    let retrievedCount = 0;
    const failedSecrets: string[] = [];

    for (const secretKey of testSecrets) {
      try {
        const secret = await this.vault.getSecret(secretKey);
        if (secret && secret.value) {
          retrievedCount++;
        } else {
          failedSecrets.push(secretKey);
        }
      } catch (error) {
        failedSecrets.push(secretKey);
      }
    }

    const allRetrieved = retrievedCount === testSecrets.length;
    
    this.addCheck({
      component: 'Secret Retrieval',
      status: allRetrieved ? 'pass' : (retrievedCount > 0 ? 'warning' : 'fail'),
      message: `Retrieved ${retrievedCount}/${testSecrets.length} secrets`,
      critical: true,
      details: {
        retrieved: retrievedCount,
        total: testSecrets.length,
        failed: failedSecrets
      }
    });
  }

  /**
   * Test authentication service
   */
  private async testAuthenticationService(): Promise<void> {
    try {
      // Test Google OAuth config
      const googleConfig = await this.secretsManager.getOAuthConfig('google');
      const hasGoogleConfig = googleConfig.clientId && googleConfig.clientSecret;

      // Test JWT secret
      const jwtSecret = await this.secretsManager.getJWTSecret();
      const hasJWTSecret = !!jwtSecret;

      const authReady = hasGoogleConfig && hasJWTSecret;

      this.addCheck({
        component: 'Authentication Service',
        status: authReady ? 'pass' : 'fail',
        message: authReady ? 'Authentication service configured' : 'Missing auth configuration',
        critical: true,
        details: {
          googleOAuth: hasGoogleConfig,
          jwtSecret: hasJWTSecret
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'Authentication Service',
        status: 'fail',
        message: `Authentication test failed: ${error}`,
        critical: true,
        details: { error: error }
      });
    }
  }

  /**
   * Test database configuration
   */
  private async testDatabaseConfig(): Promise<void> {
    try {
      const dbConfig = await this.secretsManager.getDatabaseConfig();
      const hasRequiredConfig = dbConfig.host && dbConfig.password && dbConfig.username && dbConfig.database;

      this.addCheck({
        component: 'Database Configuration',
        status: hasRequiredConfig ? 'pass' : 'fail',
        message: hasRequiredConfig ? 'Database configuration complete' : 'Missing database credentials',
        critical: true,
        details: {
          hasHost: !!dbConfig.host,
          hasPassword: !!dbConfig.password,
          hasUsername: !!dbConfig.username,
          hasDatabase: !!dbConfig.database
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'Database Configuration',
        status: 'fail',
        message: `Database config test failed: ${error}`,
        critical: true,
        details: { error: error }
      });
    }
  }

  /**
   * Test payment configuration
   */
  private async testPaymentConfig(): Promise<void> {
    try {
      const stripeConfig = await this.secretsManager.getPaymentConfig('stripe');
      const hasStripeConfig = stripeConfig.publicKey && stripeConfig.secretKey;

      this.addCheck({
        component: 'Payment Configuration',
        status: hasStripeConfig ? 'pass' : 'warning',
        message: hasStripeConfig ? 'Stripe configuration ready' : 'Payment configuration incomplete',
        critical: false,
        details: {
          hasPublicKey: !!stripeConfig.publicKey,
          hasSecretKey: !!stripeConfig.secretKey,
          hasWebhookSecret: !!stripeConfig.webhookSecret
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'Payment Configuration',
        status: 'warning',
        message: `Payment config test failed: ${error}`,
        critical: false,
        details: { error: error }
      });
    }
  }

  /**
   * Test SSL configuration
   */
  private async testSSLConfig(): Promise<void> {
    try {
      const sslConfig = await this.secretsManager.getSSLCertificate();
      const hasSSLConfig = sslConfig.cert && sslConfig.key;

      this.addCheck({
        component: 'SSL Configuration',
        status: hasSSLConfig ? 'pass' : 'warning',
        message: hasSSLConfig ? 'SSL certificates configured' : 'SSL configuration missing',
        critical: false,
        details: {
          hasCert: !!sslConfig.cert,
          hasKey: !!sslConfig.key,
          hasCA: !!sslConfig.ca
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'SSL Configuration',
        status: 'warning',
        message: `SSL config test failed: ${error}`,
        critical: false,
        details: { error: error }
      });
    }
  }

  /**
   * Test OAuth configuration
   */
  private async testOAuthConfiguration(): Promise<void> {
    try {
      const googleConfig = await this.secretsManager.getOAuthConfig('google');
      const hasGoogleOAuth = googleConfig.clientId && googleConfig.clientSecret;

      this.addCheck({
        component: 'OAuth Configuration',
        status: hasGoogleOAuth ? 'pass' : 'fail',
        message: hasGoogleOAuth ? 'Google OAuth configured' : 'OAuth configuration missing',
        critical: true,
        details: {
          google: hasGoogleOAuth
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'OAuth Configuration',
        status: 'fail',
        message: `OAuth test failed: ${error}`,
        critical: true,
        details: { error: error }
      });
    }
  }

  /**
   * Test JWT configuration
   */
  private async testJWTConfiguration(): Promise<void> {
    try {
      const jwtSecret = await this.secretsManager.getJWTSecret();
      const hasValidJWT = jwtSecret && jwtSecret.length >= 32;

      this.addCheck({
        component: 'JWT Configuration',
        status: hasValidJWT ? 'pass' : 'fail',
        message: hasValidJWT ? 'JWT secret configured' : 'JWT secret missing or too short',
        critical: true,
        details: {
          hasSecret: !!jwtSecret,
          adequateLength: jwtSecret ? jwtSecret.length >= 32 : false
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'JWT Configuration',
        status: 'fail',
        message: `JWT test failed: ${error}`,
        critical: true,
        details: { error: error }
      });
    }
  }

  /**
   * Test multi-tenancy support
   */
  private async testMultiTenancy(): Promise<void> {
    try {
      // Test if we can create multiple vault instances for different environments
      const devVault = VaultFactory.createVault('development');
      const prodVault = VaultFactory.createVault('production');
      
      const multiTenantSupport = devVault !== prodVault;

      this.addCheck({
        component: 'Multi-Tenancy Support',
        status: multiTenantSupport ? 'pass' : 'warning',
        message: multiTenantSupport ? 'Multi-tenant vault support active' : 'Single tenant mode',
        critical: false,
        details: {
          supportsMultiTenant: multiTenantSupport
        }
      });
    } catch (error) {
      this.addCheck({
        component: 'Multi-Tenancy Support',
        status: 'warning',
        message: `Multi-tenancy test failed: ${error}`,
        critical: false,
        details: { error: error }
      });
    }
  }

  /**
   * Test security headers
   */
  private async testSecurityHeaders(): Promise<void> {
    // Mock test for security headers
    this.addCheck({
      component: 'Security Headers',
      status: 'warning',
      message: 'Security headers not implemented yet',
      critical: false,
      details: {
        needed: ['CORS', 'CSP', 'HSTS', 'X-Frame-Options']
      }
    });
  }

  /**
   * Test encryption
   */
  private async testEncryption(): Promise<void> {
    // Mock test for encryption
    this.addCheck({
      component: 'Data Encryption',
      status: 'warning',
      message: 'Encryption configuration needs verification',
      critical: false,
      details: {
        atRest: 'needs_verification',
        inTransit: 'needs_verification'
      }
    });
  }

  /**
   * Test cache configuration
   */
  private async testCacheConfiguration(): Promise<void> {
    try {
      const cacheStats = this.vault.getCacheStats();
      const hasCaching = cacheStats && typeof cacheStats.size === 'number';

      this.addCheck({
        component: 'Cache Configuration',
        status: hasCaching ? 'pass' : 'warning',
        message: hasCaching ? 'Caching system active' : 'Caching not configured',
        critical: false,
        details: cacheStats
      });
    } catch (error) {
      this.addCheck({
        component: 'Cache Configuration',
        status: 'warning',
        message: 'Cache test inconclusive',
        critical: false,
        details: { error: error }
      });
    }
  }

  /**
   * Test load handling capabilities
   */
  private async testLoadHandling(): Promise<void> {
    // Mock test for load handling
    this.addCheck({
      component: 'Load Handling',
      status: 'warning',
      message: 'Load testing not implemented',
      critical: false,
      details: {
        maxConcurrentUsers: 'unknown',
        responseTime: 'unknown'
      }
    });
  }

  /**
   * Add a check result
   */
  private addCheck(check: DeploymentCheck): void {
    this.checks.push(check);
    
    const statusIcon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
    const criticalLabel = check.critical ? ' [CRITICAL]' : '';
    
    console.log(`${statusIcon} ${check.component}${criticalLabel}: ${check.message}`);
  }

  /**
   * Generate deployment report
   */
  private generateReport(): DeploymentReport {
    const passed = this.checks.filter(c => c.status === 'pass').length;
    const failed = this.checks.filter(c => c.status === 'fail').length;
    const warnings = this.checks.filter(c => c.status === 'warning').length;
    const criticalFailures = this.checks.filter(c => c.status === 'fail' && c.critical).length;

    const score = passed;
    const maxScore = this.checks.length;
    const scorePercentage = Math.round((score / maxScore) * 100);

    let overall: 'ready' | 'not_ready' | 'partial';
    if (criticalFailures > 0) {
      overall = 'not_ready';
    } else if (failed > 0 || warnings > 2) {
      overall = 'partial';
    } else {
      overall = 'ready';
    }

    const report: DeploymentReport = {
      overall,
      score,
      maxScore,
      checks: this.checks,
      summary: {
        passed,
        failed,
        warnings,
        critical_failures: criticalFailures
      }
    };

    // Print summary
    console.log('\n📊 DEPLOYMENT READINESS SUMMARY');
    console.log('================================');
    console.log(`Overall Status: ${overall.toUpperCase()}`);
    console.log(`Score: ${score}/${maxScore} (${scorePercentage}%)`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`🚨 Critical Failures: ${criticalFailures}`);

    if (overall === 'ready') {
      console.log('\n🎉 READY FOR DEPLOYMENT!');
    } else if (overall === 'partial') {
      console.log('\n⚠️ PARTIAL READINESS - Address warnings before production');
    } else {
      console.log('\n🚨 NOT READY - Fix critical issues before deployment');
    }

    return report;
  }
}

// Export test runner
export async function runDeploymentTest(): Promise<DeploymentReport> {
  const tester = new DeploymentReadinessTest();
  return await tester.runAll();
} 