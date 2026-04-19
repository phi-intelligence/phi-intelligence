"""TimeLog service"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.models.project import Project, ProjectMember
from app.models.task import Task
from app.models.timelog import TimeLog
from app.models.user import User
from app.models.enums import Role
from app.utils.date_utils import start_of_day, end_of_day


async def log_time_service(
    db: AsyncSession,
    user_id: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Log time for a project/task"""
    # Verify project exists and user has access
    result = await db.execute(
        select(Project).options(
            selectinload(Project.members)
        ).where(Project.id == data["project_id"])
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Check if user is on the project team
    is_project_member = (
        project.project_lead_id == user_id or
        any(m.user_id == user_id for m in project.members)
    )
    
    if not is_project_member:
        raise AuthorizationError("You are not a member of this project")
    
    # If task specified, verify it exists and belongs to the project
    if data.get("task_id"):
        result = await db.execute(
            select(Task).where(Task.id == data["task_id"])
        )
        task = result.scalar_one_or_none()
        
        if not task:
            raise NotFoundError("Task not found")
        
        if task.project_id != data["project_id"]:
            raise ValidationError("Task does not belong to this project")
    
    # Validate hours (reasonable limits)
    if data["hours"] <= 0 or data["hours"] > 24:
        raise ValidationError("Hours must be between 0 and 24")
    
    # Create time log
    time_log = TimeLog(
        user_id=user_id,
        project_id=data["project_id"],
        task_id=data.get("task_id"),
        date=data["date"],
        hours=data["hours"],
        description=data.get("description"),
        is_billable=data.get("is_billable", True),
    )
    
    db.add(time_log)
    await db.commit()
    await db.refresh(time_log)
    
    # Update task actualHours if task is specified
    if data.get("task_id"):
        result = await db.execute(
            select(func.sum(TimeLog.hours)).where(TimeLog.task_id == data["task_id"])
        )
        task_hours = result.scalar() or 0.0
        
        result = await db.execute(select(Task).where(Task.id == data["task_id"]))
        task = result.scalar_one_or_none()
        if task:
            task.actual_hours = task_hours
            db.add(task)
    
    # Update project actualHours
    result = await db.execute(
        select(func.sum(TimeLog.hours)).where(TimeLog.project_id == data["project_id"])
    )
    project_hours = result.scalar() or 0.0
    
    project.actual_hours = project_hours
    db.add(project)
    await db.commit()
    
    # Get time log with relations
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project),
            selectinload(TimeLog.task),
            selectinload(TimeLog.user).selectinload(User.profile),
            selectinload(TimeLog.approver),
        ).where(TimeLog.id == time_log.id)
    )
    time_log_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": time_log_with_relations.id,
        "user_id": time_log_with_relations.user_id,
        "project_id": time_log_with_relations.project_id,
        "task_id": time_log_with_relations.task_id,
        "date": time_log_with_relations.date,
        "hours": time_log_with_relations.hours,
        "description": time_log_with_relations.description,
        "is_billable": time_log_with_relations.is_billable,
        "hourly_rate": time_log_with_relations.hourly_rate,
        "approved_by_id": time_log_with_relations.approved_by_id,
        "approved_at": time_log_with_relations.approved_at,
        "created_at": time_log_with_relations.created_at,
        "updated_at": time_log_with_relations.updated_at,
        "project": {
            "id": time_log_with_relations.project.id,
            "name": time_log_with_relations.project.name,
            "project_code": time_log_with_relations.project.project_code,
        } if time_log_with_relations.project else None,
        "task": {
            "id": time_log_with_relations.task.id,
            "title": time_log_with_relations.task.title,
        } if time_log_with_relations.task else None,
        "user": {
            "id": time_log_with_relations.user.id,
            "username": time_log_with_relations.user.username,
            "profile": {
                "first_name": time_log_with_relations.user.profile.first_name if time_log_with_relations.user.profile else None,
                "last_name": time_log_with_relations.user.profile.last_name if time_log_with_relations.user.profile else None,
            } if time_log_with_relations.user.profile else None,
        } if time_log_with_relations.user else None,
        "approved_by": {
            "id": time_log_with_relations.approver.id,
            "username": time_log_with_relations.approver.username,
        } if time_log_with_relations.approver else None,
    }


