"""Attendance API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import ValidationError, NotFoundError
from app.middleware.audit_log import create_audit_log
from app.services.attendance_service import (
    clock_in_service,
    clock_out_service,
    start_break_service,
    end_break_service,
    get_my_attendance_service,
    get_today_status_service,
    get_employee_attendance_service,
    get_attendance_report_service,
    update_attendance_service,
    get_daily_roster_service,
)
from app.schemas.attendance import AttendanceResponse, UpdateAttendanceRequest
from app.utils.response import success_response
from app.utils.attendance_serializer import attendance_to_camel
from app.models.user import User
from app.models.enums import Role

router = APIRouter()


@router.post("/clock-in")
async def clock_in(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock in endpoint"""
    try:
        attendance = await clock_in_service(db, current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CLOCK_IN",
            entity="ATTENDANCE",
            entity_id=attendance.id,
            new_value=str(attendance.__dict__),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Clocked in successfully", attendance_to_camel(attendance), status_code=status.HTTP_201_CREATED)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/clock-out")
async def clock_out(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clock out endpoint"""
    try:
        attendance = await clock_out_service(db, current_user.id)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CLOCK_OUT",
            entity="ATTENDANCE",
            entity_id=attendance.id,
            new_value=str(attendance.__dict__),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Clocked out successfully", attendance_to_camel(attendance))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/break-start")
async def start_break(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start break endpoint"""
    try:
        attendance = await start_break_service(db, current_user.id)
        return success_response("Break started", attendance_to_camel(attendance))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/break-end")
async def end_break(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """End break endpoint"""
    try:
        attendance = await end_break_service(db, current_user.id)
        return success_response("Break ended", attendance_to_camel(attendance))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/daily-status")
async def get_daily_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily status endpoint"""
    try:
        status_data = await get_today_status_service(db, current_user.id)
        if status_data:
            return success_response("Daily status retrieved", attendance_to_camel(status_data))
        return success_response("Daily status retrieved", None)
    except Exception as e:
        import logging
        logging.getLogger("app.api.v1.attendance").exception("daily-status failed: %s", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/my-attendance")
async def get_my_attendance(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get my attendance endpoint"""
    try:
        attendance_list = await get_my_attendance_service(db, current_user.id, start_date, end_date)
        # Avoid serialising SQLAlchemy `__dict__` (it carries _sa_instance_state
        # which is not JSON serialisable). Use the camelCase serialiser the
        # rest of this router already uses.
        attendance_dicts = [attendance_to_camel(att) for att in attendance_list]
        return success_response("Attendance retrieved successfully", attendance_dicts)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/employee/{employee_id}")
async def get_employee_attendance(
    employee_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Get employee attendance endpoint"""
    try:
        attendance_list = await get_employee_attendance_service(db, employee_id, start_date, end_date)
        return success_response("Employee attendance retrieved", attendance_list)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/report")
async def get_attendance_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Get attendance report endpoint"""
    try:
        filters = {
            "start_date": start_date,
            "end_date": end_date,
            "department": department,
            "location": location,
            "status": status,
        }
        report = await get_attendance_report_service(db, filters)
        return success_response("Attendance report generated", report)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/roster")
async def get_daily_roster(
    date: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Get daily roster endpoint"""
    try:
        roster = await get_daily_roster_service(db, date)
        return success_response("Daily roster retrieved", roster)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/{attendance_id}")
async def update_attendance(
    attendance_id: str,
    update_data: UpdateAttendanceRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN))
):
    """Update attendance endpoint"""
    try:
        attendance = await update_attendance_service(db, attendance_id, update_data.model_dump(exclude_unset=True))
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="UPDATE_ATTENDANCE",
            entity="ATTENDANCE",
            entity_id=attendance_id,
            new_value=str(attendance.__dict__),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Attendance updated successfully", attendance_to_camel(attendance))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

