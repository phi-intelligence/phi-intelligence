"""Audit logging middleware"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.models.admin import AuditLog
from app.models.user import User


async def create_audit_log(
    db: AsyncSession,
    user_id: Optional[str],
    action: str,
    entity: str,
    entity_id: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Create an audit log entry"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        timestamp=datetime.utcnow(),
    )
    
    db.add(audit_log)
    await db.commit()
    await db.refresh(audit_log)
    
    return audit_log

