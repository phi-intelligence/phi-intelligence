"""AI API routes - Plan and Report processing"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, AuthorizationError
from app.models.user import User
from app.models.project import Project, ProjectMember
from app.models.enums import Role
from app.services.ai.planner import analyze_plan
from app.services.ai.reporter import process_report
from app.services.ai.apply_actions import apply_planner, apply_reporter
from app.services.ai.insights import generate_admin_insights, generate_tasks_from_objective
from app.utils.response import success_response

router = APIRouter()


@router.get("/admin/insights")
async def admin_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN, Role.PROJECT_LEAD))
):
    """Return AI-generated narrative insights + the snapshot used to build them."""
    try:
        result = await generate_admin_insights(db)
        return success_response("Admin insights generated", result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/projects/{project_id}/generate-tasks")
async def generate_project_tasks(
    project_id: str,
    body: Dict[str, str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    """Draft a list of tasks for a project objective. Returns the plan only;
    use POST /ai/plan/apply with the same plan + project_id to commit."""
    objective = (body or {}).get("objective", "").strip()
    if not objective:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="objective required")

    project_result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.members).selectinload(ProjectMember.user).selectinload(User.profile),
            selectinload(Project.project_lead).selectinload(User.profile),
        )
        .where(Project.id == project_id)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    member_names: List[str] = []
    if project.project_lead and project.project_lead.profile:
        first = project.project_lead.profile.first_name or ""
        last = project.project_lead.profile.last_name or ""
        full = (first + " " + last).strip()
        member_names.append(full or project.project_lead.username)
    for member in project.members or []:
        user = member.user
        if not user:
            continue
        if user.profile:
            full = ((user.profile.first_name or "") + " " + (user.profile.last_name or "")).strip()
            member_names.append(full or user.username)
        else:
            member_names.append(user.username)

    try:
        plan = await generate_tasks_from_objective(project.name, objective, member_names)
        return success_response("Tasks drafted", {"plan": plan, "project_id": project_id})
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/plan/analyze")
async def analyze_plan_endpoint(
    plan_text: Dict[str, str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    """Analyze a project plan and return structured tasks (admin only)."""
    try:
        result = await analyze_plan(plan_text.get("plan", ""))
        return success_response("Plan analyzed", result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/plan/apply")
async def apply_plan_endpoint(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    """Apply a plan - create tasks from the analyzed plan (admin only)."""
    try:
        plan = data.get("plan")
        project_id = data.get("project_id")
        if not plan or not project_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="plan and project_id required")
        tasks = await apply_planner(db, plan, str(project_id), str(current_user.id))
        task_ids = [t["id"] for t in tasks]
        return success_response("Plan applied", {"created_tasks": task_ids})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/report/process")
async def process_report_endpoint(
    report: Dict[str, str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process a daily report and extract actions"""
    try:
        result = await process_report(report.get("content", ""))
        return success_response("Report processed", result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/report/confirm")
async def confirm_report_actions(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm and apply selected actions from report processing"""
    actions = data.get("actions", [])
    try:
        results = await apply_reporter(db, actions, str(current_user.id), current_user.role)
        return success_response("Actions applied", results)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
