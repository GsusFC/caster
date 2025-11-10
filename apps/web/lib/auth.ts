import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@farcaster-scheduler/database'
import type { NextAuthConfig } from 'next-auth'

// Tipos para Farcaster/Neynar
interface FarcasterProfile {
  fid: number
  username: string
  display_name: string
  pfp_url: string
}

interface FarcasterAccount {
  provider: string
  signer_uuid: string
}

// Configuración de NextAuth
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Provider personalizado para Farcaster via Neynar
    {
      id: 'farcaster',
      name: 'Farcaster',
      type: 'oauth',
      authorization: {
        url: 'https://api.neynar.com/v2/farcaster/auth/authorize',
        params: {
          client_id: process.env.NEYNAR_CLIENT_ID,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/farcaster`,
          response_type: 'code',
        },
      },
      token: 'https://api.neynar.com/v2/farcaster/auth/token',
      userinfo: 'https://api.neynar.com/v2/farcaster/user',
      profile(profile) {
        return {
          id: profile.fid.toString(),
          name: profile.display_name,
          email: null, // Farcaster no usa email
          image: profile.pfp_url,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Aquí guardamos el signer cuando el usuario se autentica
      if (account?.provider === 'farcaster') {
        try {
          const farcasterProfile = profile as unknown as FarcasterProfile
          const farcasterAccount = account as unknown as FarcasterAccount
          const fid = farcasterProfile?.fid
          const signerUuid = farcasterAccount?.signer_uuid

          if (fid && signerUuid) {
            // Guardar o actualizar usuario con signer
            await prisma.user.upsert({
              where: { fid },
              update: {
                username: farcasterProfile.username || '',
                displayName: farcasterProfile.display_name,
                pfpUrl: farcasterProfile.pfp_url,
                signerUuid,
              },
              create: {
                fid,
                username: farcasterProfile.username || '',
                displayName: farcasterProfile.display_name,
                pfpUrl: farcasterProfile.pfp_url,
                signerUuid,
              },
            })
          }
        } catch (error) {
          console.error('Error saving user:', error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      // Agregar FID a la sesión
      if (session.user) {
        const dbUser = await prisma.user.findFirst({
          where: { id: user.id },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          // @ts-expect-error - adding fid to session
          session.user.fid = dbUser.fid
          // @ts-expect-error - adding signerUuid to session
          session.user.signerUuid = dbUser.signerUuid
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
