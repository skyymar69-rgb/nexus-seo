'use client'

import { useState, useMemo } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  Search, Loader2, AlertTriangle, Filter, Plus, Sparkles,
  BookOpen, ShoppingCart, Zap, Navigation
} from 'lucide-react'

interface KeywordResult {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
  intent: 'informational' | 'transactional' | 'commercial' | 'navigational'
}

const INTENT_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  informational: { label: 'Info', color: 'bg-blue-50 text-blue-700', icon: BookOpen },
  transactional: { label: 'Transaction', color: 'bg-emerald-50 text-emerald-700', icon: Zap },
  commercial: { label: 'Commercial', color: 'bg-purple-50 text-purple-700', icon: ShoppingCart },
  navigational: { label: 'Navigation', color: 'bg-amber-50 text-amber-700', icon: Navigation },
}

function DifficultyBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-red-500' : value >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/[0.03] rounded-full overflow-hidden" role="progressbar" aria-label="Difficulte" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-white/50">{value}</span>
    </div>
  )
}

export default function KeywordMagicPage() {
  const { selectedWebsite } = useWebsite()
  const [seed, setSeed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<KeywordResult[]>([])
  const [intentFilter, setIntentFilter] = useState<string>('all')
  const [tracked, setTracked] = useState<Set<string>>(new Set())

  const handleSearch = async () => {
    if (!seed.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/keywords/research?keyword=${encodeURIComponent(seed.trim())}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de la recherche')
      }
      const data = await res.json()
      setResults(data.keywords || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleTrack = async (keyword: string) => {
    if (!selectedWebsite) return
    try {
      await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, websiteId: selectedWebsite.id }),
      })
      setTracked(prev => new Set(prev).add(keyword))
    } catch {
      // silently fail
    }
  }

  const filtered = useMemo(() => {
    if (intentFilter === 'all') return results
    return results.filter(r => r.intent === intentFilter)
  }, [results, intentFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Keyword Magic Tool</h1>
        <p className="text-white/40 mt-1">Recherche de mots-clés à partir d'un terme initial</p>
      </div>

      {/* Search input */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
              placeholder="Entrez un mot-clé (ex: référencement naturel)"
              aria-label="Mot-clé à rechercher"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !seed.trim()}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Rechercher</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Recherche en cours...</span>
        </div>
      )}

      {results.length > 0 && !loading && (
        <>
          {/* AI badge + intent filter */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Estimation IA — données simulées
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-white/30" />
              {['all', 'informational', 'transactional', 'commercial', 'navigational'].map((intent) => (
                <button
                  key={intent}
                  onClick={() => setIntentFilter(intent)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    intentFilter === intent
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.05]'
                  }`}
                >
                  {intent === 'all' ? 'Tous' : INTENT_CONFIG[intent]?.label || intent}
                </button>
              ))}
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 font-medium text-white/40">Mot-clé</th>
                    <th className="text-center px-3 py-3 font-medium text-white/40">Volume</th>
                    <th className="text-center px-3 py-3 font-medium text-white/40">Difficulte</th>
                    <th className="text-center px-3 py-3 font-medium text-white/40">CPC</th>
                    <th className="text-center px-3 py-3 font-medium text-white/40">Intention</th>
                    <th className="text-center px-3 py-3 font-medium text-white/40">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((kw, i) => {
                    const intentCfg = INTENT_CONFIG[kw.intent] || INTENT_CONFIG.informational
                    const IntentIcon = intentCfg.icon
                    return (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-2.5 font-medium text-white">{kw.keyword}</td>
                        <td className="px-3 py-2.5 text-center text-white/50">
                          {kw.volume.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <DifficultyBar value={kw.difficulty} />
                        </td>
                        <td className="px-3 py-2.5 text-center text-white/50">
                          {kw.cpc.toFixed(2)} &euro;
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${intentCfg.color}`}>
                            <IntentIcon className="w-3 h-3" />
                            {intentCfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {tracked.has(kw.keyword) ? (
                            <span className="text-xs text-emerald-600 font-medium">Suivi</span>
                          ) : (
                            <button
                              onClick={() => handleTrack(kw.keyword)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              Ajouter au suivi
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-white/30 text-sm">
                Aucun résultat pour ce filtre d'intention
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
