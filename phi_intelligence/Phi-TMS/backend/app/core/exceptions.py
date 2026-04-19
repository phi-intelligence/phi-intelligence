"""Custom exceptions"""
from fastapi import HTTPException, status
from typing import Any, Optional


class AppError(Exception):
    """Base application error"""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        self.is_operational = True
        super().__init__(self.message)


class NotFoundError(AppError):
    """Resource not found error"""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ValidationError(AppError):
    """Validation error"""
    
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=400)


class AuthenticationError(AppError):
    """Authentication error"""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(AppError):
    """Authorization error"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403)


class ConflictError(AppError):
    """Conflict error"""
    
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status_code=409)

