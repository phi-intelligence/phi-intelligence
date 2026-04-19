"""User model"""
from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import Role


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default=Role.EMPLOYEE.value)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    profile = relationship("EmployeeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    leave_balances = relationship("LeaveBalance", back_populates="user", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="user", foreign_keys="LeaveRequest.user_id", cascade="all, delete-orphan")
    approved_leaves = relationship("LeaveRequest", back_populates="approver", foreign_keys="LeaveRequest.approver_id")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    
    # Phase 2: Project Relations
    created_projects = relationship("Project", back_populates="created_by", foreign_keys="Project.created_by_id", cascade="all, delete-orphan")
    led_projects = relationship("Project", back_populates="project_lead", foreign_keys="Project.project_lead_id")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    reported_tasks = relationship("Task", back_populates="reporter", foreign_keys="Task.reporter_id", cascade="all, delete-orphan")
    task_comments = relationship("TaskComment", back_populates="user", cascade="all, delete-orphan")
    task_attachments = relationship("TaskAttachment", back_populates="uploaded_by", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="user", foreign_keys="TimeLog.user_id", cascade="all, delete-orphan")
    project_documents = relationship("ProjectDocument", back_populates="uploaded_by", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    time_log_approvals = relationship("TimeLog", back_populates="approver", foreign_keys="TimeLog.approved_by_id")
    daily_reports = relationship("DailyReport", back_populates="user", cascade="all, delete-orphan")
    
    # Phase 3: Payroll Relations
    salary_structure = relationship("SalaryStructure", back_populates="user", uselist=False, cascade="all, delete-orphan")
    payroll_entries = relationship("PayrollEntry", back_populates="user", cascade="all, delete-orphan")
    processed_payrolls = relationship("PayrollCycle", back_populates="processed_by", foreign_keys="PayrollCycle.processed_by_id")
    payroll_adjustments = relationship("PayrollAdjustment", back_populates="approved_by", foreign_keys="PayrollAdjustment.approved_by_id")
    project_costs = relationship("ProjectCostAllocation", back_populates="user", cascade="all, delete-orphan")
    generated_reports = relationship("PayrollReport", back_populates="generated_by", cascade="all, delete-orphan")
    
    __table_args__ = (
        # Note: email and is_active already have index=True on column definition
        Index("ix_users_role", "role"),
    )

