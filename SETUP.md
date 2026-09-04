# Fasalo — Local Setup (Phase 0)

> The authoritative scope/problem statement lives in [README.md](./README.md).
> This file is the developer quick-start for running the project locally.

## Prerequisites
- Node.js >= 18 (Node 26 tested)
- npm 10+
- Git
- (Phase 1+) Docker — for `docker-compose.yml` (PostgreSQL + MongoDB)

## Repository layout (Phase 0)
```
fasalo/
├── frontend/        # Next.js 16 (TypeScript, App Router, Tailwind)
├── backend/         # Node.js + Express (TypeScript)
├── ai-services/     # Python AI micro-services — scaffold only (Phase 4)
├── docker-compose.yml   # PostgreSQL + MongoDB (boot when Docker is available)
├── .gitignore
├── README.md        # Problem statement & feature spec (source of truth)
└── SETUP.md         # This file
```

## Running Phase 0 locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # optional: adjust PORT / DATABASE_URL
npm run dev               # → http://localhost:4000
# Health check:
curl http://localhost:4000/api/health
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_BACKEND_URL= ...
npm run dev                          # → http://localhost:3000
```

Open `http://localhost:3000` — the home page fetches the backend health endpoint
and shows live status. That is the Phase 0 smoke test (frontend ↔ backend).

## Databases (Phase 1+)
```bash
docker compose up -d   # starts postgres + mongodb
```
The backend currently returns `db: "not-yet-configured"` in the health check;
this will be wired to PostgreSQL in Phase 1.
