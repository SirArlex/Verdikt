"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AGENTS } from "@/lib/agents";

const MESSAGES = [
  "Trust Agent querying TrustGate…",
  "Momentum Agent reading Bitget candles…",
  "Volatility Agent measuring price swings…",
  "Liquidity Agent inspecting the orderbook…",
  "Moderator weighing the debate…",
];

export function CouncilLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % MESSAGES.length),
      1300
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass flex flex-col items-center gap-6 rounded-2xl py-16">
      <div className="flex items-center gap-4">
        {AGENTS.map((a, i) => (
          <motion.span
            key={a.id}
            className="grid h-12 w-12 place-items-center rounded-full border-2"
            style={{
              borderColor: `hsl(var(${a.colorVar}) / 0.5)`,
              background: `hsl(var(${a.colorVar}) / 0.1)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          >
            <a.icon className="h-5 w-5" style={{ color: `hsl(var(${a.colorVar}))` }} />
          </motion.span>
        ))}
      </div>

      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-sm text-muted-foreground"
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
