# 🎯 PLAN DE DESARROLLO POR FASES - FARCASTER SCHEDULER

**Versiones Estables (NO ACTUALIZAR)**
- Node.js: v22.21.1 ✅
- pnpm: 8.15.0 ✅
- Next.js: 14.1.0 ✅
- React: 18.2.0 ✅
- TypeScript: 5.3.3 ✅
- Prisma: 5.9.1 ✅
- Neynar SDK: 1.35.0 ✅

---

## ✅ FASE 0: SETUP INICIAL (COMPLETADO)

### Lo que se hizo:
- [x] Archivo `.env` creado con NEXTAUTH_SECRET generado
- [x] Dependencias instaladas con `pnpm install`
- [x] Estructura del monorepo verificada

### Lo que DEBES hacer en tu entorno local:

#### 1. Obtener credenciales necesarias

**NEYNAR_API_KEY:**
```bash
# 1. Ve a https://neynar.com
# 2. Regístrate o inicia sesión
# 3. Crea una nueva API key
# 4. Copia la key
```

**DATABASE_URL:**
```bash
# Opción A: PostgreSQL local
DATABASE_URL="postgresql://user:password@localhost:5432/farcaster_scheduler?schema=public"

# Opción B: Render.com (recomendado)
# 1. Ve a https://render.com
# 2. Crea una PostgreSQL database
# 3. Copia la Internal Database URL
```

#### 2. Actualizar archivo .env

Edita `/home/user/caster/.env`:
```env
DATABASE_URL="tu_database_url_aqui"
NEYNAR_API_KEY="tu_neynar_api_key_aqui"
NEXTAUTH_SECRET="gA1gFguXbiMCBRXPKoL8JDNIW2tIFLGzqHFMZqYSMGg="
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

#### 3. Generar Prisma Client y migrar DB

```bash
# En tu entorno local con internet:
cd /home/user/caster

# Generar cliente Prisma
cd packages/database
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:generate

# Ejecutar migraciones
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:migrate

# Verificar con Prisma Studio (opcional)
pnpm prisma:studio
```

#### 4. Verificar que todo funciona

```bash
# En el root del proyecto
pnpm typecheck     # Verificar tipos
pnpm build         # Build de todos los packages
```

**Criterios de éxito FASE 0:**
- ✅ Dependencias instaladas
- ✅ .env configurado con credenciales reales
- ✅ Prisma client generado
- ✅ Base de datos migrada
- ✅ Build completa sin errores

---

## 🔧 FASE 1: VERIFICAR FUNCIONAMIENTO BÁSICO (2-3 horas)

**Objetivo:** Asegurar que el worker funciona y la arquitectura está correcta

### 1.1 Verificar worker de publicación

```bash
# Terminal 1: Iniciar web app
pnpm dev:web

# Terminal 2: Iniciar worker
pnpm dev:worker
```

**Deberías ver:**
```
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...
[timestamp] 🔄 Checking for scheduled casts...
[timestamp] ✅ Completed: { total: 0, successful: 0, failed: 0 }
```

### 1.2 Crear cast de prueba manualmente

Abre Prisma Studio:
```bash
cd packages/database
pnpm prisma:studio
```

**Crear usuario de prueba:**
1. Tabla `User` → Add record
   - fid: `12345`
   - username: `testuser`
   - displayName: `Test User`
   - signerUuid: `tu_signer_uuid_de_neynar`

**Crear cast programado:**
1. Tabla `ScheduledCast` → Add record
   - userId: `[id del user creado]`
   - content: `Hello from Farcaster Scheduler! 🚀`
   - scheduledTime: `[2 minutos en el futuro]`
   - status: `PENDING`
   - priority: `NORMAL`
   - mediaUrls: `[]`

**Observar el worker:**
- En 2 minutos debería detectar el cast
- Intentar publicarlo via Neynar
- Ver resultado en logs

### 1.3 Verificar packages funcionan correctamente

```bash
# Test de importaciones
cd packages/core
pnpm dev &

cd ../database
pnpm dev &

