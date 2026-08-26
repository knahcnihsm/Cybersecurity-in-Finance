from sqlalchemy.orm import Session
from ortools.sat.python import cp_model

from app.models.investment import SecurityControl


class InvestmentOptimizer:
    """OR-Tools based budget optimization for cybersecurity investments."""

    def __init__(self, db: Session):
        self.db = db

    def get_available_controls(self) -> list[dict]:
        controls = self.db.query(SecurityControl).all()
        return [
            {
                "id": str(c.id),
                "name": c.name,
                "control_type": c.control_type,
                "implementation_cost": float(c.implementation_cost_inr),
                "annual_maintenance": float(c.annual_maintenance_inr or 0),
                "max_risk_reduction": float(c.max_risk_reduction),
                "implementation_time_days": c.implementation_time_days,
            }
            for c in controls
        ]

    def optimize(
        self,
        budget_inr: float,
        time_horizon_years: int = 3,
        max_per_control_percent: float = 0.40,
    ) -> dict:
        controls = self.get_available_controls()
        if not controls:
            return self._empty_result(budget_inr)

        model = cp_model.CpModel()

        n = len(controls)
        budget_lakhs = int(budget_inr / 100000)
        max_per_control = int(budget_inr * max_per_control_percent / 100000)

        x = []
        for i in range(n):
            cost_lakhs = max(1, int(controls[i]["implementation_cost"] / 100000))
            x.append(model.NewIntVar(0, min(cost_lakhs, max_per_control), f"x_{i}"))

        total_cost = [x[i] * 100000 for i in range(n)]
        model.Add(sum(total_cost) <= int(budget_inr))

        for i in range(n):
            cost_lakhs = max(1, int(controls[i]["implementation_cost"] / 100000))
            model.Add(x[i] <= cost_lakhs)

        risk_reduction_lakhs = []
        for i in range(n):
            rr = int(controls[i]["max_risk_reduction"] * 10000)
            risk_reduction_lakhs.append(x[i] * rr)

        model.Maximize(sum(risk_reduction_lakhs))

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10
        status = solver.Solve(model)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return self._heuristic_result(controls, budget_inr, time_horizon_years)

        items = []
        total_allocated = 0
        total_risk_reduction = 0

        for i in range(n):
            allocated = solver.Value(x[i]) * 100000
            if allocated > 0:
                control = controls[i]
                reduction_ratio = allocated / control["implementation_cost"] if control["implementation_cost"] > 0 else 0
                risk_reduction = control["max_risk_reduction"] * reduction_ratio

                total_cost_over_horizon = (
                    control["implementation_cost"]
                    + control["annual_maintenance"] * time_horizon_years
                )
                risk_reduction_value = risk_reduction * 10000000
                net_benefit = risk_reduction_value - total_cost_over_horizon
                rosi = (net_benefit / total_cost_over_horizon * 100) if total_cost_over_horizon > 0 else 0

                items.append({
                    "control_id": control["id"],
                    "control_name": control["name"],
                    "control_type": control["control_type"],
                    "allocation_inr": allocated,
                    "risk_reduction": round(risk_reduction, 4),
                    "expected_rosi": round(rosi, 2),
                    "priority": i + 1,
                    "implementation_cost": control["implementation_cost"],
                    "annual_maintenance": control["annual_maintenance"],
                })
                total_allocated += allocated
                total_risk_reduction += risk_reduction

        items.sort(key=lambda x: x["expected_rosi"], reverse=True)
        for idx, item in enumerate(items):
            item["priority"] = idx + 1

        portfolio_rosi = self._calculate_portfolio_rosi(items, budget_inr, time_horizon_years)

        return {
            "total_budget": budget_inr,
            "total_allocated": total_allocated,
            "remaining_budget": budget_inr - total_allocated,
            "expected_risk_reduction": round(total_risk_reduction, 4),
            "expected_eal_reduction": round(total_risk_reduction * 10000000, 2),
            "portfolio_rosi": round(portfolio_rosi, 2),
            "items": items,
            "summary": self._build_summary(items, budget_inr, total_allocated, total_risk_reduction, portfolio_rosi),
        }

    def _heuristic_result(self, controls, budget_inr, time_horizon_years):
        """Fallback: greedy selection by ROSI when OR-Tools fails."""
        scored = []
        for c in controls:
            total_cost = c["implementation_cost"] + c["annual_maintenance"] * time_horizon_years
            risk_value = c["max_risk_reduction"] * 10000000
            rosi = ((risk_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
            scored.append((c, rosi))

        scored.sort(key=lambda x: x[1], reverse=True)

        items = []
        remaining = budget_inr
        total_rr = 0

        for control, rosi in scored:
            if control["implementation_cost"] <= remaining:
                items.append({
                    "control_id": control["id"],
                    "control_name": control["name"],
                    "control_type": control["control_type"],
                    "allocation_inr": control["implementation_cost"],
                    "risk_reduction": control["max_risk_reduction"],
                    "expected_rosi": round(rosi, 2),
                    "priority": len(items) + 1,
                    "implementation_cost": control["implementation_cost"],
                    "annual_maintenance": control["annual_maintenance"],
                })
                remaining -= control["implementation_cost"]
                total_rr += control["max_risk_reduction"]

        portfolio_rosi = self._calculate_portfolio_rosi(items, budget_inr, time_horizon_years)

        return {
            "total_budget": budget_inr,
            "total_allocated": budget_inr - remaining,
            "remaining_budget": remaining,
            "expected_risk_reduction": round(total_rr, 4),
            "expected_eal_reduction": round(total_rr * 10000000, 2),
            "portfolio_rosi": round(portfolio_rosi, 2),
            "items": items,
            "summary": self._build_summary(items, budget_inr, budget_inr - remaining, total_rr, portfolio_rosi),
        }

    def _calculate_portfolio_rosi(self, items, total_budget, time_horizon_years):
        if not items:
            return 0.0
        total_risk_value = sum(i["risk_reduction"] * 10000000 for i in items)
        total_cost = sum(
            i["implementation_cost"] + i["annual_maintenance"] * time_horizon_years
            for i in items
        )
        net = total_risk_value - total_cost
        return (net / total_cost * 100) if total_cost > 0 else 0

    def _build_summary(self, items, budget, allocated, rr, rosi):
        lines = [
            f"Investment Optimization Result:",
            f"  Budget: ₹{budget:,.0f} | Allocated: ₹{allocated:,.0f}",
            f"  Controls Selected: {len(items)}",
            f"  Expected Risk Reduction: {rr*100:.1f}%",
            f"  Portfolio ROSI: {rosi:.1f}% over 3 years",
            "",
            "  Recommended Allocation:",
        ]
        for item in items:
            lines.append(
                f"    {item['priority']}. {item['control_name']} "
                f"— ₹{item['allocation_inr']:,.0f} "
                f"(ROSI: {item['expected_rosi']:.0f}%)"
            )
        return "\n".join(lines)

    def _empty_result(self, budget):
        return {
            "total_budget": budget,
            "total_allocated": 0,
            "remaining_budget": budget,
            "expected_risk_reduction": 0,
            "expected_eal_reduction": 0,
            "portfolio_rosi": 0,
            "items": [],
            "summary": "No security controls available for optimization.",
        }
