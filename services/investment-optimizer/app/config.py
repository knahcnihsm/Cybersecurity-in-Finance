import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://localhost:5432/cyberrisk"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    risk_engine_url: str = os.getenv("RISK_ENGINE_URL", "http://localhost:8090")
    control_service_url: str = os.getenv("CONTROL_SERVICE_URL", "http://localhost:8084")
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8091"))

    class Config:
        env_file = ".env"


settings = Settings()
