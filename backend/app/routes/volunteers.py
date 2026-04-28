from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from app.models.models import Volunteer, Task, TaskStatus
from app.db.repository import BaseRepository, get_repository
from datetime import datetime

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


def _append_issue_update(issue: Dict[str, Any], label: str, now: str) -> List[Dict[str, Any]]:
    updates = issue.get("updates", [])
    updates.append({"label": label, "time": now.split(" ")[1]})
    return updates


async def _notify(repo: BaseRepository, role: str, title: str, message: str, kind: str = "info"):
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    await repo.create("notifications", {
        "id": int(datetime.now().timestamp() * 1000),
        "title": title,
        "message": message,
        "type": kind,
        "read": False,
        "createdAt": now,
        "role": role
    })

@router.get("", response_model=List[Volunteer])
async def list_volunteers(repo: BaseRepository = Depends(get_repository)):
    return await repo.get_all("volunteers")



@router.get("/tasks", response_model=List[Task])
async def list_tasks(repo: BaseRepository = Depends(get_repository)):
    return await repo.get_all("tasks")

@router.get("/queue", response_model=List[Task])
async def get_task_queue(repo: BaseRepository = Depends(get_repository)):
    tasks = await repo.get_all("tasks")
    return [t for t in tasks if t.get("status") == "queued"]

@router.get("/performance")
async def get_performance(volunteerId: Optional[str] = None, repo: BaseRepository = Depends(get_repository)):
    tasks = await repo.get_all("tasks")

    if volunteerId:
        tasks = [t for t in tasks if t.get("volunteerId") == volunteerId]

    completed = [t for t in tasks if t.get("status") == "completed"]
    total = len(tasks)

    # Compute real average response time from startTime vs issue createdAt
    response_deltas = []
    for t in completed:
        start = t.get("startTime")
        issue_id = t.get("issueId")
        if start and issue_id:
            try:
                issue = await repo.get_by_id("issues", issue_id)
                if issue:
                    created_raw = str(issue.get("createdAt", ""))
                    start_dt = datetime.strptime(str(start), "%Y-%m-%d %H:%M")
                    created_dt = datetime.strptime(created_raw, "%Y-%m-%d %H:%M")
                    delta_min = (start_dt - created_dt).total_seconds() / 60
                    if 0 < delta_min < 180:
                        response_deltas.append(delta_min)
            except Exception:
                pass
    avg_response = f"{round(sum(response_deltas) / len(response_deltas))} min" if response_deltas else "N/A"

    # Real rating from volunteer profile in Firestore
    real_rating = 0.0
    if volunteerId:
        volunteer = await repo.get_by_id("volunteers", volunteerId)
        if volunteer and volunteer.get("rating"):
            real_rating = float(volunteer["rating"])
    elif completed:
        real_rating = 4.5  # Generic fallback only when no volunteerId given

    return {
        "completedTasks": len(completed),
        "rating": real_rating,
        "responseTime": avg_response,
        "completionRate": round((len(completed) / total * 100) if total > 0 else 0)
    }

@router.get("/shifts")
async def get_shifts(repo: BaseRepository = Depends(get_repository)):
    """Return shift templates from Firestore 'shifts' collection."""
    try:
        shifts = await repo.get_all("shifts")
        if shifts:
            return shifts
    except Exception as e:
        print(f"Shifts fetch error: {e}")
    # Seed defaults if collection is empty (first run)
    defaults = [
        {"id": "SHIFT-1", "label": "Morning field response", "time": "06:00 - 10:00", "zone": "East Corridor", "load": "High demand"},
        {"id": "SHIFT-2", "label": "Midday logistics support", "time": "11:00 - 15:00", "zone": "Central Hub", "load": "Balanced"},
        {"id": "SHIFT-3", "label": "Evening medical relay", "time": "16:00 - 20:00", "zone": "Riverfront Ward", "load": "Priority medical"}
    ]
    for shift in defaults:
        try:
            await repo.create("shifts", shift)
        except Exception:
            pass
    return defaults

@router.post("/availability")
async def update_availability(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    v_id = payload.get("volunteerId")
    status = payload.get("status")
    return await repo.update("volunteers", v_id, {"availability": status})

@router.post("/tasks/accept")
async def accept_task(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    task_id = payload.get("taskId")
    v_id = payload.get("volunteerId")
    v_name = payload.get("volunteerName")
    if not task_id or not v_id:
        raise HTTPException(status_code=400, detail="taskId and volunteerId are required")
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    update_data = {
        "status": "accepted",
        "volunteerId": v_id,
        "volunteerName": v_name,
        "startTime": now
    }
    
    task = await repo.update("tasks", task_id, update_data)
    issue_id = task.get("issueId")
    issue = await repo.get_by_id("issues", issue_id) if issue_id else None

    if issue:
        updates = _append_issue_update(issue, f"Accepted by {v_name or 'volunteer'}", now)
        await repo.update("issues", issue_id, {"status": "In Progress", "updates": updates})

    await repo.update("volunteers", v_id, {"availability": "Busy"})
    await _notify(repo, "ngo", "Task accepted", f"{v_name or 'A volunteer'} accepted task {task_id}.", "success")
    await _notify(repo, "user", "Help is on the way", f"{v_name or 'A volunteer'} accepted your issue.", "success")
    
    return task

@router.post("/tasks/decline")
async def decline_task(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    task_id = payload.get("taskId")
    if not task_id:
        raise HTTPException(status_code=400, detail="taskId is required")

    task = await repo.update("tasks", task_id, {"status": "declined"})
    issue_id = task.get("issueId")
    issue = await repo.get_by_id("issues", issue_id) if issue_id else None

    if issue:
        updates = _append_issue_update(issue, "Volunteer declined, waiting for reassignment", datetime.now().strftime("%Y-%m-%d %H:%M"))
        await repo.update("issues", issue_id, {"status": "Pending Review", "updates": updates})

    await _notify(repo, "ngo", "Task declined", f"Task {task_id} needs reassignment.", "warning")
    return task

@router.post("/tasks/complete")
async def complete_task(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    task_id = payload.get("taskId")
    issue_id = payload.get("issueId")
    volunteer_name = payload.get("volunteerName")
    if not task_id or not issue_id:
        raise HTTPException(status_code=400, detail="taskId and issueId are required")
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Update Task
    task = await repo.update("tasks", task_id, {
        "status": "completed",
        "completionTime": now
    })
    
    # Update Issue
    issue = await repo.get_by_id("issues", issue_id)
    if issue:
        updates = _append_issue_update(issue, f"Resolved by {volunteer_name or 'volunteer'}", now)
        await repo.update("issues", issue_id, {
            "status": "Resolved",
            "updates": updates
        })

    volunteer_id = task.get("volunteerId")
    if volunteer_id:
        await repo.update("volunteers", volunteer_id, {"availability": "Online"})

    await _notify(repo, "ngo", "Task completed", f"{volunteer_name or 'A volunteer'} completed task {task_id}.", "success")
    await _notify(repo, "user", "Issue resolved", "Your reported issue has been marked resolved.", "success")
    return task

@router.get("/{volunteerId}", response_model=Volunteer)
async def get_volunteer(volunteerId: str, repo: BaseRepository = Depends(get_repository)):
    volunteer = await repo.get_by_id("volunteers", volunteerId)
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")
    return volunteer
