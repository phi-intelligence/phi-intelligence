"""Project service"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.models.project import Project, ProjectMember, Milestone
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.task import Task
from app.models.timelog import TimeLog
from app.models.enums import ProjectStatus, Priority, Role, Region


async def create_project_service(
    db: AsyncSession,
    data: Dict[str, Any],
    created_by_id: str
) -> Dict[str, Any]:
    """Create project service"""
    # Check if project code already exists
    result = await db.execute(select(Project).where(Project.project_code == data["project_code"]))
    existing_project = result.scalar_one_or_none()
    
    if existing_project:
        raise ConflictError("Project code already exists")
    
    # Verify project lead exists
    result = await db.execute(select(User).where(User.id == data["project_lead_id"]))
    project_lead = result.scalar_one_or_none()
    
    if not project_lead:
        raise NotFoundError("Project lead not found")
    
    # Create project
    project = Project(
        name=data["name"],
        description=data.get("description"),
        client_name=data.get("client_name"),
        project_code=data["project_code"],
        start_date=data["start_date"],
        end_date=data.get("end_date"),
        estimated_hours=data.get("estimated_hours"),
        budget=data.get("budget"),
        priority=data.get("priority", Priority.MEDIUM.value),
        region=data.get("region", Region.BOTH.value),
        project_lead_id=data["project_lead_id"],
        created_by_id=created_by_id,
        status=ProjectStatus.PLANNING.value,
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Get related data
    result = await db.execute(
        select(Project).options(
            selectinload(Project.project_lead).selectinload(User.profile),
            selectinload(Project.created_by)
        ).where(Project.id == project.id)
    )
    project_with_relations = result.scalar_one_or_none()
    _dt = lambda v: v.isoformat() if v is not None else None
    # Format response (serialize datetimes for JSON)
    return {
        "id": project_with_relations.id,
        "name": project_with_relations.name,
        "description": project_with_relations.description,
        "client_name": project_with_relations.client_name,
        "project_code": project_with_relations.project_code,
        "status": project_with_relations.status,
        "start_date": _dt(project_with_relations.start_date),
        "end_date": _dt(project_with_relations.end_date),
        "estimated_hours": project_with_relations.estimated_hours,
        "actual_hours": project_with_relations.actual_hours,
        "budget": project_with_relations.budget,
        "priority": project_with_relations.priority,
        "region": project_with_relations.region,
        "project_lead_id": project_with_relations.project_lead_id,
        "created_by_id": project_with_relations.created_by_id,
        "created_at": _dt(project_with_relations.created_at),
        "updated_at": _dt(project_with_relations.updated_at),
        "project_lead": {
            "id": project_with_relations.project_lead.id,
            "email": project_with_relations.project_lead.email,
            "username": project_with_relations.project_lead.username,
            "profile": {
                "first_name": project_with_relations.project_lead.profile.first_name if project_with_relations.project_lead.profile else None,
                "last_name": project_with_relations.project_lead.profile.last_name if project_with_relations.project_lead.profile else None,
            } if project_with_relations.project_lead.profile else None,
        } if project_with_relations.project_lead else None,
        "created_by": {
            "id": project_with_relations.created_by.id,
            "username": project_with_relations.created_by.username,
        } if project_with_relations.created_by else None,
    }


async def get_project_by_id_service(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Get project by ID service"""
    result = await db.execute(
        select(Project).options(
            selectinload(Project.project_lead).selectinload(User.profile),
            selectinload(Project.created_by),
            selectinload(Project.members).selectinload(ProjectMember.user).selectinload(User.profile)
        ).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Check access: Admin, Project Lead, or Team Member
    has_access = (
        user_role == Role.ADMIN.value or
        project.project_lead_id == user_id or
        any(member.user_id == user_id for member in project.members)
    )
    
    if not has_access:
        raise AuthorizationError("Access denied to this project")
    
    # Get task count
    result = await db.execute(select(func.count(Task.id)).where(Task.project_id == project_id))
    task_count = result.scalar() or 0
    
    # Get member count
    member_count = len(project.members)

    def _dt(v):
        return v.isoformat() if v is not None else None

    # Format response (serialize datetimes for JSON)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "client_name": project.client_name,
        "project_code": project.project_code,
        "status": project.status,
        "start_date": _dt(project.start_date),
        "end_date": _dt(project.end_date),
        "estimated_hours": project.estimated_hours,
        "actual_hours": project.actual_hours,
        "budget": project.budget,
        "priority": project.priority,
        "region": project.region,
        "project_lead_id": project.project_lead_id,
        "created_by_id": project.created_by_id,
        "created_at": _dt(project.created_at),
        "updated_at": _dt(project.updated_at),
        "project_lead": {
            "id": project.project_lead.id,
            "email": project.project_lead.email,
            "username": project.project_lead.username,
            "profile": {
                "first_name": project.project_lead.profile.first_name if project.project_lead.profile else None,
                "last_name": project.project_lead.profile.last_name if project.project_lead.profile else None,
            } if project.project_lead.profile else None,
        } if project.project_lead else None,
        "created_by": {
            "id": project.created_by.id,
            "username": project.created_by.username,
        } if project.created_by else None,
        "members": [
            {
                "id": member.id,
                "project_id": member.project_id,
                "user_id": member.user_id,
                "role": member.role,
                "allocation_percentage": member.allocation_percentage,
                "joined_date": _dt(member.joined_date),
                "left_date": _dt(member.left_date),
                "hours_allocated": member.hours_allocated,
                "hours_logged": member.hours_logged,
                "user": {
                    "id": member.user.id,
                    "email": member.user.email,
                    "username": member.user.username,
                    "profile": {
                        "first_name": member.user.profile.first_name if member.user.profile else None,
                        "last_name": member.user.profile.last_name if member.user.profile else None,
                        "designation": member.user.profile.designation if member.user.profile else None,
                    } if member.user.profile else None,
                } if member.user else None,
            }
            for member in project.members
        ],
        "_count": {
            "tasks": task_count,
            "members": member_count,
        },
    }


