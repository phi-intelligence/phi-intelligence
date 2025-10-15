#!/usr/bin/env python3
"""
Company Voice Agent Token & RAG Server (Pinecone Only)
Updated to use Azure Key Vault for secure secret management

Purpose:
- Issue LiveKit tokens for the company LiveKit instance (company mode)
- Provide RAG services backed by Pinecone for company voicebots
- Store all data (vectors, metadata, company profiles) in Pinecone

Notes:
- This server replaces Neon DB with Pinecone for all data storage
- Set COMPANY_RAG_SERVER_URL in the agent to point to this server
- Requires OPENAI_API_KEY for embeddings and AI description generation
"""

import os
import time
import logging
import uuid
import hashlib
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from pathlib import Path

import jwt
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# RAG-specific imports
import json
import re

# OpenAI (v1+ client)
import openai
import tiktoken

# R2 Service import
from shared.r2_service import R2Service

# Enhanced Pinecone Service import
from shared.pinecone_service import PineconeService

# ✅ ADD: Redis service import
from shared.redis_service import redis_service

# Azure Key Vault removed - using environment variables for AWS deployment

# Load environment variables (development fallback)
load_dotenv(override=True)
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

# Company LiveKit Configuration - Load from Key Vault
LIVEKIT_COMPANY_URL = None
LIVEKIT_COMPANY_API_KEY = None
LIVEKIT_COMPANY_API_SECRET = None

# These will be loaded from Key Vault in the lifespan handler

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not set - RAG functionality will be limited")

# Storage Configuration (for original files/text chunks on disk)
STORAGE_DIR = os.getenv("STORAGE_DIR", "./storage")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "100"))

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
    # Company-specific fields (optional metadata convenience)
    voicebot_id: Optional[str] = Field(None, description="Voicebot ID for company mode")
    company_name: Optional[str] = Field(None, description="Company name for company mode")
    bot_name: Optional[str] = Field(None, description="Bot name for company mode")  # ✅ ADD
    description: Optional[str] = Field(None, description="Company description for company mode")

class TokenResponse(BaseModel):
    token: str
    room_name: str
    participant_identity: str
    participant_name: str
    expires_at: datetime
    server_url: str
    permissions: Dict[str, bool]
    mode: str = "company"

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    livekit_url: str
    api_key_configured: bool
    rag_configured: bool
    pinecone_configured: bool
    r2_status: Optional[str] = None
    r2_bucket: Optional[str] = None

class FileUploadResponse(BaseModel):
    files: List[Dict[str, Any]]
    message: str

class VoicebotCreateRequest(BaseModel):
    user_id: str
    company_name: str
    bot_name: str  # ✅ ADD: Bot name field
    description: Optional[str] = None
    voicebot_id: str

class VoicebotResponse(BaseModel):
    voicebot_id: str
    company_name: str
    description: Optional[str] = None
    files_count: int
    chunks_count: int
    created_at: datetime
    status: str
    description_source: Optional[str] = None
    user_description: Optional[str] = None

class SearchRequest(BaseModel):
    voicebot_id: str
    query: str
    top_k: int = 5

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    voicebot_id: str

@dataclass
class CompanyTokenConfig:
    api_key: str
    api_secret: str
    livekit_url: str
    default_ttl_minutes: int = 15
    max_ttl_minutes: int = 1440

