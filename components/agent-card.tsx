"use client";

import { motion } from "framer-motion";
import type { AgentOutput } from "@/types";
import { AGENT_MAP } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { decisionTone } from "@/lib/utils";

export function AgentCard({
  agent,
  visible,
}: {
  agent: AgentOutput;
  visible: boolean;
}) {
  const meta = AGENT_MAP[agent.id];
  const tone = decisionTone(agent.decision);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-hover group relative overflow-hidden rounded-2xl p-6"
      style={{ ["--c" as string]: `var(${meta.colorVar})` } as React.CSSProperties}
    >
      {/* top accent line in the agent's color */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(var(--c)), transparent)`,
        }}
      />
      {/* corner glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "hsl(var(--c))" }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl border"
            style={{
              borderColor: "hsl(var(--c) / 0.4)",
              background: "hsl(var(--c) / 0.1)",
            }}
          >
            <Icon className="h-5 w-5" style={{ color: "hsl(var(--c))" }} />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold leading-tight">
              {meta.name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {meta.source} · {Math.round(meta.weight * 100)}% weight
            </p>
          </div>
        </div>

        <Badge variant={tone}>{agent.decision}</Badge>
      </div>

      {/* score + confidence */}
      <div className="relative mt-5 flex items-end gap-5">
        <div
          className="flex items-baseline gap-1"
          style={{ color: "hsl(var(--c))" }}
        >
          <CountUp
            to={agent.score}
            delay={visible ? 0.15 : 0}
            className="font-mono text-4xl font-semibold tabular-nums"
          />
          <span className="font-mono text-sm text-muted-foreground">/100</span>
        </div>

        <div className="flex-1 pb-1.5">
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>confidence</span>
            <span>{agent.confidence}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "hsl(var(--c))" }}
              initial={{ width: 0 }}
              animate={{ width: visible ? `${agent.confidence}%` : 0 }}
              transition={{ duration: 1, delay: visible ? 0.3 : 0, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
        {agent.reason}
      </p>
    </motion.div>
  );
}
