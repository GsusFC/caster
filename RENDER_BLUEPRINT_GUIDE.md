# 🚀 Deploy Correcto a Render.com usando Blueprint

## ⚠️ Problema Actual

Render está usando comandos por defecto (`yarn install; yarn build`) en lugar de los comandos configurados en `render.yaml`.

**Solución:** Usar **Blueprint** para que Render detecte automáticamente `render.yaml`.

---

## ✅ SOLUCIÓN: Deploy con Blueprint (RECOMENDADO)

### Paso 1: Eliminar el Servicio Actual (si existe)

1. Ve a https://dashboard.render.com
2. Encuentra tu worker: `farcaster-scheduler-worker`
3. Settings → Scroll hasta abajo
4. Click **Delete Service**
5. Confirma la eliminación

### Paso 2: Crear Base de Datos (si no existe)

1. Dashboard → **New** → **PostgreSQL**
2. Configura:
   - **Name:** `farcaster-scheduler-db` (exactamente este nombre)
   - **Database:** `farcaster_scheduler`
   - **User:** `farcaster_user`
   - **Region:** Oregon (us-west)
   - **Plan:** Free
3. Click **Create Database**
4. Espera 2-3 minutos

### Paso 3: Deploy usando Blueprint

1. Dashboard → **New** → **Blueprint**

2. **Connect GitHub:**
   - Si es primera vez, click **Connect GitHub**
   - Autoriza Render
   - Selecciona el repositorio: `GsusFC/caster`
   - Click **Connect**

3. **Render detectará automáticamente `render.yaml`:**
   - Verás: "Found render.yaml in repository"
   - Mostrará:
     ```
     Services to be created:
     - farcaster-scheduler-worker (Background Worker)

     Databases to be created:
     - farcaster-scheduler-db (PostgreSQL)
     ```

4. **Configurar Variables de Entorno:**

   Solo necesitas configurar **UNA variable** manualmente:

   - `NEYNAR_API_KEY` → Pega tu key de neynar.com

   Las demás ya están en `render.yaml`:
   - ✅ `NODE_ENV=production` (automático)
   - ✅ `DATABASE_URL` (se conecta automáticamente a la DB)
   - ✅ `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` (automático)

5. **Revisar y crear:**
   - Verifica que todo se vea correcto
   - Click **Apply**

6. **Render empezará el deploy automáticamente**

---

## 📊 Lo que Deberías Ver

### Durante el Build (5-10 minutos)

```bash
==> Cloning from https://github.com/GsusFC/caster
==> Checking out commit ... in branch main
==> Using Node.js version 25.1.0
==> Running build command from render.yaml...

corepack enable
✓ Corepack enabled

corepack prepare pnpm@8.15.0 --activate
Preparing pnpm@8.15.0 for immediate activation...
✓ pnpm@8.15.0 activated

pnpm install
Lockfile is up to date, resolution step is skipped
Progress: resolved 1246, reused 1246, downloaded 0, added 1246
Done in 45.3s

pnpm --filter=worker build
> worker@0.1.0 build
> tsc
✓ Build complete

pnpm --filter=database prisma generate
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (5.9.1)

==> Build succeeded ✓
```

### Después del Build (Worker corriendo)

```bash
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...

[2025-11-09T14:20:00.000Z] 🔄 Checking for scheduled casts...
[2025-11-09T14:20:00.123Z] ✅ Completed: { total: 0, successful: 0, failed: 0 }

[2025-11-09T14:21:00.000Z] 🔄 Checking for scheduled casts...
[2025-11-09T14:21:00.234Z] ✅ Completed: { total: 0, successful: 0, failed: 0 }
```

---

## 🔧 Alternativa: Actualizar Servicio Existente (Manual)

Si prefieres **NO eliminar** el servicio actual:

### Opción A: Actualizar en Dashboard

