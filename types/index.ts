export type AgentId = "trust" | "momentum" | "volatility" | "liquidity";

export type Decision = "STRONG BUY" | "BUY" | "HOLD" | "AVOID";

/** A single agent's independent verdict. */
export interface AgentOutput {
  id: AgentId;
  decision: Decision;
  score: number; // 0–100
  confidence: number; // 0–100
  reason: string;
  /** Raw data points the agent used — shown in the debug/detail view. */
  meta?: Record<string, unknown>;
}

/** The Moderator Agent's final synthesis. */
export interface ConsensusResult {
  consensusScore: number; // 0–100, weighted
  decision: Decision;
  confidence: number; // 0–100
  summary: string;
}

/** Request body for POST /api/analyze */
export interface AnalyzeRequest {
  /** Bitget trading pair, e.g. "BTCUSDT" */
  symbol: string;
  /** Optional contract address — enables TrustGate scoring */
  address?: string;
  /** Optional chain for TrustGate, defaults to "arc" */
  chain?: string;
}

/** Full response from POST /api/analyze */
export interface AnalyzeResponse {
  symbol: string;
  address?: string;
  agents: AgentOutput[];
  consensus: ConsensusResult;
  timestamp: string;
}

/** A full analysis run, mirrors the Supabase `analyses` row. */
export interface Analysis {
  id: string;
  token_address: string;
  trust_score: number;
  momentum_score: number;
  volatility_score: number;
  liquidity_score: number;
  consensus_score: number;
  decision: Decision;
  summary: string;
  created_at: string;
}

/** Shape returned by TrustGate MCP */
export interface TrustGateResponse {
  address: string;
  chain: string;
  score: number | null;
  tier: "LOW" | "MEDIUM" | "HIGH" | "HIGH_ELITE" | "NTT" | "UNKNOWN";
  verdict: "ok" | "caution" | "avoid" | "not_tradeable" | "unknown";
  summary: string;
}
