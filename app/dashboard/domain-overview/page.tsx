'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'
import {
  Globe, Loader2, AlertTriangle, FileText, Zap, Database,
  CheckCircle2, XCircle, BarChart3, Tag
} from 'lucide-react'

interface DomainData {
  score: number
  meta: {
    title: string
    description: string
    canonical: string
    lang: string
    robots: string
    ogImage: boolean
    favicon: boolean
  }
  content: {
    wordCount: number
    h1Count: number
    h2Count: number
    h3Count: number
    imageCount: number
    imagesWithoutAlt: number
    internalLinks: number
    externalLinks: number
  }
  performance: {
    responseTime: number
    contentLength: number
    gzip: boolean
    https: boolean
  }
  structuredData: {
    hasJsonLd: boolean
    hasOpenGraph: boolean
    hasTwitterCard: boolean
    schemas: string[]
  }
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          className="transition-all duration-1000"
        />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central"
          className="text-3xl font-bold" fill={color}>{score}</text>
      </svg>
      <span className="text-sm text-white/40 mt-1">Score SEO global</span>
    </div>
  )
}

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-white/50">{label}</span>
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400" />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

export default function DomainOverviewPage() {
  const { selectedWebsite, websites } = useWebsite()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DomainData | null>(null)

  useEffect(() => {
    if (selectedWebsite?.domain && !url) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  // Auto-load from latest scan
  useEffect(() => {
    if (!selectedWebsite?.id || data) return
    async function loadFromScan() {
      try {
        const statsRes = await fetch(`/api/dashboard/stats?websiteId=${selectedWebsite!.id}`)
        if (!statsRes.ok) return
        const stats = await statsRes.json()
        if (!stats.latestScanId) return
        const scanRes = await fetch(`/api/scan/${stats.latestScanId}`)
        if (!scanRes.ok) return
        const scan = await scanRes.json()
        const scanData = scan.data || scan
        const results = typeof scanData.results === 'string' ? JSON.parse(scanData.results) : scanData.results
        if (!results?.audit) return
        const a = results.audit
        setData({
          score: a.score || 0,
          meta: {
            title: a.meta?.title || '',
            description: a.meta?.description || '',
            canonical: a.meta?.canonical || '',
            lang: 'fr',
            robots: '',
            ogImage: !!a.meta?.ogImage,
            favicon: true,
          },
          content: {
            wordCount: a.content?.wordCount || 0,
            h1Count: a.content?.h1Count || 0,
            h2Count: a.content?.h2Count || 0,
            h3Count: a.content?.h3Count || 0,
            imageCount: a.content?.imageCount || 0,
            imagesWithoutAlt: (a.content?.imageCount || 0) - (a.content?.imagesWithAlt || 0),
            internalLinks: a.content?.internalLinks || 0,
            externalLinks: a.content?.externalLinks || 0,
          },
          performance: { responseTime: 0, contentLength: 0, gzip: true, https: true },
          structuredData: { hasJsonLd: true, hasOpenGraph: !!a.meta?.ogTitle, hasTwitterCard: false, schemas: [] },
        })
      } catch { /* silent */ }
    }
    loadFromScan()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWebsite?.id])

  const handleAnalyze = async () => {
    if (!url.trim()) return
    let analyzeUrl = url.trim()
    if (!analyzeUrl.startsWith('http')) analyzeUrl = 'https://' + analyzeUrl

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/domain-overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de l\'analyse')
      }
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vue d'ensemble du domaine</h1>
        <p className="text-white/40 mt-1">Analyse compl&egrave;te de votre site en une page</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <UrlInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={loading}
          submitLabel="Analyser le domaine"
          domain={selectedWebsite?.domain}
          websites={websites}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Analyse en cours...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Score */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 flex flex-col items-center">
            <ScoreGauge score={data.score} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meta & SEO */}
            <Card title="Meta & SEO" icon={Tag}>
              <div className="space-y-0.5">
                <Stat label="Title" value={data.meta.title || '(absent)'} />
                <Stat label="Description" value={data.meta.description ? `${data.meta.description.length} car.` : '(absente)'} />
                <Stat label="Langue" value={data.meta.lang || '(non définie)'} />
                <Stat label="Robots" value={data.meta.robots || 'index, follow'} />
                <StatusBadge ok={!!data.meta.canonical} label="Canonical" />
                <StatusBadge ok={data.meta.ogImage} label="Image OG" />
                <StatusBadge ok={data.meta.favicon} label="Favicon" />
              </div>
            </Card>

            {/* Contenu */}
            <Card title="Contenu" icon={FileText}>
              <div className="space-y-0.5">
                <Stat label="Nombre de mots" value={data.content.wordCount.toLocaleString('fr-FR')} />
                <Stat label="Balises H1" value={data.content.h1Count} />
                <Stat label="Balises H2" value={data.content.h2Count} />
                <Stat label="Balises H3" value={data.content.h3Count} />
                <Stat label="Images" value={data.content.imageCount} />
                <Stat label="Images sans alt" value={data.content.imagesWithoutAlt} />
                <Stat label="Liens internes" value={data.content.internalLinks} />
                <Stat label="Liens externes" value={data.content.externalLinks} />
              </div>
            </Card>

            {/* Performance */}
            <Card title="Performance" icon={Zap}>
              <div className="space-y-0.5">
                <Stat label="Temps de réponse" value={`${data.performance.responseTime} ms`} />
                <Stat label="Taille du contenu" value={`${(data.performance.contentLength / 1024).toFixed(1)} Ko`} />
                <StatusBadge ok={data.performance.gzip} label="Compression Gzip" />
                <StatusBadge ok={data.performance.https} label="HTTPS actif" />
              </div>
            </Card>

            {/* Données structurées */}
            <Card title="Données structurées" icon={Database}>
              <div className="space-y-0.5">
                <StatusBadge ok={data.structuredData.hasJsonLd} label="JSON-LD" />
                <StatusBadge ok={data.structuredData.hasOpenGraph} label="Open Graph" />
                <StatusBadge ok={data.structuredData.hasTwitterCard} label="Twitter Card" />
                {data.structuredData.schemas.length > 0 && (
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <span className="text-xs text-white/30 uppercase tracking-wider">Schémas détectés</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {data.structuredData.schemas.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
