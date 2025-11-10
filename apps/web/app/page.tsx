'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Farcaster Scheduler
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Schedule and manage your Farcaster casts like a pro
        </p>

        {status === 'loading' ? (
          <p className="text-gray-500">Loading...</p>
        ) : session ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, <span className="font-semibold">{session.user?.name}</span>!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg border-2 border-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => signIn('farcaster')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Sign In with Farcaster
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg border-2 border-gray-200 transition-colors">
              Learn More
            </button>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">📅 Schedule Casts</h3>
            <p className="text-gray-600">
              Plan your content ahead and publish automatically at the perfect time
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">🧵 Thread Support</h3>
            <p className="text-gray-600">
              Create and schedule entire threads with ease
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
            <p className="text-gray-600">
              Track your engagement and optimize your posting schedule
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
