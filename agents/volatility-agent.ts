/**
 * Volatility Agent
 *
 * Weight: 15%
 * Source: Bitget MCP (spot_get_candles + futures_get_funding_rate)
 *
 * Measures how violently price swings over the last 24 hours using
 * hourly candles, and reads the funding rate as a stress indicator.
 * High volatility = LOWER score (riskier).
 */

import type { AgentOutput, Decision } from "@/types";
import { getSpotCandles, getFundingRate, type CandleRaw } from "@/services/bitget";

function decisionFrom(score: number): Decision {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 50) return "HOLD";
  return "AVOID";
}

/** Standard deviation of an array of numbers. */
function stddev(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance);
}

export async function runVolatilityAgent(params: {
  symbol: string;
}): Promise<AgentOutput> {
  try {
    // Fetch 24h of hourly candles + optional funding rate
    const [candles, funding] = await Promise.all([
      getSpotCandles(params.symbol, "1h", 24),
      getFundingRate(params.symbol),
    ]);

    // ── hourly return volatility ────────────────────────────────────
    const closes = candles
      .map((c: CandleRaw) => parseFloat(c[4] || "0"))
      .filter((v) => v > 0);

    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }
    const returnStddev = stddev(returns);
    const annualizedVol = returnStddev * Math.sqrt(24 * 365) * 100; // rough annualization

    // ── 24h high-low range ──────────────────────────────────────────
    const highs = candles.map((c: CandleRaw) => parseFloat(c[2] || "0"));
    const lows = candles.map((c: CandleRaw) => parseFloat(c[3] || "0"));
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows.filter((v) => v > 0));
    const avgPrice = closes.reduce((s, v) => s + v, 0) / (closes.length || 1);
    const rangePct = avgPrice > 0 ? ((maxHigh - minLow) / avgPrice) * 100 : 0;

    // ── funding rate stress ─────────────────────────────────────────
    const fundingRate = funding ? parseFloat(funding.fundingRate || "0") : 0;
    const absFunding = Math.abs(fundingRate) * 100; // as percentage

    // ── scoring (inverted: high vol = LOW score) ────────────────────
    let volScore: number;
    if (annualizedVol < 30) volScore = 92;
    else if (annualizedVol < 50) volScore = 80;
    else if (annualizedVol < 80) volScore = 65;
    else if (annualizedVol < 120) volScore = 45;
    else if (annualizedVol < 180) volScore = 28;
    else volScore = 12;

    let rangeScore: number;
    if (rangePct < 2) rangeScore = 90;
    else if (rangePct < 5) rangeScore = 75;
    else if (rangePct < 10) rangeScore = 55;
    else if (rangePct < 20) rangeScore = 35;
    else rangeScore = 15;

    // Funding rate penalty: extreme funding rates signal crowded positioning
    let fundingPenalty = 0;
    if (absFunding > 0.1) fundingPenalty = 15;
    else if (absFunding > 0.05) fundingPenalty = 8;
    else if (absFunding > 0.03) fundingPenalty = 3;

    const rawScore = volScore * 0.5 + rangeScore * 0.5 - fundingPenalty;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    const confidence = Math.min(
      95,
      Math.round(50 + (closes.length >= 18 ? 20 : 5) + (funding ? 15 : 0))
    );

    // ── reasoning ───────────────────────────────────────────────────
    const volLevel =
      annualizedVol < 50 ? "low" : annualizedVol < 100 ? "moderate" : "high";
    const fundingNote = funding
      ? ` Funding rate: ${(fundingRate * 100).toFixed(4)}%.`
      : "";

    const reason =
      `${params.symbol} shows ${volLevel} volatility (annualized ~${annualizedVol.toFixed(0)}%). ` +
      `24h range: ${rangePct.toFixed(1)}% (high ${maxHigh.toFixed(2)}, low ${minLow.toFixed(2)}).${fundingNote}`;

    return {
      id: "volatility",
      score,
      confidence,
      decision: decisionFrom(score),
      reason,
      meta: {
        source: "Bitget MCP (spot_get_candles + futures_get_funding_rate)",
        annualizedVolatility: annualizedVol,
        rangePct,
        fundingRate: fundingRate,
        hourlyDataPoints: closes.length,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[volatility-agent] failed:", msg);
    return {
      id: "volatility",
      score: 50,
      confidence: 10,
      decision: "HOLD",
      reason: `Volatility analysis unavailable: ${msg}`,
      meta: { error: msg },
    };
  }
}
