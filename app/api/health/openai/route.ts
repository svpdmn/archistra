import { NextResponse } from "next/server";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export async function GET() {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        model,
        error: "OPENAI_API_KEY is not configured."
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
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
      const details = `OpenAI healthcheck failed (${response.status}): ${upstreamBody.slice(0, 400)}`;

      console.error(
        JSON.stringify({
          event: "openai_healthcheck_error",
          requestId,
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
          error: "OpenAI healthcheck failed.",
          ...(process.env.NODE_ENV !== "production" ? { details } : {})
        },
        { status: 502 }
      );
    }

    console.info(
      JSON.stringify({
        event: "openai_healthcheck_ok",
        requestId,
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
        message: "OpenAI API key and model are valid."
      },
      { status: 200 }
    );
  } catch (error) {
    const durationMs = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown healthcheck error.";
    const isTimeout = message.toLowerCase().includes("timed out") || message.toLowerCase().includes("abort");

    console.error(
      JSON.stringify({
        event: "openai_healthcheck_exception",
        requestId,
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
        error: isTimeout ? "OpenAI healthcheck timed out." : "OpenAI healthcheck failed.",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {})
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
