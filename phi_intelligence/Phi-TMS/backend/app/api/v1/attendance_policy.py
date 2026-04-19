"""Attendance Policy and Correction API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.attendance_policy import AttendancePolicy
from app.models.attendance_correction import AttendanceCorrection
from app.models.attendance import Attendance
from app.models.enums import LeaveRequestStatus
from app.utils.response import success_response

router = APIRouter()


# === Attendance Policy ===

@router.get("/policy")
async def get_policy(db: AsyncSession = Depends(get_db)):
    """Get current attendance policy"""
    result = await db.execute(
        AttendancePolicy.__table__.select().where(AttendancePolicy.is_active == True).order_by(AttendancePolicy.created_at.desc())
    )
    policy = result.fetchone()
    if not policy:
        return success_response("No active policy", None)
    return success_response("Policy retrieved", dict(policy._mapping))


@router.post("/policy")
async def create_policy(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create attendance policy (admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    
    policy = AttendancePolicy(
        name=data.get("name", "Default"),
        expected_start_time=data.get("expected_start_time", "09:00:00"),
        grace_period_minutes=data.get("grace_period_minutes", 15),
        late_threshold_minutes=data.get("late_threshold_minutes", 30),
        working_days=data.get("working_days", [0, 1, 2, 3, 4]),
    )
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return success_response("Policy created", {"id": policy.id})


@router.put("/policy/{policy_id}")
async def update_policy(
    policy_id: str,
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update attendance policy (admin only)"""
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    
    result = await db.execute(
        AttendancePolicy.__table__.select().where(AttendancePolicy.id == policy_id)
    )
    policy = result.fetchone()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    
    await db.execute(
        AttendancePolicy.__table__.update().where(AttendancePolicy.id == policy_id).values(**data)
    )
    await db.commit()
    return success_response("Policy updated", {"id": policy_id})


# === Attendance Correction ===

@router.post("/correction")
async def request_correction(
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request attendance correction"""
    attendance_id = data.get("attendance_id")
    requested_clock_in = data.get("requested_clock_in")
    requested_clock_out = data.get("requested_clock_out")
    reason = data.get("reason")
    
    if not attendance_id or not reason:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="attendance_id and reason required")
    
    correction = AttendanceCorrection(
        attendance_id=attendance_id,
        user_id=current_user.id,
        requested_clock_in=requested_clock_in,
        requested_clock_out=requested_clock_out,
        reason=reason,
    )
    db.add(correction)
    await db.commit()
    await db.refresh(correction)
    return success_response("Correction requested", {"id": correction.id})


@router.get("/corrections")
async def get_corrections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get corrections (admin sees all, user sees own)"""
    if current_user.role in ["ADMIN", "PROJECT_LEAD"]:
        result = await db.execute(
            AttendanceCorrection.__table__.select().order_by(AttendanceCorrection.created_at.desc())
        )
    else:
        result = await db.execute(
            AttendanceCorrection.__table__.select()
            .where(AttendanceCorrection.user_id == current_user.id)
            .order_by(AttendanceCorrection.created_at.desc())
        )
    corrections = result.fetchall()
    return success_response("Corrections retrieved", [dict(c._mapping) for c in corrections])


@router.patch("/corrections/{correction_id}")
async def review_correction(
    correction_id: str,
    data: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Review correction (approve/reject)"""
    if current_user.role not in ["ADMIN", "PROJECT_LEAD"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin/Lead only")
    
    result = await db.execute(
        AttendanceCorrection.__table__.select().where(AttendanceCorrection.id == correction_id)
    )
    correction = result.fetchone()
    if not correction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Correction not found")
    
    status_val = data.get("status")
    admin_notes = data.get("admin_notes", "")
    
    if status_val not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="status must be APPROVED or REJECTED")
    
    await db.execute(
        AttendanceCorrection.__table__.update().where(AttendanceCorrection.id == correction_id).values(
            status=status_val,
            reviewed_by=current_user.id,
            reviewed_at=datetime.utcnow(),
            admin_notes=admin_notes,
        )
    )
    
    # If approved, update attendance
    if status_val == "APPROVED":
        update_data = {}
        if correction.requested_clock_in:
            update_data["clock_in"] = correction.requested_clock_in
        if correction.requested_clock_out:
            update_data["clock_out"] = correction.requested_clock_out
        if update_data:
            await db.execute(
                Attendance.__table__.update().where(Attendance.id == correction.attendance_id).values(**update_data)
            )
    
    await db.commit()
    return success_response("Correction reviewed", {"id": correction_id, "status": status_val})