async def get_all_projects_service(
    db: AsyncSession,
    filters: Dict[str, Any],
    user_id: str,
    user_role: str,
    page: int = 1,
    limit: int = 10
) -> Dict[str, Any]:
    """Get all projects service"""
    status_filter = filters.get("status")
    project_lead_id = filters.get("project_lead_id")
    region = filters.get("region")
    priority = filters.get("priority")
    search = filters.get("search")
    
    conditions = []
    
    # Apply filters
    if status_filter:
        conditions.append(Project.status == status_filter)
    if project_lead_id:
        conditions.append(Project.project_lead_id == project_lead_id)
    if region:
        conditions.append(Project.region == region)
    if priority:
        conditions.append(Project.priority == priority)
    if search:
        conditions.append(
            or_(
                Project.name.ilike(f"%{search}%"),
                Project.project_code.ilike(f"%{search}%"),
                Project.client_name.ilike(f"%{search}%"),
            )
        )
    
    # Access control: Non-admins only see their projects
    if user_role != Role.ADMIN.value:
        access_conditions = [
            Project.project_lead_id == user_id,
        ]
        # Check if user is a member
        result = await db.execute(
            select(ProjectMember.project_id).where(ProjectMember.user_id == user_id)
        )
        member_project_ids = [row[0] for row in result.all()]
        if member_project_ids:
            access_conditions.append(Project.id.in_(member_project_ids))
        
        if conditions:
            conditions = [and_(*conditions), or_(*access_conditions)]
        else:
            conditions = [or_(*access_conditions)]
    
    # Build query
    query = select(Project).options(
        selectinload(Project.project_lead).selectinload(User.profile)
    )
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Get total count
    count_query = select(func.count()).select_from(Project)
    if conditions:
        count_query = count_query.where(and_(*conditions))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Get paginated results
    skip = (page - 1) * limit
    query = query.order_by(desc(Project.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    # Get task counts for each project
    project_ids = [p.id for p in projects]
    task_counts = {}
    if project_ids:
        result = await db.execute(
            select(Task.project_id, func.count(Task.id)).where(
                Task.project_id.in_(project_ids)
            ).group_by(Task.project_id)
        )
        task_counts = {row[0]: row[1] for row in result.all()}
    
    # Get member counts for each project
    member_counts = {}
    if project_ids:
        result = await db.execute(
            select(ProjectMember.project_id, func.count(ProjectMember.id)).where(
                ProjectMember.project_id.in_(project_ids)
            ).group_by(ProjectMember.project_id)
        )
        member_counts = {row[0]: row[1] for row in result.all()}
    
    def _serialize_dt(dt):
        return dt.isoformat() if dt is not None else None

    # Format response
    formatted_projects = []
    for project in projects:
        formatted_projects.append({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "client_name": project.client_name,
            "project_code": project.project_code,
            "status": project.status,
            "start_date": _serialize_dt(project.start_date),
            "end_date": _serialize_dt(project.end_date),
            "estimated_hours": project.estimated_hours,
            "actual_hours": project.actual_hours,
            "budget": project.budget,
            "priority": project.priority,
            "region": project.region,
            "project_lead_id": project.project_lead_id,
            "created_by_id": project.created_by_id,
            "created_at": _serialize_dt(project.created_at),
            "updated_at": _serialize_dt(project.updated_at),
            "project_lead": {
                "id": project.project_lead.id,
                "username": project.project_lead.username,
                "profile": {
                    "first_name": project.project_lead.profile.first_name if project.project_lead.profile else None,
                    "last_name": project.project_lead.profile.last_name if project.project_lead.profile else None,
                } if project.project_lead.profile else None,
            } if project.project_lead else None,
            "_count": {
                "tasks": task_counts.get(project.id, 0),
                "members": member_counts.get(project.id, 0),
            },
        })
    
    return {
        "projects": formatted_projects,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


async def update_project_service(
    db: AsyncSession,
    project_id: str,
    data: Dict[str, Any],
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Update project service"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Only Admin or Project Lead can update
    if user_role != Role.ADMIN.value and project.project_lead_id != user_id:
        raise AuthorizationError("Only project lead or admin can update project")
    
    # If changing project lead, verify new lead exists
    if "project_lead_id" in data and data["project_lead_id"] != project.project_lead_id:
        result = await db.execute(select(User).where(User.id == data["project_lead_id"]))
        new_lead = result.scalar_one_or_none()
        if not new_lead:
            raise NotFoundError("New project lead not found")
    
    # Update project fields
    for key, value in data.items():
        if hasattr(project, key) and value is not None:
            setattr(project, key, value)
    
    await db.commit()
    await db.refresh(project)
    
    # Get related data
    result = await db.execute(
        select(Project).options(
            selectinload(Project.project_lead).selectinload(User.profile)
        ).where(Project.id == project_id)
    )
    project_with_relations = result.scalar_one_or_none()
    _dt = lambda v: v.isoformat() if v is not None else None
    # Format response (serialize datetimes for JSON)
    return {
        "id": project_with_relations.id,
        "name": project_with_relations.name,
        "description": project_with_relations.description,
        "client_name": project_with_relations.client_name,
        "project_code": project_with_relations.project_code,
        "status": project_with_relations.status,
        "start_date": _dt(project_with_relations.start_date),
        "end_date": _dt(project_with_relations.end_date),
        "estimated_hours": project_with_relations.estimated_hours,
        "actual_hours": project_with_relations.actual_hours,
        "budget": project_with_relations.budget,
        "priority": project_with_relations.priority,
        "region": project_with_relations.region,
        "project_lead_id": project_with_relations.project_lead_id,
        "created_by_id": project_with_relations.created_by_id,
        "created_at": _dt(project_with_relations.created_at),
        "updated_at": _dt(project_with_relations.updated_at),
        "project_lead": {
            "id": project_with_relations.project_lead.id,
            "username": project_with_relations.project_lead.username,
            "profile": {
                "first_name": project_with_relations.project_lead.profile.first_name if project_with_relations.project_lead.profile else None,
                "last_name": project_with_relations.project_lead.profile.last_name if project_with_relations.project_lead.profile else None,
            } if project_with_relations.project_lead.profile else None,
        } if project_with_relations.project_lead else None,
    }


async def delete_project_service(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    user_role: str
) -> Dict[str, str]:
    """Delete project service"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Only Admin can delete
    if user_role != Role.ADMIN.value:
        raise AuthorizationError("Only admin can delete projects")
    
    await db.delete(project)
    await db.commit()
    
    return {"message": "Project deleted successfully"}


async def add_team_member_service(
    db: AsyncSession,
    project_id: str,
    member_id: str,
    role: str,
    allocation_percentage: int,
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Add team member service"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Only Admin or Project Lead can add members
    if user_role != Role.ADMIN.value and project.project_lead_id != user_id:
        raise AuthorizationError("Only project lead or admin can add team members")
    
    # Check if user exists
    result = await db.execute(select(User).where(User.id == member_id))
    member = result.scalar_one_or_none()
    
    if not member:
        raise NotFoundError("User not found")
    
    # Check if already a member
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member_id
        )
    )
    existing_member = result.scalar_one_or_none()
    
    if existing_member:
        raise ConflictError("User is already a team member")
    
    # Create project member
    project_member = ProjectMember(
        project_id=project_id,
        user_id=member_id,
        role=role,
        allocation_percentage=allocation_percentage,
        joined_date=datetime.utcnow(),
    )
    
    db.add(project_member)
    await db.commit()
    await db.refresh(project_member)
    
    # Get related data
    result = await db.execute(
        select(ProjectMember).options(
            selectinload(ProjectMember.user).selectinload(User.profile)
        ).where(ProjectMember.id == project_member.id)
    )
    member_with_relations = result.scalar_one_or_none()
    _dt = lambda v: v.isoformat() if v is not None else None
    return {
        "id": member_with_relations.id,
        "project_id": member_with_relations.project_id,
        "user_id": member_with_relations.user_id,
        "role": member_with_relations.role,
        "allocation_percentage": member_with_relations.allocation_percentage,
        "joined_date": _dt(member_with_relations.joined_date),
        "left_date": _dt(member_with_relations.left_date),
        "hours_allocated": member_with_relations.hours_allocated,
        "hours_logged": member_with_relations.hours_logged,
        "user": {
            "id": member_with_relations.user.id,
            "email": member_with_relations.user.email,
            "username": member_with_relations.user.username,
            "profile": {
                "first_name": member_with_relations.user.profile.first_name if member_with_relations.user.profile else None,
                "last_name": member_with_relations.user.profile.last_name if member_with_relations.user.profile else None,
                "designation": member_with_relations.user.profile.designation if member_with_relations.user.profile else None,
            } if member_with_relations.user.profile else None,
        } if member_with_relations.user else None,
    }


async def remove_team_member_service(
    db: AsyncSession,
    project_id: str,
    member_id: str,
    user_id: str,
    user_role: str
) -> Dict[str, str]:
    """Remove team member service"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Only Admin or Project Lead can remove members
    if user_role != Role.ADMIN.value and project.project_lead_id != user_id:
        raise AuthorizationError("Only project lead or admin can remove team members")
    
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member_id
        )
    )
    member = result.scalar_one_or_none()
    
    if not member:
        raise NotFoundError("Team member not found in project")
    
    await db.delete(member)
    await db.commit()
    
    return {"message": "Team member removed successfully"}


async def update_project_status_service(
    db: AsyncSession,
    project_id: str,
    status: str,
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Update project status service"""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # Only Admin or Project Lead can update status
    if user_role != Role.ADMIN.value and project.project_lead_id != user_id:
        raise AuthorizationError("Only project lead or admin can update status")
    
    project.status = status
    await db.commit()
    await db.refresh(project)
    
    _dt = lambda v: v.isoformat() if v is not None else None
    return {
        "id": project.id,
        "name": project.name,
        "status": project.status,
        "updated_at": _dt(project.updated_at),
    }


async def get_project_metrics_service(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Get project metrics service"""
    # Check access first
    await get_project_by_id_service(db, project_id, user_id, user_role)
    
    # Get task statistics
    result = await db.execute(select(func.count(Task.id)).where(Task.project_id == project_id))
    total_tasks = result.scalar() or 0
    
    result = await db.execute(
        select(func.count(Task.id)).where(
            Task.project_id == project_id,
            Task.status == "DONE"
        )
    )
    completed_tasks = result.scalar() or 0
    
    result = await db.execute(
        select(func.count(Task.id)).where(
            Task.project_id == project_id,
            Task.status == "IN_PROGRESS"
        )
    )
    in_progress_tasks = result.scalar() or 0
    
    # Get time log totals
    result = await db.execute(
        select(func.sum(TimeLog.hours)).where(TimeLog.project_id == project_id)
    )
    actual_hours = float(result.scalar() or 0)
    
    # Get project
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    estimated_hours = float(project.estimated_hours or 0) if project else 0
    
    # Calculate completion percentage
    completion_percentage = (
        round((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
    )
    
    # Get member count
    result = await db.execute(
        select(func.count(ProjectMember.id)).where(ProjectMember.project_id == project_id)
    )
    team_size = result.scalar() or 0
    
    return {
        "project_id": project_id,
        "project_name": project.name if project else None,
        "status": project.status if project else None,
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "completion_percentage": completion_percentage,
        },
        "hours": {
            "estimated": estimated_hours,
            "actual": actual_hours,
            "remaining": max(0, estimated_hours - actual_hours),
            "utilization_percentage": (
                round((actual_hours / estimated_hours) * 100) if estimated_hours > 0 else 0
            ),
        },
        "budget": {
            "allocated": float(project.budget or 0) if project else 0,
        },
        "team_size": team_size,
    }


async def get_project_timeline_service(
    db: AsyncSession,
    project_id: str,
    user_id: str,
    user_role: str
) -> Dict[str, Any]:
    """Get project timeline service"""
    # Check access first
    await get_project_by_id_service(db, project_id, user_id, user_role)
    
    # Get milestones
    result = await db.execute(
        select(Milestone).where(Milestone.project_id == project_id).order_by(Milestone.due_date.asc())
    )
    milestones = result.scalars().all()
    
    _dt = lambda v: v.isoformat() if v is not None else None
    formatted_milestones = []
    for milestone in milestones:
        formatted_milestones.append({
            "id": milestone.id,
            "project_id": milestone.project_id,
            "name": milestone.name,
            "description": milestone.description,
            "due_date": _dt(milestone.due_date),
            "completed_date": _dt(milestone.completed_date),
            "status": milestone.status,
            "order_index": milestone.order_index,
            "created_at": _dt(milestone.created_at),
            "updated_at": _dt(milestone.updated_at),
        })
    
    return {
        "project_id": project_id,
        "milestones": formatted_milestones,
    }

