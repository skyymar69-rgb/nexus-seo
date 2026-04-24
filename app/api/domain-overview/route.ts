import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing URL provided' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    let urlObj: URL
    try {
      urlObj = new URL(normalizedUrl)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Fetch URL with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)
    const fetchStartTime = Date.now()

    let response: Response
    try {
      response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `HTTP ${response.status} error loading URL` },
        { status: 400, headers: corsHeaders() }
      )
    }

    const html = await response.text()
    const loadTime = Date.now() - fetchStartTime

    // Parse HTML with cheerio
    const $ = cheerio.load(html)

    // Extract title
    const title = $('title').text().trim() || null

    // Extract meta description
    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      null

    // Extract H1
    const h1 = $('h1').first().text().trim() || null

    // Word count
    const bodyText = $('body').clone().find('script, style').remove().end().text()
    const words = bodyText.trim().split(/\s+/).filter((w) => w.length > 0)
    const wordCount = words.length

    // Image count
    const imageCount = $('img').length

    // Links
    const baseHost = urlObj.hostname
    let internalLinks = 0
    let externalLinks = 0
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
      try {
        const linkUrl = new URL(href, normalizedUrl)
        if (linkUrl.hostname === baseHost) {
          internalLinks++
        } else {
          externalLinks++
        }
      } catch {
        internalLinks++
      }
    })

    // Structured data count
    const structuredDataCount = $('script[type="application/ld+json"]').length

    // HTTPS status
    const isHttps = normalizedUrl.startsWith('https://')

    // Viewport
    const viewport = $('meta[name="viewport"]').attr('content') || null

    // Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || null
    const ogDescription = $('meta[property="og:description"]').attr('content') || null
    const ogImage = $('meta[property="og:image"]').attr('content') || null
    const ogType = $('meta[property="og:type"]').attr('content') || null
    const ogUrl = $('meta[property="og:url"]').attr('content') || null

    // Calculate a simple score
    let score = 0
    let checks = 0
    const addCheck = (condition: boolean, weight: number = 1) => {
      checks += weight
      if (condition) score += weight
    }

    addCheck(!!title && title.length >= 10 && title.length <= 60, 2)
    addCheck(!!description && description.length >= 50 && description.length <= 160, 2)
    addCheck(!!h1, 2)
    addCheck(wordCount >= 300, 1)
    addCheck(imageCount > 0, 1)
    addCheck(internalLinks >= 3, 1)
    addCheck(structuredDataCount > 0, 1)
    addCheck(isHttps, 2)
    addCheck(!!viewport, 1)
    addCheck(!!ogTitle && !!ogImage, 1)

    const finalScore = Math.round((score / checks) * 100)

    return NextResponse.json(
      {
        success: true,
        data: {
          url: normalizedUrl,
          title,
          description,
          score: finalScore,
          loadTime,
          pageCount: 1,
          technologies: [],
          structuredData: structuredDataCount,
          https: isHttps,
          meta: {
            title,
            description,
            viewport,
            ogTitle,
            ogDescription,
            ogImage,
            ogType,
            ogUrl,
          },
          content: {
            h1,
            wordCount,
            imageCount,
            internalLinks,
            externalLinks,
          },
        },
      },
      { headers: corsHeaders() }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage.includes('AbortError')
          ? 'Request timeout exceeded 15 seconds.'
          : `Domain overview error: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse()
}
