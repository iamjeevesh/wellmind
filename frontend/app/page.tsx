// app/page.tsx
// Landing page — shown to users not yet signed in

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-wellness flex flex-col">
      
      {/* Header */}
      <nav className="glass border-b border-[var(--border-subtle)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌿</span>
            <span className="font-display text-xl font-medium text-gradient-sage">WellMind</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-ghost text-sm px-4 py-2">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-sage text-sm px-4 py-2">Get Started Free</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-sage text-sm px-4 py-2 rounded-xl">
                Go to Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-[var(--text-secondary)]">
            <span>✨</span>
            <span>AI-powered student wellness support</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-light leading-tight mb-6">
            Your calm space
            <br />
            <span className="text-gradient-sage italic">through the chaos</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 leading-relaxed max-w-2xl mx-auto">
            WellMind helps you track your mood, fight burnout, and stay balanced — 
            with a supportive AI companion and science-backed wellness tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignUpButton mode="modal">
              <button className="btn-sage text-base px-8 py-3.5 rounded-2xl">
                Start Your Wellness Journey →
              </button>
            </SignUpButton>
            <Link 
              href="#features" 
              className="btn-ghost text-base px-8 py-3.5 rounded-2xl inline-flex items-center justify-center"
            >
              See how it works
            </Link>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-6">
            Free to use • Not a medical tool • Privacy-first
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <h2 className="font-display text-3xl md:text-4xl text-center mb-4 font-light">
          Everything you need to <span className="italic text-gradient-sage">thrive</span>
        </h2>
        <p className="text-center text-[var(--text-secondary)] mb-12">
          Built for students. Designed with care.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🤖', title: 'AI Wellness Coach', desc: 'Chat with Sage — a supportive AI companion that listens without judgment and helps you reflect.' },
            { icon: '📊', title: 'Burnout Detection', desc: 'Daily check-ins that track mood, stress, and energy to detect burnout before it hits hard.' },
            { icon: '📔', title: 'Private Journal', desc: 'Write freely. Get gentle AI reflections that help you process emotions and find patterns.' },
            { icon: '🍅', title: 'Pomodoro Timer', desc: 'Stay focused with science-backed work intervals. Track your study sessions over time.' },
            { icon: '💡', title: 'Personalized Insights', desc: 'Wellness recommendations tailored to your data — sleep, mood, and focus patterns.' },
            { icon: '📈', title: 'Mood Trends', desc: 'Beautiful charts showing your wellness journey over time. Awareness is the first step.' },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="text-center px-6 py-10 border-t border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-muted)] max-w-2xl mx-auto">
          ⚠️ <strong>Disclaimer:</strong> WellMind is a wellness and productivity support tool. 
          It is NOT a replacement for licensed medical or psychological care. 
          If you are experiencing a mental health crisis, please contact a professional or crisis line (988 in the US).
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          © 2024 WellMind • Made with 💚 for students
        </p>
      </footer>

    </main>
  )
}
