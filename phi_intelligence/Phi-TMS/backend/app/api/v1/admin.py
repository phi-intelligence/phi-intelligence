"""Admin API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.middleware.audit_log import create_audit_log
from app.services.admin_service import (
    get_dashboard_stats_service,
    get_audit_logs_service,
    get_live_dashboard_service,
)
from app.services.leave_service import (
    create_leave_type_service,
    update_leave_type_service,
    create_public_holiday_service,
    delete_public_holiday_service,
)
from app.schemas.admin import (
    CreateLeaveTypeRequest,
    UpdateLeaveTypeRequest,
    CreatePublicHolidayRequest,
)
from app.utils.response import success_response, paginated_response
from app.models.user import User
from app.models.enums import Role

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Get dashboard stats endpoint"""
    try:
        stats = await get_dashboard_stats_service(db)
        return success_response("Dashboard stats retrieved", stats)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/dashboard/live")
async def get_live_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Live workforce + per-project progress snapshot for the admin dashboard."""
    try:
        data = await get_live_dashboard_service(db)
        return success_response("Live dashboard retrieved", data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/leave-types")
async def create_leave_type(
    leave_type_data: CreateLeaveTypeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Create leave type endpoint"""
    try:
        data = leave_type_data.model_dump()
        leave_type = await create_leave_type_service(db, data)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_LEAVE_TYPE",
            entity="LEAVE_TYPE",
            entity_id=leave_type["id"],
            new_value=str(leave_type),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave type created", leave_type, status_code=status.HTTP_201_CREATED)
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/leave-types/{leave_type_id}")
async def update_leave_type(
    leave_type_id: str,
    leave_type_data: UpdateLeaveTypeRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Update leave type endpoint"""
    try:
        data = leave_type_data.model_dump(exclude_unset=True)
        leave_type = await update_leave_type_service(db, leave_type_id, data)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_LEAVE_TYPE",
            entity="LEAVE_TYPE",
            entity_id=leave_type_id,
            new_value=str(leave_type),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave type updated", leave_type)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/holidays")
async def create_public_holiday(
    holiday_data: CreatePublicHolidayRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Create public holiday endpoint"""
    try:
        data = holiday_data.model_dump()
        holiday = await create_public_holiday_service(db, data)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_PUBLIC_HOLIDAY",
            entity="PUBLIC_HOLIDAY",
            entity_id=holiday["id"],
            new_value=str(holiday),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Public holiday created", holiday, status_code=status.HTTP_201_CREATED)
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/holidays/{holiday_id}")
async def delete_public_holiday(
    holiday_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Delete public holiday endpoint"""
    try:
        result = await delete_public_holiday_service(db, holiday_id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="DELETE_PUBLIC_HOLIDAY",
            entity="PUBLIC_HOLIDAY",
            entity_id=holiday_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Public holiday deleted", result)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/audit-logs")
async def get_audit_logs(
    entity: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Get audit logs endpoint"""
    try:
        result = await get_audit_logs_service(
            db,
            entity=entity,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            page=page,
            limit=limit
        )
        return paginated_response(
            "Audit logs retrieved",
            result["logs"],
            result["pagination"]
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