class CompanyTokenServer:
    """Company voice agent dedicated token server"""

    def __init__(self, config: CompanyTokenConfig):
        self.config = config
        logger.info(f"Company token server (Pinecone) initialized for LiveKit URL: {config.livekit_url}")
        logger.info(f"Company API Key configured: {bool(config.api_key)}")
        logger.info(f"Company API Secret configured: {bool(config.api_secret)}")

    def generate_token(self, request: TokenRequest) -> TokenResponse:
        """Generate a LiveKit access token for company voice agent"""
        try:
            ttl_minutes = min(request.ttl_minutes, self.config.max_ttl_minutes)
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(minutes=ttl_minutes)

            payload = {
                "iss": self.config.api_key,
                "sub": request.participant_identity,
                "nbf": int(now.timestamp()),
                "exp": int(expires_at.timestamp()),
                "iat": int(now.timestamp()),
                "identity": request.participant_identity,
                "name": request.participant_name or request.participant_identity,
                "video": {
                    "room": request.room_name,
                    "roomJoin": True,
                    "canPublish": request.can_publish,
                    "canSubscribe": request.can_subscribe,
                    "canPublishData": True,
                    "canUpdateOwnMetadata": True,
                    "hidden": request.hidden,
                    "recorder": request.recorder,
                    "agent": request.agent,
                    "metadata": {
                        "mode": "company",
                        "agent_type": "company_rag",  # Added for agent validation
                        "generated_at": now.isoformat(),
                        **({"voicebot_id": request.voicebot_id} if request.voicebot_id else {}),
                        **({"company_name": request.company_name} if request.company_name else {}),
                        **({"bot_name": request.bot_name} if request.bot_name else {}),  # ✅ ADD
                        **({"description": request.description} if request.description else {}),
                    },
                },
            }

            token = jwt.encode(payload, self.config.api_secret, algorithm="HS256")

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
                    "can_publish_data": True,
                    "can_update_metadata": True,
                    "hidden": request.hidden,
                    "recorder": request.recorder,
                    "agent": request.agent,
                },
                mode="company",
            )

            logger.info(
                f"Generated company (Pinecone) token for {request.participant_identity} in room {request.room_name}, expires at {expires_at}"
            )

            return response

        except Exception as e:
            logger.error(f"Error generating company token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate token: {str(e)}",
            )

    def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate and decode a company token"""
        try:
            header = jwt.get_unverified_header(token)
            logger.info(f"Token header: {header}")
            payload = jwt.decode(token, self.config.api_secret, algorithms=["HS256"]) 
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")

class PineconeRAGService:
    """RAG service implemented over Pinecone only."""

    def __init__(self):
        self.storage_dir = Path(STORAGE_DIR)
        self.files_dir = self.storage_dir / "files"
        self.text_dir = self.storage_dir / "text"
        self.storage_dir.mkdir(exist_ok=True)
        self.files_dir.mkdir(exist_ok=True)
        self.text_dir.mkdir(exist_ok=True)

        # OpenAI client + tokenizer
        if OPENAI_API_KEY:
            openai.api_key = OPENAI_API_KEY
            self.openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
            self.encoder = tiktoken.get_encoding("cl100k_base")
        else:
            self.openai_client = None
            self.encoder = None

        # R2 Service initialization
        self.r2_service = R2Service()
        if self.r2_service.is_available():
            logger.info("✅ R2 service initialized successfully")
        else:
            logger.warning("⚠️ R2 service not available - falling back to local storage only")

        # Enhanced Pinecone Service initialization
        self.pinecone_service = PineconeService()
        if self.pinecone_service.is_available():
            logger.info("✅ Pinecone service initialized successfully")
        else:
            logger.warning("⚠️ Pinecone service not available - RAG functionality will be limited")

        logger.info("Pinecone RAG Service initialized with R2 + Pinecone integration")

    def _get_voicebot_dir(self, voicebot_id: str) -> Path:
        return self.files_dir / voicebot_id

    def _get_text_dir(self, voicebot_id: str) -> Path:
        return self.text_dir / voicebot_id

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        if not self.encoder:
            words = text.split()
            chunks = []
            step = max(1, chunk_size - overlap)
            for i in range(0, len(words), step):
                chunks.append(" ".join(words[i:i + chunk_size]))
            return chunks
        tokens = self.encoder.encode(text)
        chunks = []
        step = max(1, chunk_size - overlap)
        for i in range(0, len(tokens), step):
            chunk_tokens = tokens[i:i + chunk_size]
            chunks.append(self.encoder.decode(chunk_tokens))
        return chunks

    async def upload_files(self, voicebot_id: str, files: List[UploadFile]) -> List[Dict[str, Any]]:
        voicebot_dir = self._get_voicebot_dir(voicebot_id)
        voicebot_dir.mkdir(exist_ok=True)
        uploaded_files: List[Dict[str, Any]] = []

        # Company profile will be created/updated after file processing with extracted information

        for file in files:
            try:
                file.file.seek(0, 2)
                size_bytes = file.file.tell()
                file.file.seek(0)
            except Exception:
                size_bytes = None

            if size_bytes is not None and size_bytes > MAX_UPLOAD_MB * 1024 * 1024:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File {file.filename} exceeds {MAX_UPLOAD_MB}MB limit")

            file_id = str(uuid.uuid4())
            ext = Path(file.filename).suffix
            safe_filename = f"{file_id}{ext}"
            
            # Read file data once for both R2 and local storage
            file_data = file.file.read()
            
            # Upload to R2 (permanent cloud storage)
            r2_metadata = {"r2_url": None, "r2_key": None}
            if self.r2_service.is_available():
                try:
                    r2_metadata = await self.r2_service.upload_file(
                        file_data=file_data,
                        voicebot_id=voicebot_id,
                        file_id=file_id,
                        original_name=file.filename,
                        content_type=file.content_type or "application/octet-stream"
                    )
                    logger.info(f"✅ File uploaded to R2: {r2_metadata['r2_url']}")
                except Exception as e:
                    logger.warning(f"⚠️ R2 upload failed for {file.filename}: {e}")
                    r2_metadata = {"r2_url": None, "r2_key": None}
            else:
                logger.info("ℹ️ R2 service not available, using local storage only")

            # Save to local cache for processing
            file_path = voicebot_dir / safe_filename
            with open(file_path, "wb") as buffer:
                buffer.write(file_data)

            checksum = hashlib.md5(file_path.read_bytes()).hexdigest()

            # ✅ NEW: Store file metadata in Pinecone
            file_metadata = {
                "file_id": file_id,
                "original_name": file.filename,
                "file_size_bytes": size_bytes,
                "content_type": file.content_type,
                "checksum": checksum,
                "storage_path": str(file_path),
                "r2_url": r2_metadata.get("r2_url"),
                "r2_key": r2_metadata.get("r2_key"),
                "uploaded_at": datetime.now().isoformat()
            }
            
            await self.pinecone_service.store_file_metadata(voicebot_id, file_metadata)

            # Extract text and save into storage/text/{voicebot_id}/{file_id}.txt
            try:
                text_content = await self._extract_text(file_path, file.content_type or "text/plain")
            except Exception as e:
                logger.warning(f"Text extraction failed for {file.filename}: {e}")
                text_content = ""

            text_dir = self._get_text_dir(voicebot_id)
            text_dir.mkdir(exist_ok=True)
            text_path = text_dir / f"{file_id}.txt"
            try:
                with open(text_path, "w", encoding="utf-8") as f:
                    f.write(text_content)
                    f.flush()
                    os.fsync(f.fileno())
            except Exception as e:
                logger.warning(f"Could not write extracted text for {file.filename}: {e}")

            uploaded_files.append({
                "file_id": file_id,
                "original_name": file.filename,
                "size": size_bytes,
                "content_type": file.content_type,
                "checksum": checksum,
                "storage_path": str(file_path),
                "text_path": str(text_path),
                "r2_url": r2_metadata.get("r2_url"),
                "r2_key": r2_metadata.get("r2_key"),
                "storage_type": "hybrid" if r2_metadata.get("r2_url") else "local_only"
            })

        # ✅ NEW: Extract company information immediately after upload
        files_count = len(uploaded_files)
        
        try:
            # Extract company information from uploaded content
            company_info = await self.extract_company_info_from_content(voicebot_id)
            
            if "error" not in company_info:
                # Update company profile with extracted information
                await self.pinecone_service.store_company_profile(voicebot_id, {
                    "company_name": company_info.get("company_name", "Your Company"),
                    "bot_name": company_info.get("bot_name", "Assistant"),
                    "description": company_info.get("description", "AI voice assistant ready to help with your business needs"),
                    "description_source": "ai_extracted",
                    "status": "active",  # ✅ IMMEDIATELY ACTIVE
                    "files_count": files_count,
                    "chunks_count": 0,  # Will be updated during indexing
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })
                
                logger.info(f"✅ Company profile updated immediately: {company_info.get('company_name')} - {company_info.get('bot_name')}")
            else:
                logger.warning(f"⚠️ Company info extraction failed: {company_info.get('error')}")
                # Fallback to placeholder profile
                company_profile = await self.pinecone_service.get_company_profile(voicebot_id)
                if not company_profile:
                    await self.pinecone_service.store_company_profile(voicebot_id, {
                        "company_name": "Your Company",
                        "bot_name": "Assistant",
                        "description": "AI voice assistant ready to help with your business needs",
                        "description_source": "system_placeholder",
                        "status": "draft",
                        "files_count": files_count,
                        "chunks_count": 0,
                        "created_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat()
                    })
                    logger.info(f"✅ Created fallback company profile for voicebot: {voicebot_id}")
                else:
                    # Update existing company profile with file count
                    await self.pinecone_service.update_company_stats(voicebot_id, files_count, company_profile.get("chunks_count", 0))
                
        except Exception as e:
            logger.error(f"❌ Immediate profile update failed: {e}")
            # Continue with upload - don't fail the entire process
            # Ensure we have at least a basic profile
            company_profile = await self.pinecone_service.get_company_profile(voicebot_id)
            if not company_profile:
                await self.pinecone_service.store_company_profile(voicebot_id, {
                    "company_name": "Your Company",
                    "bot_name": "Assistant",
                    "description": "AI voice assistant ready to help with your business needs",
                    "description_source": "system_placeholder",
                    "status": "draft",
                    "files_count": files_count,
                    "chunks_count": 0,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })

        logger.info(f"Processed {len(uploaded_files)} files for {voicebot_id}")
        return uploaded_files

    async def _extract_text(self, file_path: Path, content_type: str) -> str:
        try:
            if content_type == "application/pdf":
                import PyPDF2
                with open(file_path, "rb") as f:
                    pdf = PyPDF2.PdfReader(f)
                    text = ""
                    for page in pdf.pages:
                        text += page.extract_text() + "\n"
                    return text
            elif content_type in (
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ):
                import docx
                doc = docx.Document(file_path)
                text = "".join(p.text + "\n" for p in doc.paragraphs)
                return text
            elif content_type == "application/msword":
                import olefile
                ole = olefile.OleFileIO(file_path)
                try:
                    if ole.exists('WordDocument'):
                        return ole.openstream('WordDocument').read().decode('utf-8', errors='ignore')
                    return ""
                finally:
                    ole.close()
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to extract text from {file_path.name}")

    async def extract_company_info_from_content(self, voicebot_id: str) -> Dict[str, Any]:
        """Extract company information from uploaded content immediately"""
        try:
            text_dir = self._get_text_dir(voicebot_id)
            if not text_dir.exists():
                return {"error": "No content available for analysis"}
            
            text_files = list(text_dir.glob("*.txt"))
            if not text_files:
                return {"error": "No text files found for analysis"}
            
            # Combine all text content
            all_content = ""
            for text_file in text_files:
                with open(text_file, "r", encoding="utf-8") as f:
                    all_content += f.read() + "\n"
            
            if not all_content.strip():
                return {"error": "No text content available"}
            
            # Use AI to extract company information
            if self.openai_client:
                company_info = await self._ai_extract_company_info(all_content)
            else:
                company_info = await self._fallback_extract_company_info(all_content)
            
            logger.info(f"✅ Company info extracted: {company_info.get('company_name', 'Unknown')}")
            return company_info
            
        except Exception as e:
            logger.error(f"❌ Company info extraction failed: {e}")
            return {"error": f"Extraction failed: {str(e)}"}

    async def _ai_extract_company_info(self, content: str) -> Dict[str, Any]:
        """Use OpenAI to extract company information from content"""
        try:
            # Limit content for token efficiency
            content_sample = content[:2000] if len(content) > 2000 else content
            
            prompt = f"""
            Analyze the following business content and extract key information:
            
            Content: {content_sample}
            
            Please extract and return ONLY a JSON object with:
            1. company_name: The main company name (e.g., "Phi Intelligence")
            2. bot_name: A professional bot name (e.g., "Phi Assistant", "Intelligence Bot")
            3. industry: The primary industry (e.g., "AI Technology", "Healthcare")
            4. description: A 1-2 sentence professional description
            
            Return ONLY valid JSON, no other text.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a business analyst. Extract company information and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            result_text = response.choices[0].message.content.strip()
            result = json.loads(result_text)
            
            # Validate and clean the result
            return {
                "company_name": result.get("company_name", "Your Company"),
                "bot_name": result.get("bot_name", "Assistant"),
                "industry": result.get("industry", "Business Services"),
                "description": result.get("description", "AI voice assistant ready to help with your business needs")
            }
            
        except json.JSONDecodeError as e:
            logger.warning(f"AI returned invalid JSON: {e}")
            return await self._fallback_extract_company_info(content)
        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            return await self._fallback_extract_company_info(content)

    async def _fallback_extract_company_info(self, content: str) -> Dict[str, Any]:
        """Fallback extraction using pattern matching"""
        try:
            # Common company name patterns
            company_patterns = [
                r"([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?) is a",
                r"([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?) specializes in",
                r"([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?) provides",
                r"Company: ([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)",
                r"([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?) –",
                r"([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?) Company",
            ]
            
            company_name = "Your Company"  # Default
            for pattern in company_patterns:
                match = re.search(pattern, content)
                if match:
                    company_name = match.group(1)
                    break
            
            # Generate bot name based on company name
            if company_name != "Your Company":
                first_word = company_name.split()[0]
                bot_name = f"{first_word} Assistant"
            else:
                bot_name = "Business Assistant"
            
            # Detect industry
            content_lower = content.lower()
            industry = "Business Services"
            if any(word in content_lower for word in ["ai", "artificial intelligence", "technology", "software"]):
                industry = "AI Technology"
            elif any(word in content_lower for word in ["healthcare", "medical", "health", "patient"]):
                industry = "Healthcare"
            elif any(word in content_lower for word in ["finance", "banking", "financial", "investment"]):
                industry = "Financial Services"
            elif any(word in content_lower for word in ["education", "learning", "training", "academic"]):
                industry = "Education"
            elif any(word in content_lower for word in ["retail", "ecommerce", "shopping", "sales"]):
                industry = "Retail"
            
            # Generate description
            if company_name != "Your Company":
                description = f"{company_name} is a {industry.lower()} company dedicated to providing quality services and solutions to meet our clients' needs."
            else:
                description = "AI voice assistant ready to help with your business needs"
            
            return {
                "company_name": company_name,
                "bot_name": bot_name,
                "industry": industry,
                "description": description
            }
            
        except Exception as e:
            logger.error(f"Fallback extraction failed: {e}")
            return {
                "company_name": "Your Company",
                "bot_name": "Assistant",
                "industry": "Business Services",
                "description": "AI voice assistant ready to help with your business needs"
            }

    async def analyze_company_content(self, voicebot_id: str) -> Dict[str, Any]:
        text_dir = self._get_text_dir(voicebot_id)
        if not text_dir.exists():
            return {"error": "No text files found for analysis"}
        text_files = list(text_dir.glob("*.txt"))
        if not text_files:
            return {"error": "No text content available for analysis"}

        all_content = ""
        file_info: List[Dict[str, Any]] = []
        for text_file in text_files:
            with open(text_file, "r", encoding="utf-8") as f:
                content = f.read()
            all_content += content + "\n"
            file_info.append({
                "filename": text_file.name,
                "size": len(content),
                "word_count": len(content.split()),
                "content_preview": content[:200] + "..." if len(content) > 200 else content,
            })

        content_lower = all_content.lower()
        industry_keywords = {
            "technology": ["software", "app", "platform", "digital", "tech", "ai", "machine learning"],
            "healthcare": ["medical", "health", "patient", "treatment", "diagnosis", "clinical"],
            "finance": ["financial", "banking", "investment", "trading", "portfolio", "wealth"],
            "education": ["learning", "education", "training", "course", "student", "academic"],
            "retail": ["retail", "ecommerce", "shopping", "product", "customer", "sales"],
            "manufacturing": ["manufacturing", "production", "factory", "industrial", "supply chain"],
            "consulting": ["consulting", "advisory", "strategy", "business", "management", "consultant"],
        }
        detected_industries = [ind for ind, kws in industry_keywords.items() if any(k in content_lower for k in kws)]

        service_indicators: List[str] = []
        if any(w in content_lower for w in ["service", "solution", "platform", "tool", "software"]):
            service_indicators.append("service-based")
        if any(w in content_lower for w in ["product", "goods", "manufacturing", "production"]):
            service_indicators.append("product-based")
        if any(w in content_lower for w in ["consulting", "advisory", "training", "education"]):
            service_indicators.append("consulting-based")

        size_indicators: List[str] = []
        if any(w in content_lower for w in ["startup", "small business", "entrepreneur"]):
            size_indicators.append("startup/small business")
        elif any(w in content_lower for w in ["enterprise", "corporation", "multinational"]):
            size_indicators.append("enterprise/large company")
        else:
            size_indicators.append("medium-sized business")

        return {
            "voicebot_id": voicebot_id,
            "content_summary": {
                "total_files": len(text_files),
                "total_content_length": len(all_content),
                "total_words": len(all_content.split()),
                "average_words_per_file": (len(all_content.split()) // len(text_files)) if text_files else 0,
            },
            "file_analysis": file_info,
            "detected_industries": detected_industries,
            "service_indicators": service_indicators,
            "size_indicators": size_indicators,
            "content_preview": all_content[:500] + "..." if len(all_content) > 500 else all_content,
        }

    async def create_ai_description(self, company_name: str, content_analysis: Dict[str, Any]) -> str:
        try:
            if not self.openai_client:
                return self._generate_fallback_description(company_name, content_analysis)
            summary = content_analysis.get("content_preview", "")
            detected_industries = content_analysis.get("detected_industries", [])
            service_indicators = content_analysis.get("service_indicators", [])
            size_indicators = content_analysis.get("size_indicators", [])
            prompt = f"""
You are a professional business writer. Create a concise, professional company description for "{company_name}" based on the following information:

Company Name: {company_name}
Detected Industries: {', '.join(detected_industries) if detected_industries else 'General business'}
Service Type: {', '.join(service_indicators) if service_indicators else 'Business services'}
Company Size: {', '.join(size_indicators) if size_indicators else 'Business'}

Content Summary: {summary[:1000]}

Requirements:
1. Keep it professional and business-like
2. Focus on what the company does, not technical details
3. Use industry-appropriate language
4. Keep it under 100 words
5. Make it sound like a professional company description
6. Avoid technical jargon or room IDs

Generate a professional company description:
"""
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional business writer specializing in company descriptions."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=150,
                temperature=0.7,
            )
            desc = response.choices[0].message.content.strip()
            desc = desc.replace('"', '')
            if desc.startswith("Company Description:"):
                desc = desc.replace("Company Description:", "").strip()
            return desc
        except Exception as e:
            logger.error(f"AI description generation failed: {e}")
            return self._generate_fallback_description(company_name, content_analysis)

    def _generate_fallback_description(self, company_name: str, content_analysis: Dict[str, Any]) -> str:
        try:
            detected = content_analysis.get("detected_industries", []) or []
            if "technology" in detected:
                return f"{company_name} is a technology company specializing in innovative solutions and digital services."
            if "healthcare" in detected:
                return f"{company_name} is a healthcare company focused on providing quality medical services and patient care."
            if "finance" in detected:
                return f"{company_name} is a financial services company offering comprehensive financial solutions."
            if "education" in detected:
                return f"{company_name} is an educational institution dedicated to providing quality learning experiences."
            if detected:
                return f"{company_name} is a {detected[0].title()} company committed to delivering exceptional services and value to our clients."
            return f"{company_name} is a professional company dedicated to providing quality services and solutions to meet our clients' needs."
        except Exception as e:
            logger.error(f"Fallback description failed: {e}")
            return f"{company_name} is a professional company committed to excellence and customer satisfaction."

    async def generate_intelligent_description(self, voicebot_id: str, company_name: str, user_description: Optional[str] = None) -> Dict[str, Any]:
        result = {
            "voicebot_id": voicebot_id,
            "company_name": company_name,
            "user_description": user_description,
            "ai_generated_description": None,
            "final_description": None,
            "description_source": None,
            "content_analysis": None,
        }
        if user_description and user_description.strip():
            result["final_description"] = user_description.strip()
            result["description_source"] = "user_provided"
            return result
        content_analysis = await self.analyze_company_content(voicebot_id)
        result["content_analysis"] = content_analysis
        if "error" in content_analysis:
            result["final_description"] = self._generate_fallback_description(company_name, content_analysis)
            result["description_source"] = "fallback_generated"
            return result
        ai_desc = await self.create_ai_description(company_name, content_analysis)
        result["ai_generated_description"] = ai_desc
        if ai_desc and len(ai_desc) > 10:
            result["final_description"] = ai_desc
            result["description_source"] = "ai_generated"
        else:
            result["final_description"] = self._generate_fallback_description(company_name, content_analysis)
            result["description_source"] = "fallback_generated"
        return result

    async def index_voicebot(self, voicebot_id: str, company_name: str, bot_name: str, description: Optional[str]) -> Dict[str, Any]:
        if not self.openai_client:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="OpenAI API key not configured for text processing")

        # Prepare description (intelligent generation when missing)
        final_description = description
        description_source = "user_provided" if (description and description.strip()) else None
        if not final_description:
            try:
                desc_info = await self.generate_intelligent_description(voicebot_id, company_name)
                final_description = desc_info.get("final_description")
                description_source = desc_info.get("description_source")
            except Exception as e:
                logger.warning(f"Intelligent description generation failed: {e}")
                final_description = f"AI voice assistant for {company_name}"
                description_source = "fallback_generated"

        text_dir = self._get_text_dir(voicebot_id)
        if not text_dir.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No text files found for company voicebot {voicebot_id}")
        text_files = list(text_dir.glob("*.txt"))
        if not text_files:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No text files found for company voicebot {voicebot_id}")

        # Collect chunks
        all_chunks: List[str] = []
        all_metadatas: List[Dict[str, Any]] = []
        all_ids: List[str] = []

        for text_file in text_files:
            with open(text_file, "r", encoding="utf-8") as f:
                content = f.read()
            chunks = self._chunk_text(content)
            for i, chunk in enumerate(chunks):
                chunk_id = f"{text_file.stem}_{i}"
                all_chunks.append(chunk)
                all_metadatas.append({
                    "voicebot_id": voicebot_id,
                    "company_name": company_name,
                    "description": final_description,
                    "source_file": text_file.name,
                    "chunk_index": i,
                    "chunk_size": len(chunk),
                })
                all_ids.append(chunk_id)

        if not all_chunks:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No text content found to index")

        # Create embeddings
        try:
            emb = self.openai_client.embeddings.create(model="text-embedding-3-small", input=all_chunks)
            vectors = [d.embedding for d in emb.data]
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate embeddings")

        # ✅ NEW: Store vectors in Pinecone
        if self.pinecone_service.is_available():
            try:
                # Prepare vectors for Pinecone
                pinecone_vectors = []
                for vec, doc, meta, cid in zip(vectors, all_chunks, all_metadatas, all_ids):
                    pinecone_vectors.append({
                        "id": f"{voicebot_id}_{cid}",
                        "embedding": vec,
                        "voicebot_id": voicebot_id,
                        "content": doc,
                        "source_file": meta.get("source_file"),
                        "chunk_index": meta.get("chunk_index"),
                        "chunk_size": meta.get("chunk_size"),
                        "company_name": company_name,
                        "description": final_description
                    })
                
                # Store vectors in Pinecone
                await self.pinecone_service.upsert_vectors(
                    vectors=pinecone_vectors,
                    namespace=voicebot_id
                )
                logger.info(f"✅ Vectors stored in Pinecone for voicebot: {voicebot_id}")
                
            except Exception as e:
                logger.warning(f"⚠️ Pinecone storage failed: {e}")
                # Continue with metadata storage only
        else:
            logger.warning("⚠️ Pinecone service not available - vectors not stored")

        # ✅ NEW: Store company profile in Pinecone
        await self.pinecone_service.store_company_profile(voicebot_id, {
            "company_name": company_name,
            "bot_name": bot_name,  # ✅ ADD: Store bot name
            "description": final_description,
            "description_source": description_source,
            "status": "active",
            "files_count": len(text_files),
            "chunks_count": len(all_chunks),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        })

        return {
            "voicebot_id": voicebot_id,
            "company_name": company_name,
            "description": final_description,
            "description_source": description_source,
            "user_description": description,
            "files_count": len(text_files),
            "chunks_count": len(all_chunks),
            "created_at": datetime.now(timezone.utc),
            "status": "indexed",
        }

    async def search_knowledge(self, voicebot_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search knowledge using Pinecone for vectors and company context"""
        
        if not self.pinecone_service.is_available():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Pinecone service not available")
        
        try:
            # Generate query embedding
            emb = self.openai_client.embeddings.create(model="text-embedding-3-small", input=[query])
            query_vec = emb.data[0].embedding
            
            # Search Pinecone
            results = await self.pinecone_service.search_vectors(
                query_vector=query_vec,
                namespace=voicebot_id,
                top_k=top_k,
                filters={"voicebot_id": voicebot_id}
            )
            
            if results:
                logger.info(f"✅ Pinecone search successful: {len(results)} results")
                return results
            else:
                # Return company profile as fallback
                company_profile = await self.pinecone_service.get_company_profile(voicebot_id)
                if company_profile:
                    return [{
                        "content": f"Company: {company_profile.get('company_name', 'Unknown')} - {company_profile.get('description', 'No description available')}",
                        "source_file": "company_profile",
                        "distance": 0.0,
                        "metadata": {
                            "type": "company_profile",
                            "voicebot_id": voicebot_id,
                            "company_name": company_profile.get("company_name"),
                            "description": company_profile.get("description")
                        }
                    }]
                return []
                
        except Exception as e:
            logger.error(f"❌ Pinecone search failed: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Search failed")

    async def get_voicebot_status(self, voicebot_id: str) -> Dict[str, Any]:
        if not self.pinecone_service.is_available():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Pinecone service not available")
        
        try:
            # Get company profile from Pinecone
            company_profile = await self.pinecone_service.get_company_profile(voicebot_id)
            
            if not company_profile:
                return {
                    "voicebot_id": voicebot_id,
                    "company_name": None,
                    "bot_name": None,  # ✅ ADD: Include bot_name
                    "description": None,
                    "files_count": 0,
                    "chunks_count": 0,
                    "indexed": False,
                    "last_updated": datetime.now(timezone.utc),
                }
            
            # Get file metadata from Pinecone
            file_metadata = await self.pinecone_service.get_file_metadata(voicebot_id)
            files_count = len(file_metadata)
            
            # Get vector count from Pinecone namespace
            namespace_stats = await self.pinecone_service.get_namespace_stats(voicebot_id)
            chunks_count = namespace_stats.get("vector_count", 0)
            
            return {
                "voicebot_id": voicebot_id,
                "company_name": company_profile.get("company_name"),
                "bot_name": company_profile.get("bot_name"),  # ✅ ADD: Include bot_name
                "description": company_profile.get("description") or (f"AI voice assistant for {company_profile.get('company_name')}") if company_profile.get("company_name") else None,
                "files_count": files_count,
                "chunks_count": chunks_count,
                "indexed": chunks_count > 0,
                "last_updated": datetime.now(timezone.utc),
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get voicebot status: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get voicebot status")

    async def reset_voicebot(self, voicebot_id: str, hard_delete: bool = False) -> Dict[str, Any]:
        if not self.pinecone_service.is_available():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Pinecone service not available")
        
        try:
            # ✅ NEW: Delete all company data from Pinecone
            await self.pinecone_service.delete_company_data(voicebot_id)
            
            # Delete local text files
            text_dir = self._get_text_dir(voicebot_id)
            if text_dir.exists():
                import shutil
                shutil.rmtree(text_dir, ignore_errors=True)

            if hard_delete:
                files_dir = self._get_voicebot_dir(voicebot_id)
                if files_dir.exists():
                    import shutil
                    shutil.rmtree(files_dir, ignore_errors=True)

            return {
                "voicebot_id": voicebot_id,
                "message": "Company voicebot knowledge base reset successfully",
                "hard_delete": hard_delete,
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to reset voicebot: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to reset voicebot")

# Initialize services
rag_service = PineconeRAGService()

# Global token server instance - will be initialized in lifespan handler
company_token_server = None

async def initialize_company_token_server():
    """Initialize company token server with credentials from environment or Key Vault"""
    global company_token_server
    
    # Priority 1: Check environment variables (AWS deployment)
    api_key = os.getenv("LIVEKIT_COMPANY_API_KEY")
    api_secret = os.getenv("LIVEKIT_COMPANY_API_SECRET")
    url = os.getenv("LIVEKIT_COMPANY_URL")
    
    if all([api_key, api_secret, url]):
        logger.info("✅ Using LiveKit credentials from environment variables")
    else:
        # Removed Azure Key Vault fallback - environment variables required for AWS deployment
        pass  # Will check if credentials are valid below
    
    if not all([api_key, api_secret, url]):
        raise ValueError("Missing required LiveKit credentials (set LIVEKIT_COMPANY_* environment variables)")
    
    config = CompanyTokenConfig(
        api_key=api_key,
        api_secret=api_secret,
        livekit_url=url
    )
    
    company_token_server = CompanyTokenServer(config)
    logger.info("✅ Company Token Server initialized")
    logger.info(f"Company LiveKit URL: {url}")
    logger.info(f"Company API Key configured: {bool(api_key)}")
    logger.info(f"Company API Secret configured: {bool(api_secret)}")



# Modern FastAPI lifespan handler (replaces deprecated on_event)
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler for FastAPI"""
    # Startup
    try:
        await redis_service.initialize()
        logger.info("✅ Redis service initialized for token caching")
    except Exception as e:
        logger.warning(f"⚠️ Redis initialization failed: {e}")
        # Continue without Redis - token generation unaffected
    
    # Initialize company token server with Key Vault credentials
    try:
        await initialize_company_token_server()
    except Exception as e:
        logger.error(f"❌ Failed to initialize company token server: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        if redis_service.is_available():
            await redis_service.close()
            logger.info("✅ Redis service closed")
    except Exception as e:
        logger.warning(f"⚠️ Redis shutdown failed: {e}")

# Update FastAPI app to use lifespan
app = FastAPI(
    title="Company Voice Agent Token & RAG Server",
    description="Token generation and Pinecone-backed RAG service for company voicebots",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Production configuration
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
        "https://127.0.0.1:5173",
        "http://localhost:4173",
        "https://localhost:4173",
        "http://127.0.0.1:4173",
        "https://127.0.0.1:4173",
    ])

# Filter out empty strings
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    
    # Use the same allowed origins configuration
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
    return response

@app.get("/health", response_model=HealthResponse)
async def health_check():
    pinecone_configured = rag_service.pinecone_service.is_available()
    
    # Check R2 service health
    r2_health = await rag_service.r2_service.health_check()
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        livekit_url=company_token_server.config.livekit_url if company_token_server else None,
        api_key_configured=bool(company_token_server.config.api_key if company_token_server else None),
        rag_configured=bool(OPENAI_API_KEY),
        pinecone_configured=bool(pinecone_configured),
        r2_status=r2_health.get("status", "unknown"),
        r2_bucket=r2_health.get("bucket", "unknown"),
    )

