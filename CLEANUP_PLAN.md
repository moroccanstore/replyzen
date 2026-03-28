# Full Cleanup Plan for AutoWhats/ReplyZen

## 🗑️ Files/Folders to REMOVE

### 1. Duplicate/Nested Structure
- `apps/autowhats/` - **ENTIRE FOLDER** (duplicate nested repository)
- `apps/web/` - Empty directory

### 2. Build Artifacts
- `node_modules/` (root)
- `apps/api/node_modules/`
- `apps/api/dist/`
- `apps/landing/.next/`
- `apps/landing/node_modules/`
- `apps/license-server/dist/` (if exists)

### 3. Log/Output Files
- `*.log`
- `api_build_output.txt`
- `build_output.txt`
- `prisma_gen_output.txt`
- `tsc_errors.txt`
- `lint_errors.txt`
- `db_error.txt`
- `err.txt`
- `prisma_error.txt`
- `stress-report.txt`
- `stress-test-error.txt`
- `stress-test-output.txt`
- `git_status.txt`

### 4. Screenshot/Images (not needed in repo)
- `*.png` (ai-setup.png, analytics.png, automation.png, etc.)

### 5. Temporary/Config Files
- `.env` (should be in .gitignore)
- `.env.local`
- `.env.tmp`
- `installed.lock`

### 6. IDE Files
- `.idea/`
- `.vscode/` (if exists)

### 7. Old Scripts
- `apps/legacy_scripts/` (if not needed)
- `scripts/` (root - if duplicate)

---

## ✅ Files/Folders to KEEP

### Core Application
- `apps/api/` - Main API (src, prisma, test, config files)
- `apps/landing/` - Landing page (src, public, config files)
- `apps/license-server/` - License validation service

### Documentation
- `README.md`
- `INSTALL.md`
- `DOCKER_INSTALL.md`
- `REQUIREMENTS.md`
- `SECURITY.md`
- `CRITICAL_FIXES_SUMMARY.md`

### Configuration
- `.gitignore`
- `.nvmrc`
- `.github/workflows/ci.yml`
- `package.json` (root)
- `apps/api/package.json`
- `apps/landing/package.json`
- `apps/license-server/package.json`

### Infrastructure
- `docker-compose.yml` (if in root)
- `ecosystem.config.js` (PM2 config)

---

## 📝 Recommended .gitignore Update

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.example
.env.tmp
*.env

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln

# OS
.DS_Store
Thumbs.db
desktop.ini

# Testing
coverage/
.nyc_output/

# Prisma
prisma/migrations/dev.db

# Temporary
*.tmp
*.temp
installed.lock

# Large files
*.zip
*.tar.gz
>100MB

# Generated (Prisma)
src/generated/
```

---

## 🚀 Cleanup Commands

```bash
# 1. Remove duplicate nested structure
rm -rf apps/autowhats
rm -rf apps/web

# 2. Remove build artifacts
rm -rf node_modules
rm -rf apps/api/node_modules
rm -rf apps/api/dist
rm -rf apps/landing/.next
rm -rf apps/landing/node_modules

# 3. Remove log files
rm -f *.txt
rm -f *.log

# 4. Remove images
rm -f *.png

# 5. Remove IDE folders
rm -rf .idea
rm -rf .vscode

# 6. Remove legacy scripts
rm -rf apps/legacy_scripts

# 7. Clean git cache
git rm -r --cached apps/autowhats
git rm -r --cached apps/web
git rm -r --cached node_modules
git rm -r --cached apps/api/node_modules
git rm -r --cached apps/landing/.next

# 8. Commit cleanup
git add -A
git commit -m "chore: cleanup - remove duplicate folders, build artifacts, and unnecessary files"
```

---

## 📊 Estimated Size Reduction

| Category | Before | After | Saved |
|----------|--------|-------|-------|
| **node_modules** | ~2 GB | 0 | 2 GB |
| **apps/autowhats (duplicate)** | ~800 MB | 0 | 800 MB |
| **Build artifacts** | ~500 MB | 0 | 500 MB |
| **Images/Screenshots** | ~50 MB | 0 | 50 MB |
| **Total** | ~3.35 GB | ~50 MB (source) | **~3.3 GB** |

---

## ⚠️ Warnings

1. **Backup first** - Create a backup before running cleanup
2. **Check .env** - Ensure no production secrets are lost
3. **Test after** - Verify application still builds after cleanup
4. **GitHub LFS** - Consider using for large necessary files

---

**Cleanup Target:** Repository should be < 100 MB after cleanup (excluding node_modules)
