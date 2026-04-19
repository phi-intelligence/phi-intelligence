"""Comment service"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError, AuthorizationError
from app.models.task import TaskComment
from app.models.user import User


async def add_comment(
    db: AsyncSession,
    task_id: str,
    user_id: str,
    content: str,
    mentions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Add a comment to a task"""
    comment = TaskComment(
        task_id=task_id,
        user_id=user_id,
        content=content,
        mentions=mentions or [],
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    
    result = await db.execute(
        select(TaskComment).options(
            selectinload(TaskComment.user).selectinload(User.profile)
        ).where(TaskComment.id == comment.id)
    )
    comment_with_relations = result.scalar_one_or_none()
    
    return {
        "id": comment_with_relations.id,
        "task_id": comment_with_relations.task_id,
        "user_id": comment_with_relations.user_id,
        "content": comment_with_relations.content,
        "mentions": comment_with_relations.mentions or [],
        "created_at": comment_with_relations.created_at,
        "updated_at": comment_with_relations.updated_at,
        "user": {
            "id": comment_with_relations.user.id,
            "username": comment_with_relations.user.username,
        } if comment_with_relations.user else None,
    }


comment_service = type("CommentService", (), {"add_comment": add_comment})()
