"""Analytics API routes"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.analytics_service import attendance_analytics, leave_analytics, workload_analytics
from app.utils.response import success_response

router = APIRouter()


@router.get("/attendance")
async def get_attendance_analytics(
    days: int = Query(30),
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get attendance analytics"""
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"]:
        raise HTTPException(status_code=403, detail="Admin/Lead only")
    result = await attendance_analytics(db, days, user_id)
    return success_response("Attendance analytics", result)


@router.get("/leave")
async def get_leave_analytics(
    year: int = Query(None),
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leave analytics"""
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"]:
        raise HTTPException(status_code=403, detail="Admin/Lead only")
    result = await leave_analytics(db, year, user_id)
    return success_response("Leave analytics", result)


@router.get("/workload")
async def get_workload_analytics(
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get workload analytics"""
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"]:
        raise HTTPException(status_code=403, detail="Admin/Lead only")
    result = await workload_analytics(db, user_id)
    return success_response("Workload analytics", result)
