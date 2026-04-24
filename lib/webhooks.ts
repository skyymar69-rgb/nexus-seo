/**
 * Webhook System — Notifications vers services tiers
 * Compatible Zapier, Make, n8n, custom endpoints
 *
 * Les users configurent un webhook URL dans /dashboard/settings
 * Nexus envoie des events: audit.completed, keyword.changed, backlink.new, etc.
 */

export type WebhookEvent =
  | 'audit.completed'
  | 'score.changed'
  | 'keyword.position.changed'
  | 'backlink.new'
  | 'backlink.lost'
  | 'ai.mention.detected'
  | 'report.generated'

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, any>
  source: 'nexus-seo'
  version: '1.0'
}

/**
 * Send webhook to a URL
 */
export async function sendWebhook(
  webhookUrl: string,
  event: WebhookEvent,
  data: Record<string, any>
): Promise<boolean> {
  if (!webhookUrl) return false

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    source: 'nexus-seo',
    version: '1.0',
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NexusSEO-Webhook/1.0',
        'X-Nexus-Event': event,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Send webhook to all configured URLs for a user
 */
export async function broadcastWebhook(
  userId: string,
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  // In production, fetch webhook URLs from user settings in DB
  // For now, check environment variable
  const globalWebhook = process.env.WEBHOOK_URL
  if (globalWebhook) {
    await sendWebhook(globalWebhook, event, { ...data, userId })
  }
}
