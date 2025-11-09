# ✅ FASE 0: SETUP INICIAL - GUÍA COMPLETA

## 🎯 Objetivo

Configurar el entorno de desarrollo para que puedas empezar a desarrollar el Farcaster Scheduler.

---

## ✅ Ya Completado (en este repositorio)

- [x] Dependencias instaladas (`pnpm install`)
- [x] Archivo `.env` creado con `NEXTAUTH_SECRET` generado
- [x] Configuraciones de TypeScript corregidas
- [x] Estructura del proyecto verificada

---

## 🚀 Lo que DEBES HACER en tu entorno local

### Paso 1: Clonar el repositorio (si no lo has hecho)

```bash
git clone https://github.com/GsusFC/caster.git
cd caster
```

### Paso 2: Instalar dependencias

```bash
# Asegúrate de tener:
# - Node.js >= 18
# - pnpm >= 8

pnpm install
```

### Paso 3: Obtener credenciales necesarias

#### 3.1 NEYNAR_API_KEY

1. Ve a https://neynar.com
2. Regístrate o inicia sesión
3. Ve a Dashboard → API Keys
4. Crea una nueva API key
5. Copia la key (algo como: `NEYNAR_API_DOCS_...`)

#### 3.2 DATABASE_URL

**Opción A: PostgreSQL Local**

```bash
# Instala PostgreSQL si no lo tienes
# macOS:
brew install postgresql@14
brew services start postgresql@14

# Linux (Ubuntu/Debian):
sudo apt update
sudo apt install postgresql-14
sudo systemctl start postgresql

# Crea la base de datos
createdb farcaster_scheduler

# Tu DATABASE_URL será:
DATABASE_URL="postgresql://tu_usuario:tu_password@localhost:5432/farcaster_scheduler?schema=public"
```

**Opción B: Render.com (RECOMENDADO para producción)**

1. Ve a https://render.com
2. Regístrate o inicia sesión
3. Dashboard → New → PostgreSQL
4. Configura:
   - Name: `farcaster-scheduler-db`
   - Database: `farcaster_scheduler`
   - User: (auto-generado)
   - Region: Oregon (us-west)
   - PostgreSQL Version: 14
   - Plan: Free
5. Click "Create Database"
6. Espera 2-3 minutos a que se cree
7. Copia la **Internal Database URL**
   - Se ve como: `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/dbname`

### Paso 4: Configurar archivo .env

Edita el archivo `.env` en la raíz del proyecto:

```bash
nano .env
# o usa tu editor favorito
```

Actualiza estas líneas:

```env
# Database (usa la URL que obtuviste en Paso 3.2)
DATABASE_URL="postgresql://tu_database_url_aqui"

# Neynar API (usa la key del Paso 3.1)
NEYNAR_API_KEY="tu_neynar_api_key_aqui"

# NextAuth (ya está generado, déjalo como está)
NEXTAUTH_SECRET="gA1gFguXbiMCBRXPKoL8JDNIW2tIFLGzqHFMZqYSMGg="
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### Paso 5: Generar Prisma Client

```bash
cd packages/database

# Generar el cliente de Prisma
pnpm prisma:generate

# Si tienes errores de checksum (403 Forbidden), usa:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:generate
```

**Salida esperada:**
```
✔ Generated Prisma Client (5.9.1) to ./node_modules/@prisma/client
```

### Paso 6: Ejecutar migraciones de base de datos

```bash
# Aún en packages/database/
pnpm prisma:migrate

# o si tienes errores:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:migrate
```

**Salida esperada:**
```
Applying migration `20240101000000_init`
The following migration(s) have been applied:
migrations/
  └─ 20240101000000_init/
      └─ migration.sql

Your database is now in sync with your schema.
```

### Paso 7: Verificar que todo compila

```bash
# Vuelve a la raíz del proyecto
cd ../..

# Verifica tipos TypeScript
pnpm typecheck
```

**Salida esperada (sin errores):**
```
Tasks:    7 successful, 7 total
```

```bash
# Build completo
pnpm build
```

**Salida esperada:**
```
Tasks:    5 successful, 5 total
```

### Paso 8: Iniciar servidores de desarrollo

```bash
# Opción A: Iniciar todo
pnpm dev

# Opción B: Solo web app
pnpm dev:web

