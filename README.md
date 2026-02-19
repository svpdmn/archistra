# archistra

Next.js + React app with:
- Landing page at `/`
- Chat page at `/chat`
- Secure server route at `POST /api/chat` for OpenAI integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Set your OpenAI API key in `.env.local`:
```env
OPENAI_API_KEY=your_openai_api_key
```

## Run

```bash
npm run dev
```

Open:
- `http://localhost:3000/`
- `http://localhost:3000/chat`
- `http://localhost:3000/api/health/openai`

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
  "model": "gpt-4.1-mini",
  "requestId": "uuid"
}
```

## OpenAI Healthcheck

Use this endpoint to validate key + model wiring:

```bash
curl -s http://localhost:3000/api/health/openai | jq
```

Expected success:
- `ok: true`
- includes `model`, `latencyMs`, and `requestId`

## Guardrails Included

- Server-side key usage only (`OPENAI_API_KEY`)
- Input validation and limits
- Rate limiting (per IP, in-memory)
- Upstream timeout handling
- Structured logs with request IDs

## Scale Notes

For multi-instance production:
- Replace in-memory limiter with Redis (e.g. Upstash/ElastiCache)
- Add centralized logs/metrics/tracing
- Add auth + tenant-aware rate limits and quotas
