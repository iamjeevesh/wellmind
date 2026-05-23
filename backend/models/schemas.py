# models/schemas.py
# Pydantic models define what data the API accepts and returns
# They automatically validate and serialize data

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    clerk_id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True  # Allows creating from SQLAlchemy models


# ============================================================
# MOOD LOG SCHEMAS
# ============================================================

class MoodLogCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10, description="Mood rating 1-10")
    stress_score: int = Field(..., ge=1, le=10, description="Stress rating 1-10")
    energy_score: Optional[int] = Field(None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    notes: Optional[str] = Field(None, max_length=500)

class MoodLogResponse(BaseModel):
    id: str
    user_id: str
    mood_score: int
    stress_score: int
    energy_score: Optional[int]
    sleep_hours: Optional[float]
    notes: Optional[str]
    burnout_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# CHAT SCHEMAS
# ============================================================

class ChatMessageCreate(BaseModel):
    session_id: str
    content: str = Field(..., min_length=1, max_length=2000)

class ChatMessageResponse(BaseModel):
    id: str
    user_id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=2000)

class ChatResponse(BaseModel):
    message: str
    session_id: str


# ============================================================
# JOURNAL SCHEMAS
# ============================================================

class JournalEntryCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=1, max_length=10000)
    mood_at_time: Optional[int] = Field(None, ge=1, le=10)
    tags: Optional[str] = None

class JournalEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_at_time: Optional[int] = None
    tags: Optional[str] = None

class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    title: Optional[str]
    content: str
    mood_at_time: Optional[int]
    ai_reflection: Optional[str]
    tags: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# FOCUS SESSION SCHEMAS
# ============================================================

class FocusSessionCreate(BaseModel):
    duration_minutes: int = Field(..., ge=1, le=120)
    session_type: str = "pomodoro"
    subject: Optional[str] = Field(None, max_length=200)

class FocusSessionComplete(BaseModel):
    actual_minutes: int
    completed: bool = True

class FocusSessionResponse(BaseModel):
    id: str
    user_id: str
    duration_minutes: int
    actual_minutes: Optional[int]
    session_type: str
    subject: Optional[str]
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# ANALYTICS/DASHBOARD SCHEMAS
# ============================================================

class MoodTrend(BaseModel):
    date: str
    mood_score: float
    stress_score: float
    energy_score: Optional[float]

class DashboardStats(BaseModel):
    current_burnout_score: Optional[float]
    burnout_category: Optional[dict]
    avg_mood_7d: Optional[float]
    avg_stress_7d: Optional[float]
    total_focus_minutes_7d: int
    journal_entries_count: int
    mood_trend: List[MoodTrend]
    today_checked_in: bool
    streak_days: int

class InsightResponse(BaseModel):
    type: str          # 'burnout', 'mood', 'sleep', 'focus'
    title: str
    message: str
    priority: str      # 'low', 'medium', 'high'
    icon: str
