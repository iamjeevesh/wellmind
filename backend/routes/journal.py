# routes/journal.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database.connection import get_db, JournalEntry, User
from models.schemas import JournalEntryCreate, JournalEntryUpdate, JournalEntryResponse
from middleware.auth import get_current_user
from ai.wellness_ai import generate_journal_insight
from typing import List

router = APIRouter(prefix="/journal", tags=["Journal"])


@router.post("/entries", response_model=JournalEntryResponse)
async def create_journal_entry(
    data: JournalEntryCreate,
    generate_insight: bool = True,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new journal entry, optionally with AI reflection."""
    
    ai_reflection = None
    if generate_insight and len(data.content) > 50:
        ai_reflection = await generate_journal_insight(data.content)
    
    entry = JournalEntry(
        user_id=user.id,
        title=data.title,
        content=data.content,
        mood_at_time=data.mood_at_time,
        tags=data.tags,
        ai_reflection=ai_reflection
    )
    
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/entries", response_model=List[JournalEntryResponse])
async def get_journal_entries(
    limit: int = 20,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get paginated journal entries for the user."""
    entries = db.query(JournalEntry)\
        .filter(JournalEntry.user_id == user.id)\
        .order_by(desc(JournalEntry.created_at))\
        .limit(limit)\
        .offset(offset)\
        .all()
    return entries


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry)\
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user.id)\
        .first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.delete("/entries/{entry_id}")
async def delete_journal_entry(
    entry_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(JournalEntry)\
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user.id)\
        .first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted"}
