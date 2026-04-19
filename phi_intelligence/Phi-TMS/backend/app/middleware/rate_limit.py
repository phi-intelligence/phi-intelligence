"""Rate limiting middleware"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

from app.config import settings

# Create limiter
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
AUTH_RATE_LIMIT = f"{5}/{int(settings.RATE_LIMIT_WINDOW_MS / 1000)}seconds"
GENERAL_RATE_LIMIT = f"{settings.RATE_LIMIT_MAX_REQUESTS}/{int(settings.RATE_LIMIT_WINDOW_MS / 1000)}seconds"

def get_rate_limit_handler():
    """Get rate limit exceeded handler"""
    return _rate_limit_exceeded_handler

