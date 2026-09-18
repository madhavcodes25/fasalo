Fasalo AI Services
===================

Python-based micro-services that expose the AI features described in the
main README's "AI & Intelligence Layer" section:

1. Demand Forecasting      → /api/forecast    (Phase 4)
2. Route Optimization       → /api/route       (Phase 4)
3. Price Prediction         → /api/price       (Phase 4)
4. Quality Grading (image)  → /api/quality     (Phase 4)
5. Crop Recommendation      → /api/crops       (Phase 4 / future)

Status (Phase 4): **Runnable demo service.** It exposes price, forecast, route,
quality grading, and voice-transcription endpoints. Price, forecast, and route
use transparent heuristics. Quality grading is **live** on-device computer
vision (OpenCV): upload a crop photo and get a real A/B/C/D grade with a
confidence score. Voice listing ("WhisperFlow") transcribes a farmer's voice
note in their local language with OpenAI Whisper when `OPENAI_API_KEY` is set,
otherwise it returns a transparent sample transcription so the flow stays
demoable.

## Prerequisites (Phase 4)
- Python 3.9+
- pip / uv
- (optional) `OPENAI_API_KEY` in `ai-services/.env` to enable live Whisper speech
  transcription for `/api/transcribe`.

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
- `POST /api/quality` — on-device OpenCV grading (see below)
- `POST /api/quality` — `multipart/form-data` upload `file` (crop photo) +
  optional `cropName` → on-device OpenCV grade (A–D) + confidence + metrics
- `POST /api/transcribe` — `multipart/form-data` upload `file` (voice note) +
  optional `language` (e.g. `hi`, `mr`) → transcribed listing fields
  (`cropName`, `quantityKg`, `pricePerKg`, `qualityGrade`, `location`, ...)

## Structure
```
ai-services/
├── api/            # FastAPI routers per feature
├── models/         # Saved/trained models + loaders
├── data/           # Sample datasets
├── features/       # Business logic per feature
└── README.md
```
