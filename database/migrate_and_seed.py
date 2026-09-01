"""
CyberRisk Quantifier — Database Migration & Seed Script
Run: python database/migrate_and_seed.py
"""

import os
import sys
import json
import uuid
import glob
from pathlib import Path

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_5tPI6aKwZJxq@ep-bitter-morning-azdy5wi1-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MOCK_DATA_DIR = PROJECT_ROOT / "mock-data"
MIGRATIONS_DIR = PROJECT_ROOT / "database" / "migrations"


def get_connection():
    conn = psycopg2.connect(DATABASE_URL)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return conn


def run_sql_file(conn, filepath):
    print(f"  Running: {filepath.name}")
    with open(filepath, "r") as f:
        sql = f.read()
    cur = conn.cursor()
    cur.execute(sql)
    cur.close()
    print(f"  OK")


def run_migrations(conn):
    print("\n=== Running Migrations ===\n")

    init_sql = PROJECT_ROOT / "database" / "init.sql"
    run_sql_file(conn, init_sql)

    migration_files = sorted(glob.glob(str(MIGRATIONS_DIR / "*.sql")))
    for f in migration_files:
        run_sql_file(conn, Path(f))

    print("\n  All migrations complete.\n")


def asset_string_id_to_uuid(string_id):
    """Convert string asset IDs like 'PAY-SRV-001' to deterministic UUIDs."""
    mapping = {
        "PAY-SRV-001": uuid.UUID("00000001-0001-0001-0001-000000000001"),
        "CUST-DB-001": uuid.UUID("00000001-0001-0001-0001-000000000002"),
        "AUTH-IDP-001": uuid.UUID("00000001-0001-0001-0001-000000000003"),
        "WEB-APP-001": uuid.UUID("00000001-0001-0001-0001-000000000004"),
        "API-GW-001": uuid.UUID("00000001-0001-0001-0001-000000000005"),
        "EMAIL-SRV-001": uuid.UUID("00000001-0001-0001-0001-000000000006"),
        "BACKUP-SYS-001": uuid.UUID("00000001-0001-0001-0001-000000000007"),
        "CLOUD-MGMT-001": uuid.UUID("00000001-0001-0001-0001-000000000008"),
        "SIEM-SYS-001": uuid.UUID("00000001-0001-0001-0001-000000000009"),
        "DEV-ENV-001": uuid.UUID("00000001-0001-0001-0001-000000000010"),
        "DB-ANALYTICS-001": uuid.UUID("00000001-0001-0001-0001-000000000011"),
        "VPN-SRV-001": uuid.UUID("00000001-0001-0001-0001-000000000012"),
    }
    return mapping.get(string_id)


def seed_assets(conn):
    print("  Seeding assets...")
    with open(MOCK_DATA_DIR / "assets.json") as f:
        assets = json.load(f)

    cur = conn.cursor()
    for i, asset in enumerate(assets):
        asset_uuid = asset_string_id_to_uuid(asset["id"])
        cur.execute("""
            INSERT INTO asset.assets (
                id, name, asset_type, environment, owner, department,
                ip_address, operating_system, business_value_inr, replacement_cost_inr,
                internet_exposed, criticality_score, data_sensitivity, annual_revenue_impact
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            str(asset_uuid), asset["name"], asset["asset_type"], asset["environment"],
            asset.get("owner"), asset.get("department"), asset.get("ip_address"),
            asset.get("operating_system"), asset["business_value_inr"],
            asset.get("replacement_cost_inr", 0), asset.get("internet_exposed", False),
            asset.get("criticality_score", 50), asset.get("data_sensitivity", "INTERNAL"),
            asset.get("annual_revenue_impact", 0)
        ))
    cur.close()
    print(f"    Inserted {len(assets)} assets")


def seed_controls(conn):
    print("  Seeding controls...")
    with open(MOCK_DATA_DIR / "controls.json") as f:
        controls = json.load(f)

    cur = conn.cursor()
    control_uuids = []
    for i, ctrl in enumerate(controls):
        ctrl_uuid = uuid.UUID(f"00000002-0001-0001-0001-{i+1:012d}")
        control_uuids.append(ctrl_uuid)
        cur.execute("""
            INSERT INTO control.security_controls (
                id, name, control_type, description,
                implementation_cost_inr, annual_maintenance_inr,
                max_risk_reduction, implementation_time_days
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            str(ctrl_uuid), ctrl["name"], ctrl["control_type"], ctrl.get("description", ""),
            ctrl["implementation_cost_inr"], ctrl.get("annual_maintenance_inr", 0),
            ctrl.get("max_risk_reduction", 0), ctrl.get("implementation_time_days", 30)
        ))
    cur.close()
    print(f"    Inserted {len(controls)} controls")
    return control_uuids


