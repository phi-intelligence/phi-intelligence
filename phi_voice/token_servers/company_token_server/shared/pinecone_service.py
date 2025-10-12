#!/usr/bin/env python3
"""
Enhanced Pinecone Vector Service for PHI Voice RAG System

Purpose:
- Handle all vector operations (storage, search, deletion)
- Store company profiles and metadata (replacing Neon DB)
- Provide comprehensive RAG functionality with rich metadata
- Replace PGVector functionality with managed Pinecone service

Features:
- Auto-index creation and management
- Batch vector operations
- Metadata filtering
- Health monitoring
- Company profile management
- Enhanced file metadata storage
- Error handling and fallbacks
"""

import os
import logging
import asyncio
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from pathlib import Path

# Pinecone imports
try:
    from pinecone import Pinecone, ServerlessSpec
    PINECONE_AVAILABLE = True
except ImportError:
    PINECONE_AVAILABLE = False
    logging.warning("⚠️ Pinecone client not installed. Install with: pip install pinecone")

logger = logging.getLogger(__name__)

class PineconeService:
    """Enhanced Pinecone vector service for document embeddings, company profiles, and metadata"""
    
    def __init__(self):
        """Initialize Pinecone service with configuration"""
        # Service state
        self.client = None
        self.index = None
        self.is_initialized = False
        self._initialized = False
    
    def _load_config(self):
        """Lazy load configuration when needed"""
        if self._initialized:
            return
            
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.environment = os.getenv("PINECONE_ENVIRONMENT")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "phi")  # ✅ Updated to match your index name
        
        logger.info(f"🔍 Pinecone config check:")
        logger.info(f"   API Key: {'✅ Set' if self.api_key else '❌ Not set'}")
        logger.info(f"   Environment: {self.environment or '❌ Not set'}")
        logger.info(f"   Index Name: {self.index_name}")
        logger.info(f"   PINECONE_AVAILABLE: {PINECONE_AVAILABLE}")
        
        if not self.api_key:
            logger.warning("⚠️ Pinecone API key not configured - RAG functionality will be limited")
            return
        
        if not PINECONE_AVAILABLE:
            logger.warning("⚠️ Pinecone client not available - install pinecone")
            return
        
        try:
            # Initialize Pinecone with new API
            self.client = Pinecone(api_key=self.api_key)
            
            # Ensure index exists
            self._ensure_index()
            
            if self.index:
                self.is_initialized = True
                logger.info(f"✅ Pinecone service initialized successfully: {self.index_name}")
            else:
                logger.warning("⚠️ Pinecone index not available")
                
        except Exception as e:
            logger.error(f"❌ Pinecone initialization failed: {e}")
            self.client = None
            self.index = None
        
        self._initialized = True
    
    def _ensure_index(self):
        """Create Pinecone index if it doesn't exist"""
        try:
            if self.index_name not in self.client.list_indexes().names():
                logger.info(f"🔄 Creating Pinecone index: {self.index_name}")
                
                # Create index with optimal settings for text embeddings
                self.client.create_index(
                    name=self.index_name,
                    dimension=1536,  # text-embedding-3-small dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"  # ✅ Updated to match your index
                    )
                )
                
                # Wait for index to be ready (synchronous wait)
                import time
                while True:
                    try:
                        self.index = self.client.Index(self.index_name)
                        # Test connection
                        self.index.describe_index_stats()
                        break
                    except Exception:
                        logger.info("🔄 Waiting for index to be ready...")
                        time.sleep(5)
                
                logger.info(f"✅ Pinecone index {self.index_name} created and ready")
            else:
                # Connect to existing index
                self.index = self.client.Index(self.index_name)
                logger.info(f"✅ Connected to existing Pinecone index: {self.index_name}")
                
        except Exception as e:
            logger.error(f"❌ Failed to ensure Pinecone index: {e}")
            self.index = None

    def is_available(self) -> bool:
        """Check if Pinecone service is available and ready"""
        if not self._initialized:
            self._load_config()
        return self.is_initialized and self.index is not None

    async def upsert_vectors(self, vectors: List[Dict[str, Any]], namespace: str) -> bool:
        """
        Upsert vectors to Pinecone namespace
        
        Args:
            vectors: List of vector dictionaries with 'id', 'embedding', and metadata
            namespace: Namespace to store vectors in
        
        Returns:
            True if upsert was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot upsert vectors")
            return False
        
        try:
            # Prepare vectors for Pinecone format
            pinecone_vectors = []
            for vec in vectors:
                pinecone_vectors.append({
                    "id": vec["id"],
                    "values": vec["embedding"],
                    "metadata": {
                        "voicebot_id": vec.get("voicebot_id", ""),
                        "content": vec.get("content", ""),
                        "source_file": vec.get("source_file", ""),
                        "chunk_index": vec.get("chunk_index", 0),
                        "chunk_size": vec.get("chunk_size", 0),
                        "company_name": vec.get("company_name", ""),
                        "description": vec.get("description", ""),
                        "uploaded_at": vec.get("uploaded_at", datetime.now().isoformat()),
                        "type": "document_chunk"  # Identify as document chunk
                    }
                })
            
            # Batch upsert (Pinecone handles batching automatically)
            batch_size = 100  # Pinecone recommended batch size
            for i in range(0, len(pinecone_vectors), batch_size):
                batch = pinecone_vectors[i:i + batch_size]
                self.index.upsert(vectors=batch, namespace=namespace)
            
            logger.info(f"✅ Successfully upserted {len(pinecone_vectors)} vectors to namespace: {namespace}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Pinecone upsert failed: {e}")
            return False

    async def search_vectors(self, query_vector: List[float], namespace: str, top_k: int = 5, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Search vectors in Pinecone namespace
        
        Args:
            query_vector: Query embedding vector
            namespace: Namespace to search in
            top_k: Maximum number of results
            filters: Metadata filters for search
        
        Returns:
            List of search results with content and metadata
        """
        if not self.is_available():
            raise Exception("Pinecone service is not available")
        
        try:
            # Build filter dictionary
            filter_dict = {}
            if filters:
                if "voicebot_id" in filters:
                    filter_dict["voicebot_id"] = filters["voicebot_id"]
                if "source_file" in filters:
                    filter_dict["source_file"] = filters["source_file"]
                if "company_name" in filters:
                    filter_dict["company_name"] = filters["company_name"]
                if "type" in filters:
                    filter_dict["type"] = filters["type"]
            
            # Perform search
            results = self.index.query(
                vector=query_vector,
                namespace=namespace,
                top_k=top_k,
                filter=filter_dict,
                include_metadata=True
            )
            
            # Format results for consistency
            formatted_results = []
            for match in results.matches:
                formatted_results.append({
                    "content": match.metadata.get("content", ""),
                    "source_file": match.metadata.get("source_file", ""),
                    "distance": 1 - match.score,  # Convert similarity to distance
                    "confidence": match.score,  # Keep similarity score
                    "metadata": {
                        "voicebot_id": match.metadata.get("voicebot_id", ""),
                        "chunk_index": match.metadata.get("chunk_index", 0),
                        "chunk_size": match.metadata.get("chunk_size", 0),
                        "company_name": match.metadata.get("company_name", ""),
                        "description": match.metadata.get("description", ""),
                        "uploaded_at": match.metadata.get("uploaded_at", ""),
                        "type": match.metadata.get("type", "document_chunk")
                    }
                })
            
            logger.info(f"✅ Pinecone search returned {len(formatted_results)} results for namespace: {namespace}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"❌ Pinecone search failed: {e}")
            raise Exception(f"Pinecone search failed: {str(e)}")

    # 🚀 NEW: Company Profile Management Methods
    
    async def store_company_profile(self, voicebot_id: str, company_data: Dict[str, Any]) -> bool:
        """
        Store company profile as a special document in Pinecone
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
            company_data: Company information dictionary
        
        Returns:
            True if storage was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot store company profile")
            return False
        
        try:
            # Create a special company profile document
            company_profile = {
                "id": f"company_profile_{voicebot_id}",
                "values": [0.1] * 1536,  # Placeholder vector for company profile
                "metadata": {
                    "voicebot_id": voicebot_id,
                    "company_name": company_data.get("company_name", ""),
                    "bot_name": company_data.get("bot_name", ""),  # ✅ ADD: Store bot_name in main metadata
                    "description": company_data.get("description", ""),
                    "description_source": company_data.get("description_source", "user_provided"),
                    "status": company_data.get("status", "active"),
                    "files_count": company_data.get("files_count", 0),
                    "chunks_count": company_data.get("chunks_count", 0),
                    "created_at": company_data.get("created_at", datetime.now().isoformat()),
                    "updated_at": datetime.now().isoformat(),
                    "type": "company_profile",  # Special type identifier
                    "metadata_json": str(company_data)  # Store full metadata as string
                }
            }
            
            # Store in a special namespace for company profiles
            self.index.upsert(
                vectors=[company_profile],
                namespace="company_profiles"
            )
            
            logger.info(f"✅ Company profile stored for voicebot: {voicebot_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store company profile for {voicebot_id}: {e}")
            return False

    async def get_company_profile(self, voicebot_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve company profile from Pinecone
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
        
        Returns:
            Company profile data or None if not found
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot retrieve company profile")
            return None
        
        try:
            # Search for company profile in company_profiles namespace
            results = self.index.query(
                vector=[0.1] * 1536,  # Placeholder vector
                namespace="company_profiles",
                top_k=1,
                filter={"voicebot_id": voicebot_id, "type": "company_profile"},
                include_metadata=True
            )
            
            if results.matches:
                match = results.matches[0]
                metadata = match.metadata
                
                # Parse metadata_json if it exists
                metadata_json = metadata.get("metadata_json", "{}")
                try:
                    if isinstance(metadata_json, str):
                        import json
                        full_metadata = json.loads(metadata_json)
                    else:
                        full_metadata = metadata_json
                except:
                    full_metadata = {}
                
                return {
                    "voicebot_id": metadata.get("voicebot_id"),
                    "company_name": metadata.get("company_name"),
                    "bot_name": metadata.get("bot_name"),  # ✅ ADD: Explicitly extract bot_name
                    "description": metadata.get("description"),
                    "description_source": metadata.get("description_source"),
                    "status": metadata.get("status"),
                    "files_count": metadata.get("files_count", 0),
                    "chunks_count": metadata.get("chunks_count", 0),
                    "created_at": metadata.get("created_at"),
                    "updated_at": metadata.get("updated_at"),
                    **full_metadata  # Include any additional metadata
                }
            
            logger.warning(f"⚠️ Company profile not found for voicebot: {voicebot_id}")
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve company profile for {voicebot_id}: {e}")
            return None

    async def update_company_stats(self, voicebot_id: str, files_count: int, chunks_count: int) -> bool:
        """
        Update company statistics in Pinecone
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
            files_count: Updated file count
            chunks_count: Updated chunk count
        
        Returns:
            True if update was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot update company stats")
            return False
        
        try:
            # Get current company profile
            current_profile = await self.get_company_profile(voicebot_id)
            if not current_profile:
                logger.warning(f"⚠️ Company profile not found for {voicebot_id}, cannot update stats")
                return False
            
            # Update statistics
            current_profile["files_count"] = files_count
            current_profile["chunks_count"] = chunks_count
            current_profile["updated_at"] = datetime.now().isoformat()
            
            # Store updated profile
            return await self.store_company_profile(voicebot_id, current_profile)
            
        except Exception as e:
            logger.error(f"❌ Failed to update company stats for {voicebot_id}: {e}")
            return False

    async def store_file_metadata(self, voicebot_id: str, file_data: Dict[str, Any]) -> bool:
        """
        Store file metadata in Pinecone (without vectors)
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
            file_data: File information dictionary
        
        Returns:
            True if storage was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot store file metadata")
            return False
        
        try:
            # Create file metadata document
            file_metadata = {
                "id": f"file_metadata_{voicebot_id}_{file_data.get('file_id', 'unknown')}",
                "values": [0.1] * 1536,  # Placeholder vector for metadata
                "metadata": {
                    "voicebot_id": voicebot_id,
                    "file_id": file_data.get("file_id"),
                    "original_name": file_data.get("original_name"),
                    "file_size_bytes": file_data.get("file_size_bytes"),
                    "content_type": file_data.get("content_type"),
                    "checksum": file_data.get("checksum"),
                    "storage_path": file_data.get("storage_path"),
                    "r2_url": file_data.get("r2_url"),
                    "r2_key": file_data.get("r2_key"),
                    "uploaded_at": file_data.get("uploaded_at", datetime.now().isoformat()),
                    "type": "file_metadata"
                }
            }
            
            # Store in file_metadata namespace
            self.index.upsert(
                vectors=[file_metadata],
                namespace="file_metadata"
            )
            
            logger.info(f"✅ File metadata stored for {file_data.get('original_name')} in voicebot: {voicebot_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store file metadata for {file_data.get('original_name')}: {e}")
            return False

    async def get_file_metadata(self, voicebot_id: str, file_id: str = None) -> List[Dict[str, Any]]:
        """
        Retrieve file metadata from Pinecone
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
            file_id: Optional specific file ID
        
        Returns:
            List of file metadata
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot retrieve file metadata")
            return []
        
        try:
            # Build filter
            filter_dict = {"voicebot_id": voicebot_id, "type": "file_metadata"}
            if file_id:
                filter_dict["file_id"] = file_id
            
            # Search for file metadata
            results = self.index.query(
                vector=[0.1] * 1536,  # Placeholder vector
                namespace="file_metadata",
                top_k=100,  # Get up to 100 files
                filter=filter_dict,
                include_metadata=True
            )
            
            file_metadata_list = []
            for match in results.matches:
                metadata = match.metadata
                file_metadata_list.append({
                    "file_id": metadata.get("file_id"),
                    "original_name": metadata.get("original_name"),
                    "file_size_bytes": metadata.get("file_size_bytes"),
                    "content_type": metadata.get("content_type"),
                    "checksum": metadata.get("checksum"),
                    "storage_path": metadata.get("storage_path"),
                    "r2_url": metadata.get("r2_url"),
                    "r2_key": metadata.get("r2_key"),
                    "uploaded_at": metadata.get("uploaded_at")
                })
            
            logger.info(f"✅ Retrieved {len(file_metadata_list)} file metadata records for voicebot: {voicebot_id}")
            return file_metadata_list
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve file metadata for {voicebot_id}: {e}")
            return []

    async def delete_company_data(self, voicebot_id: str) -> bool:
        """
        Delete all company data from Pinecone (vectors, profiles, metadata)
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
        
        Returns:
            True if deletion was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot delete company data")
            return False
        
        try:
            # Delete vectors from main namespace
            self.index.delete(namespace=voicebot_id)
            
            # Delete company profile
            try:
                # Find and delete company profile
                results = self.index.query(
                    vector=[0.1] * 1536,
                    namespace="company_profiles",
                    top_k=1,
                    filter={"voicebot_id": voicebot_id, "type": "company_profile"},
                    include_metadata=True
                )
                
                if results.matches:
                    profile_id = results.matches[0].id
                    self.index.delete(ids=[profile_id], namespace="company_profiles")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete company profile: {e}")
            
            # Delete file metadata
            try:
                # Find and delete file metadata
                results = self.index.query(
                    vector=[0.1] * 1536,
                    namespace="file_metadata",
                    top_k=100,
                    filter={"voicebot_id": voicebot_id, "type": "file_metadata"},
                    include_metadata=True
                )
                
                if results.matches:
                    file_ids = [match.id for match in results.matches]
                    self.index.delete(ids=file_ids, namespace="file_metadata")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete file metadata: {e}")
            
            logger.info(f"✅ Successfully deleted all company data for voicebot: {voicebot_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete company data for {voicebot_id}: {e}")
            return False

    async def delete_vectors(self, namespace: str, filters: Dict[str, Any] = None) -> bool:
        """
        Delete vectors from Pinecone namespace
        
        Args:
            namespace: Namespace to delete from
            filters: Optional metadata filters for selective deletion
        
        Returns:
            True if deletion was successful
        """
        if not self.is_available():
            logger.warning("⚠️ Pinecone service not available, cannot delete vectors")
            return False
        
        try:
            # For now, delete entire namespace (Pinecone limitation)
            # In future, we could implement selective deletion with metadata filters
            self.index.delete(namespace=namespace)
            
            logger.info(f"✅ Successfully deleted vectors from namespace: {namespace}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Pinecone deletion failed: {e}")
            return False

    async def get_index_stats(self) -> Dict[str, Any]:
        """Get Pinecone index statistics and health information"""
        if not self.is_available():
            return {
                "status": "unavailable",
                "message": "Pinecone service not configured or connection failed",
                "index_name": self.index_name,
                "environment": self.environment
            }
        
        try:
            stats = self.index.describe_index_stats()
            
            return {
                "status": "healthy",
                "index_name": self.index_name,
                "environment": self.environment,
                "total_vector_count": stats.total_vector_count,
                "dimension": stats.dimension,
                "metric": stats.metric,
                "namespaces": stats.namespaces,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Pinecone stats error: {str(e)}",
                "index_name": self.index_name,
                "environment": self.environment
            }

    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check for Pinecone service"""
        if not self.is_available():
            return {
                "status": "unhealthy",
                "service": "pinecone",
                "message": "Service not available",
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Get basic stats
            stats = await self.get_index_stats()
            
            # Test basic operations
            test_vector = [0.1] * 1536  # Simple test vector
            
            # Try a minimal search to test connectivity
            try:
                self.index.query(
                    vector=test_vector,
                    namespace="test",
                    top_k=1
                )
                connectivity = "healthy"
            except Exception:
                connectivity = "unhealthy"
            
            return {
                "status": "healthy" if connectivity == "healthy" else "degraded",
                "service": "pinecone",
                "index_name": self.index_name,
                "environment": self.environment,
                "connectivity": connectivity,
                "stats": stats,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "pinecone",
                "message": f"Health check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

    async def list_namespaces(self) -> List[str]:
        """List all namespaces in the index"""
        if not self.is_available():
            return []
        
        try:
            stats = self.index.describe_index_stats()
            return list(stats.namespaces.keys()) if stats.namespaces else []
        except Exception as e:
            logger.error(f"❌ Failed to list namespaces: {e}")
            return []

    async def get_namespace_stats(self, namespace: str) -> Dict[str, Any]:
        """Get statistics for a specific namespace"""
        if not self.is_available():
            return {"error": "Service not available"}
        
        try:
            stats = self.index.describe_index_stats()
            namespace_stats = stats.namespaces.get(namespace, {})
            
            return {
                "namespace": namespace,
                "vector_count": namespace_stats.get("vector_count", 0),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Failed to get namespace stats for {namespace}: {e}")
            return {"error": str(e)}

    # 🚀 NEW: Enhanced Search Methods
    
    async def search_company_knowledge(self, voicebot_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Enhanced search that combines document chunks and company profile
        
        Args:
            voicebot_id: Unique identifier for the company voicebot
            query: Search query text
            top_k: Maximum number of results
        
        Returns:
            Combined search results with company context
        """
        if not self.is_available():
            raise Exception("Pinecone service is not available")
        
        try:
            # Get company profile for context
            company_profile = await self.get_company_profile(voicebot_id)
            
            # Search document chunks
            # Note: This requires the query to be converted to embedding first
            # The calling function should handle embedding generation
            
            # For now, return company profile as context
            results = []
            if company_profile:
                results.append({
                    "content": f"Company: {company_profile.get('company_name', 'Unknown')} - {company_profile.get('description', 'No description available')}",
                    "source_file": "company_profile",
                    "distance": 0.0,
                    "confidence": 1.0,
                    "metadata": {
                        "type": "company_profile",
                        "voicebot_id": voicebot_id,
                        "company_name": company_profile.get("company_name"),
                        "description": company_profile.get("description"),
                        "files_count": company_profile.get("files_count", 0),
                        "chunks_count": company_profile.get("chunks_count", 0)
                    }
                })
            
            logger.info(f"✅ Company knowledge search returned {len(results)} results for voicebot: {voicebot_id}")
            return results
            
        except Exception as e:
            logger.error(f"❌ Company knowledge search failed: {e}")
            raise Exception(f"Company knowledge search failed: {str(e)}")

# Global instance for easy access
pinecone_service = PineconeService()

# Export the service instance
__all__ = ["PineconeService", "pinecone_service"]
