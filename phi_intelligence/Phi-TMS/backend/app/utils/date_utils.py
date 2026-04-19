"""Date utilities"""
from datetime import datetime, timedelta, time
from typing import Optional
import calendar


def calculate_total_hours(
    clock_in: datetime,
    clock_out: datetime,
    break_start: Optional[datetime] = None,
    break_end: Optional[datetime] = None
) -> float:
    """Calculate total hours worked (matches Node.js date-fns implementation)"""
    # Calculate total minutes
    total_minutes = (clock_out - clock_in).total_seconds() / 60
    
    # Calculate break minutes
    break_minutes = 0
    if break_start and break_end:
        break_minutes = (break_end - break_start).total_seconds() / 60
    
    # Calculate work minutes
    work_minutes = total_minutes - break_minutes
    
    # Convert to hours
    return max(0, work_minutes / 60)


def calculate_overtime_hours(
    total_hours: float,
    standard_hours: float = 8.0
) -> float:
    """Calculate overtime hours"""
    return max(0, total_hours - standard_hours)


def calculate_working_days(
    start_date: datetime,
    end_date: datetime,
    exclude_weekends: bool = True
) -> int:
    """Calculate working days between two dates (matches Node.js date-fns implementation)"""
    current_date = start_date.date()
    end_date_only = end_date.date()
    days = []
    
    # Generate all days in the interval
    while current_date <= end_date_only:
        days.append(current_date)
        current_date += timedelta(days=1)
    
    if not exclude_weekends:
        return len(days)
    
    # Filter out weekends (Saturday = 5, Sunday = 6)
    working_days = [day for day in days if day.weekday() < 5]
    return len(working_days)


def get_today_range() -> tuple[datetime, datetime]:
    """Get start and end of today (matches Node.js date-fns startOfDay/endOfDay)"""
    today = datetime.utcnow().date()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)
    return start, end


def start_of_day(date: datetime) -> datetime:
    """Get start of day for a given date (matches Node.js date-fns startOfDay)"""
    date_only = date.date()
    return datetime.combine(date_only, time.min)


def end_of_day(date: datetime) -> datetime:
    """Get end of day for a given date (matches Node.js date-fns endOfDay)"""
    date_only = date.date()
    return datetime.combine(date_only, time.max)


def format_date(date: datetime, format_str: str = "%Y-%m-%d") -> str:
    """Format date to string"""
    return date.strftime(format_str)


def parse_date_string(date_str: str) -> datetime:
    """Parse date string to datetime (matches Node.js parseISO)"""
    # Remove Z suffix and parse
    if date_str.endswith('Z'):
        date_str = date_str[:-1] + '+00:00'
    return datetime.fromisoformat(date_str)

