import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

interface KeywordResult {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  trend: 'up' | 'down' | 'stable'
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  serpFeatures: string[]
  competition: 'low' | 'medium' | 'high'
}

interface SuggestionResult {
  keyword: string
  volume: number
  difficulty: number
  type: string
}

interface KeywordResponse {
  query: string
  language: string
  results: KeywordResult[]
  suggestions: SuggestionResult[]
}

// SERP features pool
const SERP_FEATURES = [
  'featured snippet',
  'video',
  'images',
  'people also ask',
  'news',
  'knowledge graph',
  'reviews',
  'shopping results',
  'local pack',
]

// Generate deterministic but varied metrics based on keyword
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function generateMetrics(keyword: string, baseVolume: number = 5000) {
  const hash = hashCode(keyword)
  const rand = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    return min + ((x - Math.floor(x)) * (max - min))
  }

  const volume = Math.round(baseVolume * (0.5 + rand(hash, 0.3, 2)))
  const difficulty = Math.round(rand(hash + 1, 5, 85))
  const cpc = Math.round(rand(hash + 2, 0.1, 15) * 100) / 100

  const trends = ['up', 'down', 'stable'] as const
  const trend = trends[Math.floor(rand(hash + 3, 0, 3))]

  // Determine intent based on keyword characteristics
  let intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  if (keyword.includes('comment') || keyword.includes('qu\'est') || keyword.includes('definition')) {
    intent = 'informational'
  } else if (keyword.includes('prix') || keyword.includes('coût') || keyword.includes('devis')) {
    intent = 'commercial'
  } else if (keyword.includes('acheter') || keyword.includes('commander') || keyword.includes('télécharger')) {
    intent = 'transactional'
  } else if (keyword.includes('outil') || keyword.includes('site') || keyword.includes('plateforme')) {
    intent = 'commercial'
  } else {
    intent = 'informational'
  }

  // Determine competition level
  let competition: 'low' | 'medium' | 'high'
  if (difficulty < 30) competition = 'low'
  else if (difficulty < 60) competition = 'medium'
  else competition = 'high'

  // Select SERP features based on intent
  const serpFeatures: string[] = []
  const featureCount = Math.floor(rand(hash + 4, 1, 5))
  const selectedIndices = new Set<number>()

  while (selectedIndices.size < featureCount) {
    selectedIndices.add(Math.floor(rand(hash + 5 + selectedIndices.size, 0, SERP_FEATURES.length)))
  }

  selectedIndices.forEach((i) => serpFeatures.push(SERP_FEATURES[i]))

  // Add intent-specific features
  if (intent === 'informational' && !serpFeatures.includes('featured snippet')) {
    serpFeatures.unshift('featured snippet')
  }
  if (intent === 'transactional' && !serpFeatures.includes('shopping results')) {
    serpFeatures.push('shopping results')
  }

  return {
    volume: Math.max(100, volume),
    difficulty,
    cpc: Math.max(0.1, cpc),
    trend,
    intent,
    serpFeatures: serpFeatures.slice(0, 4),
    competition,
  }
}

// Generate keyword variations in French
function generateKeywordVariations(query: string): KeywordResult[] {
  const baseQuery = query.toLowerCase().trim()
  const variations: KeywordResult[] = []

  // Question variants
  const questionPatterns = [
    `comment faire ${baseQuery}`,
    `comment ${baseQuery}`,
    `qu'est-ce que ${baseQuery}`,
    `pourquoi ${baseQuery}`,
    `${baseQuery} définition`,
  ]

  // Long-tail variants
  const longTailPatterns = [
    `${baseQuery} gratuit`,
    `${baseQuery} en ligne`,
    `${baseQuery} pour débutants`,
    `meilleur ${baseQuery}`,
    `${baseQuery} 2026`,
    `${baseQuery} guide complet`,
  ]

  // Related commercial terms
  const commercialPatterns = [
    `${baseQuery} prix`,
    `${baseQuery} coût`,
    `meilleure agence ${baseQuery}`,
    `outil ${baseQuery}`,
    `${baseQuery} formation`,
  ]

  // Tool/platform variants
  const toolPatterns = [
    `meilleur outil ${baseQuery}`,
    `plateforme ${baseQuery}`,
    `logiciel ${baseQuery}`,
    `application ${baseQuery}`,
    `service ${baseQuery}`,
  ]

  const allPatterns = [
    ...questionPatterns.map((k) => ({ keyword: k, baseVolume: 1500, type: 'question' })),
    ...longTailPatterns.map((k) => ({ keyword: k, baseVolume: 800, type: 'long-tail' })),
    ...commercialPatterns.map((k) => ({ keyword: k, baseVolume: 2000, type: 'commercial' })),
    ...toolPatterns.map((k) => ({ keyword: k, baseVolume: 1200, type: 'tool' })),
    { keyword: baseQuery, baseVolume: 8000, type: 'seed' },
  ]

  // Shuffle deterministically based on query
  const shuffled = allPatterns.sort((a, b) => {
    const hashA = hashCode(a.keyword)
    const hashB = hashCode(b.keyword)
    return hashA - hashB
  })

  // Take top 15 variations
  shuffled.slice(0, 15).forEach(({ keyword, baseVolume }) => {
    const metrics = generateMetrics(keyword, baseVolume)
    variations.push({
      keyword,
      ...metrics,
    })
  })

  return variations
}

