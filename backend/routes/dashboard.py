# routes/dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database.connection import get_db, MoodLog, JournalEntry, FocusSession, User
from models.schemas import DashboardStats, MoodTrend, InsightResponse
from middleware.auth import get_current_user
from services.burnout_service import get_burnout_category
from ai.wellness_ai import generate_daily_prompt
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stats needed for the dashboard."""
    
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Recent mood logs (7 days)
    recent_logs = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id, MoodLog.created_at >= seven_days_ago)\
        .order_by(MoodLog.created_at)\
        .all()
    
    # Latest burnout score
    latest_log = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id)\
        .order_by(desc(MoodLog.created_at))\
        .first()
    
    burnout_score = latest_log.burnout_score if latest_log else None
    burnout_category = get_burnout_category(burnout_score) if burnout_score is not None else None
    
    # Averages
    avg_mood = sum(l.mood_score for l in recent_logs) / len(recent_logs) if recent_logs else None
    avg_stress = sum(l.stress_score for l in recent_logs) / len(recent_logs) if recent_logs else None
    
    # Focus minutes this week
    focus_sessions = db.query(FocusSession)\
        .filter(
            FocusSession.user_id == user.id,
            FocusSession.created_at >= seven_days_ago,
            FocusSession.completed == True
        ).all()
    
    total_focus_minutes = sum(
        s.actual_minutes or s.duration_minutes for s in focus_sessions
    )
    
    # Journal count
    journal_count = db.query(JournalEntry)\
        .filter(JournalEntry.user_id == user.id)\
        .count()
    
    # Checked in today?
    today_checkin = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id, MoodLog.created_at >= today_start)\
        .first()
    
    # Mood trend for chart
    mood_trend = [
        MoodTrend(
            date=log.created_at.strftime("%m/%d"),
            mood_score=float(log.mood_score),
            stress_score=float(log.stress_score),
            energy_score=float(log.energy_score) if log.energy_score else None
        )
        for log in recent_logs
    ]
    
    # Calculate streak
    streak = calculate_streak(user.id, db)
    
    return DashboardStats(
        current_burnout_score=burnout_score,
        burnout_category=burnout_category,
        avg_mood_7d=round(avg_mood, 1) if avg_mood else None,
        avg_stress_7d=round(avg_stress, 1) if avg_stress else None,
        total_focus_minutes_7d=total_focus_minutes,
        journal_entries_count=journal_count,
        mood_trend=mood_trend,
        today_checked_in=today_checkin is not None,
        streak_days=streak
    )


def calculate_streak(user_id: str, db: Session) -> int:
    """Calculate consecutive days with check-ins."""
    streak = 0
    check_date = datetime.utcnow().date()
    
    for _ in range(30):  # Max 30 day streak check
        day_start = datetime.combine(check_date, datetime.min.time())
        day_end = datetime.combine(check_date, datetime.max.time())
        
        log = db.query(MoodLog)\
            .filter(
                MoodLog.user_id == user_id,
                MoodLog.created_at >= day_start,
                MoodLog.created_at <= day_end
            ).first()
        
        if log:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return streak


@router.get("/insights", response_model=List[InsightResponse])
async def get_wellness_insights(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate personalized wellness insights from recent data."""
    insights = []
    
    recent_logs = db.query(MoodLog)\
        .filter(MoodLog.user_id == user.id)\
        .order_by(desc(MoodLog.created_at))\
        .limit(7)\
        .all()
    
    if not recent_logs:
        return [InsightResponse(
            type="onboarding",
            title="Welcome to WellMind!",
            message="Start by completing a daily check-in to get personalized insights.",
            priority="medium",
            icon="🌱"
        )]
    
    # Check sleep patterns
    sleep_logs = [l for l in recent_logs if l.sleep_hours]
    if sleep_logs:
        avg_sleep = sum(l.sleep_hours for l in sleep_logs) / len(sleep_logs)
        if avg_sleep < 6.5:
            insights.append(InsightResponse(
                type="sleep",
                title="Sleep Needs Attention",
                message=f"Your average sleep this week is {avg_sleep:.1f} hrs. Aim for 7-9 hours — sleep is foundational for focus and mood.",
                priority="high",
                icon="😴"
            ))
    
    # Check stress trend
    if len(recent_logs) >= 3:
        avg_stress = sum(l.stress_score for l in recent_logs[:3]) / 3
        if avg_stress >= 7:
            insights.append(InsightResponse(
                type="stress",
                title="Elevated Stress Pattern",
                message="Your stress has been high for a few days. Even 5 minutes of deep breathing or a short walk can help reset your nervous system.",
                priority="high",
                icon="🫁"
            ))
    
    # Positive mood insight
    if recent_logs and recent_logs[0].mood_score >= 7:
        insights.append(InsightResponse(
            type="mood",
            title="You're Doing Well!",
            message="Your mood today looks good. Take a moment to notice what's contributing to this — it can help you recreate it.",
            priority="low",
            icon="✨"
        ))
    
    # Focus encouragement
    insights.append(InsightResponse(
        type="focus",
        title="Try a Pomodoro Session",
        message="A focused 25-minute session followed by a 5-minute break can dramatically improve productivity. Give it a try today!",
        priority="low",
        icon="🍅"
    ))
    
    return insights[:4]  # Return top 4 insights


@router.get("/daily-prompt")
async def get_daily_prompt():
    """Get today's reflection prompt."""
    prompt = await generate_daily_prompt()
    return {"prompt": prompt}
