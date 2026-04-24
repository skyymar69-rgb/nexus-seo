'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  Users,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Globe,
  Clock,
  FileText,
  AlertTriangle,
  Link2,
  Image,
  Heading1,
  Heading2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrawlStats {
  totalPages: number
  statusCodes: { [key: string]: number }
  totalInternalLinks: number
  totalExternalLinks: number
  totalImages: number
  totalImagesWithoutAlt: number
  avgResponseTime: number
}

interface CrawledPage {
  url: string
  statusCode: number
  contentType: string
  contentLength: number
  responseTime: number
  title: string
  description: string
  h1Count: number
  h2Count: number
  internalLinks: number
  externalLinks: number
  imageCount: number
  imagesWithoutAlt: number
  issues: string[]
}

interface CrawlResult {
  url: string
  stats: CrawlStats
  pages: CrawledPage[]
  crawledAt: string
}

interface CompetitorEntry {
  id: string
  domain: string
  crawlResult: CrawlResult | null
  isLoading: boolean
  error: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function storageKey(websiteId: string): string {
  return `nexus-competitors-${websiteId}`
}

function loadCompetitors(websiteId: string): CompetitorEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(storageKey(websiteId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as CompetitorEntry[]
    // Reset transient state
    return parsed.map((c) => ({ ...c, isLoading: false, error: null }))
  } catch {
    return []
  }
}

function saveCompetitors(websiteId: string, competitors: CompetitorEntry[]) {
  if (typeof window === 'undefined') return
  // Strip transient state before saving
  const toSave = competitors.map(({ id, domain, crawlResult }) => ({
    id,
    domain,
    crawlResult,
    isLoading: false,
    error: null,
  }))
  localStorage.setItem(storageKey(websiteId), JSON.stringify(toSave))
}

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase()
  d = d.replace(/^https?:\/\//, '')
  d = d.replace(/\/.*$/, '')
  return d
}

function totalIssues(pages: CrawledPage[]): number {
  return pages.reduce((sum, p) => sum + p.issues.length, 0)
}

function avgH1(pages: CrawledPage[]): number {
  if (pages.length === 0) return 0
  return pages.reduce((s, p) => s + p.h1Count, 0) / pages.length
}

function avgH2(pages: CrawledPage[]): number {
  if (pages.length === 0) return 0
  return pages.reduce((s, p) => s + p.h2Count, 0) / pages.length
}

function pagesWithMissingMeta(pages: CrawledPage[]): number {
  return pages.filter((p) => !p.description || !p.title).length
}

// ─── Metric comparison helpers ────────────────────────────────────────────────

type CompareDir = 'higher-better' | 'lower-better'

function compareColor(
  ownValue: number,
  competitorValue: number,
  dir: CompareDir,
): string {
  if (ownValue === competitorValue) return 'text-surface-300'
  if (dir === 'higher-better') {
    return ownValue > competitorValue ? 'text-green-400' : 'text-red-400'
  }
  return ownValue < competitorValue ? 'text-green-400' : 'text-red-400'
}

function CompareArrow({
  ownValue,
  competitorValue,
  dir,
}: {
  ownValue: number
  competitorValue: number
  dir: CompareDir
}) {
  if (ownValue === competitorValue) return null
  const isBetter =
    dir === 'higher-better'
      ? ownValue > competitorValue
      : ownValue < competitorValue
  return isBetter ? (
    <ArrowUpRight className="h-3.5 w-3.5 text-green-400 inline ml-1" />
  ) : (
    <ArrowDownRight className="h-3.5 w-3.5 text-red-400 inline ml-1" />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const { selectedWebsite } = useWebsite()

  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [ownCrawl, setOwnCrawl] = useState<CrawlResult | null>(null)
  const [ownLoading, setOwnLoading] = useState(false)

  // Load competitors from localStorage when website changes
  useEffect(() => {
    if (!selectedWebsite) return
    const loaded = loadCompetitors(selectedWebsite.id)
    setCompetitors(loaded)
  }, [selectedWebsite?.id])

  // Persist competitors whenever they change (but only non-transient data)
  const persist = useCallback(
    (list: CompetitorEntry[]) => {
      if (selectedWebsite) saveCompetitors(selectedWebsite.id, list)
    },
    [selectedWebsite?.id],
  )

  // ─── Crawl a URL ──────────────────────────────────────────────────────────

  async function runCrawl(url: string): Promise<CrawlResult> {
    const res = await fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, maxPages: 10 }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Erreur ${res.status}`)
    }
    const data = await res.json()
    return {
      url: data.url,
      stats: data.stats,
      pages: data.pages,
      crawledAt: new Date().toISOString(),
    }
  }

  // ─── Crawl own site ───────────────────────────────────────────────────────

  async function crawlOwnSite() {
    if (!selectedWebsite) return
    setOwnLoading(true)
    try {
      const result = await runCrawl(`https://${selectedWebsite.domain}`)
      setOwnCrawl(result)
    } catch {
      // Silently handle -- user can retry
    } finally {
      setOwnLoading(false)
    }
  }

