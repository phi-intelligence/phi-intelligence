"""Attendance model"""
from sqlalchemy import Column, String, DateTime, Float, Boolean, Integer, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import AttendanceStatus


class Attendance(Base):
    """Attendance model"""
    __tablename__ = "attendances"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    clock_in = Column(DateTime(timezone=True), nullable=True)
    clock_out = Column(DateTime(timezone=True), nullable=True)
    break_start = Column(DateTime(timezone=True), nullable=True)
    break_end = Column(DateTime(timezone=True), nullable=True)
    total_hours = Column(Float, nullable=True)
    total_work_minutes = Column(Integer, nullable=True)
    overtime_hours = Column(Float, nullable=True)
    is_late = Column(Boolean, default=False)
    status = Column(String, nullable=False, default=AttendanceStatus.PRESENT.value, index=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="attendances")
    
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_attendances_user_id_date"),
    )
