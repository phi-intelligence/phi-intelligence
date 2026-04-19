"""Project API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status as http_status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.middleware.audit_log import create_audit_log
from app.services.project_service import (
    create_project_service,
    get_project_by_id_service,
    get_all_projects_service,
    update_project_service,
    delete_project_service,
    add_team_member_service,
    remove_team_member_service,
    update_project_status_service,
    get_project_metrics_service,
    get_project_timeline_service,
)
from app.services.task_service import (
    create_task_service,
    get_project_tasks_service,
)
from app.schemas.project import (
    CreateProjectRequest,
    UpdateProjectRequest,
    UpdateProjectStatusRequest,
    AddTeamMemberRequest,
)
from app.schemas.task import (
    CreateTaskRequest,
)
from app.utils.response import success_response, paginated_response
from app.models.user import User
from app.models.enums import Role, ProjectStatus, Priority, TaskStatus
from datetime import datetime

router = APIRouter()


@router.get("/")
async def get_all_projects(
    status: Optional[ProjectStatus] = Query(None),
    project_lead_id: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    priority: Optional[Priority] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all projects endpoint"""
    try:
        filters = {
            "status": status.value if status else None,
            "project_lead_id": project_lead_id,
            "region": region,
            "priority": priority.value if priority else None,
            "search": search,
        }
        result = await get_all_projects_service(db, filters, current_user.id, current_user.role, page, limit)
        return paginated_response(
            "Projects retrieved successfully",
            result["projects"],
            result["pagination"]
        )
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/")
async def create_project(
    project_data: CreateProjectRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Create project endpoint (admin only — assign project lead and team in the form)."""
    try:
        project = await create_project_service(db, project_data.model_dump(), current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_PROJECT",
            entity="PROJECT",
            entity_id=project["id"],
            new_value=str(project),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Project created successfully", project, status_code=http_status.HTTP_201_CREATED)
    except ConflictError as e:
        raise HTTPException(status_code=http_status.HTTP_409_CONFLICT, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{project_id}")
async def get_project_by_id(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project by ID endpoint"""
    try:
        project = await get_project_by_id_service(db, project_id, current_user.id, current_user.role)
        return success_response("Project retrieved successfully", project)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{project_id}")
async def update_project(
    project_id: str,
    update_data: UpdateProjectRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project endpoint"""
    try:
        project = await update_project_service(db, project_id, update_data.model_dump(exclude_unset=True), current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_PROJECT",
            entity="PROJECT",
            entity_id=project_id,
            new_value=str(project),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Project updated successfully", project)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Delete project endpoint"""
    try:
        result = await delete_project_service(db, project_id, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="DELETE_PROJECT",
            entity="PROJECT",
            entity_id=project_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Project deleted successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{project_id}/members")
async def add_team_member(
    project_id: str,
    member_data: AddTeamMemberRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add team member endpoint"""
    try:
        member = await add_team_member_service(
            db,
            project_id,
            member_data.user_id,
            member_data.role,
            member_data.allocation_percentage,
            current_user.id,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="ADD_TEAM_MEMBER",
            entity="PROJECT_MEMBER",
            entity_id=member["id"],
            new_value=str(member),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Team member added successfully", member, status_code=http_status.HTTP_201_CREATED)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=http_status.HTTP_409_CONFLICT, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{project_id}/members/{user_id}")
async def remove_team_member(
    project_id: str,
    user_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove team member endpoint"""
    try:
        result = await remove_team_member_service(db, project_id, user_id, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="REMOVE_TEAM_MEMBER",
            entity="PROJECT_MEMBER",
            entity_id=user_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Team member removed successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{project_id}/status")
async def update_project_status(
    project_id: str,
    status_data: UpdateProjectStatusRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project status endpoint"""
    try:
        project = await update_project_status_service(db, project_id, status_data.status.value, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_PROJECT_STATUS",
            entity="PROJECT",
            entity_id=project_id,
            new_value=str(project),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Project status updated successfully", project)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{project_id}/metrics")
async def get_project_metrics(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project metrics endpoint"""
    try:
        metrics = await get_project_metrics_service(db, project_id, current_user.id, current_user.role)
        return success_response("Project metrics retrieved successfully", metrics)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{project_id}/timeline")
async def get_project_timeline(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project timeline endpoint"""
    try:
        timeline = await get_project_timeline_service(db, project_id, current_user.id, current_user.role)
        return success_response("Project timeline retrieved successfully", timeline)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{project_id}/tasks")
async def get_project_tasks(
    project_id: str,
    status: Optional[TaskStatus] = Query(None),
    assignee_id: Optional[str] = Query(None),
    priority: Optional[Priority] = Query(None),
    search: Optional[str] = Query(None),
    due_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project tasks endpoint"""
    try:
        filters = {
            "status": status.value if status else None,
            "assignee_id": assignee_id,
            "priority": priority.value if priority else None,
            "search": search,
            "due_date": due_date,
        }
        tasks = await get_project_tasks_service(
            db,
            project_id,
            filters,
            current_user.id,
            current_user.role
        )
        return success_response("Tasks retrieved successfully", tasks)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{project_id}/tasks")
async def create_project_task(
    project_id: str,
    task_data: CreateTaskRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create project task endpoint"""
    try:
        data = task_data.model_dump()
        data["project_id"] = project_id
        task = await create_task_service(db, data, current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_TASK",
            entity="TASK",
            entity_id=task["id"],
            new_value=str(task),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Task created successfully", task, status_code=http_status.HTTP_201_CREATED)
    except NotFoundError as e:
        raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=http_status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

