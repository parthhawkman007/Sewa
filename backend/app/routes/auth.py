from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.models.models import UserProfile, UserRole
from app.db.repository import BaseRepository, get_repository

router = APIRouter(prefix="/auth", tags=["auth"])

# Local mock data for initial profiles matching the frontend
MOCK_PROFILES = {
    "user": {
        "id": "USR-101",
        "name": "Aarav Sharma",
        "role": "user",
        "email": "aarav@civicgrid.org",
        "location": "East Corridor",
        "trustScore": 94,
    },
    "volunteer": {
        "id": "VOL-201",
        "name": "Maya Patel",
        "role": "volunteer",
        "email": "maya@communitylink.org",
        "skills": ["First Aid", "Logistics", "Field Ops"],
        "maxDistance": 15.0,
        "rating": 4.8,
    },
    "ngo": {
        "id": "NGO-301",
        "name": "Nina Joseph",
        "role": "ngo",
        "email": "nina@hopeworks.org",
        "organization": "HopeWorks Foundation",
        "organizationType": "NGO Admin",
    },
}

@router.post("/login")
async def login(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    role = payload.get("role", "user")
    email = payload.get("email")
    
    # In a real app, we would verify with Firebase Auth
    # For now, return the mock profile or create a default one
    profile = MOCK_PROFILES.get(role, MOCK_PROFILES["user"]).copy()
    profile["email"] = email or profile["email"]
    profile["authProvider"] = "email"
    
    return profile

@router.post("/signup")
async def signup(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    role = payload.get("role", "user")
    name = payload.get("name", "New User")
    email = payload.get("email")
    
    profile = MOCK_PROFILES.get(role, MOCK_PROFILES["user"]).copy()
    profile["name"] = name
    profile["email"] = email
    profile["authProvider"] = "email"
    
    return profile

@router.post("/google")
async def google_auth(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    role = payload.get("role", "user")
    
    profile = MOCK_PROFILES.get(role, MOCK_PROFILES["user"]).copy()
    profile["authProvider"] = "google"
    
    return profile

@router.get("/profile")
async def get_profile(user_id: str, repo: BaseRepository = Depends(get_repository)):
    # Simple lookup in repo
    user = await repo.get_by_id("users", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user
