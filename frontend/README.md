# Fasalo Frontend (Next.js)

React + Next.js (TypeScript, App Router, Tailwind CSS) frontend for the Fasalo
farmer-to-consumer marketplace (Smart India Hackathon — Problem 26033).

## Prerequisites
- Node.js >= 18
- A running **backend** on `http://localhost:4000` (see `/backend`)

## Local development

```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_BACKEND_URL if your backend is elsewhere
npm run dev        # http://localhost:3000
```

## What Phase 0 proves
The home page (`/`) fetches the backend health-check endpoint
(`${NEXT_PUBLIC_BACKEND_URL}/api/health`) and renders the live status — the
end-to-end frontend ↔ backend smoke test required by Phase 0.
