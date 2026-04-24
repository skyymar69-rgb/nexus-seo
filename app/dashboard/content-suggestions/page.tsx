'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  FileText, Globe, Loader2, AlertCircle, CheckCircle2,
  TrendingUp, Zap, BookOpen, Eye, Code, ArrowRight
} from 'lucide-react'

interface Suggestion {
  category: string
  priority: string
  title: string
  description: string
  currentValue?: string
  recommendedValue?: string
  impact: string
}

interface ContentData {
  url: string
  title: string
  wordCount: number
  readingTime: number
  readabilityScore: number
  headingStructure: { tag: string; text: string }[]
  images: { total: number; withAlt: number; withoutAlt: number }
  links: { internal: number; external: number }
  keywordDensity: { word: string; count: number; density: number }[]
  suggestions: Suggestion[]
  scores: {
    structure: number
    seo: number
    readability: number
    engagement: number
    technical: number
    overall: number
  }
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60 flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-label={`Score ${label}`} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Critique' },
  high: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Important' },
  medium: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Moyen' },
  low: { color: 'bg-white/5 text-white/40 border-white/10', label: 'Faible' },
}

export default function ContentSuggestionsPage() {
  const { selectedWebsite } = useWebsite()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ContentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedWebsite?.domain && !url) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch('/api/content-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (json.success) setData(json.data)
      else setError(json.error || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <FileText className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Suggestions de Contenu</h1>
        </div>
        <p className="text-white/40">Analysez le contenu de vos pages et obtenez des recommandations personnalisées pour améliorer votre SEO.</p>
      </div>

      {/* Input */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://monsite.fr/page"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          <button onClick={handleAnalyze} disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Analyser
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          <span className="ml-3 text-white/40">Analyse du contenu...</span>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Score overview */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Score global : {data.scores.overall}/100</h3>
                <p className="text-xs text-white/40">{data.wordCount} mots · {data.readingTime} min de lecture</p>
              </div>
              <div className={`text-3xl font-black ${data.scores.overall >= 75 ? 'text-emerald-400' : data.scores.overall >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.scores.overall}
              </div>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Structure" score={data.scores.structure} icon={BookOpen} />
              <ScoreBar label="SEO" score={data.scores.seo} icon={TrendingUp} />
              <ScoreBar label="Lisibilité" score={data.scores.readability} icon={Eye} />
              <ScoreBar label="Engagement" score={data.scores.engagement} icon={Zap} />
              <ScoreBar label="Technique" score={data.scores.technical} icon={Code} />
            </div>
          </div>

          {/* Keywords */}
          {data.keywordDensity.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Mots-clés principaux</h3>
              <div className="flex flex-wrap gap-2">
                {data.keywordDensity.slice(0, 10).map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400">
                    {kw.word} <span className="text-white/30">({kw.count}x · {kw.density}%)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">{data.suggestions.length} recommandations</h3>
            </div>
            <div className="divide-y divide-white/5">
              {data.suggestions.map((s, i) => {
                const cfg = priorityConfig[s.priority] || priorityConfig.low
                return (
                  <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                    <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.color}`}>{cfg.label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{s.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{s.description}</p>
                      {s.impact && <p className="text-xs text-brand-400 mt-1">Impact estimé : {s.impact}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Headings structure */}
          {data.headingStructure.length > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Structure des titres</h3>
              <div className="space-y-1">
                {data.headingStructure.slice(0, 15).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs" style={{ paddingLeft: `${(parseInt(h.tag.charAt(1)) - 1) * 16}px` }}>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono">{h.tag.toUpperCase()}</span>
                    <span className="text-white/60 truncate">{h.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-white/10 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Analysez votre contenu</h3>
          <p className="text-sm text-white/40 max-w-md">
            Entrez l&apos;URL d&apos;une page pour obtenir un score de contenu détaillé, la densité de mots-clés, et des recommandations personnalisées.
          </p>
        </div>
      )}
    </div>
  )
}
