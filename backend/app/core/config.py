from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI Claims Review Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+psycopg2://user:password@localhost:5432/claims_db"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    AI_ENGINE_URL: str = "http://localhost:8001"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
