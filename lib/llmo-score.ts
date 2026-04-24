/**
 * LLMO (LLM Optimization) Scoring Engine
 * Measures how likely a brand/page is to be recommended by LLMs.
 */
import { queryLLM, type LLMProvider, type LLMResponse } from '@/lib/llm-clients'

export interface LLMOQueryResult {
  query: string
  provider: LLMProvider
  mentioned: boolean
  position: number | null
  sentiment: 'positive' | 'neutral' | 'negative'
  competitors: string[]
  simulated: boolean
  responseSnippet: string
}

export interface LLMOResult {
  overallScore: number
  mentionRate: number
  avgPosition: number | null
  sentimentScore: number
  competitivePosition: number
  queryResults: LLMOQueryResult[]
  topCompetitors: { name: string; mentions: number }[]
  recommendations: string[]
}

function analyzeSentiment(text: string, brand: string): 'positive' | 'neutral' | 'negative' {
  const lower = text.toLowerCase()
  const brandIdx = lower.indexOf(brand.toLowerCase())
  if (brandIdx === -1) return 'neutral'

  // Extract context around brand mention (200 chars)
  const start = Math.max(0, brandIdx - 100)
  const end = Math.min(lower.length, brandIdx + brand.length + 100)
  const context = lower.slice(start, end)

  const positive = (context.match(/best|top|excellent|recommend|leading|innovative|powerful|reliable|outstanding|great|impressive|trusted|ideal|prefer/gi) || []).length
  const negative = (context.match(/poor|worst|avoid|inferior|outdated|expensive|limited|lack|slow|problem|issue|concern|disadvantage/gi) || []).length

  if (positive > negative) return 'positive'
  if (negative > positive) return 'negative'
  return 'neutral'
}

function findPosition(text: string, brand: string): number | null {
  const lower = text.toLowerCase()
  const brandLower = brand.toLowerCase()

  if (!lower.includes(brandLower)) return null

  // Split into sentences and find which one mentions the brand
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10)
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].toLowerCase().includes(brandLower)) {
      return i + 1
    }
  }
  return null
}

function extractCompetitors(text: string, brand: string): string[] {
  const knownTools = [
    'Semrush', 'Ahrefs', 'Moz', 'Screaming Frog', 'Majestic',
    'SE Ranking', 'Ubersuggest', 'Mangools', 'Surfer SEO', 'Clearscope',
    'BrightEdge', 'Conductor', 'seoClarity', 'Botify', 'Lumar',
    'SpyFu', 'Serpstat', 'Raven Tools', 'AccuRanker', 'Monitorank',
    'ContentKing', 'DeepCrawl', 'Sistrix', 'Searchmetrics', 'Yoast',
  ]

  const lower = text.toLowerCase()
  const brandLower = brand.toLowerCase()

  return knownTools.filter(tool =>
    lower.includes(tool.toLowerCase()) && tool.toLowerCase() !== brandLower
  )
}

const PROMPTS = [
  (q: string) => `What are the best tools for ${q}? List your top recommendations with brief explanations.`,
  (q: string) => `I'm looking for ${q}. What would you recommend and why?`,
  (q: string) => `Compare the top solutions for ${q}. Which one is best for professionals?`,
]

