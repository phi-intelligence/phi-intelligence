"""Employee Pydantic schemas"""
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

from app.models.enums import Role, Region


class UpdateEmployeeRequest(BaseModel):
    """Update employee request schema"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    role: Optional[Role] = None
    is_active: Optional[bool] = None
    profile: Optional["UpdateEmployeeProfileRequest"] = None


class UpdateEmployeeProfileRequest(BaseModel):
    """Update employee profile request schema"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[Region] = None
    emergency_contact: Optional[str] = None
    bank_details: Optional[str] = None  # Will be encrypted
    avatar_url: Optional[str] = None


class UpdateEmployeeProfileRequestPublic(BaseModel):
    """Update employee profile request schema (public - no sensitive data)"""
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    avatar_url: Optional[str] = None


# Update forward references
UpdateEmployeeRequest.model_rebuild()

