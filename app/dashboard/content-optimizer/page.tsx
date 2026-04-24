'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Loader2,
  Search,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'

interface SemanticResult {
  score: number
  keyword: string
  content: {
    wordCount: number
    sentenceCount: number
    paragraphCount: number
    avgSentenceLength: number
    readingLevel: string
    headings: { h1: number; h2: number; h3: number }
  }
  keywordAnalysis: {
    density: number
    occurrences: number
    inTitle: boolean
    inH1: boolean
    inMetaDescription: boolean
  }
  topTerms: Array<{
    term: string
    frequency: number
    density: number
    relevance: number
    status: 'present' | 'missing'
  }>
  recommendations: string[]
}

interface AEOResult {
  overallScore: number
  grade: string
  snippetReadiness: { score: number; checks: Array<{ name: string; passed: boolean; details: string }> }
  qaPatterns: { score: number; checks: Array<{ name: string; passed: boolean; details: string }> }
  voiceReadiness: { score: number; checks: Array<{ name: string; passed: boolean; details: string }> }
  recommendations: string[]
}

interface Recommendation {
  id: string
  type: 'high' | 'medium' | 'low'
  title: string
  description: string
}

function classifyRecommendation(text: string): 'high' | 'medium' | 'low' {
  const lower = text.toLowerCase()
  if (
    lower.includes('ajoutez') ||
    lower.includes('incluez') ||
    lower.includes('augmentez') ||
    lower.includes('reduisez') ||
    lower.includes('necessite') ||
    lower.includes('manque')
  ) {
    return 'high'
  }
  if (
    lower.includes('continuez') ||
    lower.includes('ameliorez') ||
    lower.includes('considerez') ||
    lower.includes('incorporez') ||
    lower.includes('structurez')
  ) {
    return 'medium'
  }
  return 'low'
}

