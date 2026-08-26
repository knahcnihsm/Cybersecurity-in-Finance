from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class RiskCalculationResponse(BaseModel):
    id: UUID
    asset_id: UUID
    asset_name: Optional[str] = None
    risk_score: float
    probability: float
    financial_impact_inr: float
    expected_annual_loss: float
    risk_category: str
    risk_factors: Optional[dict] = None
    control_reduction: float = 0.0
    residual_risk: float = 0.0
    calculated_at: datetime
    version: int = 1

    class Config:
        from_attributes = True


class EnterpriseRiskResponse(BaseModel):
    total_eal: float
    total_assets: int
    total_vulnerabilities: int
    critical_risks: int
    high_risks: int
    medium_risks: int
    low_risks: int
    average_risk_score: float
    enterprise_risk_score: float
    top_risk_drivers: list[dict]


class EALResponse(BaseModel):
    total_eal: float
    asset_eals: list[dict]
    breakdown_by_type: dict
    breakdown_by_department: dict
    breakdown_by_sensitivity: dict


class ScenarioRequest(BaseModel):
    changes: list[dict] = Field(
        ...,
        description="List of changes to simulate. Each: {type, asset_id?, control_type?, value}",
        examples=[[
            {"type": "add_control", "control_type": "MFA", "asset_id": "PAY-SRV-001", "value": 0.85},
            {"type": "remediate_vuln", "vuln_id": "CVE-2026-1001"},
            {"type": "increase_budget", "amount_inr": 5000000}
        ]]
    )


class ScenarioResponse(BaseModel):
    current_eal: float
    simulated_eal: float
    eal_reduction: float
    eal_reduction_percent: float
    current_risk_score: float
    simulated_risk_score: float
    risk_score_change: float
    asset_changes: list[dict]
    summary: str


class RiskEventRequest(BaseModel):
    event_type: str
    asset_id: Optional[str] = None
    source: str = "UNKNOWN"
    details: dict = {}


class RiskTrendResponse(BaseModel):
    dates: list[str]
    eal_values: list[float]
    risk_scores: list[float]
    vuln_counts: list[int]


class RiskDriver(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: str
    department: str
    risk_score: float
    expected_annual_loss: float
    open_vulns: int
    critical_vulns: int
    control_coverage: float
    internet_exposed: bool
