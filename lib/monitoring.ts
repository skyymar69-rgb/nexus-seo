/**
 * Error Monitoring & Performance Tracking
 * Compatible avec Sentry, ou log-only si non configure
 *
 * Setup: npm install @sentry/nextjs && ajouter SENTRY_DSN dans .env
 * Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *
 * En attendant Sentry, ce module fournit un monitoring basique
 * avec console.error structure + stockage des erreurs recentes.
 */

interface ErrorLog {
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  context?: Record<string, any>
  stack?: string
  userId?: string
  route?: string
}

// In-memory error buffer (last 100 errors)
const errorBuffer: ErrorLog[] = []
const MAX_ERRORS = 100

/**
 * Log an error with context
 */
export function logError(
  error: Error | string,
  context?: {
    userId?: string
    route?: string
    extra?: Record<string, any>
  }
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    userId: context?.userId,
    route: context?.route,
    context: context?.extra,
  }

  // Store in buffer
  errorBuffer.push(errorLog)
  if (errorBuffer.length > MAX_ERRORS) {
    errorBuffer.shift()
  }

  // Console log with structure
  console.error(`[NEXUS ERROR] ${errorLog.timestamp}`, {
    message: errorLog.message,
    route: errorLog.route,
    userId: errorLog.userId,
    ...(errorLog.context || {}),
  })

  // TODO: When Sentry is configured, call Sentry.captureException(error)
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, any>): void {
  const log: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: 'warning',
    message,
    context,
  }
  errorBuffer.push(log)
  if (errorBuffer.length > MAX_ERRORS) errorBuffer.shift()
  console.warn(`[NEXUS WARN] ${log.timestamp}`, message, context || '')
}

/**
 * Track a performance metric
 */
export function trackPerformance(name: string, durationMs: number, metadata?: Record<string, any>): void {
  console.info(`[NEXUS PERF] ${name}: ${durationMs}ms`, metadata || '')
}

/**
 * Get recent errors (for admin dashboard)
 */
export function getRecentErrors(limit: number = 20): ErrorLog[] {
  return errorBuffer.slice(-limit).reverse()
}

/**
 * API route handler wrapper with error monitoring
 */
export function withMonitoring<T>(
  routeName: string,
  handler: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  return handler()
    .then(result => {
      trackPerformance(routeName, Math.round(performance.now() - start))
      return result
    })
    .catch(error => {
      logError(error instanceof Error ? error : new Error(String(error)), {
        route: routeName,
      })
      throw error
    })
}
