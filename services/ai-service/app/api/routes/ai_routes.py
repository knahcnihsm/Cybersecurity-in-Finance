import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.schemas.ai_schemas import (
    RecommendRequest, RecommendResponse,
    QueryRequest, QueryResponse,
    ExplainRequest, ExplainResponse,
    SummarizeRequest,
)
from app.core.recommendation_engine import (
    get_recommendations,
    query_risk_data,
    explain_risk,
    generate_summary,
)

router = APIRouter(prefix="/api/ai", tags=["AI"])


async def _fetch_risk_data() -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{settings.risk_engine_url}/api/risk/score")
            return resp.json()
        except Exception:
            return {"total_eal": 0, "enterprise_risk_score": 0, "top_risk_drivers": []}


async def _fetch_eal_data() -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(f"{settings.risk_engine_url}/api/risk/eal")
            return resp.json()
        except Exception:
            return {"total_eal": 0, "asset_eals": [], "breakdown_by_department": {}}


async def _fetch_asset_risk(asset_id: str) -> tuple[dict, dict]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            risk_resp = await client.get(f"{settings.risk_engine_url}/api/risk/asset/{asset_id}")
            risk_data = risk_resp.json()
        except Exception:
            risk_data = {"risk_score": 0, "probability": 0}

        try:
            asset_resp = await client.get(f"{settings.asset_service_url}/api/assets/{asset_id}")
            asset_data = asset_resp.json()
        except Exception:
            asset_data = {"id": asset_id, "name": "Unknown Asset"}

        return asset_data, risk_data


@router.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    risk_data = await _fetch_risk_data()
    result = await get_recommendations(risk_data, request.context, request.focus_area)
    return result


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    risk_data = await _fetch_risk_data()
    eal_data = await _fetch_eal_data()
    combined = {**risk_data, "eal": eal_data}
    result = await query_risk_data(request.question, combined)
    return result


@router.post("/explain/risk/{asset_id}", response_model=ExplainResponse)
async def explain(request: ExplainRequest, asset_id: str):
    asset_data, risk_data = await _fetch_asset_risk(asset_id)
    result = await explain_risk(asset_data, risk_data, request.detail_level)
    return result


@router.post("/summarize")
async def summarize(request: SummarizeRequest):
    risk_data = await _fetch_risk_data()
    eal_data = await _fetch_eal_data()
    summary = await generate_summary(eal_data, risk_data, request.audience)
    return {"summary": summary, "audience": request.audience}
