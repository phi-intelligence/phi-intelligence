"""Leave models"""
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import Region, LeaveRequestStatus


class LeaveType(Base):
    """LeaveType model"""
    __tablename__ = "leave_types"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    region = Column(String, nullable=False, index=True)  # Region enum
    days_allowed = Column(Integer, nullable=False)
    accrual_rate = Column(Float, nullable=True)
    carry_forward = Column(Boolean, nullable=False, default=False)
    is_encashable = Column(Boolean, nullable=False, default=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    leave_balances = relationship("LeaveBalance", back_populates="leave_type", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="leave_type", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint("name", "region", name="uq_leave_types_name_region"),
    )


class LeaveBalance(Base):
    """LeaveBalance model"""
    __tablename__ = "leave_balances"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type_id = Column(String, ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    total_days = Column(Float, nullable=False)
    used_days = Column(Float, nullable=False, default=0)
    remaining_days = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="leave_balances")
    leave_type = relationship("LeaveType", back_populates="leave_balances")
    
    __table_args__ = (
        UniqueConstraint("user_id", "leave_type_id", "year", name="uq_leave_balances_user_leave_type_year"),
    )


class LeaveRequest(Base):
    """LeaveRequest model"""
    __tablename__ = "leave_requests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type_id = Column(String, ForeignKey("leave_types.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True), nullable=False, index=True)
    total_days = Column(Float, nullable=False)
    reason = Column(String, nullable=True)
    status = Column(String, nullable=False, default=LeaveRequestStatus.PENDING.value, index=True)
    approver_id = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="leave_requests", foreign_keys=[user_id])
    leave_type = relationship("LeaveType", back_populates="leave_requests")
    approver = relationship("User", back_populates="approved_leaves", foreign_keys=[approver_id])
    
    __table_args__ = (
        Index("ix_leave_requests_start_end_date", "start_date", "end_date"),
        # Other indexes via index=True
    )


class PublicHoliday(Base):
    """PublicHoliday model"""
    __tablename__ = "public_holidays"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    region = Column(String, nullable=False, index=True)  # Region enum
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint("date", "region", name="uq_public_holidays_date_region"),
    )

