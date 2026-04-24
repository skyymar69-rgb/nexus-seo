/**
 * Scan Orchestrator — Lance toutes les analyses en parallele
 * Fetch HTML une seule fois, distribue aux analyseurs
 */

import * as cheerio from 'cheerio'
import { prisma } from '@/lib/prisma'
import { analyzeAEO, type AEOResult } from '@/lib/aeo-score'
import { analyzeGEO, type GEOAuditResult } from '@/lib/geo-audit'
import { calculateEEATScore, validateSchemaMarkup, analyzeFAQ } from '@/lib/geo-engine'
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

// ── Types ────────────────────────────────────────────────────

export interface ScanStepResult {
  name: string
  status: 'completed' | 'failed'
  duration: number
  error?: string
}

export interface FullScanResult {
  audit: {
    score: number
    grade: string
    checks: DetailedCheck[]
    summary: { passed: number; warnings: number; errors: number; total: number }
    meta: Record<string, string | null>
    content: Record<string, number>
  } | null
  aeo: AEOResult | null
  geo: GEOAuditResult | null
  geoEngine: {
    eeat: ReturnType<typeof calculateEEATScore> | null
    schema: ReturnType<typeof validateSchemaMarkup> | null
    faq: ReturnType<typeof analyzeFAQ> | null
  }
  performance: {
    score: number
    grade: string
    lcp: number | null
    fid: number | null
    cls: number | null
    ttfb: number | null
  } | null
  crawl: {
    pagesFound: number
    pagesCrawled: number
    statusCodes: Record<string, number>
    issues: Array<{ url: string; issue: string }>
  } | null
  steps: ScanStepResult[]
}

// ── Helpers ──────────────────────────────────────────────────

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 55) return 'C'
  if (score >= 35) return 'D'
  return 'F'
}

async function updateScanProgress(
  scanId: string,
  progress: number,
  currentStep: string,
  extraData?: Record<string, any>
) {
  try {
    await (prisma as any).scanSession.update({
      where: { id: scanId },
      data: { progress, currentStep, ...extraData },
    })
  } catch {
    // Non-critical — continue scan even if progress update fails
  }
}

// ── HTML Fetch ───────────────────────────────────────────────

async function fetchHTML(url: string): Promise<{ html: string; loadTime: number; headers: Headers }> {
  const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  }

  // Try with https first, then http as fallback
  for (const protocol of ['https://', 'http://']) {
    const targetUrl = url.startsWith('http') ? url : protocol + url.replace(/^https?:\/\//, '')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)
    const start = Date.now()

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: fetchHeaders,
        redirect: 'follow',
      })

      if (!response.ok) {
        clearTimeout(timeoutId)
        if (protocol === 'https://') continue // Try http
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      clearTimeout(timeoutId)
      return { html, loadTime: Date.now() - start, headers: response.headers }
    } catch (err) {
      clearTimeout(timeoutId)
      if (protocol === 'https://') continue // Try http fallback
      throw err
    }
  }

  throw new Error(`Impossible de charger ${url}`)
}

// ── Step: Audit Technique ────────────────────────────────────

function runAudit(
  $: cheerio.CheerioAPI,
  html: string,
  url: string,
  loadTime: number,
  headers: Headers
) {
  const title = $('title').text() || null
  const description = $('meta[name="description"]').attr('content') || $('meta[property="description"]').attr('content') || null
  const canonical = $('link[rel="canonical"]').attr('href') || null
  const ogTitle = $('meta[property="og:title"]').attr('content') || null
  const ogDesc = $('meta[property="og:description"]').attr('content') || null
  const ogImage = $('meta[property="og:image"]').attr('content') || null
  const viewport = $('meta[name="viewport"]').attr('content') || null

  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const h3Count = $('h3').length
  const h1Text = $('h1').first().text().trim() || null

  const images = $('img')
  let imgTotal = images.length, imgWithAlt = 0
  images.each((_, el) => { if ($(el).attr('alt')) imgWithAlt++ })

  const bodyText = $('body').clone().find('script, style').remove().end().text()
  const wordCount = bodyText.trim().split(/\s+/).filter(Boolean).length

  const structuredDataCount = $('script[type="application/ld+json"]').length

  const csp = headers.get('content-security-policy')
  const xFrame = headers.get('x-frame-options')
  const xContentType = headers.get('x-content-type-options')

  const checks: DetailedCheck[] = [
    checkTitleTag(title, url),
    checkMetaDescription(description),
    checkCanonical(canonical, url),
    checkH1(h1Count, h1Text),
    checkImages(imgTotal, imgWithAlt, imgTotal - imgWithAlt),
    checkHTTPS(url),
    checkLoadTime(loadTime, html.length),
    checkStructuredData(structuredDataCount),
    checkOpenGraph(ogTitle, ogDesc, ogImage),
    checkViewport(viewport),
    checkWordCount(wordCount),
    checkHeadingHierarchy(h1Count, h2Count, h3Count),
    checkSecurityHeaders(csp, xFrame, xContentType),
  ]

  const score = Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length)

  // Count links
  const baseHost = new URL(url).hostname
  let internalLinks = 0, externalLinks = 0
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
    try {
      const linkHost = new URL(href, url).hostname
      if (linkHost === baseHost) internalLinks++; else externalLinks++
    } catch { internalLinks++ }
  })

  return {
    score,
    grade: gradeFromScore(score),
    checks,
    summary: {
      passed: checks.filter(c => c.status === 'passed').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      errors: checks.filter(c => c.status === 'error').length,
      total: checks.length,
    },
    meta: { title, description, canonical, ogTitle, ogDescription: ogDesc, ogImage },
    content: { wordCount, h1Count, h2Count, h3Count, imageCount: imgTotal, imagesWithAlt: imgWithAlt, internalLinks, externalLinks },
  }
}

