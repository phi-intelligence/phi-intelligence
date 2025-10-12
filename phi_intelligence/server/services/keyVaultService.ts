import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

interface CachedSecret {
  value: string;
  expires: number;
}

class KeyVaultService {
  private client: SecretClient;
  private cache: Map<string, CachedSecret> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(
      'https://phi-intelligence-vault.vault.azure.net/',
      credential
    );
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    try {
      const secret = await this.client.getSecret(secretName);
      const value = secret.value || '';
      
      // Cache the secret
      this.cache.set(secretName, {
        value,
        expires: Date.now() + this.cacheTimeout
      });
      
      return value;
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      throw error;
    }
  }

  // Database secrets
  async getDatabaseUrl(service: 'phi' | 'company'): Promise<string> {
    return this.getSecret(`database-${service}-url`);
  }

  // API keys
  async getOpenAIApiKey(): Promise<string> {
    return this.getSecret('openai-api-key');
  }

  async getDeepgramApiKey(): Promise<string> {
    return this.getSecret('deepgram-api-key');
  }

  async getPineconeApiKey(): Promise<string> {
    return this.getSecret('pinecone-api-key');
  }

  // LiveKit credentials
  async getLiveKitCredentials(project: string): Promise<{ apiKey: string; apiSecret: string; url: string }> {
    const [apiKey, apiSecret, url] = await Promise.all([
      this.getSecret(`livekit-${project}-api-key`),
      this.getSecret(`livekit-${project}-api-secret`),
      this.getSecret(`livekit-${project}-url`)
    ]);
    return { apiKey, apiSecret, url };
  }

  // R2 storage credentials
  async getR2Credentials(instance: 'primary' | 'secondary'): Promise<{
    accessKey: string;
    secretKey: string;
    bucketName: string;
    accountId: string;
  }> {
    const [accessKey, secretKey, bucketName, accountId] = await Promise.all([
      this.getSecret(`r2-${instance}-access-key`),
      this.getSecret(`r2-${instance}-secret-key`),
      this.getSecret(`r2-${instance}-bucket`),
      this.getSecret('cloudflare-account-id')
    ]);
    return { accessKey, secretKey, bucketName, accountId };
  }

  // JWT secrets
  async getJWTSecrets(): Promise<{ accessSecret: string; refreshSecret: string; sessionSecret: string }> {
    const [accessSecret, refreshSecret, sessionSecret] = await Promise.all([
      this.getSecret('jwt-access-secret'),
      this.getSecret('jwt-refresh-secret'),
      this.getSecret('session-secret')
    ]);
    return { accessSecret, refreshSecret, sessionSecret };
  }

  // Pinecone configuration
  async getPineconeConfig(): Promise<{ apiKey: string; environment: string; indexName: string }> {
    const [apiKey, environment, indexName] = await Promise.all([
      this.getSecret('pinecone-api-key'),
      this.getSecret('pinecone-environment'),
      this.getSecret('pinecone-index-name')
    ]);
    return { apiKey, environment, indexName };
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getSecret('openai-api-key');
      return true;
    } catch (error) {
      console.error('Key Vault connection test failed:', error);
      return false;
    }
  }
}

export default new KeyVaultService();
