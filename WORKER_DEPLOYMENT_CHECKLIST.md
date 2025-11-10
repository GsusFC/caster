# ✅ Checklist para Desplegar el Worker

## ANTES de Desplegar - CRÍTICO ⚠️

### 1. Obtener Signer UUID Real de Neynar

**Estado actual:** ❌ Usando `demo-signer-6099-{timestamp}` (no válido para publicar)

**Necesitas:**

1. Ir a https://dev.neynar.com
2. Crear una cuenta (gratis)
3. Obtener tu **NEYNAR_API_KEY**
4. Crear un **Signer** para tu FID (6099)
5. Guardar el **signer_uuid** real

**Pasos detallados:**

```bash
# 1. Ir a https://dev.neynar.com
# 2. Sign in with Farcaster
# 3. Dashboard → API Keys → Copy API Key
# 4. Dashboard → Signers → Create Signer
#    - Seleccionar FID: 6099
#    - Copiar el signer_uuid que te genera
```

### 2. Actualizar el Signer en la Base de Datos

Una vez que tengas el signer_uuid real:

```sql
-- Conectarte a tu base de datos en Render
-- Dashboard → farcaster-scheduler-db → Connect → PSQL Command

UPDATE "User"
SET "signerUuid" = 'tu-signer-uuid-real-aqui'
WHERE fid = 6099;
```

### 3. Verificar en Render.com

**Pregunta crítica:** ¿Ya tienes servicios corriendo en Render?

Para verificar:
1. Ir a https://dashboard.render.com
2. Ver si hay algún servicio desplegado
3. Buscar: `farcaster-scheduler-worker`

**Si YA existe:**
- Apagarlo temporalmente (Settings → Suspend Service)
- Esto evitará que marque más casts como FAILED

**Si NO existe:**
- Entonces algo más está intentando publicar los casts
- Verificar si hay otro proceso corriendo

---

## Después de Resolver el Signer - Despliegue

### Opción 1: Desplegar desde Dashboard (Recomendado)

1. **Ir a Render Dashboard**
   - https://dashboard.render.com

2. **Conectar Repositorio**
   - New → Background Worker
   - Connect GitHub: `GsusFC/caster`
   - Branch: `claude/analiza-el-011CUxECeeQEb6TeK8EQbp5E`

3. **Configuración**
   - Name: `farcaster-scheduler-worker`
   - Region: Oregon
   - Plan: **Free** (gratis)

4. **Build Command:**
   ```bash
   corepack prepare pnpm@8.15.0 --activate && export PATH="$HOME/.node/corepack/pnpm/8.15.0/bin:$PATH" && pnpm install && cd packages/database && pnpm prisma generate && cd ../.. && pnpm --filter=worker... build
   ```

5. **Start Command:**
   ```bash
   node apps/worker/dist/index.js
   ```

6. **Variables de Entorno:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (usar la que ya tienes de Render DB)
   - `NEYNAR_API_KEY` = (tu API key de Neynar)
   - `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING` = `1`

7. **Deploy**
   - Click "Create Background Worker"
   - Esperar 5-10 minutos

### Opción 2: Usar render.yaml (Infraestructura como Código)

Ya actualicé `render.yaml` con plan FREE.

Para usar:
1. Commit y push de los cambios
2. En Render Dashboard: New → Blueprint
3. Connect to repo: `GsusFC/caster`
4. Render leerá automáticamente render.yaml
5. Configurar solo NEYNAR_API_KEY manualmente
6. Deploy

---

## Costos 💰

### Con Plan FREE (configuración actual)

| Servicio | Plan | Costo |
|----------|------|-------|
| Worker | Free | $0/mes |
| Database* | Free | $0/mes |
| **TOTAL** | | **$0/mes** |

**Limitaciones del plan FREE:**

**Worker:**
- ✅ 750 horas/mes gratis (suficiente para correr 24/7)
- ⚠️ Se duerme después de 15 min sin actividad (NO aplica a workers, solo web services)
- ⚠️ 512 MB RAM
- ⚠️ CPU compartida

**Database:**
- ✅ 256 MB storage (suficiente para empezar)
- ⚠️ Expira después de 90 días (necesitarás migrar o pagar)
- ⚠️ Sin backups automáticos

### Si Necesitas Upgrade

| Servicio | Plan | Costo |
|----------|------|-------|
| Worker | Starter | $7/mes |
| Database | Starter | $7/mes |
| **TOTAL** | | **$14/mes** |

**Beneficios del plan STARTER:**
- 1 GB RAM (worker)
- 1 GB storage (database)
- Database sin expiración
- Backups automáticos
- Mejor performance

---

## Verificación Post-Deployment ✅

Una vez desplegado, verificar:

1. **Logs muestran:**
   ```
   🚀 Starting Farcaster Scheduler Worker...
   ✅ Cron worker started successfully
   ⏰ Running every minute...
   [timestamp] 🔄 Checking for scheduled casts...
   ```

2. **Sin errores de:**
   - Conexión a base de datos
   - Prisma client
   - Neynar API

3. **Primer cast de prueba:**
   - Crear un cast programado para 2 minutos en el futuro
   - Esperar a que el worker lo procese
   - Verificar que se publique exitosamente
   - Estado debe cambiar: PENDING → PUBLISHED

---

## Troubleshooting 🐛

### Worker no arranca

**Logs muestran: "Cannot find module"**
```bash
# Verificar que el build command incluya:
pnpm --filter=worker... build
```

### Casts siguen marcándose como FAILED

**Verificar:**
1. ¿El signer_uuid es real o demo?
   ```sql
   SELECT "signerUuid", fid FROM "User" WHERE fid = 6099;
   ```

2. ¿La NEYNAR_API_KEY es correcta?
   - Verificar en variables de entorno
   - Probar en https://docs.neynar.com/reference

3. ¿Los logs muestran el error exacto?
   ```
   [timestamp] ❌ Error publishing casts: [error message]
   ```

### Database connection error

**Error: "Can't reach database server"**

Solución:
- Verificar que DATABASE_URL use la **Internal Connection String**
- Ambos servicios deben estar en la misma región (Oregon)

---

## Siguiente Paso INMEDIATO 🎯

**ANTES de desplegar:**

1. ¿Tienes cuenta en Render.com?
   - Si NO: Crear en https://dashboard.render.com (sign in with GitHub)
   - Si SÍ: Verificar si ya hay servicios corriendo

2. ¿Ya tienes NEYNAR_API_KEY?
   - Si NO: Ir a https://dev.neynar.com y obtenerla
   - Si SÍ: Obtener el signer_uuid real

3. Una vez que tengas el signer real:
   - Actualizar en la base de datos
   - Entonces SÍ desplegar el worker

---

## Resumen

**Puedo desplegar el worker:** ✅ Sí
**Cuesta dinero:** ✅ NO con plan FREE (pero tiene limitaciones)
**Cuándo desplegarlo:** ⏰ DESPUÉS de obtener signer UUID real de Neynar

**Por qué esperar:**
- Desplegar ahora = worker intentará publicar con demo signer
- Resultado = todos los casts fallarán con error 400
- Desperdiciarás tiempo debuggeando el mismo error

**Orden correcto:**
1. Obtener signer UUID real →
2. Actualizar en DB →
3. Desplegar worker →
4. ✅ Casts se publican exitosamente
