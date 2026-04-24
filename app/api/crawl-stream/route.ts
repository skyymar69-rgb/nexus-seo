import { NextRequest } from 'next/server'
import * as cheerio from 'cheerio'

/**
 * Streaming Crawl with Server-Sent Events
 * POST /api/crawl-stream { url: string, maxPages?: number }
 *
 * Sends SSE events as each page is crawled:
 * - progress: { pagesFound, pagesCrawled, currentUrl }
 * - page: { url, statusCode, title, issues }
 * - complete: { totalPages, totalIssues, duration }
 * - error: { message }
 */

export const runtime = 'nodejs'

interface CrawledPageData {
  url: string
  statusCode: number
  title: string
  h1Count: number
  wordCount: number
  imagesNoAlt: number
  internalLinks: number
  externalLinks: number
  responseTime: number
  issues: string[]
}

export async function POST(request: NextRequest) {
  const { url, maxPages = 20 } = await request.json()

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL requise' }), { status: 400 })
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
  const baseUrl = new URL(normalizedUrl)
  const visited = new Set<string>()
  const toVisit: string[] = [normalizedUrl]
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      let totalIssues = 0

      try {
        while (toVisit.length > 0 && visited.size < maxPages) {
          const currentUrl = toVisit.shift()!
          if (visited.has(currentUrl)) continue
          visited.add(currentUrl)

          // Send progress
          send('progress', {
            pagesFound: visited.size + toVisit.length,
            pagesCrawled: visited.size,
            currentUrl,
            maxPages,
          })

          try {
            const pageStart = performance.now()
            const response = await fetch(currentUrl, {
              headers: { 'User-Agent': 'NexusSEO-Crawler/1.0' },
              signal: AbortSignal.timeout(10000),
              redirect: 'follow',
            })

            const responseTime = Math.round(performance.now() - pageStart)
            const html = await response.text()
            const $ = cheerio.load(html)

            const issues: string[] = []
            const title = $('title').text().trim()
            const h1Count = $('h1').length
            const wordCount = $('body').text().split(/\s+/).filter(w => w.length > 1).length
            const imgs = $('img')
            const imagesNoAlt = imgs.filter((_, el) => !$(el).attr('alt')).length

            // Detect issues
            if (!title) issues.push('Titre manquant')
            if (title.length > 60) issues.push('Titre trop long')
            if (h1Count === 0) issues.push('H1 manquant')
            if (h1Count > 1) issues.push('Plusieurs H1')
            if (imagesNoAlt > 0) issues.push(`${imagesNoAlt} images sans alt`)
            if (wordCount < 300) issues.push('Contenu trop court')
            if (!$('meta[name="description"]').attr('content')) issues.push('Meta description manquante')
            if (response.status >= 400) issues.push(`Erreur HTTP ${response.status}`)

            totalIssues += issues.length

            // Extract internal links for further crawling
            const links = $('a[href]').map((_, el) => $(el).attr('href')).get()
            for (const link of links) {
              try {
                const resolved = new URL(link, currentUrl)
                if (resolved.hostname === baseUrl.hostname && !visited.has(resolved.href) && !toVisit.includes(resolved.href)) {
                  // Only crawl HTML pages
                  if (!resolved.pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip|mp4|mp3|woff|woff2|ttf|eot|ico)$/i)) {
                    toVisit.push(resolved.href)
                  }
                }
              } catch { /* invalid URL */ }
            }

            const internalLinks = links.filter(l => {
              try { return new URL(l, currentUrl).hostname === baseUrl.hostname } catch { return false }
            }).length

            const externalLinks = links.filter(l => {
              try { return new URL(l, currentUrl).hostname !== baseUrl.hostname && l.startsWith('http') } catch { return false }
            }).length

            // Send page result
            send('page', {
              url: currentUrl,
              statusCode: response.status,
              title,
              h1Count,
              wordCount,
              imagesNoAlt,
              internalLinks,
              externalLinks,
              responseTime,
              issues,
            })
          } catch (pageError) {
            send('page', {
              url: currentUrl,
              statusCode: 0,
              title: '',
              h1Count: 0,
              wordCount: 0,
              imagesNoAlt: 0,
              internalLinks: 0,
              externalLinks: 0,
              responseTime: 0,
              issues: [`Erreur: ${pageError instanceof Error ? pageError.message : 'Timeout'}`],
            })
            totalIssues++
          }

          // Small delay between requests to be polite
          await new Promise(r => setTimeout(r, 200))
        }

        // Send completion
        send('complete', {
          totalPages: visited.size,
          totalIssues,
          duration: Math.round((Date.now() - startTime) / 1000),
          pagesWithIssues: totalIssues,
        })
      } catch (error) {
        send('error', { message: error instanceof Error ? error.message : 'Erreur de crawl' })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