export default function ContentOptimizerPage() {
  const { selectedWebsite } = useWebsite()
  const [inputType, setInputType] = useState<'url' | 'text'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [keywordInput, setKeywordInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [semanticResult, setSemanticResult] = useState<SemanticResult | null>(null)
  const [aeoResult, setAeoResult] = useState<AEOResult | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !urlInput) {
      setUrlInput(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  const handleAnalyze = async () => {
    const hasInput = inputType === 'url' ? urlInput : textInput
    if (!hasInput || !keywordInput) return

    setLoading(true)
    setError(null)
    setSemanticResult(null)
    setAeoResult(null)
    setRecommendations([])

    try {
      // Call semantic API
      const semanticBody: Record<string, string> = { keyword: keywordInput }
      if (inputType === 'url') {
        semanticBody.url = urlInput
      } else {
        semanticBody.text = textInput
      }

      const semanticRes = await fetch('/api/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semanticBody),
      })

      if (!semanticRes.ok) {
        const errData = await semanticRes.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errData.error || `Erreur ${semanticRes.status}`)
      }

      const semanticData: SemanticResult = await semanticRes.json()
      setSemanticResult(semanticData)

      // Build recommendations from semantic data
      const allRecs: Recommendation[] = semanticData.recommendations.map((text, i) => ({
        id: `sem-${i}`,
        type: classifyRecommendation(text),
        title: text.split('.')[0] || text,
        description: text,
      }))

      // Also call AEO + Content Suggestions APIs if URL mode
      if (inputType === 'url' && urlInput) {
        // Content suggestions (our new API)
        try {
          const csRes = await fetch('/api/content-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput }),
          })
          if (csRes.ok) {
            const csData = await csRes.json()
            if (csData.success && csData.data?.suggestions) {
              const csRecs: Recommendation[] = csData.data.suggestions.map((s: any, i: number) => ({
                id: `cs-${i}`,
                type: s.priority === 'critical' ? 'high' : s.priority === 'high' ? 'high' : s.priority === 'medium' ? 'medium' : 'low',
                title: s.title,
                description: s.description + (s.impact ? ` (Impact: ${s.impact})` : ''),
              }))
              allRecs.push(...csRecs)
            }
          }
        } catch { /* optional */ }

        try {
          const aeoRes = await fetch('/api/aeo-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlInput }),
          })

          if (aeoRes.ok) {
            const aeoData = await aeoRes.json()
            setAeoResult(aeoData)

            // Add AEO recommendations
            if (aeoData.recommendations) {
              const aeoRecs: Recommendation[] = aeoData.recommendations.map((text: string, i: number) => ({
                id: `aeo-${i}`,
                type: classifyRecommendation(text),
                title: `AEO: ${text.split('.')[0] || text}`,
                description: text,
              }))
              allRecs.push(...aeoRecs)
            }
          }
        } catch {
          // AEO is optional, don't block on failure
        }
      }

      // Sort: high first, then medium, then low
      const priority: Record<string, number> = { high: 0, medium: 1, low: 2 }
      allRecs.sort((a, b) => priority[a.type] - priority[b.type])
      setRecommendations(allRecs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const score = semanticResult?.score ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Optimisation de Contenu</h1>
        <p className="text-white/40 mt-1">
          Analysez et optimisez le contenu de vos pages
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-lg border border-white/5 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium mb-4 text-white/70">Choisissez comment analyser</p>
          <div className="flex gap-4">
            <button
              onClick={() => setInputType('url')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                inputType === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-white/40 hover:bg-gray-200'
              )}
            >
              <FileText className="h-4 w-4" />
              Par URL
            </button>
            <button
              onClick={() => setInputType('text')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                inputType === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-white/40 hover:bg-gray-200'
              )}
            >
              <FileText className="h-4 w-4" />
              Par texte
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Keyword input (always shown) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-white/70">Mot-clé cible</label>
            <input
              type="text"
              placeholder="Ex: optimisation SEO"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full rounded-lg bg-white border border-white/5 px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {inputType === 'url' ? (
            <div>
              <label className="block text-sm font-medium mb-1 text-white/70">URL de la page</label>
              <UrlInput
                value={urlInput}
                onChange={setUrlInput}
                onSubmit={handleAnalyze}
                loading={loading}
                submitLabel="Analyser"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1 text-white/70">Collez votre contenu</label>
              <textarea
                placeholder="Collez le texte de votre page ici..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="w-full rounded-lg bg-white border border-white/5 px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleAnalyze}
                disabled={!textInput || !keywordInput || loading}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Analyser
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Analyse en cours...</span>
        </div>
      )}

      {!loading && semanticResult && (
        <>
          {/* Content Score */}
          <div className="rounded-lg border border-white/5 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 200 200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={score >= 70 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'}
                      strokeWidth="8"
                      strokeDasharray={`${(score / 100) * 565} 565`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={cn(
                        'text-4xl font-bold',
                        score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {score}
                      </p>
                      <p className="text-sm text-white/30">/100</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold mb-6 text-white">Resultats de l&apos;analyse</h2>
                <div className="space-y-4">
                  {/* Keyword density */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/70">Densité du mot-clé</span>
                      <span className="text-blue-600 font-bold">
                        {semanticResult.keywordAnalysis.density}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${Math.min(semanticResult.keywordAnalysis.density * 20, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Word count */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/70">Longueur du contenu</span>
                      <span className="text-white/70 font-bold">
                        {semanticResult.content.wordCount} mots
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          semanticResult.content.wordCount >= 300 ? 'bg-green-500' : 'bg-amber-500'
                        )}
                        style={{
                          width: `${Math.min((semanticResult.content.wordCount / 2000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Readability */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white/70">Lisibilite</span>
                      <span className="text-white/70 font-bold">
                        {semanticResult.content.readingLevel}
                      </span>
                    </div>
                  </div>

                  {/* Keyword placement checks */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      semanticResult.keywordAnalysis.inTitle
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {semanticResult.keywordAnalysis.inTitle ? 'Mot-clé dans le titre' : 'Absent du titre'}
                    </span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      semanticResult.keywordAnalysis.inH1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {semanticResult.keywordAnalysis.inH1 ? 'Mot-clé dans le H1' : 'Absent du H1'}
                    </span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      semanticResult.keywordAnalysis.inMetaDescription
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {semanticResult.keywordAnalysis.inMetaDescription ? 'Dans la meta description' : 'Absent de la meta'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AEO Score (if available) */}
          {aeoResult && (
            <div className="rounded-lg border border-white/5 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-white">Score AEO (Answer Engine Optimization)</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                  <p className="text-2xl font-bold text-blue-600">{aeoResult.overallScore}</p>
                  <p className="text-xs text-white/40 mt-1">Score global</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                  <p className="text-2xl font-bold text-green-600">{aeoResult.snippetReadiness?.score ?? '-'}</p>
                  <p className="text-xs text-white/40 mt-1">Snippets</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                  <p className="text-2xl font-bold text-amber-600">{aeoResult.qaPatterns?.score ?? '-'}</p>
                  <p className="text-xs text-white/40 mt-1">Q&A Patterns</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/[0.02]">
                  <p className="text-2xl font-bold text-purple-600">{aeoResult.voiceReadiness?.score ?? '-'}</p>
                  <p className="text-xs text-white/40 mt-1">Voice Ready</p>
                </div>
              </div>
            </div>
          )}

          {/* Top Terms */}
          {semanticResult.topTerms.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-white">Termes principaux détectés</h2>
              <div className="flex flex-wrap gap-2">
                {semanticResult.topTerms.slice(0, 15).map((term) => (
                  <span
                    key={term.term}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium',
                      term.status === 'present'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-white/40'
                    )}
                  >
                    {term.term}
                    <span className="ml-1 text-xs opacity-70">({term.frequency})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Recommandations</h2>

              {/* High Priority */}
              {recommendations
                .filter((r) => r.type === 'high')
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-red-200 bg-red-50 p-4 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700">{rec.description}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-700 flex-shrink-0">
                        Priorite haute
                      </span>
                    </div>
                  </div>
                ))}

              {/* Medium Priority */}
              {recommendations
                .filter((r) => r.type === 'medium')
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-700">{rec.description}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-amber-200 text-amber-700 flex-shrink-0">
                        Priorite moyenne
                      </span>
                    </div>
                  </div>
                ))}

              {/* Low Priority / Good */}
              {recommendations
                .filter((r) => r.type === 'low')
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-green-700">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
