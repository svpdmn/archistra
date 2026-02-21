# Chat Module Architecture Spec (OpenRouter Chat, Next.js)

## Document Control
- **Status:** Approved
- **Version:** 1.0.0
- **Owner:** Archistra Engineering
- **Reviewers:** Product + Security
- **Created:** 2026-02-20
- **Last Updated:** 2026-02-20
- **Related Spec(s):** `docs/specs/auth-module-architecture-spec.md`

## 1. Summary
The Chat module provides a protected conversational workspace backed by OpenRouter. It includes a Next.js chat UI, server-side request validation, org-aware RBAC authorization, tenant-aware rate limiting, structured observability, and resilient upstream error handling.

## 2. Goals
- Provide a reliable, secure chat endpoint (`POST /api/chat`) for authenticated users.
- Ensure strict request validation and role-based authorization.
- Deliver a responsive UI with clear error recovery for auth and upstream failures.
- Preserve predictable behavior under load with rate limiting.

## 3. Non-Goals
- Streaming response UX in v1.
- Persistent chat history storage in v1.
- Multi-provider LLM routing in v1.

## 4. Scope
### In Scope
- Chat UI (`/chat`) for authenticated org members.
- Chat API contract and validation.
- OpenRouter request/response integration.
- Rate limiting and structured logs.
- Auth-aware error UX in chat composer.

### Out of Scope
- Conversation persistence/database.
- Attachments/file ingestion.
- Agent/tool orchestration workflows.

## 5. Architecture Overview
The module consists of a protected page (`/chat`), a client chat component for message lifecycle, and a server route (`/api/chat`) that validates payloads, enforces RBAC, applies rate limits, and calls OpenRouter.

### 5.1 Components
- **Chat Page (`app/chat/page.tsx`)**
  - Enforces session + org gate before rendering client UI.
- **Chat Client (`app/chat/chat-client.tsx`)**
  - Manages local message state, submit flow, and auth-specific errors.
- **Chat API (`app/api/chat/route.ts`)**
  - Validates input, enforces auth/roles, rate limits, and calls OpenRouter.
- **OpenRouter Adapter (`lib/openrouter.ts`)**
  - Encapsulates OpenRouter request mechanics and timeout behavior.
- **Rate Limit Store (`lib/rate-limit.ts`)**
  - In-memory limiter keyed by org/sub/ip combination.

### 5.2 Data Flow
1. User opens `/chat`.
2. Server verifies session and org membership.
3. User sends message from composer.
4. Client posts normalized messages to `/api/chat`.
5. API validates body and applies rate limit.
6. API calls OpenRouter and returns normalized output payload.
7. Client appends assistant message or shows actionable error UI.

## 6. Public APIs / Interfaces / Types

### 6.1 API Endpoints
| Endpoint | Method | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| `/api/chat` | `POST` | Required (`owner/admin/member/viewer`) | `{ messages: [{ role, content }] }` | `{ id, outputText, model, requestId }` | `400/401/403/429/500/502/504` |

### 6.2 Request Validation Rules (`/api/chat`)
- `messages` must be an array.
- Message count: minimum `1`, maximum `20`.
- Allowed roles per message: `user`, `assistant`, `system`.
- `content` must be a non-empty string.
- Max content length per message: `4000` chars.
- Final message role must be `user`.

### 6.3 UI Contracts
- **`UiMessage`**
  - `id: string`
  - `role: "user" | "assistant"`
  - `content: string`
- **`ChatResponse`**
  - `id: string`
  - `outputText: string`
  - `model: string`

## 7. Security, Privacy, and Compliance
- Chat route requires authenticated session and org membership.
- Role policy on `/api/chat`: `owner|admin|member|viewer`.
- OpenRouter API key is server-only and never exposed to clients.
- Client identity/role claims are never trusted; server guards are authoritative.
- Auth denials and errors are logged with request context.

## 8. Reliability and Performance
- Request timeout for upstream OpenRouter calls via configurable env timeout.
- Rate limiting (tenant + user + IP) using:
  - key pattern: `chat:${orgId}:${sub}:${ip}`
- Configurable limits:
  - `CHAT_RATE_LIMIT_MAX_REQUESTS`
  - `CHAT_RATE_LIMIT_WINDOW_MS`

## 9. Observability
- Success event: `chat_success`
- Error event: `chat_error`
- Logged context includes:
  - `requestId`
  - `orgId`, `sub`, `roles`
  - `model`, duration, status code
  - safe error and upstream error context

## 10. Failure Modes and Edge Cases
| Scenario | Expected Behavior | User Impact | Mitigation |
|---|---|---|---|
| Unauthenticated API call | `401` JSON | Request blocked | `requireApiAuth()` |
| Missing org claim | `403` JSON | Request blocked | org guard |
| Insufficient role | `403` JSON | Request blocked | role guard |
| Validation failure | `400` JSON | Input rejected | strict validation + message |
| Rate limit exceeded | `429` JSON + limit headers | Temporary block | retry window metadata |
| OpenRouter failure | `502` JSON | Temporary failure | safe upstream error mapping |
| OpenRouter timeout | `504` JSON | Temporary failure | timeout + retry guidance |

## 11. Dependencies
- `next` / `react`
- Internal auth helpers: `lib/auth/session.ts`
- OpenRouter adapter: `lib/openrouter.ts`
- In-memory limiter: `lib/rate-limit.ts`

## 12. Configuration
Required:
- `OPENROUTER_API_KEY`

Optional:
- `OPENROUTER_MODEL` (default: `deepseek/deepseek-r1-0528:free`)
- `OPENROUTER_TIMEOUT_MS` (default: `20000`)
- `OPENROUTER_MAX_OUTPUT_TOKENS` (default: `500`)
- `OPENROUTER_TEMPERATURE` (default: `0.3`)
- `CHAT_RATE_LIMIT_MAX_REQUESTS` (default: `30`)
- `CHAT_RATE_LIMIT_WINDOW_MS` (default: `60000`)

## 13. Testing Strategy
### 13.1 Unit Tests
- Body validation function (`parseAndValidateBody`).
- Error mapping behavior for upstream conditions.

### 13.2 Integration Tests
- `/api/chat` auth and role policy checks.
- Rate-limit behavior and headers.

### 13.3 End-to-End Tests
- `/chat` access when unauthenticated (redirect).
- Authenticated chat send/receive happy path.
- Chat UI recovery links on `401` and `403`.

### 13.4 Regression Tests
- `npm run lint`
- `npm run build`
- Smoke checks for `/api/chat` across `401/403/200` scenarios.

## 14. Acceptance Criteria
- Valid authenticated users with allowed roles can use `/api/chat`.
- Unauthorized users are blocked with correct status codes.
- Chat UI displays actionable errors for auth/permission failures.
- Request validation and rate limiting are consistently enforced.
- Build and lint pass with no regressions.

## 15. Risks and Mitigations
| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| In-memory limiter in multi-instance deployment | High | Medium | Move to Redis-backed limiter |
| Upstream latency spikes | Medium | Medium | timeout controls + retries at client policy level |
| Input abuse/oversized payloads | Medium | Medium | strict validation + max length checks |

## 16. Open Questions
- Should v2 support streaming tokens for better UX?
- Should chat history be persisted with per-org retention policy?
- Should model selection be role- or org-specific?

## 17. Appendix
### Key files
- `app/chat/page.tsx`
- `app/chat/chat-client.tsx`
- `app/api/chat/route.ts`
- `lib/openrouter.ts`
- `lib/chat-types.ts`
- `lib/rate-limit.ts`
- `lib/auth/session.ts`
