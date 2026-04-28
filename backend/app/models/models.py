from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    USER = "user"
    VOLUNTEER = "volunteer"
    NGO = "ngo"

class IssueStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    PENDING_REVIEW = "Pending Review"

class TaskStatus(str, Enum):
    QUEUED = "queued"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    COMPLETED = "completed"

class Location(BaseModel):
    lat: float
    lng: float
    label: str

class Coordinates(BaseModel):
    x: int
    y: int

class IssueUpdate(BaseModel):
    label: str
    time: str

class Issue(BaseModel):
    id: str
    title: str
    description: str
    category: str
    urgency: int
    priority: str
    status: IssueStatus
    emergency: bool
    reportedBy: str
    locationName: str
    location: Optional[Location] = None
    coordinates: Optional[Coordinates] = None
    distanceKm: Optional[float] = 0.0
    requiredSkills: List[str] = []
    mediaUrls: List[str] = []
    createdAt: str
    updates: List[IssueUpdate] = []

class Volunteer(BaseModel):
    id: str
    name: str
    skills: List[str] = []
    distanceKm: float
    availability: str # "Online", "Busy", "Offline"
    tasksCompleted: int
    reliability: int
    rating: float
    responseTime: str

class Task(BaseModel):
    id: str
    issueId: str
    volunteerId: Optional[str] = None
    status: TaskStatus
    startTime: Optional[str] = None
    completionTime: Optional[str] = None
    routeEta: Optional[str] = None
    reminderAt: Optional[str] = None

class Notification(BaseModel):
    id: int
    title: str
    message: str
    type: str # "success", "warning", "info"
    read: bool
    createdAt: str
    role: str # "all", "user", "volunteer", "ngo"

class ChatMessage(BaseModel):
    id: str
    senderRole: str
    senderName: str
    text: str
    time: str

class ChatThread(BaseModel):
    id: str
    participants: List[str]
    title: str
    messages: List[ChatMessage] = []

class UserProfile(BaseModel):
    id: str
    name: str
    role: UserRole
    email: str
    location: Optional[str] = None
    trustScore: Optional[int] = None
    organization: Optional[str] = None
    organizationType: Optional[str] = None
    skills: Optional[List[str]] = None
    maxDistance: Optional[float] = None
    rating: Optional[float] = None
