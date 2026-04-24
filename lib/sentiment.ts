/**
 * Advanced Sentiment Analysis
 * Utilise les embeddings OpenAI pour un scoring semantique precis
 * Fallback sur analyse par mots-cles si pas de cle API
 */

// ─── Keyword-based fallback ───────────────────────────────────

const POSITIVE_WORDS = [
  'recommande', 'excellent', 'meilleur', 'efficace', 'performant', 'gratuit',
  'puissant', 'innovant', 'fiable', 'complet', 'rapide', 'intuitif', 'precis',
  'robuste', 'moderne', 'professionnel', 'unique', 'impressionnant', 'ideal',
  'avance', 'leader', 'reference', 'remarquable', 'optimal', 'superieur',
]

const NEGATIVE_WORDS = [
  'mauvais', 'cher', 'limite', 'deconseille', 'insuffisant', 'lent', 'bug',
  'mediocre', 'complique', 'obsolete', 'inutile', 'decevant', 'faible',
  'probleme', 'erreur', 'instable', 'confus', 'incomplet', 'risque',
  'dangereux', 'eviter', 'inferieur', 'pire',
]

export type SentimentResult = {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number // -1 to 1
  confidence: number // 0 to 1
  method: 'embeddings' | 'keywords'
  keywords: string[] // mots detectes
}

export function analyzeKeywordSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase()
  const foundPositive = POSITIVE_WORDS.filter(w => lower.includes(w))
  const foundNegative = NEGATIVE_WORDS.filter(w => lower.includes(w))

  const posScore = foundPositive.length
  const negScore = foundNegative.length
  const total = posScore + negScore

  let score = 0
  if (total > 0) score = (posScore - negScore) / total

  return {
    sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
    score: Math.round(score * 100) / 100,
    confidence: Math.min(1, total * 0.15),
    method: 'keywords',
    keywords: [...foundPositive, ...foundNegative],
  }
}

// ─── Embeddings-based analysis ────────────────────────────────

const SENTIMENT_ANCHORS = {
  positive: 'This product is excellent, highly recommended, innovative, and performs very well.',
  negative: 'This product is terrible, buggy, unreliable, disappointing, and should be avoided.',
  neutral: 'This product exists and serves its purpose in an average way.',
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

async function getEmbeddings(texts: string[]): Promise<number[][] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.data?.map((d: any) => d.embedding) || null
  } catch {
    return null
  }
}

export async function analyzeEmbeddingSentiment(text: string): Promise<SentimentResult> {
  // Try embeddings first
  const embeddings = await getEmbeddings([
    text.slice(0, 500), // Limit input size
    SENTIMENT_ANCHORS.positive,
    SENTIMENT_ANCHORS.negative,
    SENTIMENT_ANCHORS.neutral,
  ])

  if (embeddings && embeddings.length === 4) {
    const [textEmb, posEmb, negEmb, neuEmb] = embeddings

    const posSim = cosineSimilarity(textEmb, posEmb)
    const negSim = cosineSimilarity(textEmb, negEmb)
    const neuSim = cosineSimilarity(textEmb, neuEmb)

    // Normalize scores
    const total = posSim + negSim + neuSim
    const posNorm = posSim / total
    const negNorm = negSim / total

    const score = posNorm - negNorm

    return {
      sentiment: score > 0.05 ? 'positive' : score < -0.05 ? 'negative' : 'neutral',
      score: Math.round(score * 100) / 100,
      confidence: Math.round(Math.abs(score) * 100) / 100,
      method: 'embeddings',
      keywords: [],
    }
  }

  // Fallback to keywords
  return analyzeKeywordSentiment(text)
}

// ─── Batch analysis ───────────────────────────────────────────

export async function analyzeBatchSentiment(texts: string[]): Promise<SentimentResult[]> {
  // If OpenAI available, use embeddings for all at once
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey && texts.length <= 20) {
    const allTexts = [
      ...texts.map(t => t.slice(0, 300)),
      SENTIMENT_ANCHORS.positive,
      SENTIMENT_ANCHORS.negative,
      SENTIMENT_ANCHORS.neutral,
    ]

    const embeddings = await getEmbeddings(allTexts)
    if (embeddings && embeddings.length === allTexts.length) {
      const posEmb = embeddings[texts.length]
      const negEmb = embeddings[texts.length + 1]
      const neuEmb = embeddings[texts.length + 2]

      return texts.map((_, i) => {
        const textEmb = embeddings[i]
        const posSim = cosineSimilarity(textEmb, posEmb)
        const negSim = cosineSimilarity(textEmb, negEmb)
        const total = posSim + negSim + cosineSimilarity(textEmb, neuEmb)
        const score = (posSim / total) - (negSim / total)

        return {
          sentiment: (score > 0.05 ? 'positive' : score < -0.05 ? 'negative' : 'neutral') as SentimentResult['sentiment'],
          score: Math.round(score * 100) / 100,
          confidence: Math.round(Math.abs(score) * 100) / 100,
          method: 'embeddings' as const,
          keywords: [],
        }
      })
    }
  }

  // Fallback: keyword-based for each
  return texts.map(t => analyzeKeywordSentiment(t))
}
