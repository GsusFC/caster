# 🔐 Cómo Obtener Signer UUID Real de Neynar

## Paso 1: Obtener API Key

1. **Ir a Neynar Dev Portal:**
   - Abre: https://dev.neynar.com
   - Click en **Sign in**
   - Sign in with Farcaster (usa tu FID 6099 - 0xgsus.eth)

2. **Crear/Ver tu API Key:**
   - Una vez dentro, ve a **Dashboard**
   - Busca sección **API Keys**
   - Si no tienes una, click **Create API Key**
   - Copia el API Key (se ve como: `NEYNAR_API_DOCS_xxxxxxxx`)
   - ⚠️ **GUÁRDALO** - lo necesitarás para desplegar el worker

---

## Paso 2: Crear un Signer (Método con API)

Neynar te permite crear signers programáticamente. Vamos a hacerlo desde tu máquina:

### Opción A: Usando curl (Recomendado)

```bash
# Reemplaza YOUR_API_KEY con tu key de Neynar
curl -X POST https://api.neynar.com/v2/farcaster/signer \
  -H "accept: application/json" \
  -H "api_key: YOUR_API_KEY" \
  -H "content-type: application/json"
```

**Respuesta esperada:**
```json
{
  "signer_uuid": "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec",
  "public_key": "0x1234...",
  "status": "pending_approval",
  "signer_approval_url": "https://client.warpcast.com/deeplinks/sign-in-with-farcaster?..."
}
```

### Paso 2.1: Aprobar el Signer

1. **Copia el `signer_approval_url`** de la respuesta
2. **Ábrela en tu navegador**
3. Se abrirá Warpcast pidiendo aprobación
4. **Aprueba el signer** desde Warpcast
5. ¡Listo! El signer ahora está activo

### Paso 2.2: Verificar el Signer

```bash
# Reemplaza YOUR_API_KEY y SIGNER_UUID
curl https://api.neynar.com/v2/farcaster/signer?signer_uuid=SIGNER_UUID \
  -H "accept: application/json" \
  -H "api_key: YOUR_API_KEY"
```

**Deberías ver:**
```json
{
  "signer_uuid": "19d0c5fd-9b33-4a48-a0e2-bc7b0555baec",
  "fid": 6099,
  "status": "approved"
}
```

---

## Opción B: Usando el Dashboard (Si está disponible)

Si Neynar tiene una UI para crear signers:

1. Dashboard → **Signers** (o similar)
2. Click **Create New Signer**
3. Selecciona FID: **6099**
4. Sigue el flow de aprobación en Warpcast
5. Copia el **signer_uuid** que se genera

---

## Paso 3: Guardar el Signer UUID

Una vez que tengas el signer aprobado:

1. **Copia el signer_uuid** (ejemplo: `19d0c5fd-9b33-4a48-a0e2-bc7b0555baec`)
2. **NO lo pierdas** - lo necesitarás para actualizar la base de datos

---

## Paso 4: Actualizar Base de Datos

Necesitas conectarte a tu base de datos en Render y actualizar el signer:

### 4.1 Conectar a la Base de Datos

1. Ve a: https://dashboard.render.com
2. Click en tu base de datos: **farcaster-scheduler-db**
3. Click en **Connect** (parte superior derecha)
4. Copia el comando **PSQL Command**
5. Ábrelo en tu terminal

**El comando se ve así:**
```bash
PGPASSWORD=xxx psql -h dpg-xxx.oregon-postgres.render.com -U farcaster_user farcaster_scheduler
```

### 4.2 Actualizar el Signer UUID

Una vez conectado al psql, ejecuta:

```sql
-- Ver el signer actual (debería ser demo-signer-xxx)
SELECT id, fid, username, "signerUuid"
FROM "User"
WHERE fid = 6099;

-- Actualizar con el signer real de Neynar
UPDATE "User"
SET "signerUuid" = 'tu-signer-uuid-real-de-neynar'
WHERE fid = 6099;

-- Verificar que se actualizó
SELECT id, fid, username, "signerUuid"
FROM "User"
WHERE fid = 6099;
```

**Deberías ver:**
```
                   id                   | fid  | username | signerUuid
----------------------------------------|------|----------|-----------------------------------
cmhtopfub0000la0b233e3bh2               | 6099 | 0xgsus   | 19d0c5fd-9b33-4a48-a0e2-bc7b0555baec
```

### 4.3 Salir de psql

```bash
\q
```

---

## ✅ Verificación Final

Antes de desplegar el worker, verifica:

- [ ] Tienes tu **NEYNAR_API_KEY**
- [ ] Creaste un **signer** usando la API o Dashboard
- [ ] El signer está en estado **"approved"**
- [ ] Actualizaste el **signerUuid** en la base de datos
- [ ] El nuevo signerUuid NO empieza con "demo-signer-"

---

## 🚀 Ahora SÍ: Desplegar Worker

Con el signer real configurado, ahora los casts se publicarán exitosamente.

Siguiente paso: Seguir **WORKER_DEPLOYMENT_CHECKLIST.md** para desplegar en Render.

---

## 🐛 Troubleshooting

### Error: "Signer not found"

- Verifica que copiaste el signer_uuid completo
- Verifica que el signer esté en estado "approved"

### Error: "Invalid API Key"

- Verifica que tu NEYNAR_API_KEY sea correcta
- Verifica que no haya espacios al inicio/final

### Error: "Signer not approved"

- Abre el `signer_approval_url` de nuevo
- Aprueba desde Warpcast
- Espera 1-2 minutos
- Verifica estado de nuevo

---

## 📚 Referencias

- **Neynar API Docs:** https://docs.neynar.com
- **Create Signer:** https://docs.neynar.com/reference/create-signer
- **Signer Status:** https://docs.neynar.com/reference/signer
- **Render PostgreSQL:** https://render.com/docs/databases

---

## 💡 Notas Importantes

1. **Un signer por FID**: Solo necesitas un signer para tu FID 6099
2. **No expira**: Una vez aprobado, el signer funciona indefinidamente
3. **No compartas**: El signer_uuid es privado para tu cuenta
4. **API Key gratis**: Neynar ofrece tier gratuito para desarrollo

---

**¿Listo para continuar?** Una vez que tengas el signer configurado, el worker podrá publicar casts exitosamente. 🎉