def seed_vulnerabilities(conn):
    print("  Seeding vulnerabilities...")
    with open(MOCK_DATA_DIR / "vulnerabilities.json") as f:
        vulns = json.load(f)

    cur = conn.cursor()
    for vuln in vulns:
        affected_asset_uuid = asset_string_id_to_uuid(vuln["affected_asset"])
        cur.execute("""
            INSERT INTO vuln.vulnerabilities (
                cve_id, cwe_id, title, description, cvss_score, severity,
                exploitability, affected_asset, internet_exposed, status,
                remediation, source
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            vuln.get("cve_id"), vuln.get("cwe_id"), vuln["title"],
            vuln.get("description", ""), vuln["cvss_score"], vuln["severity"],
            vuln.get("exploitability", 0), str(affected_asset_uuid) if affected_asset_uuid else None,
            vuln.get("internet_exposed", False), vuln.get("status", "OPEN"),
            vuln.get("remediation", ""), vuln.get("source", "SCANNER")
        ))
    cur.close()
    print(f"    Inserted {len(vulns)} vulnerabilities")


def seed_asset_controls(conn, control_uuids):
    print("  Seeding asset-controls relationships...")

    asset_control_pairs = [
        ("AUTH-IDP-001", 0, "ACTIVE", 0.85, 0.90, 3),
        ("PAY-SRV-001", 4, "ACTIVE", 0.70, 0.80, 2),
        ("WEB-APP-001", 7, "ACTIVE", 0.75, 0.85, 3),
        ("WEB-APP-001", 2, "PLANNED", 0.0, 0.0, 0),
        ("CLOUD-MGMT-001", 3, "ACTIVE", 0.60, 0.70, 2),
        ("CUST-DB-001", 6, "ACTIVE", 0.80, 0.85, 3),
        ("API-GW-001", 7, "ACTIVE", 0.90, 0.95, 3),
        ("EMAIL-SRV-001", 0, "PLANNED", 0.0, 0.0, 0),
        ("EMAIL-SRV-001", 9, "PLANNED", 0.0, 0.0, 0),
        ("SIEM-SYS-001", 8, "ACTIVE", 0.70, 0.75, 2),
        ("BACKUP-SYS-001", 6, "ACTIVE", 0.85, 0.90, 3),
        ("VPN-SRV-001", 5, "ACTIVE", 0.65, 0.70, 2),
        ("DEV-ENV-001", 4, "PLANNED", 0.0, 0.0, 0),
        ("DB-ANALYTICS-001", 9, "PLANNED", 0.0, 0.0, 0),
    ]

    cur = conn.cursor()
    for asset_str_id, ctrl_idx, status, coverage, effectiveness, maturity in asset_control_pairs:
        asset_uuid = asset_string_id_to_uuid(asset_str_id)
        ctrl_uuid = control_uuids[ctrl_idx]
        cur.execute("""
            INSERT INTO control.asset_controls (
                asset_id, control_id, status, coverage_score,
                effectiveness_score, maturity_level
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (asset_id, control_id) DO NOTHING
        """, (
            str(asset_uuid), str(ctrl_uuid), status,
            coverage, effectiveness, maturity
        ))
    cur.close()
    print(f"    Inserted {len(asset_control_pairs)} asset-control relationships")


def seed_dependencies(conn):
    print("  Seeding asset dependency graph...")

    # Edge semantics: asset_id DEPENDS ON depends_on_id.
    # If depends_on_id is compromised, asset_id is exposed (blast radius flows upstream).
    dependency_pairs = [
        # (depends_on_asset, depended_asset, dependency_type, criticality)
        ("API-GW-001", "AUTH-IDP-001", "AUTH", 90),
        ("API-GW-001", "CUST-DB-001", "DATA", 80),
        ("WEB-APP-001", "API-GW-001", "NETWORK", 85),
        ("WEB-APP-001", "AUTH-IDP-001", "AUTH", 90),
        ("PAY-SRV-001", "CUST-DB-001", "DATA", 95),
        ("PAY-SRV-001", "AUTH-IDP-001", "AUTH", 88),
        ("PAY-SRV-001", "API-GW-001", "NETWORK", 80),
        ("CUST-DB-001", "BACKUP-SYS-001", "INFRASTRUCTURE", 75),
        ("EMAIL-SRV-001", "AUTH-IDP-001", "AUTH", 70),
        ("CLOUD-MGMT-001", "AUTH-IDP-001", "AUTH", 85),
        ("CLOUD-MGMT-001", "SIEM-SYS-001", "MONITORING", 60),
        ("DB-ANALYTICS-001", "CUST-DB-001", "DATA", 85),
        ("DB-ANALYTICS-001", "BACKUP-SYS-001", "INFRASTRUCTURE", 60),
        ("SIEM-SYS-001", "API-GW-001", "LOG_SOURCE", 55),
        ("SIEM-SYS-001", "PAY-SRV-001", "LOG_SOURCE", 55),
        ("SIEM-SYS-001", "WEB-APP-001", "LOG_SOURCE", 55),
        ("BACKUP-SYS-001", "CLOUD-MGMT-001", "INFRASTRUCTURE", 65),
        ("VPN-SRV-001", "AUTH-IDP-001", "AUTH", 80),
    ]

    cur = conn.cursor()
    for source_str, target_str, dep_type, criticality in dependency_pairs:
        source_uuid = asset_string_id_to_uuid(source_str)
        target_uuid = asset_string_id_to_uuid(target_str)
        if not source_uuid or not target_uuid:
            continue
        cur.execute("""
            INSERT INTO asset.asset_dependencies (asset_id, depends_on_id, dependency_type, criticality)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (asset_id, depends_on_id) DO NOTHING
        """, (str(source_uuid), str(target_uuid), dep_type, criticality))
    cur.close()
    print(f"    Inserted {len(dependency_pairs)} asset dependencies")


def seed_risk_calculations(conn):
    print("  Seeding risk calculations...")

    import random
    random.seed(42)

    with open(MOCK_DATA_DIR / "assets.json") as f:
        assets = json.load(f)

    with open(MOCK_DATA_DIR / "vulnerabilities.json") as f:
        vulns = json.load(f)

    asset_vuln_count = {}
    for v in vulns:
        a = v["affected_asset"]
        asset_vuln_count[a] = asset_vuln_count.get(a, 0) + 1

    cur = conn.cursor()
    for asset in assets:
        asset_uuid = asset_string_id_to_uuid(asset["id"])
        vuln_count = asset_vuln_count.get(asset["id"], 0)
        criticality = asset.get("criticality_score", 50)
        biz_value = asset["business_value_inr"]

        base_prob = min(0.95, vuln_count * 0.12 + random.uniform(0.05, 0.15))
        impact = biz_value * (criticality / 100.0) * random.uniform(0.3, 0.7)
        eal = base_prob * impact
        risk_score = min(100, base_prob * 40 + (impact / biz_value * 100 if biz_value > 0 else 0) * 0.35 + criticality * 0.25)

        if risk_score >= 75:
            category = "CRITICAL"
        elif risk_score >= 50:
            category = "HIGH"
        elif risk_score >= 25:
            category = "MEDIUM"
        else:
            category = "LOW"

        cur.execute("""
            INSERT INTO risk.risk_calculations (
                asset_id, risk_score, probability, financial_impact_inr,
                expected_annual_loss, risk_category, risk_factors,
                control_reduction, residual_risk
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(asset_uuid), round(risk_score, 2), round(base_prob, 4),
            round(impact, 2), round(eal, 2), category,
            json.dumps({"vulnCount": vuln_count, "criticality": criticality}),
            round(random.uniform(0.1, 0.3), 4), round(eal * 0.7, 2)
        ))
    cur.close()
    print(f"    Inserted risk calculations for {len(assets)} assets")


def seed_risk_snapshots(conn):
    print("  Seeding historical risk snapshots...")
    from datetime import datetime, timedelta

    import random
    random.seed(7)

    cur = conn.cursor()
    today = datetime.utcnow().date()
    months_back = 8
    base_eal = 0
    cur.execute("SELECT COALESCE(SUM(expected_annual_loss), 0) FROM risk.risk_calculations")
    row = cur.fetchone()
    if row:
        base_eal = float(row[0] or 0)

    base_vulns = 0
    cur.execute("SELECT COUNT(*) FROM vuln.vulnerabilities WHERE status IN ('OPEN','IN_PROGRESS')")
    row = cur.fetchone()
    if row:
        base_vulns = int(row[0] or 0)

    base_score = 0
    cur.execute("SELECT COALESCE(AVG(risk_score), 0) FROM risk.risk_calculations")
    row = cur.fetchone()
    if row:
        base_score = float(row[0] or 0)

    # historical drift: back 8 months -> today, roughly +1.5% EAL/month
    for back in range(months_back, -1, -1):
        snap_date = today - timedelta(days=30 * back)
        growth_factor = 1.0 + 0.015 * back
        eal = base_eal * growth_factor
        vulns = int(base_vulns * (1.0 + 0.02 * back))
        score = min(100, base_score + 0.4 * back)
        cur.execute("""
            INSERT INTO risk.risk_snapshots (risk_score, expected_annual_loss,
                total_controls_active, total_vulns_open, snapshot_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            round(score, 2), round(eal, 2),
            5 + back, vulns, snap_date
        ))
    cur.close()
    print(f"    Inserted {months_back + 1} historical snapshots")


def main():
    print("=" * 60)
    print("  CyberRisk Quantifier — Migration & Seed")
    print("=" * 60)

    print(f"\nConnecting to NeonDB...")
    conn = get_connection()
    print("  Connected!\n")

    run_migrations(conn)

    print("=== Seeding Mock Data ===\n")

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM asset.assets")
    already_seeded = cur.fetchone()[0] > 0
    cur.close()

    if already_seeded:
        print("  Data already present — skipping seed (delete rows to re-seed).\n")
    else:
        seed_assets(conn)
        control_uuids = seed_controls(conn)
        seed_vulnerabilities(conn)
        seed_asset_controls(conn, control_uuids)
        seed_dependencies(conn)
        seed_risk_calculations(conn)
        seed_risk_snapshots(conn)

    conn.close()

    print("\n" + "=" * 60)
    print("  DONE — Database ready!")
    print("=" * 60)


if __name__ == "__main__":
    main()