# ✅ NEW: Live session monitoring endpoint
@app.get("/voice/sessions/live")
async def get_live_sessions():
    """Get all currently active voice sessions"""
    if not redis_service.is_available():
        return {"error": "Redis not available", "sessions": []}
    
    try:
        active_sessions = await redis_service.get_active_sessions()
        return {
            "active_sessions": len(active_sessions),
            "sessions": active_sessions,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting live sessions: {e}")
        return {"error": str(e), "sessions": []}



# ✅ NEW: Cache Performance Monitoring Endpoints

@app.get("/cache/performance/{voicebot_id}")
async def get_cache_performance(voicebot_id: str, hours: int = 24):
    """Get cache performance statistics for a voicebot"""
    try:
        stats = await redis_service.get_cache_performance_stats(voicebot_id, hours)
        if "error" in stats:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=stats["error"])
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cache performance for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/cache/health")
async def get_cache_health():
    """Get overall cache health status"""
    try:
        health = await redis_service.get_cache_health()
        if "error" in health:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=health["error"])
        return health
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cache health: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/cache/cleanup")
async def cleanup_cache():
    """Manually trigger cache cleanup"""
    try:
        cleaned_count = await redis_service.cleanup_expired_cache()
        return {
            "message": "Cache cleanup completed",
            "cleaned_entries": cleaned_count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error during cache cleanup: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/config")
async def get_config():
    # Get R2 service configuration
    r2_config = {
        "enabled": rag_service.r2_service.is_available(),
        "bucket": rag_service.r2_service.bucket_name,
        "account_id": rag_service.r2_service.account_id,
        "endpoint": f"https://{rag_service.r2_service.account_id}.r2.cloudflarestorage.com" if rag_service.r2_service.account_id else None
    }
    
    return {
        "company_livekit": {
            "url": company_token_server.config.livekit_url if company_token_server else None,
            "api_key_configured": bool(company_token_server.config.api_key if company_token_server else None),
            "api_secret_configured": bool(company_token_server.config.api_secret if company_token_server else None),
        },
        "rag_service": {
            "openai_configured": bool(OPENAI_API_KEY),
            "store": "pinecone",
            "storage_dir": STORAGE_DIR,
            "pinecone": {
                "enabled": rag_service.pinecone_service.is_available(),
                "index_name": rag_service.pinecone_service.index_name if hasattr(rag_service.pinecone_service, 'index_name') else "unknown",
            },
            "r2_storage": r2_config,
        },
        "service_type": "company_voicebot_pinecone",
        "capabilities": ["token_generation", "token_validation", "rag_upload", "rag_indexing", "rag_search", "r2_storage"],
        "modes_supported": ["company_only"],
    }

@app.post("/token", response_model=TokenResponse)
async def create_token(request: TokenRequest):
    # Check if company token server is initialized
    if company_token_server is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Company token server not initialized"
        )
    
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
    response = company_token_server.generate_token(request)
    
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
    token = request.get("token")
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token is required in request body")
    return company_token_server.validate_token(token)

