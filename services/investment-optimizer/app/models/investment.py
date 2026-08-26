from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


class InvestmentPlan(Base):
    __tablename__ = "investment_plans"
    __table_args__ = {"schema": "investment"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    total_budget_inr = Column(Numeric(15, 2), nullable=False)
    expected_risk_reduction = Column(Numeric(5, 4), default=0)
    expected_eal_reduction_inr = Column(Numeric(15, 2), default=0)
    rosi = Column(Numeric(8, 4), default=0)
    status = Column(String(20), default="DRAFT")
    created_by = Column(UUID(as_uuid=True))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class InvestmentItem(Base):
    __tablename__ = "investment_items"
    __table_args__ = {"schema": "investment"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("investment.investment_plans.id"))
    control_id = Column(UUID(as_uuid=True))
    allocation_inr = Column(Numeric(12, 2), nullable=False)
    risk_reduction = Column(Numeric(5, 4), default=0)
    expected_rosi = Column(Numeric(8, 4), default=0)
    priority = Column(Integer, default=0)
    implementation_start = Column(DateTime)
    implementation_end = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())


class SecurityControl(Base):
    __tablename__ = "security_controls"
    __table_args__ = {"schema": "control"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    control_type = Column(String(30), nullable=False)
    description = Column(String)
    implementation_cost_inr = Column(Numeric(12, 2), nullable=False, default=0)
    annual_maintenance_inr = Column(Numeric(12, 2), default=0)
    max_risk_reduction = Column(Numeric(5, 4), default=0)
    implementation_time_days = Column(Integer, default=30)
    maturity_levels = Column(Integer, default=3)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
