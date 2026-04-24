'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Globe, Loader2, ArrowRight, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react'

interface SiteMetrics {
  url: string; title: string; description: string; score: number; loadTime: number
  htmlSize: number; wordCount: number; h1Count: number; h2Count: number
  imageCount: number; imagesWithoutAlt: number; internalLinks: number; externalLinks: number
  hasSSL: boolean; hasViewport: boolean; hasStructuredData: boolean; hasOpenGraph: boolean
  scripts: number; stylesheets: number; metaDescLength: number; titleLength: number
}

function MetricRow({ label, v1, v2, better }: { label: string; v1: string | number; v2: string | number; better?: 'higher' | 'lower' | 'boolean' }) {
  let w1 = false, w2 = false
  if (better === 'higher') { w1 = Number(v1) > Number(v2); w2 = Number(v2) > Number(v1) }
  else if (better === 'lower') { w1 = Number(v1) < Number(v2); w2 = Number(v2) < Number(v1) }
  else if (better === 'boolean') { w1 = v1 === 'Oui'; w2 = v2 === 'Oui' }

  return (
    <tr className="border-b border-white/5">
      <td className="py-3 px-4 text-sm font-medium text-white/70">{label}</td>
      <td className={cn('py-3 px-4 text-sm text-center font-semibold', w1 ? 'text-green-600' : 'text-white/50')}>{v1}</td>
      <td className={cn('py-3 px-4 text-sm text-center font-semibold', w2 ? 'text-green-600' : 'text-white/50')}>{v2}</td>
    </tr>
  )
}

export default function ComparePage() {
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ site1: SiteMetrics; site2: SiteMetrics; insights: string[]; winner: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async () => {
    if (!url1 || !url2) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url1, url2 }),
      })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.error || 'Erreur')
    } catch { setError('Erreur de connexion') }
    finally { setLoading(false) }
  }

  const b = (v: boolean) => v ? 'Oui' : 'Non'

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Comparaison de sites</h1>
          <p className="text-sm text-white/40">Comparez deux sites cote a cote</p>
        </div>
      </div>

      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/70 mb-1">Site 1</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <Globe className="w-4 h-4 text-white/30" />
              <input type="text" value={url1} onChange={e => setUrl1(e.target.value)} placeholder="https://www.site1.fr" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5">
            <span className="text-white/30 font-bold text-sm">VS</span>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/70 mb-1">Site 2</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <Globe className="w-4 h-4 text-white/30" />
              <input type="text" value={url2} onChange={e => setUrl2(e.target.value)} placeholder="https://www.site2.fr" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </div>
          <button onClick={handleCompare} disabled={loading || !url1 || !url2} className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Comparer</>}
          </button>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>}

      {result && (
        <>
          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="bg-brand-500/10 rounded-xl border border-brand-500/20 p-5">
              <h3 className="text-sm font-bold text-brand-400 mb-3">Insights</h3>
              <ul className="space-y-2">
                {result.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[result.site1, result.site2].map((site, i) => (
              <div key={i} className={cn('bg-white/[0.03] rounded-xl border p-6 text-center', result.winner === `site${i + 1}` ? 'border-green-400 dark:border-green-600 ring-1 ring-green-400/30' : 'border-white/5')}>
                {result.winner === `site${i + 1}` && <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full mb-2">Meilleur</span>}
                <p className="text-sm text-white/40 truncate mb-2">{new URL(site.url).hostname}</p>
                <p className={cn('text-5xl font-black', site.score >= 80 ? 'text-green-600' : site.score >= 60 ? 'text-amber-500' : 'text-red-500')}>{site.score}</p>
                <p className="text-xs text-white/30 mt-1">/100</p>
              </div>
            ))}
          </div>

          {/* Detailed comparison table */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="py-3 px-4 text-left text-xs font-bold text-white/40 uppercase">Metrique</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-white/40 uppercase truncate">{new URL(result.site1.url).hostname}</th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-white/40 uppercase truncate">{new URL(result.site2.url).hostname}</th>
                </tr>
              </thead>
              <tbody>
                <MetricRow label="Score SEO" v1={result.site1.score} v2={result.site2.score} better="higher" />
                <MetricRow label="Temps de chargement" v1={`${result.site1.loadTime}ms`} v2={`${result.site2.loadTime}ms`} better="lower" />
                <MetricRow label="Taille HTML" v1={`${Math.round(result.site1.htmlSize / 1024)}KB`} v2={`${Math.round(result.site2.htmlSize / 1024)}KB`} better="lower" />
                <MetricRow label="Nombre de mots" v1={result.site1.wordCount} v2={result.site2.wordCount} better="higher" />
                <MetricRow label="Balises H1" v1={result.site1.h1Count} v2={result.site2.h1Count} />
                <MetricRow label="Balises H2" v1={result.site1.h2Count} v2={result.site2.h2Count} better="higher" />
                <MetricRow label="Images" v1={result.site1.imageCount} v2={result.site2.imageCount} />
                <MetricRow label="Images sans alt" v1={result.site1.imagesWithoutAlt} v2={result.site2.imagesWithoutAlt} better="lower" />
                <MetricRow label="Liens internes" v1={result.site1.internalLinks} v2={result.site2.internalLinks} better="higher" />
                <MetricRow label="Liens externes" v1={result.site1.externalLinks} v2={result.site2.externalLinks} />
                <MetricRow label="Scripts JS" v1={result.site1.scripts} v2={result.site2.scripts} better="lower" />
                <MetricRow label="Feuilles CSS" v1={result.site1.stylesheets} v2={result.site2.stylesheets} better="lower" />
                <MetricRow label="HTTPS" v1={b(result.site1.hasSSL)} v2={b(result.site2.hasSSL)} better="boolean" />
                <MetricRow label="Viewport mobile" v1={b(result.site1.hasViewport)} v2={b(result.site2.hasViewport)} better="boolean" />
                <MetricRow label="Données structurées" v1={b(result.site1.hasStructuredData)} v2={b(result.site2.hasStructuredData)} better="boolean" />
                <MetricRow label="Open Graph" v1={b(result.site1.hasOpenGraph)} v2={b(result.site2.hasOpenGraph)} better="boolean" />
                <MetricRow label="Titre" v1={`${result.site1.titleLength} car.`} v2={`${result.site2.titleLength} car.`} />
                <MetricRow label="Meta description" v1={`${result.site1.metaDescLength} car.`} v2={`${result.site2.metaDescLength} car.`} />
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
