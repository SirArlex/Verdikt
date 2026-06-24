"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import { TONE_HSL, type Tone } from "@/lib/utils";

export function ScoreRing({
  score,
  tone,
  size = 200,
  stroke = 14,
  delay = 0,
  label,
}: {
  score: number;
  tone: Tone;
  size?: number;
  stroke?: number;
  delay?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = `hsl(${TONE_HSL[tone]})`;
  const uid = `ring-${tone}-${size}`;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-4 rounded-full blur-2xl"
        style={{ background: color, opacity: 0.18 }}
      />

      <svg width={size} height={size} className="relative -rotate-90">
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        {/* progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${uid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <CountUp
          to={score}
          delay={delay}
          className="font-mono text-5xl font-semibold tabular-nums"
        />
        {label && (
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
