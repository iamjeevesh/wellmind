// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-wellness flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="font-display text-3xl font-light text-[var(--text-primary)]">
            Welcome back
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Your wellness journey continues</p>
        </div>
        <SignIn appearance={{
          elements: {
            card: 'glass-strong rounded-3xl shadow-xl border-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-glass)]',
            formButtonPrimary: 'btn-sage w-full',
            formFieldInput: 'input-wellmind',
            footerActionLink: 'text-sage-500',
          }
        }} />
      </div>
    </div>
  )
}
