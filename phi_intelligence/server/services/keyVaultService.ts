// Azure Key Vault removed - using environment variables for AWS deployment
// This service now acts as a simple environment variable accessor with caching

interface CachedSecret {
  value: string;
  expires: number;
}

class KeyVaultService {
  private cache: Map<string, CachedSecret> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    console.log('✅ KeyVault Service initialized (environment variables mode)');
  }

  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Get from environment variable instead of Azure
    const envKey = secretName.toUpperCase().replace(/-/g, '_');
    const value = process.env[envKey] || '';
    
    if (!value) {
      console.warn(`⚠️ Environment variable ${envKey} not found for secret ${secretName}`);
      return '';
    }
    
    // Cache the value
    this.cache.set(secretName, {
      value,
      expires: Date.now() + this.cacheTimeout
    });
    
    return value;
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

  // Test connection (now just checks environment variables)
  async testConnection(): Promise<boolean> {
    try {
      const testKey = process.env.OPENAI_API_KEY;
      return !!testKey;
    } catch (error) {
      console.error('Environment variable access failed:', error);
      return false;
    }
  }
}

// Note: All methods now read from environment variables instead of Azure Key Vault

export default new KeyVaultService();
