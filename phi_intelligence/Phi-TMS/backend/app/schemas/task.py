"""Task Pydantic schemas"""
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import TaskStatus, Priority


class CreateTaskRequest(BaseModel):
    """Create task request schema"""
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[Priority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    estimated_hours: Optional[float] = Field(None, gt=0)
    tags: Optional[List[str]] = None
    labels: Optional[List[str]] = None
    parent_task_id: Optional[str] = None


class UpdateTaskRequest(BaseModel):
    """Update task request schema"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    start_date: Optional[datetime] = None
    estimated_hours: Optional[float] = Field(None, gt=0)
    actual_hours: Optional[float] = Field(None, ge=0)
    tags: Optional[List[str]] = None
    labels: Optional[List[str]] = None


class UpdateTaskStatusRequest(BaseModel):
    """Update task status request schema"""
    status: TaskStatus


class AssignTaskRequest(BaseModel):
    """Assign task request schema"""
    assignee_id: Optional[str] = None


class AddDependencyRequest(BaseModel):
    """Add dependency request schema"""
    depends_on_task_id: str


class AddCommentRequest(BaseModel):
    """Add comment request schema"""
    content: str = Field(..., min_length=1, max_length=2000)
    mentions: Optional[List[str]] = None


class ReorderTasksRequest(BaseModel):
    """Reorder tasks request schema"""
    project_id: str
    task_ids: List[str] = Field(..., min_length=1)


class TaskUserResponse(BaseModel):
    """Task user response schema (nested)"""
    id: str
    username: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True


class TaskUserProfileResponse(BaseModel):
    """Task user profile response schema (nested)"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class TaskAssigneeResponse(BaseModel):
    """Task assignee response schema"""
    id: str
    username: str
    email: Optional[str] = None
    profile: Optional[TaskUserProfileResponse] = None
    
    class Config:
        from_attributes = True


class TaskReporterResponse(BaseModel):
    """Task reporter response schema"""
    id: str
    username: str
    profile: Optional[TaskUserProfileResponse] = None
    
    class Config:
        from_attributes = True


class TaskCommentResponse(BaseModel):
    """Task comment response schema"""
    id: str
    task_id: str
    user_id: str
    content: str
    mentions: List[str]
    created_at: datetime
    updated_at: datetime
    user: Optional[TaskUserResponse] = None
    
    class Config:
        from_attributes = True


class TaskAttachmentResponse(BaseModel):
    """Task attachment response schema"""
    id: str
    task_id: str
    file_name: str
    file_path: str
    file_size: int
    uploaded_by_id: str
    uploaded_at: datetime
    uploaded_by: Optional[TaskUserResponse] = None
    
    class Config:
        from_attributes = True


class TaskDependencyResponse(BaseModel):
    """Task dependency response schema"""
    id: str
    task_id: str
    depends_on_task_id: str
    depends_on_task: Optional["TaskResponse"] = None
    
    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    """Task response schema"""
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee_id: Optional[str] = None
    reporter_id: str
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    parent_task_id: Optional[str] = None
    tags: List[str]
    labels: List[str]
    order_index: int
    created_at: datetime
    updated_at: datetime
    assignee: Optional[TaskAssigneeResponse] = None
    reporter: Optional[TaskReporterResponse] = None
    parent_task: Optional["TaskResponse"] = None
    sub_tasks: Optional[List["TaskResponse"]] = None
    dependencies: Optional[List[TaskDependencyResponse]] = None
    dependents: Optional[List[TaskDependencyResponse]] = None
    comments: Optional[List[TaskCommentResponse]] = None
    attachments: Optional[List[TaskAttachmentResponse]] = None
    
    class Config:
        from_attributes = True


# Update forward references
TaskDependencyResponse.model_rebuild()
TaskResponse.model_rebuild()

