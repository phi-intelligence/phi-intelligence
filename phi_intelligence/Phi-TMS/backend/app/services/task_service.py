"""Task service"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ConflictError, ValidationError, AuthorizationError
from app.models.project import Project, ProjectMember
from app.models.task import Task, TaskDependency, TaskComment, TaskAttachment, TaskChecklist
from app.models.user import User
from app.models.timelog import TimeLog
from app.models.enums import TaskStatus, Priority, Role


async def create_task_service(
    db: AsyncSession,
    data: Dict[str, Any],
    reporter_id: str
) -> Dict[str, Any]:
    """Create a new task"""
    # Verify project exists and user has access
    result = await db.execute(
        select(Project).options(
            selectinload(Project.members)
        ).where(Project.id == data["project_id"])
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    # If assignee specified, verify they exist and are on the project
    if data.get("assignee_id"):
        result = await db.execute(select(User).where(User.id == data["assignee_id"]))
        assignee = result.scalar_one_or_none()
        
        if not assignee:
            raise NotFoundError("Assignee not found")
        
        is_project_member = (
            project.project_lead_id == data["assignee_id"] or
            any(m.user_id == data["assignee_id"] for m in project.members)
        )
        
        if not is_project_member:
            raise ValidationError("Assignee is not a member of this project")
    
    # If parent task specified, verify it exists
    if data.get("parent_task_id"):
        result = await db.execute(
            select(Task).where(Task.id == data["parent_task_id"])
        )
        parent_task = result.scalar_one_or_none()
        
        if not parent_task or parent_task.project_id != data["project_id"]:
            raise ValidationError("Invalid parent task")
    
    # Create task
    task = Task(
        project_id=data["project_id"],
        title=data["title"],
        description=data.get("description"),
        priority=data.get("priority", Priority.MEDIUM.value),
        assignee_id=data.get("assignee_id"),
        reporter_id=reporter_id,
        due_date=data.get("due_date"),
        start_date=data.get("start_date"),
        estimated_hours=data.get("estimated_hours"),
        tags=data.get("tags", []),
        labels=data.get("labels", []),
        parent_task_id=data.get("parent_task_id"),
        status=TaskStatus.TODO.value,
        order_index=0,
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    # Get task with relations
    result = await db.execute(
        select(Task).options(
            selectinload(Task.assignee).selectinload(User.profile),
            selectinload(Task.reporter)
        ).where(Task.id == task.id)
    )
    task_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": task_with_relations.id,
        "project_id": task_with_relations.project_id,
        "title": task_with_relations.title,
        "description": task_with_relations.description,
        "status": task_with_relations.status,
        "priority": task_with_relations.priority,
        "assignee_id": task_with_relations.assignee_id,
        "reporter_id": task_with_relations.reporter_id,
        "estimated_hours": task_with_relations.estimated_hours,
        "actual_hours": task_with_relations.actual_hours,
        "start_date": task_with_relations.start_date,
        "due_date": task_with_relations.due_date,
        "completed_date": task_with_relations.completed_date,
        "parent_task_id": task_with_relations.parent_task_id,
        "tags": task_with_relations.tags or [],
        "labels": task_with_relations.labels or [],
        "order_index": task_with_relations.order_index,
        "created_at": task_with_relations.created_at,
        "updated_at": task_with_relations.updated_at,
        "assignee": {
            "id": task_with_relations.assignee.id,
            "username": task_with_relations.assignee.username,
            "profile": {
                "first_name": task_with_relations.assignee.profile.first_name if task_with_relations.assignee.profile else None,
                "last_name": task_with_relations.assignee.profile.last_name if task_with_relations.assignee.profile else None,
            } if task_with_relations.assignee.profile else None,
        } if task_with_relations.assignee else None,
        "reporter": {
            "id": task_with_relations.reporter.id,
            "username": task_with_relations.reporter.username,
        } if task_with_relations.reporter else None,
    }


async def get_task_by_id_service(
    db: AsyncSession,
    task_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Get task by ID with all relations"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project).selectinload(Project.project_lead),
            selectinload(Task.project).selectinload(Project.members),
            selectinload(Task.assignee).selectinload(User.profile),
            selectinload(Task.reporter).selectinload(User.profile),
            selectinload(Task.parent_task),
            selectinload(Task.sub_tasks).selectinload(Task.assignee),
            selectinload(Task.dependencies).selectinload(TaskDependency.depends_on_task),
            selectinload(Task.dependents).selectinload(TaskDependency.task),
            selectinload(Task.comments).selectinload(TaskComment.user).selectinload(User.profile),
            selectinload(Task.attachments).selectinload(TaskAttachment.uploaded_by),
            selectinload(Task.checklists),
            selectinload(Task.time_logs).selectinload(TimeLog.user),
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Check access: Admin, Project Lead, assignee, team member, or reporter
    has_access = (
        user_role == Role.ADMIN or
        task.project.project_lead_id == user_id or
        task.assignee_id == user_id or
        any(m.user_id == user_id for m in task.project.members) or
        task.reporter_id == user_id
    )
    
    if not has_access:
        raise AuthorizationError("Access denied to this task")
    
    # Format response
    return {
        "id": task.id,
        "project_id": task.project_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "assignee_id": task.assignee_id,
        "reporter_id": task.reporter_id,
        "estimated_hours": task.estimated_hours,
        "actual_hours": task.actual_hours,
        "start_date": task.start_date,
        "due_date": task.due_date,
        "completed_date": task.completed_date,
        "parent_task_id": task.parent_task_id,
        "tags": task.tags or [],
        "labels": task.labels or [],
        "order_index": task.order_index,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "project": {
            "id": task.project.id,
            "name": task.project.name,
            "project_code": task.project.project_code,
            "project_lead_id": task.project.project_lead_id,
            "project_lead": {
                "id": task.project.project_lead.id,
                "username": task.project.project_lead.username,
            } if task.project.project_lead else None,
            "members": [{"user_id": m.user_id} for m in task.project.members],
        } if task.project else None,
        "assignee": {
            "id": task.assignee.id,
            "username": task.assignee.username,
            "email": task.assignee.email,
            "profile": {
                "first_name": task.assignee.profile.first_name if task.assignee.profile else None,
                "last_name": task.assignee.profile.last_name if task.assignee.profile else None,
            } if task.assignee.profile else None,
        } if task.assignee else None,
        "reporter": {
            "id": task.reporter.id,
            "username": task.reporter.username,
            "profile": {
                "first_name": task.reporter.profile.first_name if task.reporter.profile else None,
                "last_name": task.reporter.profile.last_name if task.reporter.profile else None,
            } if task.reporter.profile else None,
        } if task.reporter else None,
        "parent_task": {
            "id": task.parent_task.id,
            "title": task.parent_task.title,
            "status": task.parent_task.status,
        } if task.parent_task else None,
        "sub_tasks": [
            {
                "id": st.id,
                "title": st.title,
                "status": st.status,
                "assignee": {
                    "id": st.assignee.id,
                    "username": st.assignee.username,
                } if st.assignee else None,
            } for st in task.sub_tasks
        ] if task.sub_tasks else [],
        "dependencies": [
            {
                "id": dep.id,
                "task_id": dep.task_id,
                "depends_on_task_id": dep.depends_on_task_id,
                "depends_on_task": {
                    "id": dep.depends_on_task.id,
                    "title": dep.depends_on_task.title,
                    "status": dep.depends_on_task.status,
                } if dep.depends_on_task else None,
            } for dep in task.dependencies
        ] if task.dependencies else [],
        "dependents": [
            {
                "id": dep.id,
                "task_id": dep.task_id,
                "depends_on_task_id": dep.depends_on_task_id,
                "task": {
                    "id": dep.task.id,
                    "title": dep.task.title,
                    "status": dep.task.status,
                } if dep.task else None,
            } for dep in task.dependents
        ] if task.dependents else [],
        "comments": [
            {
                "id": comment.id,
                "task_id": comment.task_id,
                "user_id": comment.user_id,
                "content": comment.content,
                "mentions": comment.mentions or [],
                "created_at": comment.created_at,
                "updated_at": comment.updated_at,
                "user": {
                    "id": comment.user.id,
                    "username": comment.user.username,
                    "profile": {
                        "first_name": comment.user.profile.first_name if comment.user.profile else None,
                        "last_name": comment.user.profile.last_name if comment.user.profile else None,
                    } if comment.user.profile else None,
                } if comment.user else None,
            } for comment in sorted(task.comments, key=lambda c: c.created_at, reverse=True)
        ] if task.comments else [],
        "attachments": [
            {
                "id": att.id,
                "task_id": att.task_id,
                "file_name": att.file_name,
                "file_url": att.file_url,
                "file_path": att.file_url,  # Alias for compatibility
                "file_size": att.file_size,
                "uploaded_by_id": att.uploaded_by_id,
                "uploaded_at": att.uploaded_at,
                "uploaded_by": {
                    "id": att.uploaded_by.id,
                    "username": att.uploaded_by.username,
                } if att.uploaded_by else None,
            } for att in sorted(task.attachments, key=lambda a: a.uploaded_at, reverse=True)
        ] if task.attachments else [],
        "checklists": [
            {
                "id": checklist.id,
                "task_id": checklist.task_id,
                "title": checklist.title,
                "items": checklist.items if checklist.items else [],
            } for checklist in task.checklists
        ] if task.checklists else [],
        "time_logs": [
            {
                "id": tl.id,
                "task_id": tl.task_id,
                "user_id": tl.user_id,
                "user": {
                    "id": tl.user.id,
                    "username": tl.user.username,
                } if tl.user else None,
            } for tl in task.time_logs
        ] if task.time_logs else [],
    }


async def get_project_tasks_service(
    db: AsyncSession,
    project_id: str,
    filters: Dict[str, Any],
    user_id: str,
    user_role: Role
) -> List[Dict[str, Any]]:
    """Get all tasks for a project"""
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
    query = select(Task).where(Task.project_id == project_id)
    
    if filters.get("status"):
        query = query.where(Task.status == filters["status"])
    if filters.get("assignee_id"):
        query = query.where(Task.assignee_id == filters["assignee_id"])
    if filters.get("priority"):
        query = query.where(Task.priority == filters["priority"])
    if filters.get("search"):
        search_term = f"%{filters['search']}%"
        query = query.where(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
            )
        )
    if filters.get("due_date"):
        query = query.where(Task.due_date <= filters["due_date"])
    
    # Add relations and ordering. We must eagerly load every relationship the
    # response loop touches below (sub_tasks, comments, attachments). Async
    # SQLAlchemy can't lazy-load after the request, so accessing them without
    # selectinload raises `greenlet_spawn has not been called`.
    query = query.options(
        selectinload(Task.assignee).selectinload(User.profile),
        selectinload(Task.sub_tasks),
        selectinload(Task.comments),
        selectinload(Task.attachments),
    ).order_by(Task.order_index.asc(), Task.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    # Count sub-tasks, comments, attachments for each task
    task_list = []
    for task in tasks:
        # Get counts
        sub_tasks_count = len(task.sub_tasks) if task.sub_tasks else 0
        comments_count = len(task.comments) if task.comments else 0
        attachments_count = len(task.attachments) if task.attachments else 0
        
        task_list.append({
            "id": task.id,
            "project_id": task.project_id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "assignee_id": task.assignee_id,
            "reporter_id": task.reporter_id,
            "estimated_hours": task.estimated_hours,
            "actual_hours": task.actual_hours,
            "start_date": task.start_date,
            "due_date": task.due_date,
            "completed_date": task.completed_date,
            "parent_task_id": task.parent_task_id,
            "tags": task.tags or [],
            "labels": task.labels or [],
            "order_index": task.order_index,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "assignee": {
                "id": task.assignee.id,
                "username": task.assignee.username,
                "profile": {
                    "first_name": task.assignee.profile.first_name if task.assignee.profile else None,
                    "last_name": task.assignee.profile.last_name if task.assignee.profile else None,
                } if task.assignee.profile else None,
            } if task.assignee else None,
            "_count": {
                "sub_tasks": sub_tasks_count,
                "comments": comments_count,
                "attachments": attachments_count,
            },
        })
    
    return task_list


async def get_my_tasks_service(
    db: AsyncSession,
    user_id: str,
    status: Optional[TaskStatus] = None
) -> List[Dict[str, Any]]:
    """Get tasks assigned to current user"""
    query = select(Task).where(Task.assignee_id == user_id)
    
    if status:
        query = query.where(Task.status == status.value)
    
    query = query.options(
        selectinload(Task.project),
        selectinload(Task.sub_tasks),
        selectinload(Task.comments),
    ).order_by(
        Task.due_date.asc().nulls_last(),
        Task.priority.desc(),
        Task.created_at.desc()
    )
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    # Format response
    task_list = []
    for task in tasks:
        sub_tasks_count = len(task.sub_tasks) if task.sub_tasks else 0
        comments_count = len(task.comments) if task.comments else 0
        
        task_list.append({
            "id": task.id,
            "project_id": task.project_id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "assignee_id": task.assignee_id,
            "reporter_id": task.reporter_id,
            "estimated_hours": task.estimated_hours,
            "actual_hours": task.actual_hours,
            "start_date": task.start_date,
            "due_date": task.due_date,
            "completed_date": task.completed_date,
            "parent_task_id": task.parent_task_id,
            "tags": task.tags or [],
            "labels": task.labels or [],
            "order_index": task.order_index,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "project": {
                "id": task.project.id,
                "name": task.project.name,
                "project_code": task.project.project_code,
                "project_lead_id": task.project.project_lead_id,
            } if task.project else None,
            "_count": {
                "sub_tasks": sub_tasks_count,
                "comments": comments_count,
            },
        })
    
    return task_list


async def update_task_service(
    db: AsyncSession,
    task_id: str,
    data: Dict[str, Any],
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Update task"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project).selectinload(Project.members)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Only admin or this project's lead may edit task fields (employees comment / log time only)
    can_update = user_role == Role.ADMIN or task.project.project_lead_id == user_id

    if not can_update:
        raise AuthorizationError("Only an admin or project lead can edit task details")
    
    # If changing assignee, verify new assignee exists and is on project
    if data.get("assignee_id") is not None and data["assignee_id"] != task.assignee_id:
        result = await db.execute(select(User).where(User.id == data["assignee_id"]))
        new_assignee = result.scalar_one_or_none()
        
        if not new_assignee:
            raise NotFoundError("New assignee not found")
        
        is_project_member = (
            task.project.project_lead_id == data["assignee_id"] or
            any(m.user_id == data["assignee_id"] for m in task.project.members)
        )
        
        if not is_project_member:
            raise ValidationError("New assignee is not a project member")
    
    # If marking as complete, set completed_date
    if data.get("status") == TaskStatus.DONE.value and task.status != TaskStatus.DONE.value:
        data["completed_date"] = datetime.utcnow()
    
    # Update task
    for key, value in data.items():
        if value is not None:
            setattr(task, key, value)
    
    await db.commit()
    await db.refresh(task)
    
    # Get task with relations
    result = await db.execute(
        select(Task).options(
            selectinload(Task.assignee).selectinload(User.profile)
        ).where(Task.id == task.id)
    )
    task_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": task_with_relations.id,
        "project_id": task_with_relations.project_id,
        "title": task_with_relations.title,
        "description": task_with_relations.description,
        "status": task_with_relations.status,
        "priority": task_with_relations.priority,
        "assignee_id": task_with_relations.assignee_id,
        "reporter_id": task_with_relations.reporter_id,
        "estimated_hours": task_with_relations.estimated_hours,
        "actual_hours": task_with_relations.actual_hours,
        "start_date": task_with_relations.start_date,
        "due_date": task_with_relations.due_date,
        "completed_date": task_with_relations.completed_date,
        "parent_task_id": task_with_relations.parent_task_id,
        "tags": task_with_relations.tags or [],
        "labels": task_with_relations.labels or [],
        "order_index": task_with_relations.order_index,
        "created_at": task_with_relations.created_at,
        "updated_at": task_with_relations.updated_at,
        "assignee": {
            "id": task_with_relations.assignee.id,
            "username": task_with_relations.assignee.username,
            "profile": {
                "first_name": task_with_relations.assignee.profile.first_name if task_with_relations.assignee.profile else None,
                "last_name": task_with_relations.assignee.profile.last_name if task_with_relations.assignee.profile else None,
            } if task_with_relations.assignee.profile else None,
        } if task_with_relations.assignee else None,
    }


async def delete_task_service(
    db: AsyncSession,
    task_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, str]:
    """Delete task"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Only Admin or Project Lead can delete
    if user_role != Role.ADMIN and task.project.project_lead_id != user_id:
        raise AuthorizationError("Only admin or project lead can delete tasks")
    
    await db.delete(task)
    await db.commit()
    
    return {"message": "Task deleted successfully"}


