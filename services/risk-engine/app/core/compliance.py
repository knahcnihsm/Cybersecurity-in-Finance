"""Compliance requirements mapping (static reference table).

Maps control types used across the platform to mandates from the frameworks a
Indian financial institution would be audited against. This is a reference
table — it does not compute compliance, it lets the UI show "which regulation
cares about this control and the current gap posture".
"""

# control_type -> list of (framework, requirement/control identifier, description)
COMPLIANCE_MAPPING = {
    "MFA": [
        ("NIST CSF 2.0", "PR.AA-01", "Identities and credentials are managed for authorized devices, users and processes"),
        ("CIS v8", "6.4", "Require MFA for administrative access"),
        ("RBI IT Framework", "G3.5.1", "Multi-factor authentication for privileged & remote access"),
        ("SEBI CSCRF", "5.2", "User access management and MFA for market infrastructure"),
    ],
    "PATCH": [
        ("NIST CSF 2.0", "PR.PS-02", "Software is maintained, replaced and removed based on vulnerability scanning"),
        ("CIS v8", "7.4", "Automate application patch management"),
        ("ISO 27001:2022", "A.8.8", "Management of technical vulnerabilities"),
        ("RBI IT Framework", "G3.6.2", "Timely application of security patches"),
    ],
    "EDR": [
        ("NIST CSF 2.0", "DE.CM-02", "Security events are detected and alerted via endpoint monitoring"),
        ("CIS v8", "13.8", "Deploy endpoint detection and response"),
        ("RBI IT Framework", "G3.3.2", "Continuous monitoring of critical systems"),
    ],
    "SEGMENTATION": [
        ("NIST CSF 2.0", "PR.PS-05", "Network integrity is protected (network segregation)"),
        ("CIS v8", "3.12", "Segment networks based on sensitivity"),
        ("SEBI CSCRF", "2.1", "Network segmentation of market-critical systems"),
    ],
    "FIREWALL": [
        ("NIST CSF 2.0", "PR.PS-01", "Configuration management of technology infrastructure"),
        ("CIS v8", "4.8", "Deploy portscheme controls / host-based firewall"),
        ("RBI IT Framework", "G3.3.5", "Perimeter defense and firewall management"),
    ],
    "BACKUP": [
        ("ISO 27001:2022", "A.8.13", "Information backup"),
        ("RBI IT Framework", "G4.4.4", "Backup, business continuity and DR"),
        ("SEBI CSCRF", "6.3", "Business continuity and disaster recovery testing"),
    ],
    "DLP": [
        ("NIST CSF 2.0", "PR.DS-01", "Data-at-rest is protected"),
        ("CIS v8", "3.11", "Data loss prevention for highly sensitive data"),
        ("DPDP Act 2023 (India)", "S.9", "Security safeguards for digital personal data"),
    ],
    "SIEM": [
        ("NIST CSF 2.0", "DE.CM-01", "Network operations are monitored"),
        ("CIS v8", "8.2", "Collect and store security logs / centralized log management"),
        ("RBI IT Framework", "G3.3.4", "Security incident detection and log correlation"),
    ],
}


class ComplianceMapper:
    @staticmethod
    def mapping() -> dict:
        return COMPLIANCE_MAPPING

    @staticmethod
    def all_regulations() -> list[str]:
        regs = set()
        for items in COMPLIANCE_MAPPING.values():
            for framework, _, _ in items:
                regs.add(framework)
        return sorted(regs)

    @staticmethod
    def apply_asset_state(asset_mapping: list[dict]) -> dict:
        """Annotate the static mapping with the asset's current control posture."""
        active_by_type = {
            item["control_type"]: item for item in asset_mapping
        }
        rows = []
        covered = 0
        total = 0
        for control_type, mandates in COMPLIANCE_MAPPING.items():
            state = active_by_type.get(control_type)
            status = "ACTIVE"
            if state is None:
                status = "NOT_MAPPED"
            elif state.get("status") not in ("ACTIVE", "VERIFIED", "IMPLEMENTED"):
                status = "PLANNED"

            rows.append({
                "control_type": control_type,
                "status": status,
                "coverage_score": round(float(state.get("coverage_score") or 0), 2) if state else 0,
                "effectiveness_score": round(float(state.get("effectiveness_score") or 0), 2) if state else 0,
                "mandates": mandates,
            })

        for r in rows:
            total += 1
            if r["status"] == "ACTIVE":
                covered += 1

        return {
            "mapped_requirements": rows,
            "regulations": ComplianceMapper.all_regulations(),
            "coverage": {
                "active_controls": covered,
                "total_control_types": total,
                "compliance_coverage_percent": round(covered / total * 100, 1) if total else 0,
            },
        }