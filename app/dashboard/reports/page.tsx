'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  BarChart3,
  Key,
  Link2,
  Bot,
  Gauge,
  Download,
  ExternalLink,
} from 'lucide-react'

interface ReportData {
  website: { domain: string; name: string | null }
  generatedAt: string
  audit: { score: number; grade: string; date: string } | null
  keywords: { count: number; avgPosition: number | null }
  backlinks: { count: number; dofollowRatio: number }
  aiVisibility: { queriesAnalyzed: number; mentionRate: number | null }
  performance: {
    score: number
    grade: string
    lcp: number | null
    fcp: number | null
    cls: number | null
    date: string
  } | null
}

interface Report {
  id: string
  title: string
  type: string
  format: string
  data: ReportData | null
  status: string
  createdAt: string
}

export default function ReportsPage() {
  const { selectedWebsite } = useWebsite()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reports')
      if (!res.ok) throw new Error('Erreur lors du chargement des rapports')
      const json = await res.json()
      setReports(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleGenerate = async () => {
    if (!selectedWebsite) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: selectedWebsite.id }),
      })
      if (!res.ok) throw new Error('Erreur lors de la generation du rapport')
      const newReport = await res.json()
      setReports((prev) => [newReport, ...prev])
      setExpandedId(newReport.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  // No website selected
  if (!selectedWebsite) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Aucun site sélectionné
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Sélectionnez un site web pour générer des rapports.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.03] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Rapports</h1>
            <p className="mt-1 text-sm text-white/40">
              Générez et consultez vos rapports SEO pour{' '}
              <span className="font-medium text-white/70">
                {selectedWebsite.domain}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Find latest scan and export
                fetch(`/api/dashboard/scan-history?websiteId=${selectedWebsite.id}&limit=1`)
                  .then(r => r.json())
                  .then(d => {
                    if (d.success && d.data?.[0]?.id) {
                      window.open(`/api/export?scanId=${d.data[0].id}&format=html`, '_blank')
                    }
                  })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/5 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Download className="h-4 w-4" />
              Exporter HTML
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-400 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Générer un rapport
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-rose-400" />
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-white/50">
              Chargement des rapports...
            </span>
          </div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="h-16 w-16 text-white/30" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Aucun rapport
            </h3>
            <p className="mt-1 text-sm text-white/40">
              Cliquez sur &quot;Générer un rapport&quot; pour créer votre
              premier rapport SEO.
            </p>
          </div>
        )}

        {/* Reports list */}
        {!loading && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id
              return (
                <div
                  key={report.id}
                  className="rounded-lg border border-white/5 bg-white/[0.03] shadow-sm"
                >
                  {/* Report header */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : report.id)
                    }
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-white">
                          {report.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {report.status === 'completed'
                              ? 'Termine'
                              : 'En cours'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-white/30" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/30" />
                    )}
                  </button>

                  {/* Expanded report data */}
                  {isExpanded && report.data && (
                    <div className="border-t border-white/5 px-6 py-5">
                      <ReportDetail data={report.data} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ReportDetail({ data }: { data: ReportData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Audit */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-white">Audit SEO</h4>
        </div>
        {data.audit ? (
          <div>
            <p className="text-2xl font-bold text-white">
              {data.audit.score}/100
            </p>
            <p className="text-xs text-white/40">
              Grade {data.audit.grade} -{' '}
              {new Date(data.audit.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/30">Aucun audit disponible</p>
        )}
      </div>

      {/* Keywords */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Key className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-semibold text-white">Mots-cles</h4>
        </div>
        <p className="text-2xl font-bold text-white">
          {data.keywords.count}
        </p>
        <p className="text-xs text-white/40">
          {data.keywords.avgPosition != null
            ? `Position moyenne : ${data.keywords.avgPosition}`
            : 'Aucune position trackee'}
        </p>
      </div>

      {/* Backlinks */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-yellow-600" />
          <h4 className="text-sm font-semibold text-white">Backlinks</h4>
        </div>
        <p className="text-2xl font-bold text-white">
          {data.backlinks.count}
        </p>
        <p className="text-xs text-white/40">
          {data.backlinks.dofollowRatio}% dofollow
        </p>
      </div>

      {/* AI Visibility */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-white">
            Visibilite IA
          </h4>
        </div>
        <p className="text-2xl font-bold text-white">
          {data.aiVisibility.mentionRate != null
            ? `${data.aiVisibility.mentionRate}%`
            : '-'}
        </p>
        <p className="text-xs text-white/40">
          {data.aiVisibility.queriesAnalyzed} requetes analysees
        </p>
      </div>

      {/* Performance */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-teal-600" />
          <h4 className="text-sm font-semibold text-white">Performance</h4>
        </div>
        {data.performance ? (
          <div>
            <p className="text-2xl font-bold text-white">
              {data.performance.score}/100
            </p>
            <p className="text-xs text-white/40">
              LCP: {data.performance.lcp?.toFixed(1) ?? '-'}s | FCP:{' '}
              {data.performance.fcp?.toFixed(1) ?? '-'}s | CLS:{' '}
              {data.performance.cls?.toFixed(3) ?? '-'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/30">
            Aucune donnee de performance
          </p>
        )}
      </div>
    </div>
  )
}
