"""TimeLog model"""
from sqlalchemy import Column, String, DateTime, Float, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base


class TimeLog(Base):
    """TimeLog model"""
    __tablename__ = "time_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    hours = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    is_billable = Column(Boolean, nullable=False, default=False)
    hourly_rate = Column(Float, nullable=True)
    approved_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="time_logs", foreign_keys=[user_id])
    project = relationship("Project", back_populates="time_logs")
    task = relationship("Task", back_populates="time_logs")
    approver = relationship("User", back_populates="time_log_approvals", foreign_keys=[approved_by_id])
    
    # Indexes defined via index=True on columns


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., "TASK_ASSIGNED", "MENTION", "LEAVE_APPROVED"
    entity_id = Column(String, nullable=True)  # ID of related entity (task, leave request, etc.)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    # Indexes defined via index=True on columns

