"""Security utilities: JWT, password hashing, encryption"""
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
import bcrypt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import secrets
import base64

from app.config import settings
from app.core.exceptions import AuthenticationError

# JWT settings
JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM
JWT_EXPIRES_IN = settings.JWT_EXPIRES_IN

# Encryption settings
ENCRYPTION_KEY = settings.ENCRYPTION_KEY.encode('utf-8')
# Ensure key is 32 bytes
if len(ENCRYPTION_KEY) < 32:
    ENCRYPTION_KEY = ENCRYPTION_KEY.ljust(32, b'0')[:32]
elif len(ENCRYPTION_KEY) > 32:
    ENCRYPTION_KEY = ENCRYPTION_KEY[:32]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash (bcrypt; compatible with passlib-generated hashes)."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: Dict[str, str]) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    # Calculate expiration time
    if JWT_EXPIRES_IN.endswith('h'):
        hours = int(JWT_EXPIRES_IN[:-1])
        expire = datetime.utcnow() + timedelta(hours=hours)
    elif JWT_EXPIRES_IN.endswith('d'):
        days = int(JWT_EXPIRES_IN[:-1])
        expire = datetime.utcnow() + timedelta(days=days)
    elif JWT_EXPIRES_IN.endswith('m'):
        minutes = int(JWT_EXPIRES_IN[:-1])
        expire = datetime.utcnow() + timedelta(minutes=minutes)
    else:
        # Default to 24 hours
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, str]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")


def encrypt(text: str) -> str:
    """Encrypt text using AES-256-GCM (matches Node.js implementation)"""
    try:
        # Generate random IV (16 bytes to match Node.js crypto.randomBytes(16))
        iv = secrets.token_bytes(16)
        
        # Create cipher
        aesgcm = AESGCM(ENCRYPTION_KEY)
        
        # Encrypt - AESGCM automatically handles auth tag
        ciphertext = aesgcm.encrypt(iv, text.encode('utf-8'), None)
        
        # In Node.js, auth tag is 16 bytes and is appended separately
        # AESGCM in Python appends the auth tag to the ciphertext
        # We need to extract it (last 16 bytes)
        auth_tag = ciphertext[-16:]
        encrypted_data = ciphertext[:-16]
        
        # Return iv:authTag:encrypted (all in hex) - matching Node.js format
        return f"{iv.hex()}:{auth_tag.hex()}:{encrypted_data.hex()}"
    except Exception as e:
        raise Exception(f"Failed to encrypt data: {str(e)}")


def decrypt(encrypted: str) -> str:
    """Decrypt text using AES-256-GCM (matches Node.js implementation)"""
    try:
        parts = encrypted.split(':')
        if len(parts) != 3:
            raise ValueError("Invalid encrypted data format")
        
        iv = bytes.fromhex(parts[0])
        auth_tag = bytes.fromhex(parts[1])
        encrypted_data = bytes.fromhex(parts[2])
        
        # Reconstruct ciphertext (encrypted_data + auth_tag)
        ciphertext = encrypted_data + auth_tag
        
        # Create cipher
        aesgcm = AESGCM(ENCRYPTION_KEY)
        
        # Decrypt
        decrypted = aesgcm.decrypt(iv, ciphertext, None)
        
        return decrypted.decode('utf-8')
    except Exception as e:
        raise Exception(f"Failed to decrypt data: {str(e)}")

