import type { AgentId } from "@/types";
import { ShieldCheck, TrendingUp, Activity, Droplets, type LucideIcon } from "lucide-react";

export interface AgentMeta {
  id: AgentId;
  name: string;
  role: string;
  blurb: string;
  source: string;
  weight: number;
  icon: LucideIcon;
  colorVar: string;
  colorClass: string;
}

export const AGENTS: AgentMeta[] = [
  {
    id: "trust",
    name: "Trust Agent",
    role: "Reputation & verification",
    blurb:
      "Pulls a verifiable TrustGate rating and verdict, then weighs how much the on-chain record can be trusted.",
    source: "TrustGate MCP",
    weight: 0.4,
    icon: ShieldCheck,
    colorVar: "--agent-trust",
    colorClass: "agent-trust",
  },
  {
    id: "momentum",
    name: "Momentum Agent",
    role: "Price & trend",
    blurb:
      "Reads 24h price change, 7-day candle trend, and volume dynamics from Bitget spot markets.",
    source: "Bitget MCP",
    weight: 0.3,
    icon: TrendingUp,
    colorVar: "--agent-momentum",
    colorClass: "agent-momentum",
  },
  {
    id: "volatility",
    name: "Volatility Agent",
    role: "Stability & risk",
    blurb:
      "Measures hourly price swing intensity and reads futures funding rates to flag unstable positioning.",
    source: "Bitget MCP",
    weight: 0.15,
    icon: Activity,
    colorVar: "--agent-volatility",
    colorClass: "agent-volatility",
  },
  {
    id: "liquidity",
    name: "Liquidity Agent",
    role: "Depth & exit risk",
    blurb:
      "Checks orderbook depth, bid-ask spread, and 24h volume so a position can be entered and exited cleanly.",
    source: "Bitget MCP",
    weight: 0.15,
    icon: Droplets,
    colorVar: "--agent-liquidity",
    colorClass: "agent-liquidity",
  },
];

export const AGENT_MAP: Record<AgentId, AgentMeta> = AGENTS.reduce(
  (acc, a) => ({ ...acc, [a.id]: a }),
  {} as Record<AgentId, AgentMeta>
);