async def get_time_logs_service(
    db: AsyncSession,
    filters: Dict[str, Any],
    requesting_user_id: str,
    user_role: Role
) -> List[Dict[str, Any]]:
    """Get time logs with filters"""
    # Build query
    query = select(TimeLog)
    
    # Non-admins can only see their own time logs
    if user_role != Role.ADMIN:
        query = query.where(TimeLog.user_id == requesting_user_id)
    elif filters.get("user_id"):
        query = query.where(TimeLog.user_id == filters["user_id"])
    
    if filters.get("project_id"):
        query = query.where(TimeLog.project_id == filters["project_id"])
    
    if filters.get("task_id"):
        query = query.where(TimeLog.task_id == filters["task_id"])
    
    if filters.get("start_date") and filters.get("end_date"):
        start = start_of_day(filters["start_date"])
        end = end_of_day(filters["end_date"])
        query = query.where(
            and_(
                TimeLog.date >= start,
                TimeLog.date <= end,
            )
        )
    elif filters.get("start_date"):
        start = start_of_day(filters["start_date"])
        query = query.where(TimeLog.date >= start)
    elif filters.get("end_date"):
        end = end_of_day(filters["end_date"])
        query = query.where(TimeLog.date <= end)
    
    if filters.get("is_approved") is not None:
        if filters["is_approved"]:
            query = query.where(TimeLog.approved_by_id.isnot(None))
        else:
            query = query.where(TimeLog.approved_by_id.is_(None))
    
    # Add relations and ordering
    query = query.options(
        selectinload(TimeLog.project),
        selectinload(TimeLog.task),
        selectinload(TimeLog.user).selectinload(User.profile),
        selectinload(TimeLog.approver),
    ).order_by(desc(TimeLog.date))
    
    result = await db.execute(query)
    time_logs = result.scalars().all()
    
    # Format response
    time_log_list = []
    for time_log in time_logs:
        time_log_list.append({
            "id": time_log.id,
            "user_id": time_log.user_id,
            "project_id": time_log.project_id,
            "task_id": time_log.task_id,
            "date": time_log.date,
            "hours": time_log.hours,
            "description": time_log.description,
            "is_billable": time_log.is_billable,
            "hourly_rate": time_log.hourly_rate,
            "approved_by_id": time_log.approved_by_id,
            "approved_at": time_log.approved_at,
            "created_at": time_log.created_at,
            "updated_at": time_log.updated_at,
            "project": {
                "id": time_log.project.id,
                "name": time_log.project.name,
                "project_code": time_log.project.project_code,
            } if time_log.project else None,
            "task": {
                "id": time_log.task.id,
                "title": time_log.task.title,
            } if time_log.task else None,
            "user": {
                "id": time_log.user.id,
                "username": time_log.user.username,
                "profile": {
                    "first_name": time_log.user.profile.first_name if time_log.user.profile else None,
                    "last_name": time_log.user.profile.last_name if time_log.user.profile else None,
                } if time_log.user.profile else None,
            } if time_log.user else None,
            "approved_by": {
                "id": time_log.approver.id,
                "username": time_log.approver.username,
            } if time_log.approver else None,
        })
    
    return time_log_list