// Generate quick suggestions for autocomplete
function generateSuggestions(query: string): SuggestionResult[] {
  const baseQuery = query.toLowerCase().trim()
  const suggestions: SuggestionResult[] = []

  const quickSuggestions = [
    { keyword: `${baseQuery} gratuit`, type: 'long-tail' },
    { keyword: `${baseQuery} prix`, type: 'commercial' },
    { keyword: `comment faire ${baseQuery}`, type: 'question' },
    { keyword: `meilleur ${baseQuery}`, type: 'comparative' },
    { keyword: `${baseQuery} outil`, type: 'tool' },
  ]

  quickSuggestions.forEach(({ keyword, type }) => {
    const metrics = generateMetrics(keyword)
    suggestions.push({
      keyword,
      volume: metrics.volume,
      difficulty: metrics.difficulty,
      type,
    })
  })

  return suggestions
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, language = 'fr' } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400, headers: getCORSHeaders(request) }
      )
    }

    if (query.length < 2 || query.length > 100) {
      return NextResponse.json(
        { error: 'Query must be between 2 and 100 characters' },
        { status: 400, headers: getCORSHeaders(request) }
      )
    }

    // Try DataForSEO first for real data
    let results: KeywordResult[] = []
    let suggestions: SuggestionResult[] = []
    let dataSource: 'dataforseo' | 'estimated' = 'estimated'

    if (process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD) {
      try {
        const { getKeywordVolumes, getKeywordSuggestions } = await import('@/lib/dataforseo')
        const [volumes, suggs] = await Promise.all([
          getKeywordVolumes([query], language),
          getKeywordSuggestions(query, language),
        ])
        if (volumes.length > 0 || suggs.length > 0) {
          dataSource = 'dataforseo'
          results = suggs.slice(0, 20).map(s => ({
            keyword: s.keyword,
            volume: s.volume,
            difficulty: s.difficulty,
            cpc: s.cpc,
            trend: s.volume > 500 ? 'up' as const : 'stable' as const,
            intent: s.intent as any,
            serpFeatures: [],
            competition: s.difficulty > 70 ? 'high' as const : s.difficulty > 40 ? 'medium' as const : 'low' as const,
          }))
          suggestions = suggs.slice(20, 40).map(s => ({
            keyword: s.keyword,
            volume: s.volume,
            difficulty: s.difficulty,
            type: s.intent,
          }))
        }
      } catch (e) {
        console.error('DataForSEO failed, using estimates:', e)
      }
    }

    // Fallback to estimated data
    if (results.length === 0) {
      results = generateKeywordVariations(query)
      suggestions = generateSuggestions(query)
    }

    const response: KeywordResponse & { dataSource?: string } = {
      query,
      language,
      results,
      suggestions,
      dataSource,
    }

    return NextResponse.json(response, {
      headers: getCORSHeaders(request),
    })
  } catch (error) {
    console.error('Keyword research error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getCORSHeaders(request) }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: getCORSHeaders(request),
  })
}

function getCORSHeaders(request: NextRequest) {
  const origin = request.headers.get('origin')
  return {
    ...corsHeaders(origin),
    'Content-Type': 'application/json',
  }
}
