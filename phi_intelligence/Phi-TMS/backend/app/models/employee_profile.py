"""EmployeeProfile model"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import Region


class EmployeeProfile(Base):
    """EmployeeProfile model"""
    __tablename__ = "employee_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    designation = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False, index=True)  # Region enum
    join_date = Column(DateTime(timezone=True), nullable=False)
    bank_details = Column(String, nullable=True)  # Encrypted
    emergency_contact = Column(String, nullable=True)
    salary_info = Column(String, nullable=True)  # Encrypted
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="profile")
    
    # Indexes already defined via index=True on columns

