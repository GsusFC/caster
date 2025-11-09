# 🧪 Testing Guide

## Verificar Deployment en Render.com

### 1. Verificar Worker Status

Ve a https://dashboard.render.com y verifica:

✅ **Worker running:**
```
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...
```

✅ **Cron job ejecutándose:**
```
[2025-11-09T20:XX:00.XXX] 🔄 Checking for scheduled casts...
Found 0 casts due for publishing
✅ Completed: { total: 0, successful: 0, failed: 0 }
```

### 2. Verificar Database

En Render Dashboard → PostgreSQL → Connect:

```bash
# Verificar que las tablas existan
psql -h <host> -U <user> -d <database>

# Listar tablas
\dt

# Deberías ver:
# - User
# - ScheduledCast
# - CastThread
```

## Testing Local

### Requisitos

1. **DATABASE_URL configurado** en `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

2. **NEYNAR_API_KEY** (para publicar casts):
   ```bash
   NEYNAR_API_KEY="your-key-from-neynar.com"
   ```

### Crear Cast de Prueba

```bash
# 1. Generar Prisma Client
pnpm db:generate

# 2. Crear base de datos local (opcional)
pnpm db:push

# 3. Ejecutar script de prueba
pnpm test:cast
```

El script:
- ✅ Crea un usuario de prueba (FID: 999999)
- ✅ Crea un cast programado para dentro de 2 minutos
- ✅ Muestra todos los casts pendientes

### Ver Logs del Worker

**En Render:**
- Dashboard → Worker → Logs (auto-refresh)

**Local:**
```bash
pnpm dev:worker
```

Deberías ver:
```
[2025-11-09T20:XX:00.XXX] 🔄 Checking for scheduled casts...
Found 1 casts due for publishing
Published: 1 successful, 0 failed
✅ Completed: { total: 1, successful: 1, failed: 0 }
```

### Prisma Studio (GUI)

Ver y editar datos en la base de datos:

```bash
pnpm db:studio
```

Abre: http://localhost:5555

## Testing End-to-End

### Escenario 1: Cast Inmediato

```typescript
// En test-cast.ts, cambiar:
const scheduledTime = new Date() // Ahora mismo
```

El worker lo detectará en el siguiente minuto.

### Escenario 2: Cast Futuro

```typescript
// Programar para mañana
const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
```

### Escenario 3: Cast con Media

```typescript
const cast = await prisma.scheduledCast.create({
  data: {
    // ...
    mediaUrls: ['https://example.com/image.png'],
  },
})
```

### Escenario 4: Cast en Canal

```typescript
const cast = await prisma.scheduledCast.create({
  data: {
    // ...
    channelKey: 'farcaster', // O cualquier canal
  },
})
```

## Verificar Publicación Exitosa

Después de que el worker publique un cast:

1. **En logs:**
   ```
   ✅ Completed: { total: 1, successful: 1, failed: 0 }
   ```

2. **En base de datos:**
   ```sql
   SELECT * FROM "ScheduledCast" WHERE status = 'PUBLISHED';
   ```

   Deberías ver:
   - `status`: PUBLISHED
   - `publishedAt`: timestamp
   - `castHash`: hash del cast publicado

3. **En Farcaster:**
   - Ve a https://warpcast.com/~/casts/[castHash]
   - O busca el usuario en Warpcast

## Troubleshooting

### Error: DATABASE_URL not found

```bash
# Asegúrate de tener .env con:
DATABASE_URL="postgresql://..."
```

### Error: Cannot find module '@prisma/client'

```bash
pnpm db:generate
```

### Error: Table does not exist

```bash
pnpm db:push
```

### Error: NEYNAR_API_KEY not found

El worker funciona sin API key, pero no podrá publicar casts. Solo mostrará:
```
Error publishing cast: NEYNAR_API_KEY not found
```

Para obtener una key: https://neynar.com

## Próximos Pasos

- ✅ FASE 0: Setup completado
- ✅ Deployment: Worker funcionando
- ✅ FASE 1: Testing básico (este doc)
- ⏳ FASE 2: Autenticación con Neynar
- ⏳ FASE 3: Dashboard y composer
- ⏳ FASE 4: CRUD completo
- ⏳ FASE 5: Features avanzadas
