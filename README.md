# Verdikt

A council of specialized agents debates every token and resolves **one verdict** — with the full reasoning shown. Built for the Bitget Agentic Trading Hackathon (Track 2 — Trading Infra).

> Verdikt is not a trading bot. It is decision-making infrastructure for AI trading systems.

---

## What it does

Most trading agents rely on a single signal. Verdikt replaces that with a structured council:

1. **Trust Agent** (40% weight) — queries TrustGate MCP for an on-chain legitimacy score
2. **Momentum Agent** (30% weight) — reads 24h price change + 7-day candle trend from Bitget
3. **Volatility Agent** (15% weight) — measures hourly price swings + futures funding rate via Bitget
4. **Liquidity Agent** (15% weight) — checks orderbook depth, spread, and 24h volume via Bitget

A **Moderator Agent** (OpenRouter/Qwen LLM) reads all four verdicts, applies weighted consensus, and writes a plain-language summary.

**Consensus formula:**
```
Score = (Trust × 0.40) + (Momentum × 0.30) + (Volatility × 0.15) + (Liquidity × 0.15)

80+   → STRONG BUY
65–79 → BUY
50–64 → HOLD
<50   → AVOID
```

---

## Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS** — dark-only design system with per-agent color identity
- **Framer Motion** — staged council reveal animation
- **Supabase** — verdict history persistence
- **OpenRouter** (or Qwen) — moderator LLM
- **TrustGate MCP** (`trustgate-mcp-server`) — on-chain trust scoring
- **Bitget MCP** (`bitget-mcp-server`) — spot market data (public endpoints)

---

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Fill in LLM_API_KEY at minimum — see .env.example for all vars

# 3. Run
npm run dev
```

Open http://localhost:3000.

---

## API

### `POST /api/analyze`

```json
// Request
{
  "symbol": "BTCUSDT",
  "address": "0x...",   // optional — enables full TrustGate scoring
  "chain": "arc"        // optional, defaults to "arc"
}

// Response
{
  "symbol": "BTCUSDT",
  "agents": [
    { "id": "trust", "score": 72, "confidence": 85, "decision": "BUY", "reason": "..." },
    { "id": "momentum", "score": 65, "confidence": 90, "decision": "BUY", "reason": "..." },
    { "id": "volatility", "score": 78, "confidence": 85, "decision": "BUY", "reason": "..." },
    { "id": "liquidity", "score": 80, "confidence": 95, "decision": "BUY", "reason": "..." }
  ],
  "consensus": {
    "consensusScore": 73,
    "decision": "BUY",
    "confidence": 89,
    "summary": "The council recommends BUY for BTCUSDT..."
  },
  "timestamp": "2026-06-24T14:00:00.000Z"
}
```

Any AI agent can call this endpoint to get a structured, multi-dimensional verdict before routing a trade.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LLM_API_KEY` | Yes | OpenRouter or Qwen API key |
| `LLM_BASE_URL` | No | Defaults to OpenRouter. Set to `https://hackathon.bitgetops.com/v1` for Qwen |
| `LLM_MODEL` | No | Defaults to `openai/gpt-4o-mini`. Use `qwen3.6-plus` for Qwen |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (for history) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key (for history) |
| `BRIDGE_URL` | No | MCP bridge URL for Vercel deployment |

---

## Supabase setup

1. Create a project at https://supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

---

## Vercel deployment

The Momentum, Volatility, and Liquidity agents use Bitget's public REST endpoints and deploy fine on Vercel. TrustGate requires a local stdio bridge:

```bash
cd bridge
npm install
# Deploy to Railway/Render, then set BRIDGE_URL in Vercel env vars
```

---

## Project structure

```
verdikt/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # landing page
│   ├── analysis/page.tsx               # live council UI
│   ├── history/page.tsx                # verdict history
│   └── api/analyze/route.ts            # POST /api/analyze
├── agents/
│   ├── trust-agent.ts                  # TrustGate MCP
│   ├── momentum-agent.ts               # Bitget candles + ticker
│   ├── volatility-agent.ts             # Bitget candles + funding rate
│   ├── liquidity-agent.ts              # Bitget depth + ticker
│   └── moderator-agent.ts             # LLM synthesis
├── components/
│   ├── agent-card.tsx
│   ├── consensus-panel.tsx
│   ├── debate-timeline.tsx
│   ├── score-ring.tsx
│   └── analysis/ history/ sections/ ui/
├── services/
│   ├── mcp-client.ts                   # MCP stdio + bridge manager
│   ├── bitget.ts                       # Bitget MCP wrappers
│   ├── trustgate.ts                    # TrustGate MCP wrapper
│   ├── llm.ts                          # OpenRouter/Qwen abstraction
│   └── supabase.ts                     # Supabase client
├── lib/
│   ├── consensus-engine.ts             # orchestrator
│   ├── agents.ts                       # agent metadata
│   └── utils.ts
├── bridge/
│   └── server.mjs                      # HTTP→MCP bridge for Vercel
└── supabase/schema.sql
```

---

Built by [@SirArlex](https://github.com/SirArlex) for the Bitget Agentic Trading Hackathon S1.
