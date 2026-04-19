"""Authentication API routes"""
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import AuthenticationError
from app.middleware.audit_log import create_audit_log
from app.services.auth_service import (
    login_service,
    register_service,
    change_password_service,
    get_current_user_service,
)
from app.schemas.auth import LoginRequest, RegisterRequest, ChangePasswordRequest
from app.utils.response import success_response
from app.models.user import User

router = APIRouter()


@router.post("/login")
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login endpoint"""
    try:
        result = await login_service(db, login_data.email, login_data.password)
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=result["user"]["id"],
            action="LOGIN",
            entity="USER",
            entity_id=result["user"]["id"],
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Login successful", result)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/register")
async def register(
    request: Request,
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Register endpoint (Admin only)"""
    try:
        # Check if user is admin
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        user = await register_service(db, register_data.model_dump())
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CREATE_EMPLOYEE",
            entity="USER",
            entity_id=user["id"],
            new_value=str(user),
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Employee registered successfully", user, status_code=status.HTTP_201_CREATED)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/change-password")
async def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change password endpoint"""
    try:
        await change_password_service(
            db,
            current_user.id,
            password_data.old_password,
            password_data.new_password
        )
        
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="CHANGE_PASSWORD",
            entity="USER",
            entity_id=current_user.id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Password changed successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me")
async def get_current_user_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user endpoint"""
    try:
        user = await get_current_user_service(db, current_user.id)
        return success_response("User retrieved successfully", user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/logout")
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Logout endpoint"""
    try:
        # Create audit log
        await create_audit_log(
            db=db,
            user_id=current_user.id,
            action="LOGOUT",
            entity="USER",
            entity_id=current_user.id,
            ip_address=request.client.host if request.client else None,
        )
        
        return success_response("Logout successful")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

