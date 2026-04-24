'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'
import {
  Loader2, AlertTriangle, ArrowLeftRight, BarChart3, Globe
} from 'lucide-react'

interface GapTerm {
  term: string
  frequency: number
}

interface GapData {
  domain1: string
  domain2: string
  exclusive1: GapTerm[]
  exclusive2: GapTerm[]
  common: GapTerm[]
}

type TabKey = 'exclusive1' | 'exclusive2' | 'common'

function FrequencyBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/[0.03] rounded-full overflow-hidden" role="progressbar" aria-label="Frequence" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/50">{value}</span>
    </div>
  )
}

function VennDiagram({ data }: { data: GapData }) {
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      <div className="relative">
        {/* Circle 1 */}
        <div className="w-32 h-32 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center relative z-10">
          <div className="text-center pr-4">
            <div className="text-lg font-bold text-blue-700">{data.exclusive1.length}</div>
            <div className="text-[10px] text-blue-600">Exclusifs</div>
          </div>
        </div>
      </div>
      {/* Overlap */}
      <div className="-mx-8 z-20 bg-purple-100 border-2 border-purple-300 rounded-full w-20 h-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">{data.common.length}</div>
          <div className="text-[10px] text-purple-600">Communs</div>
        </div>
      </div>
      <div className="relative">
        {/* Circle 2 */}
        <div className="w-32 h-32 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center relative z-10">
          <div className="text-center pl-4">
            <div className="text-lg font-bold text-amber-700">{data.exclusive2.length}</div>
            <div className="text-[10px] text-amber-600">Exclusifs</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KeywordGapPage() {
  const { selectedWebsite, websites } = useWebsite()
  const [url1, setUrl1] = useState('')
  const [url2, setUrl2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<GapData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('exclusive1')

  // Pre-fill domain 1
  useEffect(() => {
    if (selectedWebsite?.domain && !url1) {
      setUrl1(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  const handleAnalyze = async () => {
    if (!url1.trim() || !url2.trim()) return
    let u1 = url1.trim()
    let u2 = url2.trim()
    if (!u1.startsWith('http')) u1 = 'https://' + u1
    if (!u2.startsWith('http')) u2 = 'https://' + u2

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/keyword-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain1: u1, domain2: u2 }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de l\'analyse')
      }
      setData(await res.json())
      setActiveTab('exclusive1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const TABS: { key: TabKey; label: string; color: string }[] = [
    { key: 'exclusive1', label: 'Exclusifs a votre site', color: 'blue' },
    { key: 'exclusive2', label: 'Exclusifs au concurrent', color: 'amber' },
    { key: 'common', label: 'Termes communs', color: 'purple' },
  ]

  const activeTerms = data ? data[activeTab] : []
  const maxFreq = activeTerms.reduce((max, t) => Math.max(max, t.frequency), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Keyword Gap</h1>
        <p className="text-white/40 mt-1">Comparez les mots-clés entre deux domaines</p>
      </div>

      {/* Input forms */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Votre domaine</label>
          <UrlInput
            value={url1}
            onChange={setUrl1}
            onSubmit={handleAnalyze}
            loading={loading}
            submitLabel=""
            placeholder="https://votre-site.com"
            domain={selectedWebsite?.domain}
            websites={websites}
          />
        </div>

        <div className="flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-white/30" />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">Domaine concurrent</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="url"
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
                placeholder="https://concurrent.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/5 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !url1.trim() || !url2.trim()}
          className="w-full px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Comparer les mots-clés
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Comparaison en cours...</span>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* Venn Diagram */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <VennDiagram data={data} />
            <div className="flex items-center justify-center gap-6 text-xs text-white/40 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-200" /> {data.domain1}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-200" /> {data.domain2}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex border-b border-white/5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? `border-${tab.color}-600 text-${tab.color}-700 bg-${tab.color}-50/50`
                      : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs font-normal text-white/30">
                    ({data[tab.key].length})
                  </span>
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 font-medium text-white/40">Terme</th>
                    <th className="text-center px-4 py-3 font-medium text-white/40">Frequence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTerms.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-white/30 text-sm">
                        Aucun terme dans cette categorie
                      </td>
                    </tr>
                  ) : (
                    activeTerms.map((term, i) => (
                      <tr key={i} className="hover:bg-white/[0.03]/50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-white">{term.term}</td>
                        <td className="px-4 py-2.5">
                          <FrequencyBar value={term.frequency} max={maxFreq} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
