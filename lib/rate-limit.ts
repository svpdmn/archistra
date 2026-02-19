type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    store.set(key, next);
    return { allowed: true, limit, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, limit, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, limit, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Lightweight GC to avoid unbounded in-memory growth.
export function pruneRateLimitStore(maxEntries = 5000): void {
  if (store.size <= maxEntries) return;
  const now = Date.now();
  for (const [key, value] of store) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}
