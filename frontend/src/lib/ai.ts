/** Client for the independently deployed Fasalo AI microservice. */
const AI_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_SERVICE_URL) || "http://localhost:8000";

export interface PriceSuggestion {
  suggestedPricePerKg: number;
  recommendedRange: { min: number; max: number };
  currency: "INR";
  basis: string;
  mode: string;
}

export async function getPriceSuggestion(input: { cropName: string; qualityGrade: string; quantityKg: number; region: string }): Promise<PriceSuggestion> {
  const response = await fetch(`${AI_BASE}/api/price`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || "Unable to get AI price suggestion");
  return data as PriceSuggestion;
}

/** Structured listing fields returned by WhisperFlow voice transcription. */
export interface TranscribedListing {
  transcript: string;
  mode: string;
  model: string;
  detectedLanguage: string;
  cropName?: string;
  variety?: string;
  quantityKg?: number;
  pricePerKg?: number;
  qualityGrade?: string;
  location?: string;
  note?: string;
}

/** Send a farmer's voice note (in their local language) → auto-filled listing fields. */
export async function transcribeListing(audioBlob: Blob, language?: string): Promise<TranscribedListing> {
  const formData = new FormData();
  formData.append("file", audioBlob, "voice.webm");
  if (language) formData.append("language", language);
  const response = await fetch(`${AI_BASE}/api/transcribe`, { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || "Unable to transcribe voice note");
  return data as TranscribedListing;
}

/** Produce grade returned by analysing a crop photo. */
export interface ImageGrade {
  cropName: string;
  qualityGrade: string;
  confidence: number;
  score: number;
  metrics: { brightness: number; saturation: number; defectFraction: number; surfaceTexture: number };
  model: string;
  mode: string;
  message: string;
}

/** Upload a crop photo → AI assigns a quality grade (OpenCV CV heuristic). */
export async function gradeImage(imageBlob: Blob, cropName?: string): Promise<ImageGrade> {
  const formData = new FormData();
  formData.append("file", imageBlob, "crop.jpg");
  if (cropName) formData.append("cropName", cropName);
  const response = await fetch(`${AI_BASE}/api/quality`, { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || "Unable to grade the crop image");
  return data as ImageGrade;
}
