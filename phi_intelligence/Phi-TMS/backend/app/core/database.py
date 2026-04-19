"""Database configuration and session management"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from typing import AsyncGenerator
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Convert database URL to async driver format
def get_async_database_url(url: str) -> str:
    """Convert database URL to async driver format"""
    if url.startswith("sqlite:"):
        # SQLite: sqlite:/// -> sqlite+aiosqlite:///
        return url.replace("sqlite:", "sqlite+aiosqlite:", 1)
    elif url.startswith("postgresql:"):
        # PostgreSQL: postgresql:// -> postgresql+asyncpg://
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

DATABASE_URL = get_async_database_url(settings.DATABASE_URL)
IS_SQLITE = DATABASE_URL.startswith("sqlite")

# Create async engine with appropriate settings
engine_kwargs = {
    "echo": settings.NODE_ENV == "development",
    "future": True,
}

# SQLite doesn't support connection pooling the same way
if not IS_SQLITE:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    })
else:
    # SQLite needs check_same_thread=False for async
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database connection"""
    try:
        async with engine.begin() as conn:
            # Test connection
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        logger.info("Database connected successfully")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise


async def close_db() -> None:
    """Close database connection"""
    await engine.dispose()
    logger.info("Database disconnected")


# Columns that may be missing in older attendances table (name -> SQLite type for ALTER)
_ATTENDANCE_ADDITIONS = [
    ("total_work_minutes", "INTEGER NULL"),
    ("is_late", "INTEGER DEFAULT 0"),
]

async def _ensure_attendance_columns(conn) -> None:
    """For SQLite: add missing columns to attendances if table already existed with old schema."""
    from sqlalchemy import text
    result = await conn.execute(
        text("PRAGMA table_info(attendances)")
    )
    rows = result.fetchall()
    if not rows:
        return  # Table doesn't exist yet; create_all will create it
    existing = {row[1] for row in rows}
    for col_name, col_type in _ATTENDANCE_ADDITIONS:
        if col_name not in existing:
            await conn.execute(text(f"ALTER TABLE attendances ADD COLUMN {col_name} {col_type}"))
            logger.info("Added column attendances.%s", col_name)


async def create_tables() -> None:
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if IS_SQLITE:
            await _ensure_attendance_columns(conn)
    logger.info("Database tables created")

