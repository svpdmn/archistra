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

## Theme System Contract
- All current and future UI surfaces (static HTML + Next.js pages/components) must support tri-mode theme behavior: `system`, `light`, `dark`.
- Respect persisted user preference (`archistra-theme-mode`) and resolved mode attributes (`data-theme-mode`, `data-theme`) on the root HTML element.
- Use theme tokens from `styles/theme.css`; avoid hardcoded color literals in UI code.
- Preserve the blue ambient particle-network + subtle grid background composition and behavior in both light and dark modes across viewports.
- Use shared surface tokens for cards/sections (e.g. `--surface-card-*`, `--surface-card-strong-*`, `--surface-cta-*`, `--surface-shimmer-*`) so future pages stay visually stable across modes.
- Use Tailwind utility classes for all button spacing/sizing/interaction layout; do not add new `btn-size-*` style classes.
- Keep shared navigation/theme controls wired in both static (`scripts/navbar.js`) and Next (`components/nav/site-nav.tsx`) implementations.
- Run `npm run theme:check` before committing UI changes.
