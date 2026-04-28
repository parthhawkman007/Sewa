from fastapi import APIRouter

from app.routes import health, auth, issues, volunteers, ngo, chat, resources

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(issues.router)
api_router.include_router(volunteers.router)
api_router.include_router(ngo.router)
api_router.include_router(chat.router)
api_router.include_router(resources.router)
