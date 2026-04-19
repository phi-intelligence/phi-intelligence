"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from contextlib import asynccontextmanager
from datetime import datetime as dt
import asyncio
import logging

from app.config import settings, get_cors_allow_origins
from app.core.database import init_db, close_db, create_tables
from app.core.exceptions import AppError
from app.middleware.error_handler import error_handler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Starting application...")
    try:
        await init_db()
        logger.info("Database connected successfully")
        # Create tables if they don't exist (for SQLite development)
        await create_tables()
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

    # Background: auto-move overdue tasks to BACKLOG every hour
    from app.services.auto_backlog import auto_backlog_loop
    backlog_task = asyncio.create_task(auto_backlog_loop(), name="auto_backlog_loop")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    backlog_task.cancel()
    try:
        await backlog_task
    except (asyncio.CancelledError, Exception):
        pass
    await close_db()
    logger.info("Application shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Phi-TMS API",
    description="Project and Employee Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
app.add_exception_handler(AppError, error_handler)
app.add_exception_handler(RequestValidationError, error_handler)
app.add_exception_handler(StarletteHTTPException, error_handler)
app.add_exception_handler(Exception, error_handler)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "timestamp": dt.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            "environment": settings.NODE_ENV,
        }
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return JSONResponse(
        status_code=200,
        content={
            "name": "Phi-TMS API",
            "version": "1.0.0",
            "description": "Project and Employee Management System API",
            "frontend": "http://localhost:5173",
            "endpoints": {
                "health": "/health",
                "auth": "/api/auth",
                "employees": "/api/employees",
                "attendance": "/api/attendance",
                "leave": "/api/leave",
                "admin": "/api/admin",
                "projects": "/api/projects",
                "tasks": "/api/tasks",
                "timelogs": "/api/timelogs",
            },
            "documentation": "See README.md for API documentation",
        }
    )

# Include API routes
from app.api.v1 import auth, attendance, leave, employees, projects, tasks, timelogs, admin, ai, reports, attendance_policy, analytics
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["attendance"])
app.include_router(leave.router, prefix="/api/leave", tags=["leave"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(timelogs.router, prefix="/api/timelogs", tags=["timelogs"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(attendance_policy.router, prefix="/api/attendance", tags=["attendance-policy"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.NODE_ENV == "development",
    )

