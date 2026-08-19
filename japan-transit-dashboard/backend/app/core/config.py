from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Japan Transit Dashboard"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/japan_transit_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()