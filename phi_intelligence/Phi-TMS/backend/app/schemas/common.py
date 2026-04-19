"""Common Pydantic schemas"""
from typing import Optional, Generic, TypeVar, List
from pydantic import BaseModel
from datetime import datetime

T = TypeVar('T')


class SuccessResponse(BaseModel):
    """Success response model"""
    success: bool = True
    message: str
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    message: str
    stack: Optional[str] = None


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    page: int
    limit: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response model"""
    success: bool = True
    message: str
    data: List[T]
    pagination: PaginationMeta

