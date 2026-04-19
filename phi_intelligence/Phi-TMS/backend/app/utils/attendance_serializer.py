"""Serialize Attendance model to camelCase for frontend API responses."""
from typing import Optional, Any


def _serialize_dt(dt_val: Any) -> Optional[str]:
    if dt_val is None:
        return None
    if isinstance(dt_val, str):
        return dt_val
    if hasattr(dt_val, "isoformat"):
        return dt_val.isoformat()
    return str(dt_val)


def attendance_to_camel(attendance: Any) -> dict:
    """Convert Attendance model instance to camelCase dict for API response."""
    if attendance is None:
        return {}
    return {
        "id": getattr(attendance, "id", None),
        "userId": getattr(attendance, "user_id", None),
        "date": _serialize_dt(getattr(attendance, "date", None)),
        "clockIn": _serialize_dt(getattr(attendance, "clock_in", None)),
        "clockOut": _serialize_dt(getattr(attendance, "clock_out", None)),
        "breakStart": _serialize_dt(getattr(attendance, "break_start", None)),
        "breakEnd": _serialize_dt(getattr(attendance, "break_end", None)),
        "totalHours": getattr(attendance, "total_hours", None),
        "totalWorkMinutes": getattr(attendance, "total_work_minutes", None),
        "overtimeHours": getattr(attendance, "overtime_hours", None),
        "isLate": getattr(attendance, "is_late", False),
        "status": getattr(attendance, "status", None),
        "notes": getattr(attendance, "notes", None),
        "createdAt": _serialize_dt(getattr(attendance, "created_at", None)),
        "updatedAt": _serialize_dt(getattr(attendance, "updated_at", None)),
    }
