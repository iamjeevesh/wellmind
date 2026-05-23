# routes/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.connection import get_db, ChatMessage, MoodLog, User
from models.schemas import ChatRequest, ChatResponse, ChatMessageResponse
from middleware.auth import get_current_user
from ai.wellness_ai import chat_with_ai
from typing import List
import uuid

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI wellness assistant."""
    
    # Get conversation history for this session (last 20 messages)
    history = db.query(ChatMessage)\
        .filter(
            ChatMessage.user_id == user.id,
            ChatMessage.session_id == request.session_id
        )\
        .order_by(ChatMessage.created_at)\
        .limit(20)\
        .all()
    
    conversation_history = [{"role": m.role, "content": m.content} for m in history]
    
    # Build user context from recent wellness data
    recent_mood = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id)\
        .order_by(desc(MoodLog.created_at))\
        .first()
    
    user_data = {}
    if recent_mood:
        user_data["recent_mood"] = {
            "mood_score": recent_mood.mood_score,
            "stress_score": recent_mood.stress_score,
            "energy_score": recent_mood.energy_score,
        }
        user_data["burnout_score"] = recent_mood.burnout_score
    
    # Save user message
    user_msg = ChatMessage(
        user_id=user.id,
        session_id=request.session_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    
    # Get AI response
    ai_response = await chat_with_ai(
        user_message=request.message,
        conversation_history=conversation_history,
        user_data=user_data if user_data else None
    )
    
    # Save AI response
    ai_msg = ChatMessage(
        user_id=user.id,
        session_id=request.session_id,
        role="assistant",
        content=ai_response
    )
    db.add(ai_msg)
    db.commit()
    
    return ChatResponse(message=ai_response, session_id=request.session_id)


@router.get("/sessions/{session_id}", response_model=List[ChatMessageResponse])
async def get_session_history(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages in a chat session."""
    messages = db.query(ChatMessage)\
        .filter(
            ChatMessage.user_id == user.id,
            ChatMessage.session_id == session_id
        )\
        .order_by(ChatMessage.created_at)\
        .all()
    return messages


@router.post("/new-session")
async def create_new_session(user: User = Depends(get_current_user)):
    """Generate a new session ID for a fresh conversation."""
    return {"session_id": str(uuid.uuid4())}
