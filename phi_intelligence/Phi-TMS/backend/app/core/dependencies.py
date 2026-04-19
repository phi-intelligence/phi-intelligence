"""Dependency injection"""
from typing import Optional, TYPE_CHECKING
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError
from app.models.enums import Role

if TYPE_CHECKING:
    from app.models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> "User":
    """Get current authenticated user"""
    token = credentials.credentials
    
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("id")
        if user_id is None:
            raise AuthenticationError("Invalid token payload")
    except Exception as e:
        raise AuthenticationError(str(e))
    
    # Get user from database
    from sqlalchemy import select
    from app.models.user import User
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None or not user.is_active:
        raise AuthenticationError("User not found or inactive")
    
    return user


async def get_current_active_user(
    current_user: "User" = Depends(get_current_user)
) -> "User":
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_roles(*allowed_roles: Role):
    """Dependency to check user roles"""
    async def role_checker(current_user: "User" = Depends(get_current_active_user)) -> "User":
        user_role = Role(current_user.role)
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

