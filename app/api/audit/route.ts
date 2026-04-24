import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'
import {
  type DetailedCheck,
  checkTitleTag,
  checkMetaDescription,
  checkCanonical,
  checkH1,
  checkImages,
  checkHTTPS,
  checkLoadTime,
  checkStructuredData,
  checkOpenGraph,
  checkViewport,
  checkWordCount,
  checkHeadingHierarchy,
  checkSecurityHeaders,
} from '@/lib/audit-checks'

interface AuditCheck {
  id: string
  category: 'meta' | 'content' | 'technical' | 'performance' | 'security' | 'mobile'
  name: string
  status: 'passed' | 'warning' | 'error'
  score: number
  value: string
  recommendation: string
}

interface AuditResult {
  success: boolean
  data?: {
    url: string
    score: number
    loadTime: number
    htmlSize: number
    checks: AuditCheck[]
    detailedChecks: DetailedCheck[]
    summary: {
      passed: number
      warnings: number
      errors: number
      totalChecks: number
    }
    meta: {
      title: string | null
      description: string | null
      canonical: string | null
      ogTitle: string | null
      ogDescription: string | null
      ogImage: string | null
    }
    content: {
      wordCount: number
      h1Count: number
      h2Count: number
      h3Count: number
      imageCount: number
      imagesWithAlt: number
      internalLinks: number
      externalLinks: number
    }
  }
  error?: string
}

