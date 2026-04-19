"""Leave service"""
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload

from app.core.exceptions import ValidationError, NotFoundError, ConflictError
from app.models.leave import LeaveType, LeaveBalance, LeaveRequest, PublicHoliday
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.enums import LeaveRequestStatus, Region
from app.utils.date_utils import calculate_working_days


async def get_leave_types_service(db: AsyncSession, region: Optional[str] = None) -> List[LeaveType]:
    """Get leave types service"""
    conditions = [LeaveType.is_active == True]
    
    if region:
        conditions.append(
            or_(LeaveType.region == region, LeaveType.region == "BOTH")
        )
    
    result = await db.execute(
        select(LeaveType).where(and_(*conditions)).order_by(LeaveType.name.asc())
    )
    leave_types = result.scalars().all()
    
    return list(leave_types)


async def get_my_leave_balances_service(
    db: AsyncSession,
    user_id: str,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Get my leave balances service"""
    target_year = year or datetime.utcnow().year
    
    result = await db.execute(
        select(LeaveBalance).options(selectinload(LeaveBalance.leave_type)).where(
            LeaveBalance.user_id == user_id,
            LeaveBalance.year == target_year
        ).order_by(LeaveBalance.leave_type.has(LeaveType.name))
    )
    balances = result.scalars().all()
    
    # Format response
    formatted_balances = []
    for balance in balances:
        formatted_balances.append({
            "id": balance.id,
            "user_id": balance.user_id,
            "leave_type_id": balance.leave_type_id,
            "year": balance.year,
            "total_days": balance.total_days,
            "used_days": balance.used_days,
            "remaining_days": balance.remaining_days,
            "created_at": balance.created_at,
            "updated_at": balance.updated_at,
            "leave_type": {
                "id": balance.leave_type.id,
                "name": balance.leave_type.name,
                "region": balance.leave_type.region,
                "days_allowed": balance.leave_type.days_allowed,
                "accrual_rate": balance.leave_type.accrual_rate,
                "carry_forward": balance.leave_type.carry_forward,
                "is_encashable": balance.leave_type.is_encashable,
                "description": balance.leave_type.description,
            } if balance.leave_type else None,
        })
    
    return formatted_balances


async def request_leave_service(
    db: AsyncSession,
    user_id: str,
    leave_type_id: str,
    start_date: datetime,
    end_date: datetime,
    reason: Optional[str] = None
) -> Dict[str, Any]:
    """Request leave service"""
    # Validate dates
    if start_date > end_date:
        raise ValidationError("Start date must be before end date")
    
    # Check if leave type exists and is valid for user's region
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.profile:
        raise NotFoundError("User not found")
    
    result = await db.execute(select(LeaveType).where(LeaveType.id == leave_type_id))
    leave_type = result.scalar_one_or_none()
    
    if not leave_type or not leave_type.is_active:
        raise ValidationError("Invalid leave type")
    
    if leave_type.region != "BOTH" and leave_type.region != user.profile.location:
        raise ValidationError("This leave type is not available for your region")
    
    # Calculate total days (excluding weekends)
    total_days = float(calculate_working_days(start_date, end_date))
    
    # Check leave balance
    result = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.user_id == user_id,
            LeaveBalance.leave_type_id == leave_type_id,
            LeaveBalance.year == start_date.year
        )
    )
    balance = result.scalar_one_or_none()
    
    if not balance:
        raise ValidationError("No leave balance found for this leave type")
    
    if balance.remaining_days < total_days:
        raise ValidationError(
            f"Insufficient leave balance. Available: {balance.remaining_days} days, Requested: {total_days} days"
        )
    
    # Check for overlapping leave requests
    result = await db.execute(
        select(LeaveRequest).where(
            LeaveRequest.user_id == user_id,
            LeaveRequest.status.in_(["PENDING", "APPROVED"]),
            or_(
                and_(
                    LeaveRequest.start_date <= start_date,
                    LeaveRequest.end_date >= start_date
                ),
                and_(
                    LeaveRequest.start_date <= end_date,
                    LeaveRequest.end_date >= end_date
                ),
                and_(
                    LeaveRequest.start_date >= start_date,
                    LeaveRequest.end_date <= end_date
                )
            )
        )
    )
    overlapping = result.scalar_one_or_none()
    
    if overlapping:
        raise ConflictError("You have an overlapping leave request")
    
    # Create leave request
    leave_request = LeaveRequest(
        user_id=user_id,
        leave_type_id=leave_type_id,
        start_date=start_date,
        end_date=end_date,
        total_days=total_days,
        reason=reason,
        status=LeaveRequestStatus.PENDING.value,
    )
    
    db.add(leave_request)
    await db.commit()
    await db.refresh(leave_request)
    
    # Get related data
    result = await db.execute(
        select(LeaveRequest).options(
            selectinload(LeaveRequest.leave_type),
            selectinload(LeaveRequest.user).selectinload(User.profile)
        ).where(LeaveRequest.id == leave_request.id)
    )
    leave_request_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": leave_request_with_relations.id,
        "user_id": leave_request_with_relations.user_id,
        "leave_type_id": leave_request_with_relations.leave_type_id,
        "start_date": leave_request_with_relations.start_date,
        "end_date": leave_request_with_relations.end_date,
        "total_days": leave_request_with_relations.total_days,
        "reason": leave_request_with_relations.reason,
        "status": leave_request_with_relations.status,
        "approver_id": leave_request_with_relations.approver_id,
        "approved_at": leave_request_with_relations.approved_at,
        "rejection_reason": leave_request_with_relations.rejection_reason,
        "created_at": leave_request_with_relations.created_at,
        "updated_at": leave_request_with_relations.updated_at,
        "leave_type": {
            "id": leave_request_with_relations.leave_type.id,
            "name": leave_request_with_relations.leave_type.name,
            "region": leave_request_with_relations.leave_type.region,
        } if leave_request_with_relations.leave_type else None,
        "user": {
            "email": leave_request_with_relations.user.email,
            "profile": {
                "first_name": leave_request_with_relations.user.profile.first_name if leave_request_with_relations.user.profile else None,
                "last_name": leave_request_with_relations.user.profile.last_name if leave_request_with_relations.user.profile else None,
            } if leave_request_with_relations.user.profile else None,
        } if leave_request_with_relations.user else None,
    }


async def get_my_leave_requests_service(
    db: AsyncSession,
    user_id: str,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get my leave requests service"""
    conditions = [LeaveRequest.user_id == user_id]
    
    if status:
        conditions.append(LeaveRequest.status == status)
    
    result = await db.execute(
        select(LeaveRequest).options(
            selectinload(LeaveRequest.leave_type),
            selectinload(LeaveRequest.approver).selectinload(User.profile)
        ).where(and_(*conditions)).order_by(LeaveRequest.created_at.desc())
    )
    requests = result.scalars().all()
    
    # Format response
    formatted_requests = []
    for req in requests:
        formatted_requests.append({
            "id": req.id,
            "user_id": req.user_id,
            "leave_type_id": req.leave_type_id,
            "start_date": req.start_date,
            "end_date": req.end_date,
            "total_days": req.total_days,
            "reason": req.reason,
            "status": req.status,
            "approver_id": req.approver_id,
            "approved_at": req.approved_at,
            "rejection_reason": req.rejection_reason,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "leave_type": {
                "id": req.leave_type.id,
                "name": req.leave_type.name,
                "region": req.leave_type.region,
            } if req.leave_type else None,
            "approver": {
                "id": req.approver.id,
                "email": req.approver.email,
                "profile": {
                    "first_name": req.approver.profile.first_name if req.approver.profile else None,
                    "last_name": req.approver.profile.last_name if req.approver.profile else None,
                } if req.approver.profile else None,
            } if req.approver else None,
        })
    
    return formatted_requests


async def get_pending_leave_requests_service(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """Get pending leave requests service"""
    conditions = [LeaveRequest.status == LeaveRequestStatus.PENDING.value]
    
    # Build query with joins for filtering by department/location
    query = select(LeaveRequest).options(
        selectinload(LeaveRequest.leave_type),
        selectinload(LeaveRequest.user).selectinload(User.profile)
    )
    
    if filters and (filters.get("department") or filters.get("location")):
        query = query.join(User).join(EmployeeProfile)
        if filters.get("department"):
            conditions.append(EmployeeProfile.department == filters["department"])
        if filters.get("location"):
            conditions.append(EmployeeProfile.location == filters["location"])
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(LeaveRequest.created_at.asc())
    
    result = await db.execute(query)
    requests = result.scalars().all()
    
    # Format response
    formatted_requests = []
    for req in requests:
        formatted_requests.append({
            "id": req.id,
            "user_id": req.user_id,
            "leave_type_id": req.leave_type_id,
            "start_date": req.start_date,
            "end_date": req.end_date,
            "total_days": req.total_days,
            "reason": req.reason,
            "status": req.status,
            "approver_id": req.approver_id,
            "approved_at": req.approved_at,
            "rejection_reason": req.rejection_reason,
            "created_at": req.created_at,
            "updated_at": req.updated_at,
            "leave_type": {
                "id": req.leave_type.id,
                "name": req.leave_type.name,
                "region": req.leave_type.region,
            } if req.leave_type else None,
            "user": {
                "id": req.user.id,
                "email": req.user.email,
                "profile": {
                    "first_name": req.user.profile.first_name if req.user.profile else None,
                    "last_name": req.user.profile.last_name if req.user.profile else None,
                    "designation": req.user.profile.designation if req.user.profile else None,
                    "department": req.user.profile.department if req.user.profile else None,
                    "location": req.user.profile.location if req.user.profile else None,
                } if req.user.profile else None,
            } if req.user else None,
        })
    
    return formatted_requests


async def approve_leave_request_service(
    db: AsyncSession,
    request_id: str,
    approver_id: str
) -> Dict[str, Any]:
    """Approve leave request service"""
    result = await db.execute(
        select(LeaveRequest).options(selectinload(LeaveRequest.leave_type)).where(LeaveRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise NotFoundError("Leave request not found")
    
    if request.status != LeaveRequestStatus.PENDING.value:
        raise ValidationError("Leave request is already processed")
    
    # Update leave balance
    result = await db.execute(
        select(LeaveBalance).where(
            LeaveBalance.user_id == request.user_id,
            LeaveBalance.leave_type_id == request.leave_type_id,
            LeaveBalance.year == request.start_date.year
        )
    )
    balance = result.scalar_one_or_none()
    
    if not balance:
        raise NotFoundError("Leave balance not found")
    
    # Use transaction to ensure atomicity
    try:
        # Update leave request
        request.status = LeaveRequestStatus.APPROVED.value
        request.approver_id = approver_id
        request.approved_at = datetime.utcnow()
        
        # Update leave balance
        balance.used_days = balance.used_days + request.total_days
        balance.remaining_days = balance.remaining_days - request.total_days
        
        await db.commit()
        await db.refresh(request)
        await db.refresh(balance)
        
        # Get related data
        result = await db.execute(
            select(LeaveRequest).options(
                selectinload(LeaveRequest.leave_type),
                selectinload(LeaveRequest.user).selectinload(User.profile),
                selectinload(LeaveRequest.approver).selectinload(User.profile)
            ).where(LeaveRequest.id == request_id)
        )
        request_with_relations = result.scalar_one_or_none()
        
        # Format response
        return {
            "id": request_with_relations.id,
            "user_id": request_with_relations.user_id,
            "leave_type_id": request_with_relations.leave_type_id,
            "start_date": request_with_relations.start_date,
            "end_date": request_with_relations.end_date,
            "total_days": request_with_relations.total_days,
            "reason": request_with_relations.reason,
            "status": request_with_relations.status,
            "approver_id": request_with_relations.approver_id,
            "approved_at": request_with_relations.approved_at,
            "rejection_reason": request_with_relations.rejection_reason,
            "created_at": request_with_relations.created_at,
            "updated_at": request_with_relations.updated_at,
            "leave_type": {
                "id": request_with_relations.leave_type.id,
                "name": request_with_relations.leave_type.name,
                "region": request_with_relations.leave_type.region,
            } if request_with_relations.leave_type else None,
            "user": {
                "email": request_with_relations.user.email,
                "profile": {
                    "first_name": request_with_relations.user.profile.first_name if request_with_relations.user.profile else None,
                    "last_name": request_with_relations.user.profile.last_name if request_with_relations.user.profile else None,
                } if request_with_relations.user.profile else None,
            } if request_with_relations.user else None,
            "approver": {
                "email": request_with_relations.approver.email,
                "profile": {
                    "first_name": request_with_relations.approver.profile.first_name if request_with_relations.approver.profile else None,
                    "last_name": request_with_relations.approver.profile.last_name if request_with_relations.approver.profile else None,
                } if request_with_relations.approver.profile else None,
            } if request_with_relations.approver else None,
        }
    except Exception as e:
        await db.rollback()
        raise


async def reject_leave_request_service(
    db: AsyncSession,
    request_id: str,
    approver_id: str,
    reason: Optional[str] = None
) -> Dict[str, Any]:
    """Reject leave request service"""
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise NotFoundError("Leave request not found")
    
    if request.status != LeaveRequestStatus.PENDING.value:
        raise ValidationError("Leave request is already processed")
    
    # Update leave request
    request.status = LeaveRequestStatus.REJECTED.value
    request.approver_id = approver_id
    request.approved_at = datetime.utcnow()
    request.rejection_reason = reason
    
    await db.commit()
    await db.refresh(request)
    
    # Get related data
    result = await db.execute(
        select(LeaveRequest).options(
            selectinload(LeaveRequest.leave_type),
            selectinload(LeaveRequest.user).selectinload(User.profile),
            selectinload(LeaveRequest.approver).selectinload(User.profile)
        ).where(LeaveRequest.id == request_id)
    )
    request_with_relations = result.scalar_one_or_none()
    
    # Format response
    return {
        "id": request_with_relations.id,
        "user_id": request_with_relations.user_id,
        "leave_type_id": request_with_relations.leave_type_id,
        "start_date": request_with_relations.start_date,
        "end_date": request_with_relations.end_date,
        "total_days": request_with_relations.total_days,
        "reason": request_with_relations.reason,
        "status": request_with_relations.status,
        "approver_id": request_with_relations.approver_id,
        "approved_at": request_with_relations.approved_at,
        "rejection_reason": request_with_relations.rejection_reason,
        "created_at": request_with_relations.created_at,
        "updated_at": request_with_relations.updated_at,
        "leave_type": {
            "id": request_with_relations.leave_type.id,
            "name": request_with_relations.leave_type.name,
            "region": request_with_relations.leave_type.region,
        } if request_with_relations.leave_type else None,
        "user": {
            "email": request_with_relations.user.email,
            "profile": {
                "first_name": request_with_relations.user.profile.first_name if request_with_relations.user.profile else None,
                "last_name": request_with_relations.user.profile.last_name if request_with_relations.user.profile else None,
            } if request_with_relations.user.profile else None,
        } if request_with_relations.user else None,
        "approver": {
            "email": request_with_relations.approver.email,
            "profile": {
                "first_name": request_with_relations.approver.profile.first_name if request_with_relations.approver.profile else None,
                "last_name": request_with_relations.approver.profile.last_name if request_with_relations.approver.profile else None,
            } if request_with_relations.approver.profile else None,
        } if request_with_relations.approver else None,
    }


async def cancel_leave_request_service(
    db: AsyncSession,
    request_id: str,
    user_id: str
) -> Dict[str, Any]:
    """Cancel leave request service"""
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
    request = result.scalar_one_or_none()
    
    if not request:
        raise NotFoundError("Leave request not found")
    
    if request.user_id != user_id:
        raise ValidationError("You can only cancel your own leave requests")
    
    if request.status != LeaveRequestStatus.PENDING.value:
        raise ValidationError("Only pending leave requests can be cancelled")
    
    # Update leave request
    request.status = LeaveRequestStatus.CANCELLED.value
    
    await db.commit()
    await db.refresh(request)
    
    # Format response
    return {
        "id": request.id,
        "user_id": request.user_id,
        "leave_type_id": request.leave_type_id,
        "start_date": request.start_date,
        "end_date": request.end_date,
        "total_days": request.total_days,
        "reason": request.reason,
        "status": request.status,
        "approver_id": request.approver_id,
        "approved_at": request.approved_at,
        "rejection_reason": request.rejection_reason,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
    }


async def get_leave_calendar_service(
    db: AsyncSession,
    start_date: datetime,
    end_date: datetime,
    user_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get leave calendar service"""
    conditions = [
        LeaveRequest.status == LeaveRequestStatus.APPROVED.value,
        LeaveRequest.start_date <= end_date,
        LeaveRequest.end_date >= start_date,
    ]
    
    if user_id:
        conditions.append(LeaveRequest.user_id == user_id)
    
    result = await db.execute(
        select(LeaveRequest).options(
            selectinload(LeaveRequest.leave_type),
            selectinload(LeaveRequest.user).selectinload(User.profile)
        ).where(and_(*conditions)).order_by(LeaveRequest.start_date.asc())
    )
    leaves = result.scalars().all()
    
    # Format response
    formatted_leaves = []
    for leave in leaves:
        formatted_leaves.append({
            "id": leave.id,
            "user_id": leave.user_id,
            "leave_type_id": leave.leave_type_id,
            "start_date": leave.start_date,
            "end_date": leave.end_date,
            "total_days": leave.total_days,
            "reason": leave.reason,
            "status": leave.status,
            "leave_type": {
                "id": leave.leave_type.id,
                "name": leave.leave_type.name,
                "region": leave.leave_type.region,
            } if leave.leave_type else None,
            "user": {
                "id": leave.user.id,
                "email": leave.user.email,
                "profile": {
                    "first_name": leave.user.profile.first_name if leave.user.profile else None,
                    "last_name": leave.user.profile.last_name if leave.user.profile else None,
                } if leave.user.profile else None,
            } if leave.user else None,
        })
    
    return formatted_leaves


async def get_public_holidays_service(
    db: AsyncSession,
    region: Optional[str] = None,
    year: Optional[int] = None
) -> List[Dict[str, Any]]:
    """Get public holidays service"""
    target_year = year or datetime.utcnow().year
    start_date = datetime(target_year, 1, 1)
    end_date = datetime(target_year, 12, 31)
    
    conditions = [
        PublicHoliday.date >= start_date,
        PublicHoliday.date <= end_date,
    ]
    
    if region:
        conditions.append(
            or_(PublicHoliday.region == region, PublicHoliday.region == "BOTH")
        )
    
    result = await db.execute(
        select(PublicHoliday).where(and_(*conditions)).order_by(PublicHoliday.date.asc())
    )
    holidays = result.scalars().all()
    
    # Format response
    formatted_holidays = []
    for holiday in holidays:
        formatted_holidays.append({
            "id": holiday.id,
            "name": holiday.name,
            "date": holiday.date,
            "region": holiday.region,
            "description": holiday.description,
            "created_at": holiday.created_at,
            "updated_at": holiday.updated_at,
        })
    
    return formatted_holidays


async def create_leave_type_service(
    db: AsyncSession,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Create leave type service"""
    # Check if leave type with same name and region already exists
    result = await db.execute(
        select(LeaveType).where(
            and_(
                LeaveType.name == data["name"],
                LeaveType.region == data["region"]
            )
        )
    )
    existing_leave_type = result.scalar_one_or_none()
    
    if existing_leave_type:
        raise ConflictError("Leave type with this name and region already exists")
    
    # Create leave type
    leave_type = LeaveType(
        name=data["name"],
        region=data["region"],
        days_allowed=data["days_allowed"],
        accrual_rate=data.get("accrual_rate"),
        carry_forward=data.get("carry_forward", False),
        is_encashable=data.get("is_encashable", False),
        description=data.get("description"),
        is_active=True,
    )
    
    db.add(leave_type)
    await db.commit()
    await db.refresh(leave_type)
    
    # Format response
    return {
        "id": leave_type.id,
        "name": leave_type.name,
        "region": leave_type.region,
        "days_allowed": leave_type.days_allowed,
        "accrual_rate": leave_type.accrual_rate,
        "carry_forward": leave_type.carry_forward,
        "is_encashable": leave_type.is_encashable,
        "description": leave_type.description,
        "is_active": leave_type.is_active,
        "created_at": leave_type.created_at,
        "updated_at": leave_type.updated_at,
    }


async def update_leave_type_service(
    db: AsyncSession,
    leave_type_id: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Update leave type service"""
    result = await db.execute(
        select(LeaveType).where(LeaveType.id == leave_type_id)
    )
    leave_type = result.scalar_one_or_none()
    
    if not leave_type:
        raise NotFoundError("Leave type not found")
    
    # Check if name and region combination is unique (if being changed)
    if data.get("name") or data.get("region"):
        name = data.get("name", leave_type.name)
        region = data.get("region", leave_type.region)
        
        result = await db.execute(
            select(LeaveType).where(
                and_(
                    LeaveType.name == name,
                    LeaveType.region == region,
                    LeaveType.id != leave_type_id
                )
            )
        )
        existing_leave_type = result.scalar_one_or_none()
        
        if existing_leave_type:
            raise ConflictError("Leave type with this name and region already exists")
    
    # Update leave type
    for key, value in data.items():
        if value is not None:
            setattr(leave_type, key, value)
    
    await db.commit()
    await db.refresh(leave_type)
    
    # Format response
    return {
        "id": leave_type.id,
        "name": leave_type.name,
        "region": leave_type.region,
        "days_allowed": leave_type.days_allowed,
        "accrual_rate": leave_type.accrual_rate,
        "carry_forward": leave_type.carry_forward,
        "is_encashable": leave_type.is_encashable,
        "description": leave_type.description,
        "is_active": leave_type.is_active,
        "created_at": leave_type.created_at,
        "updated_at": leave_type.updated_at,
    }


async def create_public_holiday_service(
    db: AsyncSession,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Create public holiday service"""
    # Normalize date to start of day for comparison
    from app.utils.date_utils import start_of_day
    holiday_date = start_of_day(data["date"])
    holiday_date_only = holiday_date.date()
    
    # Check if public holiday with same date and region already exists
    # Compare using date part only (extract date from datetime)
    result = await db.execute(
        select(PublicHoliday).where(
            and_(
                func.date(PublicHoliday.date) == holiday_date_only,
                PublicHoliday.region == data["region"]
            )
        )
    )
    existing_holiday = result.scalar_one_or_none()
    
    if existing_holiday:
        raise ConflictError("Public holiday with this date and region already exists")
    
    # Create public holiday (store normalized date)
    holiday = PublicHoliday(
        name=data["name"],
        date=holiday_date,
        region=data["region"],
        description=data.get("description"),
    )
    
    db.add(holiday)
    await db.commit()
    await db.refresh(holiday)
    
    # Format response
    return {
        "id": holiday.id,
        "name": holiday.name,
        "date": holiday.date,
        "region": holiday.region,
        "description": holiday.description,
        "created_at": holiday.created_at,
        "updated_at": holiday.updated_at,
    }


async def delete_public_holiday_service(
    db: AsyncSession,
    holiday_id: str
) -> Dict[str, str]:
    """Delete public holiday service"""
    result = await db.execute(
        select(PublicHoliday).where(PublicHoliday.id == holiday_id)
    )
    holiday = result.scalar_one_or_none()
    
    if not holiday:
        raise NotFoundError("Public holiday not found")
    
    db.delete(holiday)
    await db.commit()
    
    return {"message": "Public holiday deleted successfully"}

