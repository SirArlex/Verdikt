"use client";

import { motion } from "framer-motion";
import { Check, Gavel } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import { cn } from "@/lib/utils";

/**
 * `step` is the reveal counter (0–5):
 *   - node i is "done" when step > i, "active" when step === i, else pending.
 *   - index 4 is the Moderator.
 */
export function DebateTimeline({ step }: { step: number }) {
  const nodes = [
    ...AGENTS.map((a) => ({
      key: a.id,
      label: a.name.split(" ")[0],
      colorVar: a.colorVar,
      icon: a.icon,
    })),
    {
      key: "moderator",
      label: "Moderator",
      colorVar: "--agent-consensus",
      icon: Gavel,
    },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="relative flex h-2 w-2">
          {step < 5 && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-agent-consensus opacity-60" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-agent-consensus" />
        </span>
        {step < 5 ? "Council deliberating" : "Consensus reached"}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-0">
        {nodes.map((node, i) => {
          const done = step > i;
          const active = step === i;
          const Icon = node.icon;
          const color = `hsl(var(${node.colorVar}))`;

          return (
            <div
              key={node.key}
              className="flex items-center gap-3 md:flex-1 md:flex-col md:gap-2"
            >
              <div className="flex items-center gap-3 md:w-full md:flex-col">
                <motion.span
                  className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border-2"
                  animate={{
                    borderColor: done || active ? color : "hsl(var(--border))",
                    scale: active ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background:
                      done || active ? `hsl(var(${node.colorVar}) / 0.12)` : "transparent",
                  }}
                >
                  {active && (
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: color }}
                      animate={{ opacity: [0.4, 0.1, 0.4], scale: [1, 1.25, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  {done ? (
                    <Check className="relative h-5 w-5" style={{ color }} />
                  ) : (
                    <Icon
                      className="relative h-5 w-5"
                      style={{ color: active ? color : "hsl(var(--muted-foreground))" }}
                    />
                  )}
                </motion.span>

                <span
                  className={cn(
                    "font-mono text-xs uppercase tracking-wider transition-colors md:text-center",
                    done || active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {node.label}
                </span>
              </div>

              {/* connector (hidden after last node) */}
              {i < nodes.length - 1 && (
                <div className="ml-[21px] h-6 w-px bg-border md:ml-0 md:mt-0 md:h-px md:w-full md:flex-1">
                  <motion.div
                    className="h-full w-full origin-left"
                    style={{ background: color }}
                    initial={{ scaleX: 0, scaleY: 0 }}
                    animate={
                      done
                        ? { scaleX: 1, scaleY: 1 }
                        : { scaleX: 0, scaleY: 0 }
                    }
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
