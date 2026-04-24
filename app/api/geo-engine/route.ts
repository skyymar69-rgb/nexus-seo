import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'
import {
  calculateEEATScore,
  validateSchemaMarkup,
  analyzeFAQ,
  getPromptsForSector,
  getAllSectors,
  SUPPORTED_LLMS,
} from '@/lib/geo-engine'

/**
 * GEO Engine API — Complete GEO audit for a URL
 * POST /api/geo-engine { url: string, sector?: string }
 *
 * Returns: E-E-A-T score, Schema validation, FAQ analysis, prompt suggestions
 */

export async function POST(request: NextRequest) {
  try {
    const { url, sector } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400, headers: corsHeaders() })
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    // Fetch the page
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: 400, headers: corsHeaders() })
    }

    const html = await response.text()

    // Run all GEO analyses in parallel
    const [eeat, schema, faq] = await Promise.all([
      Promise.resolve(calculateEEATScore(html, normalizedUrl)),
      Promise.resolve(validateSchemaMarkup(html)),
      Promise.resolve(analyzeFAQ(html)),
    ])

    // Get prompts for sector
    const sectorPrompts = sector ? getPromptsForSector(sector) : []
    const sectors = getAllSectors()

    // Calculate overall GEO score
    const geoScore = Math.round(
      (eeat.total * 0.35) + (schema.score * 0.25) + (faq.score * 0.2) + (eeat.trust.score * 0.2)
    )

    // Generate GEO-specific recommendations
    const geoRecommendations: string[] = []

    if (eeat.total < 50) geoRecommendations.push('Votre score E-E-A-T est faible. Les LLMs privilégient les sources fiables et expertes.')
    if (schema.missing.length > 0) geoRecommendations.push(`${schema.missing.length} schémas recommandés manquants : ${schema.missing.join(', ')}`)
    if (!faq.detected) geoRecommendations.push('Ajoutez une FAQ structurée — les LLMs extraient massivement les réponses des FAQ.')
    if (faq.detected && !faq.hasSchema) geoRecommendations.push('Votre FAQ n\'a pas de schema FAQPage. Google et les LLMs ne peuvent pas l\'exploiter pleinement.')

    // Content citability check
    const $ = cheerio.load(html)
    const wordCount = $('body').text().split(/\s+/).filter(w => w.length > 1).length
    if (wordCount < 500) geoRecommendations.push('Contenu trop court pour être cité par les LLMs. Visez 1500+ mots avec des données uniques.')

    const hasStats = /\d+\s*%|\d+\s*(millions?|milliards?|euros?|dollars?)/.test($('body').text())
    if (!hasStats) geoRecommendations.push('Ajoutez des statistiques et chiffres précis — les LLMs adorent citer des données chiffrées.')

    const hasLists = $('ul li, ol li').length
    if (hasLists < 3) geoRecommendations.push('Ajoutez des listes à puces structurées — elles sont extraites prioritairement par les LLMs.')

    return NextResponse.json({
      success: true,
      url: normalizedUrl,
      geoScore,
      eeat,
      schema,
      faq,
      sectorPrompts,
      availableSectors: sectors,
      supportedLLMs: SUPPORTED_LLMS,
      recommendations: geoRecommendations,
      wordCount,
    }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: `Audit GEO echoue: ${error instanceof Error ? error.message : 'Erreur'}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
