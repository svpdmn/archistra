import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/auth/session";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  const authResult = await requireApiAuth(request, {
    requestId,
    allowedRoles: ["owner", "admin"],
    requireOrg: true,
    requireVerifiedEmail: true
  });
  if (!authResult.ok) {
    return authResult.response;
  }
  const { claims } = authResult.context;

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1-0528:free";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        model,
        error: "OPENROUTER_API_KEY is not configured."
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || process.env.AUTH0_BASE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "archistra"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "healthcheck" }],
        max_tokens: 8,
        temperature: 0
      }),
      signal: AbortSignal.timeout(10_000)
    });

    const durationMs = Date.now() - start;

    if (!response.ok) {
      const upstreamBody = await response.text().catch(() => "");
      const details = `OpenRouter healthcheck failed (${response.status}): ${upstreamBody.slice(0, 400)}`;

      console.error(
        JSON.stringify({
          event: "openrouter_healthcheck_error",
          requestId,
          sub: claims.sub,
          orgId: claims.orgId,
          roles: claims.roles,
          model,
          status: response.status,
          durationMs
        })
      );

      return NextResponse.json(
        {
          ok: false,
          requestId,
          model,
          error: "OpenRouter healthcheck failed.",
          ...(process.env.NODE_ENV !== "production" ? { details } : {})
        },
        { status: 502 }
      );
    }

    console.info(
      JSON.stringify({
        event: "openrouter_healthcheck_ok",
        requestId,
        sub: claims.sub,
        orgId: claims.orgId,
        roles: claims.roles,
        model,
        durationMs
      })
    );

    return NextResponse.json(
      {
        ok: true,
        requestId,
        model,
        latencyMs: durationMs,
        message: "OpenRouter API key and model are valid."
      },
      { status: 200 }
    );
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown healthcheck error.";
    const isTimeout = message.toLowerCase().includes("timed out") || message.toLowerCase().includes("abort");

    console.error(
      JSON.stringify({
        event: "openrouter_healthcheck_exception",
        requestId,
        sub: claims.sub,
        orgId: claims.orgId,
        roles: claims.roles,
        model,
        durationMs,
        error: message
      })
    );

    return NextResponse.json(
      {
        ok: false,
        requestId,
        model,
        error: isTimeout ? "OpenRouter healthcheck timed out." : "OpenRouter healthcheck failed.",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {})
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
