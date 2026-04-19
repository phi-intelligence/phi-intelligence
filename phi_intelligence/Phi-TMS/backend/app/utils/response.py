"""Response utilities"""
from typing import Any, Optional, Dict
from datetime import datetime, date
from fastapi.responses import JSONResponse
from fastapi import status as http_status


def _json_serial(obj: Any) -> Any:
    """Recursively make content JSON-serializable (datetime/date -> ISO string)."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _json_serial(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_json_serial(v) for v in obj]
    return obj


def success_response(
    message: str,
    data: Any = None,
    status_code: int = http_status.HTTP_200_OK
) -> JSONResponse:
    """Create success response"""
    response_data = {
        "success": True,
        "message": message,
    }
    if data is not None:
        response_data["data"] = _json_serial(data)
    return JSONResponse(status_code=status_code, content=response_data)


def error_response(
    message: str,
    status_code: int = http_status.HTTP_500_INTERNAL_SERVER_ERROR,
    stack: Optional[str] = None
) -> JSONResponse:
    """Create error response"""
    response_data = {
        "success": False,
        "message": message,
    }
    if stack:
        response_data["stack"] = stack
    
    return JSONResponse(status_code=status_code, content=response_data)


def paginated_response(
    message: str,
    data: list[Any],
    pagination: Dict[str, int]
) -> JSONResponse:
    """Create paginated response"""
    response_data = {
        "success": True,
        "message": message,
        "data": _json_serial(data),
        "pagination": pagination,
    }
    return JSONResponse(status_code=http_status.HTTP_200_OK, content=response_data)

