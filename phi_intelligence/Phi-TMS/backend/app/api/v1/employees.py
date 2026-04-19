"""Employees API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus
from app.services.employee_service import (
    get_all_employees_service,
    get_employee_by_id_service,
    get_employee_profile_service,
    update_employee_service,
    update_employee_profile_service,
)
from app.core.exceptions import NotFoundError
from app.utils.response import success_response

router = APIRouter()


@router.get("")
async def list_employees(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all employees (admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    filters = {}
    if status_filter is not None:
        if status_filter.upper() == "ACTIVE":
            filters["is_active"] = True
        elif status_filter.upper() == "INACTIVE":
            filters["is_active"] = False
    result = await get_all_employees_service(db, filters or None)
    return success_response("Employees retrieved", result)


@router.get("/me")
async def get_my_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's employee profile"""
    try:
        profile = await get_employee_profile_service(db, str(current_user.id))
        return success_response("Profile retrieved", profile)
    except NotFoundError:
        return success_response("Profile retrieved", None)


@router.patch("/me")
async def update_my_profile(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's employee profile (limited fields)"""
    allowed_fields = ["phone", "address", "emergency_contact"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Allowed fields: {allowed_fields}")
    try:
        profile = await update_employee_profile_service(db, str(current_user.id), update_data)
        return success_response("Profile updated", profile)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


@router.get("/{employee_id}")
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get employee by ID (admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    try:
        employee = await get_employee_by_id_service(db, employee_id)
        return success_response("Employee retrieved", employee)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")


@router.put("/{employee_id}")
async def update_employee(
    employee_id: str,
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update employee (admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    try:
        employee = await update_employee_service(db, employee_id, data)
        return success_response("Employee updated", employee)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")


@router.get("/{employee_id}/attendance-summary")
async def get_attendance_summary(
    employee_id: str,
    month: int = Query(None),
    year: int = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendance summary for an employee"""
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"] and current_user.id != employee_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    
    today = date.today()
    month = month or today.month
    year = year or today.year
    
    start_date = date(year, month, 1)
    end_date = start_date + relativedelta(months=1)
    
    result = await db.execute(
        Attendance.__table__.select().where(
            Attendance.user_id == employee_id,
            Attendance.date >= start_date,
            Attendance.date < end_date,
        )
    )
    records = result.fetchall()
    
    days_present = sum(1 for r in records if r.status in [AttendanceStatus.PRESENT.value, AttendanceStatus.LATE.value])
    days_late = sum(1 for r in records if r.is_late == True)
    total_hours = sum((r.total_hours or 0) for r in records)
    total_minutes = sum((r.total_work_minutes or 0) for r in records)
    
    return success_response("Attendance summary", {
        "employee_id": employee_id,
        "month": month,
        "year": year,
        "days_present": days_present,
        "days_late": days_late,
        "total_hours": round(total_hours, 2),
        "total_work_minutes": total_minutes,
        "working_days": (end_date - start_date).days,
    })
