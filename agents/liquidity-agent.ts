/**
 * Liquidity Agent
 *
 * Weight: 15%
 * Source: Bitget MCP (spot_get_depth + spot_get_ticker)
 *
 * Checks orderbook depth, 24h trading volume, and bid-ask spread
 * to determine whether a position can be entered and exited cleanly.
 */

import type { AgentOutput, Decision } from "@/types";
import { getSpotDepth, getSpotTicker } from "@/services/bitget";

function decisionFrom(score: number): Decision {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 50) return "HOLD";
  return "AVOID";
}

export async function runLiquidityAgent(params: {
  symbol: string;
}): Promise<AgentOutput> {
  try {
    const [depth, ticker] = await Promise.all([
      getSpotDepth(params.symbol, 20),
      getSpotTicker(params.symbol),
    ]);

    // ── bid-ask spread ──────────────────────────────────────────────
    const bestBid = parseFloat(ticker.bidPr || "0");
    const bestAsk = parseFloat(ticker.askPr || "0");
    const midPrice = (bestBid + bestAsk) / 2;
    const spreadPct = midPrice > 0 ? ((bestAsk - bestBid) / midPrice) * 100 : 100;

    // ── orderbook depth (total size within top 20 levels) ───────────
    const bidDepth = (depth.bids || []).reduce(
      (sum, level) => sum + parseFloat(level[1] || "0"),
      0
    );
    const askDepth = (depth.asks || []).reduce(
      (sum, level) => sum + parseFloat(level[1] || "0"),
      0
    );
    const totalDepthUsdt = (bidDepth + askDepth) * midPrice;

    // ── 24h volume ──────────────────────────────────────────────────
    const usdtVol = parseFloat(ticker.usdtVol || "0");

    // ── bid/ask imbalance (healthy if close to 1.0) ─────────────────
    const imbalance =
      bidDepth + askDepth > 0
        ? Math.abs(bidDepth - askDepth) / (bidDepth + askDepth)
        : 1;

    // ── scoring ─────────────────────────────────────────────────────

    // Spread score: tighter = better
    let spreadScore: number;
    if (spreadPct < 0.02) spreadScore = 95;
    else if (spreadPct < 0.05) spreadScore = 85;
    else if (spreadPct < 0.1) spreadScore = 72;
    else if (spreadPct < 0.3) spreadScore = 55;
    else if (spreadPct < 1.0) spreadScore = 35;
    else spreadScore = 12;

    // Depth score: deeper = better
    let depthScore: number;
    if (totalDepthUsdt > 10_000_000) depthScore = 95;
    else if (totalDepthUsdt > 1_000_000) depthScore = 82;
    else if (totalDepthUsdt > 100_000) depthScore = 65;
    else if (totalDepthUsdt > 10_000) depthScore = 42;
    else depthScore = 15;

    // Volume score
    let volumeScore: number;
    if (usdtVol > 500_000_000) volumeScore = 95;
    else if (usdtVol > 50_000_000) volumeScore = 82;
    else if (usdtVol > 5_000_000) volumeScore = 68;
    else if (usdtVol > 500_000) volumeScore = 48;
    else volumeScore = 20;

    // Imbalance penalty
    const imbalancePenalty = imbalance > 0.6 ? 12 : imbalance > 0.3 ? 5 : 0;

    const rawScore =
      spreadScore * 0.3 + depthScore * 0.3 + volumeScore * 0.4 - imbalancePenalty;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    const confidence = Math.min(
      95,
      Math.round(
        60 +
          (depth.bids?.length >= 15 ? 15 : 0) +
          (usdtVol > 1_000_000 ? 10 : 0) +
          (spreadPct < 0.1 ? 10 : 0)
      )
    );

    // ── reasoning ───────────────────────────────────────────────────
    const spreadWord =
      spreadPct < 0.05 ? "tight" : spreadPct < 0.3 ? "moderate" : "wide";

    const reason =
      `${params.symbol} has a ${spreadWord} spread (${spreadPct.toFixed(3)}%) and ` +
      `$${(totalDepthUsdt / 1e6).toFixed(2)}M orderbook depth (top 20 levels). ` +
      `24h volume: $${(usdtVol / 1e6).toFixed(1)}M. ` +
      `Bid/ask imbalance: ${(imbalance * 100).toFixed(0)}%.`;

    return {
      id: "liquidity",
      score,
      confidence,
      decision: decisionFrom(score),
      reason,
      meta: {
        source: "Bitget MCP (spot_get_depth + spot_get_ticker)",
        spreadPct,
        totalDepthUsdt,
        usdtVolume: usdtVol,
        bidDepth,
        askDepth,
        imbalance,
        bidLevels: depth.bids?.length ?? 0,
        askLevels: depth.asks?.length ?? 0,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[liquidity-agent] failed:", msg);
    return {
      id: "liquidity",
      score: 50,
      confidence: 10,
      decision: "HOLD",
      reason: `Liquidity analysis unavailable: ${msg}`,
      meta: { error: msg },
    };
  }
}
