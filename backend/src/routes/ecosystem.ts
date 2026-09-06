import { Router } from "express";

const router = Router();

// Demo-only eNAM-shaped dataset. Phase 5 intentionally keeps this resilient
// for judging-day demos when a live government data feed is unavailable.
const ENAM_SAMPLE_PRICES = [
  { cropName: "Tomato", market: "Nashik APMC", modalPricePerKg: 33, unit: "kg", observedOn: "2026-09-06" },
  { cropName: "Onion", market: "Lasalgaon APMC", modalPricePerKg: 26, unit: "kg", observedOn: "2026-09-06" },
  { cropName: "Potato", market: "Pune APMC", modalPricePerKg: 24, unit: "kg", observedOn: "2026-09-06" },
  { cropName: "Okra", market: "Pune APMC", modalPricePerKg: 47, unit: "kg", observedOn: "2026-09-06" },
];

const ENAM_PRICE_TRENDS = [
  { cropName: "Tomato", date: "2026-09-02", pricePerKg: 29 }, { cropName: "Tomato", date: "2026-09-03", pricePerKg: 31 }, { cropName: "Tomato", date: "2026-09-04", pricePerKg: 30 }, { cropName: "Tomato", date: "2026-09-05", pricePerKg: 34 }, { cropName: "Tomato", date: "2026-09-06", pricePerKg: 33 },
];

router.get("/enam-prices", (req, res) => {
  const cropName = typeof req.query.cropName === "string" ? req.query.cropName.toLowerCase() : "";
  const market = typeof req.query.market === "string" ? req.query.market.toLowerCase() : "";
  const prices = ENAM_SAMPLE_PRICES.filter((price) =>
    (!cropName || price.cropName.toLowerCase().includes(cropName)) &&
    (!market || price.market.toLowerCase().includes(market)),
  );
  res.json({ source: "mock eNAM-shaped sample data", live: false, prices });
});

router.get("/enam-prices/history", (req, res) => {
  const cropName = typeof req.query.cropName === "string" ? req.query.cropName.toLowerCase() : "tomato";
  res.json({ source: "mock eNAM-shaped sample data", live: false, trend: ENAM_PRICE_TRENDS.filter((row) => row.cropName.toLowerCase() === cropName) });
});

function advisoryFor(weatherCode: number, precipitationProbability: number, windSpeed: number): string {
  if (weatherCode >= 95) return "Thunderstorm risk: postpone loading and keep produce under cover.";
  if (precipitationProbability >= 60 || weatherCode >= 61) return "Rain risk: use waterproof packaging and review pickup timing.";
  if (windSpeed >= 35) return "High wind: secure tarpaulins and avoid unsafe vehicle loading.";
  if (weatherCode >= 45) return "Low visibility: allow extra travel time for pickup and delivery.";
  return "Conditions look suitable for normal harvesting and transport planning.";
}

/** Live, no-key weather source; proxying prevents browser CORS/config coupling. */
router.get("/weather", async (req, res) => {
  const lat = Number(req.query.lat ?? 20.0059); // Nashik default
  const lng = Number(req.query.lng ?? 73.7903);
  const location = typeof req.query.location === "string" ? req.query.location : "Nashik";
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "lat and lng must be valid coordinates" });
  }

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
      daily: "precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min",
      timezone: "auto",
      forecast_days: "1",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error(`Weather provider returned ${response.status}`);
    const weather = await response.json() as {
      current: { temperature_2m: number; precipitation: number; weather_code: number; wind_speed_10m: number; time: string };
      daily: { precipitation_probability_max: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] };
    };
    const rainChance = weather.daily.precipitation_probability_max?.[0] ?? 0;
    res.json({
      source: "Open-Meteo live forecast",
      live: true,
      location,
      coordinates: { lat, lng },
      observedAt: weather.current.time,
      current: weather.current,
      today: { rainChance, maxTemp: weather.daily.temperature_2m_max?.[0], minTemp: weather.daily.temperature_2m_min?.[0] },
      advisory: advisoryFor(weather.current.weather_code, rainChance, weather.current.wind_speed_10m),
    });
  } catch {
    res.status(502).json({ error: "Live weather data is temporarily unavailable. Please retry shortly." });
  }
});

export default router;
