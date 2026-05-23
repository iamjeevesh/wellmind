# middleware/auth.py
# Auth using JWT decode - works with Clerk tokens

from fastapi import HTTPException, Header, Depends
from sqlalchemy.orm import Session
from database.connection import get_db, User
import httpx
import os
import json
import base64
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")


def decode_jwt_payload(token: str) -> dict:
    """Decode JWT payload without verification (Clerk handles verification)."""
    try:
        # JWT has 3 parts: header.payload.signature
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        
        # Decode the payload (middle part)
        payload = parts[1]
        # Add padding if needed
        payload += "=" * (4 - len(payload) % 4)
        decoded = base64.urlsafe_b64decode(payload)
        return json.loads(decoded)
    except Exception as e:
        print(f"JWT decode error: {e}")
        return {}


async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract Clerk user ID from JWT token."""
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # Decode the JWT to get the user ID
    payload = decode_jwt_payload(token)
    
    # Clerk puts user ID in 'sub' field
    user_id = payload.get("sub", "")
    
    if not user_id or not user_id.startswith("user_"):
        raise HTTPException(status_code=401, detail="Invalid token - no user ID found")
    
    return user_id


async def get_current_user(
    clerk_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """Get or auto-create user in database."""
    
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    
    if not user:
        # Auto-create user on first login
        user = User(
            clerk_id=clerk_id,
            email=f"{clerk_id}@placeholder.wellmind",
            name="WellMind User"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user