1. Ve a tu worker en Render
2. **Settings** → **Build & Deploy**
3. **Build Command** - Pega exactamente:
   ```bash
   corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install && pnpm --filter=worker build && pnpm --filter=database prisma generate
   ```
4. **Start Command** - Pega exactamente:
   ```bash
   node apps/worker/dist/index.js
   ```
5. **Environment** → Add variable:
   - Key: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`
   - Value: `1`
6. **Save Changes**
7. **Manual Deploy** → Deploy latest commit

---

## ✅ Verificación Post-Deploy

### 1. Verificar Build

**Dashboard → Worker → Logs**

Busca:
```
✔ Generated Prisma Client
==> Build succeeded ✓
```

### 2. Verificar Worker Corriendo

**Logs en tiempo real:**
```
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...
```

### 3. Verificar Cron Job

Deberías ver nuevos logs cada minuto:
```
[timestamp] 🔄 Checking for scheduled casts...
[timestamp] ✅ Completed: { total: 0, successful: 0, failed: 0 }
```

### 4. Verificar Variables de Entorno

**Settings → Environment:**
- ✅ `NODE_ENV=production`
- ✅ `DATABASE_URL=postgresql://...` (Internal URL)
- ✅ `NEYNAR_API_KEY=NEYNAR_API_...`
- ✅ `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

---

## 🐛 Troubleshooting

### Error: "packageManager mismatch"

**Causa:** Build command no incluye `corepack enable`

**Solución:** Verifica que el build command empiece con:
```bash
corepack enable && ...
```

### Error: "Cannot find module '@prisma/client'"

**Causa:** Prisma client no se generó

**Solución:** Build command debe incluir:
```bash
... && pnpm --filter=database prisma generate
```

### Error: "ECONNREFUSED" o "Database connection failed"

**Causa:** DATABASE_URL incorrecta o DB no está lista

**Solución:**
1. Verifica que la DB esté en estado "Available"
2. Asegúrate que `DATABASE_URL` apunte a la **Internal URL**
3. Verifica que worker y DB estén en la misma región (Oregon)

### Worker se reinicia constantemente

**Causa:** Error en el código o variable faltante

**Solución:**
1. Revisa logs para ver el error específico
2. Verifica que todas las variables estén configuradas
3. Asegúrate que `NEYNAR_API_KEY` sea válida

---

## 📋 Checklist Final

Antes de dar por completado:

- [ ] Base de datos creada y en estado "Available"
- [ ] Blueprint ejecutado (o comandos actualizados manualmente)
- [ ] Build completó sin errores
- [ ] Worker está corriendo (no dice "stopped")
- [ ] Logs muestran "🔄 Checking for scheduled casts..." cada minuto
- [ ] No hay errores rojos en los logs
- [ ] Todas las variables de entorno configuradas:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL` (Internal URL)
  - [ ] `NEYNAR_API_KEY`
  - [ ] `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

---

## 🎯 Resumen

**Método Recomendado:** Blueprint

1. Elimina servicio actual (si existe)
2. Crea DB si no existe
3. New → Blueprint → Connect GitHub
4. Render detecta `render.yaml` automáticamente
5. Solo configura `NEYNAR_API_KEY`
6. Apply
7. ¡Listo! Todo se despliega automáticamente

**Ventajas:**
- ✅ Usa automáticamente `render.yaml`
- ✅ Comandos correctos desde el inicio
- ✅ Variables pre-configuradas
- ✅ DB se conecta automáticamente

---

## 🚀 Después del Deploy Exitoso

1. **Verifica que funciona** (checklist arriba)
2. **Anota la URL de la DB** (para acceso local con Prisma Studio)
3. **Continúa con desarrollo local** (FASE 1 en `PLAN_DESARROLLO.md`)
4. **Deploy web app** cuando esté lista (Netlify)

---

**¿Tienes el worker corriendo exitosamente?** 🎉

Si ves logs cada minuto, ¡deployment exitoso!
