/**
 * Trust Agent
 *
 * Weight: 40%
 * Source: TrustGate MCP (when a contract address is provided)
 *
 * If no address is given, runs a degraded check using Bitget ticker
 * data (does the pair exist? is volume non-trivial?) with reduced
 * confidence to signal that TrustGate wasn't consulted.
 */

import type { AgentOutput, Decision } from "@/types";
import { getTrustGateScore } from "@/services/trustgate";
import { getSpotTicker } from "@/services/bitget";

function decisionFrom(score: number): Decision {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 50) return "HOLD";
  return "AVOID";
}

// Map TrustGate tier → base score when the numeric score is null
const TIER_FALLBACK: Record<string, number> = {
  HIGH_ELITE: 95,
  HIGH: 80,
  MEDIUM: 55,
  LOW: 30,
  NTT: 10,
  UNKNOWN: 40,
};

// Map TrustGate verdict → confidence multiplier
const VERDICT_CONFIDENCE: Record<string, number> = {
  ok: 1.0,
  caution: 0.7,
  avoid: 0.9, // high confidence it's bad
  not_tradeable: 0.95,
  unknown: 0.3,
};

async function runWithTrustGate(
  address: string,
  chain?: string
): Promise<AgentOutput> {
  const tg = await getTrustGateScore(address, chain);

  const rawScore = tg.score ?? TIER_FALLBACK[tg.tier] ?? 40;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const baseConfidence = tg.score !== null ? 90 : 55;
  const confidence = Math.round(
    baseConfidence * (VERDICT_CONFIDENCE[tg.verdict] ?? 0.5)
  );

  let reason = tg.summary;
  if (tg.verdict === "not_tradeable") {
    reason = `Not a tradeable token (${tg.tier}). ${tg.summary}`;
  }

  return {
    id: "trust",
    score,
    confidence,
    decision: decisionFrom(score),
    reason,
    meta: {
      source: "TrustGate MCP",
      tier: tg.tier,
      verdict: tg.verdict,
      rawScore: tg.score,
      address,
      chain: tg.chain,
    },
  };
}

async function runWithoutTrustGate(symbol: string): Promise<AgentOutput> {
  // Degraded mode: check if the pair actually trades on Bitget
  try {
    const ticker = await getSpotTicker(symbol);
    const volume = parseFloat(ticker.usdtVol || "0");
    const hasVolume = volume > 100_000; // >$100k 24h volume

    const score = hasVolume ? 60 : 40;
    const confidence = 30; // low — we didn't consult TrustGate

    return {
      id: "trust",
      score,
      confidence,
      decision: decisionFrom(score),
      reason: hasVolume
        ? `${symbol} trades on Bitget with $${(volume / 1e6).toFixed(1)}M 24h volume. No TrustGate contract address provided — trust assessment is limited.`
        : `${symbol} has low trading volume ($${(volume / 1e3).toFixed(0)}K). No TrustGate contract address provided.`,
      meta: {
        source: "Bitget ticker (degraded — no contract address)",
        volume,
      },
    };
  } catch {
    return {
      id: "trust",
      score: 50,
      confidence: 10,
      decision: "HOLD",
      reason: `Could not verify ${symbol} on Bitget. No contract address provided for TrustGate.`,
      meta: { source: "unavailable" },
    };
  }
}

export async function runTrustAgent(params: {
  symbol: string;
  address?: string;
  chain?: string;
}): Promise<AgentOutput> {
  try {
    if (params.address) {
      return await runWithTrustGate(params.address, params.chain);
    }
    return await runWithoutTrustGate(params.symbol);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[trust-agent] failed:", msg);
    return {
      id: "trust",
      score: 50,
      confidence: 10,
      decision: "HOLD",
      reason: `Trust analysis unavailable: ${msg}`,
      meta: { error: msg },
    };
  }
}