export async function analyzeLLMO(
  brand: string,
  domain: string,
  queries: string[],
  providers: LLMProvider[] = ['chatgpt', 'claude', 'gemini', 'perplexity']
): Promise<LLMOResult> {
  const queryResults: LLMOQueryResult[] = []

  // For each query, ask each provider
  for (const query of queries.slice(0, 5)) { // Limit to 5 queries
    const promptTemplate = PROMPTS[Math.abs(hashCode(query)) % PROMPTS.length]
    const prompt = promptTemplate(query)

    const providerPromises = providers.map(async (provider): Promise<LLMOQueryResult> => {
      try {
        const response = await Promise.race([
          queryLLM(provider, prompt),
          new Promise<LLMResponse>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 15000)
          ),
        ])

        const mentioned = response.text.toLowerCase().includes(brand.toLowerCase()) ||
                          response.text.toLowerCase().includes(domain.toLowerCase())
        const position = mentioned ? findPosition(response.text, brand) || findPosition(response.text, domain) : null
        const sentiment = mentioned ? analyzeSentiment(response.text, brand) : 'neutral'
        const competitors = extractCompetitors(response.text, brand)

        return {
          query,
          provider,
          mentioned,
          position,
          sentiment,
          competitors,
          simulated: response.simulated,
          responseSnippet: response.text.substring(0, 200),
        }
      } catch {
        return {
          query,
          provider,
          mentioned: false,
          position: null,
          sentiment: 'neutral',
          competitors: [],
          simulated: true,
          responseSnippet: 'Erreur de connexion au LLM',
        }
      }
    })

    const results = await Promise.all(providerPromises)
    queryResults.push(...results)
  }

  // Calculate metrics
  const totalQueries = queryResults.length
  const mentioned = queryResults.filter(r => r.mentioned)
  const mentionRate = totalQueries > 0 ? (mentioned.length / totalQueries) * 100 : 0

  const positions = mentioned.filter(r => r.position !== null).map(r => r.position!)
  const avgPosition = positions.length > 0
    ? positions.reduce((a, b) => a + b, 0) / positions.length
    : null

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 }
  mentioned.forEach(r => sentimentCounts[r.sentiment]++)
  const totalSentiment = mentioned.length || 1
  const sentimentScore = Math.round(
    ((sentimentCounts.positive * 100 + sentimentCounts.neutral * 50 + sentimentCounts.negative * 0) / totalSentiment)
  )

  // Count competitor mentions
  const competitorMap: Record<string, number> = {}
  queryResults.forEach(r => {
    r.competitors.forEach(c => {
      competitorMap[c] = (competitorMap[c] || 0) + 1
    })
  })
  const topCompetitors = Object.entries(competitorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, mentions]) => ({ name, mentions }))

  // Competitive position: how does brand compare to top competitor
  const topCompMentions = topCompetitors[0]?.mentions || 0
  const competitivePosition = topCompMentions > 0
    ? Math.min(100, Math.round((mentioned.length / topCompMentions) * 100))
    : mentioned.length > 0 ? 100 : 0

  // Overall score (weighted)
  const overallScore = Math.round(
    mentionRate * 0.35 +
    (avgPosition ? Math.max(0, 100 - avgPosition * 10) : 0) * 0.25 +
    sentimentScore * 0.25 +
    competitivePosition * 0.15
  )

  // Recommendations
  const recommendations: string[] = []
  if (mentionRate < 30) {
    recommendations.push('Votre marque est rarement mentionnée par les LLMs. Créez du contenu de référence (guides, études) pour devenir une source citée.')
  }
  if (avgPosition && avgPosition > 5) {
    recommendations.push('Quand mentionnée, votre marque apparaît loin dans les réponses. Renforcez votre positionnement unique et vos avantages concurrentiels.')
  }
  if (sentimentCounts.negative > sentimentCounts.positive) {
    recommendations.push('Le sentiment autour de votre marque est majoritairement négatif. Travaillez votre réputation et créez du contenu positif.')
  }
  if (topCompetitors.length > 0 && competitivePosition < 50) {
    recommendations.push(`${topCompetitors[0].name} est mentionné ${topCompetitors[0].mentions}x. Différenciez-vous clairement de vos concurrents dans votre contenu.`)
  }
  if (recommendations.length === 0) {
    recommendations.push('Excellent score LLMO ! Continuez à produire du contenu de qualité et surveillez régulièrement votre visibilité.')
  }

  return {
    overallScore,
    mentionRate: Math.round(mentionRate * 10) / 10,
    avgPosition: avgPosition ? Math.round(avgPosition * 10) / 10 : null,
    sentimentScore,
    competitivePosition,
    queryResults,
    topCompetitors,
    recommendations,
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}
