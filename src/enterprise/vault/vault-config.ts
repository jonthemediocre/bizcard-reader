/**
 * @file vault-config.ts
 * @description Enterprise Vault Configuration for Secrets Management
 * @version 1.0
 * @audit-note Implements HashiCorp Vault integration for enterprise security
 */

export interface VaultConfig {
  endpoint: string;
  token?: string;
  roleId?: string;
  secretId?: string;
  namespace?: string;
  mount: string;
  timeout: number;
}

export interface SecretMetadata {
  path: string;
  version?: number;
  ttl?: number;
  renewable?: boolean;
  tags?: string[];
}

export interface VaultSecret {
  data: Record<string, any>;
  metadata: SecretMetadata;
  lease_id?: string;
  lease_duration?: number;
  renewable?: boolean;
}

export class EnterpriseVault {
  private config: VaultConfig;
  private client: any; // Will be HashiCorp Vault client
  private cache: Map<string, VaultSecret> = new Map();

  constructor(config: VaultConfig) {
    this.config = config;
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Initialize HashiCorp Vault client
      const { VaultApi } = await import('@hashicorp/vault-client');
      
      this.client = new VaultApi({
        baseURL: this.config.endpoint,
        timeout: this.config.timeout,
        headers: {
          'X-Vault-Token': this.config.token,
          'X-Vault-Namespace': this.config.namespace
        }
      });

      await this.authenticate();
    } catch (error) {
      console.error('Failed to initialize Vault client:', error);
      throw new Error('Vault initialization failed');
    }
  }

  private async authenticate() {
    if (this.config.roleId && this.config.secretId) {
      // AppRole authentication
      const response = await this.client.auth.approle.login({
        role_id: this.config.roleId,
        secret_id: this.config.secretId
      });
      
      this.config.token = response.data.auth.client_token;
    }
  }

  async getSecret(path: string, version?: number): Promise<VaultSecret | null> {
    try {
      const cacheKey = `${path}:${version || 'latest'}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        if (this.isSecretValid(cached)) {
          return cached;
        }
      }

      // Fetch from Vault
      const response = await this.client.secrets.kv2.read({
        mount: this.config.mount,
        path: path,
        version: version
      });

      const secret: VaultSecret = {
        data: response.data.data,
        metadata: {
          path: path,
          version: response.data.metadata.version,
          ttl: response.data.metadata.max_versions,
          renewable: false
        },
        lease_id: response.data.lease_id,
        lease_duration: response.data.lease_duration,
        renewable: response.data.renewable
      };

      // Cache the secret
      this.cache.set(cacheKey, secret);
      
      return secret;
    } catch (error) {
      console.error(`Failed to get secret ${path}:`, error);
      return null;
    }
  }

  async setSecret(path: string, data: Record<string, any>, metadata?: Partial<SecretMetadata>): Promise<boolean> {
    try {
      await this.client.secrets.kv2.write({
        mount: this.config.mount,
        path: path,
        data: data,
        options: {
          cas: metadata?.version || 0
        }
      });

      // Update cache
      const secret: VaultSecret = {
        data: data,
        metadata: {
          path: path,
          version: (metadata?.version || 0) + 1,
          ttl: metadata?.ttl,
          renewable: metadata?.renewable || false,
          tags: metadata?.tags
        }
      };

      this.cache.set(`${path}:latest`, secret);
      
      return true;
    } catch (error) {
      console.error(`Failed to set secret ${path}:`, error);
      return false;
    }
  }

  async deleteSecret(path: string): Promise<boolean> {
    try {
      await this.client.secrets.kv2.delete({
        mount: this.config.mount,
        path: path
      });

      // Remove from cache
      this.cache.delete(`${path}:latest`);
      
      return true;
    } catch (error) {
      console.error(`Failed to delete secret ${path}:`, error);
      return false;
    }
  }

  async listSecrets(path: string = ''): Promise<string[]> {
    try {
      const response = await this.client.secrets.kv2.list({
        mount: this.config.mount,
        path: path
      });

      return response.data.keys || [];
    } catch (error) {
      console.error(`Failed to list secrets at ${path}:`, error);
      return [];
    }
  }

  private isSecretValid(secret: VaultSecret): boolean {
    if (!secret.lease_duration) return true;
    
    const now = Date.now();
    const expiryTime = (secret.metadata as any).created_time + (secret.lease_duration * 1000);
    
    return now < expiryTime;
  }

  async renewLease(leaseId: string): Promise<boolean> {
    try {
      await this.client.sys.leases.renew({
        lease_id: leaseId
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to renew lease ${leaseId}:`, error);
      return false;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getHealth(): Promise<any> {
    return this.client.sys.health();
  }
}

// Enterprise Vault Factory
export class VaultFactory {
  private static instances: Map<string, EnterpriseVault> = new Map();

  static async createVault(environment: string): Promise<EnterpriseVault> {
    if (this.instances.has(environment)) {
      return this.instances.get(environment)!;
    }

    const config = this.getVaultConfig(environment);
    const vault = new EnterpriseVault(config);
    
    this.instances.set(environment, vault);
    return vault;
  }

  private static getVaultConfig(environment: string): VaultConfig {
    const baseConfig = {
      timeout: 30000,
      mount: 'secret'
    };

    switch (environment) {
      case 'production':
        return {
          ...baseConfig,
          endpoint: process.env.VAULT_PROD_ENDPOINT!,
          roleId: process.env.VAULT_PROD_ROLE_ID!,
          secretId: process.env.VAULT_PROD_SECRET_ID!,
          namespace: process.env.VAULT_PROD_NAMESPACE
        };
      
      case 'staging':
        return {
          ...baseConfig,
          endpoint: process.env.VAULT_STAGING_ENDPOINT!,
          roleId: process.env.VAULT_STAGING_ROLE_ID!,
          secretId: process.env.VAULT_STAGING_SECRET_ID!,
          namespace: process.env.VAULT_STAGING_NAMESPACE
        };
      
      case 'development':
      default:
        return {
          ...baseConfig,
          endpoint: process.env.VAULT_DEV_ENDPOINT || 'http://localhost:8200',
          token: process.env.VAULT_DEV_TOKEN || 'dev-token',
          namespace: process.env.VAULT_DEV_NAMESPACE
        };
    }
  }
}

// Secrets Manager with Vault Integration
export class SecretsManager {
  private vault: EnterpriseVault;

  constructor(vault: EnterpriseVault) {
    this.vault = vault;
  }

  // Database secrets
  async getDatabaseConfig(): Promise<any> {
    const secret = await this.vault.getSecret('database/config');
    return secret?.data || {};
  }

  // API keys
  async getAPIKey(service: string): Promise<string | null> {
    const secret = await this.vault.getSecret(`api-keys/${service}`);
    return secret?.data?.key || null;
  }

  // OAuth credentials
  async getOAuthConfig(provider: string): Promise<any> {
    const secret = await this.vault.getSecret(`oauth/${provider}`);
    return secret?.data || {};
  }

  // Encryption keys
  async getEncryptionKey(purpose: string): Promise<string | null> {
    const secret = await this.vault.getSecret(`encryption/${purpose}`);
    return secret?.data?.key || null;
  }

  // JWT secrets
  async getJWTSecret(): Promise<string | null> {
    const secret = await this.vault.getSecret('jwt/secret');
    return secret?.data?.secret || null;
  }

  // Payment processor secrets
  async getPaymentConfig(processor: string): Promise<any> {
    const secret = await this.vault.getSecret(`payments/${processor}`);
    return secret?.data || {};
  }
} 