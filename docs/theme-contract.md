# Theme Contract

This repository uses a tri-mode theme model:
- `system`
- `light`
- `dark`

User preference is persisted in `localStorage` under `archistra-theme-mode`.

## Runtime Contract
- The resolved mode is stored on `<html>` as `data-theme` (`light` or `dark`).
- The selected mode is stored on `<html>` as `data-theme-mode` (`system`, `light`, `dark`).
- A theme change dispatches `archistra:theme-change` with `{ mode, resolved }`.
- Ambient background contract: preserve the blue particle-network + subtle grid composition in light and dark modes.

## Static Pages Contract
- Every root-level `.html` page must include the early head initializer that sets:
  - `document.documentElement.dataset.themeMode`
  - `document.documentElement.dataset.theme`
- Every root-level `.html` page must load `scripts/theme-mode.js`.
- Every root-level `.html` page must include `<canvas id="particles"></canvas>` and load `scripts/app.js`.
- Shared static navigation must bind theme toggles using `window.ArchistraTheme.bindToggle(...)`.

## Next.js Contract
- `app/layout.tsx` is the source of truth for pre-hydration theme initialization.
- `app/layout.tsx` must render `AmbientParticles` so current and future routes inherit the ambient background.
- Shared React navigation (`components/nav/site-nav.tsx`) must include `ThemeToggle`.
- New App Router pages must use theme tokens from `styles/theme.css` via `app/globals.css`.

## Styling Contract
- Do not hardcode color literals outside:
  - `styles/theme.css`
  - `scripts/tailwind-theme.js`
  - `scripts/theme-mode.js`
- Avoid hardcoded light/dark utility classes such as:
  - `text-white`, `bg-white`, `border-white`
  - `text-black`, `bg-black`, `border-black`
- Add or adjust theme values in `styles/theme.css` for both dark and light tokens.
- Card and section surfaces must use shared surface tokens (for example `--surface-card-*`, `--surface-card-strong-*`, `--surface-cta-*`, `--surface-shimmer-*`) so new pages inherit mode-safe visuals.
- Buttons must use Tailwind utility classes for size and layout on both static and Next surfaces; avoid reintroducing custom `btn-size-*` classes.

## Enforcement
- Run `npm run theme:check` before pushing changes.
- `npm run lint` and `npm run build` both run `theme:check`.
- CI deploy workflow runs the theme compliance check before syncing to S3.
