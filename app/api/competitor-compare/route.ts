import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

export const maxDuration = 45

interface SiteMetrics {
  url: string
  domain: string
  title: string
  description: string
  loadTime: number
  htmlSize: number
  wordCount: number
  h1Count: number
  h2Count: number
  h3Count: number
  imageCount: number
  imagesWithAlt: number
  internalLinks: number
  externalLinks: number
  structuredDataCount: number
  hasOpenGraph: boolean
  hasTwitterCard: boolean
  hasCanonical: boolean
  hasViewport: boolean
  hasFavicon: boolean
  httpsScore: number
  techScore: number
  contentScore: number
  seoScore: number
}

async function analyzeSite(url: string): Promise<SiteMetrics | null> {
  try {
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    const start = Date.now()

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()
    const loadTime = Date.now() - start
    const $ = cheerio.load(html)

    const domain = new URL(normalizedUrl).hostname
    const title = $('title').text().trim()
    const description = $('meta[name="description"]').attr('content') || ''

    // Headings
    const h1Count = $('h1').length
    const h2Count = $('h2').length
    const h3Count = $('h3').length

    // Word count
    const bodyText = $('body').clone().find('script, style, noscript').remove().end().text()
    const wordCount = bodyText.trim().split(/\s+/).filter(w => w.length > 2).length

    // Images
    const images = $('img')
    let imageCount = images.length, imagesWithAlt = 0
    images.each((_, el) => { if ($(el).attr('alt')?.trim()) imagesWithAlt++ })

    // Links
    let internalLinks = 0, externalLinks = 0
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
      try {
        const linkHost = new URL(href, normalizedUrl).hostname
        if (linkHost === domain) internalLinks++; else externalLinks++
      } catch { internalLinks++ }
    })

    // Technical checks
    const structuredDataCount = $('script[type="application/ld+json"]').length
    const hasOpenGraph = !!$('meta[property="og:title"]').attr('content')
    const hasTwitterCard = !!$('meta[name="twitter:card"]').attr('content')
    const hasCanonical = !!$('link[rel="canonical"]').attr('href')
    const hasViewport = !!$('meta[name="viewport"]').attr('content')
    const hasFavicon = $('link[rel*="icon"]').length > 0
    const httpsScore = normalizedUrl.startsWith('https://') ? 100 : 0

    // Scores
    const techScore = Math.min(100, (hasCanonical ? 20 : 0) + (hasViewport ? 15 : 0) + (hasFavicon ? 10 : 0) + (httpsScore ? 20 : 0) + (structuredDataCount > 0 ? 20 : 0) + (loadTime < 2000 ? 15 : loadTime < 4000 ? 8 : 0))
    const contentScore = Math.min(100, (wordCount >= 1000 ? 30 : Math.round(wordCount / 33)) + (h1Count === 1 ? 20 : 0) + (h2Count >= 2 ? 20 : h2Count * 10) + (imageCount > 0 ? 15 : 0) + (imagesWithAlt === imageCount && imageCount > 0 ? 15 : 0))
    const seoScore = Math.min(100, (title ? (title.length >= 30 && title.length <= 60 ? 25 : 15) : 0) + (description ? (description.length >= 120 ? 25 : 15) : 0) + (hasOpenGraph ? 15 : 0) + (hasTwitterCard ? 10 : 0) + (internalLinks >= 3 ? 15 : internalLinks * 5) + (structuredDataCount > 0 ? 10 : 0))

    return {
      url: normalizedUrl, domain, title, description, loadTime, htmlSize: html.length,
      wordCount, h1Count, h2Count, h3Count, imageCount, imagesWithAlt,
      internalLinks, externalLinks, structuredDataCount,
      hasOpenGraph, hasTwitterCard, hasCanonical, hasViewport, hasFavicon,
      httpsScore, techScore, contentScore, seoScore,
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json()

    if (!urls || !Array.isArray(urls) || urls.length < 2 || urls.length > 5) {
      return NextResponse.json(
        { error: 'Fournissez 2 a 5 URLs a comparer' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Analyze all sites in parallel
    const results = await Promise.allSettled(
      urls.map((url: string) => analyzeSite(url))
    )

    const sites: SiteMetrics[] = results
      .filter((r): r is PromiseFulfilledResult<SiteMetrics | null> => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value!)

    if (sites.length < 2) {
      return NextResponse.json(
        { error: 'Impossible d\'analyser au moins 2 sites. Verifiez les URLs.' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Calculate rankings
    const metrics = ['techScore', 'contentScore', 'seoScore', 'wordCount', 'loadTime', 'structuredDataCount'] as const
    const rankings: Record<string, Record<string, number>> = {}

    metrics.forEach(metric => {
      const sorted = [...sites].sort((a, b) => {
        if (metric === 'loadTime') return a[metric] - b[metric] // lower is better
        return b[metric] - a[metric] // higher is better
      })
      sorted.forEach((site, index) => {
        if (!rankings[site.domain]) rankings[site.domain] = {}
        rankings[site.domain][metric] = index + 1
      })
    })

    // Determine winner
    const overallScores = sites.map(s => ({
      domain: s.domain,
      overall: Math.round((s.techScore + s.contentScore + s.seoScore) / 3),
    })).sort((a, b) => b.overall - a.overall)

    return NextResponse.json({
      success: true,
      data: {
        sites,
        rankings,
        winner: overallScores[0],
        overallScores,
      },
    }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la comparaison' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
