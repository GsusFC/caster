# 🚀 Guía de Deployment a Render.com

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener:

- [x] Cuenta en GitHub con repo `GsusFC/caster`
- [x] Cuenta en Render.com (regístrate con GitHub)
- [x] NEYNAR_API_KEY de https://neynar.com
- [x] Código en rama `main` o `master`

---

## 🗄️ PASO 1: Crear Base de Datos PostgreSQL

### 1.1 Crear la base de datos

1. Ve a https://dashboard.render.com
2. Click **New** → **PostgreSQL**
3. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | `farcaster-scheduler-db` |
| **Database** | `farcaster_scheduler` |
| **User** | `farcaster_user` |
| **Region** | Oregon (us-west) |
| **PostgreSQL Version** | 16 (o latest) |
| **Plan** | Free |

4. Click **Create Database**
5. Espera 2-3 minutos mientras se crea

### 1.2 Copiar Database URL

Cuando la DB esté lista:

1. En la página de la DB, busca **Connections**
2. Copia la **Internal Database URL**
   - Se ve como: `postgresql://user:pass@dpg-xxx-a.oregon-postgres.render.com/dbname`
   - ⚠️ Usa la **Internal URL**, NO la External

3. Guárdala, la necesitarás en el siguiente paso

---

## ⚙️ PASO 2: Crear Worker Service

### 2.1 Nuevo servicio

1. Dashboard → **New** → **Background Worker**
2. Connect repository:
   - Click **Connect account** si es primera vez
   - Selecciona `GsusFC/caster`
   - Click **Connect**

### 2.2 Configurar servicio

| Campo | Valor |
|-------|-------|
| **Name** | `farcaster-scheduler-worker` |
| **Region** | Oregon (us-west) |
| **Branch** | `main` (o la rama que uses) |
| **Root Directory** | (déjalo vacío) |
| **Environment** | Node |

### 2.3 Build & Start Commands

**⚠️ IMPORTANTE**: Usa exactamente estos comandos

**Build Command:**
```bash
corepack enable && corepack prepare pnpm@8.15.0 --activate && pnpm install && pnpm --filter=worker build && pnpm --filter=database prisma generate
```

**Start Command:**
```bash
node apps/worker/dist/index.js
```

### 2.4 Environment Variables

Click **Add Environment Variable** para cada una:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `<pega la Internal URL del Paso 1.2>` |
| `NEYNAR_API_KEY` | `<tu key de neynar.com>` |
| `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING` | `1` |

### 2.5 Crear el servicio

1. Verifica que todo esté correcto
2. Click **Create Background Worker**
3. Render iniciará el deploy automáticamente

---

## 📊 PASO 3: Verificar Deployment

### 3.1 Ver logs del build

1. En la página del worker, ve a **Logs**
2. Deberías ver el build en progreso:

```bash
==> Cloning from https://github.com/GsusFC/caster
==> Running build command...
corepack enable
corepack prepare pnpm@8.15.0 --activate
pnpm install
...
==> Build succeeded ✓
```

**Build exitoso** ✅:
- Sin errores rojos
- Termina con "Build succeeded"
- Tiempo estimado: 3-5 minutos

### 3.2 Ver logs del worker

Una vez que el build termine, verás los logs del worker:

```bash
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...
[timestamp] 🔄 Checking for scheduled casts...
[timestamp] ✅ Completed: { total: 0, successful: 0, failed: 0 }
```

**Si ves esto:** ✅ ¡Deploy exitoso!

---

## 🐛 Troubleshooting

### Error: "packageManager mismatch"

```
error This project's package.json defines "packageManager": "pnpm@8.15.0"
```

**Solución:**
- Asegúrate de que el build command incluya `corepack enable`
- Verifica que no hayas modificado el package.json

### Error: "Cannot find module '@prisma/client'"

```
Error: Cannot find module '@prisma/client'
```

