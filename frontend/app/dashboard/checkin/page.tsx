'use client'
// app/dashboard/checkin/page.tsx
// Daily mood and stress check-in form

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { submitMoodCheckin, setAuthToken } from '@/lib/api'
import { CheckCircle, Moon, Zap } from 'lucide-react'
import clsx from 'clsx'

const MOOD_EMOJIS = [
  { score: 1, emoji: '😞', label: 'Very Low' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😟', label: 'Kinda Low' },
  { score: 4, emoji: '😐', label: 'Neutral' },
  { score: 5, emoji: '🙂', label: 'Okay' },
  { score: 6, emoji: '😊', label: 'Pretty Good' },
  { score: 7, emoji: '😄', label: 'Good' },
  { score: 8, emoji: '😁', label: 'Great' },
  { score: 9, emoji: '🤩', label: 'Amazing' },
  { score: 10, emoji: '🥳', label: 'On Top of the World' },
]

const ScaleSlider = ({ 
  label, value, onChange, min = 1, max = 10, 
  lowLabel, highLabel, icon 
}: any) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-[var(--text-primary)]">{label}</span>
      </div>
      <span className="text-2xl font-bold text-sage-500">{value || '—'}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-muted)] w-16 text-right">{lowLabel}</span>
      <input
        type="range" min={min} max={max} step={1}
        value={value || 5}
        onChange={e => onChange(parseInt(e.target.value))}
        className="flex-1 accent-sage-500 cursor-pointer"
      />
      <span className="text-xs text-[var(--text-muted)] w-16">{highLabel}</span>
    </div>
    <div className="flex justify-between mt-1 px-16">
      {Array.from({ length: max - min + 1 }, (_, i) => (
        <span key={i} className={clsx(
          'text-xs',
          value === i + min ? 'text-sage-500 font-medium' : 'text-[var(--border-subtle)]'
        )}>
          {i + min}
        </span>
      ))}
    </div>
  </div>
)

export default function CheckinPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  
  const [mood, setMood] = useState<number>(5)
  const [stress, setStress] = useState<number>(5)
  const [energy, setEnergy] = useState<number>(5)
  const [sleep, setSleep] = useState<number>(7)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [burnoutResult, setBurnoutResult] = useState<number | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const token = await getToken()
      if (!token) return
      setAuthToken(token)

      const res = await submitMoodCheckin({
        mood_score: mood,
        stress_score: stress,
        energy_score: energy,
        sleep_hours: sleep,
        notes: notes || undefined,
      })

      setBurnoutResult(res.data.burnout_score)
      setDone(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    const burnoutLevel = burnoutResult !== undefined && burnoutResult !== null
      ? burnoutResult < 25 ? 'low' : burnoutResult < 50 ? 'moderate' : burnoutResult < 75 ? 'high' : 'critical'
      : 'unknown'
    
    const messages: Record<string, string> = {
      low: "You're doing well! Keep nurturing those good habits. 🌱",
      moderate: "Some strain showing. Small breaks and self-care make a real difference. 🌤️",
      high: "High stress detected. Please take time to rest and consider talking to someone. ⚠️",
      critical: "Please prioritize your wellbeing. You matter more than any deadline. 🔴",
      unknown: "Check-in saved successfully!"
    }

    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="font-display text-2xl font-light text-[var(--text-primary)] mb-3">
            Check-in Complete!
          </h2>
          {burnoutResult !== null && (
            <div className="mb-4">
              <p className="text-[var(--text-muted)] text-sm mb-1">Your burnout score today</p>
              <p className="text-4xl font-bold text-sage-500">{Math.round(burnoutResult)}</p>
              <p className="text-xs text-[var(--text-muted)]">out of 100</p>
            </div>
          )}
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            {messages[burnoutLevel]}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-sage"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="btn-ghost"
            >
              Talk to Sage
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="text-sage-500" size={24} />
          <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">
            Daily Check-in
          </h1>
        </div>
        <p className="text-[var(--text-secondary)]">
          A few minutes of reflection. How are you really doing today?
        </p>
      </div>

      <div className="space-y-5">
        
        {/* Mood Selector */}
        <div className="glass-card p-6">
          <p className="font-medium text-[var(--text-primary)] mb-4">
            How's your mood right now?
          </p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {MOOD_EMOJIS.map(({ score, emoji, label }) => (
              <button
                key={score}
                onClick={() => setMood(score)}
                title={label}
                className={clsx(
                  'mood-btn flex flex-col items-center',
                  mood === score && 'selected'
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-[var(--text-muted)] mt-0.5 hidden md:block">{score}</span>
              </button>
            ))}
          </div>
          {mood && (
            <p className="text-center text-sm text-sage-500 mt-3 font-medium">
              {MOOD_EMOJIS.find(m => m.score === mood)?.label} ({mood}/10)
            </p>
          )}
        </div>

        {/* Stress, Energy, Sleep Sliders */}
        <div className="glass-card p-6 space-y-7">
          <ScaleSlider
            label="Stress Level"
            value={stress}
            onChange={setStress}
            lowLabel="Very calm"
            highLabel="Very stressed"
            icon={<span className="text-lg">😰</span>}
          />
          <div className="border-t border-[var(--border-subtle)]" />
          <ScaleSlider
            label="Energy Level"
            value={energy}
            onChange={setEnergy}
            lowLabel="Exhausted"
            highLabel="Energized"
            icon={<Zap size={18} className="text-amber-500" />}
          />
          <div className="border-t border-[var(--border-subtle)]" />
          <ScaleSlider
            label="Sleep Last Night"
            value={sleep}
            onChange={setSleep}
            min={1}
            max={12}
            lowLabel="Very little"
            highLabel="A lot"
            icon={<Moon size={18} className="text-indigo-400" />}
          />
          {sleep && (
            <p className="text-center text-sm text-[var(--text-muted)]">
              {sleep} hours of sleep
            </p>
          )}
        </div>

        {/* Optional Notes */}
        <div className="glass-card p-6">
          <label className="block font-medium text-[var(--text-primary)] mb-3">
            Anything on your mind? <span className="text-[var(--text-muted)] font-normal text-sm">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What's going on today? What are you feeling?"
            maxLength={500}
            rows={3}
            className="input-wellmind resize-none"
          />
          <p className="text-xs text-[var(--text-muted)] text-right mt-1">{notes.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-sage w-full py-4 text-base rounded-2xl flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Submit Check-in
            </>
          )}
        </button>
      </div>
    </div>
  )
}
