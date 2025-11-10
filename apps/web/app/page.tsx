'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [siwnLoaded, setSiwnLoaded] = useState(false)

  useEffect(() => {
    // Define global callback for SIWN
    ;(window as any).onSignInSuccess = async (data: {
      fid: number
      signer_uuid: string
    }) => {
      console.log('SIWN success:', data)

      try {
        // Send to our callback endpoint to create session
        const response = await fetch(
          `/api/auth/callback?fid=${data.fid}&signer_uuid=${data.signer_uuid}`
        )

        if (response.ok) {
          // Redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          console.error('Failed to create session')
          alert('Authentication failed. Please try again.')
        }
      } catch (error) {
        console.error('Error creating session:', error)
        alert('Authentication failed. Please try again.')
      }
    }
  }, [])

  return (
    <>
      <Script
        src="https://neynarxyz.github.io/siwn/raw/1.2.0/index.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('SIWN script loaded')
          setSiwnLoaded(true)
        }}
      />
      <main className="min-h-screen flex flex-col items-center justify-center p-24">
        <div className="max-w-3xl w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Farcaster Scheduler
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Schedule and manage your Farcaster casts like a pro
        </p>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : user ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, <span className="font-semibold">{user.displayName}</span>!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={signOut}
                className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-lg border-2 border-gray-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <div
              className="neynar_signin"
              data-client_id="a8a5d46f-cda7-49da-90da-0ebdb74880fe"
              data-success-callback="onSignInSuccess"
              data-theme="light"
            >
              {/* SIWN script will replace this with button */}
              {!siwnLoaded && (
                <div className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg">
                  Loading...
                </div>
              )}
            </div>
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
    </>
  )
}
