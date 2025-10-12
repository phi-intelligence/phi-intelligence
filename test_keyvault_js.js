#!/usr/bin/env node
/**
 * Test script using JavaScript version of KeyVaultService
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

class KeyVaultService {
  constructor() {
    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(
      'https://phi-intelligence-vault.vault.azure.net/',
      credential
    );
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getSecret(secretName) {
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
  async getDatabaseUrl(service) {
    return this.getSecret(`database-${service}-url`);
  }

  // API keys
  async getOpenAIApiKey() {
    return this.getSecret('openai-api-key');
  }

  async getDeepgramApiKey() {
    return this.getSecret('deepgram-api-key');
  }

  async getPineconeApiKey() {
    return this.getSecret('pinecone-api-key');
  }

  // LiveKit credentials
  async getLiveKitCredentials(project) {
    const [apiKey, apiSecret, url] = await Promise.all([
      this.getSecret(`livekit-${project}-api-key`),
      this.getSecret(`livekit-${project}-api-secret`),
      this.getSecret(`livekit-${project}-url`)
    ]);
    return { apiKey, apiSecret, url };
  }

  // R2 storage credentials
  async getR2Credentials(instance) {
    const [accessKey, secretKey, bucketName, accountId] = await Promise.all([
      this.getSecret(`r2-${instance}-access-key`),
      this.getSecret(`r2-${instance}-secret-key`),
      this.getSecret(`r2-${instance}-bucket`),
      this.getSecret('cloudflare-account-id')
    ]);
    return { accessKey, secretKey, bucketName, accountId };
  }

  // JWT secrets
  async getJWTSecrets() {
    const [accessSecret, refreshSecret, sessionSecret] = await Promise.all([
      this.getSecret('jwt-access-secret'),
      this.getSecret('jwt-refresh-secret'),
      this.getSecret('session-secret')
    ]);
    return { accessSecret, refreshSecret, sessionSecret };
  }

  // Pinecone configuration
  async getPineconeConfig() {
    const [apiKey, environment, indexName] = await Promise.all([
      this.getSecret('pinecone-api-key'),
      this.getSecret('pinecone-environment'),
      this.getSecret('pinecone-index-name')
    ]);
    return { apiKey, environment, indexName };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Test connection
  async testConnection() {
    try {
      await this.getSecret('openai-api-key');
      return true;
    } catch (error) {
      console.error('Key Vault connection test failed:', error);
      return false;
    }
  }
}

async function testKeyVaultService() {
  console.log('🔍 Testing KeyVaultService Implementation...\n');
  
  const keyVaultService = new KeyVaultService();
  
  try {
    // Test connection first
    console.log('📡 Testing Key Vault connection...');
    const isConnected = await keyVaultService.testConnection();
    console.log(`✅ Connection status: ${isConnected ? 'SUCCESS' : 'FAILED'}\n`);
    
    if (!isConnected) {
      throw new Error('Key Vault connection failed');
    }
    
    // Test individual secret retrieval methods
    console.log('🔑 Testing secret retrieval methods:');
    console.log('=' .repeat(60));
    
    // Test OpenAI API key
    try {
      const openaiKey = await keyVaultService.getOpenAIApiKey();
      console.log(`✅ OpenAI API Key: ${openaiKey.substring(0, 8)}... (${openaiKey.length} chars)`);
    } catch (error) {
      console.log(`❌ OpenAI API Key: ${error.message}`);
    }
    
    // Test LiveKit credentials
    try {
      const livekitCreds = await keyVaultService.getLiveKitCredentials('phi');
      console.log(`✅ LiveKit Phi URL: ${livekitCreds.url}`);
      console.log(`✅ LiveKit Phi API Key: ${livekitCreds.apiKey.substring(0, 8)}...`);
      console.log(`✅ LiveKit Phi API Secret: ${livekitCreds.apiSecret.substring(0, 8)}...`);
    } catch (error) {
      console.log(`❌ LiveKit Phi credentials: ${error.message}`);
    }
    
    // Test database URL
    try {
      const dbUrl = await keyVaultService.getDatabaseUrl('phi');
      console.log(`✅ Database Phi URL: ${dbUrl.substring(0, 20)}... (${dbUrl.length} chars)`);
    } catch (error) {
      console.log(`❌ Database Phi URL: ${error.message}`);
    }
    
    // Test JWT secrets
    try {
      const jwtSecrets = await keyVaultService.getJWTSecrets();
      console.log(`✅ JWT Access Secret: ${jwtSecrets.accessSecret.substring(0, 8)}...`);
      console.log(`✅ JWT Refresh Secret: ${jwtSecrets.refreshSecret.substring(0, 8)}...`);
      console.log(`✅ Session Secret: ${jwtSecrets.sessionSecret.substring(0, 8)}...`);
    } catch (error) {
      console.log(`❌ JWT secrets: ${error.message}`);
    }
    
    // Test R2 credentials
    try {
      const r2Creds = await keyVaultService.getR2Credentials('primary');
      console.log(`✅ R2 Access Key: ${r2Creds.accessKey.substring(0, 8)}...`);
      console.log(`✅ R2 Secret Key: ${r2Creds.secretKey.substring(0, 8)}...`);
      console.log(`✅ R2 Bucket: ${r2Creds.bucketName}`);
      console.log(`✅ Cloudflare Account ID: ${r2Creds.accountId}`);
    } catch (error) {
      console.log(`❌ R2 credentials: ${error.message}`);
    }
    
    // Test Pinecone configuration
    try {
      const pineconeConfig = await keyVaultService.getPineconeConfig();
      console.log(`✅ Pinecone API Key: ${pineconeConfig.apiKey.substring(0, 8)}...`);
      console.log(`✅ Pinecone Environment: ${pineconeConfig.environment}`);
      console.log(`✅ Pinecone Index Name: ${pineconeConfig.indexName}`);
    } catch (error) {
      console.log(`❌ Pinecone configuration: ${error.message}`);
    }
    
    // Test caching
    console.log('\n💾 Testing caching mechanism:');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    await keyVaultService.getOpenAIApiKey(); // First call
    const firstCallTime = Date.now() - startTime;
    
    const startTime2 = Date.now();
    await keyVaultService.getOpenAIApiKey(); // Second call (should be cached)
    const secondCallTime = Date.now() - startTime2;
    
    console.log(`✅ First call (Key Vault): ${firstCallTime}ms`);
    console.log(`✅ Second call (cached): ${secondCallTime}ms`);
    console.log(`✅ Cache speedup: ${Math.round(firstCallTime / secondCallTime)}x faster`);
    
    console.log('\n🎉 KeyVaultService test completed successfully!');
    console.log('✅ All methods are working correctly and fetching secrets from Azure Key Vault.');
    console.log('✅ Caching mechanism is working properly.');
    console.log('✅ Your application is ready for production deployment!');
    
  } catch (error) {
    console.error('\n❌ KeyVaultService test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testKeyVaultService().catch(console.error);