cd ../farcaster
pnpm dev &
```

**Criterios de éxito FASE 1:**
- ✅ Worker corre sin errores
- ✅ Detecta casts programados
- ✅ Se conecta a Neynar (aunque falle por signer inválido está OK)
- ✅ Actualiza estado en DB
- ✅ Todos los packages compilan sin errores

---

## 🔐 FASE 2: AUTENTICACIÓN BÁSICA CON NEYNAR (1 día)

**Objetivo:** Implementar Sign In con Farcaster usando Neynar

### 2.1 Instalar dependencias de auth

```bash
cd apps/web
pnpm add next-auth@4.24.5
pnpm add @farcaster/auth-kit@0.1.4
```

**Nota:** Usamos versiones específicas estables, NO las últimas.

### 2.2 Crear configuración de NextAuth

**Archivo:** `apps/web/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import { createSigner, getUserByFid } from '@farcaster-scheduler/farcaster'
import { userRepository } from '@farcaster-scheduler/database'

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'farcaster',
      name: 'Farcaster',
      type: 'oauth',
      authorization: {
        url: 'https://warpcast.com/~/siwf',
        params: {},
      },
      token: {
        async request(context) {
          // Implementar Sign In With Farcaster
          // Ver: https://docs.neynar.com/docs/how-to-let-users-connect-farcaster-accounts-with-write-access-for-free-using-sign-in-with-farcaster-siwf
          const { fid, signature } = context.params

          // Verificar firma
          // Crear/obtener signer
          const signerResult = await createSigner()

          if (!signerResult.success) {
            throw new Error('Failed to create signer')
          }

          return {
            tokens: {
              fid,
              signerUuid: signerResult.signer.signer_uuid,
            },
          }
        },
      },
      userinfo: {
        async request(context) {
          const { fid } = context.tokens

          // Obtener info del usuario de Neynar
          const userResult = await getUserByFid(Number(fid))

          if (!userResult.success) {
            throw new Error('Failed to get user')
          }

          return userResult.user
        },
      },
      profile(profile) {
        return {
          id: String(profile.fid),
          name: profile.displayName || profile.username,
          image: profile.pfpUrl,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Guardar/actualizar usuario en DB
      const { fid, username, displayName, pfpUrl } = user as any
      const signerUuid = account?.signerUuid as string

      await userRepository.upsert({
        fid: Number(fid),
        username,
        displayName,
        pfpUrl,
        signerUuid,
      })

      return true
    },
    async session({ session, token }) {
      // Agregar fid a la sesión
      session.user.fid = token.fid as number
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 2.3 Crear componente de Sign In

**Archivo:** `apps/web/components/auth/SignInButton.tsx`

```typescript
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export function SignInButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <button disabled>Loading...</button>
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg"
      >
        Sign Out
      </button>
    )
  }

  return (
    <button
      onClick={() => signIn('farcaster')}
      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg"
    >
      Sign In with Farcaster
    </button>
  )
}
```

### 2.4 Envolver app con SessionProvider

**Archivo:** `apps/web/app/layout.tsx`

```typescript
import './globals.css'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 2.5 Actualizar landing page

**Archivo:** `apps/web/app/page.tsx`

```typescript
import { SignInButton } from '@/components/auth/SignInButton'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Farcaster Scheduler
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Schedule and manage your Farcaster casts like a pro
        </p>

        <SignInButton />

        {/* ... resto del contenido ... */}
      </div>
    </main>
  )
}
```

**Criterios de éxito FASE 2:**
- ✅ Usuario puede hacer Sign In con Farcaster
- ✅ Signer se crea automáticamente en Neynar
- ✅ Usuario se guarda en la base de datos
- ✅ Sesión persiste al recargar
- ✅ Sign Out funciona correctamente

---

## 🎨 FASE 3: DASHBOARD Y COMPOSER DE CASTS (2 días)

**Objetivo:** UI funcional para programar casts

### 3.1 Crear layout del dashboard

**Archivo:** `apps/web/app/dashboard/layout.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header user={session.user} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 3.2 Crear Sidebar

**Archivo:** `apps/web/components/layout/Sidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/scheduled', label: 'Scheduled', icon: '📅' },
    { href: '/dashboard/published', label: 'Published', icon: '✅' },
    { href: '/dashboard/failed', label: 'Failed', icon: '❌' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Farcaster Scheduler
        </h2>
      </div>

      <nav className="px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg mb-1
              ${pathname === link.href
                ? 'bg-purple-100 text-purple-900'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span>{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

### 3.3 Crear Cast Composer

**Archivo:** `apps/web/components/composer/CastComposer.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export function CastComposer() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const charCount = content.length
  const maxChars = 320

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/casts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          scheduledTime: new Date(scheduledTime).toISOString(),
          priority,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule cast')
      }

      // Reset form
      setContent('')
      setScheduledTime('')
      setPriority('NORMAL')

      alert('Cast scheduled successfully!')
    } catch (error) {
      console.error(error)
      alert('Failed to schedule cast')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Compose Cast</h3>

      {/* Content textarea */}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={4}
          maxLength={maxChars}
          required
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${charCount > maxChars ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>

      {/* Scheduled time */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scheduled Time
        </label>
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          required
        />
      </div>

      {/* Priority */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || content.length === 0 || content.length > maxChars}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Scheduling...' : 'Schedule Cast'}
      </button>
    </form>
  )
}
```

### 3.4 Crear API Route para schedule

**Archivo:** `apps/web/app/api/casts/schedule/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { scheduler } from '@farcaster-scheduler/core'
import { userRepository } from '@farcaster-scheduler/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.fid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Obtener usuario de la DB
    const user = await userRepository.findByFid(session.user.fid)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { content, scheduledTime, priority, channelKey } = body

    // Validar
    if (!content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Usar el scheduler de core
    const cast = await scheduler.scheduleCast(
      user.id,
      content,
      {
        scheduledTime: new Date(scheduledTime),
        priority: priority || 'NORMAL',
        channelKey,
      }
    )

    return NextResponse.json({ cast })
  } catch (error) {
    console.error('Schedule cast error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule cast' },
      { status: 500 }
    )
  }
}
```

### 3.5 Crear página del dashboard

**Archivo:** `apps/web/app/dashboard/page.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { userRepository } from '@farcaster-scheduler/database'
import { scheduler } from '@farcaster-scheduler/core'
import { CastComposer } from '@/components/composer/CastComposer'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { UpcomingCasts } from '@/components/dashboard/UpcomingCasts'

