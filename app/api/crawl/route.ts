import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'

interface PageMetrics {
  title: string
  description: string
  h1Count: number
  h2Count: number
  internalLinks: number
  externalLinks: number
  imageCount: number
  imagesWithoutAlt: number
  issues: string[]
}

interface CrawledPageResult {
  url: string
  statusCode: number
  contentType: string
  contentLength: number
  responseTime: number
  title: string
  description: string
  h1Count: number
  h2Count: number
  internalLinks: number
  externalLinks: number
  imageCount: number
  imagesWithoutAlt: number
  issues: string[]
}

interface CrawlStats {
  totalPages: number
  statusCodes: { [key: string]: number }
  totalInternalLinks: number
  totalExternalLinks: number
  totalImages: number
  totalImagesWithoutAlt: number
  avgResponseTime: number
}

interface CrawlResponse {
  crawlId?: string
  url: string
  stats: CrawlStats
  pages: CrawledPageResult[]
}

const TIMEOUT = 10000 // 10 seconds per page
const DEFAULT_MAX_PAGES = 10
const MAX_PAGES_LIMIT = 50

import { withCors, corsOptionsResponse } from '@/lib/cors'

// GET: Retrieve latest crawl results for a website
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400 })
    }

    // Find the latest completed crawl session
    const crawlSession = await prisma.crawlSession.findFirst({
      where: { websiteId, status: 'completed' },
      orderBy: { startedAt: 'desc' },
      include: {
        pages: {
          orderBy: { internalLinks: 'desc' },
          take: 100,
        },
      },
    })

    if (!crawlSession || crawlSession.pages.length === 0) {
      return NextResponse.json({ pages: [], message: 'Aucun crawl disponible. Lancez un crawl depuis la page Crawleur Web.' }, { status: 200 })
    }

    const pages = crawlSession.pages.map(p => ({
      url: p.url,
      statusCode: p.statusCode,
      responseTime: p.responseTime,
      title: p.title || '',
      h1Count: p.h1Count,
      internalLinks: p.internalLinks,
      externalLinks: p.externalLinks,
      wordCount: 0,
      issues: p.issues ? (Array.isArray(p.issues) ? p.issues : []) : [],
    }))

    return NextResponse.json({
      pages,
      crawlDate: crawlSession.startedAt,
      totalPages: crawlSession.pagesFound,
    })
  } catch (error) {
    console.error('Crawl GET error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 })
  }
}

// Handle preflight
export async function OPTIONS() {
  return corsOptionsResponse()
}

// Extract domain from URL
function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

// Normalize URL (remove hash, trailing slash for comparison)
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    let normalized = parsed.href
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1)
    }
    return normalized
  } catch {
    return url
  }
}

// Check if link is internal
function isInternalLink(linkUrl: string, baseDomain: string): boolean {
  try {
    const linkDomain = new URL(linkUrl).hostname
    return linkDomain === baseDomain
  } catch {
    return false
  }
}

// Fetch URL with timeout
async function fetchUrl(
  url: string,
): Promise<{ content: string; statusCode: number; contentType: string; contentLength: number; responseTime: number }> {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Nexus-Crawler/1.0 (+http://nexus-crawler.local/bot)',
      },
    })

    clearTimeout(timeoutId)

    const content = await response.text()
    const responseTime = Date.now() - startTime
    const contentType = response.headers.get('content-type') || 'unknown'
    const contentLength = Buffer.byteLength(content, 'utf8')

    return {
      content,
      statusCode: response.status,
      contentType,
      contentLength,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout after ${TIMEOUT}ms`)
    }
    throw error
  }
}

// Parse HTML with cheerio
function parseHtml(html: string, baseUrl: string): PageMetrics {
  const $ = cheerio.load(html)
  const baseDomain = getDomain(baseUrl)
  const issues: string[] = []

  // Extract title
  const title = $('title').text().trim() || ''
  if (!title) {
    issues.push('Missing page title')
  }

  // Extract meta description
  const description = $('meta[name="description"]').attr('content') || ''
  if (!description) {
    issues.push('Missing meta description')
  }

  // Count H1 and H2
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  if (h1Count === 0) {
    issues.push('No H1 tag found')
  }

  // Extract and categorize links
  let internalLinks = 0
  let externalLinks = 0
  const linkSet = new Set<string>()

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href') || ''
    if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
      try {
        const resolvedUrl = new URL(href, baseUrl).href
        if (!linkSet.has(resolvedUrl)) {
          linkSet.add(resolvedUrl)
          if (isInternalLink(resolvedUrl, baseDomain)) {
            internalLinks++
          } else {
            externalLinks++
          }
        }
      } catch {
        // Invalid URL, skip
      }
    }
  })

  // Extract images
  let imageCount = 0
  let imagesWithoutAlt = 0

  $('img').each((_, elem) => {
    imageCount++
    const alt = $(elem).attr('alt')
    if (!alt || alt.trim() === '') {
      imagesWithoutAlt++
    }
  })

  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} images missing alt text`)
  }

  return {
    title,
    description,
    h1Count,
    h2Count,
    internalLinks,
    externalLinks,
    imageCount,
    imagesWithoutAlt,
    issues,
  }
}

// Resolve relative URLs
function resolveUrl(baseUrl: string, relativeUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).href
  } catch {
    return ''
  }
}

