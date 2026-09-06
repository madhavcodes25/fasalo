# Fasalo Demo Script — Smart India Hackathon

## Before presenting
1. Start backend (`npm run dev` in `backend`), frontend (`npm run dev` in `frontend`), and AI service (`uvicorn main:app --reload --port 8000` in `ai-services`).
2. Create a farmer and consumer account. The farmer needs one active listing.

## Two-minute flow
1. **Farmer value:** In **My Listings**, enter Tomato and select **Get AI price suggestion**. State that this is sample-data based and model-ready.
2. **Direct marketplace:** As a consumer, browse the listing and order it—no intermediary.
3. **Trust:** As farmer, confirm the order. Explain escrow is held at confirmation.
4. **Logistics:** Select a transporter under **Logistics**, then advance shipment tracking to delivered. The order status updates too.
5. **Ecosystem:** Show **Advisories**: static eNAM-style price data and live weather guidance.
6. **Insights:** Show **Dashboard** metrics/charts and toggle **हिंदी / EN**.
7. **Close:** Production path: verified eNAM feed, partners/GPS, payment gateway, and trained image quality model.

## Demo honesty
- eNAM, logistics lists, escrow, and AI price/forecast/route are demos or heuristics.
- Weather is live.
- Quality grading is AI-ready/mock, not live inference.
