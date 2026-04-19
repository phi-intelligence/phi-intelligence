"""Attendance Pydantic schemas"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import AttendanceStatus


class AttendanceResponse(BaseModel):
    """Attendance response schema"""
    id: str
    user_id: str
    date: datetime
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    total_hours: Optional[float] = None
    overtime_hours: Optional[float] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UpdateAttendanceRequest(BaseModel):
    """Update attendance request schema"""
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None

