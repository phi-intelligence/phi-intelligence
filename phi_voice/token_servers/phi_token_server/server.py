#!/usr/bin/env python3
"""
Phi Intelligence Token Server - Dedicated Token Generation Service
Updated to use Azure Key Vault for secure secret management
"""

import os
import time
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from dataclasses import dataclass

import jwt
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# ✅ ADD: Redis service import
from shared.redis_service import redis_service

# ✅ ADD: Key Vault service import
from shared.key_vault_service import key_vault_service

# Load environment variables (development fallback)
load_dotenv()
# Load unified environment file (development fallback - Azure Key Vault takes precedence)
try:
    load_dotenv("../.env", override=True)
except FileNotFoundError:
    pass  # .env file not required when using Azure Key Vault

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Phi Intelligence LiveKit Configuration - will be loaded from Key Vault
LIVEKIT_PHI_URL = None
LIVEKIT_PHI_API_KEY = None
LIVEKIT_PHI_API_SECRET = None

# Pydantic models
class TokenRequest(BaseModel):
    room_name: str = Field(..., description="Name of the room to join")
    participant_identity: str = Field(..., description="Unique identifier for the participant")
    participant_name: Optional[str] = Field(None, description="Display name for the participant")
    ttl_minutes: int = Field(15, ge=1, le=1440, description="Token validity in minutes (1-1440)")
    can_publish: bool = Field(True, description="Can participant publish audio/video")
    can_subscribe: bool = Field(True, description="Can participant subscribe to others")
    can_publish_data: bool = Field(True, description="Can participant publish data messages")
    can_update_metadata: bool = Field(True, description="Can participant update metadata")
    hidden: bool = Field(False, description="Is participant hidden from others")
    recorder: bool = Field(False, description="Is participant a recorder")
    agent: bool = Field(False, description="Is participant an agent")

class TokenResponse(BaseModel):
    token: str
    room_name: str
    participant_identity: str
    participant_name: str
    expires_at: datetime
    server_url: str
    permissions: Dict[str, bool]

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    livekit_url: str
    api_key_configured: bool

@dataclass
class PhiTokenConfig:
    """Configuration for Phi Intelligence token generation"""
    api_key: str
    api_secret: str
    livekit_url: str
    default_ttl_minutes: int = 15
    max_ttl_minutes: int = 1440

