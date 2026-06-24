/**
 * Consensus Engine
 *
 * The full pipeline: fan out to all four agents, collect results,
 * run the moderator, and return the unified AnalyzeResponse.
 */

import type { AgentOutput, AnalyzeRequest, AnalyzeResponse } from "@/types";
import { runTrustAgent } from "@/agents/trust-agent";
import { runMomentumAgent } from "@/agents/momentum-agent";
import { runVolatilityAgent } from "@/agents/volatility-agent";
import { runLiquidityAgent } from "@/agents/liquidity-agent";
import { runModerator } from "@/agents/moderator-agent";

export async function runConsensus(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const { symbol, address, chain } = request;

  console.log(`[consensus] starting analysis for ${symbol}${address ? ` (${address})` : ""}`);
  const start = Date.now();

  // ── Phase 1: Run all four agents in parallel ─────────────────────
  const [trust, momentum, volatility, liquidity] = await Promise.all([
    runTrustAgent({ symbol, address, chain }),
    runMomentumAgent({ symbol }),
    runVolatilityAgent({ symbol }),
    runLiquidityAgent({ symbol }),
  ]);

  const agents: AgentOutput[] = [trust, momentum, volatility, liquidity];

  console.log(
    `[consensus] agents complete in ${Date.now() - start}ms:`,
    agents.map((a) => `${a.id}=${a.score}`).join(", ")
  );

  // ── Phase 2: Moderator synthesis ─────────────────────────────────
  const consensus = await runModerator(agents, symbol);

  console.log(
    `[consensus] done in ${Date.now() - start}ms → ${consensus.decision} (${consensus.consensusScore})`
  );

  return {
    symbol,
    address,
    agents,
    consensus,
    timestamp: new Date().toISOString(),
  };
}
