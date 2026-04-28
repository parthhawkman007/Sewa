from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routes.api import api_router


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Backend API for NGO resource allocation, issue intelligence, and volunteer matching.",
    )

    # ✅ CORS FIX (WORKING)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ✅ ROUTES
    app.include_router(api_router, prefix=settings.api_prefix)

    return app


app = create_app()