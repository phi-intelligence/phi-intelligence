"""Apply AI-generated actions to the system"""
import logging
from datetime import date
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.task import Task
from app.models.enums import TaskStatus, Role
from app.services.task_service import create_task_service, update_task_status_service
from app.services.timelog_service import log_time_service
from app.services.comment_service import comment_service

logger = logging.getLogger(__name__)

# Map AI status strings to TaskStatus
STATUS_MAP = {
    "TODO": TaskStatus.TODO,
    "IN_PROGRESS": TaskStatus.IN_PROGRESS,
    "DONE": TaskStatus.DONE,
    "COMPLETED": TaskStatus.DONE,
    "IN_REVIEW": TaskStatus.IN_REVIEW,
    "BLOCKED": TaskStatus.BLOCKED,
    "CANCELLED": TaskStatus.BLOCKED,
}


async def apply_planner(
    db: AsyncSession,
    plan: Dict[str, Any],
    project_id: str,
    user_id: str,
) -> List[Dict[str, Any]]:
    """Apply planner output - create tasks from plan. Returns list of created task dicts (with id)."""
    created = []
    phases = plan.get("phases", [])
    for phase in phases:
        for task_data in phase.get("tasks", []):
            data = {
                "project_id": project_id,
                "title": task_data.get("title", "Untitled"),
                "description": task_data.get("description", ""),
                "priority": task_data.get("priority", "MEDIUM"),
                "estimated_hours": task_data.get("estimated_hours"),
            }
            task_result = await create_task_service(db, data, user_id)
            created.append(task_result)
    return created


def _to_role(role: str) -> Role:
    """Convert string role to Role enum."""
    try:
        return Role(role) if role else Role.EMPLOYEE
    except ValueError:
        return Role.EMPLOYEE


async def apply_reporter(
    db: AsyncSession,
    actions: List[Dict[str, Any]],
    user_id: str,
    user_role: str,
) -> Dict[str, Any]:
    """Apply reporter output - update tasks, add comments, log time, create tasks."""
    results = {"updated": [], "created": [], "logged": []}
    role_enum = _to_role(user_role)
    for action in actions:
        action_type = action.get("type")
        try:
            if action_type == "update_status":
                task_id = action.get("task_id")
                status_str = action.get("status")
                if task_id and status_str:
                    status = STATUS_MAP.get(
                        (status_str or "").upper(),
                        TaskStatus.IN_PROGRESS,
                    )
                    await update_task_status_service(
                        db,
                        str(task_id),
                        status,
                        user_id,
                        role_enum,
                    )
                    results["updated"].append(task_id)
            elif action_type == "add_comment":
                task_id = action.get("task_id")
                comment = action.get("comment")
                if task_id and comment:
                    await comment_service.add_comment(
                        db, str(task_id), user_id, comment or ""
                    )
                    results["updated"].append(task_id)
            elif action_type == "log_time":
                task_id = action.get("task_id")
                hours = action.get("hours")
                if task_id and hours is not None:
                    # Need project_id for log_time_service; get from task
                    result = await db.execute(
                        select(Task).where(Task.id == str(task_id))
                    )
                    task = result.scalar_one_or_none()
                    if task:
                        await log_time_service(
                            db,
                            user_id,
                            {
                                "project_id": task.project_id,
                                "task_id": str(task_id),
                                "hours": float(hours),
                                "date": date.today(),
                                "description": "AI-reported work",
                            },
                        )
                        results["logged"].append(task_id)
            elif action_type == "create_task":
                project_id = action.get("project_id")
                title = action.get("task_title")
                if project_id and title:
                    task_result = await create_task_service(
                        db,
                        {
                            "project_id": str(project_id),
                            "title": title,
                            "description": action.get("description", ""),
                        },
                        user_id,
                    )
                    results["created"].append(task_result.get("id"))
        except Exception as e:
            logger.warning("AI action apply failed: %s", e)
    return results