**Solución:**
- Agrega a build command: `pnpm --filter=database prisma generate`
- Agrega variable de entorno: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`

### Error: "ECONNREFUSED" o "connection refused"

```
Error: connect ECONNREFUSED
```

**Solución:**
- Verifica que `DATABASE_URL` sea la **Internal URL** (no External)
- Verifica que la DB esté en estado "Available"
- Asegúrate de que worker y DB estén en la misma región (Oregon)

### Error: "NEYNAR_API_KEY is required"

```
Error: NEYNAR_API_KEY environment variable is required
```

**Solución:**
- Ve a Environment → Add Variable
- Key: `NEYNAR_API_KEY`
- Value: tu key de neynar.com

### Build muy lento o timeout

**Solución:**
- Render Free tier puede ser lento
- Espera pacientemente (hasta 10 minutos)
- Si falla, click **Manual Deploy** para reintentar

### Worker se reinicia constantemente

1. Ve a **Logs**
2. Busca el error específico
3. Verifica todas las variables de entorno
4. Asegúrate que `startCommand` apunte a `apps/worker/dist/index.js`

---

## 🔄 Actualizar Deployment

### Desde el Dashboard

1. Ve a tu worker
2. Click **Manual Deploy**
3. Selecciona la rama
4. Click **Deploy**

### Automático (en cada push)

Render hace auto-deploy cuando:
- Haces push a la rama configurada (ej: `main`)
- El commit es nuevo

Para desactivar:
- Settings → Build & Deploy → Auto-Deploy: Off

---

## 📈 Monitoreo

### Ver métricas

1. Ve a tu worker en Dashboard
2. Click **Metrics**
3. Verás:
   - CPU Usage
   - Memory Usage
   - Restart count

### Ver logs en vivo

1. Ve a **Logs**
2. Deberías ver mensajes cada minuto:
   ```
   [timestamp] 🔄 Checking for scheduled casts...
   ```

### Conectar con la DB

Para ver datos en Prisma Studio desde local:

1. Copia la **External Database URL** de Render
2. En tu `.env` local temporalmente:
   ```env
   DATABASE_URL="<External URL de Render>"
   ```
3. Ejecuta:
   ```bash
   cd packages/database
   pnpm prisma:studio
   ```
4. Abre http://localhost:5555

---

## 💰 Costos

### Plan Free de Render

**Worker (Background Service):**
- ✅ Gratis
- ⏱️ 750 horas/mes gratis
- 💾 512MB RAM
- 🔄 Se duerme después de 15 min sin actividad
- ⚠️ Se reinicia cada 24 horas

**PostgreSQL Database:**
- ✅ Gratis
- 💾 256MB Storage
- 🔒 90 días de retención
- ⚠️ Expira después de 90 días (requiere upgrade)

### ⚠️ Limitaciones Free Tier

1. **Worker puede dormirse**: Se despierta solo cuando hay actividad
2. **DB expira en 90 días**: Debes hacer upgrade a paid plan
3. **500MB max para build**: Nuestro monorepo está OK

### Upgrade a Paid

Si necesitas más:
- **Starter Plan**: $7/mes por servicio
- **DB Standard**: $7/mes (1GB, sin expiración)

---

## ✅ Checklist Post-Deployment

Verifica que todo funcione:

- [ ] Build completa sin errores
- [ ] Worker inicia correctamente
- [ ] Logs muestran "🔄 Checking for scheduled casts..." cada minuto
- [ ] DATABASE_URL configurada (Internal URL)
- [ ] NEYNAR_API_KEY configurada
- [ ] DB está en estado "Available"
- [ ] Métricas muestran CPU/Memory usage normal
- [ ] No hay errores en los logs

---

## 🔐 Seguridad

### Variables de entorno

- ✅ Nunca commitees `.env` al repo
- ✅ Usa Render Environment Variables
- ✅ Rota NEYNAR_API_KEY periódicamente

### Database

- ✅ Usa Internal URL (más segura)
- ✅ External URL solo para debug local
- ✅ Habilita backups (en paid plan)

---

## 🚀 Próximos Pasos

Una vez que el worker esté desplegado y corriendo:

1. **Despliega la Web App** a Netlify (ver `DEPLOYMENT_NETLIFY.md`)
2. **Prueba el flujo completo**:
   - Crea un cast en la web app
   - Verifica que se guarde en DB
   - Observa logs del worker
   - Confirma que se publique a Farcaster
3. **Configura monitoring** (opcional)
4. **Haz backup de la DB** (recomendado)

---

## 📚 Recursos

**Render.com:**
- [Documentación oficial](https://render.com/docs)
- [Node.js en Render](https://render.com/docs/deploy-node-express-app)
- [Background Workers](https://render.com/docs/background-workers)
- [PostgreSQL](https://render.com/docs/databases)

**Troubleshooting:**
- [Common Deploy Issues](https://render.com/docs/troubleshooting-deploys)
- [Build Fails](https://render.com/docs/build-fails)

**Nuestro proyecto:**
- `render.yaml` - Configuración Infrastructure as Code
- `ARCHITECTURE.md` - Arquitectura del sistema
- `FASE_0_SETUP.md` - Setup local

---

## 💡 Tips

1. **Usa render.yaml**: Puedes deployar automáticamente usando el archivo
2. **Logs son tu amigo**: Siempre revisa logs primero cuando algo falle
3. **Testing local primero**: Asegúrate que `pnpm build` funcione local
4. **Free tier es suficiente**: Para empezar y testing
5. **Monitorea uso**: Para no exceder 750 horas/mes

---

**¿Problemas durante el deployment?**

1. Revisa la sección de Troubleshooting arriba
2. Verifica logs en Render Dashboard
3. Compara tu configuración con `render.yaml`
4. Pregunta en el Discord de Render

¡Éxito con tu deployment! 🎉
