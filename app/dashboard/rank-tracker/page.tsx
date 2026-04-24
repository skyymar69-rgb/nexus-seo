'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface KeywordWithTracking {
  id: string
  term: string
  volume: number | null
  difficulty: number | null
  cpc: number | null
  intent: string | null
  language: string
  createdAt: string
  latestTracking: {
    position: number | null
    previousPosition: number | null
    url: string | null
    date: string
  } | null
}

interface HistoryEntry {
  date: string
  position: number
}

export default function RankTrackerPage() {
  const { selectedWebsite } = useWebsite()
  const [keywords, setKeywords] = useState<KeywordWithTracking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!selectedWebsite) {
      setKeywords([])
      setSelectedKeywordId(null)
      return
    }

    const fetchKeywords = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/keywords?websiteId=${selectedWebsite.id}`
        )
        if (!res.ok) throw new Error('Erreur lors du chargement des mots-cles')
        const json = await res.json()
        setKeywords(json)
        // Auto-select first keyword
        if (json.length > 0) {
          setSelectedKeywordId(json[0].id)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchKeywords()
  }, [selectedWebsite])

  // Fetch history for selected keyword
  useEffect(() => {
    if (!selectedKeywordId || !selectedWebsite) {
      setHistory([])
      return
    }

    const fetchHistory = async () => {
      setHistoryLoading(true)
      try {
        const res = await fetch(
          `/api/keywords?websiteId=${selectedWebsite.id}`
        )
        if (!res.ok) return
        // We already have the latest position from the main fetch.
        // For full history we query all tracking entries for this keyword via
        // a dedicated endpoint. Since there is no dedicated history endpoint yet,
        // we build a minimal history from the data we have.
        const kw = keywords.find((k) => k.id === selectedKeywordId)
        if (kw?.latestTracking?.position != null) {
          const entries: HistoryEntry[] = []
          // Show the latest tracking point we have
          entries.push({
            date: kw.latestTracking.date
              ? new Date(kw.latestTracking.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })
              : 'Maintenant',
            position: kw.latestTracking.position,
          })
          // If we have a previous position, show it as an earlier point
          if (kw.latestTracking.previousPosition != null) {
            entries.unshift({
              date: 'Precedent',
              position: kw.latestTracking.previousPosition,
            })
          }
          setHistory(entries)
        } else {
          setHistory([])
        }
      } catch {
        setHistory([])
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchHistory()
  }, [selectedKeywordId, selectedWebsite, keywords])

  // No website selected
  if (!selectedWebsite) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Aucun site sélectionné
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Sélectionnez un site web pour suivre vos positions.
          </p>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-white/50">
          Chargement des mots-cles...
        </span>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-white">Erreur</h2>
          <p className="mt-1 text-sm text-white/40">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (keywords.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Aucun mot-cle suivi
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/40">
            Ajoutez des mots-cles dans la section Mots-cles pour commencer le
            suivi.
          </p>
        </div>
      </div>
    )
  }

  const selectedKeyword = keywords.find((k) => k.id === selectedKeywordId)

  return (
    <div className="min-h-screen bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.03] px-8 py-6">
        <h1 className="text-2xl font-bold text-white">
          Suivi des positions
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Suivez le classement de vos mots-cles pour{' '}
          <span className="font-medium text-white/70">
            {selectedWebsite.domain}
          </span>
        </p>
      </div>

      <div className="p-8">
        {/* Position history chart */}
        {selectedKeyword && history.length > 0 && (
          <div className="mb-8 rounded-lg border border-white/5 bg-white/[0.03] p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-white">
              Historique de position :{' '}
              <span className="text-blue-600">{selectedKeyword.term}</span>
            </h2>
            {historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis reversed domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="position"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    name="Position"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Keywords table */}
        <div className="rounded-lg border border-white/5 bg-white/[0.03] shadow-sm">
          <div className="border-b border-white/5 px-6 py-4">
            <h2 className="text-base font-semibold text-white">
              {keywords.length} mot{keywords.length > 1 ? 's' : ''}-cle
              {keywords.length > 1 ? 's' : ''} suivi
              {keywords.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/50">
                    Mot-cle
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white/50">
                    Position
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white/50">
                    Precedente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white/50">
                    Variation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/50">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/50">
                    Difficulte
                  </th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => {
                  const pos = kw.latestTracking?.position
                  const prev = kw.latestTracking?.previousPosition
                  const change =
                    pos != null && prev != null ? prev - pos : null
                  const isSelected = kw.id === selectedKeywordId

                  return (
                    <tr
                      key={kw.id}
                      onClick={() => setSelectedKeywordId(kw.id)}
                      className={`cursor-pointer border-b border-white/5 transition-colors ${
                        isSelected
                          ? 'bg-blue-50'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-medium text-white">
                          {kw.term}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {pos != null ? (
                          <span className="inline-flex items-center rounded-full bg-white/[0.03] px-2.5 py-0.5 text-sm font-bold text-white">
                            #{pos}
                          </span>
                        ) : (
                          <span className="text-sm text-white/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center text-sm text-white/40">
                        {prev != null ? `#${prev}` : '-'}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <ChangeIndicator change={change} />
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm text-white/50">
                        {kw.volume != null
                          ? kw.volume.toLocaleString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {kw.difficulty != null ? (
                          <DifficultyBadge value={kw.difficulty} />
                        ) : (
                          <span className="text-sm text-white/30">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChangeIndicator({ change }: { change: number | null }) {
  if (change == null) {
    return <span className="text-sm text-white/30">-</span>
  }

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-green-600">
        <ArrowUp className="h-3.5 w-3.5" />+{change}
      </span>
    )
  }

  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm font-medium text-red-600">
        <ArrowDown className="h-3.5 w-3.5" />
        {change}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-sm text-white/40">
      <Minus className="h-3.5 w-3.5" />
      stable
    </span>
  )
}

function DifficultyBadge({ value }: { value: number }) {
  let color = 'bg-green-100 text-green-700'
  if (value >= 70) color = 'bg-red-100 text-red-700'
  else if (value >= 40) color = 'bg-yellow-100 text-yellow-700'

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {value}
    </span>
  )
}
