# Fasalo 🌾
### Direct Farmer-to-Consumer Digital Marketplace

**Tagline:** *Fasal Seedhe Aapke Paas* (Crops, Straight to You)

---

## Problem Statement

| Field | Detail |
|---|---|
| **Problem Statement ID** | 26033 |
| **Title** | Multiple intermediaries reduce farmers' earnings and increase consumer prices |
| **Organization** | Ministry of Consumer Affairs, Food & Public Distribution |
| **Department** | Department of Consumer Affairs (DoCA) |

### Background
India's agricultural supply chain typically involves 3–6 layers of intermediaries — local mandi agents, wholesalers, distributors, and retailers — between the farmer and the end consumer. Each layer adds margin, resulting in farmers receiving a small fraction of the final retail price while consumers pay inflated rates. This inefficiency also causes produce spoilage, poor price discovery, and lack of market access for small and marginal farmers.

### Expected Solution (as per problem statement)
- Digital marketplace connecting farmers/FPOs directly with consumers and bulk buyers.
- Integrated logistics support.
- AI for demand forecasting and route optimization.

---

## What is Fasalo?

Fasalo is a digital marketplace platform that eliminates unnecessary middlemen in the agricultural supply chain by directly connecting **farmers and Farmer Producer Organizations (FPOs)** with **retail consumers** and **bulk buyers** (retailers, restaurants, processors, institutions). The platform combines marketplace functionality, logistics coordination, and AI-driven intelligence to make the transaction fair, fast, and transparent for both ends of the chain.

---

## Core Modules

### 1. Marketplace

**Farmer / FPO Side**
- Crop listing: quantity, quality grade, price, harvest date, location.
- Voice-based listing support for low-literacy users (speak in local language → auto-filled listing).
- Inventory management and real-time stock updates.
- FPO aggregation layer — pools produce from multiple small farmers to meet bulk order volumes.
- Real-time mandi price feed (via eNAM integration) so farmers know fair market price before listing.

**Buyer Side**
- **Retail consumers:** simple browse-and-buy UX, small quantities, recurring/subscription orders (e.g., weekly vegetable box).
- **Bulk buyers:** bidding/negotiation flow, bulk contracts, quality certification requirements, scheduled delivery windows.

**Trust Layer**
- Farmer and buyer KYC verification.
- Escrow-based payments — funds released only on confirmed delivery/quality acceptance, protecting farmers from non-payment.
- Dispute resolution and grievance redressal for quality/quantity mismatches.
- Ratings and reviews for both farmers and buyers.

---

### 2. Logistics Support

- **Cold storage locator & booking** — connects farmers to nearest available cold storage before produce spoils.
- **Fleet/transport matching** — partners with existing logistics aggregators or independent transporters for pickup and delivery.
- **Multi-pickup, multi-drop coordination** for FPO-aggregated shipments.
- **Real-time shipment tracking** for both farmer and buyer.
- **Packaging and handling guidelines** by produce type (perishable vs. non-perishable).

> **Phase 3 demo status:** Fasalo currently provides a static/mock cold-storage catalogue and transporter list, plus an authenticated shipment state machine (`scheduled → picked_up → in_transit → out_for_delivery → delivered`) tied to confirmed orders. These integrations do not yet have live availability, booking, GPS, or partner dispatch.

---

### 3. AI & Intelligence Layer

| Feature | Purpose |
|---|---|
| **Demand Forecasting** | Predicts regional demand for specific crops using historical sales, seasonality, and weather data — helps farmers plan harvest and avoid oversupply/price crashes. |
| **Route Optimization** | Solves multi-pickup/multi-drop vehicle routing to minimize transit time and spoilage for perishables. |
| **Price Prediction** | Suggests fair, data-backed listing prices to farmers based on market trends. |
| **Quality Grading via Image Recognition** | Farmer uploads produce photo → AI auto-assigns quality grade, reducing manual inspection disputes. |
| **Crop Recommendation Engine** | Suggests which crops to grow next season based on regional demand trends and price forecasts. |

> **Phase 4 demo status:** `ai-services/` is a separate FastAPI service exposing demand forecast, route, price suggestion, and quality-grading endpoints. Forecast, route, and price use transparent sample-data heuristics; quality grading is an explicitly marked AI-ready mock until trained on a labelled image dataset.

---

### 4. Government & Ecosystem Integration

- **eNAM (National Agriculture Market)** — real-time price feed integration.
- **PM-KISAN / Agriculture Infrastructure Fund** — visibility into applicable subsidies/financing for farmers.
- **IMD Weather Alerts** — tied into logistics planning (e.g., delay shipment if storm predicted).
- **FPO Registry integration** — for verified aggregator onboarding.

> **Phase 5 demo status:** Fasalo serves a static eNAM-shaped market-price feed for reliable demos, and proxies a live Open-Meteo weather forecast into a logistics/harvest advisory. The eNAM feed is not connected to a government API; weather is the live external integration.

---

## Key Benefits

- **Farmers:** Better price realization, reduced dependency on mandi agents, guaranteed payment via escrow, access to bulk buyers previously out of reach.
- **Consumers:** Lower prices due to fewer margin layers, fresher produce, transparency on origin.
- **Bulk Buyers:** Reliable sourcing, quality assurance, predictable supply via demand-matched contracts.
- **System-wide:** Reduced spoilage (via cold chain + route optimization), better price discovery, reduced supply chain inefficiency.

---

## Tech Stack (Proposed)

| Layer | Technology |
|---|---|
| Frontend (Web) | React.js / Next.js |
| Frontend (Mobile) | React Native / Flutter (for farmer-facing low-bandwidth app) |
| Backend | Node.js / Django REST Framework |
| Database | PostgreSQL (transactional data), MongoDB (listings/catalog) |
| AI/ML | Python (scikit-learn/TensorFlow for forecasting), OR-Tools / Google Maps API (route optimization), OpenCV/CNN (quality grading) |
| Cloud/Infra | AWS / Azure / GCP with auto-scaling for seasonal demand spikes |
| Payments | Razorpay/UPI integration with escrow logic |
| Notifications | SMS/IVR gateway (for feature-phone accessibility), WhatsApp Business API |

---

## Differentiators

- **Voice-first, vernacular-first design** — built for actual farmer literacy and connectivity realities, not a retrofit of an English-only e-commerce template.
- **Escrow-backed trust system** — directly addresses the most common farmer complaint (non-payment/underpayment) rather than just being a listings board.
- **AI baked into core flows**, not bolted on — forecasting and routing directly influence what farmers plant and how produce moves, not just a dashboard feature.
- **FPO-first aggregation model** — designed around how small Indian farmers actually organize, rather than assuming individual farmer-scale listings.

---

## Future Scope

- Blockchain-based traceability (farm-to-table produce journey).
- Carbon-footprint tracking for logistics optimization.
- Direct export marketplace linkage for FPOs meeting export-quality standards.
- Predictive alerts for farmers on crop disease/pest risk using satellite/weather data.

---

## Team / Submission Notes
*(Add team name, members, and any SIH-specific submission details here)*

---

## Phase 6 Demo Readiness
- Role-aware dashboards for farmer, buyer, and admin/institution accounts.
- Order, delivery, top-crop, and sample market-price analytics.
- English/Hindi toggle for core navigation and dashboard.
- Guided presentation flow: `DEMO_SCRIPT.md`.
