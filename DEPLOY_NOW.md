# 🚀 Guía Rápida: Desplegar Worker AHORA

Sigue estos pasos en orden. Total: **15-20 minutos**.

---

## ✅ PASO 1: Verificar Render.com (2 min)

1. Ve a: https://dashboard.render.com
2. ¿Ves un servicio llamado **farcaster-scheduler-worker**?

   **SI lo ves:**
   - Click en el servicio
   - Click **Settings** (en el menú izquierdo)
   - Scroll down → Click **Suspend Service**
   - ✅ Continúa al Paso 2

   **NO lo ves:**
   - ✅ Perfecto, continúa al Paso 2

---

## 🔐 PASO 2: Obtener Signer de Neynar (5-10 min)

### Opción A: Script Automático (Recomendado)

1. **Primero, obtén tu API Key de Neynar:**
   - Ve a: https://dev.neynar.com
   - Sign in with Farcaster
   - Dashboard → API Keys → Copy API Key

2. **Ejecuta el script:**
   ```bash
   cd /home/user/caster
   ./scripts/setup-neynar-signer.sh
   ```

3. **Sigue las instrucciones:**
   - Pega tu NEYNAR_API_KEY cuando te la pida
   - Copia el link de aprobación
   - Ábrelo en tu navegador
   - Aprueba desde Warpcast
   - Presiona ENTER

4. **El script te dará:**
   - ✅ Signer UUID
   - ✅ SQL command para actualizar DB
   - ✅ Todo listo para siguiente paso

### Opción B: Manual

Sigue la guía completa en: `NEYNAR_SIGNER_SETUP.md`

---

## 🗄️ PASO 3: Actualizar Base de Datos (2 min)

1. **Conectar a la DB:**
   - Ve a: https://dashboard.render.com
   - Click en: **farcaster-scheduler-db**
   - Click en: **Connect** (botón arriba a la derecha)
   - Copia el comando **PSQL Command**
   - Pégalo en tu terminal

2. **Actualizar el signer:**
   ```sql
   -- Reemplaza TU_SIGNER_UUID con el que obtuviste en Paso 2
   UPDATE "User"
   SET "signerUuid" = 'TU_SIGNER_UUID'
   WHERE fid = 6099;
   ```

3. **Verificar:**
   ```sql
   SELECT fid, username, "signerUuid"
   FROM "User"
   WHERE fid = 6099;
   ```

   Deberías ver tu nuevo signer (NO debería empezar con "demo-signer-")

4. **Salir:**
   ```sql
   \q
   ```

---

## 🚀 PASO 4: Desplegar Worker en Render (5-10 min)

1. **Ve a Render Dashboard:**
   - https://dashboard.render.com

2. **Crear nuevo Background Worker:**
   - Click **New** (arriba derecha)
   - Selecciona **Background Worker**

3. **Conectar repositorio:**
   - Click **Connect account** (si es primera vez)
   - Selecciona: **GsusFC/caster**
   - Click **Connect**

4. **Configurar Worker:**

   | Campo | Valor |
   |-------|-------|
   | **Name** | `farcaster-scheduler-worker` |
   | **Region** | `Oregon (US West)` |
   | **Branch** | `claude/analiza-el-011CUxECeeQEb6TeK8EQbp5E` |
   | **Root Directory** | (dejar vacío) |
   | **Environment** | `Node` |
   | **Plan** | **Free** |

5. **Build Command** (copia exactamente esto):
   ```bash
   corepack prepare pnpm@8.15.0 --activate && export PATH="$HOME/.node/corepack/pnpm/8.15.0/bin:$PATH" && pnpm install && cd packages/database && pnpm prisma generate && cd ../.. && pnpm --filter=worker... build
   ```

6. **Start Command**:
   ```bash
   node apps/worker/dist/index.js
   ```

7. **Variables de Entorno** (Click "Add Environment Variable" para cada una):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | (copiar de tu DB en Render - Internal Connection String) |
   | `NEYNAR_API_KEY` | (tu API key del Paso 2) |
   | `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING` | `1` |

   **Para obtener DATABASE_URL:**
   - En tu dashboard de Render
   - Click en: **farcaster-scheduler-db**
   - Busca: **Internal Database URL**
   - Cópiala completa (empieza con `postgresql://...`)

8. **Crear el Worker:**
   - Click **Create Background Worker**
   - Espera 5-10 minutos mientras hace build

---

## ✅ PASO 5: Verificar que Funcione (2 min)

1. **Ver Logs del Build:**
   - En la página del worker, ve a **Logs**
   - Deberías ver:
     ```
     ==> Building...
     ==> Build succeeded ✓
     ```

2. **Ver Logs del Worker:**
   - Deberías ver cada minuto:
     ```
     🚀 Starting Farcaster Scheduler Worker...
     ✅ Cron worker started successfully
     ⏰ Running every minute...
     🔄 Checking for scheduled casts...
     ✅ Completed: { total: 0, successful: 0, failed: 0 }
     ```

3. **Probar con un Cast Real:**
   - Ve a tu app: https://caster-farcaster.netlify.app
   - Crea un cast programado para **2 minutos** en el futuro
   - Espera 2 minutos
   - Refresca la página
   - El cast debería cambiar de **PENDING** a **PUBLISHED** ✅

---

## 🎉 ¡Listo!

Si ves esto en los logs:
```
✅ Published cast: [cast_id]
```

**¡Funcionó!** Tu worker está publicando casts automáticamente a Farcaster. 🚀

---

## 🐛 Si Algo Sale Mal

### Build falla con "Cannot find module"

**Verifica:**
- Build command esté exacto como arriba
- Incluye `pnpm prisma generate`

### Worker se reinicia constantemente

**Revisa logs para ver el error exacto:**
- Probablemente DATABASE_URL incorrecta
- O NEYNAR_API_KEY incorrecta

### Casts siguen marcándose como FAILED

**Verifica:**
1. Que el signer en DB NO sea "demo-signer-xxx"
   ```sql
   SELECT "signerUuid" FROM "User" WHERE fid = 6099;
   ```

2. Que el signer esté aprobado en Neynar:
   ```bash
   curl "https://api.neynar.com/v2/farcaster/signer?signer_uuid=TU_SIGNER" \
     -H "api_key: TU_API_KEY"
   ```

### DATABASE_URL: No encuentro la Internal URL

1. Dashboard → **farcaster-scheduler-db**
2. Busca sección: **Connections**
3. Copia: **Internal Database URL** (no External)
4. Se ve como: `postgresql://farcaster_user:xxx@dpg-xxx-a.oregon-postgres.render.com/farcaster_scheduler`

---

## 💰 Costos

**Plan FREE actual:**
- Worker: **$0/mes** ✅
- Database: **$0/mes** (por 90 días) ⏰

**Después de 90 días:**
- Necesitarás upgrade a Starter ($7/mes para DB)
- O migrar a otra DB gratuita

---

## 📚 Documentos de Referencia

- `NEYNAR_SIGNER_SETUP.md` - Guía detallada del signer
- `WORKER_DEPLOYMENT_CHECKLIST.md` - Checklist completo
- `DEPLOYMENT_RENDER.md` - Guía original de Render
- `render.yaml` - Configuración Infrastructure as Code

---

**¿Todo funcionando?** ¡Felicidades! Ahora puedes programar casts y se publicarán automáticamente. 🎊
