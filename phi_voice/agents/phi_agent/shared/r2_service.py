#!/usr/bin/env python3
"""
Cloudflare R2 Service for Phi Voice Application

Purpose:
- Handle file uploads to Cloudflare R2 bucket
- Manage file downloads for processing
- Provide file deletion capabilities
- Generate public URLs for file access

Dependencies:
- boto3 (AWS S3 client compatible with R2)
- python-dotenv for environment variables
"""

import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional, Union
from pathlib import Path
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Configure logging
logger = logging.getLogger(__name__)

class R2Service:
    """Service for interacting with Cloudflare R2 storage"""
    
    def __init__(self):
        """Initialize R2 service with configuration from environment variables"""
        self.bucket_name = None
        self.account_id = None
        self.access_key_id = None
        self.secret_access_key = None
        self.s3_client = None
        self._initialized = False
        
        logger.info("🔄 R2 service created - will initialize on first use")
    
    def _initialize(self):
        """Lazy initialization of R2 service"""
        if self._initialized:
            return
            
        # Load configuration from environment variables
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "voicebot")
        self.account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        
        # Validate required environment variables
        if not all([self.account_id, self.access_key_id, self.secret_access_key]):
            logger.warning("⚠️ R2 credentials not fully configured - R2 functionality will be limited")
            self.s3_client = None
            self._initialized = True
            return
        
        try:
            # Initialize S3 client compatible with Cloudflare R2
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f"https://{self.account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                region_name='auto'
            )
            
            # Test connection by checking if our specific bucket exists
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                logger.info(f"✅ R2 service initialized successfully for bucket: {self.bucket_name}")
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    logger.warning(f"⚠️ Bucket '{self.bucket_name}' does not exist - will create on first upload")
                else:
                    logger.error(f"❌ R2 bucket access failed: {e}")
                    self.s3_client = None
                    return
            
        except NoCredentialsError:
            logger.error("❌ R2 credentials not found or invalid")
            self.s3_client = None
        except ClientError as e:
            logger.error(f"❌ R2 connection failed: {e}")
            self.s3_client = None
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing R2 service: {e}")
            self.s3_client = None
        
        self._initialized = True
    
    def is_available(self) -> bool:
        """Check if R2 service is available and configured"""
        self._initialize()
        return self.s3_client is not None
    
    async def upload_file(self, file_data: Union[bytes, bytearray], voicebot_id: str, 
                         file_id: str, original_name: str, content_type: str) -> Dict[str, Any]:
        """
        Upload file to R2 and return metadata
        
        Args:
            file_data: File content as bytes
            voicebot_id: Unique identifier for the voicebot
            file_id: Unique identifier for the file
            original_name: Original filename
            content_type: MIME type of the file
            
        Returns:
            Dictionary containing R2 metadata (r2_key, r2_url, bucket)
            
        Raises:
            Exception: If R2 service is not available or upload fails
        """
        if not self.is_available():
            raise Exception("R2 service is not available")
        
        try:
            # Generate R2 key (path in bucket)
            file_extension = Path(original_name).suffix
            r2_key = f"voicebots/{voicebot_id}/original/{file_id}{file_extension}"
            
            # Upload file to R2
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=r2_key,
                Body=file_data,
                ContentType=content_type,
                Metadata={
                    'voicebot_id': voicebot_id,
                    'file_id': file_id,
                    'original_name': original_name,
                    'uploaded_at': datetime.now().isoformat(),
                    'content_type': content_type,
                    'file_size': str(len(file_data))
                }
            )
            
            # Generate public URL
            public_url = f"https://pub-{self.account_id}.r2.dev/{r2_key}"
            
            logger.info(f"✅ File uploaded to R2: {r2_key} -> {public_url}")
            
            return {
                "r2_key": r2_key,
                "r2_url": public_url,
                "bucket": self.bucket_name,
                "file_size": len(file_data),
                "uploaded_at": datetime.now().isoformat()
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"❌ R2 upload failed: {error_code} - {error_message}")
            raise Exception(f"R2 upload failed: {error_message}")
        except Exception as e:
            logger.error(f"❌ Unexpected error during R2 upload: {e}")
            raise Exception(f"R2 upload failed: {str(e)}")
    
    async def download_file(self, r2_key: str) -> bytes:
        """
        Download file from R2 for processing
        
        Args:
            r2_key: R2 storage key (path in bucket)
            
        Returns:
            File content as bytes
            
        Raises:
            Exception: If download fails
        """
        if not self.is_available():
            raise Exception("R2 service is not available")
        
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=r2_key)
            file_data = response['Body'].read()
            
            logger.info(f"✅ File downloaded from R2: {r2_key} ({len(file_data)} bytes)")
            return file_data
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"❌ R2 download failed: {error_code} - {error_message}")
            raise Exception(f"R2 download failed: {error_message}")
        except Exception as e:
            logger.error(f"❌ Unexpected error during R2 download: {e}")
            raise Exception(f"R2 download failed: {str(e)}")
    
    async def delete_file(self, r2_key: str) -> bool:
        """
        Delete file from R2
        
        Args:
            r2_key: R2 storage key (path in bucket)
            
        Returns:
            True if deletion successful, False otherwise
        """
        if not self.is_available():
            logger.warning("⚠️ R2 service not available, cannot delete file")
            return False
        
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=r2_key)
            logger.info(f"✅ File deleted from R2: {r2_key}")
            return True
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"❌ R2 deletion failed: {error_code} - {error_message}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error during R2 deletion: {e}")
            return False
    
    async def file_exists(self, r2_key: str) -> bool:
        """
        Check if file exists in R2
        
        Args:
            r2_key: R2 storage key (path in bucket)
            
        Returns:
            True if file exists, False otherwise
        """
        if not self.is_available():
            return False
        
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=r2_key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            logger.error(f"❌ Error checking file existence: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error checking file existence: {e}")
            return False
    
    async def get_file_info(self, r2_key: str) -> Optional[Dict[str, Any]]:
        """
        Get file information from R2
        
        Args:
            r2_key: R2 storage key (path in bucket)
            
        Returns:
            Dictionary with file metadata or None if not found
        """
        if not self.is_available():
            return None
        
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=r2_key)
            
            return {
                "r2_key": r2_key,
                "content_type": response.get('ContentType'),
                "content_length": response.get('ContentLength'),
                "last_modified": response.get('LastModified'),
                "metadata": response.get('Metadata', {}),
                "etag": response.get('ETag')
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return None
            logger.error(f"❌ Error getting file info: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Unexpected error getting file info: {e}")
            return None
    
    async def list_voicebot_files(self, voicebot_id: str) -> list:
        """
        List all files for a specific voicebot
        
        Args:
            voicebot_id: Unique identifier for the voicebot
            
        Returns:
            List of file information dictionaries
        """
        if not self.is_available():
            return []
        
        try:
            prefix = f"voicebots/{voicebot_id}/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        "r2_key": obj['Key'],
                        "size": obj['Size'],
                        "last_modified": obj['LastModified'],
                        "filename": Path(obj['Key']).name
                    })
            
            logger.info(f"✅ Listed {len(files)} files for voicebot {voicebot_id}")
            return files
            
        except ClientError as e:
            logger.error(f"❌ Error listing voicebot files: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Unexpected error listing voicebot files: {e}")
            return []
    
    def get_public_url(self, r2_key: str) -> str:
        """
        Generate public URL for a file
        
        Args:
            r2_key: R2 storage key (path in bucket)
            
        Returns:
            Public URL for the file
        """
        return f"https://pub-{self.account_id}.r2.dev/{r2_key}"
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check R2 service health and connectivity
        
        Returns:
            Dictionary with health status information
        """
        if not self.is_available():
            return {
                "status": "unavailable",
                "message": "R2 service not configured or connection failed",
                "bucket": self.bucket_name,
                "account_id": self.account_id
            }
        
        try:
            # Check if our bucket exists (don't try to list all buckets)
            try:
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                bucket_exists = True
                bucket_message = "R2 service operational"
                status = "healthy"
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    bucket_exists = False
                    bucket_message = "Bucket does not exist - will create on first upload"
                    status = "warning"
                else:
                    bucket_exists = False
                    bucket_message = f"Bucket access error: {e.response['Error']['Code']}"
                    status = "error"
            
            return {
                "status": status,
                "message": bucket_message,
                "bucket": self.bucket_name,
                "bucket_exists": bucket_exists,
                "account_id": self.account_id,
                "endpoint": f"https://{self.account_id}.r2.cloudflarestorage.com"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"R2 service error: {str(e)}",
                "bucket": self.bucket_name,
                "account_id": self.account_id
            }

# Export service instance
r2_service = R2Service()
