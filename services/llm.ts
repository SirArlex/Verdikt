/**
 * LLM Service
 *
 * OpenAI-compatible chat completions. Works with both OpenRouter and Qwen
 * (Alibaba Cloud) since both expose /v1/chat/completions.
 *
 * To swap from OpenRouter to Qwen, change three env vars:
 *   LLM_BASE_URL=https://hackathon.bitgetops.com/v1
 *   LLM_API_KEY=<your Qwen token>
 *   LLM_MODEL=qwen3.6-plus
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

function getConfig() {
  const baseUrl =
    process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  const apiKey =
    process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY || "";
  const model =
    process.env.LLM_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  return { baseUrl, apiKey, model };
}

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const { baseUrl, apiKey, model } = getConfig();

  if (!apiKey) {
    console.warn("[llm] no API key configured — returning fallback summary");
    return "LLM not configured. Set LLM_API_KEY (or OPENROUTER_API_KEY) in .env.local.";
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      // OpenRouter-specific headers (ignored by Qwen)
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "ConsensusAI",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts?.maxTokens ?? 800,
      temperature: opts?.temperature ?? 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[llm] ${res.status}: ${text}`);
    throw new Error(`LLM request failed (${res.status})`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return content.trim();
}
