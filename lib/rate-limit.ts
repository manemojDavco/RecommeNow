import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _limiter: Ratelimit | null = null

// Max 3 vouch submissions per IP per 4 hours
export function getVouchRateLimit(): Ratelimit {
  if (!_limiter) {
    _limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '4 h'),
      prefix: 'rn:vouch',
    })
  }
  return _limiter
}
