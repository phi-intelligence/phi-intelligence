#!/usr/bin/env python3
"""
Hotel Token Server - Dedicated Token Generation Service
This server generates access tokens exclusively for Hotel Receptionist AI.
Simplified version following the same pattern as phi_token_server.
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

# Azure Key Vault removed - using environment variables for AWS deployment

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

# Hotel Receptionist LiveKit Configuration
LIVEKIT_HOTEL_URL = os.getenv("LIVEKIT_HOTEL_URL", "wss://hotel-template-juiuz1pt.livekit.cloud")
LIVEKIT_HOTEL_API_KEY = os.getenv("LIVEKIT_HOTEL_API_KEY", "APIx8PeBZgw8hHP")
LIVEKIT_HOTEL_API_SECRET = os.getenv("LIVEKIT_HOTEL_API_SECRET", "grxUsSRQFplOR2hTGy0cJ29xUdGE7fEXwFBmfNvulPq")

# Validate required environment variables
if not all([LIVEKIT_HOTEL_API_KEY, LIVEKIT_HOTEL_API_SECRET, LIVEKIT_HOTEL_URL]):
    raise ValueError(
        "Missing required Hotel environment variables: "
        "LIVEKIT_HOTEL_API_KEY, LIVEKIT_HOTEL_API_SECRET, LIVEKIT_HOTEL_URL"
    )

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
class HotelTokenConfig:
    """Configuration for Hotel Receptionist token generation"""
    api_key: str
    api_secret: str
    livekit_url: str
    default_ttl_minutes: int = 15
    max_ttl_minutes: int = 1440

class HotelTokenServer:
    """Hotel Receptionist dedicated token server"""
    
    def __init__(self, config: HotelTokenConfig):
        self.config = config
        logger.info(f"Hotel token server initialized for LiveKit URL: {config.livekit_url}")
        logger.info(f"API Key configured: {bool(config.api_key)}")
        logger.info(f"API Secret configured: {bool(config.api_secret)}")
    
    def generate_token(self, request: TokenRequest) -> TokenResponse:
        """Generate a LiveKit access token for Hotel Receptionist"""
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
                "sub": request.participant_identity,            # Subject (participant identity)
                "nbf": int(now.timestamp()),                    # Not before (current time)
                "exp": int(expires_at.timestamp()),             # Expiration (current + TTL)
                "iat": int(now.timestamp()),                    # Issued at (current time)
                
                # LiveKit specific claims
                "identity": request.participant_identity,       # Participant identity
                "name": request.participant_name or request.participant_identity,  # Participant name
                
                # Video grants - EXACT LiveKit structure
                "video": {
                    "room": request.room_name,                  # Room name
                    "roomJoin": True,                           # Can join room
                    "canPublish": request.can_publish,          # Can publish audio/video
                    "canSubscribe": request.can_subscribe,      # Can subscribe to others
                    "canPublishData": request.can_publish_data, # Can publish data messages
                    "canUpdateOwnMetadata": request.can_update_metadata,  # Can update own metadata
                    "hidden": request.hidden,                   # Is participant hidden
                    "recorder": request.recorder,               # Is participant a recorder
                    "agent": request.agent                      # Is participant an agent
                }
            }
            
            # Add Hotel Receptionist specific metadata to video grants
            payload["video"]["metadata"] = {
                "mode": "hotel",
                "hotel_name": "Grand Plaza Hotel",
                "location": "London, UK",
                "agent_type": "hotel-receptionist",
                "agent_role": "Senior Receptionist and Guest Services Coordinator",
                "generated_at": now.isoformat(),
                "capabilities": ["voice", "real_time", "hotel_services", "booking_management"]
            }
            
            # Generate JWT token using Hotel secret
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
                f"Generated Hotel token for {request.participant_identity} "
                f"in room {request.room_name}, expires at {expires_at}, "
                f"server: {self.config.livekit_url}"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating Hotel token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate token: {str(e)}"
            )
    
    def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate and decode a Hotel token"""
        try:
            # Decode without verification first to get header
            header = jwt.get_unverified_header(token)
            logger.info(f"Token header: {header}")
            
            # Decode with verification using Hotel secret
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

