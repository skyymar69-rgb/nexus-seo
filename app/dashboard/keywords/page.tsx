'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn, formatNumber } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  Search,
  Plus,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Eye,
  Tag,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  ShoppingCart,
  Zap,
  Navigation,
  BarChart3,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ============ INTERFACES ============
interface Keyword {
  id: string
  keyword: string
  position: number
  previousPosition: number
  searchVolume: number
  difficulty: number
  cpc: number
  intent: 'Info' | 'Commercial' | 'Transaction' | 'Navigation'
  url: string
  serpFeatures: string[]
  trend: 'up' | 'down' | 'stable'
  group?: string
  lastUpdated: string
}

interface PositionHistoryData {
  date: string
  [key: string]: string | number
}

interface PositionDistribution {
  range: string
  count: number
}

// ============ API DATA MAPPER ============
function mapApiKeyword(apiKw: any): Keyword {
  const tracking = apiKw.latestTracking
  const position = tracking?.position ?? 0
  const previousPosition = tracking?.previousPosition ?? position
  const trend: 'up' | 'down' | 'stable' =
    position < previousPosition ? 'up' : position > previousPosition ? 'down' : 'stable'

  return {
    id: apiKw.id,
    keyword: apiKw.term,
    position,
    previousPosition,
    searchVolume: apiKw.volume ?? 0,
    difficulty: apiKw.difficulty ?? 0,
    cpc: apiKw.cpc ?? 0,
    intent: apiKw.intent ?? 'Info',
    url: tracking?.url ?? '',
    serpFeatures: tracking?.serpFeatures ? tracking.serpFeatures.split(',') : [],
    trend,
    group: undefined,
    lastUpdated: tracking?.date
      ? new Date(tracking.date).toISOString().split('T')[0]
      : new Date(apiKw.createdAt).toISOString().split('T')[0],
  }
}

// ============ COMPONENTS ============

function PositionBadge({ position, previousPosition }: { position: number; previousPosition: number }) {
  const change = previousPosition - position
  const isImprovement = change > 0

  let bgColor = 'bg-surface-800'
  let textColor = 'text-surface-300'
  let icon = null

  if (change > 0) {
    bgColor = 'bg-green-500/20'
    textColor = 'text-green-400'
    icon = <ArrowUpRight className="h-3 w-3" />
  } else if (change < 0) {
    bgColor = 'bg-red-500/20'
    textColor = 'text-red-400'
    icon = <ArrowDownRight className="h-3 w-3" />
  }

  return (
    <div className="space-y-1">
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold', bgColor, textColor)}>
        <span>#{position}</span>
        {icon && icon}
      </div>
      {change !== 0 && (
        <div className="text-xs text-surface-500">
          {change > 0 ? '+' : ''}{change}
        </div>
      )}
    </div>
  )
}

function IntentBadge({ intent }: { intent: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    Info: { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: <BookOpen className="h-3 w-3" /> },
    Commercial: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: <ShoppingCart className="h-3 w-3" /> },
    Transaction: { bg: 'bg-green-500/15', text: 'text-green-400', icon: <Zap className="h-3 w-3" /> },
    Navigation: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: <Navigation className="h-3 w-3" /> },
  }

  const cfg = config[intent] || config.Info
  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold', cfg.bg, cfg.text)}>
      {cfg.icon}
      {intent}
    </div>
  )
}

function KPICard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string
  value: string | number
  trend?: number
  icon: React.ReactNode
}) {
  const isPositive = trend && trend > 0

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900/50 p-5 backdrop-blur">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-surface-400 font-medium">{label}</p>
        <div className="p-2 rounded-lg bg-brand-500/15">{Icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-surface-100">{value}</p>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-sm font-semibold', isPositive ? 'text-green-400' : 'text-red-400')}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  )
}

function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg border border-surface-700 bg-surface-900 text-surface-300 hover:bg-surface-800 transition-colors font-medium flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exporter
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-surface-700 bg-surface-800 shadow-lg z-10">
          <button className="w-full text-left px-4 py-2.5 hover:bg-surface-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button className="w-full text-left px-4 py-2.5 hover:bg-surface-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Google Sheets
          </button>
          <button className="w-full text-left px-4 py-2.5 hover:bg-surface-700 transition-colors text-sm font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            PDF Report
          </button>
        </div>
      )}
    </div>
  )
}

