"""Leave Pydantic schemas"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import LeaveRequestStatus, Region


class RequestLeaveRequest(BaseModel):
    """Request leave request schema"""
    leave_type_id: str
    start_date: datetime
    end_date: datetime
    reason: Optional[str] = None


class ApproveLeaveRequest(BaseModel):
    """Approve leave request schema"""
    pass  # No additional fields needed


class RejectLeaveRequest(BaseModel):
    """Reject leave request schema"""
    reason: Optional[str] = None


class LeaveRequestResponse(BaseModel):
    """Leave request response schema"""
    id: str
    user_id: str
    leave_type_id: str
    start_date: datetime
    end_date: datetime
    total_days: float
    reason: Optional[str] = None
    status: str
    approver_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


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


class LeaveBalanceResponse(BaseModel):
    """Leave balance response schema"""
    id: str
    user_id: str
    leave_type_id: str
    year: int
    total_days: float
    used_days: float
    remaining_days: float
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

