# ConsensusAI MCP Bridge

A lightweight HTTP bridge that keeps the TrustGate and Bitget MCP servers alive and proxies tool calls over HTTP. Needed for Vercel deployment (where child processes can't be spawned).

## Local usage

```bash
cd bridge
npm install
npm start
# → http://localhost:3001
```

Test it:

```bash
curl -X POST http://localhost:3001/call \
  -H "Content-Type: application/json" \
  -d '{"server":"bitget","tool":"spot_get_ticker","arguments":{"symbol":"BTCUSDT"}}'
```

## Deploy to Railway

1. Push this `bridge/` folder to a repo (or use a monorepo with root directory set to `bridge`)
2. Connect to [Railway](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects Node.js, runs `npm start`
4. Copy the public URL (e.g. `https://consensus-bridge-production.up.railway.app`)
5. Set `BRIDGE_URL=https://consensus-bridge-production.up.railway.app` in your Vercel env vars

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/call` | `{ server, tool, arguments }` | Call an MCP tool |
| GET | `/health` | — | Check which servers are connected |

## Supported servers

| Name | Package | Tools |
|------|---------|-------|
| `trustgate` | `trustgate-mcp-server` | `trustgate_score` |
| `bitget` | `bitget-mcp-server` | `spot_get_ticker`, `spot_get_candles`, `spot_get_depth`, `futures_get_funding_rate`, etc. |
