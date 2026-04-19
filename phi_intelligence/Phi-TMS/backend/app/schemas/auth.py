"""Authentication Pydantic schemas"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

from app.models.enums import Role, Region


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Register request schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    role: Optional[Role] = Role.EMPLOYEE
    profile: "EmployeeProfileCreate"


class EmployeeProfileCreate(BaseModel):
    """Employee profile create schema"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)
    location: Region
    join_date: datetime


class ChangePasswordRequest(BaseModel):
    """Change password request schema"""
    old_password: str
    new_password: str = Field(..., min_length=8)


class UserResponse(BaseModel):
    """User response schema"""
    id: str
    email: str
    username: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional["EmployeeProfileResponse"] = None
    
    class Config:
        from_attributes = True


class EmployeeProfileResponse(BaseModel):
    """Employee profile response schema"""
    id: str
    user_id: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: str
    department: str
    location: str
    join_date: datetime
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Login response schema"""
    user: UserResponse
    token: str


# Update forward references
RegisterRequest.model_rebuild()
UserResponse.model_rebuild()

