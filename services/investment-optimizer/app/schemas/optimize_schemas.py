from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


def _to_camel(s: str) -> str:
    parts = s.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


class OptimizeRequest(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    budget_inr: float = Field(..., gt=0, description="Total available budget in INR")
    time_horizon_years: int = Field(default=3, ge=1, le=10)
    max_per_control_percent: float = Field(default=0.40, gt=0, le=1.0)
    mode: str = Field(default="maximize", pattern="^(maximize|target)$")
    target_eal_inr: Optional[float] = Field(default=None, ge=0)


class InvestmentItemResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True, from_attributes=True)

    control_id: str
    control_name: str
    control_type: str
    allocation_inr: float
    risk_reduction: float
    expected_rosi: float
    priority: int
    implementation_cost: float
    annual_maintenance: float


class OptimizeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    total_budget: float
    total_allocated: float
    remaining_budget: float
    expected_risk_reduction: float
    expected_eal_reduction: float
    portfolio_rosi: float
    items: list[InvestmentItemResponse]
    summary: str


class ROSIResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

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
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    name: str
    budget_inr: float
    items: list[dict]


class PlanResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True, from_attributes=True)

    id: str
    name: str
    total_budget_inr: float
    expected_risk_reduction: float
    expected_eal_reduction_inr: float
    rosi: float
    status: str
    items: list[dict]
    created_at: str