class PhiTokenServer:
    """Phi Intelligence dedicated token server with Key Vault integration"""
    
    def __init__(self):
        self.config = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize server with secrets from environment or Key Vault"""
        try:
            # Priority 1: Check environment variables (AWS deployment)
            self.livekit_api_key = os.getenv("LIVEKIT_PHI_API_KEY")
            self.livekit_api_secret = os.getenv("LIVEKIT_PHI_API_SECRET")
            self.livekit_url = os.getenv("LIVEKIT_PHI_URL")
            
            if all([self.livekit_api_key, self.livekit_api_secret, self.livekit_url]):
                logger.info("✅ Using LiveKit credentials from environment variables")
            else:
                # Priority 2: Try Azure Key Vault (for Azure deployments)
                logger.info("Environment variables not set, attempting Azure Key Vault...")
                self.livekit_api_key, self.livekit_api_secret, self.livekit_url = await key_vault_service.get_livekit_credentials('phi')
                logger.info("✅ Loaded credentials from Azure Key Vault")
            
            if not all([self.livekit_api_key, self.livekit_api_secret, self.livekit_url]):
                raise ValueError("Missing required LiveKit credentials (set LIVEKIT_PHI_* env vars or configure Key Vault)")
            
            self.config = PhiTokenConfig(
                api_key=self.livekit_api_key,
                api_secret=self.livekit_api_secret,
                livekit_url=self.livekit_url
            )
            
            self.initialized = True
            logger.info("✅ Phi Token Server initialized")
            logger.info(f"Phi Intelligence token server initialized for LiveKit URL: {self.livekit_url}")
            logger.info(f"API Key configured: {bool(self.livekit_api_key)}")
            logger.info(f"API Secret configured: {bool(self.livekit_api_secret)}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Phi Token Server: {e}")
            # Fallback to environment variables
            self.livekit_url = os.getenv("LIVEKIT_PHI_URL")
            self.livekit_api_key = os.getenv("LIVEKIT_PHI_API_KEY")
            self.livekit_api_secret = os.getenv("LIVEKIT_PHI_API_SECRET")
            
            if not all([self.livekit_api_key, self.livekit_api_secret, self.livekit_url]):
                raise ValueError("Missing required LiveKit credentials from Key Vault and environment")
            
            self.config = PhiTokenConfig(
                api_key=self.livekit_api_key,
                api_secret=self.livekit_api_secret,
                livekit_url=self.livekit_url
            )
            
            self.initialized = True
            logger.warning("⚠️ Using environment variables as fallback")
    
    def generate_token(self, request: TokenRequest) -> TokenResponse:
        """Generate a LiveKit access token for Phi Intelligence"""
        if not self.initialized:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token server not initialized"
            )
        
        try:
            # Validate TTL
            ttl_minutes = min(request.ttl_minutes, self.config.max_ttl_minutes)
            
            # Calculate expiration using timezone-aware datetime
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(minutes=ttl_minutes)
            
            # Create JWT payload EXACTLY as LiveKit expects
            payload = {
                # Standard JWT fields
                "iss": self.config.api_key,                    # Issuer (API key)
                "sub": request.participant_identity,            # Subject (participant identity) - FIXED!
                "nbf": int(now.timestamp()),                    # Not before (current time)
                "exp": int(expires_at.timestamp()),             # Expiration (current + TTL)
                "iat": int(now.timestamp()),                    # Issued at (current time)
                
                # LiveKit specific claims
                "identity": request.participant_identity,       # Participant identity - ADDED!
                "name": request.participant_name or request.participant_identity,  # Participant name
                
                # Video grants - EXACT LiveKit structure
                "video": {
                    "room": request.room_name,                  # Room name
                    "roomJoin": True,                           # Can join room
                    "canPublish": request.can_publish,          # Can publish audio/video
                    "canSubscribe": request.can_subscribe,      # Can subscribe to others
                    "canPublishData": request.can_publish_data, # Can publish data messages
                    "canUpdateOwnMetadata": request.can_update_metadata,  # Can update own metadata - FIXED!
                    "hidden": request.hidden,                   # Is participant hidden
                    "recorder": request.recorder,               # Is participant a recorder
                    "agent": request.agent                      # Is participant an agent
                }
            }
            
            # Add Phi Intelligence specific metadata to video grants
            payload["video"]["metadata"] = {
                "mode": "phi",
                "company_name": "Phi Intelligence",
                "agent_type": "phi_general",  # Updated to match agent validation
                "generated_at": now.isoformat(),
                "capabilities": ["voice", "real_time", "ai_assistant"]
            }
            
            # Generate JWT token using Phi Intelligence secret
            token = jwt.encode(
                payload,
                self.config.api_secret,
                algorithm="HS256"
            )
            
            # Create response
            response = TokenResponse(
                token=token,
                room_name=request.room_name,
                participant_identity=request.participant_identity,
                participant_name=request.participant_name or request.participant_identity,
                expires_at=expires_at,
                server_url=self.config.livekit_url,
                permissions={
                    "can_publish": request.can_publish,
                    "can_subscribe": request.can_subscribe,
                    "can_publish_data": request.can_publish_data,
                    "can_update_metadata": request.can_update_metadata,
                    "hidden": request.hidden,
                    "recorder": request.recorder,
                    "agent": request.agent,
                }
            )
            
            logger.info(
                f"Generated Phi Intelligence token for {request.participant_identity} "
                f"in room {request.room_name}, expires at {expires_at}, "
                f"server: {self.config.livekit_url}"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating Phi Intelligence token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate token: {str(e)}"
            )
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate and decode a Phi Intelligence token"""
        try:
            # Decode without verification first to get header
            header = jwt.get_unverified_header(token)
            logger.info(f"Token header: {header}")
            
            # Decode with verification using Phi Intelligence secret
            payload = jwt.decode(
                token,
                self.config.api_secret,
                algorithms=["HS256"]
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}"
            )

# Initialize Phi Intelligence token server
phi_token_server = PhiTokenServer()

# FastAPI app
app = FastAPI(
    title="Phi Intelligence Token Server",
    description="Dedicated token generation server for Phi Intelligence voice agent",
    version="1.0.0"
)

# ✅ NEW: Redis initialization on startup
@app.on_event("startup")
async def startup_event():
    """Initialize Redis and Key Vault on startup"""
    try:
        await redis_service.initialize()
        logger.info("✅ Redis service initialized for token caching")
    except Exception as e:
        logger.warning(f"⚠️ Redis initialization failed: {e}")
        # Continue without Redis - token generation unaffected
    
    # Initialize Key Vault
    await phi_token_server.initialize()

# CORS middleware for Phi Intelligence frontend - Production configuration
# Get allowed origins from environment variable or use secure defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []

# Add development origins only if not in production
if os.getenv("NODE_ENV") != "production":
    ALLOWED_ORIGINS.extend([
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "https://127.0.0.1:3000",
        "http://localhost:5000",
        "https://localhost:5000",
        "http://127.0.0.1:5000",
        "https://127.0.0.1:5000"
    ])

