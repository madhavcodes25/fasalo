"""Fasalo Phase 4 AI service.

Each endpoint is independent from the marketplace API. Sample-data heuristics
keep the hackathon demo reproducible and can be replaced with trained models.
"""
from __future__ import annotations

import json
import math
import os
import re
import tempfile
from pathlib import Path
from statistics import median
from typing import Literal, Optional

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:  # Import a local ai-services/.env if present (keys injected via env vars in deployment)
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).parent / ".env")
except Exception:
    pass

app = FastAPI(title="Fasalo AI Services", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
MARKET_PRICES = json.loads((Path(__file__).parent / "data" / "market_prices.json").read_text(encoding="utf-8"))

class PriceRequest(BaseModel):
    cropName: str = Field(min_length=2, max_length=80)
    qualityGrade: Literal["A", "B", "C", "D"] = "A"
    quantityKg: float = Field(default=100, gt=0)
    region: str = "Nashik"

class ForecastRequest(BaseModel):
    cropName: str = Field(min_length=2, max_length=80)
    region: str = "Nashik"
    weeks: int = Field(default=4, ge=1, le=12)

class Stop(BaseModel):
    id: str = Field(min_length=1, max_length=60)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)

class RouteRequest(BaseModel):
    depot: Stop
    stops: list[Stop] = Field(min_length=1, max_length=20)

class QualityRequest(BaseModel):
    cropName: str = Field(min_length=2, max_length=80)
    imageUrl: Optional[str] = None

def crop_prices(crop_name: str, region: str) -> list[float]:
    local = [row["pricePerKg"] for row in MARKET_PRICES if row["cropName"].lower() == crop_name.lower() and row["region"].lower() == region.lower()]
    return local or [row["pricePerKg"] for row in MARKET_PRICES if row["cropName"].lower() == crop_name.lower()] or [30]

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "fasalo-ai-services", "mode": "sample-data-demo"}

@app.post("/api/price")
def suggest_price(request: PriceRequest) -> dict:
    base = median(crop_prices(request.cropName, request.region))
    grade_multiplier = {"A": 1.08, "B": 1.0, "C": 0.9, "D": 0.78}[request.qualityGrade]
    suggested = round(base * grade_multiplier * (0.97 if request.quantityKg >= 500 else 1.0), 2)
    return {"cropName": request.cropName, "region": request.region, "suggestedPricePerKg": suggested, "recommendedRange": {"min": round(suggested * 0.9, 2), "max": round(suggested * 1.1, 2)}, "currency": "INR", "basis": "sample market-price median with grade and volume adjustments", "mode": "demo-heuristic"}

@app.post("/api/forecast")
def forecast_demand(request: ForecastRequest) -> dict:
    baseline_demand = int(400 + median(crop_prices(request.cropName, request.region)) * 18)
    forecast = [{"week": week, "expectedDemandKg": round(baseline_demand * (1 + 0.06 * math.sin(week * math.pi / 3)))} for week in range(1, request.weeks + 1)]
    return {"cropName": request.cropName, "region": request.region, "forecast": forecast, "model": "sample-data trend and seasonality heuristic", "mode": "demo-heuristic"}

def distance_km(a: Stop, b: Stop) -> float:
    radius_km = 6371.0
    lat_delta, lng_delta = math.radians(b.lat - a.lat), math.radians(b.lng - a.lng)
    h = math.sin(lat_delta / 2) ** 2 + math.cos(math.radians(a.lat)) * math.cos(math.radians(b.lat)) * math.sin(lng_delta / 2) ** 2
    return radius_km * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))

@app.post("/api/route")
def optimize_route(request: RouteRequest) -> dict:
    unvisited, current, route, total_km = request.stops.copy(), request.depot, [request.depot], 0.0
    while unvisited:
        next_stop = min(unvisited, key=lambda stop: distance_km(current, stop))
        total_km += distance_km(current, next_stop)
        route.append(next_stop); unvisited.remove(next_stop); current = next_stop
    total_km += distance_km(current, request.depot); route.append(request.depot)
    return {"route": [{"id": stop.id, "lat": stop.lat, "lng": stop.lng} for stop in route], "estimatedDistanceKm": round(total_km, 2), "algorithm": "nearest-neighbour heuristic", "mode": "demo-heuristic; replace with OR-Tools for production constraints"}

