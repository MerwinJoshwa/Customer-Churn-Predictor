import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Customer Churn Predictor API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "mysql+pymysql://churn_user:churn_password@localhost:3306/churn_db"
    FALLBACK_SQLITE: bool = True
    SQLITE_URL: str = "sqlite:///./churn.db"
    
    # Model & Artifacts
    MODEL_VERSION: str = "v1.0.0"
    ARTIFACT_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    DATASET_PATH: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset", "Telco-Customer-Churn.csv"))
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
