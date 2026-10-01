/**
 * Rate Limiter for Lead Submissions
 *
 * NOTE ON SERVERLESS (Vercel / Lambda):
 * In a serverless environment, in-memory counters reset across separate function invocations.
 * For MVP/v1, anti-spam is strongly fortified by:
 * 1. Client-invisible Honeypot field (`_gotcha`)
 * 2. Strict 10-digit Indian phone regex (`/^[6-9]\d{9}$/`)
 * 3. Submission timestamp telemetry
 *
 * PRODUCTION SCALE UPGRADE:
 * When moving to high-volume production, swap this in-memory map with Upstash Redis or Vercel KV:
 * import { Redis } from '@upstash/redis'
 * const redis = Redis.fromEnv()
 * const count = await redis.incr(key)
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes window
): RateLimitResult {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  // Clean up expired records occasionally
  if (record && now > record.resetAt) {
    memoryStore.delete(identifier);
  }

  const current = memoryStore.get(identifier);

  if (!current) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetSeconds: Math.ceil((current.resetAt - now) / 1000),
  };
}
