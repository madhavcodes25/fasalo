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
