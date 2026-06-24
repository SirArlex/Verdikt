import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Decision } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Tone = "positive" | "neutral" | "negative";

/** Map a consensus score (0–100) to the product's decision taxonomy. */
export function decisionFromScore(score: number): { label: Decision; tone: Tone } {
  if (score >= 80) return { label: "STRONG BUY", tone: "positive" };
  if (score >= 65) return { label: "BUY", tone: "positive" };
  if (score >= 50) return { label: "HOLD", tone: "neutral" };
  return { label: "AVOID", tone: "negative" };
}

/** Map any agent/consensus decision to a visual tone. */
export function decisionTone(decision: string): Tone {
  if (decision === "STRONG BUY" || decision === "BUY") return "positive";
  if (decision === "HOLD") return "neutral";
  return "negative";
}

/** HSL channel strings for each tone — used for inline ring/badge colors. */
export const TONE_HSL: Record<Tone, string> = {
  positive: "168 76% 47%",
  neutral: "38 92% 55%",
  negative: "0 84% 62%",
};

/** Compact relative time, e.g. "3m ago", "2h ago", "5d ago". */
export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
