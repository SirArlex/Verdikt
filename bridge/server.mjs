/**
 * ConsensusAI MCP Bridge
 *
 * A lightweight HTTP bridge that keeps TrustGate and Bitget MCP servers
 * alive as child processes and proxies tool calls over HTTP.
 *
 * Deploy this to Railway / Render / Fly.io (free tier), then set
 * BRIDGE_URL in your Vercel env vars.
 *
 * Usage:
 *   cd bridge
 *   npm install
 *   npm start
 *
 * Endpoint:
 *   POST /call
 *   Body: { "server": "trustgate" | "bitget", "tool": "...", "arguments": { ... } }
 *   Returns: parsed tool result
 */

import express from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ── MCP server definitions ──────────────────────────────────────────
const SERVERS = {
  trustgate: { command: "npx", args: ["-y", "trustgate-mcp-server"] },
  bitget: { command: "npx", args: ["-y", "bitget-mcp-server"] },
};

const clients = new Map();
const connecting = new Map();

async function getClient(name) {
  if (clients.has(name)) return clients.get(name);
  if (connecting.has(name)) return connecting.get(name);

  const spec = SERVERS[name];
  if (!spec) throw new Error(`Unknown server: ${name}`);

  console.log(`[bridge] spawning ${name}...`);
  const promise = (async () => {
    const transport = new StdioClientTransport({
      command: spec.command,
      args: spec.args,
    });
    const client = new Client({ name: `bridge-${name}`, version: "1.0" });
    await client.connect(transport);
    console.log(`[bridge] ${name} connected`);
    clients.set(name, client);
    connecting.delete(name);
    return client;
  })();

  connecting.set(name, promise);
  return promise;
}

function parseMcpContent(content) {
  if (!Array.isArray(content)) return content;
  const texts = content.filter((c) => c.type === "text").map((c) => c.text || "");

  for (let i = texts.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(texts[i]);
      if (parsed?.code === "00000" && parsed.data !== undefined) return parsed.data;
      return parsed;
    } catch {}
  }
  return texts.join("\n");
}

// ── routes ──────────────────────────────────────────────────────────

app.post("/call", async (req, res) => {
  const { server, tool, arguments: args } = req.body;

  if (!server || !tool) {
    return res.status(400).json({ error: "server and tool are required" });
  }

  try {
    const client = await getClient(server);
    const result = await client.callTool({ name: tool, arguments: args || {} });
    const parsed = parseMcpContent(result.content);
    res.json(parsed);
  } catch (err) {
    console.error(`[bridge] ${server}/${tool} failed:`, err.message);

    // If client died, remove it so next request reconnects
    clients.delete(server);

    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    servers: Object.keys(SERVERS),
    connected: Array.from(clients.keys()),
  });
});

// ── start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[bridge] listening on http://localhost:${PORT}`);
  console.log(`[bridge] servers will connect on first request`);
});