# ──────────────────────────── Quality grading (image) ────────────────────────────
#
# Real, on-device produce grading. We analyse the uploaded crop photo with OpenCV
# computer-vision heuristics (colour saturation/ripeness, brightness, blemish
# detection and surface texture) and map the resulting 0–1 score to an A/B/C/D
# grade. This runs entirely locally with no API key. When a trained CNN model file
# is dropped into ai-services/models, it can be plugged in here to replace the
# heuristic feature score.


def grade_image_cv(data: bytes, crop_name: str) -> dict:
    """Analyse a produce photo and return {grade, confidence, metrics, ...}."""
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None or img.size == 0:
        raise ValueError("Could not decode the uploaded image (unsupported or corrupt file).")

    # Downscale very large photos so metric computation stays fast and stable.
    h, w = img.shape[:2]
    if max(h, w) > 512:
        scale = 512.0 / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    saturation = float(np.mean(s))        # vibrancy / ripeness of colour
    brightness = float(np.mean(v))        # well-lit, evenly exposed photo
    # Blemishes = over-exposed scarred spots (very bright) or bruised/rotten spots (very dark).
    def_white = float(np.mean((v > 248).astype(np.float32)))
    def_dark = float(np.mean((v < 32).astype(np.float32)))
    defect_fraction = def_white + def_dark
    texture = float(cv2.Laplacian(gray, cv2.CV_64F).var())  # surface detail/sharpness

    color_score = min(1.0, saturation / 140.0)
    brightness_ok = max(0.0, 1.0 - abs(brightness - 140.0) / 140.0)
    cleanliness = max(0.0, 1.0 - min(1.0, defect_fraction * 5.0))
    texture_ok = min(1.0, texture / 400.0)

    score = 0.40 * color_score + 0.32 * cleanliness + 0.16 * texture_ok + 0.12 * brightness_ok
    if score >= 0.72:
        grade = "A"
    elif score >= 0.56:
        grade = "B"
    elif score >= 0.44:
        grade = "C"
    else:
        grade = "D"

    confidence = round(min(0.985, max(0.45, 0.55 + abs(score - 0.5))), 3)
    return {
        "cropName": crop_name or "produce",
        "qualityGrade": grade,
        "confidence": confidence,
        "score": round(score, 3),
        "metrics": {
            "brightness": round(brightness, 1),
            "saturation": round(saturation, 1),
            "defectFraction": round(defect_fraction, 4),
            "surfaceTexture": round(texture, 1),
        },
        "model": "OpenCV-based computer-vision quality heuristic",
        "mode": "cv-live",
        "message": f"Produce photo analysed on-device; assigned grade {grade}.",
    }


@app.post("/api/quality")
async def grade_quality(
    file: UploadFile = File(..., description="Crop produce photo (jpg/png/webp)"),
    cropName: Optional[str] = Form(None, description="Optional crop name for context"),
) -> dict:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Image file is required")
    try:
        return grade_image_cv(data, cropName)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not analyse the image: {exc}")
# ──────────────────────────── WhisperFlow: voice listing ────────────────────────────
#
# Lets low-literacy farmers speak their crop offer in their local language. The
# uploaded voice note is transcribed with OpenAI Whisper (whisper-1) when an
# OPENAI_API_KEY is configured. When no key is available the service returns a
# deterministic, transparent demo transcription so the flow still works for a
# key-less judging demo. A keyword/pattern parser then extracts the listing
# fields (crop, quantity, price, grade, location, variety) from the transcript.

DEMO_TRANSCRIPT = (
    "मेरे पास टमाटर है, पक्की देशी किस्म, करीब पाँच सौ किलो। "
    "बहुत अच्छी क्वालिटी, प्रीमियम ग्रेड। दाम पैंतीस रुपये किलो। गाँव नाशिक।"
)

# Crop name aliases (English + common Hindi forms), listed in matching priority.
CROP_ALIASES: dict[str, list[str]] = {
    "Tomato": ["tomato", "टमाटर", "tamatar"],
    "Onion": ["onion", "प्याज", "प्याज़", "pyaaz"],
    "Potato": ["potato", "आलू", "aloo"],
    "Okra": ["okra", "भिंडी", "bhindi"],
    "Wheat": ["wheat", "गेहूं", "गेहूँ", "gehu", "gehun"],
    "Rice": ["rice", "चावल", "chawal", "paddy"],
    "Corn": ["corn", "मक्का", "makka", "maize"],
    "Mango": ["mango", "आम", "aam"],
    "Banana": ["banana", "केला", "kela"],
    "Garlic": ["garlic", "लहसुन", "lahsun"],
    "Cauliflower": ["cauliflower", "फूलगोभी", "gobhi", "gobi"],
    "Chilli": ["chilli", "मिर्च", "mirchi", "chili"],
    "Brinjal": ["brinjal", "बैंगन", "baingan"],
    "Soybean": ["soybean", "सोयाबीन", "soyabean"],
}

