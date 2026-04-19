"""Admin service"""
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc, or_
from sqlalchemy.orm import selectinload
import calendar

from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.models.admin import AuditLog
from app.models.enums import LeaveRequestStatus, ProjectStatus, TaskStatus
from app.models.project import Project
from app.models.task import Task
from app.utils.date_utils import start_of_day, end_of_day


def start_of_month(date: datetime) -> datetime:
    """Get start of month for a given date"""
    return datetime(date.year, date.month, 1, 0, 0, 0)


def end_of_month(date: datetime) -> datetime:
    """Get end of month for a given date"""
    last_day = calendar.monthrange(date.year, date.month)[1]
    return datetime(date.year, date.month, last_day, 23, 59, 59)


async def get_dashboard_stats_service(
    db: AsyncSession
) -> Dict[str, Any]:
    """Get dashboard stats service"""
    today = datetime.utcnow()
    today_start = start_of_day(today)
    today_end = end_of_day(today)
    month_start = start_of_month(today)
    month_end = end_of_month(today)
    
    # Get total employees
    result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    total_employees = result.scalar() or 0
    
    # Get present today
    result = await db.execute(
        select(func.count(Attendance.id)).where(
            and_(
                Attendance.date >= today_start,
                Attendance.date <= today_end,
                Attendance.status == "PRESENT"
            )
        )
    )
    present_today = result.scalar() or 0
    
    # Get on leave today
    # Employee is on leave if start_date <= today and end_date >= today
    result = await db.execute(
        select(func.count(LeaveRequest.id)).where(
            and_(
                LeaveRequest.status == LeaveRequestStatus.APPROVED.value,
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today
            )
        )
    )
    on_leave_today = result.scalar() or 0
    
    # Get pending leave requests
    result = await db.execute(
        select(func.count(LeaveRequest.id)).where(
            LeaveRequest.status == LeaveRequestStatus.PENDING.value
        )
    )
    pending_leave_requests = result.scalar() or 0
    
    # Get this month's attendance stats
    result = await db.execute(
        select(
            func.sum(Attendance.total_hours).label("total_hours"),
            func.sum(Attendance.overtime_hours).label("overtime_hours"),
            func.count(Attendance.id).label("count")
        ).where(
            and_(
                Attendance.date >= month_start,
                Attendance.date <= month_end
            )
        )
    )
    month_attendance_row = result.first()
    
    monthly_attendance = {
        "total_records": month_attendance_row.count or 0,
        "total_hours": float(month_attendance_row.total_hours or 0),
        "overtime_hours": float(month_attendance_row.overtime_hours or 0),
    }
    
    # Recent activity (last 10 audit logs)
    result = await db.execute(
        select(AuditLog).options(
            selectinload(AuditLog.user).selectinload(User.profile)
        ).order_by(desc(AuditLog.timestamp)).limit(10)
    )
    recent_activity_logs = result.scalars().all()
    
    # Format recent activity
    recent_activity = []
    for log in recent_activity_logs:
        recent_activity.append({
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp,
            "user": {
                "email": log.user.email if log.user else None,
                "profile": {
                    "first_name": log.user.profile.first_name if log.user and log.user.profile else None,
                    "last_name": log.user.profile.last_name if log.user and log.user.profile else None,
                } if log.user and log.user.profile else None,
            } if log.user else None,
        })
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "on_leave_today": on_leave_today,
        "pending_leave_requests": pending_leave_requests,
        "monthly_attendance": monthly_attendance,
        "recent_activity": recent_activity,
    }


async def get_audit_logs_service(
    db: AsyncSession,
    entity: Optional[str] = None,
    user_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = 1,
    limit: int = 50
) -> Dict[str, Any]:
    """Get audit logs service"""
    # Build query
    query = select(AuditLog)
    
    conditions = []
    
    if entity:
        conditions.append(AuditLog.entity == entity)
    
    if user_id:
        conditions.append(AuditLog.user_id == user_id)
    
    if start_date and end_date:
        conditions.append(
            and_(
                AuditLog.timestamp >= start_date,
                AuditLog.timestamp <= end_date,
            )
        )
    elif start_date:
        conditions.append(AuditLog.timestamp >= start_date)
    elif end_date:
        conditions.append(AuditLog.timestamp <= end_date)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Get total count
    count_query = select(func.count(AuditLog.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))
    result = await db.execute(count_query)
    total = result.scalar() or 0
    
    # Get paginated logs
    skip = (page - 1) * limit
    query = query.options(
        selectinload(AuditLog.user).selectinload(User.profile)
    ).order_by(desc(AuditLog.timestamp)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Format response
    log_list = []
    for log in logs:
        log_list.append({
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp,
            "user": {
                "email": log.user.email if log.user else None,
                "profile": {
                    "first_name": log.user.profile.first_name if log.user and log.user.profile else None,
                    "last_name": log.user.profile.last_name if log.user and log.user.profile else None,
                } if log.user and log.user.profile else None,
            } if log.user else None,
        })
    
    return {
        "logs": log_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 0,
        },
    }


def _full_name(profile: Optional[EmployeeProfile]) -> Optional[str]:
    if not profile:
        return None
    parts = [profile.first_name, profile.last_name]
    name = " ".join(p for p in parts if p)
    return name or None


