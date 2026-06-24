/**
 * POST /api/analyze
 *
 * Body: { symbol: string, address?: string, chain?: string }
 * Returns: AnalyzeResponse
 */

import { NextResponse } from "next/server";
import { runConsensus } from "@/lib/consensus-engine";
import { saveAnalysis } from "@/services/supabase";
import type { AnalyzeRequest } from "@/types";

export const runtime = "nodejs"; // required for child_process (MCP stdio)
export const maxDuration = 60; // agents + LLM can take a while

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    // ── validation ──────────────────────────────────────────────────
    if (!body.symbol || typeof body.symbol !== "string") {
      return NextResponse.json(
        { error: "symbol is required (e.g. BTCUSDT)" },
        { status: 400 }
      );
    }

    const symbol = body.symbol.toUpperCase().trim();
    const address = body.address?.trim() || undefined;
    const chain = body.chain?.trim() || undefined;

    // ── run the consensus engine ────────────────────────────────────
    const result = await runConsensus({ symbol, address, chain });

    // ── persist to Supabase (fire-and-forget; don't block response) ─
    saveAnalysis({
      token_address: address || symbol,
      trust_score: result.agents.find((a) => a.id === "trust")?.score ?? 0,
      momentum_score: result.agents.find((a) => a.id === "momentum")?.score ?? 0,
      volatility_score: result.agents.find((a) => a.id === "volatility")?.score ?? 0,
      liquidity_score: result.agents.find((a) => a.id === "liquidity")?.score ?? 0,
      consensus_score: result.consensus.consensusScore,
      decision: result.consensus.decision,
      summary: result.consensus.summary,
    }).catch((err) => {
      console.warn("[api/analyze] supabase save failed:", err);
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[api/analyze] fatal:", msg);
    return NextResponse.json(
      { error: "Analysis failed", detail: msg },
      { status: 500 }
    );
  }
}
