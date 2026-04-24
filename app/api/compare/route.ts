import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

/**
 * Compare two websites side by side
 * POST /api/compare { url1: string, url2: string }
 */

interface SiteMetrics {
  url: string
  title: string
  description: string
  score: number
  loadTime: number
  htmlSize: number
  wordCount: number
  h1Count: number
  h2Count: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  hasSSL: boolean
  hasViewport: boolean
  hasStructuredData: boolean
  hasOpenGraph: boolean
  scripts: number
  stylesheets: number
  metaDescLength: number
  titleLength: number
}

async function analyzeSite(url: string): Promise<SiteMetrics> {
  const startTime = performance.now()

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const html = await response.text()
  const loadTime = Math.round(performance.now() - startTime)
  const $ = cheerio.load(html)

  const title = $('title').text().trim()
  const description = $('meta[name="description"]').attr('content') || ''
  const wordCount = $('body').text().split(/\s+/).filter(w => w.length > 1).length
  const imgs = $('img')

  // Score calculation
  let score = 50
  if (title.length >= 30 && title.length <= 60) score += 10
  if (description.length >= 120 && description.length <= 160) score += 10
  if ($('h1').length === 1) score += 5
  if (wordCount >= 300) score += 10
  if (url.startsWith('https')) score += 5
  if ($('meta[name="viewport"]').length) score += 5
  if ($('script[type="application/ld+json"]').length) score += 5
  score = Math.min(100, score)

  return {
    url,
    title,
    description,
    score,
    loadTime,
    htmlSize: new TextEncoder().encode(html).length,
    wordCount,
    h1Count: $('h1').length,
    h2Count: $('h2').length,
    imageCount: imgs.length,
    imagesWithoutAlt: imgs.filter((_, el) => !$(el).attr('alt')).length,
    internalLinks: $('a[href^="/"], a[href^="' + url + '"]').length,
    externalLinks: $('a[href^="http"]').filter((_, el) => !$(el).attr('href')?.includes(new URL(url).hostname)).length,
    hasSSL: url.startsWith('https'),
    hasViewport: $('meta[name="viewport"]').length > 0,
    hasStructuredData: $('script[type="application/ld+json"]').length > 0,
    hasOpenGraph: $('meta[property="og:title"]').length > 0,
    scripts: $('script[src]').length,
    stylesheets: $('link[rel="stylesheet"]').length,
    metaDescLength: description.length,
    titleLength: title.length,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url1, url2 } = await request.json()

    if (!url1 || !url2) {
      return NextResponse.json({ error: 'Deux URLs requises' }, { status: 400, headers: corsHeaders() })
    }

    const normalize = (u: string) => u.startsWith('http') ? u : `https://${u}`

    // Analyze both sites in parallel
    const [site1, site2] = await Promise.all([
      analyzeSite(normalize(url1)),
      analyzeSite(normalize(url2)),
    ])

    // Generate comparison insights
    const insights: string[] = []

    if (site1.score > site2.score + 10) insights.push(`${new URL(site1.url).hostname} a un score SEO nettement superieur (+${site1.score - site2.score} pts)`)
    else if (site2.score > site1.score + 10) insights.push(`${new URL(site2.url).hostname} a un score SEO nettement superieur (+${site2.score - site1.score} pts)`)

    if (site1.loadTime < site2.loadTime * 0.7) insights.push(`${new URL(site1.url).hostname} est significativement plus rapide`)
    else if (site2.loadTime < site1.loadTime * 0.7) insights.push(`${new URL(site2.url).hostname} est significativement plus rapide`)

    if (site1.wordCount > site2.wordCount * 1.5) insights.push(`${new URL(site1.url).hostname} a un contenu beaucoup plus riche (${site1.wordCount} vs ${site2.wordCount} mots)`)

    if (site1.hasStructuredData && !site2.hasStructuredData) insights.push(`${new URL(site1.url).hostname} a des données structurées, pas ${new URL(site2.url).hostname}`)
    else if (site2.hasStructuredData && !site1.hasStructuredData) insights.push(`${new URL(site2.url).hostname} a des données structurées, pas ${new URL(site1.url).hostname}`)

    return NextResponse.json({
      success: true,
      site1,
      site2,
      insights,
      winner: site1.score >= site2.score ? 'site1' : 'site2',
    }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: `Comparaison echouee: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