async def get_time_log_by_id_service(
    db: AsyncSession,
    time_log_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Get time log by ID"""
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project).selectinload(Project.project_lead),
            selectinload(TimeLog.task),
            selectinload(TimeLog.user).selectinload(User.profile),
            selectinload(TimeLog.approver),
        ).where(TimeLog.id == time_log_id)
    )
    time_log = result.scalar_one_or_none()
    
    if not time_log:
        raise NotFoundError("Time log not found")
    
    # Check access: own time log, admin, or project lead
    has_access = (
        time_log.user_id == user_id or
        user_role == Role.ADMIN or
        time_log.project.project_lead_id == user_id
    )
    
    if not has_access:
        raise AuthorizationError("Access denied to this time log")
    
    # Format response
    return {
        "id": time_log.id,
        "user_id": time_log.user_id,
        "project_id": time_log.project_id,
        "task_id": time_log.task_id,
        "date": time_log.date,
        "hours": time_log.hours,
        "description": time_log.description,
        "is_billable": time_log.is_billable,
        "hourly_rate": time_log.hourly_rate,
        "approved_by_id": time_log.approved_by_id,
        "approved_at": time_log.approved_at,
        "created_at": time_log.created_at,
        "updated_at": time_log.updated_at,
        "project": {
            "id": time_log.project.id,
            "name": time_log.project.name,
            "project_code": time_log.project.project_code,
            "project_lead_id": time_log.project.project_lead_id,
        } if time_log.project else None,
        "task": {
            "id": time_log.task.id,
            "title": time_log.task.title,
        } if time_log.task else None,
        "user": {
            "id": time_log.user.id,
            "username": time_log.user.username,
            "email": time_log.user.email,
            "profile": {
                "first_name": time_log.user.profile.first_name if time_log.user.profile else None,
                "last_name": time_log.user.profile.last_name if time_log.user.profile else None,
            } if time_log.user.profile else None,
        } if time_log.user else None,
        "approved_by": {
            "id": time_log.approver.id,
            "username": time_log.approver.username,
        } if time_log.approver else None,
    }


async def update_time_log_service(
    db: AsyncSession,
    time_log_id: str,
    data: Dict[str, Any],
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Update time log"""
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project)
        ).where(TimeLog.id == time_log_id)
    )
    time_log = result.scalar_one_or_none()
    
    if not time_log:
        raise NotFoundError("Time log not found")
    
    # Only the owner can update their time log, and only if not yet approved
    if time_log.user_id != user_id:
        raise AuthorizationError("You can only update your own time logs")
    
    if time_log.approved_by_id is not None:
        raise ValidationError("Cannot update approved time log")
    
    # Validate hours if being updated
    if data.get("hours") and (data["hours"] <= 0 or data["hours"] > 24):
        raise ValidationError("Hours must be between 0 and 24")
    
    # Update time log
    for key, value in data.items():
        if value is not None:
            setattr(time_log, key, value)
    
    await db.commit()
    await db.refresh(time_log)
    
    # Recalculate project and task actualHours if hours changed
    if data.get("hours"):
        result = await db.execute(
            select(func.sum(TimeLog.hours)).where(TimeLog.project_id == time_log.project_id)
        )
        project_hours = result.scalar() or 0.0
        
        result = await db.execute(select(Project).where(Project.id == time_log.project_id))
        project = result.scalar_one_or_none()
        if project:
            project.actual_hours = project_hours
            db.add(project)
        
        if time_log.task_id:
            result = await db.execute(
                select(func.sum(TimeLog.hours)).where(TimeLog.task_id == time_log.task_id)
            )
            task_hours = result.scalar() or 0.0
            
            result = await db.execute(select(Task).where(Task.id == time_log.task_id))
            task = result.scalar_one_or_none()
            if task:
                task.actual_hours = task_hours
                db.add(task)
        
        await db.commit()
    
    # Get time log with relations
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project),
            selectinload(TimeLog.task),
            selectinload(TimeLog.user).selectinload(User.profile),
        ).where(TimeLog.id == time_log.id)
    )
    time_log_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": time_log_with_relations.id,
        "user_id": time_log_with_relations.user_id,
        "project_id": time_log_with_relations.project_id,
        "task_id": time_log_with_relations.task_id,
        "date": time_log_with_relations.date,
        "hours": time_log_with_relations.hours,
        "description": time_log_with_relations.description,
        "is_billable": time_log_with_relations.is_billable,
        "hourly_rate": time_log_with_relations.hourly_rate,
        "approved_by_id": time_log_with_relations.approved_by_id,
        "approved_at": time_log_with_relations.approved_at,
        "created_at": time_log_with_relations.created_at,
        "updated_at": time_log_with_relations.updated_at,
        "project": {
            "id": time_log_with_relations.project.id,
            "name": time_log_with_relations.project.name,
            "project_code": time_log_with_relations.project.project_code,
        } if time_log_with_relations.project else None,
        "task": {
            "id": time_log_with_relations.task.id,
            "title": time_log_with_relations.task.title,
        } if time_log_with_relations.task else None,
    }


