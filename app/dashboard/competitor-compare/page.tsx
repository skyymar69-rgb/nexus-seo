'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  Globe, Loader2, AlertCircle, Trophy, Plus, X, Zap,
  Shield, FileText, TrendingUp, ArrowRight
} from 'lucide-react'

interface SiteMetrics {
  url: string
  domain: string
  title: string
  loadTime: number
  wordCount: number
  h1Count: number
  h2Count: number
  imageCount: number
  imagesWithAlt: number
  internalLinks: number
  externalLinks: number
  structuredDataCount: number
  hasOpenGraph: boolean
  hasCanonical: boolean
  hasViewport: boolean
  techScore: number
  contentScore: number
  seoScore: number
}

interface CompareResult {
  sites: SiteMetrics[]
  rankings: Record<string, Record<string, number>>
  winner: { domain: string; overall: number }
  overallScores: { domain: string; overall: number }[]
}

function ScoreCard({ site, isWinner, rank }: { site: SiteMetrics; isWinner: boolean; rank: number }) {
  const overall = Math.round((site.techScore + site.contentScore + site.seoScore) / 3)
  const color = overall >= 75 ? 'text-emerald-400' : overall >= 50 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className={`rounded-xl border p-5 ${isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-white/[0.03]'}`}>
      {isWinner && (
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase">Meilleur score</span>
        </div>
      )}
      <p className="text-sm text-white/50 truncate mb-1">{site.domain}</p>
      <div className={`text-4xl font-black ${color}`}>{overall}</div>
      <p className="text-xs text-white/30 mt-1">/100 — #{rank}</p>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/40 flex items-center gap-1"><Shield className="w-3 h-3" /> Technique</span>
          <span className="text-white font-medium">{site.techScore}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/40 flex items-center gap-1"><FileText className="w-3 h-3" /> Contenu</span>
          <span className="text-white font-medium">{site.contentScore}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/40 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> SEO</span>
          <span className="text-white font-medium">{site.seoScore}</span>
        </div>
      </div>
    </div>
  )
}

export default function CompetitorComparePage() {
  const { selectedWebsite } = useWebsite()
  const [urls, setUrls] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedWebsite?.domain && !urls[0]) {
      setUrls(prev => [`https://${selectedWebsite.domain}`, ...prev.slice(1)])
    }
  }, [selectedWebsite])

  const addUrl = () => { if (urls.length < 5) setUrls([...urls, '']) }
  const removeUrl = (i: number) => { if (urls.length > 2) setUrls(urls.filter((_, idx) => idx !== i)) }
  const updateUrl = (i: number, val: string) => setUrls(urls.map((u, idx) => idx === i ? val : u))

  const handleCompare = async () => {
    const validUrls = urls.filter(u => u.trim()).map(u => u.trim().startsWith('http') ? u.trim() : `https://${u.trim()}`)
    if (validUrls.length < 2) { setError('Entrez au moins 2 URLs'); return }

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/competitor-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      })
      const data = await res.json()
      if (data.success) setResult(data.data)
      else setError(data.error || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Trophy className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Comparaison Concurrents</h1>
        </div>
        <p className="text-white/40">Comparez jusqu&apos;à 5 sites côte à côte : technique, contenu, SEO.</p>
      </div>

      {/* URL inputs */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6 space-y-3">
        {urls.map((url, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs text-white/30 w-6">{i === 0 ? 'Vous' : `#${i + 1}`}</span>
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text" value={url} onChange={(e) => updateUrl(i, e.target.value)}
                placeholder={i === 0 ? 'Votre site' : 'Concurrent'}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
            {urls.length > 2 && (
              <button onClick={() => removeUrl(i)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          {urls.length < 5 && (
            <button onClick={addUrl} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Ajouter un concurrent
            </button>
          )}
          <div className="flex-1" />
          <button onClick={handleCompare} disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Comparer
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
          <span className="ml-3 text-white/40">Analyse des {urls.filter(u => u.trim()).length} sites en cours...</span>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Score cards */}
          <div className={`grid gap-4 ${result.sites.length <= 3 ? `grid-cols-1 md:grid-cols-${result.sites.length}` : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {result.overallScores.map((s, i) => {
              const site = result.sites.find(site => site.domain === s.domain)
              if (!site) return null
              return <ScoreCard key={s.domain} site={site} isWinner={i === 0} rank={i + 1} />
            })}
          </div>

          {/* Detail table */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-left text-xs font-bold text-white/40 uppercase">Métrique</th>
                  {result.sites.map(s => (
                    <th key={s.domain} className="px-4 py-3 text-center text-xs font-bold text-white/60 truncate max-w-[150px]">{s.domain}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { label: 'Score Technique', key: 'techScore', better: 'higher' },
                  { label: 'Score Contenu', key: 'contentScore', better: 'higher' },
                  { label: 'Score SEO', key: 'seoScore', better: 'higher' },
                  { label: 'Temps chargement', key: 'loadTime', better: 'lower', suffix: 'ms' },
                  { label: 'Mots', key: 'wordCount', better: 'higher' },
                  { label: 'H1', key: 'h1Count', better: 'exact1' },
                  { label: 'H2', key: 'h2Count', better: 'higher' },
                  { label: 'Images', key: 'imageCount', better: 'higher' },
                  { label: 'Liens internes', key: 'internalLinks', better: 'higher' },
                  { label: 'Données struct.', key: 'structuredDataCount', better: 'higher' },
                ].map(({ label, key, better, suffix }) => {
                  const values = result.sites.map(s => (s as any)[key] as number)
                  const best = better === 'lower' ? Math.min(...values) : Math.max(...values)
                  return (
                    <tr key={key}>
                      <td className="px-4 py-2.5 text-sm text-white/50">{label}</td>
                      {result.sites.map(s => {
                        const val = (s as any)[key] as number
                        const isBest = better === 'lower' ? val === best && val > 0 : val === best && val > 0
                        return (
                          <td key={s.domain} className={`px-4 py-2.5 text-sm text-center font-medium ${isBest ? 'text-emerald-400' : 'text-white/60'}`}>
                            {val}{suffix || ''}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="w-12 h-12 text-white/10 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Comparez vos concurrents</h3>
          <p className="text-sm text-white/40 max-w-md">
            Entrez votre site et ceux de vos concurrents pour obtenir une comparaison détaillée : scores techniques, contenu, SEO, performance.
          </p>
        </div>
      )}
    </div>
  )
}
