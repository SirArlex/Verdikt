---
title: Verdikt MCP Bridge
emoji: 🔗
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# Verdikt MCP Bridge

HTTP bridge that keeps `trustgate-mcp-server` and `bitget-mcp-server` alive and proxies tool calls over HTTP. Used by the Verdikt Vercel deployment to call MCP servers that require stdio child processes.

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/call` | `{ server, tool, arguments }` | Call an MCP tool |
| GET | `/health` | — | Check connected servers |

## Usage

```bash
curl -X POST https://your-space.hf.space/call \
  -H "Content-Type: application/json" \
  -d '{"server":"bitget","tool":"spot_get_ticker","arguments":{"symbol":"BTCUSDT"}}'
```