// BFS crawler
async function bfsCrawl(
  startUrl: string,
  maxPages: number,
): Promise<{ pages: CrawledPageResult[]; responseTimes: number[] }> {
  const pages: CrawledPageResult[] = []
  const responseTimes: number[] = []
  const visitedUrls = new Set<string>()
  const queue: string[] = [startUrl]
  const baseDomain = getDomain(startUrl)

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    const normalizedUrl = normalizeUrl(url)

    if (visitedUrls.has(normalizedUrl)) continue
    visitedUrls.add(normalizedUrl)

    try {
      const { content, statusCode, contentType, contentLength, responseTime } = await fetchUrl(url)
      responseTimes.push(responseTime)

      const metrics = parseHtml(content, url)

      pages.push({
        url,
        statusCode,
        contentType,
        contentLength,
        responseTime,
        title: metrics.title,
        description: metrics.description,
        h1Count: metrics.h1Count,
        h2Count: metrics.h2Count,
        internalLinks: metrics.internalLinks,
        externalLinks: metrics.externalLinks,
        imageCount: metrics.imageCount,
        imagesWithoutAlt: metrics.imagesWithoutAlt,
        issues: metrics.issues,
      })

      // Extract internal links for BFS
      if (pages.length < maxPages) {
        const $ = cheerio.load(content)
        $('a[href]').each((_, elem) => {
          const href = $(elem).attr('href') || ''
          if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            try {
              const resolvedUrl = new URL(href, url).href
              const normalizedResolved = normalizeUrl(resolvedUrl)
              if (isInternalLink(resolvedUrl, baseDomain) && !visitedUrls.has(normalizedResolved)) {
                queue.push(resolvedUrl)
              }
            } catch {
              // Invalid URL, skip
            }
          }
        })
      }
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('Timeout') ? 504 : 0
      pages.push({
        url,
        statusCode,
        contentType: 'unknown',
        contentLength: 0,
        responseTime: TIMEOUT,
        title: '',
        description: '',
        h1Count: 0,
        h2Count: 0,
        internalLinks: 0,
        externalLinks: 0,
        imageCount: 0,
        imagesWithoutAlt: 0,
        issues: [error instanceof Error ? error.message : 'Failed to crawl URL'],
      })
    }
  }

  return { pages, responseTimes }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, maxPages = DEFAULT_MAX_PAGES, websiteId } = body

    if (!url || typeof url !== 'string') {
      const response = NextResponse.json({ error: 'Invalid or missing URL' }, { status: 400 })
      return withCors(response)
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      const response = NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      return withCors(response)
    }

    // Validate maxPages
    let validatedMaxPages = Math.min(Math.max(maxPages, 1), MAX_PAGES_LIMIT)

    let crawlId: string | undefined
    if (websiteId) {
      try {
        // Create crawl session in database
        const crawlSession = await prisma.crawlSession.create({
          data: {
            websiteId,
            status: 'running',
            config: JSON.stringify({ startUrl: url, maxPages: validatedMaxPages }),
          },
        })
        crawlId = crawlSession.id
      } catch (error) {
        console.error('Failed to create crawl session:', error)
        // Continue without database persistence if it fails
      }
    }

    try {
      // Perform BFS crawl
      const { pages, responseTimes } = await bfsCrawl(url, validatedMaxPages)

      // Build statistics
      const statusCodeMap: { [key: string]: number } = {}
      let totalInternalLinks = 0
      let totalExternalLinks = 0
      let totalImages = 0
      let totalImagesWithoutAlt = 0

      pages.forEach((page) => {
        const statusCategory = `${Math.floor(page.statusCode / 100)}xx`
        statusCodeMap[statusCategory] = (statusCodeMap[statusCategory] || 0) + 1
        totalInternalLinks += page.internalLinks
        totalExternalLinks += page.externalLinks
        totalImages += page.imageCount
        totalImagesWithoutAlt += page.imagesWithoutAlt
      })

      const avgResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0

      const stats: CrawlStats = {
        totalPages: pages.length,
        statusCodes: statusCodeMap,
        totalInternalLinks,
        totalExternalLinks,
        totalImages,
        totalImagesWithoutAlt,
        avgResponseTime,
      }

      // Save to database if websiteId provided
      if (crawlId) {
        try {
          // Save crawled pages
          for (const page of pages) {
            await prisma.crawledPage.create({
              data: {
                crawlSessionId: crawlId,
                url: page.url,
                statusCode: page.statusCode,
                contentType: page.contentType,
                contentLength: page.contentLength,
                responseTime: page.responseTime,
                title: page.title,
                metaDescription: page.description,
                h1Count: page.h1Count,
                h2Count: page.h2Count,
                internalLinks: page.internalLinks,
                externalLinks: page.externalLinks,
                images: page.imageCount,
                imagesNoAlt: page.imagesWithoutAlt,
                issues: JSON.stringify(page.issues),
              },
            })
          }

          // Update crawl session status
          await prisma.crawlSession.update({
            where: { id: crawlId },
            data: {
              status: 'completed',
              pagesFound: pages.length,
              pagesCrawled: pages.length,
              completedAt: new Date(),
            },
          })
        } catch (error) {
          console.error('Failed to save crawl results to database:', error)
          // Continue and return results even if database save fails
        }
      }

      const response = NextResponse.json({
        ...(crawlId && { crawlId }),
        url,
        stats,
        pages,
      } as CrawlResponse)

      return withCors(response)
    } catch (error) {
      // Update crawl session to failed if it exists
      if (crawlId) {
        try {
          await prisma.crawlSession.update({
            where: { id: crawlId },
            data: {
              status: 'failed',
            },
          })
        } catch {
          // Ignore database errors during failure handling
        }
      }

      const response = NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 },
      )
      return withCors(response)
    }
  } catch (error) {
    const response = NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
    return withCors(response)
  }
}
