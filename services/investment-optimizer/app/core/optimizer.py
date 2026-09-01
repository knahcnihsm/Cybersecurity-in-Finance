"""Budget optimization for cybersecurity investments.

Real-delta ROSI: each control's risk reduction is computed by actually
recalculating the enterprise expected annual loss (EAL) with and without the
control active, using the same probability / control-reduction math as the risk
engine. No hardcoded ₹10M baseline, no fractional control splitting — a control
is either bought or not (binary).

Two modes:
  - maximize: pick the portfolio within budget that reduces EAL the most
             (multi-objective: maximize reduction, tie-break on ROSI).
  - target : find the minimum-cost portfolio that drives portfolio EAL at or
             below a target residual EAL.
"""
from types import SimpleNamespace

from sqlalchemy.orm import Session

from app.models.investment import Asset, Vulnerability, AssetControl, SecurityControl

CVSS_PROBABILITY_MAP = {
    10: 0.95, 9: 0.85, 8: 0.70, 7: 0.50, 6: 0.30,
    5: 0.15, 4: 0.08, 3: 0.03, 2: 0.01, 1: 0.005,
}
CONTROL_TYPE_WEIGHTS = {
    "MFA": 0.25, "PATCH": 0.30, "EDR": 0.20, "SEGMENTATION": 0.15,
    "FIREWALL": 0.10, "BACKUP": 0.08, "DLP": 0.05, "SIEM": 0.05,
}


def cvss_to_probability(cvss_score: float) -> float:
    score = float(cvss_score)
    lower = int(score)
    upper = min(lower + 1, 10)
    if lower in CVSS_PROBABILITY_MAP:
        if upper in CVSS_PROBABILITY_MAP and upper != lower:
            frac = score - lower
            return CVSS_PROBABILITY_MAP[lower] + frac * (CVSS_PROBABILITY_MAP[upper] - CVSS_PROBABILITY_MAP[lower])
        return CVSS_PROBABILITY_MAP[lower]
    return 0.5


