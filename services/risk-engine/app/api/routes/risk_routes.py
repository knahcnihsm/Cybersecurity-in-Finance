from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.risk_calculator import RiskCalculator
from app.core.eal_calculator import EALCalculator
from app.core.scenario_engine import ScenarioSimulator
from app.schemas.risk_schemas import (
    RiskCalculationResponse,
    EnterpriseRiskResponse,
    EALResponse,
    ScenarioRequest,
    ScenarioResponse,
    RiskEventRequest,
    RiskTrendResponse,
)

router = APIRouter(prefix="/api/risk", tags=["Risk"])


@router.post("/calculate", response_model=RiskCalculationResponse)
def calculate_asset_risk(
    asset_id: str,
    persist: bool = Query(default=True, description="Persist calculation to DB"),
    db: Session = Depends(get_db),
):
    calc = RiskCalculator(db)
    risk_data = calc.calculate_asset_risk(asset_id)
    if not risk_data:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    if persist:
        calc.persist_risk(asset_id, risk_data)

    return RiskCalculationResponse(
        id="00000000-0000-0000-0000-000000000000",
        asset_id=asset_id,
        asset_name=risk_data.get("asset_name"),
        risk_score=risk_data["risk_score"],
        probability=risk_data["probability"],
        financial_impact_inr=risk_data["financial_impact_inr"],
        expected_annual_loss=risk_data["expected_annual_loss"],
        risk_category=risk_data["risk_category"],
        risk_factors=risk_data["risk_factors"],
        control_reduction=risk_data["control_reduction"],
        residual_risk=risk_data["residual_risk"],
        calculated_at="",
        version=1,
    )


@router.post("/calculate-all")
def calculate_all_risks(db: Session = Depends(get_db)):
    calc = RiskCalculator(db)
    results = calc.calculate_all_risks()
    return {
        "total_assets_calculated": len(results),
        "total_eal": round(sum(r["expected_annual_loss"] for r in results), 2),
        "results": results,
    }


@router.get("/score", response_model=EnterpriseRiskResponse)
def get_enterprise_risk_score(db: Session = Depends(get_db)):
    calc = RiskCalculator(db)
    return calc.get_enterprise_risk()


@router.get("/eal", response_model=EALResponse)
def get_expected_annual_loss(db: Session = Depends(get_db)):
    eal_calc = EALCalculator(db)
    return eal_calc.calculate_eal()


@router.get("/drivers")
def get_risk_drivers(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    calc = RiskCalculator(db)
    enterprise = calc.get_enterprise_risk()
    return enterprise["top_risk_drivers"][:limit]


@router.get("/trends", response_model=RiskTrendResponse)
def get_risk_trends(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    eal_calc = EALCalculator(db)
    return eal_calc.get_risk_trends(days)


@router.post("/scenario/simulate", response_model=ScenarioResponse)
def simulate_scenario(
    request: ScenarioRequest,
    db: Session = Depends(get_db),
):
    simulator = ScenarioSimulator(db)
    return simulator.simulate(request.changes)


@router.post("/event")
def receive_risk_event(
    event: RiskEventRequest,
    db: Session = Depends(get_db),
):
    if event.asset_id:
        calc = RiskCalculator(db)
        risk_data = calc.calculate_asset_risk(event.asset_id)
        if risk_data:
            calc.persist_risk(event.asset_id, risk_data)
            return {
                "status": "processed",
                "asset_id": event.asset_id,
                "new_risk_score": risk_data["risk_score"],
                "new_eal": risk_data["expected_annual_loss"],
            }

    return {"status": "received", "event_type": event.event_type}


@router.get("/asset/{asset_id}", response_model=RiskCalculationResponse)
def get_asset_risk(
    asset_id: str,
    db: Session = Depends(get_db),
):
    calc = RiskCalculator(db)
    risk_data = calc.calculate_asset_risk(asset_id)
    if not risk_data:
        raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")

    return RiskCalculationResponse(
        id="00000000-0000-0000-0000-000000000000",
        asset_id=asset_id,
        asset_name=risk_data.get("asset_name"),
        risk_score=risk_data["risk_score"],
        probability=risk_data["probability"],
        financial_impact_inr=risk_data["financial_impact_inr"],
        expected_annual_loss=risk_data["expected_annual_loss"],
        risk_category=risk_data["risk_category"],
        risk_factors=risk_data["risk_factors"],
        control_reduction=risk_data["control_reduction"],
        residual_risk=risk_data["residual_risk"],
        calculated_at="",
        version=1,
    )
