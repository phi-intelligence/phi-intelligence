"""Database enums"""
from enum import Enum


class Role(str, Enum):
    """User roles"""
    ADMIN = "ADMIN"
    PROJECT_LEAD = "PROJECT_LEAD"
    EMPLOYEE = "EMPLOYEE"


class Region(str, Enum):
    """Regions"""
    UK = "UK"
    INDIA = "INDIA"
    BOTH = "BOTH"


class AttendanceStatus(str, Enum):
    """Attendance status"""
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LEAVE = "LEAVE"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"


class LeaveRequestStatus(str, Enum):
    """Leave request status"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class ProjectStatus(str, Enum):
    """Project status"""
    PLANNING = "PLANNING"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class TaskStatus(str, Enum):
    """Task status"""
    BACKLOG = "BACKLOG"
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    IN_REVIEW = "IN_REVIEW"
    BLOCKED = "BLOCKED"
    DONE = "DONE"


class Priority(str, Enum):
    """Priority levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PayrollStatus(str, Enum):
    """Payroll status"""
    DRAFT = "DRAFT"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    PAID = "PAID"


class PaymentFrequency(str, Enum):
    """Payment frequency"""
    MONTHLY = "MONTHLY"
    WEEKLY = "WEEKLY"
    BIWEEKLY = "BIWEEKLY"


class ComponentType(str, Enum):
    """Component type"""
    ALLOWANCE = "ALLOWANCE"
    DEDUCTION = "DEDUCTION"
    BENEFIT = "BENEFIT"


class ReportStatus(str, Enum):
    """Daily report status"""
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PROCESSED = "PROCESSED"
    CONFIRMED = "CONFIRMED"

