import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

interface OnPageCheck {
  name: string
  found: boolean
  context: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, keyword } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing URL provided' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing keyword provided' },
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

    // Fetch URL
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

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
    const $ = cheerio.load(html)

    const kw = keyword.toLowerCase().trim()
    const checks: OnPageCheck[] = []

    // 1. Title tag
    const title = $('title').text().trim()
    const titleFound = title.toLowerCase().includes(kw)
    checks.push({
      name: 'Title Tag',
      found: titleFound,
      context: title ? title.slice(0, 120) : 'No title tag found',
    })

    // 2. H1
    const h1Text = $('h1').first().text().trim()
    const h1Found = h1Text.toLowerCase().includes(kw)
    checks.push({
      name: 'H1 Heading',
      found: h1Found,
      context: h1Text ? h1Text.slice(0, 120) : 'No H1 found',
    })

    // 3. Meta description
    const metaDesc =
      $('meta[name="description"]').attr('content') || ''
    const metaDescFound = metaDesc.toLowerCase().includes(kw)
    checks.push({
      name: 'Meta Description',
      found: metaDescFound,
      context: metaDesc ? metaDesc.slice(0, 160) : 'No meta description found',
    })

    // 4. First paragraph
    const firstParagraph = $('p').first().text().trim()
    const firstParaFound = firstParagraph.toLowerCase().includes(kw)
    checks.push({
      name: 'First Paragraph',
      found: firstParaFound,
      context: firstParagraph ? firstParagraph.slice(0, 200) : 'No paragraph found',
    })

    // 5. URL
    const urlPath = urlObj.pathname + urlObj.search
    const urlFound = urlPath.toLowerCase().includes(kw.replace(/\s+/g, '-'))
    checks.push({
      name: 'URL',
      found: urlFound,
      context: normalizedUrl,
    })

    // 6. Alt texts
    const altTexts: string[] = []
    let altFound = false
    $('img[alt]').each((_, el) => {
      const alt = $(el).attr('alt') || ''
      altTexts.push(alt)
      if (alt.toLowerCase().includes(kw)) {
        altFound = true
      }
    })
    checks.push({
      name: 'Image Alt Texts',
      found: altFound,
      context: altFound
        ? `Keyword found in ${altTexts.filter((a) => a.toLowerCase().includes(kw)).length} alt text(s)`
        : `${altTexts.length} images checked, keyword not found`,
    })

    // 7. H2 headings
    const h2Texts: string[] = []
    let h2Found = false
    $('h2').each((_, el) => {
      const text = $(el).text().trim()
      h2Texts.push(text)
      if (text.toLowerCase().includes(kw)) {
        h2Found = true
      }
    })
    checks.push({
      name: 'H2 Headings',
      found: h2Found,
      context: h2Found
        ? `Keyword found in H2: "${h2Texts.find((t) => t.toLowerCase().includes(kw))?.slice(0, 80)}"`
        : `${h2Texts.length} H2 headings checked, keyword not found`,
    })

    // 8. H3 headings
    const h3Texts: string[] = []
    let h3Found = false
    $('h3').each((_, el) => {
      const text = $(el).text().trim()
      h3Texts.push(text)
      if (text.toLowerCase().includes(kw)) {
        h3Found = true
      }
    })
    checks.push({
      name: 'H3 Headings',
      found: h3Found,
      context: h3Found
        ? `Keyword found in H3: "${h3Texts.find((t) => t.toLowerCase().includes(kw))?.slice(0, 80)}"`
        : `${h3Texts.length} H3 headings checked, keyword not found`,
    })

    // Calculate keyword density
    const bodyText = $('body').clone().find('script, style').remove().end().text()
    const allWords = bodyText.toLowerCase().trim().split(/\s+/).filter((w) => w.length > 0)
    const totalWords = allWords.length

    // Count keyword occurrences (as a phrase)
    const bodyLower = bodyText.toLowerCase()
    let keywordCount = 0
    let searchIndex = 0
    while (true) {
      const idx = bodyLower.indexOf(kw, searchIndex)
      if (idx === -1) break
      keywordCount++
      searchIndex = idx + 1
    }

    const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0

    // Calculate overall score
    const foundCount = checks.filter((c) => c.found).length
    const totalChecks = checks.length
    // Weight: title and H1 are most important
    let weightedScore = 0
    const weights: Record<string, number> = {
      'Title Tag': 20,
      'H1 Heading': 20,
      'Meta Description': 15,
      'First Paragraph': 10,
      'URL': 10,
      'Image Alt Texts': 5,
      'H2 Headings': 10,
      'H3 Headings': 10,
    }
    let totalWeight = 0
    for (const check of checks) {
      const w = weights[check.name] || 10
      totalWeight += w
      if (check.found) weightedScore += w
    }
    const score = Math.round((weightedScore / totalWeight) * 100)

    return NextResponse.json(
      {
        success: true,
        data: {
          url: normalizedUrl,
          keyword,
          checks,
          density: Math.round(density * 100) / 100,
          score,
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
          : `On-page check error: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse()
}
