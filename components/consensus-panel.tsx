"use client";

import { motion } from "framer-motion";
import { Gavel } from "lucide-react";
import type { ConsensusResult } from "@/types";
import { ScoreRing } from "@/components/score-ring";
import { decisionTone, TONE_HSL } from "@/lib/utils";

export function ConsensusPanel({
  consensus,
  symbol,
}: {
  consensus: ConsensusResult;
  symbol: string;
}) {
  const tone = decisionTone(consensus.decision);
  const color = `hsl(${TONE_HSL[tone]})`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="gradient-border overflow-hidden p-px"
    >
      <div className="relative overflow-hidden rounded-[calc(var(--radius)-1px)] bg-card p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 mask-fade-b" />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px]"
          style={{ background: color, opacity: 0.15 }}
        />

        <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* ring */}
          <div className="shrink-0">
            <ScoreRing score={consensus.consensusScore} tone={tone} label="consensus" />
          </div>

          {/* verdict */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <Gavel className="h-4 w-4 text-agent-consensus" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Moderator verdict · {symbol}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-4 lg:justify-start">
              <h2
                className="font-display text-4xl font-semibold tracking-tight sm:text-5xl"
                style={{ color }}
              >
                {consensus.decision}
              </h2>
              <span className="rounded-full border border-border bg-secondary/40 px-3 py-1 font-mono text-xs text-muted-foreground">
                {consensus.confidence}% confidence
              </span>
            </div>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-foreground/80 lg:mx-0">
              {consensus.summary}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
