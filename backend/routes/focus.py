# routes/focus.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.connection import get_db, FocusSession, User
from models.schemas import FocusSessionCreate, FocusSessionComplete, FocusSessionResponse
from middleware.auth import get_current_user
from typing import List

router = APIRouter(prefix="/focus", tags=["Focus"])


@router.post("/sessions", response_model=FocusSessionResponse)
async def start_focus_session(
    data: FocusSessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new focus session."""
    session = FocusSession(
        user_id=user.id,
        duration_minutes=data.duration_minutes,
        session_type=data.session_type,
        subject=data.subject,
        completed=False
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.patch("/sessions/{session_id}/complete", response_model=FocusSessionResponse)
async def complete_focus_session(
    session_id: str,
    data: FocusSessionComplete,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a focus session as complete."""
    session = db.query(FocusSession)\
        .filter(FocusSession.id == session_id, FocusSession.user_id == user.id)\
        .first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.actual_minutes = data.actual_minutes
    session.completed = data.completed
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions", response_model=List[FocusSessionResponse])
async def get_focus_sessions(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent focus sessions."""
    sessions = db.query(FocusSession)\
        .filter(FocusSession.user_id == user.id)\
        .order_by(desc(FocusSession.created_at))\
        .limit(limit)\
        .all()
    return sessions
