/**
 * Google Search Console API Integration
 * Fournit les vraies donnees d'impressions, clics, CTR, positions
 *
 * Setup: ajouter GOOGLE_SEARCH_CONSOLE_KEY (Service Account JSON) dans .env
 * Ou utiliser OAuth pour acces utilisateur
 * Documentation: https://developers.google.com/webmaster-tools/v1/api_reference_index
 */

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3'

export interface SearchAnalyticsRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface SearchConsoleData {
  rows: SearchAnalyticsRow[]
  totals: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
}

export interface TopQuery {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface TopPage {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/**
 * Fetch search analytics from Google Search Console
 * Requires OAuth2 access token for the user's Google account
 */
export async function fetchSearchAnalytics(
  siteUrl: string,
  accessToken: string,
  options: {
    startDate: string // YYYY-MM-DD
    endDate: string
    dimensions?: ('query' | 'page' | 'date' | 'country' | 'device')[]
    rowLimit?: number
    startRow?: number
  }
): Promise<SearchConsoleData | null> {
  try {
    const encodedSiteUrl = encodeURIComponent(siteUrl)
    const response = await fetch(
      `${GSC_API_BASE}/sites/${encodedSiteUrl}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: options.dimensions || ['query'],
          rowLimit: options.rowLimit || 100,
          startRow: options.startRow || 0,
        }),
        signal: AbortSignal.timeout(15000),
      }
    )

    if (!response.ok) {
      console.error(`GSC API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    const rows: SearchAnalyticsRow[] = (data.rows || []).map((row: any) => ({
      keys: row.keys || [],
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }))

    const totals = rows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
        ctr: 0,
        position: 0,
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    )

    totals.ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0
    totals.position = rows.length > 0
      ? rows.reduce((sum, r) => sum + r.position, 0) / rows.length
      : 0

    return { rows, totals }
  } catch (error) {
    console.error('Google Search Console API error:', error)
    return null
  }
}

/**
 * Get top queries for a site
 */
export async function getTopQueries(
  siteUrl: string,
  accessToken: string,
  days: number = 28
): Promise<TopQuery[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const data = await fetchSearchAnalytics(siteUrl, accessToken, {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dimensions: ['query'],
    rowLimit: 50,
  })

  if (!data) return []

  return data.rows
    .map(row => ({
      query: row.keys[0] || '',
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    }))
    .sort((a, b) => b.clicks - a.clicks)
}

/**
 * Get top pages for a site
 */
export async function getTopPages(
  siteUrl: string,
  accessToken: string,
  days: number = 28
): Promise<TopPage[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const data = await fetchSearchAnalytics(siteUrl, accessToken, {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dimensions: ['page'],
    rowLimit: 50,
  })

  if (!data) return []

  return data.rows
    .map(row => ({
      page: row.keys[0] || '',
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    }))
    .sort((a, b) => b.clicks - a.clicks)
}

/**
 * Get daily performance trend
 */
export async function getDailyTrend(
  siteUrl: string,
  accessToken: string,
  days: number = 28
): Promise<Array<{ date: string; clicks: number; impressions: number; ctr: number; position: number }>> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const data = await fetchSearchAnalytics(siteUrl, accessToken, {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    dimensions: ['date'],
    rowLimit: days,
  })

  if (!data) return []

  return data.rows
    .map(row => ({
      date: row.keys[0] || '',
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: Math.round(row.ctr * 10000) / 100,
      position: Math.round(row.position * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