DISTRICT_ALIASES: list[tuple[str, list[str]]] = [
    ("Nashik", ["nashik", "नाशिक"]),
    ("Pune", ["pune", "पुणे", "पूना"]),
    ("Lasalgaon", ["lasalgaon", "लासलगांव", "लासलगाँव"]),
    ("Nagpur", ["nagpur", "नागपुर"]),
    ("Aurangabad", ["aurangabad", "औरंगाबाद"]),
]

DEMO_PRICES = {"Tomato": 35.0, "Onion": 26.0, "Potato": 24.0, "Okra": 47.0, "Wheat": 22.0, "Rice": 40.0}


def parse_listing_from_text(text: str) -> dict:
    """Best-effort extraction of structured listing fields from a transcript."""
    low = text.lower()
    out: dict = {}

    for crop, aliases in CROP_ALIASES.items():
        if any(alias in low for alias in aliases):
            out["cropName"] = crop
            break

    m = re.search(r"(\d+(?:\.\d+)?)\s*(quintal|क्विंटल|q\b)\b", low)
    if m:
        out["quantityKg"] = round(float(m.group(1)) * 100)
    else:
        m = re.search(r"(\d+(?:\.\d+)?)\s*(kg|किलो|kilo)\b", low)
        if m:
            out["quantityKg"] = float(m.group(1))

    m = re.search(r"(?:₹|rs\.?|रु\.?)\s*(\d+(?:\.\d+)?)", low)
    if not m:
        m = re.search(r"(\d+(?:\.\d+)?)\s*(रुपये|रुपए|rupees|rs\.?)", low)
    if m:
        out["pricePerKg"] = float(m.group(1))

    if any(k in low for k in ["premium", "excellent", "best", "grade a", "ग्रेड ए", "प्रीमियम", "बेस्ट", "अच्छी"]):
        out["qualityGrade"] = "A"
    elif any(k in low for k in ["grade d", "खराब"]):
        out["qualityGrade"] = "D"
    elif any(k in low for k in ["grade c", "ग्रेड सी"]):
        out["qualityGrade"] = "C"
    elif any(k in low for k in ["grade b", "ग्रेड बी"]):
        out["qualityGrade"] = "B"

    for district, names in DISTRICT_ALIASES:
        if any(name in low for name in names):
            out["location"] = district
            break

    m = re.search(r"([\wऀ-ॿ ]{1,40}?)\s*(किस्म|variety)", text)
    if m:
        out["variety"] = m.group(1).strip()

    if not out.get("cropName"):
        out["cropName"] = "Unknown crop"
    if "pricePerKg" not in out and out.get("cropName") in DEMO_PRICES:
        out["pricePerKg"] = DEMO_PRICES[out["cropName"]]
    return out


def transcribe_with_whisper(audio: bytes, filename: str, language: Optional[str]) -> str:
    """Transcribe an audio file with OpenAI Whisper (requires OPENAI_API_KEY)."""
    from openai import OpenAI

    suffix = Path(filename or "voice.mp3").suffix or ".mp3"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio)
        tmp_path = tmp.name
    try:
        client = OpenAI()
        kwargs: dict = {"model": "whisper-1", "file": tmp_path, "response_format": "text"}
        if language:
            kwargs["language"] = language.lower()
        transcript = client.audio.transcriptions.create(**kwargs)
        return transcript if isinstance(transcript, str) else getattr(transcript, "text", str(transcript))
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@app.post("/api/transcribe")
async def transcribe_listing(
    file: UploadFile = File(..., description="Voice note (m4a/mp3/webm/ogg) of the farmer speaking the crop offer"),
    language: Optional[str] = Form(None, description="Optional language code, e.g. hi, mr, ta, te, en"),
) -> dict:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Audio file is required")

    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        try:
            text = transcribe_with_whisper(data, file.filename or "voice", language)
            provenance = {"mode": "whisper-live", "model": "whisper-1", "detectedLanguage": language or "auto"}
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Whisper transcription failed: {exc}")
    else:
        text = DEMO_TRANSCRIPT
        provenance = {
            "mode": "demo-no-key",
            "model": "offline-demo",
            "detectedLanguage": language or "hi",
            "note": "OPENAI_API_KEY not set — returned a sample transcription so the voice flow stays demoable.",
        }

    parsed = parse_listing_from_text(text)
    return {"transcript": text, **provenance, **parsed}
