"""Employee service"""
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, ConflictError, ValidationError
from app.core.security import encrypt, decrypt
from app.models.user import User
from app.models.employee_profile import EmployeeProfile
from app.models.enums import Role


async def get_all_employees_service(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Get all employees service"""
    department = filters.get("department") if filters else None
    location = filters.get("location") if filters else None
    role = filters.get("role") if filters else None
    is_active = filters.get("is_active") if filters else None
    search = filters.get("search") if filters else None
    page = filters.get("page", 1) if filters else 1
    limit = filters.get("limit", 10) if filters else 10
    
    conditions = []
    
    if is_active is not None:
        conditions.append(User.is_active == is_active)
    
    if role:
        conditions.append(User.role == role)
    
    if search:
        conditions.append(
            or_(
                User.email.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
                EmployeeProfile.first_name.ilike(f"%{search}%"),
                EmployeeProfile.last_name.ilike(f"%{search}%"),
            )
        )
    
    # Build query with joins for filtering
    query = select(User).options(selectinload(User.profile))
    
    if department or location or search:
        query = query.join(EmployeeProfile, User.id == EmployeeProfile.user_id)
        if department:
            conditions.append(EmployeeProfile.department == department)
        if location:
            conditions.append(EmployeeProfile.location == location)
    else:
        # Still need to join for profile loading
        query = query.outerjoin(EmployeeProfile, User.id == EmployeeProfile.user_id)
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Get total count
    count_query = select(func.count()).select_from(User)
    if conditions:
        if department or location or search:
            count_query = count_query.join(EmployeeProfile, User.id == EmployeeProfile.user_id)
        count_query = count_query.where(and_(*conditions))
    
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    skip = (page - 1) * limit
    query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    employees = result.scalars().unique().all()
    
    # Format response
    formatted_employees = []
    for employee in employees:
        formatted_employees.append({
            "id": employee.id,
            "email": employee.email,
            "username": employee.username,
            "role": employee.role,
            "is_active": employee.is_active,
            "created_at": employee.created_at,
            "profile": {
                "first_name": employee.profile.first_name if employee.profile else None,
                "last_name": employee.profile.last_name if employee.profile else None,
                "phone": employee.profile.phone if employee.profile else None,
                "designation": employee.profile.designation if employee.profile else None,
                "department": employee.profile.department if employee.profile else None,
                "location": employee.profile.location if employee.profile else None,
                "join_date": employee.profile.join_date if employee.profile else None,
                "avatar_url": employee.profile.avatar_url if employee.profile else None,
            } if employee.profile else None,
        })
    
    return {
        "employees": formatted_employees,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
        },
    }


async def get_employee_by_id_service(
    db: AsyncSession,
    employee_id: str,
    include_sensitive: bool = False
) -> Dict[str, Any]:
    """Get employee by ID service"""
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == employee_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundError("Employee not found")
    
    # Format response
    employee_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
    
    if user.profile:
        profile_dict = {
            "id": user.profile.id,
            "user_id": user.profile.user_id,
            "first_name": user.profile.first_name,
            "last_name": user.profile.last_name,
            "phone": user.profile.phone,
            "address": user.profile.address,
            "designation": user.profile.designation,
            "department": user.profile.department,
            "location": user.profile.location,
            "join_date": user.profile.join_date,
            "avatar_url": user.profile.avatar_url,
            "created_at": user.profile.created_at,
            "updated_at": user.profile.updated_at,
        }
        
        # Decrypt sensitive data if requested
        if include_sensitive:
            if user.profile.bank_details:
                try:
                    profile_dict["bank_details"] = decrypt(user.profile.bank_details)
                except Exception:
                    profile_dict["bank_details"] = None
            if user.profile.salary_info:
                try:
                    profile_dict["salary_info"] = decrypt(user.profile.salary_info)
                except Exception:
                    profile_dict["salary_info"] = None
        else:
            profile_dict["bank_details"] = None
            profile_dict["salary_info"] = None
        
        employee_dict["profile"] = profile_dict
    
    return employee_dict


async def update_employee_service(
    db: AsyncSession,
    employee_id: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Update employee service"""
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == employee_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundError("Employee not found")
    
    # Check for unique constraints
    if data.get("email") or data.get("username"):
        conditions = [User.id != employee_id]
        email_conditions = []
        username_conditions = []
        
        if data.get("email"):
            email_conditions.append(User.email == data["email"])
        if data.get("username"):
            username_conditions.append(User.username == data["username"])
        
        if email_conditions or username_conditions:
            conditions.append(or_(*email_conditions, *username_conditions))
            
            result = await db.execute(select(User).where(and_(*conditions)))
            conflict_user = result.scalar_one_or_none()
            
            if conflict_user:
                raise ConflictError("Email or username already in use")
    
    # Update user fields
    if "email" in data:
        user.email = data["email"]
    if "username" in data:
        user.username = data["username"]
    if "role" in data:
        user.role = data["role"]
    if "is_active" in data:
        user.is_active = data["is_active"]
    
    # Update profile if provided
    if "profile" in data and user.profile:
        profile_data = data["profile"]
        
        # Encrypt sensitive data
        if "bank_details" in profile_data and profile_data["bank_details"]:
            profile_data["bank_details"] = encrypt(profile_data["bank_details"])
        if "salary_info" in profile_data and profile_data["salary_info"]:
            profile_data["salary_info"] = encrypt(profile_data["salary_info"])
        
        # Update profile fields
        for key, value in profile_data.items():
            if hasattr(user.profile, key) and value is not None:
                setattr(user.profile, key, value)
    
    await db.commit()
    await db.refresh(user)
    await db.refresh(user.profile) if user.profile else None
    
    # Format response
    employee_dict = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }
    
    if user.profile:
        employee_dict["profile"] = {
            "id": user.profile.id,
            "user_id": user.profile.user_id,
            "first_name": user.profile.first_name,
            "last_name": user.profile.last_name,
            "phone": user.profile.phone,
            "address": user.profile.address,
            "designation": user.profile.designation,
            "department": user.profile.department,
            "location": user.profile.location,
            "join_date": user.profile.join_date,
            "avatar_url": user.profile.avatar_url,
            "created_at": user.profile.created_at,
            "updated_at": user.profile.updated_at,
        }
        # Remove sensitive data from response
        employee_dict["profile"]["bank_details"] = None
        employee_dict["profile"]["salary_info"] = None
    
    return employee_dict