# Opción C: Solo worker
pnpm dev:worker
```

**Deberías ver:**

**Terminal Web:**
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.5s
```

**Terminal Worker:**
```
🚀 Starting Farcaster Scheduler Worker...
✅ Cron worker started successfully
⏰ Running every minute...
[timestamp] 🔄 Checking for scheduled casts...
[timestamp] ✅ Completed: { total: 0, successful: 0, failed: 0 }
```

### Paso 9: Verificar en el navegador

Abre tu navegador y ve a:

```
http://localhost:3000
```

Deberías ver la landing page del Farcaster Scheduler.

---

## ✅ Criterios de Éxito de FASE 0

Marca cada uno cuando lo completes:

- [ ] Dependencias instaladas sin errores
- [ ] Archivo `.env` configurado con credenciales reales
- [ ] `NEYNAR_API_KEY` obtenida de neynar.com
- [ ] `DATABASE_URL` configurada (local o Render.com)
- [ ] Prisma client generado exitosamente
- [ ] Migraciones de DB ejecutadas
- [ ] `pnpm typecheck` pasa sin errores
- [ ] `pnpm build` completa exitosamente
- [ ] Web app inicia en http://localhost:3000
- [ ] Worker inicia y muestra logs cada minuto
- [ ] Navegador muestra landing page correctamente

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
cd packages/database
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:generate
cd ../..
pnpm build
```

### Error: "ECONNREFUSED" al conectar a DB

- Verifica que PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` en `.env` sea correcta
- Si usas Render.com, usa la **Internal Database URL**, no la External

### Error: "403 Forbidden" al descargar Prisma engines

```bash
# Agrega esta variable antes de cada comando prisma:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma:migrate
```

### Error: "TypeScript errors" después de generar Prisma

```bash
# Rebuilds todos los packages
pnpm clean
pnpm install
pnpm build
```

### Worker no inicia o crash inmediatamente

- Verifica que `DATABASE_URL` en `.env` sea correcta
- Verifica que `NEYNAR_API_KEY` esté configurada
- Revisa los logs en la terminal para ver el error específico

---

## 🎯 Próximos Pasos

Una vez que completes **TODOS** los criterios de éxito de FASE 0:

**Continúa con FASE 1:** Verificar Funcionamiento Básico

Lee la sección de FASE 1 en `PLAN_DESARROLLO.md` para:
- Crear un usuario de prueba en la DB
- Crear un cast programado manualmente
- Verificar que el worker lo detecta y publica

---

## 📚 Recursos Útiles

**Documentación del proyecto:**
- `PLAN_DESARROLLO.md` - Plan completo de 5 fases
- `ARCHITECTURE.md` - Arquitectura del sistema
- `.env.example` - Template de variables de entorno

**Enlaces externos:**
- [Neynar Dashboard](https://neynar.com)
- [Render.com Dashboard](https://render.com)
- [Prisma Docs](https://www.prisma.io/docs)

**Comandos útiles:**
```bash
# Ver base de datos en interfaz visual
cd packages/database
pnpm prisma:studio

# Verificar tipos sin compilar
pnpm typecheck

# Limpiar todo y rebuilds
pnpm clean
pnpm install
pnpm build
```

---

## 💡 Tips

1. **Usa Render.com para DB** - Es gratis y evita configuración local
2. **Guarda tus credenciales** - Apúntalas en un lugar seguro
3. **No commitees .env** - Ya está en .gitignore
4. **Usa Prisma Studio** - Para ver/editar datos fácilmente
5. **Revisa logs del worker** - Muy útil para debugging

---

## ✅ Checklist Final

Antes de continuar a FASE 1, verifica:

```bash
# 1. TypeCheck pasa
pnpm typecheck
# → Tasks: 7 successful

# 2. Build completa
pnpm build
# → Tasks: 5 successful

# 3. Servicios inician
pnpm dev
# → Web en :3000
# → Worker con logs cada minuto

# 4. Navegador funciona
open http://localhost:3000
# → Landing page visible
```

Si **TODO** lo anterior funciona: **¡FASE 0 COMPLETA!** 🎉

Continúa con **FASE 1** en `PLAN_DESARROLLO.md`.

---

**¿Problemas?** Abre un issue en GitHub o revisa la sección de Troubleshooting arriba.
