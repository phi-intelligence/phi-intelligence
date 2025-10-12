#!/usr/bin/env python3
"""
Redis Service for PHI Voice Application

Purpose:
- Centralized Redis management for all voice services
- Session persistence and state management
- Token caching and validation
- Real-time metrics aggregation
- Rate limiting and API protection
- LiveKit room state persistence

Features:
- Connection pooling and health monitoring
- Automatic reconnection handling
- Structured data storage patterns
- Performance optimization
"""

import os
import json
import logging
import asyncio
import time
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict

# Redis imports
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logging.warning("⚠️ Redis client not installed. Install with: pip install redis")

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class RedisConfig:
    """Redis configuration settings"""
    host: str = os.getenv("REDIS_HOST", "localhost")
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    ssl: bool = False
    max_connections: int = 20
    retry_on_timeout: bool = True
    health_check_interval: int = 30
    key_prefix: str = "phi_voice"

class RedisService:
    """Centralized Redis service for PHI Voice application"""
    
    def __init__(self, config: Optional[RedisConfig] = None):
        """Initialize Redis service"""
        self.config = config or RedisConfig()
        self.client = None
        self._initialized = False
        self._health_check_task = None
        
        # Load config from environment variables
        self._load_env_config()
        
        logger.info(f"🔍 Redis config check:")
        logger.info(f"   Host: {self.config.host}:{self.config.port}")
        logger.info(f"   Database: {self.config.db}")
        logger.info(f"   SSL: {self.config.ssl}")
        logger.info(f"   Key Prefix: {self.config.key_prefix}")
        logger.info(f"   REDIS_AVAILABLE: {REDIS_AVAILABLE}")
        
        if not REDIS_AVAILABLE:
            logger.warning("⚠️ Redis client not available - Redis functionality will be limited")
            return
    
    def _load_env_config(self):
        """Load Redis configuration from environment variables"""
        # ✅ PRODUCTION: Validate required Redis environment variables
        if os.getenv("REDIS_HOST"):
            self.config.host = os.getenv("REDIS_HOST")
        if os.getenv("REDIS_PORT"):
            self.config.port = int(os.getenv("REDIS_PORT"))
        if os.getenv("REDIS_DB"):
            self.config.db = int(os.getenv("REDIS_DB"))
        if os.getenv("REDIS_PASSWORD"):
            self.config.password = os.getenv("REDIS_PASSWORD")
        if os.getenv("REDIS_SSL"):
            self.config.ssl = os.getenv("REDIS_SSL", "false").lower() == "true"
        if os.getenv("REDIS_MAX_CONNECTIONS"):
            self.config.max_connections = int(os.getenv("REDIS_MAX_CONNECTIONS"))
        if os.getenv("REDIS_KEY_PREFIX"):
            self.config.key_prefix = os.getenv("REDIS_KEY_PREFIX")
    
    async def initialize(self) -> bool:
        """Initialize Redis connection"""
        if not REDIS_AVAILABLE:
            logger.warning("⚠️ Redis not available, skipping initialization")
            return False
        
        try:
            # Create Redis connection pool
            self.client = redis.Redis(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                ssl=self.config.ssl,
                max_connections=self.config.max_connections,
                decode_responses=True
            )
            
            # Test connection
            await self.client.ping()
            
            self._initialized = True
            logger.info("✅ Redis service initialized successfully")
            
            # Start health check task
            self._start_health_check()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis initialization failed: {e}")
            self.client = None
            self._initialized = False
            return False
    
    def _start_health_check(self):
        """Start periodic health check task"""
        if self._health_check_task:
            self._health_check_task.cancel()
        
        self._health_check_task = asyncio.create_task(self._health_check_loop())
    
    async def _health_check_loop(self):
        """Periodic health check loop"""
        while self._initialized:
            try:
                await asyncio.sleep(self.config.health_check_interval)
                await self.health_check()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Health check failed: {e}")
    
    def _get_key(self, *parts: str) -> str:
        """Generate Redis key with prefix"""
        return f"{self.config.key_prefix}:{':'.join(parts)}"
    
    def is_available(self) -> bool:
        """Check if Redis service is available"""
        return self._initialized and self.client is not None
    
    # 🎯 SESSION MANAGEMENT METHODS
    
    async def store_voice_session(self, session_id: str, session_data: Dict[str, Any]) -> bool:
        """Store voice session data in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("session", session_id)
            # Store session data with expiration (24 hours)
            await self.client.hset(key, mapping=session_data)
            await self.client.expire(key, 86400)
            
            # Add to active sessions set
            await self.client.sadd(self._get_key("sessions", "active"), session_id)
            
            logger.debug(f"✅ Voice session stored: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store voice session {session_id}: {e}")
            return False
    
    async def get_voice_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve voice session data from Redis"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("session", session_id)
            session_data = await self.client.hgetall(key)
            
            if session_data:
                logger.debug(f"✅ Voice session retrieved: {session_id}")
                return session_data
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve voice session {session_id}: {e}")
            return None
    
    async def update_voice_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update voice session data in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("session", session_id)
            await self.client.hset(key, mapping=updates)
            
            logger.debug(f"✅ Voice session updated: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update voice session {session_id}: {e}")
            return False
    
    async def end_voice_session(self, session_id: str) -> bool:
        """Mark voice session as ended"""
        if not self.is_available():
            return False
        
        try:
            # Update session status
            await self.update_voice_session(session_id, {
                "status": "ended",
                "end_time": datetime.now(timezone.utc).isoformat()
            })
            
            # Remove from active sessions
            await self.client.srem(self._get_key("sessions", "active"), session_id)
            
            # Add to ended sessions
            await self.client.sadd(self._get_key("sessions", "ended"), session_id)
            
            logger.debug(f"✅ Voice session ended: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to end voice session {session_id}: {e}")
            return False
    
    async def get_active_sessions(self) -> List[str]:
        """Get list of active session IDs"""
        if not self.is_available():
            return []
        
        try:
            active_sessions = await self.client.smembers(self._get_key("sessions", "active"))
            return list(active_sessions)
        except Exception as e:
            logger.error(f"❌ Failed to get active sessions: {e}")
            return []
    
    # 🔑 TOKEN CACHING METHODS
    
    async def cache_token_validation(self, token: str, validation_result: Dict[str, Any], ttl: int = 300) -> bool:
        """Cache token validation result"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("token", "valid", token)
            await self.client.setex(key, ttl, json.dumps(validation_result))
            
            logger.debug(f"✅ Token validation cached: {token[:20]}...")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cache token validation: {e}")
            return False
    
    async def get_cached_token_validation(self, token: str) -> Optional[Dict[str, Any]]:
        """Get cached token validation result"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("token", "valid", token)
            cached_result = await self.client.get(key)
            
            if cached_result:
                logger.debug(f"✅ Token validation cache hit: {token[:20]}...")
                return json.loads(cached_result)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get cached token validation: {e}")
            return None
    
    async def invalidate_token_cache(self, token: str) -> bool:
        """Invalidate cached token validation"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("token", "valid", token)
            await self.client.delete(key)
            
            logger.debug(f"✅ Token cache invalidated: {token[:20]}...")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to invalidate token cache: {e}")
            return False
    
    # 📊 METRICS AGGREGATION METHODS
    
    async def track_voice_metric(self, voicebot_id: str, metric: str, value: float) -> bool:
        """Track voice metric in Redis for real-time aggregation"""
        if not self.is_available():
            return False
        
        try:
            timestamp = int(time.time())
            
            # Increment counter
            counter_key = self._get_key("metrics", voicebot_id, metric, "count")
            await self.client.incr(counter_key)
            
            # Store latest value
            latest_key = self._get_key("metrics", voicebot_id, metric, "latest")
            await self.client.set(latest_key, value)
            
            # Add to time series (last 24 hours)
            series_key = self._get_key("metrics", voicebot_id, metric, "series")
            await self.client.zadd(series_key, {str(timestamp): value})
            
            # Keep only last 24 hours
            cutoff = timestamp - 86400
            await self.client.zremrangebyscore(series_key, 0, cutoff)
            
            # Set expiration on series key
            await self.client.expire(series_key, 86400)
            
            logger.debug(f"✅ Metric tracked: {voicebot_id}:{metric} = {value}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to track metric {voicebot_id}:{metric}: {e}")
            return False
    
    async def get_voice_metrics(self, voicebot_id: str, metric: str, hours: int = 24) -> Dict[str, Any]:
        """Get aggregated voice metrics for a specific voicebot and metric"""
        if not self.is_available():
            return {"error": "Redis not available"}
        
        try:
            timestamp = int(time.time())
            cutoff = timestamp - (hours * 3600)
            
            series_key = self._get_key("metrics", voicebot_id, metric, "series")
            
            # Get data points within time range
            data_points = await self.client.zrangebyscore(
                series_key, cutoff, timestamp, withscores=True
            )
            
            if not data_points:
                return {
                    "voicebot_id": voicebot_id,
                    "metric": metric,
                    "count": 0,
                    "average": 0,
                    "min": 0,
                    "max": 0,
                    "data_points": []
                }
            
            # Calculate statistics
            values = [float(score) for _, score in data_points]
            count = len(values)
            average = sum(values) / count if count > 0 else 0
            min_val = min(values) if values else 0
            max_val = max(values) if values else 0
            
            # Format data points for time series
            formatted_points = []
            for timestamp_str, score in data_points:
                formatted_points.append({
                    "timestamp": int(timestamp_str),
                    "value": float(score)
                })
            
            return {
                "voicebot_id": voicebot_id,
                "metric": metric,
                "count": count,
                "average": round(average, 2),
                "min": round(min_val, 2),
                "max": round(max_val, 2),
                "data_points": formatted_points
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get metrics {voicebot_id}:{metric}: {e}")
            return {"error": str(e)}
    
    # 🚦 RATE LIMITING METHODS
    
    async def check_rate_limit(self, identifier: str, endpoint: str, limit: int, window: int = 3600) -> Dict[str, Any]:
        """Check rate limit for API endpoint"""
        if not self.is_available():
            return {"allowed": True, "remaining": limit, "reset_time": None}
        
        try:
            key = self._get_key("rate_limit", identifier, endpoint)
            current = await self.client.incr(key)
            
            # Set expiration on first request
            if current == 1:
                await self.client.expire(key, window)
            
            # Calculate remaining requests
            remaining = max(0, limit - current)
            allowed = current <= limit
            
            # Get TTL for reset time
            ttl = await self.client.ttl(key)
            reset_time = int(time.time()) + ttl if ttl > 0 else None
            
            return {
                "allowed": allowed,
                "current": current,
                "remaining": remaining,
                "limit": limit,
                "reset_time": reset_time
            }
            
        except Exception as e:
            logger.error(f"❌ Rate limit check failed: {e}")
            return {"allowed": True, "remaining": limit, "reset_time": None}
    
    # 🔄 ROOM STATE PERSISTENCE METHODS
    
    async def store_room_config(self, room_name: str, config: Dict[str, Any]) -> bool:
        """Store LiveKit room configuration in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("room", "config", room_name)
            await self.client.hset(key, mapping=config)
            await self.client.expire(key, 86400)  # 24 hours
            
            logger.debug(f"✅ Room config stored: {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to store room config {room_name}: {e}")
            return False
    
    async def get_room_config(self, room_name: str) -> Optional[Dict[str, Any]]:
        """Retrieve LiveKit room configuration from Redis"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("room", "config", room_name)
            config = await self.client.hgetall(key)
            
            if config:
                logger.debug(f"✅ Room config retrieved: {room_name}")
                return config
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve room config {room_name}: {e}")
            return None
    
    async def update_room_config(self, room_name: str, updates: Dict[str, Any]) -> bool:
        """Update LiveKit room configuration in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("room", "config", room_name)
            await self.client.hset(key, mapping=updates)
            
            logger.debug(f"✅ Room config updated: {room_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update room config {room_name}: {e}")
            return False

    # 🏢 COMPANY PROFILE CACHING METHODS
    
    async def cache_company_profile(self, voicebot_id: str, profile_data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Cache company profile data in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("company", "profile", voicebot_id)
            
            # Validate profile data before caching
            if not await self._validate_company_profile(profile_data):
                logger.warning(f"⚠️ Invalid company profile data for {voicebot_id}")
                return False
            
            # Store profile data with expiration
            await self.client.setex(key, ttl, json.dumps(profile_data))
            
            logger.debug(f"✅ Company profile cached: {voicebot_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cache company profile {voicebot_id}: {e}")
            return False
    
    async def get_cached_company_profile(self, voicebot_id: str) -> Optional[Dict[str, Any]]:
        """Get cached company profile from Redis"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("company", "profile", voicebot_id)
            cached_profile = await self.client.get(key)
            
            if cached_profile:
                profile_data = json.loads(cached_profile)
                
                # Validate cached data
                if await self._validate_company_profile(profile_data):
                    logger.debug(f"✅ Company profile cache hit: {voicebot_id}")
                    return profile_data
                else:
                    # Invalid cached data, remove it
                    await self.client.delete(key)
                    logger.warning(f"⚠️ Invalid cached company profile removed: {voicebot_id}")
                    return None
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get cached company profile {voicebot_id}: {e}")
            return None
    
    async def _validate_company_profile(self, profile_data: Dict[str, Any]) -> bool:
        """Validate company profile data structure"""
        try:
            required_fields = ["company_name", "description", "status"]
            
            # Check required fields exist
            for field in required_fields:
                if field not in profile_data:
                    return False
            
            # Check data types and content
            if not isinstance(profile_data.get("company_name"), str) or len(profile_data["company_name"]) < 1:
                return False
            
            if not isinstance(profile_data.get("description"), str) or len(profile_data["description"]) < 1:
                return False
            
            if not isinstance(profile_data.get("status"), str) or profile_data["status"] not in ["active", "draft", "inactive"]:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Company profile validation failed: {e}")
            return False

    # 🔍 RAG SEARCH RESULT CACHING METHODS
    
    async def cache_rag_results(self, cache_key: str, results: str, ttl: int = 1800) -> bool:
        """Cache RAG search results in Redis"""
        if not self.is_available():
            return False
        
        try:
            # Validate results before caching
            if not await self._validate_rag_results(results):
                logger.warning(f"⚠️ Invalid RAG results for caching: {cache_key[:20]}...")
                return False
            
            key = self._get_key("rag", "results", cache_key)
            await self.client.setex(key, ttl, results)
            
            logger.debug(f"✅ RAG results cached: {cache_key[:20]}...")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cache RAG results {cache_key[:20]}...: {e}")
            return False
    
    async def get_cached_rag_results(self, cache_key: str) -> Optional[str]:
        """Get cached RAG search results from Redis"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("rag", "results", cache_key)
            cached_results = await self.client.get(key)
            
            if cached_results:
                # Validate cached results
                if await self._validate_rag_results(cached_results):
                    logger.debug(f"✅ RAG results cache hit: {cache_key[:20]}...")
                    return cached_results
                else:
                    # Invalid cached data, remove it
                    await self.client.delete(key)
                    logger.warning(f"⚠️ Invalid cached RAG results removed: {cache_key[:20]}...")
                    return None
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get cached RAG results {cache_key[:20]}...: {e}")
            return None
    
    async def _validate_rag_results(self, results: str) -> bool:
        """Validate RAG search results data"""
        try:
            # Check if results is a valid string
            if not isinstance(results, str):
                return False
            
            # Check minimum content length
            if len(results) < 10:
                return False
            
            # Check if results contain meaningful content (not just whitespace)
            if not results.strip():
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ RAG results validation failed: {e}")
            return False

    # 📁 FILE METADATA CACHING METHODS
    
    async def cache_company_files(self, voicebot_id: str, files: List[Dict], ttl: int = 3600) -> bool:
        """Cache company file metadata in Redis"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("company", "files", voicebot_id)
            
            # Validate files data before caching
            if not isinstance(files, list):
                logger.warning(f"⚠️ Invalid files data type for {voicebot_id}")
                return False
            
            # Store files data with expiration
            await self.client.setex(key, ttl, json.dumps(files))
            
            logger.debug(f"✅ Company files cached: {voicebot_id} ({len(files)} files)")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cache company files {voicebot_id}: {e}")
            return False
    
    async def get_cached_company_files(self, voicebot_id: str) -> Optional[List[Dict]]:
        """Get cached company file metadata from Redis"""
        if not self.is_available():
            return None
        
        try:
            key = self._get_key("company", "files", voicebot_id)
            cached_files = await self.client.get(key)
            
            if cached_files:
                files_data = json.loads(cached_files)
                
                # Validate cached data
                if isinstance(files_data, list):
                    logger.debug(f"✅ Company files cache hit: {voicebot_id} ({len(files_data)} files)")
                    return files_data
                else:
                    # Invalid cached data, remove it
                    await self.client.delete(key)
                    logger.warning(f"⚠️ Invalid cached company files removed: {voicebot_id}")
                    return None
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get cached company files {voicebot_id}: {e}")
            return None

    # 🗑️ CACHE INVALIDATION METHODS
    
    async def invalidate_company_cache(self, voicebot_id: str) -> bool:
        """Invalidate all company-related cache for a voicebot"""
        if not self.is_available():
            return False
        
        try:
            # Get all company-related keys for this voicebot
            company_keys = await self.client.keys(self._get_key("company", "*", voicebot_id))
            rag_keys = await self.client.keys(self._get_key("rag", "*", voicebot_id))
            
            # Delete all related keys
            keys_to_delete = company_keys + rag_keys
            if keys_to_delete:
                await self.client.delete(*keys_to_delete)
                logger.info(f"✅ Company cache invalidated: {voicebot_id} ({len(keys_to_delete)} keys)")
            else:
                logger.debug(f"ℹ️ No company cache to invalidate: {voicebot_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to invalidate company cache {voicebot_id}: {e}")
            return False
    
    async def invalidate_file_cache(self, voicebot_id: str) -> bool:
        """Invalidate file metadata cache for a voicebot"""
        if not self.is_available():
            return False
        
        try:
            key = self._get_key("company", "files", voicebot_id)
            deleted = await self.client.delete(key)
            
            if deleted:
                logger.info(f"✅ File cache invalidated: {voicebot_id}")
            else:
                logger.debug(f"ℹ️ No file cache to invalidate: {voicebot_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to invalidate file cache {voicebot_id}: {e}")
            return False
    
    async def invalidate_rag_cache(self, voicebot_id: str) -> bool:
        """Invalidate RAG search cache for a voicebot"""
        if not self.is_available():
            return False
        
        try:
            # Get all RAG-related keys for this voicebot
            rag_keys = await self.client.keys(self._get_key("rag", "*", voicebot_id))
            
            if rag_keys:
                await self.client.delete(*rag_keys)
                logger.info(f"✅ RAG cache invalidated: {voicebot_id} ({len(rag_keys)} keys)")
            else:
                logger.debug(f"ℹ️ No RAG cache to invalidate: {voicebot_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to invalidate RAG cache {voicebot_id}: {e}")
            return False

    # 📊 CACHE PERFORMANCE TRACKING METHODS
    
    async def track_cache_hit(self, cache_type: str, voicebot_id: str) -> None:
        """Track cache hit for performance monitoring"""
        if not self.is_available():
            return
        
        try:
            key = self._get_key("cache", "hits", cache_type, voicebot_id)
            await self.client.incr(key)
            await self.client.expire(key, 86400)  # 24 hours
            
        except Exception as e:
            logger.debug(f"Cache hit tracking failed: {e}")
    
    async def track_cache_miss(self, cache_type: str, voicebot_id: str) -> None:
        """Track cache miss for performance monitoring"""
        if not self.is_available():
            return
        
        try:
            key = self._get_key("cache", "misses", cache_type, voicebot_id)
            await self.client.incr(key)
            await self.client.expire(key, 86400)  # 24 hours
            
        except Exception as e:
            logger.debug(f"Cache miss tracking failed: {e}")
    
    async def get_cache_performance_stats(self, voicebot_id: str, hours: int = 24) -> Dict[str, Any]:
        """Get cache performance statistics for a voicebot"""
        if not self.is_available():
            return {"error": "Redis not available"}
        
        try:
            cache_types = ["company_profile", "rag_results", "company_files"]
            stats = {}
            
            for cache_type in cache_types:
                hits_key = self._get_key("cache", "hits", cache_type, voicebot_id)
                misses_key = self._get_key("cache", "misses", cache_type, voicebot_id)
                
                hits = int(await self.client.get(hits_key) or 0)
                misses = int(await self.client.get(misses_key) or 0)
                total = hits + misses
                
                hit_rate = (hits / total * 100) if total > 0 else 0
                
                stats[cache_type] = {
                    "hits": hits,
                    "misses": misses,
                    "total": total,
                    "hit_rate": round(hit_rate, 2)
                }
            
            return {
                "voicebot_id": voicebot_id,
                "time_range_hours": hours,
                "cache_stats": stats,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get cache performance stats {voicebot_id}: {e}")
            return {"error": str(e)}
    
    async def get_cache_health(self) -> Dict[str, Any]:
        """Get overall cache health status"""
        if not self.is_available():
            return {"status": "unhealthy", "message": "Redis not available"}
        
        try:
            # Get cache statistics
            total_keys = await self.client.dbsize()
            
            # Get memory usage
            info = await self.client.info()
            used_memory = info.get("used_memory_human", "unknown")
            
            # Get cache performance overview
            cache_keys = await self.client.keys(self._get_key("cache", "*"))
            company_keys = await self.client.keys(self._get_key("company", "*"))
            rag_keys = await self.client.keys(self._get_key("rag", "*"))
            
            return {
                "status": "healthy",
                "total_keys": total_keys,
                "used_memory": used_memory,
                "cache_keys": len(cache_keys),
                "company_keys": len(company_keys),
                "rag_keys": len(rag_keys),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Cache health check failed: {e}")
            return {"error": str(e)}
    
    # 🧹 CLEANUP METHODS
    
    async def cleanup_expired_cache(self) -> int:
        """Clean up expired cache entries"""
        if not self.is_available():
            return 0
        
        try:
            cleaned_count = 0
            
            # Get all cache keys
            cache_patterns = [
                self._get_key("company", "*"),
                self._get_key("rag", "*"),
                self._get_key("cache", "*")
            ]
            
            for pattern in cache_patterns:
                keys = await self.client.keys(pattern)
                for key in keys:
                    # Check if key has expired (TTL <= 0)
                    ttl = await self.client.ttl(key)
                    if ttl <= 0:
                        await self.client.delete(key)
                        cleaned_count += 1
            
            if cleaned_count > 0:
                logger.info(f"✅ Cleaned up {cleaned_count} expired cache entries")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"❌ Cache cleanup failed: {e}")
            return 0

    # 🧹 GENERAL CLEANUP METHODS
    
    async def cleanup_expired_data(self) -> Dict[str, int]:
        """Clean up expired data from Redis (legacy method)"""
        if not self.is_available():
            return {"cleaned": 0}
        
        try:
            cleaned_count = 0
            
            # Clean up expired sessions
            expired_sessions = await self.client.keys(self._get_key("session", "*"))
            for session_key in expired_sessions:
                if not await self.client.exists(session_key):
                    await self.client.delete(session_key)
                    cleaned_count += 1
            
            # Clean up expired metrics
            expired_metrics = await self.client.keys(self._get_key("metrics", "*", "*", "series"))
            for metric_key in expired_metrics:
                if not await self.client.exists(metric_key):
                    await self.client.delete(metric_key)
                    cleaned_count += 1
            
            logger.info(f"✅ Cleaned up {cleaned_count} expired Redis keys")
            return {"cleaned": cleaned_count}
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
            return {"cleaned": 0}
    
    # 🏥 HEALTH CHECK METHODS
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Redis service health"""
        if not self.is_available():
            return {
                "status": "unhealthy",
                "service": "redis",
                "message": "Service not available",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        try:
            # Test basic operations
            test_key = self._get_key("health", "test")
            await self.client.set(test_key, "test_value", ex=10)
            test_value = await self.client.get(test_key)
            await self.client.delete(test_key)
            
            if test_value != "test_value":
                raise Exception("Basic Redis operations failed")
            
            # Get Redis info
            info = await self.client.info()
            
            return {
                "status": "healthy",
                "service": "redis",
                "host": self.config.host,
                "port": self.config.port,
                "database": self.config.db,
                "connected_clients": info.get("connected_clients", 0),
                "used_memory_human": info.get("used_memory_human", "unknown"),
                "uptime_in_seconds": info.get("uptime_in_seconds", 0),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Redis health check failed: {e}")
            return {
                "status": "unhealthy",
                "service": "redis",
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    async def close(self):
        """Close Redis connections"""
        if self.client:
            await self.client.aclose()
            logger.info("✅ Redis service connections closed")
        
        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass

# Global Redis service instance
redis_service = RedisService()

# Cleanup on application shutdown
import atexit
def cleanup_redis():
    try:
        if redis_service.client:
            # Create new event loop for cleanup
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(redis_service.close())
            loop.close()
    except Exception:
        pass  # Ignore cleanup errors

atexit.register(cleanup_redis)

if __name__ == "__main__":
    """Test the Redis service"""
    async def test_redis():
        # Test initialization
        success = await redis_service.initialize()
        print(f"Redis initialization: {'✅ Success' if success else '❌ Failed'}")
        
        if success:
            # Test health check
            health = await redis_service.health_check()
            print(f"Health check: {health}")
            
            # Test session storage
            session_data = {
                "voicebot_id": "test_voicebot",
                "company_name": "Test Company",
                "room_name": "test_room",
                "start_time": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            }
            
            stored = await redis_service.store_voice_session("test_session", session_data)
            print(f"Session storage: {'✅ Success' if stored else '❌ Failed'}")
            
            # Test session retrieval
            retrieved = await redis_service.get_voice_session("test_session")
            print(f"Session retrieval: {'✅ Success' if retrieved else '❌ Failed'}")
            
            # Test metrics tracking
            tracked = await redis_service.track_voice_metric("test_voicebot", "response_time", 150.5)
            print(f"Metrics tracking: {'✅ Success' if tracked else '❌ Failed'}")
            
            # Test rate limiting
            rate_limit = await redis_service.check_rate_limit("test_user", "voice_api", 100)
            print(f"Rate limiting: {rate_limit}")
            
            # Close service
            await redis_service.close()
    
    # Run test
    asyncio.run(test_redis())
