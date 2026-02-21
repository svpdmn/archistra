import { ChatMessage } from "./chat-types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const RETRYABLE_UPSTREAM_STATUSES = new Set([408, 429, 502, 503, 504, 524, 529]);

type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

class OpenRouterRequestError extends Error {
  status: number | null;
  retryAfterMs: number | null;
  timeout: boolean;
  transient: boolean;

  constructor(
    message: string,
    options?: {
      status?: number | null;
      retryAfterMs?: number | null;
      timeout?: boolean;
      transient?: boolean;
    }
  ) {
    super(message);
    this.name = "OpenRouterRequestError";
    this.status = options?.status ?? null;
    this.retryAfterMs = options?.retryAfterMs ?? null;
    this.timeout = options?.timeout ?? false;
    this.transient = options?.transient ?? false;
  }
}

function isTimeoutError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;
  const lowered = error.message.toLowerCase();
  return (
    lowered.includes("timed out") ||
    lowered.includes("timeout") ||
    lowered.includes("abort") ||
    error.name === "AbortError" ||
    error.name === "TimeoutError"
  );
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return Math.round(asNumber * 1000);
  }

  const asDate = Date.parse(value);
  if (Number.isNaN(asDate)) return null;
  return Math.max(0, asDate - Date.now());
}

function parseModelList(value: string, primaryModel: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== primaryModel);
}

function uniqueModels(models: string[]): string[] {
  return Array.from(new Set(models));
}

function sanitizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.round(value);
  return normalized > 0 ? normalized : fallback;
}

function sanitizeNonNegativeInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.round(value);
  return normalized >= 0 ? normalized : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestOpenRouter(params: {
  apiKey: string;
  model: string;
  fallbackModels: string[];
  messages: ChatMessage[];
  timeoutMs: number;
  maxOutputTokens: number;
  temperature: number;
}) {
  const { apiKey, model, fallbackModels, messages, timeoutMs, maxOutputTokens, temperature } = params;
  const payload: Record<string, unknown> = {
    model,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content
    })),
    max_tokens: maxOutputTokens,
    temperature
  };
  const models = uniqueModels([model, ...fallbackModels]);
  if (models.length > 1) {
    payload.models = models;
  }

  const providerSort = (process.env.OPENROUTER_PROVIDER_SORT || "throughput").trim();
  const providerAllowFallbacks = parseBoolean(process.env.OPENROUTER_PROVIDER_ALLOW_FALLBACKS) ?? true;
  const provider: Record<string, unknown> = {};
  if (providerSort) provider.sort = providerSort;
  if (typeof providerAllowFallbacks === "boolean") {
    provider.allow_fallbacks = providerAllowFallbacks;
  }
  if (Object.keys(provider).length > 0) {
    payload.provider = provider;
  }

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "archistra"
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new OpenRouterRequestError("OpenRouter request timed out.", {
        timeout: true,
        transient: true
      });
    }
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new OpenRouterRequestError(`OpenRouter request failed (${response.status}): ${errorText.slice(0, 400)}`, {
      status: response.status,
      retryAfterMs: parseRetryAfterMs(response.headers.get("retry-after")),
      transient: RETRYABLE_UPSTREAM_STATUSES.has(response.status)
    });
  }

  const data = (await response.json()) as OpenRouterResponse;
  return {
    id: data.id ?? crypto.randomUUID(),
    model: data.model || model,
    outputText: data.choices?.[0]?.message?.content?.trim() || ""
  };
}

export async function createOpenRouterResponse(params: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  timeoutMs: number;
  maxOutputTokens: number;
  temperature: number;
}): Promise<{ id: string; outputText: string; model: string }> {
  const { apiKey, model, messages, timeoutMs, maxOutputTokens, temperature } = params;
  const fallbackModels = parseModelList(process.env.OPENROUTER_FALLBACK_MODEL || "", model);
  const maxRetries = sanitizeNonNegativeInteger(Number(process.env.OPENROUTER_TIMEOUT_RETRIES || 1), 1);
  const retryTimeoutMs = sanitizePositiveInteger(
    Number(process.env.OPENROUTER_RETRY_TIMEOUT_MS || Math.max(timeoutMs, 120_000)),
    Math.max(timeoutMs, 120_000)
  );
  const retryBaseDelayMs = sanitizePositiveInteger(Number(process.env.OPENROUTER_RETRY_BASE_DELAY_MS || 700), 700);
  const retryMaxDelayMs = sanitizePositiveInteger(Number(process.env.OPENROUTER_RETRY_MAX_DELAY_MS || 6_000), 6_000);

  let attempts = 0;
  let currentTimeoutMs = timeoutMs;

  while (true) {
    try {
      const result = await requestOpenRouter({
        apiKey,
        model,
        fallbackModels,
        messages,
        timeoutMs: currentTimeoutMs,
        maxOutputTokens,
        temperature
      });

      return {
        id: result.id,
        model: result.model,
        outputText: result.outputText || "No output text returned by model."
      };
    } catch (error) {
      const canRetry =
        error instanceof OpenRouterRequestError &&
        error.transient &&
        attempts < maxRetries;

      if (!canRetry) {
        throw error;
      }

      attempts += 1;
      if (error.timeout) {
        currentTimeoutMs = Math.max(currentTimeoutMs, retryTimeoutMs);
      }

      const backoffMs = Math.min(retryBaseDelayMs * 2 ** (attempts - 1), retryMaxDelayMs);
      const jitterMs = Math.floor(Math.random() * 300);
      const waitMs = error.retryAfterMs ?? backoffMs + jitterMs;
      await sleep(waitMs);
    }
  }
}
