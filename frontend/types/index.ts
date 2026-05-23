// types/index.ts
// Shared TypeScript types across the frontend

export interface User {
  id: string
  clerk_id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  mood_score: number      // 1-10
  stress_score: number    // 1-10
  energy_score?: number   // 1-10
  sleep_hours?: number
  notes?: string
  burnout_score?: number  // 0-100
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  title?: string
  content: string
  mood_at_time?: number
  ai_reflection?: string
  tags?: string
  created_at: string
  updated_at?: string
}

export interface FocusSession {
  id: string
  user_id: string
  duration_minutes: number
  actual_minutes?: number
  session_type: string
  subject?: string
  completed: boolean
  created_at: string
}

export interface MoodTrend {
  date: string
  mood_score: number
  stress_score: number
  energy_score?: number
}

export interface BurnoutCategory {
  level: 'low' | 'moderate' | 'high' | 'critical'
  label: string
  color: string
  message: string
  recommendations: string[]
}

export interface DashboardStats {
  current_burnout_score?: number
  burnout_category?: BurnoutCategory
  avg_mood_7d?: number
  avg_stress_7d?: number
  total_focus_minutes_7d: number
  journal_entries_count: number
  mood_trend: MoodTrend[]
  today_checked_in: boolean
  streak_days: number
}

export interface WellnessInsight {
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  icon: string
}
