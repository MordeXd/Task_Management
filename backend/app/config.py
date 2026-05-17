import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "15")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7")))
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_NAME = "Authorization"
    JWT_HEADER_TYPE = "Bearer"

    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/taskflow")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    RATELIMIT_STORAGE_URI = os.getenv(
        "RATELIMIT_STORAGE_URI",
        os.getenv("REDIS_URL", "memory://"),
    )
