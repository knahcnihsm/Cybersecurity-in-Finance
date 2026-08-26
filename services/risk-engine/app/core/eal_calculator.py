from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.asset import Asset, Vulnerability, RiskCalculation, RiskSnapshot
from app.core.risk_calculator import RiskCalculator


class EALCalculator:
    """Expected Annual Loss calculation and breakdown."""

    def __init__(self, db: Session):
        self.db = db
        self.risk_calc = RiskCalculator(db)

    def calculate_eal(self) -> dict:
        assets = self.db.query(Asset).all()
        if not assets:
            return self._empty_eal()

        asset_eals = []
        total_eal = 0.0
        breakdown_by_type = {}
        breakdown_by_department = {}
        breakdown_by_sensitivity = {}

        for asset in assets:
            asset_id = str(asset.id)
            risk = self.risk_calc.calculate_asset_risk(asset_id)
            if not risk:
                continue

            eal = risk["expected_annual_loss"]
            total_eal += eal

            entry = {
                "asset_id": asset_id,
                "asset_name": asset.name,
                "asset_type": asset.asset_type,
                "department": asset.department or "Unassigned",
                "data_sensitivity": asset.data_sensitivity,
                "eal": round(eal, 2),
                "risk_score": risk["risk_score"],
                "probability": risk["probability"],
                "financial_impact": risk["financial_impact_inr"],
            }
            asset_eals.append(entry)

            atype = asset.asset_type
            breakdown_by_type[atype] = breakdown_by_type.get(atype, 0) + eal

            dept = asset.department or "Unassigned"
            breakdown_by_department[dept] = breakdown_by_department.get(dept, 0) + eal

            sens = asset.data_sensitivity
            breakdown_by_sensitivity[sens] = breakdown_by_sensitivity.get(sens, 0) + eal

        asset_eals.sort(key=lambda x: x["eal"], reverse=True)

        return {
            "total_eal": round(total_eal, 2),
            "asset_eals": asset_eals,
            "breakdown_by_type": {k: round(v, 2) for k, v in breakdown_by_type.items()},
            "breakdown_by_department": {k: round(v, 2) for k, v in breakdown_by_department.items()},
            "breakdown_by_sensitivity": {k: round(v, 2) for k, v in breakdown_by_sensitivity.items()},
        }

    def get_risk_trends(self, days: int = 30) -> dict:
        from datetime import datetime, timedelta

        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)

        snapshots = (
            self.db.query(RiskSnapshot)
            .filter(RiskSnapshot.snapshot_date >= start_date)
            .order_by(RiskSnapshot.snapshot_date)
            .all()
        )

        if not snapshots:
            return {"dates": [], "eal_values": [], "risk_scores": [], "vuln_counts": []}

        dates = []
        eal_values = []
        risk_scores = []
        vuln_counts = []

        seen_dates = {}
        for snap in snapshots:
            date_str = snap.snapshot_date.strftime("%Y-%m-%d") if snap.snapshot_date else ""
            if date_str in seen_dates:
                continue
            seen_dates[date_str] = True
            dates.append(date_str)
            eal_values.append(float(snap.expected_annual_loss) if snap.expected_annual_loss else 0)
            risk_scores.append(float(snap.risk_score) if snap.risk_score else 0)
            vuln_counts.append(snap.total_vulns_open or 0)

        return {
            "dates": dates,
            "eal_values": eal_values,
            "risk_scores": risk_scores,
            "vuln_counts": vuln_counts,
        }

    def _empty_eal(self) -> dict:
        return {
            "total_eal": 0,
            "asset_eals": [],
            "breakdown_by_type": {},
            "breakdown_by_department": {},
            "breakdown_by_sensitivity": {},
        }
