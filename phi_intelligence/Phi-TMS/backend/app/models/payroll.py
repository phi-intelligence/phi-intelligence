"""Payroll models"""
from sqlalchemy import Column, String, DateTime, Float, Integer, Boolean, ForeignKey, Index, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base
from app.models.enums import Region, PaymentFrequency, ComponentType, PayrollStatus


class SalaryStructure(Base):
    """SalaryStructure model"""
    __tablename__ = "salary_structures"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    basic_salary = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="GBP")
    effective_from = Column(DateTime(timezone=True), nullable=False)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    region = Column(String, nullable=False)  # Region enum
    payment_frequency = Column(String, nullable=False, default=PaymentFrequency.MONTHLY.value)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="salary_structure")
    components = relationship("SalaryComponent", back_populates="salary_structure", cascade="all, delete-orphan")
    
    # Index defined via index=True on column


class SalaryComponent(Base):
    """SalaryComponent model"""
    __tablename__ = "salary_components"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    salary_structure_id = Column(String, ForeignKey("salary_structures.id", ondelete="CASCADE"), nullable=False, index=True)
    component_type = Column(String, nullable=False)  # ComponentType enum
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    is_percentage = Column(Boolean, nullable=False, default=False)
    calculation_base = Column(String, nullable=True)  # e.g., "BASIC", "GROSS"
    is_taxable = Column(Boolean, nullable=False, default=True)
    is_statutory = Column(Boolean, nullable=False, default=False)
    region = Column(String, nullable=False)  # Region enum
    
    # Relationships
    salary_structure = relationship("SalaryStructure", back_populates="components")
    
    # Index defined via index=True on column


class PayrollCycle(Base):
    """PayrollCycle model"""
    __tablename__ = "payroll_cycles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cycle_month = Column(Integer, nullable=False)
    cycle_year = Column(Integer, nullable=False)
    region = Column(String, nullable=False)  # Region enum
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, nullable=False, default=PayrollStatus.DRAFT.value, index=True)
    total_gross = Column(Float, nullable=True)
    total_deductions = Column(Float, nullable=True)
    total_net = Column(Float, nullable=True)
    processed_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    paid_date = Column(DateTime(timezone=True), nullable=True)
    payment_method = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    processed_by = relationship("User", back_populates="processed_payrolls", foreign_keys=[processed_by_id])
    entries = relationship("PayrollEntry", back_populates="payroll_cycle", cascade="all, delete-orphan")
    cost_allocations = relationship("ProjectCostAllocation", back_populates="payroll_cycle", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint("cycle_month", "cycle_year", "region", name="uq_payroll_cycles_month_year_region"),
    )


class PayrollEntry(Base):
    """PayrollEntry model"""
    __tablename__ = "payroll_entries"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    payroll_cycle_id = Column(String, ForeignKey("payroll_cycles.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    working_days = Column(Integer, nullable=False)
    paid_days = Column(Float, nullable=False)
    leave_deductions = Column(Float, nullable=False, default=0)
    gross_salary = Column(Float, nullable=False)
    total_allowances = Column(Float, nullable=False, default=0)
    total_deductions = Column(Float, nullable=False, default=0)
    net_salary = Column(Float, nullable=False)
    income_tax = Column(Float, nullable=False, default=0)
    provident_fund = Column(Float, nullable=False, default=0)
    national_insurance = Column(Float, nullable=False, default=0)
    other_deductions = Column(Float, nullable=False, default=0)
    overtime_pay = Column(Float, nullable=False, default=0)
    bonuses = Column(Float, nullable=False, default=0)
    adjustments = Column(Float, nullable=False, default=0)
    status = Column(String, nullable=False, default="DRAFT")
    payslip_url = Column(String, nullable=True)
    payment_reference = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    payroll_cycle = relationship("PayrollCycle", back_populates="entries")
    user = relationship("User", back_populates="payroll_entries")
    payroll_adjustments = relationship("PayrollAdjustment", back_populates="payroll_entry", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint("payroll_cycle_id", "user_id", name="uq_payroll_entries_cycle_user"),
    )


class TaxConfiguration(Base):
    """TaxConfiguration model"""
    __tablename__ = "tax_configurations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    region = Column(String, nullable=False, index=True)  # Region enum
    tax_year = Column(Integer, nullable=False)
    tax_slabs = Column(JSON, nullable=False)  # Array of {min, max, rate}
    standard_deduction = Column(Float, nullable=True)
    other_settings = Column(JSON, nullable=True)
    effective_from = Column(DateTime(timezone=True), nullable=False)
    effective_to = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        UniqueConstraint("region", "tax_year", name="uq_tax_configurations_region_year"),
    )


class PayrollAdjustment(Base):
    """PayrollAdjustment model"""
    __tablename__ = "payroll_adjustments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    payroll_entry_id = Column(String, ForeignKey("payroll_entries.id", ondelete="CASCADE"), nullable=False, index=True)
    adjustment_type = Column(String, nullable=False)  # e.g., "BONUS", "DEDUCTION", "ARREARS"
    amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    approved_by_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    payroll_entry = relationship("PayrollEntry", back_populates="payroll_adjustments")
    approved_by = relationship("User", back_populates="payroll_adjustments", foreign_keys=[approved_by_id])
    
    # Index defined via index=True on column


class PayrollReport(Base):
    """PayrollReport model"""
    __tablename__ = "payroll_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    report_type = Column(String, nullable=False, index=True)
    report_month = Column(Integer, nullable=True)
    report_year = Column(Integer, nullable=True)
    region = Column(String, nullable=True)  # Region enum
    generated_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    file_url = Column(String, nullable=True)
    parameters = Column(JSON, nullable=True)  # Store report parameters
    
    # Relationships
    generated_by = relationship("User", back_populates="generated_reports", foreign_keys=[generated_by_id])
    
    # Indexes defined via index=True on columns


class ProjectCostAllocation(Base):
    """ProjectCostAllocation model"""
    __tablename__ = "project_cost_allocations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    payroll_cycle_id = Column(String, ForeignKey("payroll_cycles.id", ondelete="CASCADE"), nullable=False, index=True)
    hours_logged = Column(Float, nullable=False)
    allocation_percentage = Column(Float, nullable=False)
    salary_allocated = Column(Float, nullable=False)
    actual_cost = Column(Float, nullable=False)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="cost_allocations")
    user = relationship("User", back_populates="project_costs")
    payroll_cycle = relationship("PayrollCycle", back_populates="cost_allocations")
    
    __table_args__ = (
        UniqueConstraint("project_id", "user_id", "payroll_cycle_id", name="uq_project_cost_allocations_project_user_cycle"),
    )

