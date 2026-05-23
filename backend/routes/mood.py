# routes/mood.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.connection import get_db, MoodLog, User
from models.schemas import MoodLogCreate, MoodLogResponse
from middleware.auth import get_current_user
from services.burnout_service import calculate_burnout_score
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/mood", tags=["Mood"])


@router.post("/checkin", response_model=MoodLogResponse)
async def create_mood_checkin(
    data: MoodLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a daily mood and stress check-in."""
    
    # Get recent logs for trend-based burnout calculation
    recent_logs = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id)\
        .order_by(desc(MoodLog.created_at))\
        .limit(5)\
        .all()
    
    recent_data = [{"stress_score": l.stress_score, "mood_score": l.mood_score} for l in recent_logs]
    
    # Calculate burnout score
    burnout = calculate_burnout_score(
        mood_score=data.mood_score,
        stress_score=data.stress_score,
        energy_score=data.energy_score,
        sleep_hours=data.sleep_hours,
        recent_logs=recent_data
    )
    
    log = MoodLog(
        user_id=user.id,
        mood_score=data.mood_score,
        stress_score=data.stress_score,
        energy_score=data.energy_score,
        sleep_hours=data.sleep_hours,
        notes=data.notes,
        burnout_score=burnout
    )
    
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history", response_model=List[MoodLogResponse])
async def get_mood_history(
    days: int = 30,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mood history for the past N days."""
    since = datetime.utcnow() - timedelta(days=days)
    logs = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id, MoodLog.created_at >= since)\
        .order_by(desc(MoodLog.created_at))\
        .all()
    return logs
