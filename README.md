# AUTOWHATS — AI-Powered WhatsApp CRM

> AI-first WhatsApp automation platform. Keyword rules, AI replies, broadcast campaigns, real-time inbox.

## 🏗️ Architecture
```
[Next.js UI] → [NestJS API] → [BullMQ + Redis] → [PostgreSQL]
                                     ↓
                         [WhatsApp API | OpenAI | Stripe]
```

## 📦 Monorepo Structure
```
autowhats/
├── apps/
│   ├── api/     NestJS backend (port 3001)
│   └── web/     Next.js frontend (port 3000)
├── .env.example
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run setup wizard
```bash
npm run dev
# Open http://localhost:3000/install
```
The wizard will:
- Check server requirements
- Configure your database & Redis
- Run Prisma migrations
- Create your admin account
- Connect WhatsApp

### 4. Start developing
```bash
npm run dev
```

## 📄 Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + Web in development |
| `npm run build` | Build both apps for production |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed demo data |

## 🔒 Security
- JWT access + refresh tokens
- Bcrypt password hashing
- Workspace isolation (multi-tenant)
- API key encryption
- Rate limiting

## 📚 Documentation
- [API Reference](./apps/api/README.md)
- [Frontend Guide](./apps/web/README.md)

## 📄 License
Commercial License — AUTOWHATS
