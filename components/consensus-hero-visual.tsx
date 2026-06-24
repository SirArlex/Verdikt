"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { AGENTS } from "@/lib/agents";

/**
 * The product thesis as a picture: four independent agents (each its own hue)
 * stream their verdicts into a central moderator core, which resolves a single
 * consensus score. This is the one bold, signature moment of the page.
 */

const SIZE = 460;
const C = SIZE / 2;
const CORE_R = 58;
const ORBIT_R = 168;
const NODE_R = 30;

// Four agents placed on a tilted cross so lines read as "converging inward".
const ANGLES = [-130, -50, 50, 130]; // degrees, top-left → bottom-left
const nodes = AGENTS.map((a, i) => {
  const rad = (ANGLES[i] * Math.PI) / 180;
  return {
    ...a,
    x: C + ORBIT_R * Math.cos(rad),
    y: C + ORBIT_R * Math.sin(rad),
  };
});

function ScoreCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    const controls = animate(count, target, {
      duration: 1.8,
      delay: 1.1,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      unsub();
      controls.stop();
    };
  }, [count, rounded, target]);

  return (
    <span className="font-mono text-4xl font-semibold tabular-nums text-foreground">
      {display}
    </span>
  );
}

export function ConsensusHeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* Ambient bloom behind the core */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-48 w-48 rounded-full bg-agent-consensus/20 blur-[80px]" />
      </div>

      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative h-full w-full overflow-visible"
        role="img"
        aria-label="Four agents converging into a consensus core"
      >
        <defs>
          {nodes.map((n) => (
            <radialGradient key={`g-${n.id}`} id={`fill-${n.id}`}>
              <stop offset="0%" stopColor={`hsl(var(${n.colorVar}))`} stopOpacity={0.9} />
              <stop offset="100%" stopColor={`hsl(var(${n.colorVar}))`} stopOpacity={0.15} />
            </radialGradient>
          ))}
          <radialGradient id="fill-core">
            <stop offset="0%" stopColor="hsl(var(--agent-consensus))" stopOpacity={0.95} />
            <stop offset="100%" stopColor="hsl(var(--agent-trust))" stopOpacity={0.35} />
          </radialGradient>
        </defs>

        {/* Orbit guide ring */}
        <circle
          cx={C}
          cy={C}
          r={ORBIT_R}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          strokeDasharray="2 6"
          opacity={0.6}
        />

        {/* Connection lines — drawn from each node into the core */}
        {nodes.map((n, i) => (
          <motion.line
            key={`line-${n.id}`}
            x1={n.x}
            y1={n.y}
            x2={C}
            y2={C}
            stroke={`hsl(var(${n.colorVar}))`}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.12, ease: "easeOut" }}
          />
        ))}

        {/* Signal pulses travelling from each node to the core */}
        {nodes.map((n, i) => (
          <motion.circle
            key={`pulse-${n.id}`}
            r={3}
            fill={`hsl(var(${n.colorVar}))`}
            initial={{ cx: n.x, cy: n.y, opacity: 0 }}
            animate={{ cx: [n.x, C], cy: [n.y, C], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.6,
              delay: 1.2 + i * 0.18,
              repeat: Infinity,
              repeatDelay: 1.4,
              ease: "easeIn",
            }}
          />
        ))}

        {/* Agent nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={`node-${n.id}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: "backOut" }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R + 8}
              fill={`url(#fill-${n.id})`}
              opacity={0.5}
              className="animate-pulse-glow"
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={NODE_R}
              fill="hsl(var(--card))"
              stroke={`hsl(var(${n.colorVar}))`}
              strokeWidth={1.5}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className="font-mono"
              fontSize={11}
              fill={`hsl(var(${n.colorVar}))`}
            >
              {n.name.split(" ")[0].toUpperCase()}
            </text>
          </motion.g>
        ))}

        {/* Moderator / consensus core */}
        <motion.circle
          cx={C}
          cy={C}
          r={CORE_R + 14}
          fill="url(#fill-core)"
          opacity={0.35}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "backOut" }}
          style={{ transformOrigin: `${C}px ${C}px` }}
          className="animate-pulse-glow"
        />
        <motion.circle
          cx={C}
          cy={C}
          r={CORE_R}
          fill="hsl(var(--card))"
          stroke="hsl(var(--agent-consensus))"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "backOut" }}
          style={{ transformOrigin: `${C}px ${C}px` }}
        />
      </svg>

      {/* Core readout, layered over SVG for crisp text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="pointer-events-none absolute inset-0 grid place-items-center"
      >
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Consensus
          </span>
          <ScoreCounter target={84} />
          <span className="mt-0.5 rounded-full border border-agent-liquidity/40 bg-agent-liquidity/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-agent-liquidity">
            Strong Buy
          </span>
        </div>
      </motion.div>
    </div>
  );
}
