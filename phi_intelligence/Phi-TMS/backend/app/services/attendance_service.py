"""Attendance service"""
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.core.exceptions import ValidationError, NotFoundError
from app.models.attendance import Attendance
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.leave import LeaveRequest
from app.models.enums import AttendanceStatus
from app.utils.date_utils import calculate_total_hours, calculate_overtime_hours, get_today_range
from app.utils.regions import get_region_config


async def clock_in_service(db: AsyncSession, user_id: str) -> Attendance:
    """Clock in service"""
    start, end = get_today_range()
    
    # Check if already clocked in today (and not clocked out)
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end
        )
    )
    existing_attendance = result.scalar_one_or_none()
    
    if existing_attendance and existing_attendance.clock_in and not existing_attendance.clock_out:
        raise ValidationError("Already clocked in today")
    
    # Create new attendance record
    attendance = Attendance(
        user_id=user_id,
        date=datetime.utcnow(),
        clock_in=datetime.utcnow(),
        status=AttendanceStatus.PRESENT.value,
    )
    
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    
    return attendance


async def clock_out_service(db: AsyncSession, user_id: str) -> Attendance:
    """Clock out service"""
    start, end = get_today_range()
    
    # Find the active attendance session (clocked in but not clocked out)
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end,
            Attendance.clock_in.isnot(None),
            Attendance.clock_out.is_(None)
        ).order_by(Attendance.clock_in.desc())
    )
    attendance = result.scalar_one_or_none()
    
    if not attendance:
        raise ValidationError("Not clocked in")
    
    clock_out_time = datetime.utcnow()
    
    # Calculate hours
    total_hours = calculate_total_hours(
        attendance.clock_in,
        clock_out_time,
        attendance.break_start,
        attendance.break_end
    )
    
    # Get user's region for overtime calculation
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    location = user.profile.location if user and user.profile else "UK"
    region_config = get_region_config(location)
    standard_hours = region_config.get("standard_work_hours", 8.0)
    overtime_hours = calculate_overtime_hours(total_hours, standard_hours)
    
    # Update attendance
    attendance.clock_out = clock_out_time
    attendance.total_hours = total_hours
    attendance.overtime_hours = overtime_hours
    
    await db.commit()
    await db.refresh(attendance)
    
    return attendance


async def start_break_service(db: AsyncSession, user_id: str) -> Attendance:
    """Start break service"""
    start, end = get_today_range()
    
    # Find the active attendance session (clocked in but not clocked out)
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end,
            Attendance.clock_in.isnot(None),
            Attendance.clock_out.is_(None)
        ).order_by(Attendance.clock_in.desc())
    )
    attendance = result.scalar_one_or_none()
    
    if not attendance:
        raise ValidationError("Must be clocked in to start break")
    
    if attendance.break_start and not attendance.break_end:
        raise ValidationError("Already on break")
    
    attendance.break_start = datetime.utcnow()
    await db.commit()
    await db.refresh(attendance)
    
    return attendance


async def end_break_service(db: AsyncSession, user_id: str) -> Attendance:
    """End break service"""
    start, end = get_today_range()
    
    # Find the active attendance session with an active break
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end,
            Attendance.clock_in.isnot(None),
            Attendance.clock_out.is_(None),
            Attendance.break_start.isnot(None),
            Attendance.break_end.is_(None)
        ).order_by(Attendance.clock_in.desc())
    )
    attendance = result.scalar_one_or_none()
    
    if not attendance:
        raise ValidationError("Not currently on break")
    
    attendance.break_end = datetime.utcnow()
    await db.commit()
    await db.refresh(attendance)
    
    return attendance


async def get_my_attendance_service(
    db: AsyncSession,
    user_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Attendance]:
    """Get my attendance service"""
    conditions = [Attendance.user_id == user_id]
    
    if start_date and end_date:
        conditions.append(Attendance.date >= start_date)
        conditions.append(Attendance.date <= end_date)
    
    result = await db.execute(
        select(Attendance).where(and_(*conditions)).order_by(Attendance.date.desc())
    )
    attendance_list = result.scalars().all()
    
    return list(attendance_list)