// Cheerio-based HTML parsing helpers
function parseHTML($: cheerio.CheerioAPI) {
  return {
    getMetaTag: (name: string): string | null => {
      // Try property attribute first (Open Graph)
      let value = $(`meta[property="${name}"]`).attr('content')
      if (value) return value

      // Try name attribute
      value = $(`meta[name="${name}"]`).attr('content')
      return value || null
    },

    getTitle: (): string | null => {
      return $('title').text() || null
    },

    getCanonical: (): string | null => {
      return $('link[rel="canonical"]').attr('href') || null
    },

    getH1Count: (): number => {
      return $('h1').length
    },

    getH2Count: (): number => {
      return $('h2').length
    },

    getH3Count: (): number => {
      return $('h3').length
    },

    getHeadingHierarchy: (): { h1: string[]; h2: string[]; h3: string[] } => {
      return {
        h1: $('h1')
          .map((_, el) => $(el).text())
          .get(),
        h2: $('h2')
          .map((_, el) => $(el).text())
          .get(),
        h3: $('h3')
          .map((_, el) => $(el).text())
          .get(),
      }
    },

    getWordCount: (): number => {
      // Remove script and style tags
      const text = $('body')
        .clone()
        .find('script, style')
        .remove()
        .end()
        .text()

      // Count words
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
      return words.length
    },

    getImages: (): { total: number; withAlt: number; withoutWidthHeight: number } => {
      const images = $('img')
      let total = images.length
      let withAlt = 0
      let withoutWidthHeight = 0

      images.each((_, el) => {
        const $img = $(el)
        if ($img.attr('alt')) {
          withAlt++
        }
        if (!$img.attr('width') || !$img.attr('height')) {
          withoutWidthHeight++
        }
      })

      return { total, withAlt, withoutWidthHeight }
    },

    getLinks: (baseUrl: string): { internal: number; external: number } => {
      const links = $('a[href]')
      const baseHost = new URL(baseUrl).hostname
      let internal = 0
      let external = 0

      links.each((_, el) => {
        const href = $(el).attr('href')
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
          return
        }

        try {
          const linkUrl = new URL(href, baseUrl)
          if (linkUrl.hostname === baseHost) {
            internal++
          } else {
            external++
          }
        } catch {
          // Relative link
          if (!href.startsWith('http')) {
            internal++
          } else {
            external++
          }
        }
      })

      return { internal, external }
    },

    getFaviconPresent: (): boolean => {
      return $('link[rel*="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0
    },

    getHreflangTags: (): number => {
      return $('link[rel="alternate"][hreflang]').length
    },

    getStructuredData: (): number => {
      return $('script[type="application/ld+json"]').length
    },

    getExternalScripts: (): number => {
      return $('script[src]').length
    },

    getExternalStylesheets: (): number => {
      return $('link[rel="stylesheet"]').length
    },

    getInlineScripts: (): number => {
      return $('script:not([src])').length
    },

    getInlineStyles: (): number => {
      return $('style').length + $('[style]').length
    },

    getViewportTag: (): string | null => {
      return $('meta[name="viewport"]').attr('content') || null
    },

    getCharset: (): string | null => {
      return $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || null
    },

    getDoctype: (html: string): boolean => {
      return /<!DOCTYPE\s+html/i.test(html)
    },

    getTouchIcons: (): number => {
      return $('link[rel*="apple-touch-icon"]').length
    },

    getLazyLoadImages: (): number => {
      return $('img[loading="lazy"]').length
    },
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AuditResult>> {
  try {
    const body = await request.json()
    const { url, websiteId } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or missing URL provided',
        },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Check cache — return cached result if same URL audited within 1 hour
    let _cacheKey: string | undefined = undefined
    try {
      const { cacheGet, cacheSet, cacheKey } = await import('@/lib/cache')
      _cacheKey = cacheKey('audit', url.trim().toLowerCase())
      const cached = await cacheGet(_cacheKey)
      if (cached) {
        return NextResponse.json(cached, { headers: corsHeaders() })
      }
    } catch { _cacheKey = undefined }

    // Validate and normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    let urlObj: URL
    try {
      urlObj = new URL(normalizedUrl)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format',
        },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Fetch the URL with 15-second timeout
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
        {
          success: false,
          error: `HTTP ${response.status} error loading URL`,
        },
        { status: 400, headers: corsHeaders() }
      )
    }

    const html = await response.text()
    const loadTime = Date.now() - fetchStartTime
    const htmlSize = html.length

    // Parse HTML with cheerio
    const $ = cheerio.load(html)
    const parser = parseHTML($)

    // Extract metadata
    const title = parser.getTitle()
    const description = parser.getMetaTag('description')
    const canonical = parser.getCanonical()
    const ogTitle = parser.getMetaTag('og:title')
    const ogDescription = parser.getMetaTag('og:description')
    const ogImage = parser.getMetaTag('og:image')
    const robots = parser.getMetaTag('robots')
    const viewport = parser.getViewportTag()
    const twitterCard = parser.getMetaTag('twitter:card')
    const twitterTitle = parser.getMetaTag('twitter:title')
    const twitterDescription = parser.getMetaTag('twitter:description')
    const charset = parser.getCharset()

    // Count headings
    const h1Count = parser.getH1Count()
    const h2Count = parser.getH2Count()
    const h3Count = parser.getH3Count()

    // Count images and alt text
    const imageData = parser.getImages()

    // Count links
    const linkData = parser.getLinks(normalizedUrl)

    // Count word count
    const wordCount = parser.getWordCount()

    // Count scripts and styles
    const externalScripts = parser.getExternalScripts()
    const inlineScripts = parser.getInlineScripts()
    const externalStylesheets = parser.getExternalStylesheets()
    const inlineStyles = parser.getInlineStyles()

    // Other checks
    const faviconPresent = parser.getFaviconPresent()
    const hreflangCount = parser.getHreflangTags()
    const structuredDataCount = parser.getStructuredData()
    const doctype = parser.getDoctype(html)
    const touchIcons = parser.getTouchIcons()
    const lazyLoadImages = parser.getLazyLoadImages()

    // Extract response headers
    const contentType = response.headers.get('content-type')
    const contentEncoding = response.headers.get('content-encoding')
    const csp = response.headers.get('content-security-policy')
    const xFrameOptions = response.headers.get('x-frame-options')
    const xContentTypeOptions = response.headers.get('x-content-type-options')
    const contentLength = response.headers.get('content-length')

    // Extract H1 text for detailed check
    const h1Text = $('h1').first().text().trim() || null

    // ============================================
    // Build detailed checks using audit-checks engine
    // ============================================
    const detailedChecks: DetailedCheck[] = [
      checkTitleTag(title, normalizedUrl),
      checkMetaDescription(description),
      checkCanonical(canonical, normalizedUrl),
      checkH1(h1Count, h1Text),
      checkImages(imageData.total, imageData.withAlt, imageData.total - imageData.withAlt),
      checkHTTPS(normalizedUrl),
      checkLoadTime(loadTime, htmlSize),
      checkStructuredData(structuredDataCount),
      checkOpenGraph(ogTitle, ogDescription, ogImage),
      checkViewport(viewport),
      checkWordCount(wordCount),
      checkHeadingHierarchy(h1Count, h2Count, h3Count),
      checkSecurityHeaders(csp, xFrameOptions, xContentTypeOptions),
    ]

    // Calculate overall score from detailed checks
    const overallScore = Math.round(
      detailedChecks.reduce((sum, dc) => sum + dc.score, 0) / detailedChecks.length
    )

    // Build backwards-compatible checks array from detailed checks
    const checks: AuditCheck[] = detailedChecks.map((dc) => ({
      id: dc.id,
      category: dc.category,
      name: dc.name,
      status: dc.status,
      score: dc.score,
      value: dc.value,
      recommendation: dc.summary,
    }))

    // Additional legacy checks not covered by detailed check functions
    const twitterScore = twitterCard && twitterTitle && twitterDescription ? 100 : twitterCard ? 50 : 0
    checks.push({
      id: 'meta_twitter',
      category: 'meta',
      name: 'Twitter Card Tags',
      status: twitterScore === 100 ? 'passed' : twitterScore > 0 ? 'warning' : 'error',
      score: twitterScore,
      value: `twitter:card ${twitterCard ? '\u2713' : '\u2717'}, twitter:title ${twitterTitle ? '\u2713' : '\u2717'}, twitter:description ${twitterDescription ? '\u2713' : '\u2717'}`,
      recommendation:
        twitterScore === 100
          ? 'Twitter Card tags configured'
          : 'Add Twitter Card meta tags for better Twitter sharing',
    })

    const robotsScore = robots ? 100 : 50
    checks.push({
      id: 'meta_robots',
      category: 'meta',
      name: 'Robots Meta Tag',
      status: robots ? 'passed' : 'warning',
      score: robotsScore,
      value: robots || 'Default (index, follow)',
      recommendation: robots
        ? 'Robots meta tag configured'
        : 'Consider configuring robots meta tag if you have specific indexing needs',
    })

    const faviconScore = faviconPresent ? 100 : 50
    checks.push({
      id: 'meta_favicon',
      category: 'meta',
      name: 'Favicon',
      status: faviconScore === 100 ? 'passed' : 'warning',
      score: faviconScore,
      value: faviconPresent ? 'Present' : 'Not found',
      recommendation:
        faviconScore === 100 ? 'Favicon properly configured' : 'Add a favicon to improve branding and user experience',
    })

    const hreflangScore = hreflangCount > 0 ? 100 : 50
    checks.push({
      id: 'meta_hreflang',
      category: 'meta',
      name: 'Hreflang Tags',
      status: hreflangCount > 0 ? 'passed' : 'warning',
      score: hreflangScore,
      value: `${hreflangCount} hreflang tag(s)`,
      recommendation:
        hreflangCount > 0
          ? 'Hreflang tags configured for international SEO'
          : 'Add hreflang tags if your site targets multiple languages or regions',
    })

    const imageWidthHeightScore =
      imageData.total === 0 ? 50 : ((imageData.total - imageData.withoutWidthHeight) / imageData.total) * 100
    checks.push({
      id: 'content_images_dimensions',
      category: 'content',
      name: 'Image Dimensions',
      status: imageWidthHeightScore === 100 ? 'passed' : imageWidthHeightScore >= 70 ? 'warning' : 'error',
      score: Math.round(imageWidthHeightScore),
      value: `${imageData.total - imageData.withoutWidthHeight}/${imageData.total} images have width/height`,
      recommendation:
        imageWidthHeightScore === 100
          ? 'All images have width/height attributes'
          : 'Add width and height attributes to prevent layout shift',
    })

    const lazyLoadScore = lazyLoadImages > 0 ? 100 : 50
    checks.push({
      id: 'content_lazy_loading',
      category: 'content',
      name: 'Lazy Loading',
      status: lazyLoadScore === 100 ? 'passed' : 'warning',
      score: lazyLoadScore,
      value: `${lazyLoadImages} image(s) with lazy loading`,
      recommendation:
        lazyLoadScore === 100
          ? 'Lazy loading implemented for images'
          : 'Implement lazy loading for images to improve performance',
    })

    const internalLinksScore = linkData.internal >= 3 ? 100 : linkData.internal >= 1 ? 70 : 30
    checks.push({
      id: 'content_internal_links',
      category: 'content',
      name: 'Internal Links',
      status: internalLinksScore === 100 ? 'passed' : internalLinksScore >= 70 ? 'passed' : 'warning',
      score: internalLinksScore,
      value: `${linkData.internal} internal link(s), ${linkData.external} external link(s)`,
      recommendation:
        internalLinksScore === 100
          ? 'Good internal linking strategy'
          : 'Add more internal links to improve site structure',
    })

    const compressionScore = contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('deflate')) ? 100 : 50
    checks.push({
      id: 'tech_compression',
      category: 'technical',
      name: 'Compression',
      status: compressionScore === 100 ? 'passed' : 'warning',
      score: compressionScore,
      value: contentEncoding || 'No compression detected',
      recommendation:
        compressionScore === 100
          ? 'Content properly compressed'
          : 'Enable gzip or deflate compression for better performance',
    })

    const charsetScore = charset ? 100 : 50
    checks.push({
      id: 'tech_charset',
      category: 'technical',
      name: 'Character Set',
      status: charsetScore === 100 ? 'passed' : 'warning',
      score: charsetScore,
      value: charset || 'Not declared',
      recommendation:
        charsetScore === 100 ? 'Character set properly declared' : 'Declare character set (UTF-8 recommended)',
    })

    const doctypeScore = doctype ? 100 : 50
    checks.push({
      id: 'tech_doctype',
      category: 'technical',
      name: 'DOCTYPE',
      status: doctypeScore === 100 ? 'passed' : 'warning',
      score: doctypeScore,
      value: doctype ? 'Present' : 'Missing',
      recommendation:
        doctypeScore === 100 ? 'DOCTYPE properly declared' : 'Add DOCTYPE declaration for HTML5',
    })

    const contentTypeScore = contentType && contentType.includes('text/html') ? 100 : 50
    checks.push({
      id: 'tech_content_type',
      category: 'technical',
      name: 'Content-Type Header',
      status: contentTypeScore === 100 ? 'passed' : 'warning',
      score: contentTypeScore,
      value: contentType || 'Not specified',
      recommendation:
        contentTypeScore === 100
          ? 'Content-Type header correctly set'
          : 'Ensure Content-Type is properly defined',
    })

    const externalScriptsScore = externalScripts <= 5 ? 100 : externalScripts <= 10 ? 70 : 40
    checks.push({
      id: 'perf_external_scripts',
      category: 'performance',
      name: 'External Scripts',
      status: externalScriptsScore === 100 ? 'passed' : externalScriptsScore >= 70 ? 'passed' : 'warning',
      score: externalScriptsScore,
      value: `${externalScripts} external script(s)`,
      recommendation:
        externalScriptsScore === 100
          ? 'Good number of external scripts'
          : 'Reduce the number of external scripts for better performance',
    })

    const inlineScriptsScore = inlineScripts === 0 ? 100 : inlineScripts <= 3 ? 70 : 40
    checks.push({
      id: 'perf_inline_scripts',
      category: 'performance',
      name: 'Inline Scripts',
      status: inlineScriptsScore === 100 ? 'passed' : inlineScriptsScore >= 70 ? 'passed' : 'warning',
      score: inlineScriptsScore,
      value: `${inlineScripts} inline script(s)`,
      recommendation:
        inlineScriptsScore === 100
          ? 'No inline scripts detected'
          : 'Externalize scripts to improve cache performance',
    })

    const externalStylesheetsScore = externalStylesheets <= 5 ? 100 : externalStylesheets <= 10 ? 70 : 40
    checks.push({
      id: 'perf_external_stylesheets',
      category: 'performance',
      name: 'External Stylesheets',
      status: externalStylesheetsScore === 100 ? 'passed' : externalStylesheetsScore >= 70 ? 'passed' : 'warning',
      score: externalStylesheetsScore,
      value: `${externalStylesheets} external stylesheet(s)`,
      recommendation:
        externalStylesheetsScore === 100
          ? 'Good number of stylesheets'
          : 'Consolidate stylesheets for better performance',
    })

    const inlineStylesScore = inlineStyles === 0 ? 100 : inlineStyles <= 5 ? 70 : 40
    checks.push({
      id: 'perf_inline_styles',
      category: 'performance',
      name: 'Inline Styles',
      status: inlineStylesScore === 100 ? 'passed' : inlineStylesScore >= 70 ? 'passed' : 'warning',
      score: inlineStylesScore,
      value: `${inlineStyles} inline style(s)`,
      recommendation:
        inlineStylesScore === 100
          ? 'No inline styles detected'
          : 'Externalize styles to improve cache and maintainability',
    })

    const touchIconScore = touchIcons > 0 ? 100 : 50
    checks.push({
      id: 'mobile_touch_icons',
      category: 'mobile',
      name: 'Touch Icons',
      status: touchIconScore === 100 ? 'passed' : 'warning',
      score: touchIconScore,
      value: `${touchIcons} touch icon(s)`,
      recommendation:
        touchIconScore === 100
          ? 'Touch icons configured for mobile devices'
          : 'Add apple-touch-icon for home screen bookmarks',
    })

    // Count summary by status
    const summary = {
      passed: checks.filter((c) => c.status === 'passed').length,
      warnings: checks.filter((c) => c.status === 'warning').length,
      errors: checks.filter((c) => c.status === 'error').length,
      totalChecks: checks.length,
    }

    const result: AuditResult = {
      success: true,
      data: {
        url: normalizedUrl,
        score: overallScore,
        loadTime,
        htmlSize,
        checks,
        detailedChecks,
        summary,
        meta: {
          title: title || null,
          description: description || null,
          canonical: canonical || null,
          ogTitle: ogTitle || null,
          ogDescription: ogDescription || null,
          ogImage: ogImage || null,
        },
        content: {
          wordCount,
          h1Count,
          h2Count,
          h3Count,
          imageCount: imageData.total,
          imagesWithAlt: imageData.withAlt,
          internalLinks: linkData.internal,
          externalLinks: linkData.external,
        },
      },
    }

    // Cache the result for 1 hour
    if (_cacheKey) {
      try {
        const { cacheSet } = await import('@/lib/cache')
        await cacheSet(_cacheKey, result, 3600)
      } catch { /* cache is non-critical */ }
    }

    return NextResponse.json(result, {
      headers: corsHeaders(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage.includes('AbortError')
          ? 'Request timeout exceeded 15 seconds. Ensure the URL is correct and the server is responsive.'
          : `Audit analysis error: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// GET: retrieve audit history for a website
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401, headers: corsHeaders() })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400, headers: corsHeaders() })
    }

    const audits = await (prisma as any).audit.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        url: true,
        score: true,
        grade: true,
        status: true,
        createdAt: true,
        categories: true,
        checks: true,
      },
    })

    return NextResponse.json({ success: true, data: audits }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recuperation de l\'historique' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse()
}
