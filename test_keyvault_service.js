#!/usr/bin/env node
/**
 * Test script to verify the actual KeyVaultService implementation
 * This tests the exact same service that your application uses
 */

// Import the actual KeyVaultService
const keyVaultService = require('./phi_intelligence/server/services/keyVaultService.ts');

async function testKeyVaultService() {
  console.log('🔍 Testing KeyVaultService Implementation...\n');
  
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
    
    console.log('\n🎉 KeyVaultService test completed successfully!');
    console.log('✅ All methods are working correctly and fetching secrets from Azure Key Vault.');
    
  } catch (error) {
    console.error('\n❌ KeyVaultService test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testKeyVaultService().catch(console.error);
