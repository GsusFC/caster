'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { CastComposer } from '@/components/CastComposer'
import { CastList } from '@/components/CastList'

// Force dynamic rendering to avoid SSG issues with Neynar provider
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Farcaster Scheduler
              </Link>
              <Link href="/dashboard" className="text-purple-600 font-semibold">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.displayName}</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold">{user?.displayName}</span>
          </p>
        </div>

        {/* Cast Composer */}
        <div className="mb-8">
          <CastComposer />
        </div>

        {/* Scheduled Casts List */}
        <div>
          <CastList />
        </div>
      </div>
    </div>
  )
}
