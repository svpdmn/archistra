import { ChatMessage } from "./chat-types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIResponse = {
  id?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function createOpenAIResponse(params: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  timeoutMs: number;
  maxOutputTokens: number;
  temperature: number;
}): Promise<{ id: string; outputText: string }> {
  const { apiKey, model, messages, timeoutMs, maxOutputTokens, temperature } = params;

  const payload = {
    model,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content
    })),
    max_tokens: maxOutputTokens,
    temperature
  };

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed (${response.status}): ${errorText.slice(0, 400)}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  const outputText = data.choices?.[0]?.message?.content?.trim() || "";

  return {
    id: data.id ?? crypto.randomUUID(),
    outputText: outputText || "No output text returned by model."
  };
}
