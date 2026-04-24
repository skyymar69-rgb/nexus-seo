/**
 * Caching Layer — Upstash Redis or In-Memory
 * Evite de relancer les memes analyses. ~100ms au lieu de 15s.
 *
 * Setup: ajouter UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN dans .env
 * Gratuit: 10K requetes/jour sur Upstash
 * Documentation: https://upstash.com/docs/redis/overall/getstarted
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || ''
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; expiresAt: number }>()
const MAX_MEMORY_ENTRIES = 200

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN)
}

// ─── Upstash Redis ────────────────────────────────────────────

async function upstashGet(key: string): Promise<any | null> {
  try {
    const response = await fetch(`${UPSTASH_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      signal: AbortSignal.timeout(3000),
    })
    const data = await response.json()
    if (data.result) {
      return JSON.parse(data.result)
    }
    return null
  } catch {
    return null
  }
}

async function upstashSet(key: string, value: any, ttlSeconds: number): Promise<void> {
  try {
    await fetch(`${UPSTASH_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ EX: ttlSeconds, value: JSON.stringify(value) }),
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // Silently fail — cache is non-critical
  }
}

// ─── In-Memory Fallback ───────────────────────────────────────

function memoryGet(key: string): any | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.data
}

function memorySet(key: string, value: any, ttlSeconds: number): void {
  // Evict oldest entries if cache is full
  if (memoryCache.size >= MAX_MEMORY_ENTRIES) {
    const firstKey = memoryCache.keys().next().value
    if (firstKey) memoryCache.delete(firstKey)
  }
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  })
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Get a value from cache
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (isUpstashConfigured()) {
    return upstashGet(key)
  }
  return memoryGet(key)
}

/**
 * Set a value in cache with TTL
 */
export async function cacheSet(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  if (isUpstashConfigured()) {
    await upstashSet(key, value, ttlSeconds)
  } else {
    memorySet(key, value, ttlSeconds)
  }
}

/**
 * Cache wrapper — returns cached value or executes fn and caches result
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cachedValue = await cacheGet<T>(key)
  if (cachedValue !== null) {
    return cachedValue
  }

  const result = await fn()
  await cacheSet(key, result, ttlSeconds)
  return result
}

/**
 * Generate a cache key from URL and parameters
 */
export function cacheKey(prefix: string, ...parts: string[]): string {
  return `nexus:${prefix}:${parts.join(':')}`
}
