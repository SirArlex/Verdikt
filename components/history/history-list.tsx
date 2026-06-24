"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Inbox, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Analysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents";
import { decisionTone, formatTimeAgo, TONE_HSL, cn } from "@/lib/utils";

function MiniScore({
  colorVar,
  label,
  value,
}: {
  colorVar: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="font-mono text-sm font-semibold tabular-nums"
        style={{ color: `hsl(var(${colorVar}))` }}
      >
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function HistoryRow({ a, index }: { a: Analysis; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const tone = decisionTone(a.decision);
  const scores = [
    { id: "trust", v: a.trust_score },
    { id: "momentum", v: a.momentum_score },
    { id: "volatility", v: a.volatility_score },
    { id: "liquidity", v: a.liquidity_score },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4) }}
      className="glass glass-hover cursor-pointer rounded-2xl overflow-hidden"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* consensus score */}
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border font-mono text-xl font-semibold tabular-nums"
              style={{
                borderColor: `hsl(${TONE_HSL[tone]} / 0.4)`,
                background: `hsl(${TONE_HSL[tone]} / 0.1)`,
                color: `hsl(${TONE_HSL[tone]})`,
              }}
            >
              {a.consensus_score}
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-foreground">
                {a.token_address}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {formatTimeAgo(a.created_at)}
              </p>
            </div>
          </div>

          {/* mini agent scores */}
          <div className="flex items-center gap-5 lg:ml-auto">
            {scores.map((s) => {
              const meta = AGENTS.find((ag) => ag.id === s.id)!;
              return (
                <MiniScore
                  key={s.id}
                  colorVar={meta.colorVar}
                  label={meta.name.split(" ")[0]}
                  value={s.v}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3 lg:ml-4">
            <Badge variant={tone}>{a.decision}</Badge>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                expanded && "rotate-180"
              )}
            />
          </div>
        </div>

        {/* summary preview when collapsed */}
        {!expanded && (
          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {a.summary}
          </p>
        )}
      </div>

      {/* expanded: full summary + agent score bars */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-5 pb-6 pt-4 space-y-5">
              {/* full moderator summary */}
              <p className="text-sm leading-relaxed text-foreground/80">
                {a.summary}
              </p>

              {/* agent score bars */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {scores.map((s) => {
                  const meta = AGENTS.find((ag) => ag.id === s.id)!;
                  return (
                    <div key={s.id} className="space-y-2">
                      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider">
                        <span style={{ color: `hsl(var(${meta.colorVar}))` }}>
                          {meta.name.split(" ")[0]}
                        </span>
                        <span className="text-muted-foreground">{s.v}/100</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.v}%`,
                            background: `hsl(var(${meta.colorVar}))`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="font-mono text-[10px] text-muted-foreground">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HistoryList({ analyses }: { analyses: Analysis[] }) {
  if (analyses.length === 0) {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-2xl py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-secondary/40">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">No verdicts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Run your first analysis and it'll be saved here.
          </p>
        </div>
        <Link href="/analysis">
          <Button variant="primary">
            Run an analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((a, i) => (
        <HistoryRow key={a.id} a={a} index={i} />
      ))}
    </div>
  );
}
