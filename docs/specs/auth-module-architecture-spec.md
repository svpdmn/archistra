# Auth Module Architecture Spec (Auth0, Next.js, Static HTML Parity)

## Document Control
- **Status:** Approved
- **Version:** 1.0.0
- **Owner:** Archistra Engineering
- **Reviewers:** Product + Security
- **Created:** 2026-02-20
- **Last Updated:** 2026-02-20
- **Related Ticket(s):** Auth UI Parity + IAM implementation workstream

## 1. Summary
This module implements production-ready authentication and authorization using Auth0 for B2C and B2B/B2B2C workflows. It protects Next.js routes/APIs, enforces org-aware RBAC server-side, and provides auth UI parity across both Next.js pages and static HTML pages.

## 2. Goals
- Enforce secure authentication and role-based authorization for protected app surfaces.
- Provide consistent auth UX across Next.js and static HTML pages.
- Support Auth0 Organizations with invite-only onboarding and org context.
- Keep landing/public experience accessible while protecting chat and sensitive APIs.

## 3. Non-Goals
- Building custom username/password login forms (Auth0 Universal Login is used).
- Implementing org switching in v1.
- Replacing Auth0 with another IAM provider.

## 4. Scope
### In Scope
- Auth0 session integration with Next.js App Router.
- Middleware protection for `/chat`, `/api/chat`, `/api/health/openai`.
- RBAC enforcement in APIs.
- Auth-aware navigation for Next.js and static HTML pages.
- Unauthorized UX page and auth error recovery messaging.

### Out of Scope
- User/admin management UI for invitations and role assignment.
- Persistent distributed rate limit store (current store is in-memory).

## 5. Architecture Overview
The module combines Auth0-managed identity flows with server-side authorization checks and shared UI behavior.

### 5.1 Components
- **Auth0 Client (`lib/auth/session.ts`)**
  - Initializes Auth0 SDK with app/auth domain settings and authorization parameters.
  - Provides session helpers and API auth guard.
- **Claims Normalizer (`lib/auth/claims.ts`)**
  - Normalizes identity, org, and role claims into app-safe shape.
- **Middleware (`middleware.ts`)**
  - Protects selected pages/APIs and enforces org presence.
- **Auth Compatibility Route (`app/api/auth/[auth0]/route.ts`)**
  - Redirects `/api/auth/*` style paths to `/auth/*` routes.
- **Protected APIs**
  - `app/api/chat/route.ts`: role-gated chat access.
  - `app/api/health/openai/route.ts`: stricter role + verified email access.
- **Next UI Components**
  - `components/nav/auth-slot.tsx`
  - `components/nav/site-nav.tsx`
- **Static UI Utilities**
  - `scripts/auth-ui.js`
  - `scripts/navbar.js`

### 5.2 Data Flow
1. User initiates login via `/auth/login?returnTo=/chat`.
2. Auth0 Universal Login authenticates and returns via `/auth/callback`.
3. Session cookie is established by SDK.
4. Middleware checks authentication/org for protected routes.
5. API routes call `requireApiAuth()` for role and verification checks.
6. UI surfaces render logged-in or logged-out nav state from session (`Next`) or `/auth/profile` (`static`).

## 6. Public APIs / Interfaces / Types

### 6.1 API Endpoints
| Endpoint | Method | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| `/api/chat` | `POST` | Required (`owner/admin/member/viewer`) | `{ messages: [{ role, content }] }` | `{ id, outputText, model, requestId }` | `400/401/403/429/500/502/504` |
| `/api/health/openai` | `GET` | Required (`owner/admin`, verified email) | N/A | `{ ok, requestId, model, ... }` | `401/403/500/502/504` |
| `/auth/profile` | `GET` | Session dependent | N/A | Auth profile payload | `401` when unauthenticated |
| `/api/auth/[auth0]` | `GET` | N/A | path action | Redirect to `/auth/*` | `404` unsupported action |

### 6.2 Types / Contracts
- **`AuthClaims` (`lib/auth/claims.ts`)**
  - `sub: string`
  - `email: string | null`
  - `emailVerified: boolean`
  - `orgId: string | null`
  - `orgName: string | null`
  - `roles: AppRole[]`