async def delete_time_log_service(
    db: AsyncSession,
    time_log_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, str]:
    """Delete time log"""
    result = await db.execute(
        select(TimeLog).where(TimeLog.id == time_log_id)
    )
    time_log = result.scalar_one_or_none()
    
    if not time_log:
        raise NotFoundError("Time log not found")
    
    # Only the owner or admin can delete
    if time_log.user_id != user_id and user_role != Role.ADMIN:
        raise AuthorizationError("You can only delete your own time logs")
    
    if time_log.approved_by_id is not None:
        raise ValidationError("Cannot delete approved time log")
    
    project_id = time_log.project_id
    task_id = time_log.task_id
    
    db.delete(time_log)
    await db.commit()
    
    # Recalculate project and task actualHours
    result = await db.execute(
        select(func.sum(TimeLog.hours)).where(TimeLog.project_id == project_id)
    )
    project_hours = result.scalar() or 0.0
    
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        project.actual_hours = project_hours
        db.add(project)
    
    if task_id:
        result = await db.execute(
            select(func.sum(TimeLog.hours)).where(TimeLog.task_id == task_id)
        )
        task_hours = result.scalar() or 0.0
        
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if task:
            task.actual_hours = task_hours
            db.add(task)
    
    await db.commit()
    
    return {"message": "Time log deleted successfully"}


