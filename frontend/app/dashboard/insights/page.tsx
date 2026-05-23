'use client'
// app/dashboard/insights/page.tsx
// Personalized wellness insights and burnout recommendations

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getDashboardStats, getWellnessInsights, getMoodHistory, setAuthToken } from '@/lib/api'
import { DashboardStats, WellnessInsight, MoodLog } from '@/types'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts'
import { Lightbulb, TrendingUp, AlertTriangle, Heart, Activity } from 'lucide-react'
import clsx from 'clsx'
import { get_burnout_category } from '@/lib/burnout'

// Burnout level colors
const PRIORITY_STYLES: Record<string, string> = {
  high:   'border-l-4 border-orange-400 bg-orange-500/5',
  medium: 'border-l-4 border-amber-400 bg-amber-500/5',
  low:    'border-l-4 border-sage-400 bg-sage-500/5',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm">
        <p className="text-[var(--text-muted)] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function InsightsPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<WellnessInsight[]>([])
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const [statsRes, insightsRes, moodRes] = await Promise.all([
          getDashboardStats(),
          getWellnessInsights(),
          getMoodHistory(14),
        ])
        setStats(statsRes.data)
        setInsights(insightsRes.data)
        setMoodHistory(moodRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  // Build wellness radar data
  const radarData = stats ? [
    { subject: 'Mood',    A: stats.avg_mood_7d || 5,   fullMark: 10 },
    { subject: 'Energy',  A: 10 - ((stats.current_burnout_score || 50) / 100 * 4 + 3), fullMark: 10 },
    { subject: 'Balance', A: stats.streak_days >= 5 ? 8 : stats.streak_days * 1.2, fullMark: 10 },
    { subject: 'Focus',   A: Math.min(10, (stats.total_focus_minutes_7d / 60) * 1.5), fullMark: 10 },
    { subject: 'Calm',    A: stats.avg_stress_7d ? 11 - stats.avg_stress_7d : 5, fullMark: 10 },
  ] : []

  // Sleep pattern data
  const sleepData = moodHistory
    .filter(m => m.sleep_hours)
    .slice(0, 10)
    .reverse()
    .map(m => ({
      date: new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sleep: m.sleep_hours,
      mood: m.mood_score,
    }))

  const burnoutCategory = stats?.burnout_category

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-48 mb-6" />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Lightbulb className="text-sage-500" size={24} />
        <div>
          <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">Insights</h1>
          <p className="text-sm text-[var(--text-secondary)]">Your personalized wellness analysis</p>
        </div>
      </div>

      {/* No data yet */}
      {!stats?.mood_trend?.length && (
        <div className="glass-card p-10 text-center">
          <Activity size={48} className="mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
          <p className="text-[var(--text-secondary)] font-medium mb-1">Not enough data yet</p>
          <p className="text-sm text-[var(--text-muted)]">
            Complete a few daily check-ins to unlock personalized insights.
          </p>
        </div>
      )}

      {/* Burnout Status */}
      {burnoutCategory && (
        <div className={clsx(
          'glass-card p-6',
          burnoutCategory.level === 'low' ? 'border-l-4 border-sage-400' :
          burnoutCategory.level === 'moderate' ? 'border-l-4 border-amber-400' :
          burnoutCategory.level === 'high' ? 'border-l-4 border-orange-400' :
          'border-l-4 border-red-400'
        )}>
          <div className="flex items-start gap-4">
            <div className="text-3xl">
              {burnoutCategory.level === 'low' ? '🌱' :
               burnoutCategory.level === 'moderate' ? '🌤️' :
               burnoutCategory.level === 'high' ? '⚠️' : '🔴'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-[var(--text-primary)]">{burnoutCategory.label}</h2>
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  {Math.round(stats!.current_burnout_score!)}<span className="text-sm font-normal text-[var(--text-muted)]">/100</span>
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 leading-relaxed">
                {burnoutCategory.message}
              </p>
              <div className="space-y-1.5">
                {burnoutCategory.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-sage-400 mt-0.5 flex-shrink-0">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Radar */}
      {radarData.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Wellness Overview
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              />
              <Radar
                name="Wellness"
                dataKey="A"
                stroke="#3d8750"
                fill="#3d8750"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-[var(--text-muted)] text-center mt-2">
            Based on your last 7 days of data
          </p>
        </div>
      )}

      {/* Mood vs Sleep Chart */}
      {sleepData.length > 2 && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Sleep vs Mood Correlation
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sleepData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              <Line
                type="monotone" dataKey="sleep" name="Sleep (hrs)"
                stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }}
              />
              <Line
                type="monotone" dataKey="mood" name="Mood (/10)"
                stroke="#3d8750" strokeWidth={2.5} dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Personalized Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Personalized Recommendations
          </h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className={clsx('glass-card p-5 flex gap-4', PRIORITY_STYLES[insight.priority])}>
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{insight.title}</p>
                    {insight.priority === 'high' && (
                      <span className="text-xs bg-orange-400/15 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                        Important
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Tips */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Heart size={18} className="text-rose-400" />
          Evidence-Inspired Wellness Tips
        </h2>
        <div className="space-y-3">
          {[
            { icon: '😴', tip: '7-9 hours of sleep is the single biggest performance enhancer for students. Protect it.' },
            { icon: '🚶', tip: 'A 10-minute walk outside can reduce cortisol (stress hormone) as effectively as light medication.' },
            { icon: '📵', tip: 'Put your phone in another room during study blocks. Even visible phones reduce cognitive capacity.' },
            { icon: '🤝', tip: 'Social connection is a basic human need. Loneliness elevates stress. Schedule time with people you care about.' },
            { icon: '🌬️', tip: 'Box breathing (4-4-4-4 counts) activates your parasympathetic system and reduces acute stress in minutes.' },
          ].map(({ icon, tip }, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass rounded-xl p-4 border border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
          ⚠️ <strong>Disclaimer:</strong> These insights are generated from your self-reported data and are for general wellness support only. 
          They are not medical advice, diagnosis, or treatment. If you're experiencing persistent mental health challenges, 
          please speak with a licensed professional.
        </p>
      </div>
    </div>
  )
}
