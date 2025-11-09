# 📤 Cómo Subir Este Proyecto a Tu Repositorio GitHub

## Opción 1: Descargar y Subir (Recomendado)

### Paso 1: Descargar el Proyecto
1. Descarga el archivo `caster-monorepo.tar.gz` que generé
2. Extráelo en tu máquina local:
   ```bash
   tar -xzf caster-monorepo.tar.gz
   cd caster
   ```

### Paso 2: Inicializar Git (si es nuevo repo)
```bash
git init
git add .
git commit -m "Initial commit: Farcaster Scheduler monorepo setup"
```

### Paso 3: Conectar con GitHub
```bash
# Agrega tu repositorio remoto
git remote add origin https://github.com/GsusFC/caster.git

# Si tu repo ya existe y tiene contenido:
git pull origin main --allow-unrelated-histories

# Sube todo
git push -u origin main
```

## Opción 2: Clonar y Agregar Archivos

Si ya tienes contenido en el repo:

```bash
# Clona tu repo
git clone https://github.com/GsusFC/caster.git
cd caster

# Extrae los archivos del monorepo aquí
tar -xzf ../caster-monorepo.tar.gz --strip-components=1

# Revisa los cambios
git status

# Agrega todo
git add .
git commit -m "Add monorepo structure with packages and apps"
git push origin main
```

## Opción 3: Crear Branch para Revisión

Si quieres revisar antes de hacer merge a main:

```bash
git clone https://github.com/GsusFC/caster.git
cd caster

# Crea un branch
git checkout -b setup/monorepo

# Extrae archivos
tar -xzf ../caster-monorepo.tar.gz --strip-components=1

# Commit y push
git add .
git commit -m "Setup monorepo architecture"
git push origin setup/monorepo

# Crea Pull Request en GitHub para revisar
```

## Verificación Post-Upload

Después de subir, verifica en GitHub que tienes:

```
✅ Root files (package.json, pnpm-workspace.yaml, etc.)
✅ apps/ directory
  ✅ apps/web/
  ✅ apps/worker/
✅ packages/ directory
  ✅ packages/core/
  ✅ packages/database/
  ✅ packages/farcaster/
  ✅ packages/types/
  ✅ packages/config/
✅ Documentation files (README.md, ARCHITECTURE.md, etc.)
✅ .gitignore and .gitattributes
```

## Siguientes Pasos en GitHub

### 1. Configurar Secrets (para CI/CD futuro)
En tu repo GitHub:
- Settings → Secrets and variables → Actions
- Agregar: `NEYNAR_API_KEY`, `DATABASE_URL`

### 2. Proteger Branch Main
- Settings → Branches → Add rule
- Require pull request reviews
- Require status checks

### 3. Configurar Deploy Automático
- **Netlify**: Conecta el repo, selecciona `apps/web`
- **Render**: Conecta el repo, detectará `render.yaml`

## Comandos Útiles

```bash
# Ver estado de Git
git status

# Ver archivos que se subirán
git diff --cached --name-only

# Deshacer último commit (si necesitas)
git reset --soft HEAD~1

# Ver historial
git log --oneline

# Crear .gitignore si hace falta
echo "node_modules/
.env
.turbo
dist/
.next/" > .gitignore
```

## Troubleshooting

### "remote: Permission denied"
- Verifica tu autenticación SSH o usa HTTPS
- Puede necesitar: `git config credential.helper store`

### "refusing to merge unrelated histories"
- Usa: `git pull origin main --allow-unrelated-histories`

### Archivos muy grandes
- Git puede rechazar archivos > 100MB
- Este monorepo no debería tener ese problema
- Si pasa, usa Git LFS

### El repo ya tiene contenido
1. Haz backup del contenido existente
2. Sube el monorepo
3. Integra tu contenido previo en la estructura nueva

## Contacto y Ayuda

Si tienes problemas:
1. Revisa los mensajes de error de Git
2. Usa `git status` para ver el estado
3. Consulta la documentación del proyecto
4. Abre un issue si encuentras bugs

¡Listo para empezar a desarrollar! 🚀