async def approve_time_log_service(
    db: AsyncSession,
    time_log_id: str,
    approver_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Approve time log"""
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project).selectinload(Project.members)
        ).where(TimeLog.id == time_log_id)
    )
    time_log = result.scalar_one_or_none()
    
    if not time_log:
        raise NotFoundError("Time log not found")
    
    if time_log.approved_by_id is not None:
        raise ConflictError("Time log is already approved")
    
    # Only Admin or Project Lead can approve
    if user_role != Role.ADMIN and time_log.project.project_lead_id != approver_id:
        raise AuthorizationError("Only project lead or admin can approve time logs")
    
    time_log.approved_by_id = approver_id
    time_log.approved_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(time_log)
    
    # Get time log with relations
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.user),
            selectinload(TimeLog.project),
            selectinload(TimeLog.approver),
        ).where(TimeLog.id == time_log.id)
    )
    time_log_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": time_log_with_relations.id,
        "user_id": time_log_with_relations.user_id,
        "project_id": time_log_with_relations.project_id,
        "task_id": time_log_with_relations.task_id,
        "date": time_log_with_relations.date,
        "hours": time_log_with_relations.hours,
        "description": time_log_with_relations.description,
        "is_billable": time_log_with_relations.is_billable,
        "hourly_rate": time_log_with_relations.hourly_rate,
        "approved_by_id": time_log_with_relations.approved_by_id,
        "approved_at": time_log_with_relations.approved_at,
        "created_at": time_log_with_relations.created_at,
        "updated_at": time_log_with_relations.updated_at,
        "user": {
            "id": time_log_with_relations.user.id,
            "username": time_log_with_relations.user.username,
            "email": time_log_with_relations.user.email,
        } if time_log_with_relations.user else None,
        "project": {
            "id": time_log_with_relations.project.id,
            "name": time_log_with_relations.project.name,
        } if time_log_with_relations.project else None,
    }


async def reject_time_log_service(
    db: AsyncSession,
    time_log_id: str,
    approver_id: str,
    reason: str,
    user_role: Role
) -> Dict[str, Any]:
    """Reject time log"""
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project)
        ).where(TimeLog.id == time_log_id)
    )
    time_log = result.scalar_one_or_none()
    
    if not time_log:
        raise NotFoundError("Time log not found")
    
    # Only Admin or Project Lead can reject
    if user_role != Role.ADMIN and time_log.project.project_lead_id != approver_id:
        raise AuthorizationError("Only project lead or admin can reject time logs")
    
    # Delete rejected time log
    db.delete(time_log)
    await db.commit()
    
    return {
        "message": "Time log rejected and removed",
        "reason": reason,
    }


async def get_user_timesheet_service(
    db: AsyncSession,
    user_id: str,
    start_date: datetime,
    end_date: datetime,
    requesting_user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Get user timesheet for a date range"""
    # Users can only get their own timesheet unless admin
    if user_id != requesting_user_id and user_role != Role.ADMIN:
        raise AuthorizationError("You can only view your own timesheet")
    
    start = start_of_day(start_date)
    end = end_of_day(end_date)
    
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.project),
            selectinload(TimeLog.task),
        ).where(
            and_(
                TimeLog.user_id == user_id,
                TimeLog.date >= start,
                TimeLog.date <= end,
            )
        ).order_by(TimeLog.date.asc())
    )
    time_logs = result.scalars().all()
    
    # Calculate totals
    total_hours = sum(log.hours for log in time_logs)
    approved_hours = sum(log.hours for log in time_logs if log.approved_by_id is not None)
    pending_hours = sum(log.hours for log in time_logs if log.approved_by_id is None)
    
    # Format response
    time_log_list = []
    for time_log in time_logs:
        time_log_list.append({
            "id": time_log.id,
            "user_id": time_log.user_id,
            "project_id": time_log.project_id,
            "task_id": time_log.task_id,
            "date": time_log.date,
            "hours": time_log.hours,
            "description": time_log.description,
            "is_billable": time_log.is_billable,
            "hourly_rate": time_log.hourly_rate,
            "approved_by_id": time_log.approved_by_id,
            "approved_at": time_log.approved_at,
            "created_at": time_log.created_at,
            "updated_at": time_log.updated_at,
            "project": {
                "id": time_log.project.id,
                "name": time_log.project.name,
                "project_code": time_log.project.project_code,
            } if time_log.project else None,
            "task": {
                "id": time_log.task.id,
                "title": time_log.task.title,
            } if time_log.task else None,
        })
    
    return {
        "user_id": user_id,
        "start_date": start_date,
        "end_date": end_date,
        "time_logs": time_log_list,
        "summary": {
            "total_hours": total_hours,
            "approved_hours": approved_hours,
            "pending_hours": pending_hours,
            "total_entries": len(time_logs),
        },
    }


