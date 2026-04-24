/**
 * Slack Webhook Integration for Real-time Alerts
 *
 * Setup: ajouter SLACK_WEBHOOK_URL dans .env
 * Creer un webhook: https://api.slack.com/messaging/webhooks
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || ''

export function isSlackConfigured(): boolean {
  return !!SLACK_WEBHOOK_URL
}

async function sendSlackMessage(blocks: any[]): Promise<boolean> {
  if (!isSlackConfigured()) return false

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function slackAlertScoreDrop(domain: string, oldScore: number, newScore: number): Promise<boolean> {
  return sendSlackMessage([
    { type: 'header', text: { type: 'plain_text', text: `Alerte SEO: ${domain}`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `Le score SEO de *${domain}* a chute de *${oldScore}* a *${newScore}* (-${oldScore - newScore} pts)` } },
    { type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Voir le dashboard' }, url: `https://nexus.kayzen-lyon.fr/dashboard` }] },
  ])
}

export async function slackAlertNewMention(domain: string, llm: string, prompt: string, sentiment: string): Promise<boolean> {
  const emoji = sentiment === 'positive' ? ':white_check_mark:' : sentiment === 'negative' ? ':warning:' : ':speech_balloon:'
  return sendSlackMessage([
    { type: 'header', text: { type: 'plain_text', text: `${emoji} Mention IA detectee`, emoji: true } },
    { type: 'section', fields: [
      { type: 'mrkdwn', text: `*Domaine:*\n${domain}` },
      { type: 'mrkdwn', text: `*LLM:*\n${llm}` },
      { type: 'mrkdwn', text: `*Sentiment:*\n${sentiment}` },
      { type: 'mrkdwn', text: `*Prompt:*\n${prompt.slice(0, 100)}` },
    ]},
  ])
}

export async function slackAlertKeywordChange(domain: string, keyword: string, oldPos: number, newPos: number): Promise<boolean> {
  const improved = newPos < oldPos
  const emoji = improved ? ':chart_with_upwards_trend:' : ':chart_with_downwards_trend:'
  return sendSlackMessage([
    { type: 'header', text: { type: 'plain_text', text: `${emoji} Position: "${keyword}"`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${domain}*: position #${oldPos} -> #${newPos} (${improved ? '+' : ''}${oldPos - newPos} places)` } },
  ])
}
