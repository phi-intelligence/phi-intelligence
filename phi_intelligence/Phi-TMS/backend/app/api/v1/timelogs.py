"""TimeLog API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.middleware.audit_log import create_audit_log
from app.services.timelog_service import (
    log_time_service,
    get_time_logs_service,
    get_time_log_by_id_service,
    update_time_log_service,
    delete_time_log_service,
    approve_time_log_service,
    reject_time_log_service,
    get_user_timesheet_service,
    get_project_time_report_service,
    get_pending_approvals_service,
)
from app.schemas.timelog import (
    LogTimeRequest,
    UpdateTimeLogRequest,
    RejectTimeLogRequest,
)
from app.utils.response import success_response
from app.models.user import User
from app.models.enums import Role

router = APIRouter()


@router.get("/pending-approvals")
async def get_pending_approvals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending approvals endpoint"""
    try:
        approvals = await get_pending_approvals_service(db, current_user.id, current_user.role)
        return success_response("Pending approvals retrieved successfully", approvals)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/timesheet/{user_id}")
async def get_user_timesheet(
    user_id: str,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user timesheet endpoint"""
    try:
        timesheet = await get_user_timesheet_service(
            db,
            user_id,
            start_date,
            end_date,
            current_user.id,
            current_user.role
        )
        return success_response("Timesheet retrieved successfully", timesheet)
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/project/{project_id}/report")
async def get_project_time_report(
    project_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project time report endpoint"""
    try:
        report = await get_project_time_report_service(
            db,
            project_id,
            start_date,
            end_date,
            current_user.id,
            current_user.role
        )
        return success_response("Project time report retrieved successfully", report)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/")
async def log_time(
    time_log_data: LogTimeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log time endpoint"""
    try:
        data = time_log_data.model_dump()
        time_log = await log_time_service(db, current_user.id, data)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="LOG_TIME",
            entity="TIME_LOG",
            entity_id=time_log["id"],
            new_value=str(time_log),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Time logged successfully", time_log, status_code=status.HTTP_201_CREATED)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/")
async def get_time_logs(
    user_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    task_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    is_approved: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time logs endpoint"""
    try:
        filters = {
            "user_id": user_id,
            "project_id": project_id,
            "task_id": task_id,
            "start_date": start_date,
            "end_date": end_date,
            "is_approved": is_approved,
        }
        time_logs = await get_time_logs_service(db, filters, current_user.id, current_user.role)
        return success_response("Time logs retrieved successfully", time_logs)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{time_log_id}")
async def get_time_log_by_id(
    time_log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get time log by ID endpoint"""
    try:
        time_log = await get_time_log_by_id_service(db, time_log_id, current_user.id, current_user.role)
        return success_response("Time log retrieved successfully", time_log)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{time_log_id}")
async def update_time_log(
    time_log_id: str,
    time_log_data: UpdateTimeLogRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update time log endpoint"""
    try:
        data = time_log_data.model_dump(exclude_unset=True)
        time_log = await update_time_log_service(db, time_log_id, data, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_TIME_LOG",
            entity="TIME_LOG",
            entity_id=time_log_id,
            new_value=str(data),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Time log updated successfully", time_log)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/{time_log_id}")
async def delete_time_log(
    time_log_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete time log endpoint"""
    try:
        result = await delete_time_log_service(db, time_log_id, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="DELETE_TIME_LOG",
            entity="TIME_LOG",
            entity_id=time_log_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Time log deleted successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{time_log_id}/approve")
async def approve_time_log(
    time_log_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve time log endpoint"""
    try:
        time_log = await approve_time_log_service(db, time_log_id, current_user.id, current_user.role)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="APPROVE_TIME_LOG",
            entity="TIME_LOG",
            entity_id=time_log_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Time log approved successfully", time_log)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{time_log_id}/reject")
async def reject_time_log(
    time_log_id: str,
    reject_data: RejectTimeLogRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject time log endpoint"""
    try:
        result = await reject_time_log_service(
            db,
            time_log_id,
            current_user.id,
            reject_data.reason,
            current_user.role
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="REJECT_TIME_LOG",
            entity="TIME_LOG",
            entity_id=time_log_id,
            new_value=reject_data.reason,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Time log rejected successfully", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AuthorizationError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



