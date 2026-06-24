/**
 * MCP Client Manager
 *
 * Two modes, selected by the BRIDGE_URL env var:
 *
 * 1. **Local** (BRIDGE_URL unset) — spawns `trustgate-mcp-server` and
 *    `bitget-mcp-server` as child processes and talks JSON-RPC over stdio.
 *    Connections are cached on `globalThis` so they survive across requests
 *    in the Next.js dev server.
 *
 * 2. **Bridge** (BRIDGE_URL set) — POSTs to a lightweight HTTP bridge that
 *    keeps the MCP servers alive. Used for Vercel deployment.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// ── server definitions ────────────────────────────────────────────────
type ServerName = "trustgate" | "bitget";

const SERVER_COMMANDS: Record<ServerName, { command: string; args: string[] }> = {
  trustgate: { command: "npx", args: ["-y", "trustgate-mcp-server"] },
  bitget: { command: "npx", args: ["-y", "bitget-mcp-server"] },
};

// ── singleton cache on globalThis (survives hot-reload in dev) ────────
const g = globalThis as unknown as {
  _mcpClients?: Map<ServerName, Client>;
  _mcpConnecting?: Map<ServerName, Promise<Client>>;
};
if (!g._mcpClients) g._mcpClients = new Map();
if (!g._mcpConnecting) g._mcpConnecting = new Map();

// ── local client management ───────────────────────────────────────────

async function spawnClient(server: ServerName): Promise<Client> {
  const spec = SERVER_COMMANDS[server];
  console.log(`[mcp] spawning ${server}: ${spec.command} ${spec.args.join(" ")}`);

  const transport = new StdioClientTransport({
    command: spec.command,
    args: spec.args,
  });

  const client = new Client({ name: `consensus-ai-${server}`, version: "1.0" });
  await client.connect(transport);
  console.log(`[mcp] ${server} connected`);
  return client;
}

async function getLocalClient(server: ServerName): Promise<Client> {
  // Return cached client if alive
  const cached = g._mcpClients!.get(server);
  if (cached) return cached;

  // Return in-flight connection promise to avoid double-spawning
  const pending = g._mcpConnecting!.get(server);
  if (pending) return pending;

  // Spawn new connection
  const promise = spawnClient(server).then((client) => {
    g._mcpClients!.set(server, client);
    g._mcpConnecting!.delete(server);
    return client;
  }).catch((err) => {
    g._mcpConnecting!.delete(server);
    throw err;
  });

  g._mcpConnecting!.set(server, promise);
  return promise;
}

// ── bridge mode ───────────────────────────────────────────────────────

async function callViaBridge(
  server: ServerName,
  tool: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const bridgeUrl = process.env.BRIDGE_URL!;
  const res = await fetch(`${bridgeUrl}/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ server, tool, arguments: args }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bridge error (${res.status}): ${text}`);
  }

  return res.json();
}

// ── public API ────────────────────────────────────────────────────────

/**
 * Parse MCP tool result content blocks into usable data.
 * MCP tools return `{ content: [{ type: "text", text: "..." }, ...] }`.
 * We look for the last JSON block (Bitget API responses, TrustGate objects).
 */
export function parseMcpContent(content: unknown): unknown {
  if (!Array.isArray(content)) return content;

  const texts = content
    .filter((c: { type?: string }) => c.type === "text")
    .map((c: { text?: string }) => c.text ?? "");

  // Walk backwards — the structured JSON is usually the last block
  for (let i = texts.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(texts[i]);

      // Bitget MCP wrapper: { ok: true, data: { data: [...] } }
      if (parsed?.ok === true && parsed?.data?.data !== undefined) {
        const inner = parsed.data.data;
        // Most endpoints return a single-item array — unwrap it
        return Array.isArray(inner) && inner.length === 1 ? inner[0] : inner;
      }

      // Bitget REST direct wrapper: { code: "00000", data: ... }
      if (parsed?.code === "00000" && parsed.data !== undefined) return parsed.data;

      // TrustGate and others return plain objects
      return parsed;
    } catch {
      // not JSON, keep looking
    }
  }

  // Fallback: return joined text
  return texts.join("\n");
}

/**
 * Call a tool on one of the managed MCP servers.
 *
 * @returns Parsed response data (unwrapped from MCP content blocks and
 *          Bitget API wrappers).
 */
export async function callMcpTool(
  server: ServerName,
  tool: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  if (process.env.BRIDGE_URL) {
    return callViaBridge(server, tool, args);
  }

  const client = await getLocalClient(server);

  const result = await client.callTool({
    name: tool,
    arguments: args,
  });

  return parseMcpContent(result.content);
}

/**
 * Gracefully close all cached MCP clients.
 * Called during server shutdown if needed.
 */
export async function closeMcpClients(): Promise<void> {
  for (const [name, client] of g._mcpClients?.entries() ?? []) {
    try {
      await client.close();
      console.log(`[mcp] ${name} closed`);
    } catch {
      // ignore
    }
  }
  g._mcpClients?.clear();
}