async def get_today_status_service(db: AsyncSession, user_id: str) -> Optional[Attendance]:
    """Get today status service"""
    start, end = get_today_range()
    
    # First, try to find the active session (clocked in, not clocked out)
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end,
            Attendance.clock_in.isnot(None),
            Attendance.clock_out.is_(None)
        ).order_by(Attendance.clock_in.desc()).limit(1)
    )
    active_attendance = result.scalars().first()
    
    if active_attendance:
        return active_attendance
    
    # Otherwise, return the most recent completed session
    result = await db.execute(
        select(Attendance).where(
            Attendance.user_id == user_id,
            Attendance.date >= start,
            Attendance.date <= end
        ).order_by(Attendance.updated_at.desc()).limit(1)
    )
    attendance = result.scalars().first()
    
    return attendance


async def get_employee_attendance_service(
    db: AsyncSession,
    employee_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """Get employee attendance service"""
    conditions = [Attendance.user_id == employee_id]
    
    if start_date and end_date:
        conditions.append(Attendance.date >= start_date)
        conditions.append(Attendance.date <= end_date)
    
    result = await db.execute(
        select(Attendance).options(selectinload(Attendance.user)).where(and_(*conditions)).order_by(Attendance.date.desc())
    )
    attendance_list = result.scalars().all()
    
    # Format response
    formatted_attendance = []
    for att in attendance_list:
        formatted_attendance.append({
            "id": att.id,
            "user_id": att.user_id,
            "date": att.date,
            "clock_in": att.clock_in,
            "clock_out": att.clock_out,
            "break_start": att.break_start,
            "break_end": att.break_end,
            "total_hours": att.total_hours,
            "overtime_hours": att.overtime_hours,
            "status": att.status,
            "notes": att.notes,
            "created_at": att.created_at,
            "updated_at": att.updated_at,
            "user": {
                "id": att.user.id,
                "email": att.user.email,
                "profile": {
                    "first_name": att.user.profile.first_name if att.user.profile else None,
                    "last_name": att.user.profile.last_name if att.user.profile else None,
                    "designation": att.user.profile.designation if att.user.profile else None,
                } if att.user.profile else None,
            } if att.user else None,
        })
    
    return formatted_attendance


async def get_attendance_report_service(
    db: AsyncSession,
    filters: Dict[str, Any]
) -> Dict[str, Any]:
    """Get attendance report service"""
    start_date = filters.get("start_date")
    end_date = filters.get("end_date")
    department = filters.get("department")
    location = filters.get("location")
    status = filters.get("status")
    
    conditions = []
    
    if start_date and end_date:
        conditions.append(Attendance.date >= start_date)
        conditions.append(Attendance.date <= end_date)
    
    if status:
        conditions.append(Attendance.status == status)
    
    # Build query with joins for filtering by department/location
    query = select(Attendance).options(selectinload(Attendance.user).selectinload(User.profile))
    
    if department or location:
        query = query.join(User).join(EmployeeProfile)
        if department:
            conditions.append(EmployeeProfile.department == department)
        if location:
            conditions.append(EmployeeProfile.location == location)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(Attendance.date.desc())
    
    result = await db.execute(query)
    attendance_list = result.scalars().all()
    
    # Format response
    formatted_attendance = []
    for att in attendance_list:
        formatted_attendance.append({
            "id": att.id,
            "user_id": att.user_id,
            "date": att.date,
            "clock_in": att.clock_in,
            "clock_out": att.clock_out,
            "break_start": att.break_start,
            "break_end": att.break_end,
            "total_hours": att.total_hours,
            "overtime_hours": att.overtime_hours,
            "status": att.status,
            "notes": att.notes,
            "user": {
                "id": att.user.id,
                "email": att.user.email,
                "profile": {
                    "first_name": att.user.profile.first_name if att.user.profile else None,
                    "last_name": att.user.profile.last_name if att.user.profile else None,
                    "designation": att.user.profile.designation if att.user.profile else None,
                    "department": att.user.profile.department if att.user.profile else None,
                    "location": att.user.profile.location if att.user.profile else None,
                } if att.user.profile else None,
            } if att.user else None,
        })
    
    # Calculate summary statistics
    summary = {
        "total_records": len(formatted_attendance),
        "present_count": len([a for a in formatted_attendance if a["status"] == "PRESENT"]),
        "absent_count": len([a for a in formatted_attendance if a["status"] == "ABSENT"]),
        "late_count": len([a for a in formatted_attendance if a["status"] == "LATE"]),
        "total_hours": sum([a["total_hours"] or 0 for a in formatted_attendance]),
        "total_overtime_hours": sum([a["overtime_hours"] or 0 for a in formatted_attendance]),
    }
    
    return {
        "attendance": formatted_attendance,
        "summary": summary,
    }


async def update_attendance_service(
    db: AsyncSession,
    attendance_id: str,
    data: Dict[str, Any]
) -> Attendance:
    """Update attendance service"""
    result = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    attendance = result.scalar_one_or_none()
    
    if not attendance:
        raise NotFoundError("Attendance record not found")
    
    # Recalculate hours if times are updated
    clock_in = data.get("clock_in") or attendance.clock_in
    clock_out = data.get("clock_out") or attendance.clock_out
    break_start = data.get("break_start") or attendance.break_start
    break_end = data.get("break_end") or attendance.break_end
    
    if clock_in and clock_out:
        total_hours = calculate_total_hours(clock_in, clock_out, break_start, break_end)
        
        # Get user's region for overtime calculation
        result = await db.execute(
            select(User).options(selectinload(User.profile)).where(User.id == attendance.user_id)
        )
        user = result.scalar_one_or_none()
        
        location = user.profile.location if user and user.profile else "UK"
        region_config = get_region_config(location)
        standard_hours = region_config.get("standard_work_hours", 8.0)
        overtime_hours = calculate_overtime_hours(total_hours, standard_hours)
        
        attendance.total_hours = total_hours
        attendance.overtime_hours = overtime_hours
    
    # Update other fields
    if "status" in data:
        attendance.status = data["status"]
    if "notes" in data:
        attendance.notes = data["notes"]
    if "clock_in" in data:
        attendance.clock_in = data["clock_in"]
    if "clock_out" in data:
        attendance.clock_out = data["clock_out"]
    if "break_start" in data:
        attendance.break_start = data["break_start"]
    if "break_end" in data:
        attendance.break_end = data["break_end"]
    
    await db.commit()
    await db.refresh(attendance)
    
    return attendance


async def get_daily_roster_service(
    db: AsyncSession,
    target_date: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """Get daily roster service"""
    if not target_date:
        target_date = datetime.utcnow()
    
    # Get start and end of target date
    target_date_only = target_date.date()
    start = datetime.combine(target_date_only, datetime.min.time())
    end = datetime.combine(target_date_only, datetime.max.time())
    
    # Get attendance for the date
    result = await db.execute(
        select(Attendance).options(selectinload(Attendance.user).selectinload(User.profile)).where(
            Attendance.date >= start,
            Attendance.date <= end
        ).order_by(Attendance.clock_in.asc())
    )
    attendance_list = result.scalars().all()
    
    # Get all active employees
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.is_active == True)
    )
    all_employees = result.scalars().all()
    
    # Check for approved leaves on this date
    result = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.status == "APPROVED",
            LeaveRequest.start_date <= target_date,
            LeaveRequest.end_date >= target_date
        )
    )
    leaves = result.scalars().all()
    on_leave_user_ids = [leave.user_id for leave in leaves]
    
    # Combine data
    roster = []
    for employee in all_employees:
        attendance_record = next(
            (a for a in attendance_list if a.user_id == employee.id),
            None
        )
        is_on_leave = employee.id in on_leave_user_ids
        
        status = "ON_LEAVE" if is_on_leave else (
            "CLOCKED_OUT" if attendance_record and attendance_record.clock_out else (
                "CLOCKED_IN" if attendance_record else "NOT_CLOCKED_IN"
            )
        )
        
        roster.append({
            "id": employee.id,
            "email": employee.email,
            "profile": {
                "first_name": employee.profile.first_name if employee.profile else None,
                "last_name": employee.profile.last_name if employee.profile else None,
                "designation": employee.profile.designation if employee.profile else None,
                "department": employee.profile.department if employee.profile else None,
            } if employee.profile else None,
            "attendance": {
                "id": attendance_record.id,
                "clock_in": attendance_record.clock_in,
                "clock_out": attendance_record.clock_out,
                "break_start": attendance_record.break_start,
                "break_end": attendance_record.break_end,
                "total_hours": attendance_record.total_hours,
                "status": attendance_record.status,
            } if attendance_record else None,
            "is_on_leave": is_on_leave,
            "status": status,
        })
    
    return roster

