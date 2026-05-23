# routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db, User
from models.schemas import UserCreate, UserResponse
from middleware.auth import get_current_user_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse)
async def register_user(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user (called after Clerk signup)."""
    
    # Check if user already exists
    existing = db.query(User).filter(User.clerk_id == data.clerk_id).first()
    if existing:
        return existing
    
    user = User(
        clerk_id=data.clerk_id,
        email=data.email,
        name=data.name,
        avatar_url=data.avatar_url
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get the current user's profile."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