// ── Step: Simple Crawl ───────────────────────────────────────

async function runSimpleCrawl(
  url: string,
  maxPages: number = 15
): Promise<FullScanResult['crawl']> {
  const baseHost = new URL(url).hostname
  const visited = new Set<string>()
  const queue = [url]
  const statusCodes: Record<string, number> = {}
  const issues: Array<{ url: string; issue: string }> = []

  while (queue.length > 0 && visited.size < maxPages) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(current, {
        signal: controller.signal,
        headers: { 'User-Agent': 'NexusSEO-Crawler/1.0' },
        redirect: 'follow',
      })
      clearTimeout(timeout)

      const code = String(res.status)
      statusCodes[code] = (statusCodes[code] || 0) + 1

      if (res.status >= 400) {
        issues.push({ url: current, issue: `HTTP ${res.status}` })
        continue
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) continue

      const html = await res.text()
      const $ = cheerio.load(html)

      // Check for missing title
      if (!$('title').text().trim()) {
        issues.push({ url: current, issue: 'Title manquant' })
      }
      // Check for missing meta description
      if (!$('meta[name="description"]').attr('content')) {
        issues.push({ url: current, issue: 'Meta description manquante' })
      }
      // Check for missing H1
      if ($('h1').length === 0) {
        issues.push({ url: current, issue: 'H1 manquant' })
      }
      // Check images without alt
      const noAlt = $('img:not([alt])').length
      if (noAlt > 0) {
        issues.push({ url: current, issue: `${noAlt} image(s) sans alt` })
      }

      // Extract internal links for BFS
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')
        if (!href) return
        try {
          const resolved = new URL(href, current)
          if (resolved.hostname === baseHost && !visited.has(resolved.href) && queue.length + visited.size < maxPages) {
            // Clean URL — remove fragments
            resolved.hash = ''
            const clean = resolved.href
            if (!visited.has(clean) && !queue.includes(clean)) {
              queue.push(clean)
            }
          }
        } catch { /* ignore invalid URLs */ }
      })
    } catch {
      issues.push({ url: current, issue: 'Timeout ou erreur reseau' })
    }
  }

  return {
    pagesFound: visited.size + queue.length,
    pagesCrawled: visited.size,
    statusCodes,
    issues: issues.slice(0, 50), // Limit issues
  }
}

// ── Step: Performance (PageSpeed API) ────────────────────────