- **`AppRole`**
  - `owner | admin | member | viewer`

- **`AuthUiState` (`scripts/auth-ui.js`)**
  - `isAuthenticated: boolean`
  - `email: string | null`
  - `orgId: string | null`
  - `orgName: string | null`
  - `roles: string[]`

## 7. Security, Privacy, and Compliance
- Auth0 session cookies are server-managed; auth is never trusted from client payloads.
- RBAC and org checks are enforced server-side in API guards.
- `/api/health/openai` requires verified email due to operational sensitivity.
- Secrets remain server-side (`OPENROUTER_API_KEY`, Auth0 client secret, etc.).
- Auth denial events are logged with request context.

## 8. Reliability and Performance
- In-memory rate limiting is applied to `/api/chat` with tenant-aware keying.
- Timeout handling is implemented for OpenRouter upstream requests.
- Next.js middleware ensures early rejection for unauthorized access.

## 9. Observability
- Structured logs include:
  - request IDs
  - event names (`chat_success`, `chat_error`, `auth_denied_*`, healthcheck events)
  - org/user context where available.

## 10. Failure Modes and Edge Cases
| Scenario | Expected Behavior | User Impact | Mitigation |
|---|---|---|---|
| Unauthenticated `/chat` access | Redirect to `/auth/login?returnTo=/chat` | Redirect to login | Middleware gate |
| Unauthenticated API access | `401` JSON | Request denied | `requireApiAuth()` |
| Missing org membership | `/chat` -> `/unauthorized`; APIs -> `403` | Access blocked | org claim checks |
| Insufficient role | `403` JSON | Access blocked | role checks in guards |
| Unverified email on health endpoint | `403` JSON | Access blocked | verified email policy |
| Static `/auth/profile` unavailable | Show logged-out nav | No account menu | graceful fallback in `scripts/auth-ui.js` |

## 11. Dependencies
- **Primary:** `@auth0/nextjs-auth0` (v4.1.0 pinned for Next 15.1.6 compatibility)
- **Validation:** `zod`
- **Runtime:** Next.js 15.x, React 19

## 12. Rollout and Migration Plan
1. Configure Auth0 tenant/app and Post Login Action claims.
2. Set required env vars in `.env.local` and deployment env.
3. Deploy to staging and verify unauth/auth flows + RBAC.
4. Roll to production and monitor auth/403/401 rates.

Rollback:
- Revert UI component integration while preserving backend guards.
- If needed, temporarily loosen route gating only by explicit security sign-off.

## 13. Testing Strategy
### 13.1 Unit Tests
- Claims normalization and role inclusion logic.

### 13.2 Integration Tests
- Middleware route protection behavior.
- API RBAC checks per role.

### 13.3 End-to-End Tests
- Login redirect flow.
- Authenticated chat usage.
- Unauthorized user behavior.

### 13.4 Regression Tests
- `npm run lint`
- `npm run build`
- API smoke checks (`/api/chat`, `/api/health/openai`) for 401/403/200 paths.

## 14. Acceptance Criteria
- Protected routes enforce authentication and org membership.
- API RBAC matches policy exactly.
- Next and static navs both show auth-aware state.
- Unauthorized and recovery UX are functional and clear.

## 15. Risks and Mitigations
| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| Claim namespace mismatch from Auth0 Action | Medium | High | Validate action config and fallback claim parsing |
| Static pages drift from Next UI behavior | Medium | Medium | Centralize nav/auth logic in shared scripts/components |
| In-memory rate limiter limitations in multi-instance prod | High | Medium | Move to Redis-backed limiter |

## 16. Open Questions
- Should v2 include org switcher UX for multi-org users?
- Should audit logs be shipped to centralized SIEM by default?
- Should `/api/health/openai` be internal-only behind network controls?

## 17. Appendix
### Key files
- `lib/auth/session.ts`
- `lib/auth/claims.ts`
- `middleware.ts`
- `app/api/chat/route.ts`
- `app/api/health/openai/route.ts`
- `app/api/auth/[auth0]/route.ts`
- `components/nav/auth-slot.tsx`
- `components/nav/site-nav.tsx`
- `scripts/auth-ui.js`
- `scripts/navbar.js`
