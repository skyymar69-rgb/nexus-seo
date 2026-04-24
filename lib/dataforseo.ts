/**
 * DataForSEO API Integration
 * Fournit des donnees reelles de mots-cles et backlinks
 *
 * Setup: ajouter DATAFORSEO_LOGIN et DATAFORSEO_PASSWORD dans .env
 * Documentation: https://dataforseo.com/apis
 */

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || ''
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || ''
const BASE_URL = 'https://api.dataforseo.com/v3'

function isConfigured(): boolean {
  return !!(DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD)
}

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')
}

async function apiCall(endpoint: string, body: any[]): Promise<any> {
  if (!isConfigured()) return null

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status}`)
  }

  return response.json()
}

// ─── Keywords ─────────────────────────────────────────────────

export interface KeywordData {
  keyword: string
  volume: number
  cpc: number
  competition: number
  difficulty: number
  intent: string
  trend: number[]
}

export async function getKeywordVolumes(keywords: string[], language: string = 'fr', location: string = 'France'): Promise<KeywordData[]> {
  if (!isConfigured()) return []

  try {
    const data = await apiCall('/keywords_data/google_ads/search_volume/live', [{
      keywords,
      language_name: language === 'fr' ? 'French' : 'English',
      location_name: location,
    }])

    const results = data?.tasks?.[0]?.result || []
    return results.map((r: any) => ({
      keyword: r.keyword,
      volume: r.search_volume || 0,
      cpc: r.cpc || 0,
      competition: r.competition || 0,
      difficulty: Math.round((r.competition || 0) * 100),
      intent: detectIntent(r.keyword),
      trend: r.monthly_searches?.map((m: any) => m.search_volume) || [],
    }))
  } catch (error) {
    console.error('DataForSEO keyword volumes error:', error)
    return []
  }
}

export async function getKeywordSuggestions(seed: string, language: string = 'fr'): Promise<KeywordData[]> {
  if (!isConfigured()) return []

  try {
    const data = await apiCall('/keywords_data/google_ads/keywords_for_keywords/live', [{
      keywords: [seed],
      language_name: language === 'fr' ? 'French' : 'English',
      location_name: 'France',
      include_seed_keyword: true,
      limit: 50,
    }])

    const results = data?.tasks?.[0]?.result || []
    return results.map((r: any) => ({
      keyword: r.keyword,
      volume: r.search_volume || 0,
      cpc: r.cpc || 0,
      competition: r.competition || 0,
      difficulty: Math.round((r.competition || 0) * 100),
      intent: detectIntent(r.keyword),
      trend: r.monthly_searches?.map((m: any) => m.search_volume) || [],
    }))
  } catch (error) {
    console.error('DataForSEO keyword suggestions error:', error)
    return []
  }
}

// ─── Backlinks ────────────────────────────────────────────────

export interface BacklinkData {
  sourceUrl: string
  sourceDomain: string
  targetUrl: string
  anchorText: string
  domainAuthority: number
  pageAuthority: number
  linkType: 'dofollow' | 'nofollow'
  firstSeen: string
  lastSeen: string
}

export interface BacklinkSummary {
  totalBacklinks: number
  referringDomains: number
  domainRank: number
  dofollow: number
  nofollow: number
}

export async function getBacklinkSummary(domain: string): Promise<BacklinkSummary | null> {
  if (!isConfigured()) return null

  try {
    const data = await apiCall('/backlinks/summary/live', [{
      target: domain,
      limit: 1,
    }])

    const result = data?.tasks?.[0]?.result?.[0]
    if (!result) return null

    return {
      totalBacklinks: result.total_backlinks || 0,
      referringDomains: result.referring_domains || 0,
      domainRank: result.rank || 0,
      dofollow: result.dofollow || 0,
      nofollow: result.nofollow || 0,
    }
  } catch (error) {
    console.error('DataForSEO backlink summary error:', error)
    return null
  }
}

export async function getBacklinks(domain: string, limit: number = 100): Promise<BacklinkData[]> {
  if (!isConfigured()) return []

  try {
    const data = await apiCall('/backlinks/backlinks/live', [{
      target: domain,
      limit,
      order_by: ['rank,desc'],
      filters: ['dofollow', '=', true],
    }])

    const results = data?.tasks?.[0]?.result || []
    return results.map((r: any) => ({
      sourceUrl: r.url_from || '',
      sourceDomain: r.domain_from || '',
      targetUrl: r.url_to || '',
      anchorText: r.anchor || '',
      domainAuthority: r.domain_from_rank || 0,
      pageAuthority: r.page_from_rank || 0,
      linkType: r.dofollow ? 'dofollow' : 'nofollow',
      firstSeen: r.first_seen || '',
      lastSeen: r.last_seen || '',
    }))
  } catch (error) {
    console.error('DataForSEO backlinks error:', error)
    return []
  }
}

// ─── SERP ─────────────────────────────────────────────────────

export async function getSERPResults(keyword: string, language: string = 'fr'): Promise<any[]> {
  if (!isConfigured()) return []

  try {
    const data = await apiCall('/serp/google/organic/live/regular', [{
      keyword,
      language_code: language,
      location_name: 'France',
      depth: 20,
    }])

    const items = data?.tasks?.[0]?.result?.[0]?.items || []
    return items
      .filter((i: any) => i.type === 'organic')
      .map((i: any) => ({
        position: i.rank_absolute,
        url: i.url,
        domain: i.domain,
        title: i.title,
        description: i.description,
      }))
  } catch (error) {
    console.error('DataForSEO SERP error:', error)
    return []
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function detectIntent(keyword: string): string {
  const kw = keyword.toLowerCase()
  if (/acheter|prix|tarif|pas cher|promo|livraison|commander/.test(kw)) return 'transactional'
  if (/comment|pourquoi|quand|qu.est|tutoriel|guide|definition/.test(kw)) return 'informational'
  if (/meilleur|comparatif|vs|avis|top|classement/.test(kw)) return 'commercial'
  return 'navigational'
}

export { isConfigured as isDataForSEOConfigured }
