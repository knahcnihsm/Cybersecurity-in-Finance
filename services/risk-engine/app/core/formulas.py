from decimal import Decimal

from app.models.asset import Asset, Vulnerability, SecurityControl, AssetControl

# ─── CVSS to Probability Mapping ──────────────────────
CVSS_PROBABILITY_MAP = {
    10: 0.95,
    9: 0.85,
    8: 0.70,
    7: 0.50,
    6: 0.30,
    5: 0.15,
    4: 0.08,
    3: 0.03,
    2: 0.01,
    1: 0.005,
}

# ─── Control Type Weights ─────────────────────────────
CONTROL_TYPE_WEIGHTS = {
    "MFA": 0.25,
    "PATCH": 0.30,
    "EDR": 0.20,
    "SEGMENTATION": 0.15,
    "FIREWALL": 0.10,
    "BACKUP": 0.08,
    "DLP": 0.05,
    "SIEM": 0.05,
}

# ─── Criticality Multipliers ──────────────────────────
CRITICALITY_MULTIPLIERS = {
    "CRITICAL": 1.0,
    "HIGH": 0.75,
    "MEDIUM": 0.50,
    "LOW": 0.25,
}

# ─── Data Sensitivity Multipliers ─────────────────────
SENSITIVITY_MULTIPLIERS = {
    "RESTRICTED": 1.5,
    "CONFIDENTIAL": 1.2,
    "INTERNAL": 1.0,
    "PUBLIC": 0.5,
}


def cvss_to_probability(cvss_score: float) -> float:
    """Convert CVSS score to probability of exploitation."""
    score = float(cvss_score)
    lower = int(score)
    upper = min(lower + 1, 10)

    if lower in CVSS_PROBABILITY_MAP:
        if upper in CVSS_PROBABILITY_MAP and upper != lower:
            frac = score - lower
            return CVSS_PROBABILITY_MAP[lower] + frac * (CVSS_PROBABILITY_MAP[upper] - CVSS_PROBABILITY_MAP[lower])
        return CVSS_PROBABILITY_MAP[lower]
    return 0.5


def get_criticality_category(score: int) -> str:
    """Map numeric criticality score to category."""
    if score >= 90:
        return "CRITICAL"
    elif score >= 70:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    return "LOW"


def get_criticality_multiplier(criticality_score: int) -> float:
    """Get financial impact multiplier based on asset criticality."""
    category = get_criticality_category(criticality_score)
    return CRITICALITY_MULTIPLIERS.get(category, 0.5)


def get_sensitivity_multiplier(data_sensitivity: str) -> float:
    """Get financial impact multiplier based on data sensitivity."""
    return SENSITIVITY_MULTIPLIERS.get(data_sensitivity.upper(), 1.0)


def calculate_control_reduction(controls: list[dict]) -> float:
    """
    Calculate cumulative risk reduction from active controls.
    Uses independence model: total reduction = 1 - product(1 - effective_reduction_i)
    """
    if not controls:
        return 0.0

    combined_survival = 1.0

    for ctrl in controls:
        if ctrl.get("status") != "ACTIVE":
            continue

        coverage = float(ctrl.get("coverage_score", 0))
        effectiveness = float(ctrl.get("effectiveness_score", 0))
        control_type = ctrl.get("control_type", "SIEM")
        type_weight = CONTROL_TYPE_WEIGHTS.get(control_type, 0.05)

        effective_reduction = coverage * effectiveness * type_weight
        combined_survival *= (1 - effective_reduction)

    return 1.0 - combined_survival


def calculate_probability(vulnerability: dict, asset: dict, control_reduction: float) -> float:
    """Calculate adjusted probability of a vulnerability being exploited."""
    base_prob = cvss_to_probability(float(vulnerability.get("cvss_score", 5.0)))

    if vulnerability.get("internet_exposed") or asset.get("internet_exposed"):
        base_prob *= 1.5

    base_prob = min(base_prob, 0.99)

    adjusted = base_prob * (1 - control_reduction)
    return round(min(adjusted, 0.99), 4)


def calculate_financial_impact(asset: dict) -> float:
    """Calculate financial impact for an asset based on business value, criticality, and sensitivity."""
    business_value = float(asset.get("business_value_inr", 0))
    criticality_score = int(asset.get("criticality_score", 50))
    data_sensitivity = asset.get("data_sensitivity", "INTERNAL")

    crit_mult = get_criticality_multiplier(criticality_score)
    sens_mult = get_sensitivity_multiplier(data_sensitivity)

    return business_value * crit_mult * sens_mult


def calculate_risk_score(probability: float, financial_impact: float, asset: dict, total_max_impact: float) -> float:
    """Calculate 0-100 risk score combining probability, impact, and exposure."""
    normalized_impact = (financial_impact / total_max_impact * 100) if total_max_impact > 0 else 0

    exposure_score = 0.0
    if asset.get("internet_exposed"):
        exposure_score += 50
    sensitivity = asset.get("data_sensitivity", "INTERNAL")
    if sensitivity in ("RESTRICTED", "CONFIDENTIAL"):
        exposure_score += 30
    if int(asset.get("criticality_score", 50)) >= 80:
        exposure_score += 20
    exposure_score = min(exposure_score, 100)

    risk = (probability * 40) + (normalized_impact * 0.35) + (exposure_score * 0.25)
    return round(min(risk, 100.0), 2)


def get_risk_category(risk_score: float) -> str:
    """Map risk score to category."""
    if risk_score >= 75:
        return "CRITICAL"
    elif risk_score >= 50:
        return "HIGH"
    elif risk_score >= 25:
        return "MEDIUM"
    return "LOW"
