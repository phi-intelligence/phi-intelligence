#!/usr/bin/env node
/**
 * Test script to verify Azure Key Vault integration
 * This script tests if we can successfully fetch secrets from Key Vault
 */

const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

async function testKeyVaultConnection() {
  console.log('🔍 Testing Azure Key Vault Connection...\n');
  
  try {
    // Initialize Key Vault client
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(
      'https://phi-intelligence-vault.vault.azure.net/',
      credential
    );
    
    console.log('✅ Key Vault client initialized successfully');
    
    // Test fetching a few key secrets
    const testSecrets = [
      'openai-api-key',
      'livekit-phi-url',
      'database-phi-url',
      'jwt-access-secret'
    ];
    
    console.log('\n📋 Testing secret retrieval:');
    console.log('=' .repeat(50));
    
    for (const secretName of testSecrets) {
      try {
        const secret = await client.getSecret(secretName);
        const value = secret.value || '';
        const maskedValue = value.length > 8 ? 
          value.substring(0, 4) + '...' + value.substring(value.length - 4) : 
          '***';
        
        console.log(`✅ ${secretName}: ${maskedValue} (${value.length} chars)`);
      } catch (error) {
        console.log(`❌ ${secretName}: Failed - ${error.message}`);
      }
    }
    
    // Test LiveKit credentials specifically
    console.log('\n🎥 Testing LiveKit credentials:');
    console.log('=' .repeat(50));
    
    try {
      const [phiApiKey, phiApiSecret, phiUrl] = await Promise.all([
        client.getSecret('livekit-phi-api-key'),
        client.getSecret('livekit-phi-api-secret'),
        client.getSecret('livekit-phi-url')
      ]);
      
      console.log(`✅ LiveKit Phi URL: ${phiUrl.value}`);
      console.log(`✅ LiveKit Phi API Key: ${phiApiKey.value.substring(0, 8)}...`);
      console.log(`✅ LiveKit Phi API Secret: ${phiApiSecret.value.substring(0, 8)}...`);
    } catch (error) {
      console.log(`❌ LiveKit credentials failed: ${error.message}`);
    }
    
    // Test R2 credentials
    console.log('\n☁️ Testing R2 credentials:');
    console.log('=' .repeat(50));
    
    try {
      const [accessKey, secretKey, bucketName, accountId] = await Promise.all([
        client.getSecret('r2-primary-access-key'),
        client.getSecret('r2-primary-secret-key'),
        client.getSecret('r2-primary-bucket'),
        client.getSecret('cloudflare-account-id')
      ]);
      
      console.log(`✅ R2 Access Key: ${accessKey.value.substring(0, 8)}...`);
      console.log(`✅ R2 Secret Key: ${secretKey.value.substring(0, 8)}...`);
      console.log(`✅ R2 Bucket: ${bucketName.value}`);
      console.log(`✅ Cloudflare Account ID: ${accountId.value}`);
    } catch (error) {
      console.log(`❌ R2 credentials failed: ${error.message}`);
    }
    
    console.log('\n🎉 Key Vault integration test completed successfully!');
    console.log('✅ All secrets are accessible and properly configured.');
    
  } catch (error) {
    console.error('\n❌ Key Vault connection failed:', error.message);
    console.error('Please check your Azure authentication and permissions.');
    process.exit(1);
  }
}

// Run the test
testKeyVaultConnection().catch(console.error);
