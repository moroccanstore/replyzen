# 🔄 Update Guide — AutoWhats

We regularly release updates with new features and performance improvements. Follow these steps to update your installation safely.

## 1. Backup Your Data
Always backup your PostgreSQL database before performing an update.

```bash
pg_dump -U your_user db_name > backup.sql
```

## 2. Pull Latest Changes
Navigate to your project root and pull the latest code.

```bash
git pull origin main
```

## 3. Install & Build
Update dependencies and rebuild the application.

```bash
npm install
npm run build
```

## 4. Apply Database Migrations
If the update includes database changes, run:

```bash
cd apps/api
npx prisma migrate deploy
```

## 5. Restart Services
Restart your application processes to apply the changes.

```bash
pm2 restart all
```

---
**Note:** If you encounter any "Prisma Client" errors after updating, run `npx prisma generate` inside the `apps/api` directory.
