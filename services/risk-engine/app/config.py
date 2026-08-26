import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://localhost:5432/cyberrisk"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    asset_service_url: str = os.getenv("ASSET_SERVICE_URL", "http://localhost:8082")
    vuln_service_url: str = os.getenv("VULN_SERVICE_URL", "http://localhost:8083")
    control_service_url: str = os.getenv("CONTROL_SERVICE_URL", "http://localhost:8084")
    host: str = "0.0.0.0"
    port: int = 8090

    class Config:
        env_file = ".env"


settings = Settings()