async def deactivate_employee_service(db: AsyncSession, employee_id: str) -> bool:
    """Deactivate employee service"""
    result = await db.execute(select(User).where(User.id == employee_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundError("Employee not found")
    
    user.is_active = False
    await db.commit()
    
    return True


async def get_employee_profile_service(
    db: AsyncSession,
    user_id: str
) -> Dict[str, Any]:
    """Get employee profile service"""
    result = await db.execute(
        select(EmployeeProfile).options(selectinload(EmployeeProfile.user)).where(
            EmployeeProfile.user_id == user_id
        )
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise NotFoundError("Profile not found")
    
    # Format response (without sensitive data)
    profile_dict = {
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
        "emergency_contact": profile.emergency_contact,
        "avatar_url": profile.avatar_url,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
        "user": {
            "id": profile.user.id,
            "email": profile.user.email,
            "username": profile.user.username,
            "role": profile.user.role,
            "is_active": profile.user.is_active,
        } if profile.user else None,
    }
    
    # Remove sensitive data
    profile_dict["bank_details"] = None
    profile_dict["salary_info"] = None
    
    return profile_dict


async def update_employee_profile_service(
    db: AsyncSession,
    user_id: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """Update employee profile service"""
    result = await db.execute(
        select(EmployeeProfile).where(EmployeeProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise NotFoundError("Profile not found")
    
    # Update profile fields
    for key, value in data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)
    
    await db.commit()
    await db.refresh(profile)
    
    # Format response
    profile_dict = {
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
        "emergency_contact": profile.emergency_contact,
        "avatar_url": profile.avatar_url,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }
    
    return profile_dict

