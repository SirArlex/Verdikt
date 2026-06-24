import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

type ServerName = "trustgate" | "bitget";

const SERVER_COMMANDS: Record<ServerName, { command: string; args: string[] }> = {
  trustgate: { command: "npx", args: ["-y", "trustgate-mcp-server"] },
  bitget: { command: "npx", args: ["-y", "bitget-mcp-server"] },
};

const g = globalThis as unknown as {
  _mcpClients?: Map<ServerName, Client>;
  _mcpConnecting?: Map<ServerName, Promise<Client>>;
};
if (!g._mcpClients) g._mcpClients = new Map();
if (!g._mcpConnecting) g._mcpConnecting = new Map();

async function spawnClient(server: ServerName): Promise<Client> {
  const spec = SERVER_COMMANDS[server];
  console.log(`[mcp] spawning ${server}: ${spec.command} ${spec.args.join(" ")}`);
  const transport = new StdioClientTransport({ command: spec.command, args: spec.args });
  const client = new Client({ name: `verdikt-${server}`, version: "1.0" });
  await client.connect(transport);
  console.log(`[mcp] ${server} connected`);
  return client;
}

async function getLocalClient(server: ServerName): Promise<Client> {
  const cached = g._mcpClients!.get(server);
  if (cached) return cached;
  const pending = g._mcpConnecting!.get(server);
  if (pending) return pending;
  const promise = spawnClient(server)
    .then((client) => {
      g._mcpClients!.set(server, client);
      g._mcpConnecting!.delete(server);
      return client;
    })
    .catch((err) => {
      g._mcpConnecting!.delete(server);
      throw err;
    });
  g._mcpConnecting!.set(server, promise);
  return promise;
}

/**
 * Unwrap Bitget MCP envelope: { ok: true, data: { data: [...] } }
 * TrustGate returns a plain object — passes through unchanged.
 */
function unwrapBitgetResponse(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const p = parsed as Record<string, unknown>;

  if (p.ok === true && p.data && typeof p.data === "object") {
    const inner = (p.data as Record<string, unknown>).data;
    if (inner !== undefined) {
      return Array.isArray(inner) && inner.length === 1 ? inner[0] : inner;
    }
  }
  return parsed;
}

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

  const parsed = await res.json();
  return unwrapBitgetResponse(parsed);
}

export function parseMcpContent(content: unknown): unknown {
  if (!Array.isArray(content)) return content;

  const texts = content
    .filter((c: { type?: string }) => c.type === "text")
    .map((c: { text?: string }) => c.text ?? "");

  for (let i = texts.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(texts[i]);

      // Bitget MCP wrapper: { ok: true, data: { data: [...] } }
      if (parsed?.ok === true && parsed?.data?.data !== undefined) {
        const inner = parsed.data.data;
        return Array.isArray(inner) && inner.length === 1 ? inner[0] : inner;
      }

      // Bitget REST direct wrapper: { code: "00000", data: ... }
      if (parsed?.code === "00000" && parsed.data !== undefined) return parsed.data;

      return parsed;
    } catch {
      // not JSON, keep looking
    }
  }

  return texts.join("\n");
}

export async function callMcpTool(
  server: ServerName,
  tool: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  if (process.env.BRIDGE_URL) {
    return callViaBridge(server, tool, args);
  }

  const client = await getLocalClient(server);
  const result = await client.callTool({ name: tool, arguments: args });
  return parseMcpContent(result.content);
}

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
