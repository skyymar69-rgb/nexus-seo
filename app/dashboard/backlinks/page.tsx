'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn, formatNumber } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Link2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Globe,
  Award,
  Zap,
  Loader2,
  X,
  BarChart3,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'

interface Backlink {
  id: string
  sourceUrl: string
  sourceDomain: string
  targetUrl: string
  anchorText: string | null
  da: number
  dr: number
  linkType: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
  spamScore: number
  status: 'active' | 'lost' | 'broken'
  firstSeen: string
  lastChecked: string
  backlinkCount?: number
  dofollowRatio?: number
}

interface KPIData {
  label: string
  value: string | number
  change: number
  icon: React.ReactNode
}

// Map API backlink to local interface
function mapApiBacklink(apiBl: any): Backlink {
  return {
    id: apiBl.id,
    sourceUrl: apiBl.sourceUrl,
    sourceDomain: apiBl.sourceDomain,
    targetUrl: apiBl.targetUrl,
    anchorText: apiBl.anchorText ?? null,
    da: apiBl.da ?? 0,
    dr: apiBl.dr ?? 0,
    linkType: apiBl.linkType ?? 'dofollow',
    spamScore: apiBl.spamScore ?? 0,
    status: apiBl.status ?? 'active',
    firstSeen: apiBl.firstSeen ? new Date(apiBl.firstSeen).toISOString().split('T')[0] : '',
    lastChecked: apiBl.lastChecked ? new Date(apiBl.lastChecked).toISOString().split('T')[0] : '',
  }
}

// Compute growth chart data from actual backlinks
function computeGrowthData(backlinks: Backlink[]) {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    const cutoff = date.toISOString().split('T')[0]
    const total = backlinks.filter((b) => b.firstSeen <= cutoff).length
    const dofollow = backlinks.filter((b) => b.firstSeen <= cutoff && b.linkType === 'dofollow').length
    data.push({ date: dateStr, total, dofollow })
  }
  return data
}

// Compute new vs lost from actual backlinks
function computeNewLostData(backlinks: Backlink[]) {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
    const dayStr = date.toISOString().split('T')[0]
    const newCount = backlinks.filter((b) => b.firstSeen === dayStr && b.status === 'active').length
    const lostCount = backlinks.filter((b) => b.lastChecked === dayStr && b.status === 'lost').length
    data.push({ date: dateStr, new: newCount, lost: lostCount })
  }
  return data
}

