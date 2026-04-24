'use client'

import { useState, useRef, useEffect } from 'react'
import { cn, formatNumber } from '@/lib/utils'
import {
  BarChart3,
  BookOpen,
  Cloud,
  Copy,
  FileText,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Activity,
  Zap,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'

interface TFIDFTerm {
  term: string
  frequency: number
  density: number
  relevance: number
  isMissing: boolean
}

interface ContentStats {
  wordCount: number
  paragraphCount: number
  sentenceCount: number
  avgSentenceLength: number
  readingLevel: string
  h1Count: number
  h2Count: number
  h3Count: number
}

interface SemanticResult {
  score: number
  tfidfTerms: TFIDFTerm[]
  contentStats: ContentStats
  relatedKeywords: Array<{ keyword: string; score: number; cluster: string }>
  competitors: Array<{
    rank: number
    url: string
    wordCount: number
    score: number
    keyTerms: string[]
  }>
  recommendations: string[]
  keywordDensity: { keyword: string; density: number }[]
}

export default function SemanticAnalysisPage() {
  const { selectedWebsite } = useWebsite()
  const [mode, setMode] = useState<'url' | 'text'>('url')
  const [inputValue, setInputValue] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SemanticResult | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !inputValue && mode === 'url') {
      const domain = selectedWebsite.domain
      setInputValue(domain.startsWith('http') ? domain : `https://${domain}`)
    }
  }, [selectedWebsite])

  // Map API response to component state
  function mapApiResponse(data: any): SemanticResult {
    const topTerms: TFIDFTerm[] = (data.topTerms || []).map((t: any) => ({
      term: t.term,
      frequency: t.frequency,
      density: t.density,
      relevance: t.relevance,
      isMissing: t.status === 'missing',
    }))

    const content = data.content || {}
    const headings = content.headings || {}

    const contentStats: ContentStats = {
      wordCount: content.wordCount || 0,
      paragraphCount: content.paragraphCount || 0,
      sentenceCount: content.sentenceCount || 0,
      avgSentenceLength: content.avgSentenceLength || 0,
      readingLevel: content.readingLevel || '-',
      h1Count: headings.h1 || 0,
      h2Count: headings.h2 || 0,
      h3Count: headings.h3 || 0,
    }

    const clusters: Array<{ name: string; terms: string[] }> = data.semanticClusters || []
    const relatedKeywords = clusters.flatMap((c: any) =>
      c.terms.map((term: string, idx: number) => ({
        keyword: term,
        score: Math.max(0.5, 1 - idx * 0.05),
        cluster: c.name,
      }))
    )

    const competitors = (data.competitors || []).map((c: any) => ({
      rank: c.rank,
      url: c.url,
      wordCount: c.wordCount,
      score: c.score,
      keyTerms: c.terms || [],
    }))

    // Build keyword density from top terms (top 4-5 most frequent)
    const keywordDensity = topTerms
      .filter((t: TFIDFTerm) => !t.isMissing)
      .slice(0, 5)
      .map((t: TFIDFTerm) => ({ keyword: t.term, density: t.density }))

    return {
      score: data.score || 0,
      tfidfTerms: topTerms,
      contentStats,
      relatedKeywords,
      competitors,
      recommendations: data.recommendations || [],
      keywordDensity,
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')

    if (!inputValue.trim() || !keyword.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(mode === 'url' ? { url: inputValue } : { text: inputValue }),
          keyword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`)
      }

      setResult(mapApiResponse(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse sémantique')
    } finally {
      setLoading(false)
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-surface-900 dark:text-surface-50">
            Analyse Sémantique
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400">
            Analysez votre contenu et comparez-le aux résultats des concurrents
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-4">
              {['url', 'text'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m as 'url' | 'text')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    mode === m
                      ? 'bg-brand-600 text-white dark:bg-brand-500'
                      : 'bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-300 dark:hover:bg-surface-700'
                  )}
                >
                  {m === 'url' ? <FileText size={18} /> : <BookOpen size={18} />}
                  {m === 'url' ? 'URL' : 'Texte'}
                </button>
              ))}
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  {mode === 'url' ? 'URL à analyser' : 'Contenu'}
                </label>
                {mode === 'url' ? (
                  <UrlInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={() => { if (inputValue.trim() && keyword.trim()) handleSubmit() }}
                    loading={loading}
                    submitLabel="Analyser le contenu"
                  />
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Collez votre contenu ici..."
                    className={cn(
                      'w-full px-4 py-3 rounded-lg border-2 border-surface-300 dark:border-surface-700',
                      'bg-white/[0.03] text-white',
                      'focus:outline-none focus:border-brand-500 dark:focus:border-brand-400',
                      'min-h-28 resize-none font-mono'
                    )}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Mot-clé cible
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: marketing digital"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border-2 border-surface-300 dark:border-surface-700',
                    'bg-white/[0.03] text-white',
                    'focus:outline-none focus:border-brand-500 dark:focus:border-brand-400'
                  )}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Submit Button (only for text mode, URL mode has button in UrlInput) */}
            {mode === 'text' && (
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all',
                  loading
                    ? 'bg-surface-300 dark:bg-surface-700 text-surface-500 dark:text-surface-400 cursor-not-allowed'
                    : 'bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Analyser le contenu
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-8">
            {/* Semantic Score */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6">
                Score Sémantique
              </h2>
              <div className="flex items-center justify-center">
                <ScoreCircle score={result.score} />
              </div>
              <p className="text-center text-surface-600 dark:text-surface-400 mt-6">
                Votre contenu correspond bien au mot-clé cible. Améliorez la densité et la profondeur pour atteindre 85+.
              </p>
            </div>

            {/* Content Stats */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6">
                Analyse de Structure
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Mots" value={formatNumber(result.contentStats.wordCount)} icon={<Activity size={20} />} />
                <StatCard label="Paragraphes" value={result.contentStats.paragraphCount} icon={<BookOpen size={20} />} />
                <StatCard label="Phrases" value={result.contentStats.sentenceCount} icon={<BarChart3 size={20} />} />
                <StatCard
                  label="Moy. phrase"
                  value={result.contentStats.avgSentenceLength.toFixed(1)}
                  icon={<TrendingUp size={20} />}
                />
                <StatCard label="H1" value={result.contentStats.h1Count} highlight="bg-brand-100 dark:bg-brand-900/30" />
                <StatCard label="H2" value={result.contentStats.h2Count} highlight="bg-accent-100 dark:bg-accent-900/30" />
                <StatCard label="H3" value={result.contentStats.h3Count} highlight="bg-brand-100 dark:bg-brand-900/30" />
                <StatCard label="Lisibilité" value={result.contentStats.readingLevel} />
              </div>
            </div>

            {/* Keyword Density */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6">
                Densité des Mots-clés
              </h2>
              <div className="space-y-4">
                {result.keywordDensity.map((item) => (
                  <div key={item.keyword}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-surface-900 dark:text-surface-50">{item.keyword}</span>
                      <span className="text-brand-600 dark:text-brand-400 font-semibold">{item.density.toFixed(2)}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
                        style={{ width: `${Math.min(item.density * 25, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TF-IDF Analysis */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6">
                Analyse TF-IDF (Top 20 termes)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-300 dark:border-surface-700">
                      <th className="text-left py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Terme
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Fréquence
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Densité (%)
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Pertinence
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.tfidfTerms.map((term, idx) => (
                      <tr
                        key={idx}
                        className={cn(
                          'border-b border-surface-200 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800 transition',
                          term.isMissing && 'bg-red-50 dark:bg-red-950/20'
                        )}
                      >
                        <td className="py-3 px-4 font-medium text-surface-900 dark:text-surface-50">
                          {term.term}
                        </td>
                        <td className="py-3 px-4 text-center text-surface-600 dark:text-surface-400">
                          {term.frequency}
                        </td>
                        <td className="py-3 px-4 text-center text-surface-600 dark:text-surface-400">
                          {term.density.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500"
                                style={{ width: `${term.relevance * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-surface-600 dark:text-surface-400">
                              {(term.relevance * 100).toFixed(0)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {term.isMissing ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs font-semibold">
                              <AlertCircle size={14} />
                              Manquant
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                              <CheckCircle2 size={14} />
                              Présent
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Semantic Related Keywords */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6 flex items-center gap-2">
                <Cloud size={24} />
                Champ Sémantique
              </h2>
              <div className="space-y-4">
                {Array.from(new Set(result.relatedKeywords.map((k) => k.cluster))).map((cluster) => (
                  <div key={cluster}>
                    <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-3 text-sm">
                      {cluster}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {result.relatedKeywords
                        .filter((k) => k.cluster === cluster)
                        .map((kw) => (
                          <div
                            key={kw.keyword}
                            className="px-3 py-2 bg-brand-100 dark:bg-brand-900/40 text-brand-800 dark:text-brand-200 rounded-lg text-sm font-medium hover:bg-brand-200 dark:hover:bg-brand-900/60 transition cursor-pointer flex items-center gap-2"
                          >
                            {kw.keyword}
                            <span className="text-xs opacity-75">({(kw.score * 100).toFixed(0)}%)</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6">
                Comparaison avec les Concurrents
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-300 dark:border-surface-700">
                      <th className="text-left py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Rang
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        URL
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Mots
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Score
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-700 dark:text-surface-300">
                        Termes clés
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.competitors.map((comp) => (
                      <tr key={comp.rank} className="border-b border-surface-200 dark:border-surface-800 hover:bg-surface-200 dark:hover:bg-surface-800">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-500 text-white text-xs font-bold rounded-full">
                            {comp.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-surface-900 dark:text-surface-50 font-medium">{comp.url}</td>
                        <td className="py-3 px-4 text-center text-surface-600 dark:text-surface-400">
                          {formatNumber(comp.wordCount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded font-semibold text-xs">
                            {comp.score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {comp.keyTerms.map((t) => (
                              <span key={t} className="px-2 py-0.5 bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded text-xs">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-800 p-8">
              <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-6 flex items-center gap-2">
                <Lightbulb size={24} className="text-yellow-500" />
                Recommandations
              </h2>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded"
                  >
                    <CheckCircle2 size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-surface-800 dark:text-surface-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color =
    score >= 80
      ? '#10b981'
      : score >= 60
        ? '#f59e0b'
        : '#ef4444'

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-300 dark:text-surface-700"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-surface-900 dark:text-surface-50">{score}</span>
        <span className="text-xs text-surface-600 dark:text-surface-400">/100</span>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  highlight?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-surface-200 dark:border-surface-700 p-4 text-center',
        highlight || 'bg-surface-200 dark:bg-surface-800'
      )}
    >
      {icon && <div className="flex justify-center mb-2 text-surface-600 dark:text-surface-400">{icon}</div>}
      <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{value}</p>
      <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">{label}</p>
    </div>
  )
}
