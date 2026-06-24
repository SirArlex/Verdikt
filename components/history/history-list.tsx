"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Inbox } from "lucide-react";
import type { Analysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENTS } from "@/lib/agents";
import { decisionTone, formatTimeAgo, TONE_HSL } from "@/lib/utils";

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

export function HistoryList({ analyses }: { analyses: Analysis[] }) {
  if (analyses.length === 0) {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-2xl py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-secondary/40">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold">No analyses yet</h3>
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
      {analyses.map((a, i) => {
        const tone = decisionTone(a.decision);
        const scores = [
          { id: "trust", v: a.trust_score },
          { id: "momentum", v: a.momentum_score },
          { id: "volatility", v: a.volatility_score },
          { id: "liquidity", v: a.liquidity_score },
        ];

        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4) }}
            className="glass glass-hover rounded-2xl p-5"
          >
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

              <Badge variant={tone} className="lg:ml-4">
                {a.decision}
              </Badge>
            </div>

            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {a.summary}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
