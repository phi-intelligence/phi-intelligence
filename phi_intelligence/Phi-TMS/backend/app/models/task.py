"""Task models"""
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Index, Integer, UniqueConstraint, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import TaskStatus, Priority


class Task(Base):
    """Task model"""
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default=TaskStatus.TODO.value, index=True)
    priority = Column(String, nullable=False, default=Priority.MEDIUM.value, index=True)
    assignee_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=False)
    estimated_hours = Column(Float, nullable=True)
    actual_hours = Column(Float, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_date = Column(DateTime(timezone=True), nullable=True)
    parent_task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    tags = Column(JSON, nullable=False, default=[])  # List of tag strings
    labels = Column(JSON, nullable=False, default=[])  # List of label strings
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assignee_id])
    reporter = relationship("User", back_populates="reported_tasks", foreign_keys=[reporter_id])
    parent_task = relationship("Task", back_populates="sub_tasks", remote_side=[id], foreign_keys=[parent_task_id])
    sub_tasks = relationship("Task", back_populates="parent_task", foreign_keys=[parent_task_id])
    dependencies = relationship("TaskDependency", back_populates="task", foreign_keys="TaskDependency.task_id", cascade="all, delete-orphan")
    dependents = relationship("TaskDependency", back_populates="depends_on_task", foreign_keys="TaskDependency.depends_on_task_id", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    attachments = relationship("TaskAttachment", back_populates="task", cascade="all, delete-orphan")
    checklists = relationship("TaskChecklist", back_populates="task", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="task", cascade="all, delete-orphan")
    
    # Indexes defined via index=True on columns


class TaskDependency(Base):
    """TaskDependency model"""
    __tablename__ = "task_dependencies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    depends_on_task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    dependency_type = Column(String, nullable=False, default="FINISH_TO_START")
    
    # Relationships
    task = relationship("Task", back_populates="dependencies", foreign_keys=[task_id])
    depends_on_task = relationship("Task", back_populates="dependents", foreign_keys=[depends_on_task_id])
    
    __table_args__ = (
        UniqueConstraint("task_id", "depends_on_task_id", name="uq_task_dependencies_task_depends_on"),
    )


class TaskComment(Base):
    """TaskComment model"""
    __tablename__ = "task_comments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(String, nullable=False)
    mentions = Column(JSON, nullable=False, default=[])  # List of user IDs
    parent_comment_id = Column(String, ForeignKey("task_comments.id"), nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="comments")
    user = relationship("User", back_populates="task_comments")
    parent_comment = relationship("TaskComment", back_populates="replies", remote_side=[id], foreign_keys=[parent_comment_id])
    replies = relationship("TaskComment", back_populates="parent_comment", foreign_keys=[parent_comment_id])
    
    # Indexes defined via index=True on columns


class TaskAttachment(Base):
    """TaskAttachment model"""
    __tablename__ = "task_attachments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="attachments")
    uploaded_by = relationship("User", back_populates="task_attachments")
    
    # Index defined via index=True on column


class TaskChecklist(Base):
    """TaskChecklist model"""
    __tablename__ = "task_checklists"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    items = Column(JSON, nullable=False)  # Array of {id, text, isCompleted}
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="checklists")
    
    # Index defined via index=True on column

