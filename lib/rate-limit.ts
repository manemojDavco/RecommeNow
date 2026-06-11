import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Lazily-built limiters, one per name, sharing a single Redis connection.
const _limiters: Record<string, Ratelimit> = {}

// Max 3 vouch submissions per IP per 4 hours
export function getVouchRateLimit(): Ratelimit {
  if (!_limiters.vouch) {
    _limiters.vouch = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '4 h'),
      prefix: 'rn:vouch',
    })
  }
  return _limiters.vouch
}

// Recruiter → candidate contact emails: 10 per IP per hour
export function getContactRateLimit(): Ratelimit {
  if (!_limiters.contact) {
    _limiters.contact = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'rn:contact',
    })
  }
  return _limiters.contact
}

// Feedback submissions: 5 per IP per hour
export function getFeedbackRateLimit(): Ratelimit {
  if (!_limiters.feedback) {
    _limiters.feedback = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      prefix: 'rn:feedback',
    })
  }
  return _limiters.feedback
}

// Vouch flags/reports: 10 per IP per hour
export function getFlagRateLimit(): Ratelimit {
  if (!_limiters.flag) {
    _limiters.flag = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      prefix: 'rn:flag',
    })
  }
  return _limiters.flag
}

// AI directory search (costs Anthropic tokens): 20 per IP per hour
export function getAiSearchRateLimit(): Ratelimit {
  if (!_limiters.aisearch) {
    _limiters.aisearch = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'rn:aisearch',
    })
  }
  return _limiters.aisearch
}

// Client IP from the proxy headers, with a safe fallback.
export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')?.trim()
    ?? '127.0.0.1'
}

/**
 * Enforce a limiter for the request IP. Returns a 429 NextResponse when the
 * limit is exceeded, or null when the request may proceed.
 */
export async function enforceRateLimit(
  req: NextRequest,
  limiter: Ratelimit,
  message = 'Too many requests. Please try again later.'
): Promise<NextResponse | null> {
  const { success } = await limiter.limit(clientIp(req))
  if (!success) {
    return NextResponse.json({ error: message }, { status: 429 })
  }
  return null
}
