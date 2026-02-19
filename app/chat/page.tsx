"use client";

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

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content: "Hello. I can help draft architecture notes, summarize requirements, and generate implementation plans."
    }
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && !isLoading;
  }, [input, isLoading]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    setError(null);
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
        throw new Error(body?.error || `Request failed with status ${response.status}`);
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
      setError(message);
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
            <p className="lead">Next.js + React chat UI wired to a secure OpenAI backend route.</p>
          </div>
          <a href="/" className="btn btn-secondary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold font-alt">
            Home
          </a>
        </header>

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
              className="btn btn-primary w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-semibold font-alt"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="composer-meta">
            <p className="font-mono text-[11px] u-text-3">Backend: /api/chat (OpenAI). Input limit: 4000 chars.</p>
            {error ? <p className="font-mono text-[11px] error-text">Error: {error}</p> : null}
          </div>
        </form>
      </section>
    </main>
  );
}
