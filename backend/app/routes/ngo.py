from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from app.db.repository import BaseRepository, get_repository
from datetime import datetime

router = APIRouter(prefix="/ngo", tags=["ngo"])


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

@router.get("/dashboard")
async def get_dashboard_stats(repo: BaseRepository = Depends(get_repository)):
    issues = await repo.get_all("issues")
    tasks = await repo.get_all("tasks")
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t.get("status") == "completed"])
    completion_rate = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
    
    return {
        "alerts": len([i for i in issues if i.get("priority") == "High"]),
        "openIssues": len([i for i in issues if i.get("status") == "Pending Review" or i.get("status") == "Open"]),
        "completionRate": completion_rate
    }

@router.get("/analytics")
async def get_analytics(repo: BaseRepository = Depends(get_repository)):
    issues = await repo.get_all("issues")
    tasks = await repo.get_all("tasks")

    # Build a list of the last 6 calendar days (YYYY-MM-DD)
    from datetime import timedelta
    today = datetime.now().date()
    last_6_days = [(today - timedelta(days=i)).isoformat() for i in range(5, -1, -1)]

    # 1. Issue Trend: count issues created per day
    date_counts = {}
    for i in issues:
        date_str = str(i.get("createdAt", "")).split(" ")[0]
        if date_str:
            date_counts[date_str] = date_counts.get(date_str, 0) + 1
    trend = [date_counts.get(d, 0) for d in last_6_days]

    # 2. Average Response Time per day (createdAt -> first 'Accepted'/'assigned' update)
    def parse_response_min(issue):
        created_raw = str(issue.get("createdAt", ""))
        try:
            created_dt = datetime.strptime(created_raw, "%Y-%m-%d %H:%M")
        except Exception:
            return None
        for upd in issue.get("updates", []):
            label = upd.get("label", "").lower()
            if "accept" in label or "assign" in label or "transit" in label:
                try:
                    h, m = upd["time"].split(":")[:2]
                    resp_dt = created_dt.replace(hour=int(h), minute=int(m), second=0)
                    delta = (resp_dt - created_dt).total_seconds() / 60
                    if 0 < delta < 180:
                        return delta
                except Exception:
                    pass
        return None

    resp_by_day = {d: [] for d in last_6_days}
    for i in issues:
        day = str(i.get("createdAt", "")).split(" ")[0]
        if day in resp_by_day:
            mins = parse_response_min(i)
            if mins is not None:
                resp_by_day[day].append(mins)
    resp_times = [
        round(sum(vals) / len(vals)) if vals else 0
        for vals in [resp_by_day[d] for d in last_6_days]
    ]

    # 3. Completion Rate per day: completed tasks / total tasks started that day
    completed_by_day = {d: 0 for d in last_6_days}
    total_by_day = {d: 0 for d in last_6_days}
    for t in tasks:
        day = str(t.get("startTime", "")).split(" ")[0]
        if day in total_by_day:
            total_by_day[day] += 1
            if t.get("status") == "completed":
                completed_by_day[day] += 1
    comp_rate = [
        round(completed_by_day[d] / total_by_day[d] * 100) if total_by_day[d] > 0 else 0
        for d in last_6_days
    ]

    return {
        "issueTrend": trend,
        "responseTimes": resp_times,
        "completionRate": comp_rate,
    }


@router.get("/issues")
async def list_ngo_issues(repo: BaseRepository = Depends(get_repository)):
    return await repo.get_all("issues")

@router.get("/volunteers")
async def list_ngo_volunteers(repo: BaseRepository = Depends(get_repository)):
    return await repo.get_all("volunteers")

@router.post("/auto-assign")
async def auto_assign_volunteer(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    issue_id = payload.get("issueId")
    v_id = payload.get("volunteerId")
    v_name = payload.get("volunteerName")
    issue_title = payload.get("issueTitle")
    if not issue_id or not v_id:
        raise HTTPException(status_code=400, detail="issueId and volunteerId are required")
    
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Check if task exists
    tasks = await repo.get_all("tasks")
    existing_task = next((t for t in tasks if t.get("issueId") == issue_id), None)
    
    task_data = {
        "issueId": issue_id,
        "volunteerId": v_id,
        "volunteerName": v_name,
        "status": "accepted",
        "startTime": now
    }
    
    if existing_task:
        task = await repo.update("tasks", existing_task["id"], task_data)
    else:
        task_data["id"] = f"TSK-{int(datetime.now().timestamp()) % 10000}"
        task = await repo.create("tasks", task_data)
        
    issue = await repo.get_by_id("issues", issue_id)
    if issue:
        updates = _append_issue_update(issue, f"Assigned to {v_name or 'volunteer'} by NGO", now)
        await repo.update("issues", issue_id, {"status": "In Progress", "updates": updates})

    await repo.update("volunteers", v_id, {"availability": "Busy"})
    await _notify(repo, "ngo", "Volunteer assigned", f"{v_name or 'A volunteer'} assigned to {issue_title or issue_id}.", "success")
    await _notify(repo, "volunteer", "New task assigned", f"You were assigned to {issue_title or issue_id}.", "info")
    await _notify(repo, "user", "Responder assigned", f"{v_name or 'A volunteer'} has been assigned to your issue.", "success")
    
    return task

@router.post("/issues/update")
async def update_issue(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    issue_id = payload.get("issueId")

    if not issue_id:
        raise HTTPException(status_code=400, detail="issueId is required")

    # Remove issueId from payload before updating
    update_data = {k: v for k, v in payload.items() if k != "issueId"}

    updated_issue = await repo.update("issues", issue_id, update_data)

    if not updated_issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    return {
        "status": "success",
        "message": "Issue updated successfully",
        "data": updated_issue
    }