export default async function DashboardPage() {
  const session = await getServerSession()
  const user = await userRepository.findByFid(session!.user.fid)

  if (!user) {
    return <div>User not found</div>
  }

  // Obtener stats
  const stats = await scheduler.getUserStats(user.id)

  // Obtener próximos casts
  const upcomingCasts = await scheduler.getUserCasts(user.id, {
    status: 'PENDING',
    limit: 5,
  })

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome back, {user.displayName || user.username}!
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <CastComposer />
        </div>

        <div>
          <StatsOverview stats={stats} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upcoming Casts
        </h2>
        <UpcomingCasts casts={upcomingCasts} />
      </div>
    </div>
  )
}
```

**Criterios de éxito FASE 3:**
- ✅ Dashboard funcional con sidebar
- ✅ Composer permite crear casts
- ✅ Casts se guardan en DB correctamente
- ✅ Se muestran stats del usuario
- ✅ Se muestran próximos casts programados

---

## 📋 FASE 4: GESTIÓN COMPLETA DE CASTS (1-2 días)

**Objetivo:** CRUD completo, editar, cancelar, eliminar

### 4.1 API Routes adicionales

**Archivo:** `apps/web/app/api/casts/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { scheduler } from '@farcaster-scheduler/core'
import { userRepository } from '@farcaster-scheduler/database'

// GET - Obtener cast por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userRepository.findByFid(session.user.fid)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const cast = await scheduledCastRepository.findById(params.id)

    if (!cast || cast.userId !== user.id) {
      return NextResponse.json({ error: 'Cast not found' }, { status: 404 })
    }

    return NextResponse.json({ cast })
  } catch (error) {
    console.error('Get cast error:', error)
    return NextResponse.json({ error: 'Failed to get cast' }, { status: 500 })
  }
}

// PATCH - Actualizar cast
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const cast = await scheduler.updateScheduledCast(params.id, body)

    return NextResponse.json({ cast })
  } catch (error) {
    console.error('Update cast error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update cast' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar cast
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await scheduler.deleteCast(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete cast error:', error)
    return NextResponse.json({ error: 'Failed to delete cast' }, { status: 500 })
  }
}
```

**Archivo:** `apps/web/app/api/casts/[id]/cancel/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { scheduler } from '@farcaster-scheduler/core'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.fid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await scheduler.cancelCast(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel cast error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel cast' },
      { status: 500 }
    )
  }
}
```

### 4.2 Componente CastCard

**Archivo:** `apps/web/components/casts/CastCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { ScheduledCast } from '@farcaster-scheduler/types'

interface CastCardProps {
  cast: ScheduledCast
  onUpdate?: () => void
}

