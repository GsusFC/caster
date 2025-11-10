import { handlers } from '@/lib/auth'

// Force Node.js runtime for NextAuth with Prisma
export const runtime = 'nodejs'

export const { GET, POST } = handlers
