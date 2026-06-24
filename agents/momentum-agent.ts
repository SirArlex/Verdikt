/**
 * Momentum Agent
 *
 * Weight: 30%
 * Source: Bitget MCP (spot_get_ticker + spot_get_candles)
 *
 * Reads 24h price movement, 7-day trend from daily candles, and
 * volume dynamics to judge whether market momentum favors entry.
 */

import type { AgentOutput, Decision } from "@/types";
import { getSpotTicker, getSpotCandles, type CandleRaw } from "@/services/bitget";

function decisionFrom(score: number): Decision {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 50) return "HOLD";
  return "AVOID";
}

/** Extract close price from a candle array. Index 4 = close. */
function closePrice(c: CandleRaw): number {
  return parseFloat(c[4] || "0");
}

/** Simple linear regression slope on an array of values. */
function trendSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export async function runMomentumAgent(params: {
  symbol: string;
}): Promise<AgentOutput> {
  try {
    const [ticker, candles] = await Promise.all([
      getSpotTicker(params.symbol),
      getSpotCandles(params.symbol, "1day", 7),
    ]);

    // ── 24h change ──────────────────────────────────────────────────
    const change24h = parseFloat(ticker.change24h || ticker.changeUtc24h || "0");
    // change24h is usually a decimal like 0.05 for 5%
    const changePct = Math.abs(change24h) > 1 ? change24h : change24h * 100;

    // ── 7d trend ────────────────────────────────────────────────────
    const closes = candles.map(closePrice).filter((v) => v > 0);
    const slope = trendSlope(closes);
    // Normalize slope relative to the average price
    const avgPrice = closes.reduce((s, v) => s + v, 0) / (closes.length || 1);
    const normalizedSlope = avgPrice > 0 ? (slope / avgPrice) * 100 : 0;

    // ── volume ──────────────────────────────────────────────────────
    const usdtVol = parseFloat(ticker.usdtVol || "0");

    // ── scoring ─────────────────────────────────────────────────────
    // 24h change component: strong positive change → high score
    let changeScore: number;
    if (changePct > 10) changeScore = 95;
    else if (changePct > 5) changeScore = 85;
    else if (changePct > 2) changeScore = 72;
    else if (changePct > 0) changeScore = 60;
    else if (changePct > -2) changeScore = 45;
    else if (changePct > -5) changeScore = 30;
    else changeScore = 15;

    // 7d trend component: positive slope → high score
    let trendScore: number;
    if (normalizedSlope > 3) trendScore = 90;
    else if (normalizedSlope > 1) trendScore = 75;
    else if (normalizedSlope > 0) trendScore = 58;
    else if (normalizedSlope > -1) trendScore = 42;
    else if (normalizedSlope > -3) trendScore = 28;
    else trendScore = 15;

    // Volume component: higher volume → more confidence in the signal
    let volumeMultiplier = 1.0;
    if (usdtVol > 100_000_000) volumeMultiplier = 1.1;
    else if (usdtVol > 10_000_000) volumeMultiplier = 1.0;
    else if (usdtVol > 1_000_000) volumeMultiplier = 0.9;
    else volumeMultiplier = 0.75;

    // Combined score: 60% 24h change, 40% 7d trend
    const rawScore = (changeScore * 0.6 + trendScore * 0.4) * volumeMultiplier;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Confidence: higher when data is rich and signals align
    const signalAlignment = Math.abs(changeScore - trendScore) < 25 ? 15 : 0;
    const confidence = Math.min(
      95,
      Math.round(55 + signalAlignment + (closes.length >= 5 ? 15 : 0) + (usdtVol > 1_000_000 ? 10 : 0))
    );

    // Reasoning
    const direction = changePct >= 0 ? "up" : "down";
    const trendWord =
      normalizedSlope > 1 ? "uptrend" : normalizedSlope < -1 ? "downtrend" : "sideways";

    const reason =
      `${params.symbol} is ${direction} ${Math.abs(changePct).toFixed(1)}% in 24h with a 7-day ${trendWord} ` +
      `(slope ${normalizedSlope > 0 ? "+" : ""}${normalizedSlope.toFixed(2)}%/day). ` +
      `24h volume: $${(usdtVol / 1e6).toFixed(1)}M.`;

    return {
      id: "momentum",
      score,
      confidence,
      decision: decisionFrom(score),
      reason,
      meta: {
        source: "Bitget MCP (spot_get_ticker + spot_get_candles)",
        change24hPct: changePct,
        trendSlope: normalizedSlope,
        usdtVolume: usdtVol,
        candleCount: closes.length,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[momentum-agent] failed:", msg);
    return {
      id: "momentum",
      score: 50,
      confidence: 10,
      decision: "HOLD",
      reason: `Momentum analysis unavailable: ${msg}`,
      meta: { error: msg },
    };
  }
}
