from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.services.gemini_service import GeminiService, get_gemini_service
from app.db.repository import BaseRepository, get_repository
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/resources", tags=["resources"])

@router.get("/recommendations")
async def get_recommendations(
    category: str = "General",
    ai: GeminiService = Depends(get_gemini_service)
):
    """
    Get AI-powered resource recommendations based on the issue category.
    """
    if not ai.model:
        # Fallback if Gemini is not configured
        return [
            {
                "id": "RES-1",
                "title": "East Corridor Relief Shelter",
                "type": "Shelter",
                "eta": "8 min away",
                "note": "Night support, hot meals, and charging points available.",
            },
            {
                "id": "RES-2",
                "title": "Ward Medical Pickup Point",
                "type": "Medical Support",
                "eta": "12 min away",
                "note": "Essential medicine collection and triage volunteers on site.",
            }
        ]

    prompt = f"""
    Given the emergency category '{category}', suggest 3 specific resource points (shelters, medical centers, supply depots).
    Return the result as a JSON list of objects with fields: id, title, type, eta, note.
    Example: {{"id": "RES-X", "title": "Name", "type": "Category", "eta": "X min away", "note": "Description"}}
    Only return the JSON list.
    """
    
    try:
        response = ai.model.generate_content(prompt)
        # Extract JSON from response text
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        recommendations = json.loads(text)
        return recommendations
    except Exception as e:
        print(f"Gemini Recommendation Error: {e}")
        return [
            {"id": "RES-1", "title": "Standard Emergency Hub", "type": "General", "eta": "10 min", "note": "Available for all inquiries."}
        ]
    
@router.get("/alerts")
async def get_resource_alerts(repo: BaseRepository = Depends(get_repository)):
    """
    Returns live resource alerts from Firestore 'resource_alerts' collection.
    Falls back to an empty list if none exist.
    """
    try:
        alerts = await repo.get_all("resource_alerts")
        # Sort by createdAt descending, return latest 10
        def parse_time(a):
            raw = a.get("createdAt", "")
            try:
                return datetime.fromisoformat(str(raw))
            except Exception:
                return datetime.min
        alerts_sorted = sorted(alerts, key=parse_time, reverse=True)[:10]
        return [
            {
                "title": a.get("title", "Update"),
                "detail": a.get("detail", ""),
                "time": a.get("time") or _relative_time(a.get("createdAt"))
            }
            for a in alerts_sorted
        ]
    except Exception as e:
        print(f"Resource alerts error: {e}")
        return []


def _relative_time(raw) -> str:
    """Convert an ISO datetime string to a relative time string."""
    if not raw:
        return "recently"
    try:
        ts = datetime.fromisoformat(str(raw))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        diff = int((datetime.now(timezone.utc) - ts).total_seconds())
        if diff < 60:
            return f"{diff}s ago"
        if diff < 3600:
            return f"{diff // 60} min ago"
        return f"{diff // 3600} hr ago"
    except Exception:
        return "recently"


@router.get("/quick-actions")
async def get_quick_actions(repo: BaseRepository = Depends(get_repository)):
    """
    Returns live quick-action status values from Firestore config/quickActions doc.
    """
    try:
        doc = await repo.get_by_id("config", "quickActions")
        if doc:
            return doc
    except Exception as e:
        print(f"Quick actions config error: {e}")
    return {
        "Emergency hotline": "108",
        "Nearest shelter": "Operational",
        "Medical relay": "Active",
        "Supply drop points": "Available",
    }