async def update_task_status_service(
    db: AsyncSession,
    task_id: str,
    status: TaskStatus,
    user_id: str,
    user_role: Role,
) -> Dict[str, Any]:
    """Update task status"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project).selectinload(Project.members)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Assignees can track their own progress; admin/lead can always change status
    can_update = (
        user_role == Role.ADMIN
        or task.project.project_lead_id == user_id
        or task.assignee_id == user_id
    )

    if not can_update:
        raise AuthorizationError("Not authorized to update task status")
    
    completed_date = datetime.utcnow() if status == TaskStatus.DONE and task.status != TaskStatus.DONE.value else task.completed_date
    
    task.status = status.value
    task.completed_date = completed_date
    
    await db.commit()
    await db.refresh(task)
    
    # Format response
    return {
        "id": task.id,
        "status": task.status,
        "completed_date": task.completed_date,
    }


async def assign_task_service(
    db: AsyncSession,
    task_id: str,
    assignee_id: Optional[str],
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Assign task to user"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project).selectinload(Project.members)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Only Admin or Project Lead can reassign
    if user_role != Role.ADMIN and task.project.project_lead_id != user_id:
        raise AuthorizationError("Only admin or project lead can assign tasks")
    
    # If assigning to someone, verify they're on the project
    if assignee_id:
        result = await db.execute(select(User).where(User.id == assignee_id))
        assignee = result.scalar_one_or_none()
        
        if not assignee:
            raise NotFoundError("Assignee not found")
        
        is_project_member = (
            task.project.project_lead_id == assignee_id or
            any(m.user_id == assignee_id for m in task.project.members)
        )
        
        if not is_project_member:
            raise ValidationError("Assignee must be a project member")
    
    task.assignee_id = assignee_id
    
    await db.commit()
    await db.refresh(task)
    
    # Get task with relations
    result = await db.execute(
        select(Task).options(
            selectinload(Task.assignee).selectinload(User.profile)
        ).where(Task.id == task.id)
    )
    task_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": task_with_relations.id,
        "project_id": task_with_relations.project_id,
        "title": task_with_relations.title,
        "description": task_with_relations.description,
        "status": task_with_relations.status,
        "priority": task_with_relations.priority,
        "assignee_id": task_with_relations.assignee_id,
        "reporter_id": task_with_relations.reporter_id,
        "estimated_hours": task_with_relations.estimated_hours,
        "actual_hours": task_with_relations.actual_hours,
        "start_date": task_with_relations.start_date,
        "due_date": task_with_relations.due_date,
        "completed_date": task_with_relations.completed_date,
        "parent_task_id": task_with_relations.parent_task_id,
        "tags": task_with_relations.tags or [],
        "labels": task_with_relations.labels or [],
        "order_index": task_with_relations.order_index,
        "created_at": task_with_relations.created_at,
        "updated_at": task_with_relations.updated_at,
        "assignee": {
            "id": task_with_relations.assignee.id,
            "username": task_with_relations.assignee.username,
            "profile": {
                "first_name": task_with_relations.assignee.profile.first_name if task_with_relations.assignee.profile else None,
                "last_name": task_with_relations.assignee.profile.last_name if task_with_relations.assignee.profile else None,
            } if task_with_relations.assignee.profile else None,
        } if task_with_relations.assignee else None,
    }


async def add_dependency_service(
    db: AsyncSession,
    task_id: str,
    depends_on_task_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, Any]:
    """Add dependency between tasks"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    result = await db.execute(
        select(Task).where(Task.id == depends_on_task_id)
    )
    depends_on_task = result.scalar_one_or_none()
    
    if not task or not depends_on_task:
        raise NotFoundError("Task not found")
    
    # Tasks must be in the same project
    if task.project_id != depends_on_task.project_id:
        raise ValidationError("Tasks must be in the same project")
    
    # Only Admin or Project Lead can add dependencies
    if user_role != Role.ADMIN and task.project.project_lead_id != user_id:
        raise AuthorizationError("Only admin or project lead can add dependencies")
    
    # Check if dependency already exists
    result = await db.execute(
        select(TaskDependency).where(
            and_(
                TaskDependency.task_id == task_id,
                TaskDependency.depends_on_task_id == depends_on_task_id
            )
        )
    )
    existing_dependency = result.scalar_one_or_none()
    
    if existing_dependency:
        raise ConflictError("Dependency already exists")
    
    # Create dependency
    dependency = TaskDependency(
        task_id=task_id,
        depends_on_task_id=depends_on_task_id,
    )
    
    db.add(dependency)
    await db.commit()
    await db.refresh(dependency)
    
    # Get dependency with relations
    result = await db.execute(
        select(TaskDependency).options(
            selectinload(TaskDependency.depends_on_task)
        ).where(TaskDependency.id == dependency.id)
    )
    dependency_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": dependency_with_relations.id,
        "task_id": dependency_with_relations.task_id,
        "depends_on_task_id": dependency_with_relations.depends_on_task_id,
        "depends_on_task": {
            "id": dependency_with_relations.depends_on_task.id,
            "title": dependency_with_relations.depends_on_task.title,
            "status": dependency_with_relations.depends_on_task.status,
        } if dependency_with_relations.depends_on_task else None,
    }


