'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FileText, Loader2, Search, Globe, CheckCircle, XCircle, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'

interface AnalysisResult {
  url: string
  geoScore: number
  eeat: { total: number; experience: { score: number }; expertise: { score: number }; authority: { score: number }; trust: { score: number } }
  schema: { score: number; found: Array<{ type: string; valid: boolean }>; missing: string[] }
  faq: { detected: boolean; questionsFound: number; hasSchema: boolean; score: number }
  recommendations: string[]
  wordCount: number
}

export default function ContentAnalyzerPage() {
  const { selectedWebsite } = useWebsite()
  const [url, setUrl] = useState(selectedWebsite ? `https://${selectedWebsite.domain}` : '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/geo-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.error || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const ScoreRing = ({ score, label, size = 80 }: { score: number; label: string; size?: number }) => {
    const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
    const r = (size - 8) / 2
    const c = 2 * Math.PI * r
    const offset = c - (score / 100) * c
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-200 dark:text-surface-700" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <span className="text-2xl font-black mt-[-55px] mb-[25px]" style={{ color }}>{score}</span>
        <span className="text-xs text-surface-500 mt-1">{label}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Content Analyzer IA</h1>
          <p className="text-sm text-surface-500">Analysez votre contenu pour la citabilite par les LLMs</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
            <Globe className="w-4 h-4 text-surface-400" />
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://votresite.fr/page" aria-label="URL de la page a analyser" className="flex-1 bg-transparent outline-none text-sm" onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Analyser</>}
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">{error}</div>}

      {result && (
        <>
          {/* Scores overview */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-6 text-center">Score de citabilite IA</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <ScoreRing score={result.geoScore} label="GEO Global" />
              <ScoreRing score={result.eeat.total} label="E-E-A-T" />
              <ScoreRing score={result.schema.score} label="Schema" />
              <ScoreRing score={result.faq.score} label="FAQ" />
            </div>
          </div>

          {/* E-E-A-T breakdown */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-4">E-E-A-T Détaillé</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Expérience', score: result.eeat.experience.score, desc: 'Témoignages, cas clients, portfolio' },
                { label: 'Expertise', score: result.eeat.expertise.score, desc: 'Blog, schema Author, contenu expert' },
                { label: 'Autorité', score: result.eeat.authority.score, desc: 'Réseaux sociaux, presse, citations' },
                { label: 'Confiance', score: result.eeat.trust.score, desc: 'HTTPS, mentions légales, contact' },
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white/70">{item.label}</span>
                    <span className={cn('text-lg font-black', item.score >= 60 ? 'text-green-600' : item.score >= 40 ? 'text-amber-500' : 'text-red-500')}>{item.score}</span>
                  </div>
                  <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5 mb-2" role="progressbar" aria-label={item.label} aria-valuenow={item.score} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn('h-1.5 rounded-full', item.score >= 60 ? 'bg-green-500' : item.score >= 40 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${item.score}%` }} />
                  </div>
                  <p className="text-[10px] text-surface-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Schema + FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
              <h3 className="font-bold text-white mb-3">Schémas détectés</h3>
              {result.schema.found.length > 0 ? (
                <div className="space-y-2">
                  {result.schema.found.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {s.valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      <span className="text-white/70">{s.type}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-surface-500">Aucun schéma détecté</p>}
              {result.schema.missing.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <p className="text-xs font-bold text-amber-700 mb-1">Manquants :</p>
                  <p className="text-xs text-amber-600">{result.schema.missing.join(', ')}</p>
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
              <h3 className="font-bold text-white mb-3">FAQ</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {result.faq.detected ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-white/70">{result.faq.detected ? `${result.faq.questionsFound} questions détectées` : 'Aucune FAQ détectée'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.faq.hasSchema ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-white/70">{result.faq.hasSchema ? 'Schema FAQPage présent' : 'Schema FAQPage manquant'}</span>
                </div>
                <p className="text-xs text-surface-500">{result.wordCount} mots sur la page</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-brand-50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-800 p-6">
              <h3 className="font-bold text-brand-800 dark:text-brand-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Recommandations pour etre cite par les LLMs
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-brand-700 dark:text-brand-400">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
