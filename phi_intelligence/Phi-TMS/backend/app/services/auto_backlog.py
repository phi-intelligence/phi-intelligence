"""Background job: auto-move overdue, uncompleted tasks to BACKLOG.

Runs periodically from the FastAPI lifespan. An admin or project lead can
manually reschedule tasks out of BACKLOG afterwards.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime

from sqlalchemy import update

from app.core.database import AsyncSessionLocal
from app.models.task import Task
from app.models.enums import TaskStatus


logger = logging.getLogger(__name__)


# Statuses that are "still open work" and therefore eligible for the
# auto-backlog sweep once the due_date has passed.
_OPEN_STATUSES: tuple[str, ...] = (
    TaskStatus.TODO.value,
    TaskStatus.IN_PROGRESS.value,
    TaskStatus.IN_REVIEW.value,
    TaskStatus.BLOCKED.value,
)


async def sweep_overdue_to_backlog() -> int:
    """Move tasks whose due_date is past and which are not DONE/BACKLOG into BACKLOG.

    Returns the number of rows updated.
    """
    now = datetime.utcnow()

    async with AsyncSessionLocal() as db:
        stmt = (
            update(Task)
            .where(
                Task.due_date.is_not(None),
                Task.due_date < now,
                Task.status.in_(_OPEN_STATUSES),
            )
            .values(status=TaskStatus.BACKLOG.value, updated_at=now)
        )
        result = await db.execute(stmt)
        await db.commit()
        count = result.rowcount or 0
        if count:
            logger.info("auto_backlog: moved %s overdue task(s) to BACKLOG", count)
        return count


async def auto_backlog_loop(interval_seconds: int = 3600) -> None:
    """Run the sweep forever on a simple timer.

    Kept intentionally tiny - no external scheduler dependency. Uses the
    DB session factory directly and logs on every iteration.
    """
    # Small delay so we don't race with startup DB readiness.
    await asyncio.sleep(10)
    while True:
        try:
            await sweep_overdue_to_backlog()
        except Exception:  # pragma: no cover - keep the loop alive
            logger.exception("auto_backlog: sweep failed")
        await asyncio.sleep(interval_seconds)
