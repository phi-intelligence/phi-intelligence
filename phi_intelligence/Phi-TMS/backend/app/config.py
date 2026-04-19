"""Application configuration"""
from pydantic_settings import BaseSettings
import os
from pathlib import Path
from dotenv import load_dotenv

# Load the TMS-local .env first (highest priority) then the website's .env as
# a fallback so shared secrets (GEMINI / GOOGLE_API_KEY, Neon DATABASE_URL)
# only have to live in one place.
load_dotenv()  # Phi-TMS/backend/.env
_WEBSITE_ENV = Path(__file__).resolve().parents[3] / ".env"
if _WEBSITE_ENV.exists():
    load_dotenv(_WEBSITE_ENV, override=False)


def _pick_tms_database_url() -> str:
    """Prefer TMS_DATABASE_URL so we don't accidentally share the website's
    Drizzle schema in the same Postgres database. Fall back to DATABASE_URL
    and finally to local SQLite."""
    explicit = os.getenv("TMS_DATABASE_URL")
    if explicit:
        return explicit
    shared = os.getenv("DATABASE_URL")
    if shared and "sqlite" in shared:
        return shared
    # If the website's DATABASE_URL points at a Postgres (e.g. Neon), do NOT
    # adopt it silently — the schemas don't overlap. Keep SQLite for dev.
    return "sqlite:///./phi_tms.db"


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    NODE_ENV: str = os.getenv("NODE_ENV", "development")
    PORT: int = int(os.getenv("PORT", "5000"))
    
    # Database
    # Default to SQLite for local development. To use Postgres, set
    # TMS_DATABASE_URL (not DATABASE_URL, which the corporate site owns).
    DATABASE_URL: str = _pick_tms_database_url()
    
    # JWT
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "your-super-secret-jwt-key-change-in-production"
    )
    JWT_EXPIRES_IN: str = os.getenv("JWT_EXPIRES_IN", "24h")
    JWT_ALGORITHM: str = "HS256"
    
    # Encryption
    ENCRYPTION_KEY: str = os.getenv(
        "ENCRYPTION_KEY",
        "your-32-char-encryption-key-here"
    )
    
    # CORS
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    
    # Rate Limiting
    RATE_LIMIT_WINDOW_MS: int = int(os.getenv("RATE_LIMIT_WINDOW_MS", "900000"))
    RATE_LIMIT_MAX_REQUESTS: int = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
    
    # Password
    BCRYPT_ROUNDS: int = 10

    # AI / Gemini
    # The website stores the same key under GOOGLE_API_KEY — accept either so
    # a single .env is enough for the whole monorepo.
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_cors_allow_origins() -> list[str]:
    """Origins allowed by CORSMiddleware. Supports comma-separated CORS_ORIGINS or legacy CORS_ORIGIN."""
    default = (
        "http://localhost:5173,http://localhost:5000,http://localhost:5180,"
        "http://127.0.0.1:5000,http://127.0.0.1:5180,http://127.0.0.1:5173"
    )
    raw = os.getenv("CORS_ORIGINS") or os.getenv("CORS_ORIGIN", default)
    return [o.strip() for o in raw.split(",") if o.strip()]

