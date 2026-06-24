/**
 * Moderator Agent
 *
 * The moderator reads all four agent verdicts, applies the consensus
 * formula, and uses an LLM to produce a human-readable summary with
 * reasoning that explains the final decision.
 */

import type { AgentOutput, ConsensusResult, Decision } from "@/types";
import { chatCompletion } from "@/services/llm";
import { AGENT_MAP } from "@/lib/agents";
import { decisionFromScore } from "@/lib/utils";

const WEIGHTS: Record<string, number> = {
  trust: 0.4,
  momentum: 0.3,
  volatility: 0.15,
  liquidity: 0.15,
};

export function computeWeightedScore(agents: AgentOutput[]): number {
  const raw = agents.reduce(
    (sum, a) => sum + a.score * (WEIGHTS[a.id] ?? 0),
    0
  );
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computeWeightedConfidence(agents: AgentOutput[]): number {
  const raw = agents.reduce(
    (sum, a) => sum + a.confidence * (WEIGHTS[a.id] ?? 0),
    0
  );
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function buildPrompt(agents: AgentOutput[], consensusScore: number): string {
  const { label } = decisionFromScore(consensusScore);

  const agentSummaries = agents
    .map((a) => {
      const meta = AGENT_MAP[a.id];
      const weight = WEIGHTS[a.id] ?? 0;
      return [
        `## ${meta?.name ?? a.id} (weight: ${Math.round(weight * 100)}%)`,
        `- Score: ${a.score}/100`,
        `- Decision: ${a.decision}`,
        `- Confidence: ${a.confidence}%`,
        `- Reasoning: ${a.reason}`,
      ].join("\n");
    })
    .join("\n\n");

  return `You are the Moderator of Verdikt, a multi-agent trading intelligence council. Four specialized agents have independently analyzed a token. Your job is to synthesize their verdicts into a single, clear, actionable summary.

Here are the agent verdicts:

${agentSummaries}

---

The weighted consensus score is **${consensusScore}/100**, which maps to a **${label}** recommendation.

Write a 3–5 sentence summary that:
1. States the final recommendation and confidence level clearly.
2. Highlights which agents agree and which dissent.
3. Calls out the single biggest risk and the single strongest signal.
4. Uses plain language a non-technical trader can act on.

Do NOT use bullet points or headers. Write in a confident, direct analytical voice — like a senior analyst briefing a portfolio manager. Be specific with numbers from the agent data.`;
}

export async function runModerator(
  agents: AgentOutput[],
  symbol: string
): Promise<ConsensusResult> {
  const consensusScore = computeWeightedScore(agents);
  const confidence = computeWeightedConfidence(agents);
  const { label } = decisionFromScore(consensusScore);

  let summary: string;

  try {
    const prompt = buildPrompt(agents, consensusScore);
    summary = await chatCompletion([
      { role: "user", content: prompt },
    ]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[moderator] LLM failed, generating fallback:", msg);

    // Fallback: produce a structured summary without the LLM
    const agreeing = agents.filter(
      (a) => a.decision === label || a.decision === "BUY" || a.decision === "STRONG BUY"
    );
    const dissenting = agents.filter(
      (a) => a.decision === "AVOID"
    );

    summary =
      `The council recommends ${label} for ${symbol} with a consensus score of ${consensusScore}/100. ` +
      `${agreeing.length} of 4 agents favor the position. ` +
      (dissenting.length > 0
        ? `${dissenting.map((a) => AGENT_MAP[a.id]?.name ?? a.id).join(" and ")} ` +
          `flagged concerns. `
        : "") +
      `(LLM summary unavailable — ${msg})`;
  }

  return {
    consensusScore,
    decision: label as Decision,
    confidence,
    summary,
  };
}
