"""Attendance Policy model"""
from sqlalchemy import Column, String, Integer, Time, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from datetime import time
import uuid

from app.core.database import Base


class AttendancePolicy(Base):
    """Attendance policy settings"""
    __tablename__ = "attendance_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    expected_start_time = Column(Time, nullable=False, default=time(9, 0))
    grace_period_minutes = Column(Integer, nullable=False, default=15)
    late_threshold_minutes = Column(Integer, nullable=False, default=30)
    working_days = Column(JSON, nullable=False, default=[0, 1, 2, 3, 4])  # 0=Monday, 6=Sunday
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
