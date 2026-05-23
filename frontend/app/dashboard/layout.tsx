// app/dashboard/layout.tsx
// Wraps all dashboard pages with sidebar + auth protection

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect all dashboard routes — redirect if not signed in
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-wellness">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
