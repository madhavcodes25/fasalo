# Fasalo Frontend (Next.js)

React + Next.js (TypeScript, App Router, Tailwind CSS) frontend for the Fasalo
farmer-to-consumer marketplace (Smart India Hackathon — Problem 26033).

## Prerequisites
- Node.js >= 18
- A running **backend** on `http://localhost:4000` (see `/backend`)
- For the Phase 4 price-suggestion hook, the AI service on `http://localhost:8000` (see `/ai-services`)

## Local development

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set backend/AI URLs if your services are elsewhere
npm run dev        # http://localhost:3000
```

## What Phase 0 proves
The home page (`/`) fetches the backend health-check endpoint
(`${NEXT_PUBLIC_BACKEND_URL}/api/health`) and renders the live status — the
end-to-end frontend ↔ backend smoke test required by Phase 0.