# Initialize Hotel token server
hotel_token_config = HotelTokenConfig(
    api_key=LIVEKIT_HOTEL_API_KEY,
    api_secret=LIVEKIT_HOTEL_API_SECRET,
    livekit_url=LIVEKIT_HOTEL_URL
)
hotel_token_server = HotelTokenServer(hotel_token_config)

# FastAPI app
app = FastAPI(
    title="Hotel Token Server",
    description="Dedicated token generation server for Hotel Receptionist AI",
    version="1.0.0"
)

# CORS middleware for Hotel frontend - Production configuration
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
        "https://127.0.0.1:5000",
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173"
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
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    return response

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Hotel token server"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        livekit_url=LIVEKIT_HOTEL_URL,
        api_key_configured=bool(LIVEKIT_HOTEL_API_KEY)
    )

@app.get("/config")
async def get_config():
    """Get Hotel configuration status"""
    return {
        "hotel_livekit": {
            "url": LIVEKIT_HOTEL_URL,
            "api_key_configured": bool(LIVEKIT_HOTEL_API_KEY),
            "api_secret_configured": bool(LIVEKIT_HOTEL_API_SECRET)
        },
        "service_type": "hotel_receptionist_only",
        "capabilities": ["token_generation", "token_validation"],
        "modes_supported": ["hotel_only"],
        "hotel_info": {
            "name": "Grand Plaza Hotel",
            "location": "London, UK",
            "agent_role": "Senior Receptionist and Guest Services Coordinator"
        }
    }

@app.post("/token", response_model=TokenResponse)
async def create_token(request: TokenRequest):
    """Generate a LiveKit access token for Hotel Receptionist voice agent"""
    response = hotel_token_server.generate_token(request)
    return response

@app.post("/token/validate")
async def validate_token(request: dict):
    """Validate and decode a Hotel token"""
    token = request.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required in request body"
        )
    return hotel_token_server.validate_token(token)

@app.get("/token/quick")
async def quick_token(
    room_name: str = "hotel_reception_",
    participant_identity: str = None,
    participant_name: str = None
):
    """Quick token generation with Hotel defaults"""
    if not participant_identity:
        participant_identity = f"hotel_guest_{int(time.time())}"
    
    request = TokenRequest(
        room_name=room_name,
        participant_identity=participant_identity,
        participant_name=participant_name,
        ttl_minutes=15
    )
    
    return hotel_token_server.generate_token(request)

# CORS Preflight handlers
@app.options("/{full_path:path}")
async def cors_preflight(full_path: str):
    """Handle CORS preflight requests for all endpoints"""
    return {"message": "CORS preflight"}

@app.get("/")
async def root():
    """Root endpoint with Hotel usage information"""
    return {
        "message": "Hotel Token Server - Dedicated Service",
        "version": "1.0.0",
        "service_type": "hotel_receptionist_only",
        "description": "Token generation service exclusively for Hotel Receptionist AI",
        "hotel_info": {
            "name": "Grand Plaza Hotel",
            "location": "London, UK",
            "agent_role": "Senior Receptionist and Guest Services Coordinator"
        },
        "endpoints": {
            "POST /token": "Generate a custom token for Hotel Receptionist",
            "GET /token/quick": "Generate a quick token with defaults",
            "POST /token/validate": "Validate and decode a token",
            "GET /health": "Health check",
            "GET /config": "Configuration status"
        },
        "usage": {
            "example_request": {
                "room_name": "hotel_reception_",
                "participant_identity": "guest123",
                "participant_name": "Hotel Guest",
                "ttl_minutes": 15
            }
        },
        "note": "This server only supports Hotel Receptionist mode. For other voicebots, use the appropriate token server."
    }

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Hotel Token Server...")
    logger.info(f"Hotel LiveKit URL: {LIVEKIT_HOTEL_URL}")
    logger.info(f"API Key configured: {bool(LIVEKIT_HOTEL_API_KEY)}")
    logger.info(f"API Secret configured: {bool(LIVEKIT_HOTEL_API_SECRET)}")
    logger.info("Token server ready to handle Hotel Receptionist voice agent requests")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8004,  # Hotel-specific port
        log_level="info"
    )