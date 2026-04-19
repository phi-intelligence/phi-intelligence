"""Project models"""
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Index, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import ProjectStatus, Region, Priority


class Project(Base):
    """Project model"""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    client_name = Column(String, nullable=True)
    project_code = Column(String, unique=True, nullable=False, index=True)
    status = Column(String, nullable=False, default=ProjectStatus.PLANNING.value, index=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    project_lead_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    budget = Column(Float, nullable=True)
    region = Column(String, nullable=False, default=Region.BOTH.value)
    priority = Column(String, nullable=False, default=Priority.MEDIUM.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project_lead = relationship("User", back_populates="led_projects", foreign_keys=[project_lead_id])
    created_by = relationship("User", back_populates="created_projects", foreign_keys=[created_by_id])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("ProjectDocument", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    cost_allocations = relationship("ProjectCostAllocation", back_populates="project", cascade="all, delete-orphan")
    
    # Indexes defined via index=True on columns


class ProjectMember(Base):
    """ProjectMember model"""
    __tablename__ = "project_members"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # e.g., "DEVELOPER", "DESIGNER", "QA"
    allocation_percentage = Column(Integer, nullable=False, default=100)
    joined_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    left_date = Column(DateTime(timezone=True), nullable=True)
    hours_allocated = Column(Float, nullable=True)
    hours_logged = Column(Float, nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
    
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", name="uq_project_members_project_user"),
    )


class ProjectDocument(Base):
    """ProjectDocument model"""
    __tablename__ = "project_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    category = Column(String, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="documents")
    uploaded_by = relationship("User", back_populates="project_documents")
    
    # Index defined via index=True on column


class Milestone(Base):
    """Milestone model"""
    __tablename__ = "milestones"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="PENDING")
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="milestones")
    
    # Index defined via index=True on column