@app.get("/token/quick")
async def quick_token(
    room_name: str = "company_room_",
    participant_identity: str = None,
    participant_name: str = None,
    voicebot_id: str = None,
):
    if not participant_identity:
        participant_identity = f"company_user_{int(time.time())}"
    request = TokenRequest(
        room_name=room_name,
        participant_identity=participant_identity,
        participant_name=participant_name,
        ttl_minutes=15,
        voicebot_id=voicebot_id,
    )
    return company_token_server.generate_token(request)

@app.options("/{full_path:path}")
async def cors_preflight(full_path: str):
    return {"message": "CORS preflight"}

# RAG Endpoints (Pinecone)
@app.post("/rag/upload", response_model=FileUploadResponse)
async def upload_company_files(voicebot_id: str = Form(...), files: List[UploadFile] = File(...)):
    try:
        uploaded_files = await rag_service.upload_files(voicebot_id, files)
        
        # ✅ CRITICAL: Invalidate related caches after file upload
        if redis_service.is_available():
            try:
                await redis_service.invalidate_company_cache(voicebot_id)
                await redis_service.invalidate_file_cache(voicebot_id)
                await redis_service.invalidate_rag_cache(voicebot_id)
                logger.info(f"✅ Cache invalidated for voicebot: {voicebot_id}")
            except Exception as e:
                logger.warning(f"⚠️ Cache invalidation failed: {e}")
                # Upload successful - cache invalidation failure doesn't affect functionality
        
        response = FileUploadResponse(files=uploaded_files, message=f"Successfully uploaded {len(uploaded_files)} files")
        return response
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/rag/index", response_model=VoicebotResponse)
async def index_company_knowledge(request: VoicebotCreateRequest):
    try:
        result = await rag_service.index_voicebot(
            request.voicebot_id, 
            request.company_name, 
            request.bot_name,  # ✅ ADD: Pass bot_name
            request.description
        )
        return VoicebotResponse(**result)
    except Exception as e:
        logger.error(f"Error indexing company knowledge: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/rag/status/{voicebot_id}")
