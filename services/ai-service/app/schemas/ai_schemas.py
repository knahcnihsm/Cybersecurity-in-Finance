from pydantic import BaseModel, Field


class RecommendRequest(BaseModel):
    context: str = Field(default="general", description="Context: general, executive, technical")
    focus_area: str | None = Field(default=None, description="Focus: risk, investment, compliance, threat")


class RecommendResponse(BaseModel):
    recommendations: list[dict]
    summary: str
    data_sources: list[str]


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=2000)
    context: str = Field(default="general")


class QueryResponse(BaseModel):
    answer: str
    data_used: dict
    confidence: float
    source: str


class ExplainRequest(BaseModel):
    asset_id: str
    detail_level: str = Field(default="standard", description="brief, standard, detailed")


class ExplainResponse(BaseModel):
    asset_id: str
    asset_name: str
    explanation: str
    risk_factors: list[str]
    key_metrics: dict
    recommendations: list[str]


class SummarizeRequest(BaseModel):
    audience: str = Field(default="executive", description="executive, technical, board")
    time_period: str = Field(default="current", description="current, week, month")
