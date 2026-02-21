import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, ChatRequestBody } from "@/lib/chat-types";
import { createOpenRouterResponse } from "@/lib/openrouter";
import { checkRateLimit, pruneRateLimitStore } from "@/lib/rate-limit";
import { requireApiAuth } from "@/lib/auth/session";

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

function parseUpstreamStatus(error: unknown): number | null {
  if (!error || typeof error !== "object" || !("status" in error)) return null;
  const value = (error as { status?: unknown }).status;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.round(parsed);
  return normalized > 0 ? normalized : fallback;
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();
  const chatAuthBypass = process.env.CHAT_AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production";

  let resolvedClaims: {
    sub: string;
    email: string | null;
    emailVerified: boolean;
    orgId: string | null;
    orgName: string | null;
    roles: string[];
  };

  if (chatAuthBypass) {
    resolvedClaims = {
        sub: "guest",
        email: null,
        emailVerified: false,
        orgId: "public",
        orgName: "Public",
        roles: ["viewer"]
      };
  } else {
    const authResult = await requireApiAuth(request, {
      requestId,
      allowedRoles: ["owner", "admin", "member", "viewer"],
      requireOrg: true
    });
    if (!authResult.ok) {
      return authResult.response;
    }
    resolvedClaims = authResult.context.claims;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured.", requestId }, { status: 500 });
  }

  const ip = getClientIp(request);
  const rateLimitMaxRequests = Number(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS || 30);
  const rateLimitWindowMs = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60_000);

  pruneRateLimitStore();
  const limit = checkRateLimit(
    `chat:${resolvedClaims.orgId || "no-org"}:${resolvedClaims.sub || "no-sub"}:${ip}`,
    rateLimitMaxRequests,
    rateLimitWindowMs
  );

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

    const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1-0528:free";
    const requestedTimeoutMs = parsePositiveInteger(process.env.OPENROUTER_TIMEOUT_MS, 60_000);
    const timeoutMs =
      model.includes("deepseek-r1") && Number.isFinite(requestedTimeoutMs)
        ? Math.max(requestedTimeoutMs, 120_000)
        : requestedTimeoutMs;
    const maxOutputTokens = parsePositiveInteger(process.env.OPENROUTER_MAX_OUTPUT_TOKENS, 500);
    const temperature = Number(process.env.OPENROUTER_TEMPERATURE || 0.3);

    const openRouterResult = await createOpenRouterResponse({
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
        sub: resolvedClaims.sub,
        orgId: resolvedClaims.orgId,
        roles: resolvedClaims.roles,
        durationMs,
        modelRequested: model,
        modelResolved: openRouterResult.model,
        timeoutMs,
        messageCount: messages.length,
        inputCharacters: messages.reduce((acc, msg) => acc + msg.content.length, 0)
      })
    );

    return NextResponse.json(
      {
        id: openRouterResult.id,
        outputText: openRouterResult.outputText,
        model: openRouterResult.model,
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
    const upstreamStatus = parseUpstreamStatus(error);

    const isTimeout =
      message.toLowerCase().includes("timed out") ||
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("abort");
    const isProviderError = message.startsWith("OpenRouter request failed");
    const statusCode = isTimeout
      ? 504
      : upstreamStatus === 429
      ? 429
      : upstreamStatus === 503
      ? 503
      : isProviderError
      ? 502
      : 400;
    const safeMessage = message.includes("Unexpected token")
      ? "Malformed JSON body."
      : upstreamStatus === 429
      ? "Upstream rate limited. Please retry shortly."
      : upstreamStatus === 402
      ? "Upstream billing or credit issue."
      : isProviderError
      ? "Upstream model request failed."
      : message;

    console.error(
      JSON.stringify({
        event: "chat_error",
        requestId,
        ip,
        sub: resolvedClaims.sub,
        orgId: resolvedClaims.orgId,
        roles: resolvedClaims.roles,
        durationMs,
        statusCode,
        upstreamStatus,
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
