"""Leave API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import ValidationError, NotFoundError, ConflictError
from app.middleware.audit_log import create_audit_log
from app.services.leave_service import (
    get_leave_types_service,
    get_my_leave_balances_service,
    request_leave_service,
    get_my_leave_requests_service,
    get_pending_leave_requests_service,
    approve_leave_request_service,
    reject_leave_request_service,
    cancel_leave_request_service,
    get_leave_calendar_service,
    get_public_holidays_service,
)
from app.schemas.leave import RequestLeaveRequest, RejectLeaveRequest, LeaveTypeResponse
from app.utils.response import success_response
from app.models.user import User
from app.models.enums import Role

router = APIRouter()


@router.get("/types")
async def get_leave_types(
    region: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leave types endpoint"""
    try:
        leave_types = await get_leave_types_service(db, region)
        # Use the Pydantic response schema (from_attributes=True) so we don't
        # accidentally serialise the SQLAlchemy InstanceState attached to
        # `__dict__`, which crashes JSON encoding with
        # "Object of type InstanceState is not JSON serializable".
        payload = [LeaveTypeResponse.model_validate(lt).model_dump(mode="json") for lt in leave_types]
        return success_response("Leave types retrieved", payload)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/balance")
async def get_leave_balance(
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leave balance endpoint"""
    try:
        balances = await get_my_leave_balances_service(db, current_user.id, year)
        return success_response("Leave balances retrieved", balances)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/request")
async def request_leave(
    request: Request,
    leave_data: RequestLeaveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request leave endpoint"""
    try:
        leave_request = await request_leave_service(
            db,
            current_user.id,
            leave_data.leave_type_id,
            leave_data.start_date,
            leave_data.end_date,
            leave_data.reason
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_LEAVE_REQUEST",
            entity="LEAVE_REQUEST",
            entity_id=leave_request["id"],
            new_value=str(leave_request),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave request submitted", leave_request, status_code=status.HTTP_201_CREATED)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/my-requests")
async def get_my_leave_requests(
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get my leave requests endpoint"""
    try:
        requests = await get_my_leave_requests_service(db, current_user.id, status)
        return success_response("Leave requests retrieved", requests)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/requests")
async def get_pending_leave_requests(
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Get pending leave requests endpoint"""
    try:
        filters = {
            "department": department,
            "location": location,
        }
        requests = await get_pending_leave_requests_service(db, filters)
        return success_response("Pending leave requests retrieved", requests)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/requests/{request_id}/approve")
async def approve_leave_request(
    request_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Approve leave request endpoint"""
    try:
        leave_request = await approve_leave_request_service(db, request_id, current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="APPROVE_LEAVE_REQUEST",
            entity="LEAVE_REQUEST",
            entity_id=request_id,
            new_value=str(leave_request),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave request approved", leave_request)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/requests/{request_id}/reject")
async def reject_leave_request(
    request_id: str,
    reject_data: RejectLeaveRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Reject leave request endpoint"""
    try:
        leave_request = await reject_leave_request_service(db, request_id, current_user.id, reject_data.reason)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="REJECT_LEAVE_REQUEST",
            entity="LEAVE_REQUEST",
            entity_id=request_id,
            new_value=str(leave_request),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave request rejected", leave_request)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/requests/{request_id}")
async def cancel_leave_request(
    request_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel leave request endpoint"""
    try:
        leave_request = await cancel_leave_request_service(db, request_id, current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CANCEL_LEAVE_REQUEST",
            entity="LEAVE_REQUEST",
            entity_id=request_id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Leave request cancelled", leave_request)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/calendar")
async def get_leave_calendar(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    user_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leave calendar endpoint"""
    try:
        leaves = await get_leave_calendar_service(db, start_date, end_date, user_id)
        return success_response("Leave calendar retrieved", leaves)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/holidays")
async def get_public_holidays(
    region: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get public holidays endpoint"""
    try:
        holidays = await get_public_holidays_service(db, region, year)
        return success_response("Public holidays retrieved", holidays)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

