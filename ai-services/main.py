"""Fasalo Phase 4 AI service.

Each endpoint is independent from the marketplace API. Sample-data heuristics
keep the hackathon demo reproducible and can be replaced with trained models.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from statistics import median
from typing import Literal, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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

@app.post("/api/quality")
def grade_quality(request: QualityRequest) -> dict:
    return {"cropName": request.cropName, "qualityGrade": "A", "confidence": 0.0, "mode": "ai-ready-mock", "message": "Image grading is not yet trained. This demo response must not be used as a real quality assessment.", "imageReceived": bool(request.imageUrl)}
