from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.middlewares.auth import APIKeyMiddleware
from app.middlewares.rate_limit import RateLimitMiddleware
from app.middlewares.logging_middleware import JSONLogMiddleware
from app.routers import health, meta, decide

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(JSONLogMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(APIKeyMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.APP_ENV=="dev" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(meta.router)
app.include_router(decide.router)
