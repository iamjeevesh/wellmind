'use client'
// app/dashboard/journal/page.tsx
// Private journaling with AI reflection

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { createJournalEntry, getJournalEntries, deleteJournalEntry, setAuthToken } from '@/lib/api'
import { JournalEntry } from '@/types'
import { BookOpen, Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const MOOD_EMOJIS = ['', '😞','😔','😟','😐','🙂','😊','😄','😁','🤩','🥳']

export default function JournalPage() {
  const { getToken } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [writing, setWriting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number>(5)
  const [prompt, setPrompt] = useState('')

  const REFLECTION_PROMPTS = [
    "What's weighing on you most today?",
    "What are you grateful for right now?",
    "Describe a moment today when you felt like yourself.",
    "What would you like to let go of this week?",
    "What does success look like for you this week?",
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const res = await getJournalEntries()
        setEntries(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
    setPrompt(REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)])
  }, [getToken])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const token = await getToken()
      if (!token) return
      setAuthToken(token)
      const res = await createJournalEntry({
        title: title || undefined,
        content,
        mood_at_time: mood,
      })
      setEntries(prev => [res.data, ...prev])
      setWriting(false)
      setTitle('')
      setContent('')
      setMood(5)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return
    try {
      const token = await getToken()
      if (!token) return
      setAuthToken(token)
      await deleteJournalEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-sage-500" size={24} />
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">Journal</h1>
            <p className="text-sm text-[var(--text-secondary)]">Your private space to reflect</p>
          </div>
        </div>
        {!writing && (
          <button
            onClick={() => setWriting(true)}
            className="btn-sage flex items-center gap-2"
          >
            <Plus size={16} />
            New Entry
          </button>
        )}
      </div>

      {/* Write New Entry */}
      {writing && (
        <div className="glass-card p-6 mb-6 animate-slide-up">
          
          {/* Daily prompt */}
          <div className="glass rounded-xl p-3 mb-4 flex items-start gap-2">
            <Sparkles size={16} className="text-sage-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text-secondary)] italic">{prompt}</p>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give this entry a title (optional)"
            className="input-wellmind mb-3"
          />
          
          {/* Content */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write freely — this space is just for you..."
            rows={8}
            className="input-wellmind resize-none leading-relaxed"
          />
          
          {/* Mood */}
          <div className="mt-3">
            <p className="text-sm text-[var(--text-secondary)] mb-2">How are you feeling as you write?</p>
            <div className="flex gap-2 flex-wrap">
              {[1,2,3,4,5,6,7,8,9,10].map(s => (
                <button
                  key={s}
                  onClick={() => setMood(s)}
                  className={clsx(
                    'text-xl px-2 py-1 rounded-lg transition-all',
                    mood === s ? 'bg-sage-500/15 scale-110' : 'hover:bg-[var(--bg-glass)]'
                  )}
                  title={`${s}/10`}
                >
                  {MOOD_EMOJIS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="btn-sage flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : '✨ Save Entry'}
            </button>
            <button
              onClick={() => { setWriting(false); setTitle(''); setContent('') }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
            Sage will generate a gentle reflection on your entry
          </p>
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={48} className="mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
          <p className="text-[var(--text-secondary)]">No journal entries yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Your thoughts are worth writing down.</p>
          <button onClick={() => setWriting(true)} className="btn-sage mt-6">
            Write Your First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => {
            const isExpanded = expanded === entry.id
            return (
              <div key={entry.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.mood_at_time && (
                        <span className="text-lg">{MOOD_EMOJIS[entry.mood_at_time]}</span>
                      )}
                      <span className="font-medium text-[var(--text-primary)] truncate">
                        {entry.title || 'Journal Entry'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {format(new Date(entry.created_at), 'MMMM d, yyyy · h:mm a')}
                    </p>
                    {!isExpanded && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                    )}
                  </div>
                  {isExpanded ? 
                    <ChevronUp size={18} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" /> : 
                    <ChevronDown size={18} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                  }
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-[var(--border-subtle)] pt-4">
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed text-sm">
                      {entry.content}
                    </p>
                    
                    {/* AI Reflection */}
                    {entry.ai_reflection && (
                      <div className="mt-4 glass rounded-xl p-4 border-l-4 border-sage-400">
                        <p className="text-xs font-medium text-sage-500 mb-1.5 flex items-center gap-1.5">
                          <Sparkles size={12} />
                          Sage's Reflection
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
                          {entry.ai_reflection}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
