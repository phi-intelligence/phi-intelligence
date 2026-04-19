"""Error handler middleware"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from jose.exceptions import JWTError
import logging

from app.core.exceptions import AppError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError, ConflictError
from app.config import settings

logger = logging.getLogger(__name__)


async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global error handler - handles all exceptions"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    message = "Internal Server Error"
    stack = None
    
    if isinstance(exc, AppError):
        status_code = exc.status_code
        message = exc.message
    elif isinstance(exc, AuthenticationError):
        status_code = status.HTTP_401_UNAUTHORIZED
        message = str(exc)
    elif isinstance(exc, AuthorizationError):
        status_code = status.HTTP_403_FORBIDDEN
        message = str(exc)
    elif isinstance(exc, NotFoundError):
        status_code = status.HTTP_404_NOT_FOUND
        message = str(exc)
    elif isinstance(exc, ValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
        message = str(exc)
    elif isinstance(exc, ConflictError):
        status_code = status.HTTP_409_CONFLICT
        message = str(exc)
    elif isinstance(exc, RequestValidationError):
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        message = "Validation error"
        if hasattr(exc, "errors") and exc.errors():
            error_detail = exc.errors()[0]
            if "msg" in error_detail:
                message = error_detail["msg"]
            elif "type" in error_detail:
                message = f"Validation error: {error_detail['type']}"
    elif isinstance(exc, JWTError):
        status_code = status.HTTP_401_UNAUTHORIZED
        if "expired" in str(exc).lower():
            message = "Token expired"
        else:
            message = "Invalid token"
    elif isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        message = exc.detail if hasattr(exc, "detail") else str(exc)
    else:
        message = str(exc) if str(exc) else "Internal Server Error"
        import traceback
        stack = traceback.format_exc()
        logger.error("Unhandled error: %s\n%s", exc, stack, exc_info=True)
    
    if status_code == 500:
        logger.error("500 on %s %s: %s", request.method, request.url.path, message)
    response_data = {
        "success": False,
        "message": message,
    }
    if stack and (getattr(settings, "NODE_ENV", None) == "development"):
        response_data["stack"] = stack
    return JSONResponse(status_code=status_code, content=response_data)