export default function BacklinksPage() {
  const { selectedWebsite } = useWebsite()
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'all' | 'toxic'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDARange, setFilterDARange] = useState<[number, number]>([0, 100])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'da' | 'date' | 'spam'>('da')

  // Fetch backlinks from API
  useEffect(() => {
    async function fetchBacklinks() {
      if (!selectedWebsite) {
        setBacklinks([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const res = await fetch(`/api/backlinks?websiteId=${selectedWebsite.id}&limit=200`)
        if (res.ok) {
          const data = await res.json()
          setBacklinks((data.backlinks || []).map(mapApiBacklink))
        } else {
          setBacklinks([])
        }
      } catch (error) {
        console.error('Failed to fetch backlinks:', error)
        setBacklinks([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchBacklinks()
  }, [selectedWebsite])

  // Derived chart data from real backlinks
  const growthData = useMemo(() => computeGrowthData(backlinks), [backlinks])
  const newLostData = useMemo(() => computeNewLostData(backlinks), [backlinks])

  // Calculate KPIs
  const totalBacklinks = backlinks.length
  const activeBacklinks = backlinks.filter((b) => b.status === 'active').length
  const lostBacklinks = backlinks.filter((b) => b.status === 'lost').length
  const newThisMonth = backlinks.filter((b) => {
    const firstSeen = new Date(b.firstSeen)
    const today = new Date()
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
    return firstSeen >= thirtyDaysAgo
  }).length

  const referringDomains = useMemo(() => {
    const unique = new Map<string, Backlink>()
    backlinks.forEach((b) => {
      if (!unique.has(b.sourceDomain)) {
        unique.set(b.sourceDomain, b)
      }
    })
    return unique.size
  }, [backlinks])

  const dofollowBacklinks = backlinks.filter((b) => b.linkType === 'dofollow').length
  const dofollowRatio = Math.round((dofollowBacklinks / totalBacklinks) * 100)

  const avgDA = Math.round(backlinks.reduce((sum, b) => sum + b.da, 0) / backlinks.length)
  const avgDR = Math.round(backlinks.reduce((sum, b) => sum + b.dr, 0) / backlinks.length)

  const avgSpamScore = Math.round(
    backlinks.reduce((sum, b) => sum + b.spamScore, 0) / backlinks.length
  )

  const toxicBacklinks = backlinks.filter((b) => b.spamScore > 30)

  // Filter and sort backlinks
  const filteredBacklinks = useMemo(() => {
    let filtered = selectedTab === 'toxic' ? toxicBacklinks : backlinks

    if (filterType !== 'all') {
      filtered = filtered.filter((b) => b.linkType === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus)
    }

    filtered = filtered.filter((b) => b.da >= filterDARange[0] && b.da <= filterDARange[1])

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.sourceDomain.toLowerCase().includes(query) ||
          b.sourceUrl.toLowerCase().includes(query) ||
          b.anchorText?.toLowerCase().includes(query)
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'da') return b.da - a.da
      if (sortBy === 'date') return new Date(b.firstSeen).getTime() - new Date(a.firstSeen).getTime()
      if (sortBy === 'spam') return a.spamScore - b.spamScore
      return 0
    })

    return filtered
  }, [selectedTab, filterType, filterStatus, filterDARange, searchQuery, sortBy, backlinks])

  // Analyze anchor text distribution
  const anchorTextAnalysis = useMemo(() => {
    const analysis = new Map<string, number>()
    backlinks.forEach((b) => {
      if (b.anchorText) {
        analysis.set(b.anchorText, (analysis.get(b.anchorText) || 0) + 1)
      }
    })

    return Array.from(analysis.entries())
      .map(([text, count]) => ({
        name: text,
        value: count,
        percentage: Math.round((count / (totalBacklinks - 5)) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [backlinks])

  // Link type distribution
  const linkTypeDistribution = [
    {
      name: 'Dofollow',
      value: backlinks.filter((b) => b.linkType === 'dofollow').length,
      fill: '#10b981',
    },
    {
      name: 'Nofollow',
      value: backlinks.filter((b) => b.linkType === 'nofollow').length,
      fill: '#6b7280',
    },
    {
      name: 'UGC',
      value: backlinks.filter((b) => b.linkType === 'ugc').length,
      fill: '#3b82f6',
    },
    {
      name: 'Sponsored',
      value: backlinks.filter((b) => b.linkType === 'sponsored').length,
      fill: '#f59e0b',
    },
  ]

  // Top referring domains
  const topReferringDomains = useMemo(() => {
    const domains = new Map<
      string,
      { da: number; count: number; dofollow: number }
    >()

    backlinks.forEach((b) => {
      if (!domains.has(b.sourceDomain)) {
        domains.set(b.sourceDomain, {
          da: b.da,
          count: 0,
          dofollow: 0,
        })
      }
      const domain = domains.get(b.sourceDomain)!
      domain.count++
      if (b.linkType === 'dofollow') domain.dofollow++
    })

    return Array.from(domains.entries())
      .map(([domain, data]) => ({
        domain,
        da: data.da,
        count: data.count,
        dofollowRatio: Math.round((data.dofollow / data.count) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [backlinks])

  // Top domains bar chart data
  const topDomainsChart = topReferringDomains.slice(0, 8).map((d) => ({
    name: d.domain.replace('www.', ''),
    count: d.count,
  }))

  const kpis: KPIData[] = [
    {
      label: 'Total Backlinks',
      value: totalBacklinks,
      change: 12.5,
      icon: <Link2 className="w-5 h-5" />,
    },
    {
      label: 'Referring Domains',
      value: referringDomains,
      change: 8.2,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: 'Avg Domain Authority',
      value: avgDA,
      change: 2.1,
      icon: <Award className="w-5 h-5" />,
    },
    {
      label: 'Avg Domain Rating',
      value: avgDR,
      change: 1.8,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      label: 'Dofollow Ratio',
      value: `${dofollowRatio}%`,
      change: 3.5,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'New This Month',
      value: newThisMonth,
      change: 15.3,
      icon: <ArrowUpRight className="w-5 h-5" />,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-slate-400">Chargement des backlinks...</p>
      </div>
    )
  }

  if (!selectedWebsite) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Link2 className="h-12 w-12 text-slate-600" />
        <p className="text-slate-400 text-lg">Sélectionnez un site web pour voir les backlinks</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Link2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Backlinks</h1>
                <p className="text-sm text-slate-400 mt-1">{selectedWebsite.domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Analyser les backlinks
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
                <div className="p-2 bg-slate-700/50 rounded-lg">{kpi.icon}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
                <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                  <ArrowUpRight className="w-3 h-3" />
                  {kpi.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart - Backlink Growth */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Backlink Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  name="Total Backlinks"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dofollow"
                  stroke="#10b981"
                  name="Dofollow"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Link Type Distribution */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Link Types</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={linkTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {linkTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Top Referring Domains & New vs Lost */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Domains */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Referring Domains</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topDomainsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New vs Lost */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">New vs Lost Backlinks</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={newLostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="new"
                  stroke="#10b981"
                  name="New"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lost"
                  stroke="#ef4444"
                  name="Lost"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anchor Text Distribution */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Anchor Text Distribution</h3>
          <div className="space-y-3">
            {anchorTextAnalysis.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-300">{item.name}</span>
                  <span className="text-sm text-slate-400">{item.percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTab('all')
                  setFilterStatus('all')
                }}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  selectedTab === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                All Backlinks ({filteredBacklinks.length})
              </button>
              <button
                onClick={() => setSelectedTab('toxic')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  selectedTab === 'toxic'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                Toxic Links ({toxicBacklinks.length})
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher un domaine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Rechercher un domaine"
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="dofollow">Dofollow</option>
                <option value="nofollow">Nofollow</option>
                <option value="ugc">UGC</option>
                <option value="sponsored">Sponsored</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="lost">Lost</option>
                <option value="broken">Broken</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="da">Sort by DA</option>
                <option value="date">Sort by Date</option>
                <option value="spam">Sort by Spam Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backlinks Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Source URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Anchor Text
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    DA / DR
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Spam
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredBacklinks.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-slate-400">
                        {backlinks.length === 0
                          ? 'Aucun backlink trouve. Les backlinks apparaîtront ici une fois détectés.'
                          : 'Aucun backlink ne correspond aux filtres'}
                      </p>
                    </td>
                  </tr>
                )}
                {filteredBacklinks.slice(0, 15).map((backlink) => (
                  <tr key={backlink.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-blue-400 hover:text-blue-300 truncate font-medium">
                            {backlink.sourceDomain}
                          </p>
                          <p className="text-xs text-slate-500 truncate" title={backlink.sourceUrl}>
                            {backlink.sourceUrl}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {backlink.anchorText ? (
                        <code className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                          {backlink.anchorText}
                        </code>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-white">{backlink.da}</span>
                        <span className="text-slate-500">/</span>
                        <span className="font-semibold text-white">{backlink.dr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          backlink.linkType === 'dofollow'
                            ? 'bg-green-500/20 text-green-400'
                            : backlink.linkType === 'nofollow'
                              ? 'bg-gray-500/20 text-gray-400'
                              : backlink.linkType === 'ugc'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                        )}
                      >
                        {backlink.linkType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                            backlink.spamScore < 15
                              ? 'bg-green-500/20 text-green-400'
                              : backlink.spamScore < 30
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          )}
                        >
                          {backlink.spamScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        {backlink.status === 'active' && (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">Active</span>
                          </>
                        )}
                        {backlink.status === 'lost' && (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-medium">Lost</span>
                          </>
                        )}
                        {backlink.status === 'broken' && (
                          <>
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">Broken</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 text-center">
                      <div className="text-xs">
                        <p>First: {backlink.firstSeen}</p>
                        <p>Last: {backlink.lastChecked}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                          <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        </button>
                        <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                          <RefreshCw className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                        </button>
                        {selectedTab === 'toxic' && (
                          <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBacklinks.length > 15 && (
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 text-center text-sm text-slate-400">
              Showing 15 of {filteredBacklinks.length} backlinks
            </div>
          )}
        </div>

        {/* Referring Domains Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top 10 Referring Domains</h3>
            <div className="space-y-3">
              {topReferringDomains.map((domain, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="px-3 py-1 bg-blue-500/20 rounded text-blue-400 text-sm font-semibold">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{domain.domain}</p>
                      <p className="text-xs text-slate-400">DA: {domain.da}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{domain.count}</p>
                    <p className="text-xs text-slate-400">{domain.dofollowRatio}% dofollow</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Active Backlinks</span>
                  <span className="text-xl font-bold text-green-400">{activeBacklinks}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Lost Backlinks</span>
                  <span className="text-xl font-bold text-red-400">{lostBacklinks}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Avg Spam Score</span>
                  <span className="text-xl font-bold text-yellow-400">{avgSpamScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Broken Links</span>
                  <span className="text-xl font-bold text-slate-300">
                    {backlinks.filter((b) => b.status === 'broken').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Link Distribution</h3>
              <div className="space-y-3">
                {linkTypeDistribution.map((type, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-300">{type.name}</span>
                      <span className="text-sm font-bold text-white">{type.value}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(type.value / totalBacklinks) * 100}%`,
                          backgroundColor: type.fill,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
