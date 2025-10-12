#!/usr/bin/env python3
"""
Azure Key Vault Service for PHI Voice Token Servers
"""

import os
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass

try:
    from azure.identity import DefaultAzureCredential
    from azure.keyvault.secrets import SecretClient
    KEYVAULT_AVAILABLE = True
except ImportError:
    KEYVAULT_AVAILABLE = False
    logging.warning("⚠️ Azure Key Vault libraries not installed")

logger = logging.getLogger(__name__)

@dataclass
class CachedSecret:
    value: str
    expires: datetime

class KeyVaultService:
    def __init__(self):
        self.client = None
        self.cache: Dict[str, CachedSecret] = {}
        self.cache_timeout = timedelta(minutes=5)
        self.vault_url = "https://phi-intelligence-vault.vault.azure.net/"
        
        if KEYVAULT_AVAILABLE:
            try:
                credential = DefaultAzureCredential()
                self.client = SecretClient(vault_url=self.vault_url, credential=credential)
                logger.info("✅ Azure Key Vault service initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Key Vault service: {e}")
                self.client = None
        else:
            logger.warning("⚠️ Key Vault service not available")
    
    async def get_secret(self, secret_name: str) -> str:
        if not self.client:
            raise RuntimeError("Key Vault client not initialized")
        
        # Check cache first
        if secret_name in self.cache:
            cached = self.cache[secret_name]
            if datetime.now() < cached.expires:
                return cached.value
        
        try:
            secret = self.client.get_secret(secret_name)
            value = secret.value or ''
            
            # Cache the secret
            self.cache[secret_name] = CachedSecret(
                value=value,
                expires=datetime.now() + self.cache_timeout
            )
            
            return value
        except Exception as e:
            logger.error(f"Failed to get secret {secret_name}: {e}")
            raise
    
    # Database secrets
    async def get_database_url(self, service: str) -> str:
        return await self.get_secret(f"database-{service}-url")
    
    # API keys
    async def get_openai_key(self) -> str:
        return await self.get_secret("openai-api-key")
    
    async def get_deepgram_key(self) -> str:
        return await self.get_secret("deepgram-api-key")
    
    async def get_pinecone_key(self) -> str:
        return await self.get_secret("pinecone-api-key")
    
    # LiveKit credentials
    async def get_livekit_credentials(self, project: str) -> Tuple[str, str, str]:
        api_key = await self.get_secret(f"livekit-{project}-api-key")
        api_secret = await self.get_secret(f"livekit-{project}-api-secret")
        url = await self.get_secret(f"livekit-{project}-url")
        return api_key, api_secret, url
    
    # R2 storage credentials
    async def get_r2_credentials(self, instance: str) -> Tuple[str, str, str, str]:
        access_key = await self.get_secret(f"r2-{instance}-access-key")
        secret_key = await self.get_secret(f"r2-{instance}-secret-key")
        bucket_name = await self.get_secret(f"r2-{instance}-bucket")
        account_id = await self.get_secret("cloudflare-account-id")
        return access_key, secret_key, bucket_name, account_id
    
    # Pinecone configuration
    async def get_pinecone_config(self) -> Tuple[str, str, str]:
        api_key = await self.get_secret("pinecone-api-key")
        environment = await self.get_secret("pinecone-environment")
        index_name = await self.get_secret("pinecone-index-name")
        return api_key, environment, index_name
    
    # Clear cache
    def clear_cache(self):
        self.cache.clear()
    
    # Test connection
    async def test_connection(self) -> bool:
        try:
            await self.get_secret("openai-api-key")
            return True
        except Exception as e:
            logger.error(f"Key Vault connection test failed: {e}")
            return False

# Global instance
key_vault_service = KeyVaultService()
