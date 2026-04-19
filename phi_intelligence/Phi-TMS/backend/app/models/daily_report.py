"""Daily Report model"""
from sqlalchemy import Column, String, Text, DateTime, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base
from app.models.enums import ReportStatus


class DailyReport(Base):
    """Daily report submitted by employees"""
    __tablename__ = "daily_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    raw_content = Column(Text, nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.DRAFT)
    ai_session_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="daily_reports")