async function runPerformanceCheck(url: string, loadTime?: number): Promise<FullScanResult['performance']> {
  const apiKey = process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY

  // Fallback sans API key — estimation basée sur le load time
  if (!apiKey) {
    if (!loadTime) return null
    const estimatedScore = loadTime < 1000 ? 90 : loadTime < 2000 ? 75 : loadTime < 3000 ? 55 : loadTime < 5000 ? 35 : 20
    return {
      score: estimatedScore,
      grade: gradeFromScore(estimatedScore),
      lcp: loadTime * 1.5, // estimation LCP
      fid: loadTime < 2000 ? 50 : 150,
      cls: 0.05, // estimation conservative
      ttfb: loadTime * 0.4,
    }
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&strategy=mobile`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const res = await fetch(apiUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()
    const lhr = data.lighthouseResult
    if (!lhr) return null

    const score = Math.round((lhr.categories?.performance?.score || 0) * 100)
    const audits = lhr.audits || {}

    return {
      score,
      grade: gradeFromScore(score),
      lcp: audits['largest-contentful-paint']?.numericValue || null,
      fid: audits['max-potential-fid']?.numericValue || null,
      cls: audits['cumulative-layout-shift']?.numericValue || null,
      ttfb: audits['server-response-time']?.numericValue || null,
    }
  } catch {
    return null
  }
}

// ── Main Orchestrator ────────────────────────────────────────

export async function runFullScan(scanId: string, websiteId: string, url: string): Promise<FullScanResult> {
  const steps: ScanStepResult[] = []
  let result: FullScanResult = {
    audit: null,
    aeo: null,
    geo: null,
    geoEngine: { eeat: null, schema: null, faq: null },
    performance: null,
    crawl: null,
    steps: [],
  }

  // Mark as running
  await updateScanProgress(scanId, 0, 'Recuperation de la page...',  { status: 'running' })

  // Step 0 — Fetch HTML (shared by audit, AEO, GEO)
  let html: string
  let loadTime: number
  let headers: Headers
  try {
    const fetched = await fetchHTML(url)
    html = fetched.html
    loadTime = fetched.loadTime
    headers = fetched.headers
  } catch (err) {
    await updateScanProgress(scanId, 0, 'Erreur', {
      status: 'failed',
      error: `Impossible de charger ${url}: ${err instanceof Error ? err.message : 'erreur inconnue'}`,
    })
    return result
  }

  const $ = cheerio.load(html)

  // Steps 1-4 run in parallel (audit, AEO, GEO, GEO engine)
  await updateScanProgress(scanId, 1, 'Analyse SEO technique...')

  const parallelStart = Date.now()

  const [auditResult, aeoResult, geoResult, eeatResult, schemaResult, faqResult] = await Promise.allSettled([
    // 1. Audit technique
    (async () => {
      const start = Date.now()
      const audit = runAudit($, html, url, loadTime, headers)
      steps.push({ name: 'Audit technique', status: 'completed', duration: Date.now() - start })
      return audit
    })(),
    // 2. AEO
    (async () => {
      const start = Date.now()
      const aeo = analyzeAEO(html, url)
      steps.push({ name: 'Score AEO', status: 'completed', duration: Date.now() - start })
      return aeo
    })(),
    // 3. GEO Audit
    (async () => {
      const start = Date.now()
      const geo = analyzeGEO(html, url)
      steps.push({ name: 'Audit GEO', status: 'completed', duration: Date.now() - start })
      return geo
    })(),
    // 4. E-E-A-T
    (async () => {
      const start = Date.now()
      const eeat = calculateEEATScore(html, url)
      steps.push({ name: 'Score E-E-A-T', status: 'completed', duration: Date.now() - start })
      return eeat
    })(),
    // 5. Schema Validation
    (async () => {
      return validateSchemaMarkup(html)
    })(),
    // 6. FAQ Analysis
    (async () => {
      return analyzeFAQ(html)
    })(),
  ])

  // Collect parallel results
  if (auditResult.status === 'fulfilled') result.audit = auditResult.value
  if (aeoResult.status === 'fulfilled') result.aeo = aeoResult.value
  if (geoResult.status === 'fulfilled') result.geo = geoResult.value
  if (eeatResult.status === 'fulfilled') result.geoEngine.eeat = eeatResult.value
  if (schemaResult.status === 'fulfilled') result.geoEngine.schema = schemaResult.value
  if (faqResult.status === 'fulfilled') result.geoEngine.faq = faqResult.value

  // Update progress after parallel batch
  await updateScanProgress(scanId, 4, 'Analyse des performances...',  {
    auditScore: result.audit?.score || null,
    auditGrade: result.audit?.grade || null,
    aeoScore: result.aeo?.overallScore || null,
    geoScore: result.geo?.overallScore || null,
  })

  // Step 5 — Performance (external API call)
  const perfStart = Date.now()
  try {
    result.performance = await runPerformanceCheck(url, loadTime)
    steps.push({ name: 'Performance', status: 'completed', duration: Date.now() - perfStart })
  } catch (err) {
    steps.push({ name: 'Performance', status: 'failed', duration: Date.now() - perfStart, error: String(err) })
  }

  await updateScanProgress(scanId, 5, 'Crawl du site...', {
    perfScore: result.performance?.score || null,
  })

  // Step 6 — Crawl (BFS, multiple HTTP requests)
  const crawlStart = Date.now()
  try {
    result.crawl = await runSimpleCrawl(url, 10)
    steps.push({ name: 'Crawl', status: 'completed', duration: Date.now() - crawlStart })
  } catch (err) {
    steps.push({ name: 'Crawl', status: 'failed', duration: Date.now() - crawlStart, error: String(err) })
  }

  result.steps = steps

  // Save final results to DB
  await updateScanProgress(scanId, 6, 'Termine', {
    status: 'completed',
    completedAt: new Date(),
    crawlPages: result.crawl?.pagesCrawled || null,
    results: JSON.stringify({
      aeo: result.aeo,
      geo: result.geo,
      geoEngine: result.geoEngine,
      performance: result.performance,
      crawl: result.crawl,
      audit: result.audit ? {
        score: result.audit.score,
        grade: result.audit.grade,
        summary: result.audit.summary,
        meta: result.audit.meta,
        content: result.audit.content,
        checks: result.audit.checks,
      } : null,
      steps,
    }),
  })

  return result
}
