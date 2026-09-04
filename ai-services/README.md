Fasalo AI Services
===================

Python-based micro-services that expose the AI features described in the
main README's "AI & Intelligence Layer" section:

1. Demand Forecasting      → /api/forecast    (Phase 4)
2. Route Optimization       → /api/route       (Phase 4)
3. Price Prediction         → /api/price       (Phase 4)
4. Quality Grading (image)  → /api/quality     (Phase 4)
5. Crop Recommendation      → /api/crops       (Phase 4 / future)

Status (Phase 0): **Scaffold only.** No services running yet — endpoints are
added in Phase 4.

## Prerequisites (Phase 4)
- Python 3.9+
- pip / uv

## Planned structure
```
ai-services/
├── api/            # FastAPI routers per feature
├── models/         # Saved/trained models + loaders
├── data/           # Sample datasets
├── features/       # Business logic per feature
└── README.md
```