export function CastCard({ cast, onUpdate }: CastCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this cast?')) return

    try {
      const response = await fetch(`/api/casts/${cast.id}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to cancel')

      onUpdate?.()
    } catch (error) {
      alert('Failed to cancel cast')
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this cast?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/casts/${cast.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      onUpdate?.()
    } catch (error) {
      alert('Failed to delete cast')
    } finally {
      setIsDeleting(false)
    }
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[cast.status]}`}>
          {cast.status}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(cast.scheduledTime).toLocaleString()}
        </span>
      </div>

      <p className="text-gray-900 mb-4">{cast.content}</p>

      {cast.status === 'PENDING' && (
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {cast.status === 'FAILED' && cast.errorMessage && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">Error: {cast.errorMessage}</p>
        </div>
      )}

      {cast.status === 'PUBLISHED' && cast.castHash && (
        <a
          href={`https://warpcast.com/~/conversations/${cast.castHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm text-purple-600 hover:text-purple-700"
        >
          View on Warpcast →
        </a>
      )}
    </div>
  )
}
```

### 4.3 Páginas de gestión

**Archivo:** `apps/web/app/dashboard/scheduled/page.tsx`

```typescript
import { getServerSession } from 'next-auth'
import { userRepository } from '@farcaster-scheduler/database'
import { scheduler } from '@farcaster-scheduler/core'
import { CastCard } from '@/components/casts/CastCard'

export default async function ScheduledPage() {
  const session = await getServerSession()
  const user = await userRepository.findByFid(session!.user.fid)

  if (!user) return <div>User not found</div>

  const casts = await scheduler.getUserCasts(user.id, {
    status: 'PENDING',
    limit: 50,
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Scheduled Casts
      </h1>

      {casts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No scheduled casts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {casts.map((cast) => (
            <CastCard key={cast.id} cast={cast} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Criterios de éxito FASE 4:**
- ✅ Ver todos los casts programados
- ✅ Cancelar casts pendientes
- ✅ Eliminar casts
- ✅ Ver casts publicados con link a Warpcast
- ✅ Ver casts fallidos con mensaje de error

---

## 🚀 FASE 5: FEATURES AVANZADAS (OPCIONAL - Variable)

### 5.1 Soporte de imágenes
- Integrar Pinata IPFS o AWS S3
- Drag & drop en composer
- Preview de imágenes
- Hasta 4 imágenes por cast

### 5.2 Threads
- Composer de threads
- Agregar/remover casts
- Reordenar con drag & drop
- Publicar thread completo en orden

### 5.3 Vista de calendario
- Calendario mensual con casts
- Drag & drop para reprogramar
- Click en fecha para crear cast

### 5.4 Analytics
- Engagement metrics vía Neynar
- Top performing casts
- Best time to post
- Gráficos con Chart.js

### 5.5 Batch operations
- Selección múltiple
- Eliminar múltiples
- Cambiar prioridad en lote
- Reprogramar en lote

---

## 📚 RECURSOS DE DESARROLLO

### Skills de Claude Code disponibles:

```bash
@farcaster-dev    # Neynar SDK, scheduling, publishing
@database-dev     # Prisma, migrations, repositories
@nextjs-dev       # Next.js 14, API routes, components
@monorepo-patterns # Turborepo, workspaces
```

### Comandos útiles:

```bash
# Desarrollo
pnpm dev              # Iniciar todo
pnpm dev:web          # Solo web
pnpm dev:worker       # Solo worker

# Database
pnpm db:studio        # Abrir Prisma Studio
pnpm db:migrate       # Ejecutar migraciones
pnpm db:generate      # Generar Prisma client

# Build y verificación
pnpm build            # Build completo
pnpm typecheck        # Verificar tipos
pnpm lint             # Linter

# Generar docs
/dev-docs [topic]     # Generar documentación
```

### Documentación del proyecto:

- `ARCHITECTURE.md` - Arquitectura del sistema
- `NEXT_STEPS.md` - Próximos pasos detallados
- `DEPLOYMENT.md` - Guía de deployment
- `CONTRIBUTING.md` - Guidelines de desarrollo
- `.claude/skills/farcaster-dev/SKILL.md` - Patrones de Farcaster

---

## ⚠️ NOTAS IMPORTANTES

### Versiones Estables (NO ACTUALIZAR):
- Las versiones actuales son estables y probadas
- NO ejecutar `pnpm update` sin confirmar
- Mantener Next.js 14.1.0 (NO la 15.x)
- Mantener React 18.2.0

### Prisma en ambientes con restricciones:
Si tienes problemas con checksums de Prisma:
```bash
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

### Neynar API:
- Rate limits: 100 req/min (free tier)
- Documentación: https://docs.neynar.com
- SDK: https://github.com/neynar/neynar-nodejs-sdk

### Base de datos:
- Usa PostgreSQL 14+
- Connection pooling via Prisma
- Backups regulares en producción

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Configurar credenciales en .env**
   - Obtener NEYNAR_API_KEY
   - Configurar DATABASE_URL

2. **Ejecutar setup de base de datos**
   ```bash
   cd packages/database
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:generate
   PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:migrate
   ```

3. **Verificar funcionamiento (FASE 1)**
   ```bash
   pnpm dev
   ```

4. **Implementar autenticación (FASE 2)**
   - Seguir guía de FASE 2
   - Instalar next-auth
   - Crear API routes
   - Probar sign in

5. **Construir dashboard (FASE 3)**
   - Crear layout
   - Implementar composer
   - Crear API routes
   - Probar programación de casts

¿Listo para empezar? **Primero completa FASE 0 en tu entorno local**, luego avanzamos a FASE 1.