async def get_voicebot_status(voicebot_id: str):
    try:
        status_obj = await rag_service.get_voicebot_status(voicebot_id)
        return status_obj
    except Exception as e:
        logger.error(f"Error getting voicebot status: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/rag/search", response_model=SearchResponse)
async def search_company_knowledge_endpoint(request: SearchRequest):
    try:
        results = await rag_service.search_knowledge(request.voicebot_id, request.query, request.top_k)
        # Ensure normalized shape: each result has content, source_file, distance, metadata
        normalized: List[Dict[str, Any]] = []
        for r in results:
            normalized.append({
                "content": r.get("content") or r.get("text"),
                "source_file": r.get("source_file") or (r.get("metadata", {}) or {}).get("source_file"),
                "distance": r.get("distance"),
                "metadata": r.get("metadata", {}),
            })
        return SearchResponse(results=normalized, query=request.query, voicebot_id=request.voicebot_id)
    except Exception as e:
        logger.error(f"Error searching company knowledge: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/rag/reset/{voicebot_id}")
async def reset_voicebot_knowledge(voicebot_id: str, hard_delete: bool = False):
    try:
        result = await rag_service.reset_voicebot(voicebot_id, hard_delete)
        return result
    except Exception as e:
        logger.error(f"Error resetting voicebot: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/rag/generate-description")
