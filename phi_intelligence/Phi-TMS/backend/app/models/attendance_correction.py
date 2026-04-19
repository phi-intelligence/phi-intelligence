"""Attendance Correction model"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base
from app.models.enums import LeaveRequestStatus


class AttendanceCorrection(Base):
    """Attendance correction request"""
    __tablename__ = "attendance_corrections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attendance_id = Column(String(36), ForeignKey("attendances.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    requested_clock_in = Column(DateTime, nullable=True)
    requested_clock_out = Column(DateTime, nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(Enum(LeaveRequestStatus), default=LeaveRequestStatus.PENDING)
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
