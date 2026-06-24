"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { AgentOutput, AnalyzeRequest, AnalyzeResponse } from "@/types";
import { analyzeToken } from "@/lib/api";
import { AGENTS } from "@/lib/agents";
import { AnalysisForm } from "@/components/analysis/analysis-form";
import { CouncilLoader } from "@/components/analysis/council-loader";
import { DebateTimeline } from "@/components/debate-timeline";
import { AgentCard } from "@/components/agent-card";
import { ConsensusPanel } from "@/components/consensus-panel";

type Status = "idle" | "loading" | "revealing" | "done" | "error";

const REVEAL_MS = 650;

export function AnalysisClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── staged reveal: advance step 0 → 5, then mark done ──────────────
  useEffect(() => {
    if (status !== "revealing") return;
    if (step >= 5) {
      setStatus("done");
      return;
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), REVEAL_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [status, step]);

  async function handleSubmit(req: AnalyzeRequest) {
    setStatus("loading");
    setError(null);
    setResult(null);
    setStep(0);

    try {
      const res = await analyzeToken(req);
      setResult(res);
      setStep(0);
      setStatus("revealing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
    }
  }

  // order agents by the canonical council sequence
  const orderedAgents: AgentOutput[] = result
    ? AGENTS.map((a) => result.agents.find((r) => r.id === a.id)).filter(
        (a): a is AgentOutput => Boolean(a)
      )
    : [];

  const showResults = status === "revealing" || status === "done";

  return (
    <div className="space-y-6">
      <AnalysisForm onSubmit={handleSubmit} loading={status === "loading"} />

      <AnimatePresence mode="wait">
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass flex items-start gap-3 rounded-2xl border-red-500/30 p-5"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-medium text-foreground">Analysis failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CouncilLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && result && (
        <div className="space-y-6">
          <DebateTimeline step={step} />

          <div className="grid gap-5 sm:grid-cols-2">
            {orderedAgents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                visible={step > i}
              />
            ))}
          </div>

          <AnimatePresence>
            {step >= 5 && (
              <ConsensusPanel
                consensus={result.consensus}
                symbol={result.symbol}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
