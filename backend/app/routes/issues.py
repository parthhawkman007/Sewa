from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from app.models.models import Issue
from app.db.repository import BaseRepository, get_repository
from app.services.gemini_service import GeminiService, get_gemini_service
import uuid
from datetime import datetime

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("")
async def list_issues(repo: BaseRepository = Depends(get_repository)):
    try:
        data = await repo.get_all("issues")
        return data or []
    except Exception as e:
        print("ERROR /issues:", str(e))
        return []


@router.get("/nearby")
async def nearby_issues(repo: BaseRepository = Depends(get_repository)):
    try:
        all_issues = await repo.get_all("issues")
        return [i for i in all_issues if i.get("status") != "Resolved"][:4]
    except:
        return []


@router.get("/history")
async def issue_history(
    reportedBy: Optional[str] = None,
    repo: BaseRepository = Depends(get_repository)
):
    try:
        all_issues = await repo.get_all("issues")

        if reportedBy:
            return [i for i in all_issues if i.get("reportedBy") == reportedBy]

        return all_issues
    except:
        return []


@router.get("/{issue_id}", response_model=Issue)
async def get_issue(issue_id: str, repo: BaseRepository = Depends(get_repository)):
    issue = await repo.get_by_id("issues", issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.get("/{issue_id}/timeline")
async def get_issue_timeline(issue_id: str, repo: BaseRepository = Depends(get_repository)):
    issue = await repo.get_by_id("issues", issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue.get("updates", [])


# ✅ FIXED CREATE ISSUE
@router.post("/create")
async def create_issue(
    payload: Dict[str, Any],
    repo: BaseRepository = Depends(get_repository),
    ai: GeminiService = Depends(get_gemini_service)
):
    try:
        title = payload.get("title")
        description = payload.get("description")
        urgency = int(payload.get("urgency", 50))
        emergency = bool(payload.get("emergency", False))

        category = payload.get("category") or await ai.suggest_category(title, description)
        priority = await ai.derive_priority(urgency, emergency)

        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        issue_id = f"ISS-{uuid.uuid4().hex[:4].upper()}"

        new_issue = {
            "id": issue_id,
            "title": title,
            "description": description,
            "category": category,
            "urgency": urgency,
            "priority": priority,
            "status": "Pending Review",
            "emergency": emergency,
            "reportedBy": payload.get("reportedBy", "System"),

            # ✅ TEXT LOCATION ONLY
            "locationName": payload.get("location", {}).get("label", "Unknown"),

            # ❌ REMOVED COORDINATES COMPLETELY

            "requiredSkills": payload.get("requiredSkills", ["Field Ops"]),
            "mediaUrls": payload.get("mediaUrls", []),  # ✅ REAL MEDIA SUPPORT

            "createdAt": now,
            "updates": [
                {"label": "Reported", "time": now},
                {"label": "Queued for NGO review", "time": now},
            ]
        }

        result = await repo.create("issues", new_issue)

        notification = {
            "id": int(datetime.now().timestamp()),
            "title": "New issue reported",
            "message": f"{title} entered the review queue.",
            "type": "warning" if emergency else "info",
            "read": False,
            "createdAt": now,
            "role": "ngo"
        }

        await repo.create("notifications", notification)

        return result

    except Exception as e:
        print("ERROR CREATE ISSUE:", e)
        return {"error": str(e)}


@router.post("/update", response_model=Issue)
async def update_issue(
    payload: Dict[str, Any],
    repo: BaseRepository = Depends(get_repository)
):
    try:
        issue_id = payload.get("issueId")
        if not issue_id:
            raise HTTPException(status_code=400, detail="issueId is required")

        now = datetime.now().strftime("%H:%M")

        update_data = {}
        if "status" in payload:
            update_data["status"] = payload["status"]
        if payload.get("escalate"):
            update_data["priority"] = "High"

        issue = await repo.get_by_id("issues", issue_id)
        if not issue:
            raise HTTPException(status_code=404, detail="Issue not found")

        updates = issue.get("updates", [])
        updates.append({
            "label": payload.get("updateLabel", "Updated by control center"),
            "time": now
        })

        update_data["updates"] = updates

        return await repo.update("issues", issue_id, update_data)

    except:
        raise HTTPException(status_code=500, detail="Error updating issue")