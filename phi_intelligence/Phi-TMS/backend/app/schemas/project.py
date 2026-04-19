"""Project Pydantic schemas"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.models.enums import ProjectStatus, Priority, Region


class CreateProjectRequest(BaseModel):
    """Create project request schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    client_name: Optional[str] = None
    project_code: str = Field(..., min_length=1, max_length=50)
    start_date: datetime
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    budget: Optional[float] = None
    priority: Optional[Priority] = Priority.MEDIUM
    region: Optional[Region] = Region.BOTH
    project_lead_id: str


class UpdateProjectRequest(BaseModel):
    """Update project request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    client_name: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    budget: Optional[float] = None
    priority: Optional[Priority] = None
    project_lead_id: Optional[str] = None


class UpdateProjectStatusRequest(BaseModel):
    """Update project status request schema"""
    status: ProjectStatus


class AddTeamMemberRequest(BaseModel):
    """Add team member request schema"""
    user_id: str
    role: str = Field(..., min_length=1, max_length=50)
    allocation_percentage: int = Field(100, ge=0, le=100)


class ProjectResponse(BaseModel):
    """Project response schema"""
    id: str
    name: str
    description: Optional[str] = None
    client_name: Optional[str] = None
    project_code: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    budget: Optional[float] = None
    priority: str
    region: str
    project_lead_id: str
    created_by_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

