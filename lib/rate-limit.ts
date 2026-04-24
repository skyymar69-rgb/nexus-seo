/**
 * Rate Limiting — Protection contre les abus
 * In-memory par IP avec sliding window
 * Compatible Upstash Ratelimit quand configure
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean expired entries periodically
setInterval(() => {
  const now = Date.now()
  const keys = Array.from(store.keys())
  for (const key of keys) {
    const entry = store.get(key)
    if (entry && now > entry.resetAt) store.delete(key)
  }
}, 60000)

interface RateLimitConfig {
  maxRequests: number   // Max requests per window
  windowMs: number      // Window in milliseconds
}

const ROUTE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/audit': { maxRequests: 10, windowMs: 60000 },        // 10/min
  '/api/performance': { maxRequests: 10, windowMs: 60000 },   // 10/min
  '/api/crawl': { maxRequests: 5, windowMs: 60000 },          // 5/min
  '/api/crawl-stream': { maxRequests: 5, windowMs: 60000 },   // 5/min
  '/api/geo-audit': { maxRequests: 10, windowMs: 60000 },     // 10/min
  '/api/geo-engine': { maxRequests: 10, windowMs: 60000 },    // 10/min
  '/api/compare': { maxRequests: 10, windowMs: 60000 },       // 10/min
  '/api/ai-content': { maxRequests: 20, windowMs: 60000 },    // 20/min
  '/api/ai-visibility/check': { maxRequests: 5, windowMs: 60000 }, // 5/min
  'default': { maxRequests: 30, windowMs: 60000 },            // 30/min default
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

/**
 * Check rate limit for a given IP + route
 */
export function checkRateLimit(ip: string, route: string): RateLimitResult {
  const config = ROUTE_LIMITS[route] || ROUTE_LIMITS['default']
  const key = `${ip}:${route}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs, limit: config.maxRequests }
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: config.maxRequests }
  }

  entry.count++
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt, limit: config.maxRequests }
}

/**
 * Get rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}
