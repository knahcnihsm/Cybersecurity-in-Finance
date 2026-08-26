from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes.risk_routes import router as risk_router

app = FastAPI(
    title="CyberRisk Quantifier — Risk Engine",
    description="Core risk quantification, EAL calculation, and scenario simulation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "risk-engine"}
