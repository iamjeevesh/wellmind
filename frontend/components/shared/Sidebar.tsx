'use client'
// components/shared/Sidebar.tsx
// Main navigation sidebar
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  MessageCircle, 
  BookOpen, 
  BarChart2, 
  Timer,
  Lightbulb,
  CheckSquare,
  Sun,
  Moon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/checkin', icon: CheckSquare, label: 'Check-in' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat with Sage' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Journal' },
  { href: '/dashboard/focus', icon: Timer, label: 'Focus Timer' },
  { href: '/dashboard/insights', icon: Lightbulb, label: 'Insights' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  const toggleTheme = () => {
    const newDark = !dark
    setDark(newDark)
    if (newDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <>
    {/* Mobile overlay — dark background when sidebar is open */}
    {mobileOpen && (
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        onClick={() => setMobileOpen(false)}
      />
    )}

    {/* Hamburger button — only visible on mobile */}
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="lg:hidden fixed top-4 left-4 z-30 glass p-2 rounded-xl"
    >
      <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
    </button>

    <aside className={clsx(
      "w-64 min-h-screen flex flex-col glass-strong border-r border-[var(--border-subtle)]",
      "fixed lg:relative z-30 transition-transform duration-300",
      mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-float">🌿</span>
          <span className="font-display text-xl font-medium text-gradient-sage">WellMind</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1 ml-0.5">Your wellness companion</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || 
            (href !== '/dashboard' && pathname.startsWith(href))
          
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-sage-500/10 text-sage-600 dark:text-sage-300 border border-sage-500/20'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon size={18} className={active ? 'text-sage-500' : ''} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] transition-all"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3.5 py-2">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-muted)] truncate">Your account</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[var(--text-muted)] px-3 py-2 bg-amber-500/5 rounded-lg border border-amber-500/10 leading-relaxed">
          Not a medical tool. Seek professional help for mental health concerns.
        </p>
      </div>
      </aside>
    </>
  )
}
