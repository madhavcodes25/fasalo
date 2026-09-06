Fasalo AI Services
===================

Python-based micro-services that expose the AI features described in the
main README's "AI & Intelligence Layer" section:

1. Demand Forecasting      → /api/forecast    (Phase 4)
2. Route Optimization       → /api/route       (Phase 4)
3. Price Prediction         → /api/price       (Phase 4)
4. Quality Grading (image)  → /api/quality     (Phase 4)
5. Crop Recommendation      → /api/crops       (Phase 4 / future)

Status (Phase 4): **Runnable demo service.** It has four separately callable
endpoints and sample data. Price, forecast, and route use transparent
heuristics; quality grading is an AI-ready mock until a labelled image model is added.

## Prerequisites (Phase 4)
- Python 3.9+
- pip / uv

## Run locally
```bash
cd ai-services
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Interactive API documentation: `http://localhost:8000/docs`

## API endpoints
- `GET /health`
- `POST /api/price` — `{ cropName, qualityGrade, quantityKg, region }`
- `POST /api/forecast` — `{ cropName, region, weeks }`
- `POST /api/route` — `{ depot, stops }`, each stop has `id`, `lat`, `lng`
- `POST /api/quality` — `{ cropName, imageUrl? }` (AI-ready mock)

## Structure
```
ai-services/
├── api/            # FastAPI routers per feature
├── models/         # Saved/trained models + loaders
├── data/           # Sample datasets
├── features/       # Business logic per feature
└── README.md
```
