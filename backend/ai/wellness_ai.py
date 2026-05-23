# ai/wellness_ai.py
# Handles all AI interactions — the brain of WellMind
# Uses OpenAI's API with a carefully crafted wellness-focused system prompt

from groq import Groq
from dotenv import load_dotenv
import os
from typing import List, Dict, Optional

load_dotenv()

# Initialize the OpenAI client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# ============================================================
# SYSTEM PROMPT — Defines the AI assistant's personality
# This is carefully designed for emotional safety
# ============================================================
WELLNESS_SYSTEM_PROMPT = """You are an emotionally supportive AI wellness coach for students. Your name is Sage.

Your role is to help students manage:
- stress and academic pressure
- burnout and exhaustion
- procrastination and focus struggles
- emotional overwhelm
- productivity challenges
- work-life balance

You are NOT:
- a licensed therapist
- a doctor or psychiatrist
- a mental health professional

IMPORTANT RULES:
- Never diagnose mental illnesses
- Never prescribe or suggest medication
- Never claim certainty about psychological conditions
- Always clarify you're an AI wellness support tool, not a therapist

Your tone should be:
- calm, warm, and grounding
- supportive without being patronizing
- encouraging without toxic positivity
- non-judgmental and validating
- conversational and approachable
- concise but thoughtful (usually 2-4 paragraphs max)

Your goals:
1. Help students reflect on their emotions and patterns
2. Encourage healthy habits (sleep, movement, breaks, connection)
3. Reduce burnout with practical, evidence-inspired strategies
4. Improve focus and productivity through gentle accountability
5. Promote self-awareness and balance

Behavioral guidelines:
- Validate emotions first, then offer perspective
- Avoid toxic positivity ("Just think positive!")
- Don't create dependency ("I'm always here for you" implies reliance)
- Encourage real human support and professional help when needed
- Ask one reflective follow-up question occasionally
- Use "I notice..." and "It sounds like..." language
- Reference concepts from CBT, mindfulness, and habit science naturally — but don't present as clinical

CRISIS PROTOCOL — If a student mentions:
- thoughts of self-harm or suicide
- feeling completely hopeless
- wanting to hurt themselves or others

IMMEDIATELY:
1. Acknowledge their pain with compassion
2. Gently but clearly encourage them to reach out to:
   - A trusted person (friend, family, counselor)
   - Crisis resources: National Crisis Hotline 988 (US)
   - Their university's counseling center
3. Do NOT try to handle a mental health crisis yourself
4. Do NOT give detailed psychological advice in a crisis

Context from the student's data may be provided. Use it to personalize your responses.

Remember: Your role is to be a calm, supportive presence — like a wise friend who knows a bit about wellness — not a medical authority."""


# Crisis keywords to detect distress signals
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "don't want to live",
    "self-harm", "hurt myself", "cutting", "worthless and hopeless",
    "can't go on", "no point in living", "better off dead"
]


def detect_crisis(message: str) -> bool:
    """Check if a message contains crisis-related content."""
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in CRISIS_KEYWORDS)


def build_context_summary(user_data: Optional[Dict] = None) -> str:
    """
    Build a context string from user's recent data.
    This gives the AI memory of the student's recent state.
    """
    if not user_data:
        return ""
    
    context_parts = []
    
    if user_data.get("recent_mood"):
        mood = user_data["recent_mood"]
        context_parts.append(
            f"Student's recent check-in: mood {mood.get('mood_score')}/10, "
            f"stress {mood.get('stress_score')}/10, "
            f"energy {mood.get('energy_score', 'N/A')}/10."
        )
    
    if user_data.get("burnout_score") is not None:
        score = user_data["burnout_score"]
        risk = "low" if score < 30 else "moderate" if score < 60 else "high"
        context_parts.append(f"Current burnout risk level: {risk} ({score:.0f}/100).")
    
    if user_data.get("recent_journal"):
        context_parts.append(
            f"Recently journaled about: {user_data['recent_journal']}"
        )
    
    if user_data.get("focus_sessions_today"):
        context_parts.append(
            f"Completed {user_data['focus_sessions_today']} focus session(s) today."
        )
    
    if context_parts:
        return "\n\nStudent context (use to personalize your response):\n" + "\n".join(context_parts)
    
    return ""


async def chat_with_ai(
    user_message: str,
    conversation_history: List[Dict[str, str]],
    user_data: Optional[Dict] = None
) -> str:
    """
    Send a message to the AI and get a supportive response.
    
    Args:
        user_message: The student's current message
        conversation_history: Previous messages in this session [{role, content}]
        user_data: Optional context about the user's recent wellness data
    
    Returns:
        AI response string
    """
    
    # Check for crisis first
    if detect_crisis(user_message):
        return get_crisis_response()
    
    # Build context from user data
    context_addition = build_context_summary(user_data)
    
    # Construct the full system prompt with user context
    system_prompt = WELLNESS_SYSTEM_PROMPT + context_addition
    
    # Build message list: system + history + new message
    messages = [{"role": "system", "content": system_prompt}]
    
    # Include recent conversation history (last 10 messages for context)
    recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
    messages.extend(recent_history)
    
    # Add the new user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=600,
            temperature=0.7,  # Slightly creative but grounded
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return (
            "I'm having a little trouble connecting right now. "
            "Please try again in a moment. If you're in distress, "
            "please reach out to a trusted person or counselor."
        )


def get_crisis_response() -> str:
    """Return a compassionate crisis response that encourages real help."""
    return (
        "I hear that you're going through something really difficult right now, "
        "and I'm glad you reached out. What you're feeling matters deeply.\n\n"
        "I'm an AI, which means I'm not equipped to give you the level of support "
        "you deserve right now. Please reach out to someone who can truly be there for you:\n\n"
        "🆘 **Crisis Hotline:** Call or text **988** (Suicide & Crisis Lifeline, US)\n"
        "💙 **Your university's counseling center** — they're there for exactly this\n"
        "🤝 **A trusted person** — a friend, family member, or mentor\n\n"
        "You don't have to carry this alone. Real human support is the most important "
        "thing right now. Please reach out to them."
    )


async def generate_journal_insight(journal_content: str) -> str:
    """
    Generate a gentle, reflective AI insight for a journal entry.
    Not therapy — just a thoughtful reflection prompt.
    """
    prompt = f"""A student shared this journal entry. Write a brief, warm reflection (2-3 sentences) 
that validates their experience and offers one gentle, open-ended question for deeper reflection. 
Do NOT give advice. Do NOT diagnose. Be like a compassionate friend.

Journal entry:
{journal_content[:1000]}"""  # Limit to prevent token overflow

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a compassionate wellness reflection guide. Be brief, warm, and non-clinical."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Journal insight error: {e}")
        return "Thank you for taking the time to reflect. Writing itself is a powerful act of self-care."


async def generate_daily_prompt() -> str:
    """Generate a daily reflection prompt for check-in or journaling."""
    prompts = [
        "What's one thing you're grateful for today, even if it's small?",
        "What drained your energy most this week, and what gave it back?",
        "If you could tell your past self one thing about this week, what would it be?",
        "What's something you're proud of accomplishing recently, even if it seems small?",
        "What does your body need most right now — rest, movement, nourishment, or connection?",
        "What's one habit you'd like to build or let go of this month?",
        "When did you last feel truly present? What were you doing?",
        "What academic pressure are you carrying that might not actually be yours to carry?",
        "What would 'good enough' look like for your goals today?",
        "Who in your life makes you feel most like yourself?",
    ]
    
    import random
    return random.choice(prompts)