# Filter out empty strings
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom CORS middleware to ensure headers are always present
@app.middleware("http")
async def add_cors_headers(request, call_next):
    """Ensure CORS headers are always present on responses"""
    response = await call_next(request)
    
    # Get the origin from the request
    origin = request.headers.get("origin")
    
    # Check if origin is in our allowed origins
    # Use the same allowed origins configuration
    
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Phi Intelligence token server"""
    keyvault_status = await key_vault_service.test_connection()
    
    return HealthResponse(
        status="healthy" if phi_token_server.initialized else "unhealthy",
        timestamp=datetime.now(timezone.utc),
        livekit_url=phi_token_server.livekit_url if phi_token_server.initialized else None,
        api_key_configured=bool(phi_token_server.livekit_api_key if phi_token_server.initialized else None)
    )

@app.get("/config")
async def get_config():
    """Get Phi Intelligence configuration status"""
    return {
        "phi_livekit": {
            "url": phi_token_server.livekit_url if phi_token_server.initialized else None,
            "api_key_configured": bool(phi_token_server.livekit_api_key if phi_token_server.initialized else None),
            "api_secret_configured": bool(phi_token_server.livekit_api_secret if phi_token_server.initialized else None)
        },
        "service_type": "phi_intelligence_only",
        "capabilities": ["token_generation", "token_validation"],
        "modes_supported": ["phi_only"],
        "keyvault_integration": True
    }

@app.post("/token", response_model=TokenResponse)
async def create_token(request: TokenRequest):
    """Generate a LiveKit access token for Phi Intelligence voice agent"""
    # ✅ NEW: Check Redis cache first (if available)
    if redis_service.is_available():
        try:
            # Check rate limiting
            rate_limit = await redis_service.check_rate_limit(
                identifier=request.participant_identity,
                endpoint="token_generation",
                limit=100,  # 100 tokens per hour
                window=3600
            )
            
            if not rate_limit["allowed"]:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Try again in {rate_limit['reset_time']} seconds"
                )
                
        except Exception as e:
            logger.warning(f"⚠️ Redis rate limiting failed: {e}")
            # Continue without rate limiting - token generation unaffected
    
    # ✅ EXISTING: Generate token (unchanged)
    response = phi_token_server.generate_token(request)
    
    # ✅ NEW: Cache token validation (if Redis available)
    if redis_service.is_available():
        try:
            asyncio.create_task(
                redis_service.cache_token_validation(
                    token=response.token,
                    validation_result={"valid": True, "permissions": response.permissions},
                    ttl=300  # 5 minutes
                )
            )
        except Exception as e:
            logger.warning(f"⚠️ Redis token caching failed: {e}")
            # Token generation successful - caching failure doesn't affect functionality
    
    return response

@app.post("/token/validate")
async def validate_token(request: dict):
    """Validate and decode a Phi Intelligence token"""
    token = request.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required in request body"
        )
    return phi_token_server.validate_token(token)

@app.get("/token/quick")
async def quick_token(
    room_name: str = "phi_room_",
    participant_identity: str = None,
    participant_name: str = None
):
    """Quick token generation with Phi Intelligence defaults"""
    if not participant_identity:
        participant_identity = f"phi_user_{int(time.time())}"
    
    request = TokenRequest(
        room_name=room_name,
        participant_identity=participant_identity,
        participant_name=participant_name,
        ttl_minutes=15
    )
    
    return phi_token_server.generate_token(request)

# CORS Preflight handlers
@app.options("/{full_path:path}")
async def cors_preflight(full_path: str):
    """Handle CORS preflight requests for all endpoints"""
    return {"message": "CORS preflight"}

@app.get("/")
async def root():
    """Root endpoint with Phi Intelligence usage information"""
    return {
        "message": "Phi Intelligence Token Server - Dedicated Service",
        "version": "1.0.0",
        "service_type": "phi_intelligence_only",
        "description": "Token generation service exclusively for Phi Intelligence voice agent",
        "endpoints": {
            "POST /token": "Generate a custom token for Phi Intelligence",
            "GET /token/quick": "Generate a quick token with defaults",
            "POST /token/validate": "Validate and decode a token",
            "GET /health": "Health check",
            "GET /config": "Configuration status"
        },
        "usage": {
            "example_request": {
                "room_name": "phi_room_",
                "participant_identity": "user123",
                "participant_name": "John Doe",
                "ttl_minutes": 15
            }
        },
        "note": "This server only supports Phi Intelligence mode. For company voicebots, use the separate company token server."
    }

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Phi Intelligence Token Server...")
    logger.info("Token server ready to handle Phi Intelligence voice agent requests")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,  # Different port to avoid conflicts
        log_level="info"
    )
