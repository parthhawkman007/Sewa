from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from app.db.repository import BaseRepository, get_repository
from datetime import datetime

router = APIRouter(tags=["chat_notifications"])

@router.get("/notifications", response_model=List[Dict[str, Any]])
async def list_notifications(role: Optional[str] = None, repo: BaseRepository = Depends(get_repository)):
    notifications = await repo.get_all("notifications")
    if role:
        return [n for n in notifications if n.get("role") == "all" or n.get("role") == role]
    return notifications

@router.post("/notifications/read")
async def mark_notification_read(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    notif_id = payload.get("id")
    await repo.update("notifications", str(notif_id), {"read": True})
    return {"ok": True}

@router.post("/notifications/create")
async def create_notification(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    payload["id"] = int(datetime.now().timestamp())
    payload["read"] = False
    payload["createdAt"] = datetime.now().strftime("%H:%M")
    return await repo.create("notifications", payload)

@router.get("/chat/threads", response_model=List[Dict[str, Any]])
async def list_chat_threads(role: Optional[str] = None, repo: BaseRepository = Depends(get_repository)):
    threads = await repo.get_all("chat_threads")
    if role:
        return [t for t in threads if role in t.get("participants", [])]
    return threads

@router.get("/chat/threads/{thread_id}/messages")
async def get_messages(thread_id: str, repo: BaseRepository = Depends(get_repository)):
    thread = await repo.get_by_id("chat_threads", thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread.get("messages", [])

@router.post("/chat/send")
async def send_message(payload: Dict[str, Any], repo: BaseRepository = Depends(get_repository)):
    thread_id = payload.get("threadId")
    now = datetime.now().strftime("%H:%M")
    
    message = {
        "id": f"MSG-{int(datetime.now().timestamp())}",
        "senderRole": payload.get("senderRole"),
        "senderName": payload.get("senderName"),
        "text": payload.get("text"),
        "time": now
    }
    
    thread = await repo.get_by_id("chat_threads", thread_id)
    if thread:
        messages = thread.get("messages", [])
        messages.append(message)
        await repo.update("chat_threads", thread_id, {"messages": messages})
    
    return message
