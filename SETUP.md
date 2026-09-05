# Fasalo — Local Setup

> The authoritative scope/problem statement lives in [README.md](./README.md).
> This file is the developer quick-start for running the project locally and for
> demonstrating the current phase.

## Prerequisites
- Node.js >= 18 (Node 26 tested)
- npm 10+
- Git
- (Phase 2+) Docker — for `docker-compose.yml` (PostgreSQL + MongoDB)

## Repository layout
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

## Running the app locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # optional: adjust PORT / DATABASE_URL
npm run dev               # dev mode (tsx watch) → http://localhost:4000
# or run the compiled build:
npm run build && npm start
# Health check:
curl http://localhost:4000/api/health
```

> Note: Phase 1 uses a file-backed JSON store (`backend/data/store.json`) so it
> runs without Docker/PostgreSQL. `data/store.json` ships with seeded demo users.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_BACKEND_URL= http://localhost:4000
npm run dev                          # → http://localhost:3000
```

Open `http://localhost:3000`.

## Phase 1 — Core Marketplace (done)

Builds on Phase 0. No AI / payments / logistics yet.

### What's implemented
- **Auth**: signup/login/JWT for `farmer`, `fpo`, `consumer`, `bulk_buyer` roles.
- **Farmer/FPO**: profile fields, create + list crop listings (quantity, price,
  quality grade, harvest date, location, FPO-aggregation flag).
- **Consumer**: browse marketplace, filter by crop/grade, place an order.
- **Bulk buyer**: view listings, submit a bid/negotiation proposal.
- **Farmer**: review bids per listing, accept (creates a confirmed order, deducts
  stock) or reject.
- **Order lifecycle**: `ordered -> confirmed -> delivered` (farmer drives it),
  with role-based guards and stock deduction on confirmation. `-> cancelled` also
  supported. Invalid transitions are rejected (400).
- **API surface**: `/api/auth`, `/api/listings`, `/api/orders`, `/api/bids`, `/api/health`.

### Seeded demo accounts (password: `secret123`)
| Role        | Email                 | What to do |
|-------------|-----------------------|------------|
| Farmer      | `farmer@fasalo.com`   | List produce, accept bulk bids, confirm/deliver orders |
| Consumer    | `consumer@fasalo.com` | Browse + place an order |
| Bulk buyer  | `bulk@fasalo.com`     | Submit a bid on a listing |

### 60-second demo flow
1. Log in as **Farmer** → `/farmer` → "+ List New Produce" → save a listing (e.g. Onion, 1000kg, ₹18/kg).
2. Log in as **Consumer** → Browse → open the listing → “Buy Now” → enter qty + address → Place Order.
3. Log in as **Bulk Buyer** → open the same listing → “Place Bid” → proposed ₹15/kg → Submit.
4. Log in as **Farmer** → `/farmer` → see the pending bid → **Accept** (order auto-confirms, stock reserved).
5. Farmer → `/orders` → **Confirm** the consumer order → **Mark Delivered**.

### Checks
- Backend: `npm run build` (tsc) + `npm run lint` — clean.
- Frontend: `npm run build` + `npm run lint` — clean.

## Databases (Phase 2+)
```bash
docker compose up -d   # starts postgres + mongodb
```
The health check currently reports `db: "not-yet-configured"`; Postgres wiring is
a Phase 2 upgrade path backed by `docker-compose.yml`.
