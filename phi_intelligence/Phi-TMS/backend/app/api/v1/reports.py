"""Daily Reports API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from datetime import date

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.daily_report import DailyReport
from app.models.enums import ReportStatus
from app.utils.response import success_response

router = APIRouter()


@router.post("")
async def create_or_update_report(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update daily report (upsert by user_id + date)."""
    raw_date = data.get("date") or str(date.today())
    # Accept both YYYY-MM-DD and ISO datetime strings
    try:
        report_date = date.fromisoformat(str(raw_date)[:10])
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid date")

    raw_content = data.get("content")
    if not raw_content or not str(raw_content).strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="content required")

    from sqlalchemy import select

    result = await db.execute(
        select(DailyReport).where(
            DailyReport.user_id == current_user.id,
            DailyReport.date == report_date,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.raw_content = raw_content
        existing.status = ReportStatus.SUBMITTED
        await db.commit()
        await db.refresh(existing)
        report_id = existing.id
    else:
        report = DailyReport(
            user_id=current_user.id,
            date=report_date,
            raw_content=raw_content,
            status=ReportStatus.SUBMITTED,
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        report_id = report.id

    return success_response("Report saved", {"id": report_id, "date": str(report_date)})


@router.get("/mine")
async def get_my_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's reports (with content for inline review)"""
    result = await db.execute(
        DailyReport.__table__.select()
        .where(DailyReport.user_id == current_user.id)
        .order_by(DailyReport.date.desc())
    )
    reports = result.fetchall()
    return success_response("Reports retrieved", [
        {
            "id": r.id,
            "date": str(r.date),
            "status": r.status,
            "raw_content": r.raw_content,
            "created_at": r.created_at,
        }
        for r in reports
    ])


@router.get("")
async def get_all_reports(
    start_date: str = None,
    end_date: str = None,
    user_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reports (admin / project lead).

    Joins user + profile so the admin viewer can show display names without
    a second round-trip. Only ADMIN and PROJECT_LEAD may call this.
    """
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")

    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.user import User as UserModel

    query = (
        select(DailyReport)
        .options(selectinload(DailyReport.user).selectinload(UserModel.profile))
    )
    if start_date:
        query = query.where(DailyReport.date >= start_date)
    if end_date:
        query = query.where(DailyReport.date <= end_date)
    if user_id:
        query = query.where(DailyReport.user_id == user_id)

    result = await db.execute(query.order_by(DailyReport.date.desc()))
    reports = result.scalars().all()
    return success_response("Reports retrieved", [
        {
            "id": r.id,
            "user_id": r.user_id,
            "date": str(r.date),
            "status": r.status,
            "created_at": r.created_at,
            "user": {
                "id": r.user.id,
                "email": r.user.email,
                "username": r.user.username,
                "profile": {
                    "first_name": r.user.profile.first_name if r.user.profile else None,
                    "last_name": r.user.profile.last_name if r.user.profile else None,
                } if r.user and r.user.profile else None,
            } if r.user else None,
        }
        for r in reports
    ])


@router.get("/{report_id}")
async def get_report_by_id(
    report_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch a single report (full raw_content). Owner or admin/lead only."""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.user import User as UserModel

    result = await db.execute(
        select(DailyReport)
        .options(selectinload(DailyReport.user).selectinload(UserModel.profile))
        .where(DailyReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    is_owner = report.user_id == current_user.id
    is_admin = current_user.role in ["ADMIN", "PROJECT_LEAD"]
    if not (is_owner or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return success_response("Report", {
        "id": report.id,
        "user_id": report.user_id,
        "date": str(report.date),
        "status": report.status,
        "raw_content": report.raw_content,
        "created_at": report.created_at,
        "user": {
            "id": report.user.id,
            "email": report.user.email,
            "username": report.user.username,
            "profile": {
                "first_name": report.user.profile.first_name if report.user.profile else None,
                "last_name": report.user.profile.last_name if report.user.profile else None,
            } if report.user and report.user.profile else None,
        } if report.user else None,
    })
