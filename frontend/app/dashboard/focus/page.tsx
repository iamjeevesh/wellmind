'use client'
// app/dashboard/focus/page.tsx
// Pomodoro timer with focus session tracking

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { startFocusSession, completeFocusSession, getFocusSessions, setAuthToken } from '@/lib/api'
import { FocusSession } from '@/types'
import { Timer, Play, Pause, RotateCcw, CheckCircle, Coffee } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

const MODES: Record<TimerMode, { label: string; minutes: number; color: string; emoji: string }> = {
  focus:      { label: 'Focus',       minutes: 25, color: '#3d8750', emoji: '🍅' },
  shortBreak: { label: 'Short Break', minutes: 5,  color: '#8b5cf6', emoji: '☕' },
  longBreak:  { label: 'Long Break',  minutes: 15, color: '#0ea5e9', emoji: '🌊' },
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function FocusPage() {
  const { getToken } = useAuth()
  const [mode, setMode] = useState<TimerMode>('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(0) // pomodoros done this session
  const [subject, setSubject] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  // Load past sessions
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const res = await getFocusSessions()
        setSessions(res.data)
      } catch {}
      finally { setLoadingSessions(false) }
    }
    load()
  }, [getToken])

  // Update document title with timer
  useEffect(() => {
    document.title = running 
      ? `${formatTime(secondsLeft)} — ${MODES[mode].label} | WellMind`
      : 'Focus Timer | WellMind'
    return () => { document.title = 'WellMind' }
  }, [secondsLeft, running, mode])

  // Timer countdown
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            handleTimerComplete()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const playDing = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(528, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1)
    } catch {}
  }

  const handleTimerComplete = async () => {
    setRunning(false)
    playDing()

    if (mode === 'focus' && sessionId && startTime) {
      const actualMinutes = Math.round((Date.now() - startTime) / 60000)
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const res = await completeFocusSession(sessionId, actualMinutes)
        setSessions(prev => [res.data, ...prev])
      } catch {}
      setCompleted(c => c + 1)
      setSessionId(null)
    }
  }

  const handleStart = async () => {
    if (mode === 'focus' && !sessionId) {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const res = await startFocusSession({
          duration_minutes: MODES[mode].minutes,
          session_type: 'pomodoro',
          subject: subject || undefined,
        })
        setSessionId(res.data.id)
        setStartTime(Date.now())
      } catch { setSessionId(crypto.randomUUID()); setStartTime(Date.now()) }
    }
    setRunning(true)
  }

  const handleReset = () => {
    setRunning(false)
    setSecondsLeft(MODES[mode].minutes * 60)
    setSessionId(null)
    setStartTime(null)
  }

  const switchMode = (newMode: TimerMode) => {
    setRunning(false)
    setMode(newMode)
    setSecondsLeft(MODES[newMode].minutes * 60)
    setSessionId(null)
  }

  const progress = 1 - secondsLeft / (MODES[mode].minutes * 60)
  const circumference = 2 * Math.PI * 110
  const strokeDash = circumference * (1 - progress)
  const modeConfig = MODES[mode]

  const todayMinutes = sessions
    .filter(s => s.completed && new Date(s.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + (s.actual_minutes || s.duration_minutes), 0)

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Timer className="text-sage-500" size={24} />
        <div>
          <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">Focus Timer</h1>
          <p className="text-sm text-[var(--text-secondary)]">Pomodoro technique for deep work</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="glass-card p-1.5 flex gap-1 mb-6 rounded-2xl">
        {(Object.entries(MODES) as [TimerMode, typeof MODES[TimerMode]][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={clsx(
              'flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all',
              mode === key
                ? 'bg-[var(--bg-glass-strong)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            {val.emoji} {val.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="glass-card p-10 flex flex-col items-center mb-6">
        
        <div className="relative mb-8">
          <svg width="280" height="280" className="transform -rotate-90">
            <circle cx="140" cy="140" r="110" fill="none" stroke="var(--border-subtle)" strokeWidth="8"/>
            <circle
              cx="140" cy="140" r="110"
              fill="none"
              stroke={modeConfig.color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl mb-1">{modeConfig.emoji}</span>
            <span className="text-5xl font-mono font-bold text-[var(--text-primary)] tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-sm text-[var(--text-muted)] mt-1">{modeConfig.label}</span>
          </div>
        </div>

        {/* Subject input */}
        {mode === 'focus' && !running && (
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="What are you working on? (optional)"
            className="input-wellmind mb-5 text-center text-sm"
            maxLength={100}
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={running ? () => setRunning(false) : handleStart}
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: modeConfig.color, boxShadow: `0 8px 24px ${modeConfig.color}40` }}
          >
            {running ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>

          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
            <span className="text-sm font-bold text-[var(--text-primary)]">{completed}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-4">
          {completed > 0 ? `${completed} pomodoro${completed > 1 ? 's' : ''} completed this session` : 'Press play to start focusing'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-sage-500">{completed}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Today's Pomodoros</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {todayMinutes >= 60 ? `${Math.floor(todayMinutes/60)}h ${todayMinutes%60}m` : `${todayMinutes}m`}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Focus Time Today</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{sessions.filter(s => s.completed).length}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Total Sessions</p>
        </div>
      </div>

      {/* Technique Tip */}
      <div className="glass-card p-4 mb-6">
        <p className="text-xs font-medium text-sage-500 mb-1.5">📚 Pomodoro Technique</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Work for 25 minutes, then take a 5-minute break. After 4 pomodoros, take a longer 15-minute break. 
          This rhythm helps maintain focus while preventing mental fatigue.
        </p>
      </div>

      {/* Past Sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {sessions.slice(0, 8).map(session => (
              <div key={session.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-8 h-8 rounded-xl flex items-center justify-center text-sm',
                    session.completed ? 'bg-sage-500/10' : 'bg-[var(--border-subtle)]'
                  )}>
                    {session.completed ? '✅' : '⏸️'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {session.subject || 'Focus Session'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {format(new Date(session.created_at), 'MMM d · h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {session.actual_minutes || session.duration_minutes}m
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {session.completed ? 'completed' : 'incomplete'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
