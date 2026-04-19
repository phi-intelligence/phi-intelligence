"""Authentication service"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import AuthenticationError, NotFoundError, ConflictError
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.leave import LeaveType, LeaveBalance
from app.models.enums import Role


def serialize_datetime(dt):
    """Convert datetime to ISO format string"""
    return dt.isoformat() if dt else None


async def login_service(db: AsyncSession, email: str, password: str) -> Dict[str, Any]:
    """Login service"""
    # Find user by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise AuthenticationError("Invalid credentials")
    
    # Check password
    if not verify_password(password, user.password):
        raise AuthenticationError("Invalid credentials")
    
    # Generate token
    token = create_access_token({
        "id": user.id,
        "email": user.email,
        "role": user.role,
    })
    
    # Get user profile
    result = await db.execute(select(EmployeeProfile).where(EmployeeProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    
    # Return user data (without password) and token
    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "isActive": user.is_active,
        "createdAt": serialize_datetime(user.created_at),
        "updatedAt": serialize_datetime(user.updated_at),
    }
    
    if profile:
        user_dict["profile"] = {
            "id": profile.id,
            "userId": profile.user_id,
            "firstName": profile.first_name,
            "lastName": profile.last_name,
            "phone": profile.phone,
            "address": profile.address,
            "designation": profile.designation,
            "department": profile.department,
            "location": profile.location,
            "joinDate": serialize_datetime(profile.join_date),
            "avatarUrl": profile.avatar_url,
            "createdAt": serialize_datetime(profile.created_at),
            "updatedAt": serialize_datetime(profile.updated_at),
        }
    
    return {
        "user": user_dict,
        "token": token,
    }


async def register_service(db: AsyncSession, data: Dict[str, Any]) -> Dict[str, Any]:
    """Register service"""
    # Check if user already exists
    result = await db.execute(
        select(User).where(
            (User.email == data["email"]) | (User.username == data["username"])
        )
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise ConflictError("User with this email or username already exists")
    
    # Hash password
    hashed_password = get_password_hash(data["password"])
    
    # Create user
    user = User(
        email=data["email"],
        username=data["username"],
        password=hashed_password,
        role=data.get("role", Role.EMPLOYEE.value),
        is_active=True,
    )
    
    db.add(user)
    await db.flush()
    
    # Create profile
    profile_data = data["profile"]
    profile = EmployeeProfile(
        user_id=user.id,
        first_name=profile_data["first_name"],
        last_name=profile_data["last_name"],
        phone=profile_data.get("phone"),
        address=profile_data.get("address"),
        designation=profile_data["designation"],
        department=profile_data["department"],
        location=profile_data["location"],
        join_date=profile_data["join_date"],
    )
    
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    await db.refresh(profile)
    
    # Initialize leave balances
    await initialize_leave_balances(db, user.id, profile_data["location"])
    
    # Return user data (without password)
    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "phone": profile.phone,
            "address": profile.address,
            "designation": profile.designation,
            "department": profile.department,
            "location": profile.location,
            "join_date": profile.join_date,
            "avatar_url": profile.avatar_url,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        },
    }
    
    return user_dict


async def change_password_service(
    db: AsyncSession,
    user_id: str,
    old_password: str,
    new_password: str
) -> bool:
    """Change password service"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundError("User not found")
    
    # Verify old password
    if not verify_password(old_password, user.password):
        raise AuthenticationError("Current password is incorrect")
    
    # Hash new password
    hashed_password = get_password_hash(new_password)
    
    # Update password
    user.password = hashed_password
    await db.commit()
    
    return True


async def get_current_user_service(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """Get current user service"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundError("User not found")
    
    # Get user profile
    result = await db.execute(select(EmployeeProfile).where(EmployeeProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    
    user_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "isActive": user.is_active,
        "createdAt": serialize_datetime(user.created_at),
        "updatedAt": serialize_datetime(user.updated_at),
    }
    
    if profile:
        user_dict["profile"] = {
            "id": profile.id,
            "userId": profile.user_id,
            "firstName": profile.first_name,
            "lastName": profile.last_name,
            "phone": profile.phone,
            "address": profile.address,
            "designation": profile.designation,
            "department": profile.department,
            "location": profile.location,
            "joinDate": serialize_datetime(profile.join_date),
            "avatarUrl": profile.avatar_url,
            "createdAt": serialize_datetime(profile.created_at),
            "updatedAt": serialize_datetime(profile.updated_at),
        }
    
    return user_dict


async def initialize_leave_balances(db: AsyncSession, user_id: str, location: str) -> None:
    """Initialize leave balances for a user"""
    current_year = datetime.utcnow().year
    
    # Get leave types for the user's region
    result = await db.execute(
        select(LeaveType).where(
            (LeaveType.region == location) | (LeaveType.region == "BOTH"),
            LeaveType.is_active == True
        )
    )
    leave_types = result.scalars().all()
    
    # Create leave balances
    for leave_type in leave_types:
        leave_balance = LeaveBalance(
            user_id=user_id,
            leave_type_id=leave_type.id,
            year=current_year,
            total_days=float(leave_type.days_allowed),
            used_days=0.0,
            remaining_days=float(leave_type.days_allowed),
        )
        db.add(leave_balance)
    
    await db.commit()