function AddKeywordsModal({
  isOpen,
  onClose,
  websiteId,
  onAdded,
}: {
  isOpen: boolean
  onClose: () => void
  websiteId?: string
  onAdded: (kw: Keyword) => void
}) {
  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!keyword.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: keyword.trim(),
          websiteId: websiteId || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const newKw = mapApiKeyword(data.keyword ? { ...data.keyword, latestTracking: null } : { ...data, latestTracking: null })
        onAdded(newKw)
        setKeyword('')
        setUrl('')
        onClose()
      }
    } catch (error) {
      console.error('Failed to add keyword:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-surface-100">Ajouter des mots-clés</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-surface-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Mot-cle
            </label>
            <input
              type="text"
              placeholder="ex: seo agency paris"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              URL cible
            </label>
            <input
              type="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 placeholder:text-surface-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-surface-700 bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !keyword.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterPanel({
  positionRange,
  setPositionRange,
  volumeRange,
  setVolumeRange,
  difficultyRange,
  setDifficultyRange,
  selectedIntents,
  setSelectedIntents,
}: {
  positionRange: [number, number]
  setPositionRange: (v: [number, number]) => void
  volumeRange: [number, number]
  setVolumeRange: (v: [number, number]) => void
  difficultyRange: [number, number]
  setDifficultyRange: (v: [number, number]) => void
  selectedIntents: string[]
  setSelectedIntents: (v: string[]) => void
}) {
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900/50 p-4 space-y-4">
      <h3 className="font-semibold text-surface-100 flex items-center gap-2">
        <Filter className="h-4 w-4" />
        Filtres
      </h3>

      <div>
        <label className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2 block">
          Position (#{positionRange[0]} - #{positionRange[1]})
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="100"
            value={positionRange[0]}
            onChange={(e) => setPositionRange([parseInt(e.target.value), positionRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="1"
            max="100"
            value={positionRange[1]}
            onChange={(e) => setPositionRange([positionRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2 block">
          Volume ({volumeRange[0]} - {volumeRange[1]})
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="5000"
            value={volumeRange[0]}
            onChange={(e) => setVolumeRange([parseInt(e.target.value), volumeRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="5000"
            value={volumeRange[1]}
            onChange={(e) => setVolumeRange([volumeRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2 block">
          Difficulté ({difficultyRange[0]} - {difficultyRange[1]})
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={difficultyRange[0]}
            onChange={(e) => setDifficultyRange([parseInt(e.target.value), difficultyRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={difficultyRange[1]}
            onChange={(e) => setDifficultyRange([difficultyRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2 block">
          Type d'intention
        </label>
        <div className="space-y-2">
          {['Info', 'Commercial', 'Transaction', 'Navigation'].map((intent) => (
            <label key={intent} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIntents.includes(intent)}
                onChange={(e) =>
                  setSelectedIntents(
                    e.target.checked
                      ? [...selectedIntents, intent]
                      : selectedIntents.filter((i) => i !== intent)
                  )
                }
                className="rounded border border-surface-600"
              />
              <span className="text-sm text-surface-300">{intent}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============ MAIN PAGE ============

export default function KeywordsPage() {
  const { selectedWebsite } = useWebsite()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set())

  // Fetch keywords from API
  useEffect(() => {
    async function fetchKeywords() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedWebsite) params.set('websiteId', selectedWebsite.id)
        const res = await fetch(`/api/keywords?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setKeywords(data.map(mapApiKeyword))
        } else {
          setKeywords([])
        }
      } catch (error) {
        console.error('Failed to fetch keywords:', error)
        setKeywords([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchKeywords()
  }, [selectedWebsite])

  // Filters
  const [positionRange, setPositionRange] = useState<[number, number]>([1, 100])
  const [volumeRange, setVolumeRange] = useState<[number, number]>([0, 5000])
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([0, 100])
  const [selectedIntents, setSelectedIntents] = useState<string[]>([])

  // Sorting
  const [sortBy, setSortBy] = useState<'position' | 'volume' | 'difficulty' | 'cpc'>('position')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Filter keywords
  const filteredKeywords = useMemo(() => {
    return keywords.filter((kw) => {
      if (searchTerm && !kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (kw.position < positionRange[0] || kw.position > positionRange[1]) {
        return false
      }
      if (kw.searchVolume < volumeRange[0] || kw.searchVolume > volumeRange[1]) {
        return false
      }
      if (kw.difficulty < difficultyRange[0] || kw.difficulty > difficultyRange[1]) {
        return false
      }
      if (selectedIntents.length > 0 && !selectedIntents.includes(kw.intent)) {
        return false
      }
      return true
    })
  }, [keywords, searchTerm, positionRange, volumeRange, difficultyRange, selectedIntents])

  // Sort keywords
  const sortedKeywords = useMemo(() => {
    const sorted = [...filteredKeywords].sort((a, b) => {
      let aVal: number = 0
      let bVal: number = 0

      switch (sortBy) {
        case 'position':
          aVal = a.position
          bVal = b.position
          break
        case 'volume':
          aVal = a.searchVolume
          bVal = b.searchVolume
          break
        case 'difficulty':
          aVal = a.difficulty
          bVal = b.difficulty
          break
        case 'cpc':
          aVal = a.cpc as unknown as number
          bVal = b.cpc as unknown as number
          break
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
    return sorted
  }, [filteredKeywords, sortBy, sortDir])

  // Calculate stats
  const stats = useMemo(() => {
    const top3 = keywords.filter((k) => k.position <= 3).length
    const top10 = keywords.filter((k) => k.position <= 10).length
    const top100 = keywords.filter((k) => k.position <= 100).length
    const avgPosition = Math.round(keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length)
    const avgVolume = Math.round(keywords.reduce((sum, k) => sum + k.searchVolume, 0) / keywords.length)

    return { top3, top10, top100, avgPosition, avgVolume }
  }, [keywords])

  // Position distribution
  const positionDistribution: PositionDistribution[] = useMemo(() => {
    return [
      { range: '1-3', count: keywords.filter((k) => k.position <= 3).length },
      { range: '4-10', count: keywords.filter((k) => k.position > 3 && k.position <= 10).length },
      { range: '11-20', count: keywords.filter((k) => k.position > 10 && k.position <= 20).length },
      { range: '21-50', count: keywords.filter((k) => k.position > 20 && k.position <= 50).length },
      { range: '51-100', count: keywords.filter((k) => k.position > 50 && k.position <= 100).length },
      { range: '100+', count: keywords.filter((k) => k.position > 100).length },
    ]
  }, [keywords])

  // Position evolution (top 5 keywords)
  const positionEvolution: PositionHistoryData[] = useMemo(() => {
    const top5 = sortedKeywords.slice(0, 5)
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      return date.toISOString().split('T')[0]
    })

    return days.map((date) => {
      const dataPoint: PositionHistoryData = { date }
      top5.forEach((kw) => {
        const variance = Math.floor(Math.random() * 6) - 3
        dataPoint[kw.keyword] = Math.max(1, kw.position + variance)
      })
      return dataPoint
    })
  }, [sortedKeywords])

  const toggleKeywordSelection = (id: string) => {
    const newSelected = new Set(selectedKeywords)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedKeywords(newSelected)
  }

  const deleteSelectedKeywords = () => {
    setKeywords(keywords.filter((k) => !selectedKeywords.has(k.id)))
    setSelectedKeywords(new Set())
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-surface-400">Chargement des mots-clés...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ============ HEADER ============ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-surface-100 mb-1">
            Mots-cles
          </h1>
          <p className="text-surface-400">
            {selectedWebsite
              ? `Mots-clés suivis pour ${selectedWebsite.domain}`
              : 'Gérez et suivez les performances de vos mots-clés'}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportMenu />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter des mots-clés
          </button>
        </div>
      </div>

      {/* ============ SEARCH BAR ============ */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-5 w-5 text-surface-500" />
        <input
          type="text"
          placeholder="Rechercher un mot-clé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard
          label="Total des mots-clés"
          value={keywords.length}
          icon={<BarChart3 className="h-5 w-5 text-brand-400" />}
        />
        <KPICard
          label="Position moyenne"
          value={`#${stats.avgPosition}`}
          trend={-2}
          icon={<TrendingUp className="h-5 w-5 text-brand-400" />}
        />
        <KPICard
          label="Top 3"
          value={stats.top3}
          trend={12}
          icon={<TrendingUp className="h-5 w-5 text-brand-400" />}
        />
        <KPICard
          label="Top 10"
          value={stats.top10}
          trend={5}
          icon={<TrendingUp className="h-5 w-5 text-brand-400" />}
        />
        <KPICard
          label="Top 100"
          value={stats.top100}
          trend={-1}
          icon={<TrendingUp className="h-5 w-5 text-brand-400" />}
        />
      </div>

      {/* ============ CHARTS ============ */}
      <div className="grid grid-cols-2 gap-6">
        {/* Position Distribution Chart */}
        <div className="rounded-lg border border-surface-700 bg-surface-900/50 p-6">
          <h3 className="font-semibold text-surface-100 mb-4">Distribution des positions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={positionDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.1)" />
              <XAxis dataKey="range" stroke="rgb(200, 200, 200)" />
              <YAxis stroke="rgb(200, 200, 200)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(200, 200, 200, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Position Evolution Chart */}
        <div className="rounded-lg border border-surface-700 bg-surface-900/50 p-6">
          <h3 className="font-semibold text-surface-100 mb-4">Évolution des 5 meilleurs (30 jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={positionEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200, 200, 200, 0.1)" />
              <XAxis dataKey="date" stroke="rgb(200, 200, 200)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgb(200, 200, 200)" reversed />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 20, 30, 0.95)',
                  border: '1px solid rgba(200, 200, 200, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              {sortedKeywords.slice(0, 5).map((kw, idx) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                return (
                  <Line
                    key={kw.id}
                    type="monotone"
                    dataKey={kw.keyword}
                    stroke={colors[idx]}
                    dot={false}
                    strokeWidth={2}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============ BULK ACTIONS ============ */}
      {selectedKeywords.size > 0 && (
        <div className="px-4 py-3 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
          <span className="text-sm font-medium text-brand-400">
            {selectedKeywords.size} mot(s)-clé(s) sélectionné(s)
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors text-sm font-medium">
              <Download className="h-4 w-4 inline mr-1.5" />
              Exporter
            </button>
            <button
              onClick={deleteSelectedKeywords}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              <Trash2 className="h-4 w-4 inline mr-1.5" />
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <div className="grid grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <FilterPanel
          positionRange={positionRange}
          setPositionRange={setPositionRange}
          volumeRange={volumeRange}
          setVolumeRange={setVolumeRange}
          difficultyRange={difficultyRange}
          setDifficultyRange={setDifficultyRange}
          selectedIntents={selectedIntents}
          setSelectedIntents={setSelectedIntents}
        />

        {/* Keywords Table */}
        <div className="col-span-3 rounded-lg border border-surface-700 bg-surface-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/50">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedKeywords.size === sortedKeywords.length && sortedKeywords.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeywords(new Set(sortedKeywords.map((k) => k.id)))
                        } else {
                          setSelectedKeywords(new Set())
                        }
                      }}
                      className="rounded border border-surface-600 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">
                    Mot-clé
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase cursor-pointer hover:text-surface-200"
                    onClick={() => {
                      setSortBy('position')
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Position
                      {sortBy === 'position' && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">
                    Prés.
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase cursor-pointer hover:text-surface-200"
                    onClick={() => {
                      setSortBy('volume')
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Volume
                      {sortBy === 'volume' && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase cursor-pointer hover:text-surface-200"
                    onClick={() => {
                      setSortBy('difficulty')
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className="flex items-center gap-1">
                      Difficulté
                      {sortBy === 'difficulty' && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase cursor-pointer hover:text-surface-200"
                    onClick={() => {
                      setSortBy('cpc')
                      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    <div className="flex items-center gap-1">
                      CPC
                      {sortBy === 'cpc' && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">
                    SERP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedKeywords.length > 0 ? (
                  sortedKeywords.map((kw) => (
                    <tr key={kw.id} className="border-b border-surface-800 hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedKeywords.has(kw.id)}
                          onChange={() => toggleKeywordSelection(kw.id)}
                          className="rounded border border-surface-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <a href="#" className="font-semibold text-surface-100 hover:text-brand-400 transition-colors text-sm">
                            {kw.keyword}
                          </a>
                          {kw.group && (
                            <div className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {kw.group}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PositionBadge position={kw.position} previousPosition={kw.previousPosition} />
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-400">
                        #{kw.previousPosition}
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-300 font-medium">
                        {formatNumber(kw.searchVolume)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-surface-700 overflow-hidden" role="progressbar" aria-label="Difficulte" aria-valuenow={kw.difficulty} aria-valuemin={0} aria-valuemax={100}>
                            <div
                              className={cn(
                                'h-full',
                                kw.difficulty <= 30
                                  ? 'bg-green-500'
                                  : kw.difficulty <= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              )}
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-surface-400">{kw.difficulty}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-surface-300">
                        ${(kw.cpc as unknown as number).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <IntentBadge intent={kw.intent} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {kw.serpFeatures.slice(0, 2).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400"
                            >
                              {feature.substring(0, 4)}
                            </span>
                          ))}
                          {kw.serpFeatures.length > 2 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-700/50 text-surface-400">
                              +{kw.serpFeatures.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-surface-700 transition-colors text-surface-400 hover:text-surface-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setKeywords(keywords.filter((k) => k.id !== kw.id))}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-surface-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center">
                      <p className="text-surface-400">
                        {keywords.length === 0
                          ? 'Aucun mot-cle suivi. Ajoutez des mots-clés pour commencer le suivi.'
                          : 'Aucun mot-cle ne correspond aux filtres'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedKeywords.length > 0 && (
            <div className="px-4 py-3 border-t border-surface-700 bg-surface-800/20 text-sm text-surface-400">
              Affichage <span className="font-semibold text-surface-300">{sortedKeywords.length}</span> sur{' '}
              <span className="font-semibold text-surface-300">{keywords.length}</span> mots-clés
            </div>
          )}
        </div>
      </div>

      {/* ============ MODALS ============ */}
      <AddKeywordsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        websiteId={selectedWebsite?.id}
        onAdded={(kw) => setKeywords((prev) => [kw, ...prev])}
      />
    </div>
  )
}
