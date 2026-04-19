"""Analytics service"""
from typing import Dict, Any, List
from datetime import date, datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.models.attendance import Attendance
from app.models.leave import LeaveRequest, LeaveBalance, LeaveType
from app.models.task import Task
from app.models.user import User
from app.models.enums import TaskStatus, LeaveRequestStatus, AttendanceStatus


async def attendance_analytics(
    db: AsyncSession,
    days: int = 30,
    user_id: str = None
) -> Dict[str, Any]:
    """Get attendance analytics"""
    end_date = date.today()
    start_date = end_date - relativedelta(days=days)
    
    query = Attendance.__table__.select().where(
        Attendance.date >= start_date,
        Attendance.date < end_date,
    )
    if user_id:
        query = query.where(Attendance.user_id == user_id)
    
    result = await db.execute(query)
    records = result.fetchall()
    
    # Daily summary
    daily = {}
    for r in records:
        d = str(r.date.date())
        if d not in daily:
            daily[d] = {"present": 0, "absent": 0, "late": 0, "total_hours": 0}
        if r.status == AttendanceStatus.PRESENT.value:
            daily[d]["present"] += 1
        elif r.status == AttendanceStatus.ABSENT.value:
            daily[d]["absent"] += 1
        if r.is_late:
            daily[d]["late"] += 1
        daily[d]["total_hours"] += r.total_hours or 0
    
    # Per-user summary
    user_stats = {}
    for r in records:
        uid = r.user_id
        if uid not in user_stats:
            user_stats[uid] = {"present": 0, "late": 0, "total_hours": 0}
        if r.status in [AttendanceStatus.PRESENT.value, AttendanceStatus.LATE.value]:
            user_stats[uid]["present"] += 1
        if r.is_late:
            user_stats[uid]["late"] += 1
        user_stats[uid]["total_hours"] += r.total_hours or 0
    
    return {
        "period": {"start": str(start_date), "end": str(end_date), "days": days},
        "daily_summary": daily,
        "per_user_summary": user_stats,
    }


async def leave_analytics(
    db: AsyncSession,
    year: int = None,
    user_id: str = None
) -> Dict[str, Any]:
    """Get leave analytics"""
    year = year or date.today().year
    start_date = date(year, 1, 1)
    end_date = date(year + 1, 1, 1)
    
    # Get leave requests
    query = LeaveRequest.__table__.select().where(
        LeaveRequest.created_at >= start_date,
        LeaveRequest.created_at < end_date,
    )
    if user_id:
        query = query.where(LeaveRequest.user_id == user_id)
    
    result = await db.execute(query)
    requests = result.fetchall()
    
    # By type
    by_type = {}
    for r in requests:
        lt = r.leave_type_id or "UNKNOWN"
        if lt not in by_type:
            by_type[lt] = {"pending": 0, "approved": 0, "rejected": 0, "days": 0}
        by_type[lt][r.status] += 1
        by_type[lt]["days"] += r.days or 0
    
    # By user
    by_user = {}
    for r in requests:
        uid = r.user_id
        if uid not in by_user:
            by_user[uid] = {"pending": 0, "approved": 0, "rejected": 0}
        by_user[uid][r.status] += 1
    
    # Pending approvals count
    pending_count = sum(1 for r in requests if r.status == LeaveRequestStatus.PENDING.value)
    
    return {
        "year": year,
        "by_type": by_type,
        "by_user": by_user,
        "pending_approvals": pending_count,
    }


async def workload_analytics(
    db: AsyncSession,
    user_id: str = None
) -> Dict[str, Any]:
    """Get workload analytics (tasks per assignee)"""
    query = select(Task).options(selectinload(Task.assignee))
    if user_id:
        query = query.where(Task.assignee_id == user_id)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    today = date.today()
    user_stats = {}
    
    for task in tasks:
        uid = task.assignee_id
        if not uid:
            continue
        if uid not in user_stats:
            user_stats[uid] = {"total": 0, "open": 0, "overdue": 0}
        
        user_stats[uid]["total"] += 1
        if task.status != TaskStatus.DONE.value:
            user_stats[uid]["open"] += 1
            if task.due_date and task.due_date < today:
                user_stats[uid]["overdue"] += 1
    
    return {"per_assignee": user_stats}
