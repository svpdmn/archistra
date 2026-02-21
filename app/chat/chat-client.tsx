"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  id: string;
  outputText: string;
  model: string;
};

type ChatClientProps = {
  userEmail: string | null;
  orgName: string | null;
  orgId: string;
  roles: string[];
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ChatClient({ userEmail, orgName, orgId, roles }: ChatClientProps) {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content: "Hello. I can help draft architecture notes, summarize requirements, and generate implementation plans."
    }
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !isLoading;
  }, [input, isLoading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    setError(null);
    setErrorStatus(null);
    setIsLoading(true);

    const userMessage: UiMessage = { id: createId(), role: "user", content };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        const normalizedError =
          response.status === 401
            ? "Session expired. Sign in again."
            : response.status === 403
            ? "Access denied for current role/org."
            : body?.error || `Request failed with status ${response.status}`;
        const failure = new Error(normalizedError) as Error & { status?: number };
        failure.status = response.status;
        throw failure;
      }

      const body = (await response.json()) as ChatResponse;
      const assistantMessage: UiMessage = {
        id: body.id || createId(),
        role: "assistant",
        content: body.outputText || "No response text returned from model."
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unknown error while sending message.";
      const status = submitError instanceof Error && "status" in submitError ? Number(submitError.status) || null : null;
      setError(message);
      setErrorStatus(status);
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setInput(content);
    } finally {
      setIsLoading(false);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form && canSend) {
        form.requestSubmit();
      }
    }
  }

  return (
    <main className="chat-page-root">
      <section className="chat-shell card-strong rounded-xl2">
        <header className="chat-header">
          <div>
            <p className="font-mono text-accent-400 text-xs tracking-widest">CHAT UI</p>
            <h1 className="chat-title font-display">archistra Assistant</h1>
            <p className="lead">Authenticated workspace with organization-aware access controls.</p>
          </div>
        </header>

        <div className="px-5 py-3 border-b u-border-subtle flex flex-wrap gap-2">
          <span className="badge font-mono tracking-wide">User: {userEmail || "unknown"}</span>
          <span className="badge font-mono tracking-wide">Org: {orgName || orgId}</span>
          <span className="badge font-mono tracking-wide">Role: {roles.join(", ") || "none"}</span>
        </div>

        <div className="chat-thread" role="log" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={`message-block ${message.role === "user" ? "message-user" : "message-assistant"}`}>
              <p className={`message-role font-mono text-[11px] tracking-wider ${message.role === "user" ? "text-accent-200" : "text-accent-400"}`}>
                {message.role === "user" ? "YOU" : "ASSISTANT"}
              </p>
              <div className="card rounded-md p-4">
                <p className="u-text-1">{message.content}</p>
              </div>
            </article>
          ))}
          {isLoading ? (
            <article className="message-block message-assistant">
              <p className="message-role font-mono text-[11px] tracking-wider text-accent-400">ASSISTANT</p>
              <div className="card rounded-md p-4">
                <p className="u-text-2">Thinking...</p>
              </div>
            </article>
          ) : null}
        </div>

        <form className="chat-composer" onSubmit={onSubmit}>
          <label htmlFor="prompt" className="font-mono text-xs tracking-wider u-text-3">
            MESSAGE
          </label>
          <div className="chat-input-row">
            <textarea
              id="prompt"
              name="prompt"
              rows={3}
              maxLength={4000}
              className="chat-input card rounded-none"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onInputKeyDown}
              required
            />
            <button
              type="submit"
              disabled={!canSend}
              className="btn btn-primary btn-size-page w-full sm:w-auto font-semibold font-alt"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="composer-meta">
            <p className="font-mono text-[11px] u-text-3">Backend: /api/chat (OpenRouter). Input limit: 4000 chars.</p>
            {error ? (
              <div className="font-mono text-[11px] error-text">
                <p>Error: {error}</p>
                {errorStatus === 401 ? (
                  <a href="/auth/login?returnTo=/chat" className="auth-menu-item inline-block mt-2">
                    Sign In
                  </a>
                ) : null}
                {errorStatus === 403 ? (
                  <Link href="/" className="auth-menu-item inline-block mt-2">
                    Return Home
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </form>
      </section>
    </main>
  );
}
