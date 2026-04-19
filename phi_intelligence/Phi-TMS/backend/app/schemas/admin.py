"""Admin Pydantic schemas"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import Region


class CreateLeaveTypeRequest(BaseModel):
    """Create leave type request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    region: Region
    days_allowed: int = Field(..., gt=0)
    accrual_rate: Optional[float] = Field(None, gt=0)
    carry_forward: bool = False
    is_encashable: bool = False
    description: Optional[str] = Field(None, max_length=500)


class UpdateLeaveTypeRequest(BaseModel):
    """Update leave type request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    region: Optional[Region] = None
    days_allowed: Optional[int] = Field(None, gt=0)
    accrual_rate: Optional[float] = Field(None, gt=0)
    carry_forward: Optional[bool] = None
    is_encashable: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class CreatePublicHolidayRequest(BaseModel):
    """Create public holiday request schema"""
    name: str = Field(..., min_length=1, max_length=100)
    date: datetime
    region: Region
    description: Optional[str] = Field(None, max_length=500)


class LeaveTypeResponse(BaseModel):
    """Leave type response schema"""
    id: str
    name: str
    region: str
    days_allowed: int
    accrual_rate: Optional[float] = None
    carry_forward: bool
    is_encashable: bool
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PublicHolidayResponse(BaseModel):
    """Public holiday response schema"""
    id: str
    name: str
    date: datetime
    region: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AuditLogUserResponse(BaseModel):
    """Audit log user response schema (nested)"""
    email: str
    profile: Optional[dict] = None
    
    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    """Audit log response schema"""
    id: str
    user_id: Optional[str] = None
    action: str
    entity: str
    entity_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
    user: Optional[AuditLogUserResponse] = None
    
    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    """Dashboard stats response schema"""
    total_employees: int
    present_today: int
    on_leave_today: int
    pending_leave_requests: int
    monthly_attendance: dict
    recent_activity: List[AuditLogResponse]

