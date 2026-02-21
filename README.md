# archistra

Next.js + React app with:
- Landing page at `/`
- Chat page at `/chat`
- Secure server route at `POST /api/chat` for OpenRouter integration
- Auth0 IAM module for B2C + B2B/B2B2C

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Set required values in `.env.local`:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
AUTH0_SECRET=replace_with_long_random_value
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_TENANT.us.auth0.com
APP_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=https://YOUR_TENANT.us.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_CLAIMS_NAMESPACE=https://archistra.app
```

## Run

```bash
npm run dev
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/chat`
- `http://localhost:3000/api/health/openai`

## Auth0 Setup

### Auth0 Dashboard
1. Enable Universal Login.
2. Enable connections:
   - Database (email/password)
   - Social providers (Google and Microsoft recommended)
3. Enable Organizations.
4. Configure invite-only organization onboarding.
5. Set application URLs:
   - Allowed Callback URL: `http://localhost:3000/auth/callback`
   - Allowed Logout URL: `http://localhost:3000/`
   - Allowed Web Origins: `http://localhost:3000`

### Custom claims via Action
Add a Post Login Action that injects namespaced claims:
- `https://archistra.app/org_id`
- `https://archistra.app/org_name`
- `https://archistra.app/roles` (e.g. `owner|admin|member|viewer`)

You can override the namespace in app config with `AUTH0_CLAIMS_NAMESPACE`.

### Protected route behavior
- Public: `/`
- Protected page: `/chat`
- Protected APIs: `/api/chat`, `/api/health/openai`

If unauthenticated:
- `/chat` redirects to Auth0 login
- protected APIs return `401`

If authenticated but missing organization:
- `/chat` redirects to `/unauthorized`
- protected APIs return `403`

### API RBAC policy
- `/api/chat`: `owner|admin|member|viewer`
- `/api/health/openai`: `owner|admin` and verified email

### Invite-only org flow
Use Auth0 Organization invitation links, which include `organization` and `invitation` query params. The app preserves these params on `/auth/login` and also supports compatibility redirects from `/api/auth/login`.

### Auth UI behavior (Next + static HTML parity)
- Logged out:
  - Navigation shows `SIGN UP` and links to `/auth/login?returnTo=/chat`.
- Logged in:
  - Navigation shows an account chip/dropdown with:
    - `Continue to Chat`
    - `Log Out`
    - identity context (email + org label)
- Static HTML pages (`index.html`, `chat.html`) resolve auth state using `GET /auth/profile`.
- If `/auth/profile` is unavailable or returns non-200, static pages gracefully fall back to logged-out nav.

## API Contract

`POST /api/chat`

Request body:
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

Response body:
```json
{
  "id": "resp_xxx",
  "outputText": "assistant text",
  "model": "deepseek/deepseek-r1-0528:free",
  "requestId": "uuid"
}
```

## OpenRouter Healthcheck

Use this endpoint to validate key + model wiring:

```bash
curl -s http://localhost:3000/api/health/openai | jq
```

Expected success:
- `ok: true`
- includes `model`, `latencyMs`, and `requestId`

## Guardrails Included

- Server-side key usage only (`OPENROUTER_API_KEY`)
- Input validation and limits
- Rate limiting (tenant + user + IP, in-memory)
- Upstream timeout handling
- Structured logs with request IDs

## Scale Notes

For multi-instance production:
- Replace in-memory limiter with Redis (e.g. Upstash/ElastiCache)
- Add centralized logs/metrics/tracing
- Add auth + tenant-aware rate limits and quotas
