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
    signOut,
  }
}
