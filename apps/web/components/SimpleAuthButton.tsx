'use client'

import { useState } from 'react'

export function SimpleAuthButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [fid, setFid] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fid || isNaN(Number(fid))) {
      alert('Please enter a valid Farcaster ID')
      return
    }

    setLoading(true)

    try {
      // For demo purposes, we'll use a mock signer_uuid
      // In production, this would come from actual Farcaster authentication
      const mockSignerUuid = `demo-signer-${fid}-${Date.now()}`

      const response = await fetch(
        `/api/auth/callback?fid=${fid}&signer_uuid=${mockSignerUuid}`
      )

      if (response.ok) {
        window.location.href = '/dashboard'
      } else {
        alert('Authentication failed. Please try again.')
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
      >
        Sign In with Farcaster
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Sign In with Farcaster</h2>
        <p className="text-gray-600 mb-4">
          Enter your Farcaster ID (FID) to sign in. This is a demo mode since Neynar OAuth requires a paid plan.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={fid}
            onChange={(e) => setFid(e.target.value)}
            placeholder="Enter your FID (e.g., 3)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-4">
          Note: You can find your FID on Warpcast in your profile settings, or use a demo FID like 3 (dwr.eth) or 1 (farcaster.eth).
        </p>
      </div>
    </div>
  )
}
