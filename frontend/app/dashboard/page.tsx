'use client'
// app/dashboard/page.tsx
// Main dashboard — shows stats, burnout score, mood charts, and insights

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { getDashboardStats, getWellnessInsights, getDailyPrompt, setAuthToken } from '@/lib/api'
import { DashboardStats, WellnessInsight } from '@/types'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend 
} from 'recharts'
import { 
  Flame, Heart, Zap, BookOpen, Timer, TrendingUp,
  CheckCircle, Calendar, ArrowRight,BarChart2
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'

// Burnout score color based on level
const getBurnoutColor = (score?: number) => {
  if (score === undefined) return '#8ec498'
  if (score < 25) return '#3d8750'
  if (score < 50) return '#f59e0b'
  if (score < 75) return '#f97316'
  return '#ef4444'
}

const BurnoutRing = ({ score }: { score?: number }) => {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDash = score !== undefined 
    ? circumference - (score / 100) * circumference 
    : circumference
  const color = getBurnoutColor(score)

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="transform -rotate-90" width="144" height="144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="10"/>
        <circle
          cx="72" cy="72" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score !== undefined ? Math.round(score) : '—'}
        </span>
        <span className="text-xs text-[var(--text-muted)]">/ 100</span>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, sub, color = 'sage' }: any) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className={clsx(
      'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
      color === 'sage' ? 'bg-sage-500/10' : 
      color === 'amber' ? 'bg-amber-500/10' : 
      color === 'violet' ? 'bg-violet-500/10' : 'bg-sky-500/10'
    )}>
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-[var(--text-primary)] text-2xl font-semibold leading-tight">{value}</p>
      {sub && <p className="text-[var(--text-muted)] text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
)

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl p-3 text-sm">
        <p className="text-[var(--text-muted)] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{p.value?.toFixed(1)}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<WellnessInsight[]>([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)

        const [statsRes, insightsRes, promptRes] = await Promise.all([
          getDashboardStats(),
          getWellnessInsights(),
          getDailyPrompt(),
        ])
        
        setStats(statsRes.data)
        setInsights(insightsRes.data)
        setPrompt(promptRes.data.prompt)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-8 w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  const burnoutCategory = stats?.burnout_category

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">
            Good to see you 🌿
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!stats?.today_checked_in && (
          <Link 
            href="/dashboard/checkin" 
            className="btn-sage flex items-center gap-2 text-sm"
          >
            <CheckCircle size={16} />
            Check In Today
          </Link>
        )}
      </div>

      {/* Daily Prompt */}
      {prompt && (
        <div className="glass-card p-5 border-l-4 border-sage-400">
          <p className="text-xs font-medium text-sage-500 uppercase tracking-wide mb-2">Today's Reflection</p>
          <p className="text-[var(--text-primary)] italic font-display text-lg leading-relaxed">
            "{prompt}"
          </p>
          <Link 
            href="/dashboard/journal"
            className="inline-flex items-center gap-1.5 text-sage-500 text-sm mt-3 hover:text-sage-600 transition-colors"
          >
            Write in journal <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon="😊" 
          label="Avg Mood (7d)" 
          value={stats?.avg_mood_7d ? `${stats.avg_mood_7d}/10` : '—'}
          sub="Last 7 days"
          color="sage"
        />
        <StatCard 
          icon="😰" 
          label="Avg Stress (7d)"
          value={stats?.avg_stress_7d ? `${stats.avg_stress_7d}/10` : '—'}
          sub="Last 7 days"
          color="amber"
        />
        <StatCard 
          icon="🍅" 
          label="Focus Time"
          value={stats?.total_focus_minutes_7d 
            ? `${Math.round(stats.total_focus_minutes_7d / 60)}h ${stats.total_focus_minutes_7d % 60}m`
            : '0m'
          }
          sub="This week"
          color="violet"
        />
        <StatCard 
          icon="🔥" 
          label="Check-in Streak"
          value={`${stats?.streak_days || 0} days`}
          sub={stats?.today_checked_in ? '✓ Done today' : 'Check in today!'}
          color="sky"
        />
      </div>

      {/* Burnout Score + Mood Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Burnout Score */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wide">
            Burnout Risk Score
          </h2>
          <BurnoutRing score={stats?.current_burnout_score} />
          {burnoutCategory && (
            <>
              <p className="mt-4 font-semibold text-[var(--text-primary)]">{burnoutCategory.label}</p>
              <p className="text-xs text-[var(--text-secondary)] text-center mt-1 leading-relaxed">
                {burnoutCategory.message}
              </p>
            </>
          )}
          {!stats?.current_burnout_score && (
            <p className="text-xs text-[var(--text-muted)] text-center mt-2">
              Complete a check-in to see your score
            </p>
          )}
        </div>

        {/* Mood Trend Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wide">
            Mood & Stress Trend
          </h2>
          {stats?.mood_trend && stats.mood_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.mood_trend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} 
                />
                <Line 
                  type="monotone" dataKey="mood_score" name="Mood"
                  stroke="#3d8750" strokeWidth={2.5} dot={{ r: 3, fill: '#3d8750' }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" dataKey="stress_score" name="Stress"
                  stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)]">
              <BarChart2 size={32} className="mb-3 opacity-30" />
              <p className="text-sm">No data yet</p>
              <p className="text-xs mt-1">Start checking in daily to see your trends</p>
              <Link href="/dashboard/checkin" className="btn-sage text-xs mt-4 px-4 py-2">
                First Check-in →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Personalized Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div 
                key={i} 
                className={clsx(
                  'glass-card p-4 flex gap-3',
                  insight.priority === 'high' && 'border-l-4 border-orange-400'
                )}
              >
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{insight.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/checkin', icon: '✅', label: 'Daily Check-in' },
            { href: '/dashboard/chat', icon: '💬', label: 'Talk to Sage' },
            { href: '/dashboard/journal', icon: '📔', label: 'Write Journal' },
            { href: '/dashboard/focus', icon: '🍅', label: 'Start Focus' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
