import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

const FRENCH_STOP_WORDS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en',
  'au', 'aux', 'est', 'sont', 'a', 'à', 'par', 'pour', 'dans', 'sur',
  'avec', 'ce', 'cette', 'ces', 'qui', 'que', 'ne', 'pas', 'plus', 'ou',
  'se', 'son', 'sa', 'ses',
  // Common English stop words
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'is', 'it', 'this', 'that', 'are', 'was', 'be',
  'have', 'has', 'had', 'not', 'from', 'as', 'you', 'we', 'they', 'he',
  'she', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zàâäéèêëïîôùûüÿçœæ\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !FRENCH_STOP_WORDS.has(word))
}

function countTermFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1)
  }
  return freq
}

async function fetchAndExtractText(url: string): Promise<string> {
  let normalizedUrl = url
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${normalizedUrl}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove non-content elements
    $('script, style, nav, footer, header, aside, noscript').remove()

    return $('body').text()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401, headers: corsHeaders() }
      )
    }

    const body = await request.json()
    const { domain1, domain2 } = body

    if (!domain1 || !domain2 || typeof domain1 !== 'string' || typeof domain2 !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Both domain1 and domain2 are required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Fetch both domains in parallel
    const [text1, text2] = await Promise.all([
      fetchAndExtractText(domain1),
      fetchAndExtractText(domain2),
    ])

    // Tokenize and count frequency
    const tokens1 = tokenize(text1)
    const tokens2 = tokenize(text2)
    const freq1 = countTermFrequency(tokens1)
    const freq2 = countTermFrequency(tokens2)

    // Build comparison sets
    const allTermsArr: string[] = []
    freq1.forEach((_, key) => { if (!allTermsArr.includes(key)) allTermsArr.push(key) })
    freq2.forEach((_, key) => { if (!allTermsArr.includes(key)) allTermsArr.push(key) })

    const shared: { term: string; count1: number; count2: number }[] = []
    const uniqueTo1: { term: string; count: number }[] = []
    const uniqueTo2: { term: string; count: number }[] = []

    for (let i = 0; i < allTermsArr.length; i++) {
      const term = allTermsArr[i]
      const c1 = freq1.get(term) || 0
      const c2 = freq2.get(term) || 0

      if (c1 > 0 && c2 > 0) {
        shared.push({ term, count1: c1, count2: c2 })
      } else if (c1 > 0) {
        uniqueTo1.push({ term, count: c1 })
      } else {
        uniqueTo2.push({ term, count: c2 })
      }
    }

    // Sort by count descending, take top results
    const sortByCount = (a: { count: number }, b: { count: number }) => b.count - a.count
    const sortByMax = (
      a: { count1: number; count2: number },
      b: { count1: number; count2: number }
    ) => Math.max(b.count1, b.count2) - Math.max(a.count1, a.count2)

    uniqueTo1.sort(sortByCount)
    uniqueTo2.sort(sortByCount)
    shared.sort(sortByMax)

    // Build top terms per domain
    const domain1Terms: { term: string; count: number }[] = []
    freq1.forEach((count, term) => { domain1Terms.push({ term, count }) })
    domain1Terms.sort(sortByCount)
    const domain1TermsTop = domain1Terms.slice(0, 100)

    const domain2Terms: { term: string; count: number }[] = []
    freq2.forEach((count, term) => { domain2Terms.push({ term, count }) })
    domain2Terms.sort(sortByCount)
    const domain2TermsTop = domain2Terms.slice(0, 100)

    return NextResponse.json(
      {
        success: true,
        data: {
          domain1Terms: domain1TermsTop,
          domain2Terms: domain2TermsTop,
          shared: shared.slice(0, 100),
          uniqueTo1: uniqueTo1.slice(0, 100),
          uniqueTo2: uniqueTo2.slice(0, 100),
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
          : `Keyword gap error: ${errorMessage}`,
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return corsOptionsResponse()
}
