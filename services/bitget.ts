/**
 * Bitget Market Data Service
 *
 * Wraps the public read-only tools from bitget-mcp-server.
 * No API key needed — these are all public endpoints.
 */

import { callMcpTool } from "@/services/mcp-client";

// ── response types (from Bitget API) ──────────────────────────────────

export interface TickerData {
  symbol: string;
  high24h: string;
  low24h: string;
  close: string;
  open: string;
  quoteVol: string;
  baseVol: string;
  usdtVol: string;
  ts: string;
  bidPr: string;
  askPr: string;
  bidSz: string;
  askSz: string;
  openUtc0: string;
  changeUtc24h: string;
  change24h: string;
}

/** Candle: [ts, open, high, low, close, baseVol, quoteVol] */
export type CandleRaw = string[];

export interface DepthData {
  asks: string[][];
  bids: string[][];
  ts: string;
}

export interface FundingRateData {
  symbol: string;
  fundingRate: string;
  fundingTime: string;
}

// ── service functions ─────────────────────────────────────────────────

export async function getSpotTicker(symbol: string): Promise<TickerData> {
  const raw = await callMcpTool("bitget", "spot_get_ticker", { symbol });

  // parseMcpContent unwraps single-item arrays automatically,
  // but multi-ticker calls return arrays — handle both
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!data || typeof data !== "object") {
    throw new Error(`No ticker data for ${symbol}`);
  }

  // Normalise field names: Bitget uses lastPr (not close) and usdtVolume (not usdtVol)
  const d = data as Record<string, string>;
  return {
    ...d,
    close: d.close ?? d.lastPr ?? "0",
    usdtVol: d.usdtVol ?? d.usdtVolume ?? d.quoteVolume ?? "0",
  } as unknown as TickerData;
}

export async function getSpotCandles(
  symbol: string,
  granularity: string = "1day",
  limit: number = 7
): Promise<CandleRaw[]> {
  const now = Date.now();
  const msPerUnit: Record<string, number> = {
    "1min": 60_000,
    "5min": 300_000,
    "15min": 900_000,
    "30min": 1_800_000,
    "1h": 3_600_000,
    "4h": 14_400_000,
    "1day": 86_400_000,
    "1week": 604_800_000,
  };
  const unitMs = msPerUnit[granularity] ?? 86_400_000;
  const startTime = String(now - limit * unitMs);

  const raw = await callMcpTool("bitget", "spot_get_candles", {
    symbol,
    granularity,
    startTime,
    endTime: String(now),
    limit,
  });

  // Candles come back as an array of arrays [[ts,o,h,l,c,baseVol,quoteVol],...]
  // parseMcpContent only auto-unwraps single-item arrays, so multi-candle
  // responses stay as arrays — perfect.
  if (!Array.isArray(raw)) {
    throw new Error(`No candle data for ${symbol}`);
  }
  return raw as CandleRaw[];
}

export async function getSpotDepth(
  symbol: string,
  limit: number = 20
): Promise<DepthData> {
  const raw = await callMcpTool("bitget", "spot_get_depth", {
    symbol,
    type: "step0",
    limit,
  });

  // Depth returns a single object { asks: [...], bids: [...], ts: "..." }
  // parseMcpContent unwraps the Bitget envelope, so raw should be that object.
  // If it's still an array (single-item), unwrap it.
  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!data || typeof data !== "object") {
    throw new Error(`No depth data for ${symbol}`);
  }
  return data as DepthData;
}

export async function getFundingRate(
  symbol: string
): Promise<FundingRateData | null> {
  try {
    const raw = await callMcpTool("bitget", "futures_get_funding_rate", {
      productType: "USDT-FUTURES",
      symbol,
    });
    const data = Array.isArray(raw) ? raw[0] : raw;
    if (!data || typeof data !== "object") return null;
    return data as FundingRateData;
  } catch {
    // Many tokens don't have futures — this is expected
    return null;
  }
}

export async function getOpenInterest(
  symbol: string
): Promise<{ openInterest: string } | null> {
  try {
    const raw = await callMcpTool("bitget", "futures_get_open_interest", {
      productType: "USDT-FUTURES",
      symbol,
    });
    if (!raw || typeof raw !== "object") return null;
    return raw as { openInterest: string };
  } catch {
    return null;
  }
}
