import type { AnalyzeRequest, AnalyzeResponse } from "@/types";

export async function analyzeToken(
  req: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Request failed (${res.status})`);
  }

  if (!res.ok) {
    const err = data as { error?: string; detail?: string };
    throw new Error(err.detail || err.error || `Request failed (${res.status})`);
  }

  return data as AnalyzeResponse;
}