async def generate_intelligent_description_endpoint(
    voicebot_id: str = Form(...),
    company_name: str = Form(...),
    user_description: str = Form(None),
):
    """Generate intelligent company description based on uploaded content (no indexing)."""
    try:
        result = await rag_service.generate_intelligent_description(
            voicebot_id,
            company_name,
            user_description,
        )
        return result
    except Exception as e:
        logger.error(f"Error generating intelligent description: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/rag/set-company-info")
async def set_company_info(
    voicebot_id: str = Form(...),
    company_name: str = Form(...),
    bot_name: str = Form(...),  # ✅ ADD: Bot name field
    description: str = Form(...),
):
    """Set company information directly without requiring full indexing."""
    try:
        # Store company profile in Pinecone
        success = await rag_service.pinecone_service.store_company_profile(voicebot_id, {
            "company_name": company_name,
            "bot_name": bot_name,  # ✅ ADD: Store bot name
            "description": description,
            "description_source": "user_provided",
            "status": "active",
            "files_count": 0,  # Will be updated when files are uploaded
            "chunks_count": 0,  # Will be updated when indexed
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        })
        
        if success:
            # ✅ CRITICAL: Invalidate company cache after update
            if redis_service.is_available():
                try:
                    await redis_service.invalidate_company_cache(voicebot_id)
                    logger.info(f"✅ Company cache invalidated for voicebot: {voicebot_id}")
                except Exception as e:
                    logger.warning(f"⚠️ Cache invalidation failed: {e}")
                    # Update successful - cache invalidation failure doesn't affect functionality
            
            return {
                "message": "Company information set successfully",
                "voicebot_id": voicebot_id,
                "company_name": company_name,
                "description": description
            }
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to store company information")
            
    except Exception as e:
        logger.error(f"Error setting company info: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# R2 Storage Endpoints
@app.get("/r2/health")
async def r2_health_check():
    """Check R2 service health and connectivity"""
    try:
        health_status = await rag_service.r2_service.health_check()
        return health_status
    except Exception as e:
        logger.error(f"Error checking R2 health: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/r2/files/{voicebot_id}")
async def list_r2_files(voicebot_id: str):
    """List all files for a specific voicebot in R2 storage"""
    try:
        files = await rag_service.r2_service.list_voicebot_files(voicebot_id)
        return {
            "voicebot_id": voicebot_id,
            "files": files,
            "count": len(files)
        }
    except Exception as e:
        logger.error(f"Error listing R2 files for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete("/r2/files/{voicebot_id}/{file_id}")
async def delete_r2_file(voicebot_id: str, file_id: str):
    """Delete a specific file from R2 storage"""
    try:
        # Get the R2 key from Pinecone file metadata
        file_metadata = await rag_service.pinecone_service.get_file_metadata(voicebot_id, file_id)
        
        if not file_metadata:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        
        file_info = file_metadata[0] if file_metadata else {}
        r2_key = file_info.get('r2_key')
        
        if not r2_key:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found in R2")
        
        # Delete from R2
        success = await rag_service.r2_service.delete_file(r2_key)
        
        if success:
            # Update Pinecone metadata to remove R2 info
            updated_metadata = {**file_info, "r2_url": None, "r2_key": None}
            await rag_service.pinecone_service.store_file_metadata(voicebot_id, updated_metadata)
            
            return {"message": "File deleted from R2 successfully", "file_id": file_id}
        else:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete file from R2")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting R2 file {file_id} for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Pinecone Service Endpoints
@app.get("/pinecone/health")
async def pinecone_health_check():
    """Check Pinecone service health and connectivity"""
    try:
        health_status = await rag_service.pinecone_service.health_check()
        return health_status
    except Exception as e:
        logger.error(f"Error checking Pinecone health: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/pinecone/stats/{voicebot_id}")
async def get_pinecone_stats(voicebot_id: str):
    """Get Pinecone statistics for a specific voicebot"""
    try:
        stats = await rag_service.pinecone_service.get_index_stats()
        namespace_stats = await rag_service.pinecone_service.get_namespace_stats(voicebot_id)
        
        return {
            "voicebot_id": voicebot_id,
            "pinecone_stats": stats,
            "namespace_stats": namespace_stats,
            "vector_count": namespace_stats.get("vector_count", 0) if namespace_stats.get("vector_count") else 0
        }
    except Exception as e:
        logger.error(f"Error getting Pinecone stats for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/pinecone/company-profile/{voicebot_id}")
async def get_company_profile(voicebot_id: str):
    """Get company profile with Redis caching"""
    
    # OPTIONAL: Try Redis cache first
    if redis_service.is_available():
        try:
            cached_profile = await redis_service.get_cached_company_profile(voicebot_id)
            if cached_profile:
                logger.info(f"✅ Company profile loaded from Redis cache: {voicebot_id}")
                return cached_profile
        except Exception as e:
            logger.debug(f"Redis cache check failed (non-critical): {e}")
    
    # PRIMARY: Fetch from Pinecone (reliable fallback)
    try:
        profile = await rag_service.pinecone_service.get_company_profile(voicebot_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company profile not found")
        
        # OPTIONAL: Cache in Redis (non-blocking)
        if redis_service.is_available():
            try:
                asyncio.create_task(
                    redis_service.cache_company_profile(voicebot_id, profile, ttl=3600)
                )
            except Exception as e:
                logger.debug(f"Redis caching failed (non-critical): {e}")
        
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting company profile for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/rag/company-info/{voicebot_id}")
async def get_company_info(voicebot_id: str):
    """Get company information (alias for company profile)"""
    try:
        profile = await rag_service.pinecone_service.get_company_profile(voicebot_id)
        if not profile:
            return {
                "voicebot_id": voicebot_id,
                "company_name": None,
                "description": None,
                "status": "not_found"
            }
        return {
            "voicebot_id": voicebot_id,
            "company_name": profile.get("company_name"),
            "description": profile.get("description"),
            "status": "found"
        }
    except Exception as e:
        logger.error(f"Error getting company info for {voicebot_id}: {e}")
        return {
            "voicebot_id": voicebot_id,
            "company_name": None,
            "description": None,
            "status": "error"
        }

@app.get("/pinecone/files/{voicebot_id}")
async def get_file_metadata(voicebot_id: str):
    """Get file metadata with Redis caching"""
    
    # OPTIONAL: Try Redis cache first
    if redis_service.is_available():
        try:
            cached_files = await redis_service.get_cached_company_files(voicebot_id)
            if cached_files:
                logger.info(f"✅ File metadata loaded from Redis cache: {voicebot_id}")
                return {
                    "voicebot_id": voicebot_id,
                    "files": cached_files,
                    "count": len(cached_files),
                    "source": "redis_cache"
                }
        except Exception as e:
            logger.debug(f"Redis cache check failed (non-critical): {e}")
    
    # PRIMARY: Fetch from Pinecone (reliable fallback)
    try:
        files = await rag_service.pinecone_service.get_file_metadata(voicebot_id)
        
        # OPTIONAL: Cache in Redis (non-blocking)
        if redis_service.is_available():
            try:
                asyncio.create_task(
                    redis_service.cache_company_files(voicebot_id, files, ttl=3600)
                )
            except Exception as e:
                logger.debug(f"Redis caching failed (non-critical): {e}")
        
        return {
            "voicebot_id": voicebot_id,
            "files": files,
            "count": len(files),
            "source": "pinecone"
        }
    except Exception as e:
        logger.error(f"Error getting file metadata for {voicebot_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



@app.get("/")
async def root():
    return {
        "message": "Company Voice Agent Token & RAG Server (Pinecone)",
        "version": "1.0.0",
        "service_type": "company_voicebot_pinecone",
        "description": "Token generation and Pinecone-backed RAG service for company voicebots",
        "endpoints": {
            "POST /token": "Generate a custom token for company voice agent",
            "GET /token/quick": "Generate a quick token with defaults",
            "POST /token/validate": "Validate and decode a token",
            "GET /health": "Health check",
            "GET /config": "Configuration status",
            "POST /rag/upload": "Upload company files",
            "POST /rag/index": "Index company knowledge (Pinecone)",
            "GET /rag/status/{voicebot_id}": "Get voicebot status",
            "POST /rag/search": "Search company knowledge (Pinecone)",
            "POST /rag/reset/{voicebot_id}": "Reset voicebot knowledge",
            "POST /rag/generate-description": "Generate intelligent company description",
            "POST /rag/set-company-info": "Set company information directly",
            "GET /rag/company-info/{voicebot_id}": "Get company information",
            "GET /r2/health": "Check R2 storage health",
            "GET /r2/files/{voicebot_id}": "List files in R2 storage",
            "DELETE /r2/files/{voicebot_id}/{file_id}": "Delete file from R2 storage",
            "GET /pinecone/health": "Check Pinecone service health",
            "GET /pinecone/stats/{voicebot_id}": "Get Pinecone statistics",
            "GET /pinecone/company-profile/{voicebot_id}": "Get company profile from Pinecone",
            "GET /pinecone/files/{voicebot_id}": "Get file metadata from Pinecone",
            "GET /voice-metrics/sessions/{voicebot_id}": "Get voice session metrics for a voicebot",
            "GET /voice-metrics/summary/{voicebot_id}": "Get voice metrics summary for a voicebot",
            "GET /voice-metrics/health": "Check voice metrics service health",
        },
        "usage": {
            "example_request": {
                "room_name": "company_room_",
                "participant_identity": "user123",
                "participant_name": "Company User",
                "ttl_minutes": 15,
                "voicebot_id": "voicebot_123",
                "company_name": "Phi Intelligence",
                "description": "AI voice assistant for Phi Intelligence",
            }
        },
        "note": "Set COMPANY_RAG_SERVER_URL in the Pinecone agent to point to this server.",
    }

if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Company Voice Agent Token & RAG Server (Pinecone)...")
    logger.info("Company LiveKit credentials will be loaded from environment variables")
    logger.info(f"OpenAI API Key configured: {bool(OPENAI_API_KEY)}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8002,  # Pinecone server default (different from Neon server)
        log_level="info",
    )
