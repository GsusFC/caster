'use client'

import { NeynarContextProvider, Theme } from '@neynar/react'
import '@neynar/react/dist/style.css'

export function Providers({ children }: { children: React.ReactNode }) {
  const handleAuthSuccess = async (user: any) => {
    console.log('Neynar auth success:', user)

    try {
      // Extract fid and signer_uuid from the user object
      const fid = user.fid
      const signerUuid = user.signer_uuid

      if (!fid || !signerUuid) {
        console.error('Missing fid or signer_uuid from Neynar response')
        return
      }

      // Send to our callback endpoint to create session
      const response = await fetch(
        `/api/auth/callback?fid=${fid}&signer_uuid=${signerUuid}`
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

  return (
    <NeynarContextProvider
      settings={{
        clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || 'a8a5d46f-cda7-49da-90da-0ebdb74880fe',
        defaultTheme: Theme.Light,
        eventsCallbacks: {
          onAuthSuccess: handleAuthSuccess,
          onSignout: () => {
            console.log('User signed out from Neynar')
          },
        },
      }}
    >
      {children}
    </NeynarContextProvider>
  )
}