  // ─── Add competitor ───────────────────────────────────────────────────────

  function addCompetitor() {
    const domain = normalizeDomain(newDomain)
    if (!domain) return
    if (competitors.some((c) => c.domain === domain)) {
      setNewDomain('')
      return
    }
    const entry: CompetitorEntry = {
      id: crypto.randomUUID(),
      domain,
      crawlResult: null,
      isLoading: false,
      error: null,
    }
    const updated = [...competitors, entry]
    setCompetitors(updated)
    persist(updated)
    setNewDomain('')
  }

  // ─── Remove competitor ────────────────────────────────────────────────────

  function removeCompetitor(id: string) {
    const updated = competitors.filter((c) => c.id !== id)
    setCompetitors(updated)
    persist(updated)
  }

  // ─── Crawl a competitor ───────────────────────────────────────────────────

  async function crawlCompetitor(id: string) {
    const comp = competitors.find((c) => c.id === id)
    if (!comp) return

    setCompetitors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isLoading: true, error: null } : c,
      ),
    )

    try {
      const result = await runCrawl(`https://${comp.domain}`)
      setCompetitors((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, crawlResult: result, isLoading: false } : c,
        )
        persist(updated)
        return updated
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setCompetitors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, error: message, isLoading: false } : c,
        ),
      )
    }
  }

  // ─── Crawl all ────────────────────────────────────────────────────────────

  async function crawlAll() {
    crawlOwnSite()
    for (const c of competitors) {
      crawlCompetitor(c.id)
    }
  }

  // ─── Derived data for charts ──────────────────────────────────────────────

  const crawledCompetitors = competitors.filter((c) => c.crawlResult)

  const comparisonMetrics = (() => {
    const rows: {
      label: string
      icon: React.ReactNode
      ownValue: number | null
      competitors: { domain: string; value: number }[]
      dir: CompareDir
      format?: (v: number) => string
    }[] = [
      {
        label: 'Pages analysees',
        icon: <FileText className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.totalPages ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.totalPages,
        })),
        dir: 'higher-better',
      },
      {
        label: 'Temps de réponse moyen',
        icon: <Clock className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.avgResponseTime ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.avgResponseTime,
        })),
        dir: 'lower-better',
        format: (v) => `${v}ms`,
      },
      {
        label: 'Problèmes détectés',
        icon: <AlertTriangle className="h-4 w-4" />,
        ownValue: ownCrawl ? totalIssues(ownCrawl.pages) : null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: totalIssues(c.crawlResult!.pages),
        })),
        dir: 'lower-better',
      },
      {
        label: 'Liens internes',
        icon: <Link2 className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.totalInternalLinks ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.totalInternalLinks,
        })),
        dir: 'higher-better',
      },
      {
        label: 'Liens externes',
        icon: <Globe className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.totalExternalLinks ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.totalExternalLinks,
        })),
        dir: 'higher-better',
      },
      {
        label: 'Images totales',
        icon: <Image className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.totalImages ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.totalImages,
        })),
        dir: 'higher-better',
      },
      {
        label: 'Images sans alt',
        icon: <AlertTriangle className="h-4 w-4" />,
        ownValue: ownCrawl?.stats.totalImagesWithoutAlt ?? null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: c.crawlResult!.stats.totalImagesWithoutAlt,
        })),
        dir: 'lower-better',
      },
      {
        label: 'Moyenne H1 / page',
        icon: <Heading1 className="h-4 w-4" />,
        ownValue: ownCrawl ? +avgH1(ownCrawl.pages).toFixed(1) : null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: +avgH1(c.crawlResult!.pages).toFixed(1),
        })),
        dir: 'higher-better',
      },
      {
        label: 'Moyenne H2 / page',
        icon: <Heading2 className="h-4 w-4" />,
        ownValue: ownCrawl ? +avgH2(ownCrawl.pages).toFixed(1) : null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: +avgH2(c.crawlResult!.pages).toFixed(1),
        })),
        dir: 'higher-better',
      },
      {
        label: 'Pages sans meta',
        icon: <Search className="h-4 w-4" />,
        ownValue: ownCrawl ? pagesWithMissingMeta(ownCrawl.pages) : null,
        competitors: crawledCompetitors.map((c) => ({
          domain: c.domain,
          value: pagesWithMissingMeta(c.crawlResult!.pages),
        })),
        dir: 'lower-better',
      },
    ]
    return rows
  })()

  // Bar chart data: response time comparison
  const responseTimeChartData = (() => {
    const items: { domain: string; value: number }[] = []
    if (ownCrawl) {
      items.push({
        domain: selectedWebsite?.domain ?? 'Votre site',
        value: ownCrawl.stats.avgResponseTime,
      })
    }
    crawledCompetitors.forEach((c) => {
      items.push({
        domain: c.domain,
        value: c.crawlResult!.stats.avgResponseTime,
      })
    })
    return items
  })()

  // Bar chart data: issues comparison
  const issuesChartData = (() => {
    const items: { domain: string; value: number }[] = []
    if (ownCrawl) {
      items.push({
        domain: selectedWebsite?.domain ?? 'Votre site',
        value: totalIssues(ownCrawl.pages),
      })
    }
    crawledCompetitors.forEach((c) => {
      items.push({
        domain: c.domain,
        value: totalIssues(c.crawlResult!.pages),
      })
    })
    return items
  })()

  const hasCrawlData = ownCrawl || crawledCompetitors.length > 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-brand-500/15">
              <Users className="h-6 w-6 text-brand-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Analyse des Concurrents
            </h1>
          </div>
          <p className="text-surface-400 mt-1 max-w-xl">
            Ajoutez des domaines concurrents, lancez un crawl et comparez les
            metriques reelles de vos sites
          </p>
        </div>
        {competitors.length > 0 && (
          <button
            onClick={crawlAll}
            disabled={ownLoading || competitors.some((c) => c.isLoading)}
            className="px-5 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                (ownLoading || competitors.some((c) => c.isLoading)) &&
                  'animate-spin',
              )}
            />
            Tout analyser
          </button>
        )}
      </div>

      {/* Add Competitor Form */}
      <div className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wide mb-4">
          Ajouter un concurrent
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addCompetitor()
          }}
          className="flex gap-3"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Entrez un domaine concurrent (ex: exemple.com)"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              aria-label="Domaine concurrent"
              className="w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!newDomain.trim()}
            className="px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </div>

      {/* Empty state */}
      {competitors.length === 0 && (
        <div className="rounded-xl border border-dashed border-surface-700 bg-surface-900/30 p-16 text-center">
          <Users className="h-12 w-12 text-surface-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-300 mb-2">
            Aucun concurrent ajoute
          </h3>
          <p className="text-surface-500 max-w-md mx-auto">
            Ajoutez des domaines concurrents ci-dessus pour comparer les
            metriques de votre site avec les leurs via un crawl en temps reel.
          </p>
        </div>
      )}

      {/* Competitor Cards */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Own site card */}
          <div className="rounded-xl border border-brand-500/40 bg-surface-900/50 backdrop-blur p-6 shadow-sm ring-2 ring-brand-500/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1">
                  Votre site
                </p>
                <h3 className="text-lg font-bold text-surface-100">
                  {selectedWebsite?.domain ?? '---'}
                </h3>
              </div>
              <button
                onClick={crawlOwnSite}
                disabled={ownLoading}
                className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400 hover:text-surface-200 disabled:opacity-50"
                title="Analyser votre site"
              >
                {ownLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
            {ownCrawl ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-surface-500 mb-1 font-medium">
                    PAGES ANALYSEES
                  </p>
                  <p className="text-2xl font-bold text-surface-100">
                    {ownCrawl.stats.totalPages}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1 font-medium">
                    TEMPS MOY.
                  </p>
                  <p className="text-2xl font-bold text-surface-100">
                    {ownCrawl.stats.avgResponseTime}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1 font-medium">
                    PROBLEMES
                  </p>
                  <p className="text-2xl font-bold text-surface-100">
                    {totalIssues(ownCrawl.pages)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1 font-medium">
                    LIENS INTERNES
                  </p>
                  <p className="text-2xl font-bold text-surface-100">
                    {ownCrawl.stats.totalInternalLinks}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-surface-500 italic">
                {ownLoading
                  ? 'Analyse en cours...'
                  : 'Cliquez sur le bouton pour analyser votre site'}
              </p>
            )}
            {ownCrawl && (
              <p className="text-xs text-surface-600 mt-4">
                Analyse du{' '}
                {new Date(ownCrawl.crawledAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Competitor cards */}
          {competitors.map((comp) => (
            <div
              key={comp.id}
              className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur p-6 shadow-sm hover:border-surface-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">
                    Concurrent
                  </p>
                  <h3 className="text-lg font-bold text-surface-100">
                    {comp.domain}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => crawlCompetitor(comp.id)}
                    disabled={comp.isLoading}
                    className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors text-surface-400 hover:text-surface-200 disabled:opacity-50"
                    title="Analyser ce concurrent"
                  >
                    {comp.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeCompetitor(comp.id)}
                    className="p-2 rounded-lg bg-surface-800 hover:bg-red-900/50 transition-colors text-surface-400 hover:text-red-400"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {comp.error && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
                  {comp.error}
                </div>
              )}

              {comp.crawlResult ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-surface-500 mb-1 font-medium">
                        PAGES ANALYSEES
                      </p>
                      <p className="text-2xl font-bold text-surface-100">
                        {comp.crawlResult.stats.totalPages}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500 mb-1 font-medium">
                        TEMPS MOY.
                      </p>
                      <p className="text-2xl font-bold text-surface-100">
                        {comp.crawlResult.stats.avgResponseTime}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500 mb-1 font-medium">
                        PROBLEMES
                      </p>
                      <p className="text-2xl font-bold text-surface-100">
                        {totalIssues(comp.crawlResult.pages)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-surface-500 mb-1 font-medium">
                        LIENS INTERNES
                      </p>
                      <p className="text-2xl font-bold text-surface-100">
                        {comp.crawlResult.stats.totalInternalLinks}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-surface-600 mt-4">
                    Analyse du{' '}
                    {new Date(comp.crawlResult.crawledAt).toLocaleDateString(
                      'fr-FR',
                      {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </p>
                </>
              ) : (
                <p className="text-sm text-surface-500 italic">
                  {comp.isLoading
                    ? 'Analyse en cours...'
                    : 'Cliquez sur le bouton pour lancer le crawl'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {hasCrawlData && (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-surface-100 mb-6">
            Tableau Comparatif
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-800/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wide">
                    Metrique
                  </th>
                  {ownCrawl && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-brand-400 uppercase tracking-wide">
                      {selectedWebsite?.domain ?? 'Votre site'}
                    </th>
                  )}
                  {crawledCompetitors.map((c) => (
                    <th
                      key={c.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-surface-400 uppercase tracking-wide"
                    >
                      {c.domain}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonMetrics.map((metric) => (
                  <tr
                    key={metric.label}
                    className="border-b border-surface-800 hover:bg-surface-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-surface-100">
                      <span className="inline-flex items-center gap-2">
                        {metric.icon}
                        {metric.label}
                      </span>
                    </td>
                    {ownCrawl && (
                      <td className="px-6 py-4 text-sm font-bold text-brand-400">
                        {metric.ownValue !== null
                          ? metric.format
                            ? metric.format(metric.ownValue)
                            : metric.ownValue
                          : '---'}
                      </td>
                    )}
                    {metric.competitors.map((comp, i) => (
                      <td key={i} className="px-6 py-4 text-sm">
                        <span
                          className={cn(
                            'font-medium',
                            metric.ownValue !== null
                              ? compareColor(
                                  metric.ownValue,
                                  comp.value,
                                  metric.dir,
                                )
                              : 'text-surface-300',
                          )}
                        >
                          {metric.format
                            ? metric.format(comp.value)
                            : comp.value}
                          {metric.ownValue !== null && (
                            <CompareArrow
                              ownValue={metric.ownValue}
                              competitorValue={comp.value}
                              dir={metric.dir}
                            />
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-surface-600 mt-4">
            Vert = votre site est meilleur, Rouge = le concurrent est meilleur
          </p>
        </div>
      )}

      {/* Response Time Chart */}
      {responseTimeChartData.length >= 2 && (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-bold text-surface-100 mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-400" />
            Comparaison du Temps de Reponse Moyen
          </h2>
          <p className="text-sm text-surface-400 mb-6">
            Temps de réponse moyen en millisecondes (plus bas = mieux)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(71, 85, 105)" />
              <XAxis
                dataKey="domain"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: '12px' }}
                unit="ms"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(17, 24, 39)',
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgb(229, 231, 235)' }}
                formatter={(value: number) => [`${value}ms`, 'Temps moyen']}
              />
              <Bar
                dataKey="value"
                fill="rgb(99, 102, 241)"
                name="Temps moyen (ms)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Issues Chart */}
      {issuesChartData.length >= 2 && (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-bold text-surface-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-brand-400" />
            Comparaison des Problèmes SEO
          </h2>
          <p className="text-sm text-surface-400 mb-6">
            Nombre de problèmes détectés par le crawl (plus bas = mieux)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={issuesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(71, 85, 105)" />
              <XAxis
                dataKey="domain"
                stroke="rgb(107, 114, 128)"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="rgb(107, 114, 128)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(17, 24, 39)',
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'rgb(229, 231, 235)' }}
                formatter={(value: number) => [value, 'Problemes']}
              />
              <Bar
                dataKey="value"
                fill="rgb(239, 68, 68)"
                name="Problèmes détectés"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-page details for each crawled competitor */}
      {crawledCompetitors.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-surface-100">
            Detail des pages analysees
          </h2>
          {crawledCompetitors.map((comp) => (
            <div
              key={comp.id}
              className="rounded-xl border border-surface-700 bg-surface-900/50 backdrop-blur overflow-hidden shadow-sm"
            >
              <div className="p-4 border-b border-surface-700 bg-surface-800/30">
                <h3 className="text-sm font-bold text-surface-200">
                  {comp.domain}{' '}
                  <span className="text-surface-500 font-normal">
                    -- {comp.crawlResult!.pages.length} pages
                  </span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        URL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        Temps
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        H1
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        H2
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-surface-400">
                        Problemes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comp.crawlResult!.pages.map((page, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-surface-800/50 hover:bg-surface-800/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-surface-300 max-w-xs truncate">
                          {page.url}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'font-medium',
                              page.statusCode >= 200 && page.statusCode < 300
                                ? 'text-green-400'
                                : page.statusCode >= 400
                                  ? 'text-red-400'
                                  : 'text-amber-400',
                            )}
                          >
                            {page.statusCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-surface-400">
                          {page.responseTime}ms
                        </td>
                        <td className="px-4 py-3 text-surface-400">
                          {page.h1Count}
                        </td>
                        <td className="px-4 py-3 text-surface-400">
                          {page.h2Count}
                        </td>
                        <td className="px-4 py-3">
                          {page.issues.length > 0 ? (
                            <span className="text-amber-400">
                              {page.issues.length}
                            </span>
                          ) : (
                            <span className="text-green-400">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
