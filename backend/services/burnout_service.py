# services/burnout_service.py
# Calculates burnout risk scores based on mood log patterns
# This is a wellness INDICATOR, not a clinical diagnosis

from typing import List, Optional
from datetime import datetime, timedelta


def calculate_burnout_score(
    mood_score: int,
    stress_score: int,
    energy_score: Optional[int] = None,
    sleep_hours: Optional[float] = None,
    recent_logs: Optional[List[dict]] = None
) -> float:
    """
    Calculate a burnout risk score (0-100) from wellness indicators.
    
    Higher score = higher burnout risk
    
    Factors weighted:
    - Stress level (most important): 40%
    - Mood level: 30%
    - Energy level: 15%
    - Sleep quality: 15%
    
    This is a simplified wellness indicator. It is NOT a clinical tool.
    """
    
    # Convert 1-10 scales to risk (higher stress/lower mood = higher risk)
    stress_risk = ((stress_score - 1) / 9) * 40        # 0-40 points
    mood_risk = ((10 - mood_score) / 9) * 30           # 0-30 points (inverted)
    
    # Energy: low energy contributes to burnout
    if energy_score:
        energy_risk = ((10 - energy_score) / 9) * 15  # 0-15 points
    else:
        energy_risk = 7.5  # Default to middle if not provided
    
    # Sleep: under 6 hrs or over 10 hrs both contribute to burnout
    if sleep_hours:
        if sleep_hours < 6:
            sleep_risk = (1 - sleep_hours / 6) * 15   # Penalize low sleep
        elif sleep_hours > 9:
            sleep_risk = ((sleep_hours - 9) / 3) * 5  # Slight penalty for oversleeping
        else:
            sleep_risk = 0
    else:
        sleep_risk = 5  # Default
    
    base_score = stress_risk + mood_risk + energy_risk + sleep_risk
    
    # Boost score if there's a sustained trend (multiple bad days in a row)
    if recent_logs and len(recent_logs) >= 3:
        recent_avg_stress = sum(log.get("stress_score", 5) for log in recent_logs[-3:]) / 3
        recent_avg_mood = sum(log.get("mood_score", 5) for log in recent_logs[-3:]) / 3
        
        # If recent trend is worsening, add up to 15 bonus risk points
        if recent_avg_stress > 7 and recent_avg_mood < 4:
            base_score += 15
    
    # Clamp to 0-100 range
    return min(100, max(0, round(base_score, 1)))


def get_burnout_category(score: float) -> dict:
    """Return a human-readable burnout risk category and recommendations."""
    
    if score < 25:
        return {
            "level": "low",
            "label": "Doing Well 🌱",
            "color": "emerald",
            "message": "Your wellness indicators look healthy. Keep nurturing good habits!",
            "recommendations": [
                "Maintain your current sleep schedule",
                "Keep up with enjoyable activities outside studying",
                "Stay connected with friends and family",
            ]
        }
    elif score < 50:
        return {
            "level": "moderate",
            "label": "Some Strain 🌤️",
            "color": "amber",
            "message": "You're managing, but some stress is showing. Small adjustments can help.",
            "recommendations": [
                "Try a 10-minute walk today to reset your nervous system",
                "Review your schedule — are there tasks you can delegate or delay?",
                "Prioritize 7-8 hours of sleep tonight",
                "Connect with a friend or take a proper break away from screens",
            ]
        }
    elif score < 75:
        return {
            "level": "high",
            "label": "High Stress ⚠️",
            "color": "orange",
            "message": "Your stress and energy levels suggest you may be approaching burnout. It's important to slow down.",
            "recommendations": [
                "Schedule a genuine rest day this week — no studying",
                "Talk to someone you trust about how you're feeling",
                "Contact your university's academic advisor if workload feels unmanageable",
                "Try a 5-minute breathing exercise: inhale 4s, hold 4s, exhale 6s",
                "Consider speaking with a counselor",
            ]
        }
    else:
        return {
            "level": "critical",
            "label": "Burnout Risk 🔴",
            "color": "red",
            "message": "Your indicators suggest significant burnout risk. Please prioritize your wellbeing right now.",
            "recommendations": [
                "Please speak with a mental health professional or counselor",
                "Contact your university's student support services",
                "Take an immediate break from non-essential commitments",
                "Tell someone you trust how you're feeling",
                "Remember: your health is more important than any grade or deadline",
            ]
        }