async def get_live_dashboard_service(db: AsyncSession) -> Dict[str, Any]:
    """Real-time workforce + project dashboard for the admin home page.

    Returns a single JSON payload the admin dashboard can render without
    issuing extra round-trips: who's clocked in right now, hours logged
    today, tasks completed in the last 24h with employee names, and a
    progress card for every active project.
    """
    today = datetime.utcnow()
    today_start = start_of_day(today)
    today_end = end_of_day(today)
    yesterday = today - timedelta(days=1)

    # ---- workforce snapshot ------------------------------------------------
    result = await db.execute(
        select(Attendance)
        .options(selectinload(Attendance.user).selectinload(User.profile))
        .where(
            and_(
                Attendance.date >= today_start,
                Attendance.date <= today_end,
            )
        )
    )
    today_records = result.scalars().all()

    clocked_in: List[Dict[str, Any]] = []
    finished_today: List[Dict[str, Any]] = []
    total_hours_today = 0.0
    for rec in today_records:
        user = rec.user
        if user is None:
            continue
        name = _full_name(getattr(user, "profile", None)) or user.username or user.email
        if rec.clock_in and not rec.clock_out:
            clocked_in.append(
                {
                    "user_id": user.id,
                    "name": name,
                    "clock_in": rec.clock_in.isoformat() if rec.clock_in else None,
                }
            )
        elif rec.clock_in and rec.clock_out:
            finished_today.append(
                {
                    "user_id": user.id,
                    "name": name,
                    "hours": float(rec.total_hours or 0),
                    "clock_out": rec.clock_out.isoformat() if rec.clock_out else None,
                }
            )
        if rec.total_hours:
            total_hours_today += float(rec.total_hours)

    # ---- project progress --------------------------------------------------
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.project_lead).selectinload(User.profile),
            selectinload(Project.members),
        )
        .where(
            Project.status.in_(
                [ProjectStatus.PLANNING.value, ProjectStatus.ACTIVE.value, ProjectStatus.ON_HOLD.value]
            )
        )
        .order_by(Project.created_at.desc())
        .limit(20)
    )
    projects = result.scalars().all()

    project_ids = [p.id for p in projects]
    project_progress: List[Dict[str, Any]] = []
    if project_ids:
        # Aggregate task counts in one query
        task_rows = await db.execute(
            select(
                Task.project_id,
                Task.status,
                func.count(Task.id),
                func.coalesce(func.sum(Task.estimated_hours), 0.0),
                func.coalesce(func.sum(Task.actual_hours), 0.0),
            )
            .where(Task.project_id.in_(project_ids))
            .group_by(Task.project_id, Task.status)
        )
        per_project: Dict[str, Dict[str, Any]] = {
            pid: {
                "total": 0,
                "by_status": {s.value: 0 for s in TaskStatus},
                "estimated_hours": 0.0,
                "actual_hours": 0.0,
            }
            for pid in project_ids
        }
        for project_id, status_value, count, est, act in task_rows.all():
            entry = per_project[project_id]
            entry["total"] += count
            entry["by_status"][status_value] = count
            entry["estimated_hours"] += float(est or 0)
            entry["actual_hours"] += float(act or 0)

        for project in projects:
            agg = per_project[project.id]
            done = agg["by_status"].get(TaskStatus.DONE.value, 0)
            in_progress = agg["by_status"].get(TaskStatus.IN_PROGRESS.value, 0)
            blocked = agg["by_status"].get(TaskStatus.BLOCKED.value, 0)
            todo = agg["by_status"].get(TaskStatus.TODO.value, 0)
            in_review = agg["by_status"].get(TaskStatus.IN_REVIEW.value, 0)
            percent = round((done / agg["total"]) * 100) if agg["total"] else 0
            lead = project.project_lead
            project_progress.append(
                {
                    "id": project.id,
                    "name": project.name,
                    "status": project.status,
                    "lead": (
                        {
                            "id": lead.id,
                            "name": _full_name(getattr(lead, "profile", None)) or lead.username,
                        }
                        if lead
                        else None
                    ),
                    "members": len(project.members or []) + 1,
                    "task_counts": {
                        "total": agg["total"],
                        "todo": todo,
                        "in_progress": in_progress,
                        "in_review": in_review,
                        "blocked": blocked,
                        "done": done,
                    },
                    "estimated_hours": agg["estimated_hours"],
                    "actual_hours": agg["actual_hours"],
                    "progress_percent": percent,
                }
            )

    # ---- tasks completed in last 24h --------------------------------------
    result = await db.execute(
        select(Task)
        .options(
            selectinload(Task.assignee).selectinload(User.profile),
            selectinload(Task.project),
        )
        .where(
            and_(
                Task.status == TaskStatus.DONE.value,
                or_(
                    Task.completed_date >= yesterday,
                    Task.updated_at >= yesterday,
                ),
            )
        )
        .order_by(desc(Task.updated_at))
        .limit(15)
    )
    completed_recent_rows = result.scalars().all()
    completed_recent: List[Dict[str, Any]] = []
    for task in completed_recent_rows:
        completed_recent.append(
            {
                "id": task.id,
                "title": task.title,
                "project": {"id": task.project.id, "name": task.project.name} if task.project else None,
                "assignee": (
                    {
                        "id": task.assignee.id,
                        "name": _full_name(getattr(task.assignee, "profile", None)) or task.assignee.username,
                    }
                    if task.assignee
                    else None
                ),
                "completed_at": (task.completed_date or task.updated_at).isoformat()
                if (task.completed_date or task.updated_at)
                else None,
                "actual_hours": float(task.actual_hours or 0),
            }
        )

    return {
        "generated_at": today.isoformat(),
        "workforce": {
            "clocked_in": clocked_in,
            "finished_today": finished_today,
            "clocked_in_count": len(clocked_in),
            "total_hours_today": round(total_hours_today, 2),
        },
        "projects": project_progress,
        "completed_recent": completed_recent,
    }

