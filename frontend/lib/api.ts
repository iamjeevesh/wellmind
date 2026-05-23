// lib/api.ts
// Central API client — all backend calls go through here

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create an axios instance with base config
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Add auth token to every request automatically
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// ============================================================
// API FUNCTIONS — organized by feature
// ============================================================

// --- User ---
export const registerUser = (data: { clerk_id: string; email: string; name?: string }) =>
  apiClient.post('/users/register', data)

export const getCurrentUser = () =>
  apiClient.get('/users/me')


// --- Mood Check-ins ---
export const submitMoodCheckin = (data: {
  mood_score: number
  stress_score: number
  energy_score?: number
  sleep_hours?: number
  notes?: string
}) => apiClient.post('/mood/checkin', data)

export const getMoodHistory = (days = 30) =>
  apiClient.get(`/mood/history?days=${days}`)


// --- Dashboard ---
export const getDashboardStats = () =>
  apiClient.get('/dashboard/stats')

export const getWellnessInsights = () =>
  apiClient.get('/dashboard/insights')

export const getDailyPrompt = () =>
  apiClient.get('/dashboard/daily-prompt')


// --- Chat ---
export const sendChatMessage = (sessionId: string, message: string) =>
  apiClient.post('/chat/message', { session_id: sessionId, message })

export const getChatHistory = (sessionId: string) =>
  apiClient.get(`/chat/sessions/${sessionId}`)

export const createNewChatSession = () =>
  apiClient.post('/chat/new-session')


// --- Journal ---
export const createJournalEntry = (data: {
  title?: string
  content: string
  mood_at_time?: number
  tags?: string
}) => apiClient.post('/journal/entries', data)

export const getJournalEntries = (limit = 20, offset = 0) =>
  apiClient.get(`/journal/entries?limit=${limit}&offset=${offset}`)

export const deleteJournalEntry = (id: string) =>
  apiClient.delete(`/journal/entries/${id}`)


// --- Focus Sessions ---
export const startFocusSession = (data: {
  duration_minutes: number
  session_type?: string
  subject?: string
}) => apiClient.post('/focus/sessions', data)

export const completeFocusSession = (id: string, actual_minutes: number) =>
  apiClient.patch(`/focus/sessions/${id}/complete`, { actual_minutes, completed: true })

export const getFocusSessions = () =>
  apiClient.get('/focus/sessions')