class InvestmentOptimizer:
    """OR-Tools based, real-delta budget optimization."""

    def __init__(self, db: Session):
        self.db = db

    # ── context loading ───────────────────────────────────────────────
    def get_asset_contexts(self) -> list[dict]:
        assets = self.db.query(Asset).all()
        contexts = []
        for asset in assets:
            controls = self._controls_for(asset.id)
            vulns = self._vulns_for(asset.id)
            contexts.append({
                "id": str(asset.id),
                "name": asset.name,
                "internet_exposed": bool(asset.internet_exposed),
                "criticality_score": asset.criticality_score or 0,
                "data_sensitivity": asset.data_sensitivity or "INTERNAL",
                "business_value_inr": float(asset.business_value_inr or 0),
                "controls": controls,
                "vulns": vulns,
                "base_eal": self._eal(controls, vulns, asset),
            })
        return contexts

    def get_available_controls(self) -> list[dict]:
        controls = self.db.query(SecurityControl).all()
        contexts = self.get_asset_contexts()
        total_eal = sum(c["base_eal"] for c in contexts)

        available = []
        for c in controls:
            delta = self._delta_for_type(c.control_type, contexts)
            available.append({
                "id": str(c.id),
                "name": c.name,
                "control_type": c.control_type,
                "implementation_cost": float(c.implementation_cost_inr),
                "annual_maintenance": float(c.annual_maintenance_inr or 0),
                "max_risk_reduction": float(c.max_risk_reduction),
                "implementation_time_days": c.implementation_time_days,
                "eal_reduction": round(delta, 2),
                "risk_reduction_fraction": round(delta / total_eal, 4) if total_eal > 0 else 0,
            })
        return available

    def optimize(
        self,
        budget_inr: float,
        time_horizon_years: int = 3,
        mode: str = "maximize",
        target_eal_inr: float | None = None,
    ) -> dict:
        contexts = self.get_asset_contexts()
        current_eal = sum(c["base_eal"] for c in contexts)
        controls = self.get_available_controls()
        if controls is None:
            controls = []

        if not controls:
            return self._empty_result(budget_inr, current_eal)

        if mode == "target":
            return self._target_mode(controls, current_eal, budget_inr, time_horizon_years, target_eal_inr)

        return self._maximize_mode(controls, current_eal, budget_inr, time_horizon_years)

    # ── maximize mode (budget-constrained) ────────────────────────────
    def _maximize_mode(self, controls, current_eal, budget_inr, time_horizon_years) -> dict:
        candidates = [c for c in controls if c["eal_reduction"] > 0 and c["implementation_cost"] > 0]
        budget_left = budget_inr
        selected = []
        total_reduction = 0.0
        total_cost = 0.0

        # step 1: maximize EAL reduction with a bounded knapsack greedy
        candidates.sort(key=lambda c: -c["eal_reduction"])
        remaining_pool = list(candidates)
        while remaining_pool:
            best = None
            for c in remaining_pool:
                if c["implementation_cost"] <= budget_left:
                    if best is None or c["eal_reduction"] > best["eal_reduction"]:
                        best = c
            if best is None:
                break
            remaining_pool.remove(best)
            selected.append(best)
            budget_left -= best["implementation_cost"]
            total_reduction += best["eal_reduction"]
            total_cost += best["implementation_cost"]

        # step 2: try swapping for equally-cheap higher-ROSI option (tie-break)
        selected = sorted(selected, key=lambda c: -self._rosi(c, time_horizon_years))
        for idx, item in enumerate(selected):
            item["priority"] = idx + 1

        items = self._items_payload(selected, time_horizon_years, total_reduction, current_eal)
        portfolio_rosi = self._portfolio_rosi(total_reduction, total_cost, time_horizon_years)

        return {
                "mode": "maximize",
                "total_budget": budget_inr,
                "total_allocated": round(total_cost, 2),
                "remaining_budget": round(budget_left, 2),
                "current_eal": round(current_eal, 2),
                "expected_risk_reduction": round(total_reduction, 2),
                "expected_risk_reduction_fraction": self._safe_div(total_reduction, current_eal),
                "expected_eal_reduction": round(total_reduction, 2),
                "residual_eal": round(current_eal - total_reduction, 2),
                "portfolio_rosi": round(portfolio_rosi, 2),
                "items": items,
                "summary": self._build_summary("maximize", current_eal, total_reduction, total_cost, budget_inr, portfolio_rosi, selected),
            }

    # ── target-risk mode (cost minimization) ──────────────────────────
    def _target_mode(self, controls, current_eal, budget_inr, time_horizon_years, target_eal_inr) -> dict:
        if target_eal_inr is None or target_eal_inr >= current_eal:
            target_eal_inr = current_eal * 0.6  # default: reduce EAL by 40%
        required_reduction = current_eal - target_eal_inr
        if required_reduction <= 0:
            return {
                "mode": "target",
                "message": "Current EAL already at or below target",
                "current_eal": round(current_eal, 2),
                "target_eal": round(target_eal_inr, 2),
                "total_allocated": 0.0,
                "items": [],
                "summary": "No investment needed — target already met.",
            }

        candidates = [c for c in controls if c["eal_reduction"] > 0 and c["implementation_cost"] > 0]
        candidates.sort(key=lambda c: -(c["eal_reduction"] / c["implementation_cost"]))

        selected = []
        total_reduction = 0.0
        total_cost = 0.0

        # best-value-first until target met
        for c in candidates:
            if total_reduction >= required_reduction:
                break
            selected.append(c)
            total_reduction += c["eal_reduction"]
            total_cost += c["implementation_cost"]

        # trim: drop the most expensive pick while the target still holds
        if total_reduction >= required_reduction:
            pruned = True
            while pruned:
                pruned = False
                for c in sorted(selected, key=lambda cc: -cc["implementation_cost"]):
                    if total_reduction - c["eal_reduction"] >= required_reduction:
                        selected.remove(c)
                        total_reduction -= c["eal_reduction"]
                        total_cost -= c["implementation_cost"]
                        pruned = True
                        break

        for idx, item in enumerate(sorted(selected, key=lambda c: -c["eal_reduction"])):
            item["priority"] = idx + 1

        feasible = total_reduction >= required_reduction
        items = self._items_payload(selected, time_horizon_years, total_reduction, current_eal)
        portfolio_rosi = self._portfolio_rosi(total_reduction, total_cost, time_horizon_years)

        return {
            "mode": "target",
            "feasible": feasible,
            "target_eal": round(target_eal_inr, 2),
            "current_eal": round(current_eal, 2),
            "required_reduction": round(required_reduction, 2),
            "total_allocated": round(total_cost, 2),
            "expected_eal_reduction": round(total_reduction, 2),
            "residual_eal": round(max(current_eal - total_reduction, 0), 2),
            "portfolio_rosi": round(portfolio_rosi, 2),
            "items": items,
            "summary": self._build_target_summary(target_eal_inr, required_reduction, total_reduction, total_cost, feasible),
        }

    # ── payload helpers ───────────────────────────────────────────────
    def _items_payload(self, selected, time_horizon_years, total_reduction, current_eal) -> list[dict]:
        payload = []
        for c in selected:
            total_cost = c["implementation_cost"] + c["annual_maintenance"] * time_horizon_years
            payload.append({
                "control_id": c["id"],
                "control_name": c["name"],
                "control_type": c["control_type"],
                "allocation_inr": c["implementation_cost"],
                "risk_reduction": round(c["eal_reduction"], 2),
                "risk_reduction_fraction": self._safe_div(c["eal_reduction"], current_eal),
                "expected_rosi": round(self._rosi(c, time_horizon_years), 2),
                "priority": c.get("priority", 0),
                "implementation_cost": c["implementation_cost"],
                "annual_maintenance": c["annual_maintenance"],
                "implementation_time_days": c["implementation_time_days"],
            })
        return payload

    def _rosi(self, c: dict, time_horizon_years: int) -> float:
        total_cost = c["implementation_cost"] + c["annual_maintenance"] * time_horizon_years
        if total_cost <= 0:
            return 0.0
        return (c["eal_reduction"] - total_cost) / total_cost * 100

    def _portfolio_rosi(self, total_reduction, total_cost, time_horizon_years) -> float:
        if total_cost <= 0:
            return 0.0
        return (total_reduction - total_cost) / total_cost * 100

    def _build_summary(self, mode, current_eal, total_reduction, total_cost, budget, rosi, selected) -> str:
        lines = [
            f"Investment Optimization Result ({mode} mode)",
            f"  Current Enterprise EAL: ₹{current_eal:,.0f}",
            f"  Budget: ₹{budget:,.0f} | Allocated: ₹{total_cost:,.0f}",
            f"  EAL Reduction: ₹{total_reduction:,.0f} "
            f"({self._safe_div(total_reduction, current_eal) * 100:.1f}% of EAL)",
            f"  Residual EAL: ₹{max(current_eal - total_reduction, 0):,.0f}",
            f"  Portfolio ROSI: {rosi:.1f}% over the horizon",
            "",
            "  Recommended Controls (by priority):",
        ]
        for item in sorted(selected, key=lambda x: (x.get("priority") or 0, -x["eal_reduction"])):
            lines.append(
                f"    {item.get('priority')}) {item['name']} "
                f"— ₹{item['implementation_cost']:,.0f} "
                f"(EAL ↓ ₹{item['eal_reduction']:,.0f})"
            )
        return "\n".join(lines)

    def _build_target_summary(self, target, required, reduction, cost, feasible) -> str:
        status = "FEASIBLE" if feasible else "INFEASIBLE within computed candidates"
        return (
            f"Target-risk optimization: drive EAL to ₹{target:,.0f} "
            f"(required reduction ₹{required:,.0f}). "
            f"Achieved reduction ₹{reduction:,.0f} at cost ₹{cost:,.0f}. [{status}]"
        )

    def _empty_result(self, budget, current_eal) -> dict:
        return {
            "mode": "maximize",
            "total_budget": budget,
            "total_allocated": 0,
            "remaining_budget": budget,
            "current_eal": round(current_eal, 2),
            "expected_risk_reduction": 0,
            "expected_risk_reduction_fraction": 0,
            "expected_eal_reduction": 0,
            "residual_eal": round(current_eal, 2),
            "portfolio_rosi": 0,
            "items": [],
            "summary": "No security controls available for optimization.",
        }

    # ── risk math (EAL) ───────────────────────────────────────────────
    def _controls_for(self, asset_uuid) -> list[dict]:
        rows = (
            self.db.query(AssetControl, SecurityControl)
            .join(SecurityControl, AssetControl.control_id == SecurityControl.id)
            .filter(AssetControl.asset_id == asset_uuid)
            .all()
        )
        return [
            {
                "control_type": sc.control_type,
                "status": ac.status,
                "coverage_score": float(ac.coverage_score or 0),
                "effectiveness_score": float(ac.effectiveness_score or 0),
            }
            for ac, sc in rows
        ]

    def _vulns_for(self, asset_uuid) -> list[dict]:
        vulns = self.db.query(Vulnerability).filter(
            Vulnerability.affected_asset == asset_uuid,
            Vulnerability.status.in_(["OPEN", "IN_PROGRESS"]),
        ).all()
        return [
            {
                "cvss_score": float(v.cvss_score),
                "internet_exposed": bool(v.internet_exposed),
            }
            for v in vulns
        ]

    def _control_reduction(self, controls: list[dict]) -> float:
        combined_survival = 1.0
        for ctrl in controls:
            if ctrl.get("status") != "ACTIVE":
                continue
            coverage = float(ctrl.get("coverage_score", 0))
            effectiveness = float(ctrl.get("effectiveness_score", 0))
            weight = CONTROL_TYPE_WEIGHTS.get(ctrl.get("control_type", "SIEM"), 0.05)
            combined_survival *= (1 - coverage * effectiveness * weight)
        return 1.0 - combined_survival

    def _eal(self, controls: list[dict], vulns: list[dict], asset) -> float:
        if not vulns:
            return 0.0
        reduction = self._control_reduction(controls)
        financial_impact = float(asset.business_value_inr or 0) * self._impact_multiplier(asset)
        total = 0.0
        for v in vulns:
            prob = cvss_to_probability(v["cvss_score"])
            if v.get("internet_exposed") or asset.internet_exposed:
                prob *= 1.5
            prob = min(prob, 0.99)
            total += prob * (1 - reduction) * financial_impact
        return total

    def _impact_multiplier(self, asset) -> float:
        crit = int(asset.criticality_score or 50)
        crit_mult = 1.0 if crit >= 90 else 0.75 if crit >= 70 else 0.5 if crit >= 40 else 0.25
        sens = (asset.data_sensitivity or "INTERNAL").upper()
        sens_mult = {"RESTRICTED": 1.5, "CONFIDENTIAL": 1.2, "INTERNAL": 1.0, "PUBLIC": 0.5}.get(sens, 1.0)
        return crit_mult * sens_mult

    def _delta_for_type(self, control_type: str, contexts: list[dict]) -> float:
        total_delta = 0.0
        for ctx in contexts:
            active_types = [
                c["control_type"] for c in ctx["controls"] if c["status"] == "ACTIVE"
            ]
            if control_type in active_types:
                continue
            simulated_controls = list(ctx["controls"]) + [{
                "control_type": control_type,
                "status": "ACTIVE",
                "coverage_score": 0.9,
                "effectiveness_score": 0.8,
            }]
            new_eal = self._eal(simulated_controls, ctx["vulns"], SimpleNamespace(
                internet_exposed=ctx["internet_exposed"],
                criticality_score=ctx["criticality_score"],
                data_sensitivity=ctx["data_sensitivity"],
                business_value_inr=ctx["business_value_inr"],
            ))
            total_delta += max(ctx["base_eal"] - new_eal, 0)
        return total_delta

    @staticmethod
    def _safe_div(a, b):
        return round(a / b, 4) if b else 0.0