from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class OptimizeRequest(BaseModel):
    budget_inr: float = Field(..., gt=0, description="Total available budget in INR")
    time_horizon_years: int = Field(default=3, ge=1, le=10)
    max_per_control_percent: float = Field(default=0.40, gt=0, le=1.0)


class InvestmentItemResponse(BaseModel):
    control_id: str
    control_name: str
    control_type: str
    allocation_inr: float
    risk_reduction: float
    expected_rosi: float
    priority: int
    implementation_cost: float
    annual_maintenance: float

    class Config:
        from_attributes = True


class OptimizeResponse(BaseModel):
    total_budget: float
    total_allocated: float
    remaining_budget: float
    expected_risk_reduction: float
    expected_eal_reduction: float
    portfolio_rosi: float
    items: list[InvestmentItemResponse]
    summary: str


class ROSIResponse(BaseModel):
    control_id: str
    control_name: str
    control_type: str
    implementation_cost: float
    annual_maintenance: float
    risk_reduction_value: float
    net_benefit: float
    rosi_percent: float
    payback_months: float


class PlanCreateRequest(BaseModel):
    name: str
    budget_inr: float
    items: list[dict]


class PlanResponse(BaseModel):
    id: str
    name: str
    total_budget_inr: float
    expected_risk_reduction: float
    expected_eal_reduction_inr: float
    rosi: float
    status: str
    items: list[dict]
    created_at: str

    class Config:
        from_attributes = True
