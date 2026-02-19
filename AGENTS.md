# Codex Stack Policy (archistra)

## Default Tech Stack (Purpose-Fit)
For all future coding sessions in this repository, Codex must default to:
- HTML
- React
- TypeScript
- Next.js (App Router)
- Tailwind CSS

## Enforcement Rules
1. Use the default stack for all new pages, components, APIs, and refactors unless explicitly instructed otherwise.
2. Do not introduce a new framework, runtime, language, database, styling system, or major library outside the stack above without user approval.
3. If a new tech stack or major dependency is likely needed, stop and ask the user first with:
   - what is being proposed,
   - why it is needed,
   - tradeoffs,
   - minimal alternatives within current stack.
4. Until user approval is provided, continue implementation using the current stack only.

## Current Backend Direction
- Preferred backend path: Next.js API routes / server handlers.
- LLM provider integration target: OpenAI API from server-side code only.

## Quality Baseline
- Strong typing with TypeScript.
- Reusable React components.
- Tailwind-first styling, aligned with existing project aesthetic.
- Input validation, error handling, and secure secret handling for backend routes.
