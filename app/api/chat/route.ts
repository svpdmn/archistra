import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, ChatRequestBody } from "@/lib/chat-types";
import { createOpenAIResponse } from "@/lib/openai";
import { checkRateLimit, pruneRateLimitStore } from "@/lib/rate-limit";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;
const MIN_MESSAGES = 1;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function parseAndValidateBody(body: unknown): ChatMessage[] {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body.");
  }

  const candidate = body as ChatRequestBody;
  if (!Array.isArray(candidate.messages)) {
    throw new Error("messages must be an array.");
  }

  if (candidate.messages.length < MIN_MESSAGES || candidate.messages.length > MAX_MESSAGES) {
    throw new Error(`messages length must be between ${MIN_MESSAGES} and ${MAX_MESSAGES}.`);
  }

  const normalized: ChatMessage[] = candidate.messages.map((message) => {
    if (!message || typeof message !== "object") {
      throw new Error("Each message must be an object.");
    }

    if (message.role !== "user" && message.role !== "assistant" && message.role !== "system") {
      throw new Error("Invalid message role.");
    }

    if (typeof message.content !== "string") {
      throw new Error("message.content must be a string.");
    }

    const content = message.content.trim();
    if (!content) {
      throw new Error("message.content must not be empty.");
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`message.content exceeds max length (${MAX_CONTENT_LENGTH}).`);
    }

    return {
      role: message.role,
      content
    };
  });

  const lastMessage = normalized[normalized.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    throw new Error("Last message must be from user.");
  }

  return normalized;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured.", requestId }, { status: 500 });
  }

  const ip = getClientIp(request);
  const rateLimitMaxRequests = Number(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS || 30);
  const rateLimitWindowMs = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60_000);

  pruneRateLimitStore();
  const limit = checkRateLimit(`chat:${ip}`, rateLimitMaxRequests, rateLimitWindowMs);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again shortly.",
        requestId,
        retryAt: new Date(limit.resetAt).toISOString()
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetAt)
        }
      }
    );
  }

  try {
    const body = (await request.json()) as unknown;
    const messages = parseAndValidateBody(body);

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 20_000);
    const maxOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 500);
    const temperature = Number(process.env.OPENAI_TEMPERATURE || 0.3);

    const openAiResult = await createOpenAIResponse({
      apiKey,
      model,
      messages,
      timeoutMs,
      maxOutputTokens,
      temperature
    });

    const durationMs = Date.now() - start;
    console.info(
      JSON.stringify({
        event: "chat_success",
        requestId,
        ip,
        durationMs,
        model,
        messageCount: messages.length,
        inputCharacters: messages.reduce((acc, msg) => acc + msg.content.length, 0)
      })
    );

    return NextResponse.json(
      {
        id: openAiResult.id,
        outputText: openAiResult.outputText,
        model,
        requestId
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.resetAt)
        }
      }
    );
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown chat error.";

    const isTimeout = message.toLowerCase().includes("timed out") || message.toLowerCase().includes("abort");
    const isOpenAiError = message.startsWith("OpenAI request failed");
    const statusCode = isTimeout ? 504 : isOpenAiError ? 502 : 400;
    const safeMessage = message.includes("Unexpected token")
      ? "Malformed JSON body."
      : isOpenAiError
      ? "Upstream model request failed."
      : message;

    console.error(
      JSON.stringify({
        event: "chat_error",
        requestId,
        ip,
        durationMs,
        statusCode,
        error: safeMessage,
        upstreamError: message
      })
    );

    return NextResponse.json(
      {
        error: isTimeout ? "Upstream timeout. Please retry." : safeMessage,
        requestId,
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {})
      },
      { status: statusCode }
    );
  }
}
