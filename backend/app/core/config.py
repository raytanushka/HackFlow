import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HackFlow"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hackflow-secret-key-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

settings = Settings()
