import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

export const maxDuration = 30

interface ContentSuggestion {
  category: 'structure' | 'seo' | 'readability' | 'engagement' | 'technical'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  currentValue?: string
  recommendedValue?: string
  impact: string
}

interface ContentAnalysis {
  url: string
  title: string
  wordCount: number
  readingTime: number
  readabilityScore: number
  headingStructure: { tag: string; text: string; level: number }[]
  images: { total: number; withAlt: number; withoutAlt: number }
  links: { internal: number; external: number }
  keywordDensity: { word: string; count: number; density: number }[]
  suggestions: ContentSuggestion[]
  scores: {
    structure: number
    seo: number
    readability: number
    engagement: number
    technical: number
    overall: number
  }
}

function analyzeContent(html: string, url: string): ContentAnalysis {
  const $ = cheerio.load(html)
  const suggestions: ContentSuggestion[] = []

  // Extract text content
  const bodyText = $('body').clone().find('script, style, noscript, nav, footer, header').remove().end().text()
  const cleanText = bodyText.replace(/\s+/g, ' ').trim()
  const words = cleanText.split(/\s+/).filter(w => w.length > 2)
  const wordCount = words.length
  const readingTime = Math.ceil(wordCount / 200) // 200 words per minute avg

  // Title analysis
  const title = $('title').text().trim()
  const titleLen = title.length

  if (!title) {
    suggestions.push({ category: 'seo', priority: 'critical', title: 'Titre manquant', description: 'La page n\'a pas de balise <title>. C\'est le signal SEO le plus important.', impact: '~20 points de score SEO', recommendedValue: 'Ajoutez un titre de 50-60 caracteres avec votre mot-cle principal' })
  } else if (titleLen < 30) {
    suggestions.push({ category: 'seo', priority: 'high', title: 'Titre trop court', description: `Votre titre fait ${titleLen} caracteres. Les titres entre 50-60 caracteres performent mieux.`, currentValue: `${titleLen} caracteres`, recommendedValue: '50-60 caracteres', impact: '~5 points' })
  } else if (titleLen > 60) {
    suggestions.push({ category: 'seo', priority: 'medium', title: 'Titre trop long', description: `Votre titre fait ${titleLen} caracteres. Il sera tronque dans les SERP.`, currentValue: `${titleLen} caracteres`, recommendedValue: '50-60 caracteres', impact: '~3 points' })
  }

  // Meta description
  const metaDesc = $('meta[name="description"]').attr('content') || ''
  const descLen = metaDesc.length

  if (!metaDesc) {
    suggestions.push({ category: 'seo', priority: 'critical', title: 'Meta description manquante', description: 'Ajoutez une meta description pour améliorer votre CTR dans les SERP.', impact: '~15 points', recommendedValue: '120-155 caractères avec CTA' })
  } else if (descLen < 120) {
    suggestions.push({ category: 'seo', priority: 'medium', title: 'Meta description trop courte', description: `Votre meta description fait ${descLen} caractères.`, currentValue: `${descLen} car.`, recommendedValue: '120-155 caractères', impact: '~3 points' })
  }

  // Headings analysis
  const headings: { tag: string; text: string; level: number }[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = el.tagName.toLowerCase()
    headings.push({ tag, text: $(el).text().trim().substring(0, 80), level: parseInt(tag.charAt(1)) })
  })

  const h1Count = headings.filter(h => h.level === 1).length
  const h2Count = headings.filter(h => h.level === 2).length

  if (h1Count === 0) {
    suggestions.push({ category: 'structure', priority: 'critical', title: 'H1 manquant', description: 'Chaque page doit avoir exactement un H1 contenant le sujet principal.', impact: '~10 points' })
  } else if (h1Count > 1) {
    suggestions.push({ category: 'structure', priority: 'high', title: 'Plusieurs H1 détectés', description: `${h1Count} balises H1 trouvées. Il ne devrait y en avoir qu'une seule.`, currentValue: `${h1Count} H1`, recommendedValue: '1 H1 unique', impact: '~5 points' })
  }

  if (h2Count === 0) {
    suggestions.push({ category: 'structure', priority: 'high', title: 'Aucun H2 détecté', description: 'Ajoutez des sous-titres H2 pour structurer votre contenu et aider Google à comprendre vos sections.', impact: '~5 points' })
  }

  // Word count analysis
  if (wordCount < 300) {
    suggestions.push({ category: 'readability', priority: 'critical', title: 'Contenu trop court', description: `Seulement ${wordCount} mots. Les pages bien référencées contiennent généralement 1000+ mots.`, currentValue: `${wordCount} mots`, recommendedValue: '1000-2000 mots', impact: '~15 points' })
  } else if (wordCount < 800) {
    suggestions.push({ category: 'readability', priority: 'medium', title: 'Contenu un peu court', description: `${wordCount} mots détectés. Enrichissez votre contenu pour couvrir le sujet en profondeur.`, currentValue: `${wordCount} mots`, recommendedValue: '1000-2000 mots', impact: '~5 points' })
  }

  // Images analysis
  const images = $('img')
  let imgTotal = images.length, imgWithAlt = 0, imgWithoutAlt = 0
  images.each((_, el) => {
    if ($(el).attr('alt')?.trim()) imgWithAlt++; else imgWithoutAlt++
  })

  if (imgTotal === 0 && wordCount > 500) {
    suggestions.push({ category: 'engagement', priority: 'medium', title: 'Aucune image détectée', description: 'Ajoutez des images pour améliorer l\'engagement et le temps passé sur la page.', impact: '~3 points' })
  }
  if (imgWithoutAlt > 0) {
    suggestions.push({ category: 'seo', priority: 'high', title: `${imgWithoutAlt} image(s) sans attribut alt`, description: 'Ajoutez des descriptions alt à toutes vos images pour l\'accessibilité et le SEO.', currentValue: `${imgWithoutAlt}/${imgTotal} sans alt`, recommendedValue: '100% avec alt', impact: '~5 points' })
  }

  // Links analysis
  const baseHost = new URL(url).hostname
  let internalLinks = 0, externalLinks = 0
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return
    try {
      const linkHost = new URL(href, url).hostname
      if (linkHost === baseHost) internalLinks++; else externalLinks++
    } catch { internalLinks++ }
  })

  if (internalLinks < 3 && wordCount > 500) {
    suggestions.push({ category: 'seo', priority: 'medium', title: 'Maillage interne faible', description: `Seulement ${internalLinks} liens internes. Ajoutez des liens vers vos autres pages pertinentes.`, currentValue: `${internalLinks} liens internes`, recommendedValue: '3-5 minimum', impact: '~5 points' })
  }

  if (externalLinks === 0 && wordCount > 500) {
    suggestions.push({ category: 'engagement', priority: 'low', title: 'Aucun lien externe', description: 'Ajoutez des liens vers des sources autoritaires pour renforcer la crédibilité de votre contenu.', impact: '~2 points' })
  }

  // Keyword density (top words)
  const wordFreq: Record<string, number> = {}
  const stopWords = new Set(['les', 'des', 'une', 'pour', 'dans', 'avec', 'sur', 'par', 'plus', 'qui', 'que', 'est', 'pas', 'son', 'ses', 'aux', 'cette', 'tout', 'mais', 'comme', 'ont', 'sont', 'leur', 'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out'])

  words.forEach(w => {
    const lower = w.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç-]/g, '')
    if (lower.length > 3 && !stopWords.has(lower)) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1
    }
  })

  const keywordDensity = Object.entries(wordFreq)
    .map(([word, count]) => ({ word, count, density: Math.round((count / wordCount) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Structured data check
  const structuredDataCount = $('script[type="application/ld+json"]').length
  if (structuredDataCount === 0) {
    suggestions.push({ category: 'technical', priority: 'high', title: 'Aucune donnée structurée', description: 'Ajoutez du JSON-LD pour améliorer vos rich snippets dans Google. Utilisez notre générateur de schémas.', impact: '~8 points' })
  }

  // Open Graph check
  const ogTitle = $('meta[property="og:title"]').attr('content')
  if (!ogTitle) {
    suggestions.push({ category: 'technical', priority: 'medium', title: 'Open Graph manquant', description: 'Ajoutez les meta Open Graph pour un meilleur partage sur les réseaux sociaux.', impact: '~3 points' })
  }

  // Readability score (simplified Flesch-Kincaid for French)
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0
  const readabilityScore = Math.max(0, Math.min(100, Math.round(100 - (avgWordsPerSentence - 15) * 3)))

  if (avgWordsPerSentence > 25) {
    suggestions.push({ category: 'readability', priority: 'medium', title: 'Phrases trop longues', description: `Moyenne de ${Math.round(avgWordsPerSentence)} mots par phrase. Visez 15-20 mots pour une meilleure lisibilite.`, currentValue: `${Math.round(avgWordsPerSentence)} mots/phrase`, recommendedValue: '15-20 mots/phrase', impact: '~3 points' })
  }

  // Calculate scores
  const structureScore = Math.min(100, (h1Count === 1 ? 40 : 0) + (h2Count >= 2 ? 30 : h2Count === 1 ? 15 : 0) + (headings.length >= 4 ? 30 : headings.length * 7))
  const seoScore = Math.min(100, (title ? (titleLen >= 30 && titleLen <= 60 ? 30 : 15) : 0) + (metaDesc ? (descLen >= 120 ? 25 : 15) : 0) + (imgWithoutAlt === 0 ? 20 : 10) + (internalLinks >= 3 ? 15 : internalLinks * 5) + (structuredDataCount > 0 ? 10 : 0))
  const engagementScore = Math.min(100, (imgTotal > 0 ? 30 : 0) + (wordCount >= 1000 ? 40 : Math.round(wordCount / 25)) + (externalLinks > 0 ? 15 : 0) + (h2Count >= 3 ? 15 : h2Count * 5))
  const technicalScore = Math.min(100, (structuredDataCount > 0 ? 40 : 0) + (ogTitle ? 30 : 0) + ($('meta[name="viewport"]').length > 0 ? 15 : 0) + ($('link[rel="canonical"]').length > 0 ? 15 : 0))
  const overall = Math.round((structureScore + seoScore + readabilityScore + engagementScore + technicalScore) / 5)

  // Sort suggestions by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return {
    url,
    title,
    wordCount,
    readingTime,
    readabilityScore,
    headingStructure: headings,
    images: { total: imgTotal, withAlt: imgWithAlt, withoutAlt: imgWithoutAlt },
    links: { internal: internalLinks, external: externalLinks },
    keywordDensity,
    suggestions,
    scores: {
      structure: structureScore,
      seo: seoScore,
      readability: readabilityScore,
      engagement: engagementScore,
      technical: technicalScore,
      overall,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requise' }, { status: 400, headers: corsHeaders() })
    }

    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: 400, headers: corsHeaders() })
    }

    const html = await response.text()
    const analysis = analyzeContent(html, normalizedUrl)

    return NextResponse.json({ success: true, data: analysis }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