async def get_project_time_report_service(
    db: AsyncSession,
    project_id: str,
    start_date: Optional[datetime],
    end_date: Optional[datetime],
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Get project time report"""
    # Check project access
    result = await db.execute(
        select(Project).options(
            selectinload(Project.members)
        ).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    has_access = (
        user_role == Role.ADMIN or
        project.project_lead_id == user_id or
        any(m.user_id == user_id for m in project.members)
    )
    
    if not has_access:
        raise AuthorizationError("Access denied to this project")
    
    # Build query
    query = select(TimeLog).where(TimeLog.project_id == project_id)
    
    if start_date and end_date:
        start = start_of_day(start_date)
        end = end_of_day(end_date)
        query = query.where(
            and_(
                TimeLog.date >= start,
                TimeLog.date <= end,
            )
        )
    
    query = query.options(
        selectinload(TimeLog.user).selectinload(User.profile),
        selectinload(TimeLog.task),
    ).order_by(desc(TimeLog.date))
    
    result = await db.execute(query)
    time_logs = result.scalars().all()
    
    # Group by user
    by_user: Dict[str, Dict[str, Any]] = {}
    
    for log in time_logs:
        if log.user_id not in by_user:
            by_user[log.user_id] = {
                "user": {
                    "id": log.user.id,
                    "username": log.user.username,
                    "profile": {
                        "first_name": log.user.profile.first_name if log.user.profile else None,
                        "last_name": log.user.profile.last_name if log.user.profile else None,
                    } if log.user.profile else None,
                } if log.user else None,
                "total_hours": 0.0,
                "entries": 0,
            }
        by_user[log.user_id]["total_hours"] += log.hours
        by_user[log.user_id]["entries"] += 1
    
    total_hours = sum(log.hours for log in time_logs)
    
    # Format response
    time_log_list = []
    for time_log in time_logs:
        time_log_list.append({
            "id": time_log.id,
            "user_id": time_log.user_id,
            "project_id": time_log.project_id,
            "task_id": time_log.task_id,
            "date": time_log.date,
            "hours": time_log.hours,
            "description": time_log.description,
            "is_billable": time_log.is_billable,
            "hourly_rate": time_log.hourly_rate,
            "approved_by_id": time_log.approved_by_id,
            "approved_at": time_log.approved_at,
            "created_at": time_log.created_at,
            "updated_at": time_log.updated_at,
            "user": {
                "id": time_log.user.id,
                "username": time_log.user.username,
                "profile": {
                    "first_name": time_log.user.profile.first_name if time_log.user.profile else None,
                    "last_name": time_log.user.profile.last_name if time_log.user.profile else None,
                } if time_log.user.profile else None,
            } if time_log.user else None,
            "task": {
                "id": time_log.task.id,
                "title": time_log.task.title,
            } if time_log.task else None,
        })
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        "start_date": start_date,
        "end_date": end_date,
        "total_hours": total_hours,
        "total_entries": len(time_logs),
        "by_user": list(by_user.values()),
        "time_logs": time_log_list,
    }


async def get_pending_approvals_service(
    db: AsyncSession,
    project_lead_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Get pending time log approvals for a project lead"""
    # Get all projects where user is project lead
    result = await db.execute(
        select(Project).where(Project.project_lead_id == project_lead_id)
    )
    projects = result.scalars().all()
    
    project_ids = [p.id for p in projects]
    
    if not project_ids:
        return {
            "pending_count": 0,
            "time_logs": [],
        }
    
    result = await db.execute(
        select(TimeLog).options(
            selectinload(TimeLog.user).selectinload(User.profile),
            selectinload(TimeLog.project),
            selectinload(TimeLog.task),
        ).where(
            and_(
                TimeLog.project_id.in_(project_ids),
                TimeLog.approved_by_id.is_(None),
            )
        ).order_by(desc(TimeLog.date))
    )
    pending_time_logs = result.scalars().all()
    
    # Format response
    time_log_list = []
    for time_log in pending_time_logs:
        time_log_list.append({
            "id": time_log.id,
            "user_id": time_log.user_id,
            "project_id": time_log.project_id,
            "task_id": time_log.task_id,
            "date": time_log.date,
            "hours": time_log.hours,
            "description": time_log.description,
            "is_billable": time_log.is_billable,
            "hourly_rate": time_log.hourly_rate,
            "approved_by_id": time_log.approved_by_id,
            "approved_at": time_log.approved_at,
            "created_at": time_log.created_at,
            "updated_at": time_log.updated_at,
            "user": {
                "id": time_log.user.id,
                "username": time_log.user.username,
                "email": time_log.user.email,
                "profile": {
                    "first_name": time_log.user.profile.first_name if time_log.user.profile else None,
                    "last_name": time_log.user.profile.last_name if time_log.user.profile else None,
                } if time_log.user.profile else None,
            } if time_log.user else None,
            "project": {
                "id": time_log.project.id,
                "name": time_log.project.name,
                "project_code": time_log.project.project_code,
            } if time_log.project else None,
            "task": {
                "id": time_log.task.id,
                "title": time_log.task.title,
            } if time_log.task else None,
        })
    
    return {
        "pending_count": len(pending_time_logs),
        "time_logs": time_log_list,
    }

