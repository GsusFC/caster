'use client'

import { useEffect, useState } from 'react'
import { SessionUser } from './auth'

interface AuthState {
  user: SessionUser | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    fetchSession()
  }, [])

  async function fetchSession() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setState({
        user: data.user || null,
        loading: false,
      })
    } catch (error) {
      console.error('Failed to fetch session:', error)
      setState({
        user: null,
        loading: false,
      })
    }
  }

  async function signIn() {
    console.log('signIn function called')

    // Check if SIWN script is loaded
    if (typeof (window as any).NeynarSIWN === 'undefined') {
      console.error('SIWN script not loaded yet, falling back to server-side flow')
      window.location.href = '/api/auth/signin'
      return
    }

    try {
      // Use SIWN popup (free tier)
      console.log('Using SIWN popup...')
      const NeynarSIWN = (window as any).NeynarSIWN

      NeynarSIWN({
        clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || 'a8a5d46f-cda7-49da-90da-0ebdb74880fe',
        onSuccess: async (data: { fid: number; signer_uuid: string }) => {
          console.log('SIWN success:', data)

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
        },
        onError: (error: any) => {
          console.error('SIWN error:', error)
          alert('Authentication failed. Please try again.')
        },
      })
    } catch (error) {
      console.error('Error initializing SIWN:', error)
      // Fallback to server-side flow
      window.location.href = '/api/auth/signin'
    }
  }

  async function signOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setState({ user: null, loading: false })
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    signIn,
    signOut,
  }
}
