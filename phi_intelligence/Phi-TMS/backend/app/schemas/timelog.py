"""TimeLog Pydantic schemas"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import Role


class LogTimeRequest(BaseModel):
    """Log time request schema"""
    project_id: str
    task_id: Optional[str] = None
    date: datetime
    hours: float = Field(..., gt=0, le=24)
    description: Optional[str] = Field(None, max_length=500)
    is_billable: bool = True


class UpdateTimeLogRequest(BaseModel):
    """Update time log request schema"""
    project_id: Optional[str] = None
    task_id: Optional[str] = None
    date: Optional[datetime] = None
    hours: Optional[float] = Field(None, gt=0, le=24)
    description: Optional[str] = Field(None, max_length=500)
    is_billable: Optional[bool] = None


class RejectTimeLogRequest(BaseModel):
    """Reject time log request schema"""
    reason: str = Field(..., min_length=5, max_length=500)


class TimeLogUserResponse(BaseModel):
    """TimeLog user response schema (nested)"""
    id: str
    username: str
    email: Optional[str] = None
    profile: Optional[dict] = None
    
    class Config:
        from_attributes = True


class TimeLogProjectResponse(BaseModel):
    """TimeLog project response schema (nested)"""
    id: str
    name: str
    project_code: str
    
    class Config:
        from_attributes = True


class TimeLogTaskResponse(BaseModel):
    """TimeLog task response schema (nested)"""
    id: str
    title: str
    
    class Config:
        from_attributes = True


class TimeLogResponse(BaseModel):
    """TimeLog response schema"""
    id: str
    user_id: str
    project_id: str
    task_id: Optional[str] = None
    date: datetime
    hours: float
    description: Optional[str] = None
    is_billable: bool
    hourly_rate: Optional[float] = None
    approved_by_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[TimeLogUserResponse] = None
    project: Optional[TimeLogProjectResponse] = None
    task: Optional[TimeLogTaskResponse] = None
    approved_by: Optional[TimeLogUserResponse] = None
    
    class Config:
        from_attributes = True


class TimesheetResponse(BaseModel):
    """Timesheet response schema"""
    user_id: str
    start_date: datetime
    end_date: datetime
    time_logs: List[TimeLogResponse]
    summary: dict


class ProjectTimeReportResponse(BaseModel):
    """Project time report response schema"""
    project_id: str
    project_name: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_hours: float
    total_entries: int
    by_user: List[dict]
    time_logs: List[TimeLogResponse]


class PendingApprovalsResponse(BaseModel):
    """Pending approvals response schema"""
    pending_count: int
    time_logs: List[TimeLogResponse]