async def remove_dependency_service(
    db: AsyncSession,
    task_id: str,
    depends_on_task_id: str,
    user_id: str,
    user_role: Role
) -> Dict[str, str]:
    """Remove dependency"""
    result = await db.execute(
        select(TaskDependency).options(
            selectinload(TaskDependency.task).selectinload(Task.project)
        ).where(
            and_(
                TaskDependency.task_id == task_id,
                TaskDependency.depends_on_task_id == depends_on_task_id
            )
        )
    )
    dependency = result.scalar_one_or_none()
    
    if not dependency:
        raise NotFoundError("Dependency not found")
    
    # Only Admin or Project Lead can remove dependencies
    if user_role != Role.ADMIN and dependency.task.project.project_lead_id != user_id:
        raise AuthorizationError("Only admin or project lead can remove dependencies")
    
    await db.delete(dependency)
    await db.commit()
    
    return {"message": "Dependency removed successfully"}


async def add_comment_service(
    db: AsyncSession,
    task_id: str,
    content: str,
    user_id: str,
    mentions: Optional[List[str]] = None,
    user_role: Optional[Role] = None,
) -> Dict[str, Any]:
    """Add comment to task"""
    result = await db.execute(
        select(Task).options(
            selectinload(Task.project).selectinload(Project.members)
        ).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise NotFoundError("Task not found")
    
    # Check access to task
    has_access = (
        user_role == Role.ADMIN or
        task.project.project_lead_id == user_id or
        any(m.user_id == user_id for m in task.project.members) or
        task.assignee_id == user_id or
        task.reporter_id == user_id
    )
    
    if not has_access:
        raise AuthorizationError("Access denied to this task")
    
    # Create comment
    comment = TaskComment(
        task_id=task_id,
        user_id=user_id,
        content=content,
        mentions=mentions or [],
    )
    
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    # Get comment with relations
    result = await db.execute(
        select(TaskComment).options(
            selectinload(TaskComment.user).selectinload(User.profile)
        ).where(TaskComment.id == comment.id)
    )
    comment_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": comment_with_relations.id,
        "task_id": comment_with_relations.task_id,
        "user_id": comment_with_relations.user_id,
        "content": comment_with_relations.content,
        "mentions": comment_with_relations.mentions or [],
        "created_at": comment_with_relations.created_at,
        "updated_at": comment_with_relations.updated_at,
        "user": {
            "id": comment_with_relations.user.id,
            "username": comment_with_relations.user.username,
            "profile": {
                "first_name": comment_with_relations.user.profile.first_name if comment_with_relations.user.profile else None,
                "last_name": comment_with_relations.user.profile.last_name if comment_with_relations.user.profile else None,
            } if comment_with_relations.user.profile else None,
        } if comment_with_relations.user else None,
    }


async def reorder_tasks_service(
    db: AsyncSession,
    project_id: str,
    task_ids: List[str],
    user_id: str,
    user_role: Role
) -> Dict[str, str]:
    """Reorder tasks (for Kanban drag-drop)"""
    # Check project access
    result = await db.execute(
        select(Project).options(
            selectinload(Project.members)
        ).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise NotFoundError("Project not found")
    
    can_reorder = user_role == Role.ADMIN or project.project_lead_id == user_id

    if not can_reorder:
        raise AuthorizationError("Only an admin or project lead can reorder tasks")

    # Update order index for each task
    for index, task_id in enumerate(task_ids):
        result = await db.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        
        if task and task.project_id == project_id:
            task.order_index = index
            db.add(task)
    
    await db.commit()
    
    return {"message": "Tasks reordered successfully"}

