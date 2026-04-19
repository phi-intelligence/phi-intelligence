"""Task API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.middleware.audit_log import create_audit_log
from app.services.task_service import (
    get_task_by_id_service,
    get_my_tasks_service,
    update_task_service,
    delete_task_service,
    update_task_status_service,
    assign_task_service,
    add_dependency_service,
    remove_dependency_service,
    add_comment_service,
    reorder_tasks_service,
)
from app.schemas.task import (
    UpdateTaskRequest,
    UpdateTaskStatusRequest,
    AssignTaskRequest,
    AddDependencyRequest,
    AddCommentRequest,
    ReorderTasksRequest,
)
from app.services.auto_backlog import sweep_overdue_to_backlog
from app.utils.response import success_response
from app.models.user import User
from app.models.enums import Role, TaskStatus

router = APIRouter()


@router.get("/my-tasks")
async def get_my_tasks(
    status: Optional[TaskStatus] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's assigned tasks endpoint"""
    try:
        tasks = await get_my_tasks_service(db, current_user.id, status)
        return success_response("My tasks retrieved successfully", tasks)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/auto-backlog")
async def run_auto_backlog(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD)),
):
    """Force an auto-backlog sweep now (admin / project lead)."""
    try:
        moved = await sweep_overdue_to_backlog()
        return success_response(
            f"Auto-backlog sweep complete - {moved} task(s) moved to BACKLOG",
            {"moved": moved},
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/reorder")
async def reorder_tasks(
    reorder_data: ReorderTasksRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reorder tasks endpoint"""
    try:
        result = await reorder_tasks_service(
            db,
            reorder_data.project_id,
            reorder_data.task_ids,
            current_user.id,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="REORDER_TASKS",
            entity="TASK",
            entity_id=reorder_data.project_id,
            new_value=str(reorder_data.task_ids),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Tasks reordered successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{task_id}")
async def get_task_by_id(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task by ID endpoint"""
    try:
        task = await get_task_by_id_service(db, task_id, current_user.id, current_user.role)
        return success_response("Task retrieved successfully", task)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_data: UpdateTaskRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task endpoint"""
    try:
        data = task_data.model_dump(exclude_unset=True)
        task = await update_task_service(db, task_id, data, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_TASK",
            entity="TASK",
            entity_id=task_id,
            new_value=str(data),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Task updated successfully", task)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete task endpoint"""
    try:
        result = await delete_task_service(db, task_id, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="DELETE_TASK",
            entity="TASK",
            entity_id=task_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Task deleted successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{task_id}/status")
async def update_task_status(
    task_id: str,
    status_data: UpdateTaskStatusRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task status endpoint"""
    try:
        task = await update_task_status_service(
            db, task_id, status_data.status, current_user.id, current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_TASK_STATUS",
            entity="TASK",
            entity_id=task_id,
            new_value=status_data.status.value,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Task status updated successfully", task)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{task_id}/assign")
async def assign_task(
    task_id: str,
    assign_data: AssignTaskRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign task to user endpoint"""
    try:
        task = await assign_task_service(
            db,
            task_id,
            assign_data.assignee_id,
            current_user.id,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="ASSIGN_TASK",
            entity="TASK",
            entity_id=task_id,
            new_value=assign_data.assignee_id or "unassigned",
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Task assigned successfully", task)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{task_id}/dependencies")
async def add_dependency(
    task_id: str,
    dependency_data: AddDependencyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add dependency to task endpoint"""
    try:
        dependency = await add_dependency_service(
            db,
            task_id,
            dependency_data.depends_on_task_id,
            current_user.id,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="ADD_TASK_DEPENDENCY",
            entity="TASK",
            entity_id=task_id,
            new_value=dependency_data.depends_on_task_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Dependency added successfully", dependency, status_code=status.HTTP_201_CREATED)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{task_id}/dependencies/{depends_on_task_id}")
async def remove_dependency(
    task_id: str,
    depends_on_task_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove dependency from task endpoint"""
    try:
        result = await remove_dependency_service(
            db,
            task_id,
            depends_on_task_id,
            current_user.id,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="REMOVE_TASK_DEPENDENCY",
            entity="TASK",
            entity_id=task_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Dependency removed successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{task_id}/comments")
async def add_comment(
    task_id: str,
    comment_data: AddCommentRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add comment to task endpoint"""
    try:
        comment = await add_comment_service(
            db,
            task_id,
            comment_data.content,
            current_user.id,
            comment_data.mentions,
            current_user.role,
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="ADD_TASK_COMMENT",
            entity="TASK",
            entity_id=task_id,
            new_value=comment_data.content[:100],  # Truncate for audit log
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Comment added successfully", comment, status_code=status.HTTP_201_CREATED)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

