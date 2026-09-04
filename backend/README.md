# Fasalo Backend — Setup

## Prerequisites
- Node.js >= 18 (tested with Node 26)
- npm
- (Phase 1) PostgreSQL 15+ and/or MongoDB 6+ — run via `docker-compose up -d` at repo root

## Local development

```bash
cd backend
npm install
cp .env.example .env   # edit if needed
npm run dev            # starts API on http://localhost:4000 (hot reload via tsx)
```

## Health check
```bash
curl http://localhost:4000/api/health
```

## Build
```bash
npm run build        # compiles to ./dist
npm start            # runs dist/index.js
```

## Linting / Formatting
```bash
npm run lint
npm run format
```
