# database/connection.py
# Manages the PostgreSQL database connection using SQLAlchemy

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from dotenv import load_dotenv
import os
import uuid
from database.connection import Base, engine
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wellmind")

# Create the database engine (connection pool)
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

# SessionLocal: used to create database sessions for each request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
Base = declarative_base()


# ============================================================
# DATABASE MODELS — These define the structure of each table
# ============================================================

class User(Base):
    """Stores user profile information."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String, unique=True, nullable=False)  # Clerk user ID
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships — lets us access related records easily
    mood_logs = relationship("MoodLog", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")


class MoodLog(Base):
    """Records daily mood and stress check-ins."""
    __tablename__ = "mood_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    mood_score = Column(Integer, nullable=False)       # 1-10 scale
    stress_score = Column(Integer, nullable=False)     # 1-10 scale
    energy_score = Column(Integer, nullable=True)      # 1-10 scale
    sleep_hours = Column(Float, nullable=True)         # Hours of sleep
    notes = Column(Text, nullable=True)                # Optional notes
    burnout_score = Column(Float, nullable=True)       # Calculated burnout risk
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mood_logs")


class ChatMessage(Base):
    """Stores conversation history with the AI assistant."""
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, nullable=False)        # Groups messages into conversations
    role = Column(String, nullable=False)              # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chat_messages")


class JournalEntry(Base):
    """Stores private journal entries with optional AI reflection."""
    __tablename__ = "journal_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    mood_at_time = Column(Integer, nullable=True)      # Mood when writing
    ai_reflection = Column(Text, nullable=True)        # AI-generated insight
    tags = Column(String, nullable=True)               # Comma-separated tags
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="journal_entries")


class FocusSession(Base):
    """Tracks Pomodoro and focus session data."""
    __tablename__ = "focus_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    duration_minutes = Column(Integer, nullable=False)     # Planned duration
    actual_minutes = Column(Integer, nullable=True)        # Actual time worked
    session_type = Column(String, default="pomodoro")      # 'pomodoro' or 'custom'
    subject = Column(String, nullable=True)                # What they studied
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="focus_sessions")


# FastAPI dependency — gives each request its own DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
