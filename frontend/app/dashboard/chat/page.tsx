'use client'
// app/dashboard/chat/page.tsx
// AI chat interface with Sage — the wellness assistant

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { sendChatMessage, createNewChatSession, setAuthToken } from '@/lib/api'
import { ChatMessage } from '@/types'
import { Send, Plus, Bot, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'

// Renders markdown with styling
function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-inherit leading-relaxed">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i}><strong>{line.slice(2, -2)}</strong></p>
        }
        if (line.trim() === '') return <br key={i} />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content: "Hi, I'm Sage 🌿 — your wellness companion. I'm here to listen without judgment and help you navigate stress, burnout, and the pressures of student life.\n\nHow are you doing today? What's on your mind?",
  created_at: new Date().toISOString(),
  user_id: '',
  session_id: '',
}

const STARTER_PROMPTS = [
  "I'm feeling really overwhelmed with deadlines",
  "I think I might be burning out",
  "I can't seem to focus lately",
  "I need help managing my stress",
]

export default function ChatPage() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE as any])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize chat session
  useEffect(() => {
    const init = async () => {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        const res = await createNewChatSession()
        setSessionId(res.data.session_id)
      } catch (err) {
        console.error('Failed to create session:', err)
        setSessionId(crypto.randomUUID())
      }
    }
    init()
  }, [getToken])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !sessionId) return
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user_id: '',
      session_id: sessionId,
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const token = await getToken()
      if (!token) return
      setAuthToken(token)

      const res = await sendChatMessage(sessionId, text.trim())
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: '',
        session_id: sessionId,
        role: 'assistant',
        content: res.data.message,
        created_at: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'error',
        user_id: '',
        session_id: sessionId,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const startNewConversation = async () => {
    try {
      const token = await getToken()
      if (!token) return
      setAuthToken(token)
      const res = await createNewChatSession()
      setSessionId(res.data.session_id)
      setMessages([WELCOME_MESSAGE as any])
    } catch {
      setSessionId(crypto.randomUUID())
      setMessages([WELCOME_MESSAGE as any])
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage-500/10 flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">Sage</h1>
            <p className="text-xs text-[var(--text-muted)]">AI Wellness Companion • Not a therapist</p>
          </div>
        </div>
        <button
          onClick={startNewConversation}
          className="btn-ghost flex items-center gap-2 text-sm px-3 py-2"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              'flex gap-3 animate-slide-up',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-sage-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">🌿</span>
              </div>
            )}
            <div className={clsx(
              msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
            )}>
              <MessageContent content={msg.content} />
              <p className={clsx(
                'text-xs mt-2 opacity-60',
                msg.role === 'user' ? 'text-right text-white' : 'text-[var(--text-muted)]'
              )}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start animate-slide-up">
            <div className="w-8 h-8 rounded-xl bg-sage-500/10 flex items-center justify-center">
              <span className="text-sm">🌿</span>
            </div>
            <div className="chat-bubble-ai flex items-center gap-1.5">
              <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts — show only at the start */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="glass-card p-3 text-left text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors leading-snug"
            >
              <Sparkles size={12} className="inline mr-1.5 text-sage-400" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-strong rounded-2xl p-3 flex gap-3 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell Sage how you're feeling..."
          rows={1}
          maxLength={2000}
          className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm resize-none outline-none min-h-[24px] max-h-32 leading-6"
          style={{ height: 'auto' }}
          onInput={e => {
            const t = e.target as HTMLTextAreaElement
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 128) + 'px'
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
            input.trim() && !loading
              ? 'bg-sage-500 text-white hover:bg-sage-600 shadow-md'
              : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
          )}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Safety disclaimer */}
      <p className="text-xs text-[var(--text-muted)] text-center mt-2">
        Sage is an AI, not a therapist. For mental health crises, call/text 988.
      </p>
    </div>
  )
}
