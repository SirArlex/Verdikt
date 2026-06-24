/**
 * TrustGate Service
 *
 * Wraps the trustgate_score MCP tool. Returns a typed TrustGateResponse.
 */

import { callMcpTool } from "@/services/mcp-client";
import type { TrustGateResponse } from "@/types";

export async function getTrustGateScore(
  address: string,
  chain?: string
): Promise<TrustGateResponse> {
  const args: Record<string, unknown> = { address };
  if (chain) args.chain = chain;

  const result = (await callMcpTool("trustgate", "trustgate_score", args)) as TrustGateResponse;

  return {
    address: result.address ?? address,
    chain: result.chain ?? chain ?? "arc",
    score: result.score ?? null,
    tier: result.tier ?? "UNKNOWN",
    verdict: result.verdict ?? "unknown",
    summary: result.summary ?? "No summary available",
  };
}
