'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { cn, getScoreColor, formatNumber } from '@/lib/utils'
import { generateAuditRecommendations, exportRecommendationsAsMarkdown, exportRecommendationsAsHTML } from '@/lib/actionable-recommendations'
import { ActionPlan } from '@/components/shared/ActionPlan'
import {
  Search,
  Settings,
  Zap,
  Shield,
  FileText,
  Smartphone,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Globe,
  Loader2,
  Download,
  Printer,
  FileJson,
  FileDown,
  ArrowUpDown,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                        */
/* ────────────────────────────────────────────────────────────── */

interface DetailedCheck {
  id: string
  category: 'meta' | 'content' | 'technical' | 'performance' | 'security' | 'mobile'
  name: string
  status: 'passed' | 'warning' | 'error'
  score: number
  value: string
  summary: string
  report: string
  bestPractices: string[]
  impact: 'critical' | 'high' | 'medium' | 'low'
  sources: string[]
}

interface ApiAuditData {
  url: string
  score: number
  loadTime: number
  htmlSize: number
  checks: any[]
  detailedChecks: DetailedCheck[]
  summary: {
    passed: number
    warnings: number
    errors: number
    totalChecks: number
  }
  meta: {
    title: string | null
    description: string | null
    canonical: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
  }
  content: {
    wordCount: number
    h1Count: number
    h2Count: number
    h3Count: number
    imageCount: number
    imagesWithAlt: number
    internalLinks: number
    externalLinks: number
  }
}

interface ApiAuditResponse {
  success: boolean
  data?: ApiAuditData
  error?: string
}

type CategoryKey = 'meta' | 'content' | 'technical' | 'performance' | 'security' | 'mobile'

/* ────────────────────────────────────────────────────────────── */
/*  Constants                                                    */
/* ────────────────────────────────────────────────────────────── */

const categoryConfig: Record<CategoryKey, { label: string; icon: any; color: string; bgColor: string; borderColor: string }> = {
  meta:        { label: 'Meta & SEO',       icon: FileText,   color: 'text-blue-600',   bgColor: 'bg-blue-50 dark:bg-blue-950/30',   borderColor: 'border-blue-200 dark:border-blue-800' },
  content:     { label: 'Contenu',          icon: BookOpen,   color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30', borderColor: 'border-purple-200 dark:border-purple-800' },
  technical:   { label: 'Technique',        icon: Settings,   color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30', borderColor: 'border-orange-200 dark:border-orange-800' },
  performance: { label: 'Performance',      icon: Zap,        color: 'text-amber-600',  bgColor: 'bg-amber-50 dark:bg-amber-950/30',  borderColor: 'border-amber-200 dark:border-amber-800' },
  security:    { label: 'Sécurité',         icon: Shield,     color: 'text-green-600',  bgColor: 'bg-green-50 dark:bg-green-950/30',  borderColor: 'border-green-200 dark:border-green-800' },
  mobile:      { label: 'Mobile',           icon: Smartphone, color: 'text-cyan-600',   bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',    borderColor: 'border-cyan-200 dark:border-cyan-800' },
}

const impactConfig: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critique',  color: 'text-red-700 dark:text-red-300',    bg: 'bg-red-100 dark:bg-red-900/40' },
  high:     { label: 'Haute',     color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  medium:   { label: 'Moyenne',   color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40' },
  low:      { label: 'Basse',     color: 'text-blue-700 dark:text-blue-300',  bg: 'bg-blue-100 dark:bg-blue-900/40' },
}

const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 }

const CATEGORY_ORDER: CategoryKey[] = ['meta', 'content', 'technical', 'performance', 'security', 'mobile']

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                      */
/* ────────────────────────────────────────────────────────────── */

function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function getGaugeColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function statusIcon(status: string) {
  if (status === 'passed') return <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
  if (status === 'warning') return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
}

/** Render simple markdown-like formatting: **bold**, bullet points */
function renderReport(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()
    if (!trimmed) return <br key={i} />

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      return (
        <li key={i} className="ml-4 list-disc text-sm text-white/70 leading-relaxed">
          {renderInlineMarkdown(trimmed.slice(2))}
        </li>
      )
    }

    return (
      <p key={i} className="text-sm text-white/70 leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    )
  })
}

function renderInlineMarkdown(text: string) {
  // Replace **bold** with <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

/* ────────────────────────────────────────────────────────────── */
/*  Export helpers                                                */
/* ────────────────────────────────────────────────────────────── */

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateMarkdownReport(data: ApiAuditData): string {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  const grade = getGrade(data.score)
  const checks = data.detailedChecks || []

  let md = `# Rapport d'Audit SEO --- ${data.url}\n\n`
  md += `**Date** : ${date}\n`
  md += `**Score global** : ${data.score}/100 (${grade})\n\n`
  md += `## Resume\n\n`
  md += `- ${data.summary.passed} controles reussis\n`
  md += `- ${data.summary.warnings} avertissements\n`
  md += `- ${data.summary.errors} erreurs\n\n`
  md += `## Details par categorie\n\n`

  for (const cat of CATEGORY_ORDER) {
    const config = categoryConfig[cat]
    const catChecks = checks.filter(c => c.category === cat)
    if (catChecks.length === 0) continue

    md += `### ${config.label}\n\n`

    for (const check of catChecks) {
      const statusEmoji = check.status === 'passed' ? 'OK' : check.status === 'warning' ? 'AVERT.' : 'ERREUR'
      md += `#### ${check.name} --- ${check.score}/100 [${statusEmoji}]\n\n`
      md += `${check.report}\n\n`

      if (check.bestPractices.length > 0) {
        md += `**Bonnes pratiques 2026** :\n\n`
        for (const bp of check.bestPractices) {
          md += `- ${bp}\n`
        }
        md += '\n'
      }

      if (check.sources.length > 0) {
        md += `**Sources** : ${check.sources.join(', ')}\n\n`
      }

      md += `---\n\n`
    }
  }

  return md
}

function generateTextReport(data: ApiAuditData): string {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  const grade = getGrade(data.score)
  const checks = data.detailedChecks || []

  let txt = `RAPPORT D'AUDIT SEO\n`
  txt += `${'='.repeat(60)}\n\n`
  txt += `URL      : ${data.url}\n`
  txt += `Date     : ${date}\n`
  txt += `Score    : ${data.score}/100 (Grade ${grade})\n\n`
  txt += `RESUME\n${'-'.repeat(40)}\n`
  txt += `Réussis         : ${data.summary.passed}\n`
  txt += `Avertissements  : ${data.summary.warnings}\n`
  txt += `Erreurs         : ${data.summary.errors}\n\n`

  for (const cat of CATEGORY_ORDER) {
    const config = categoryConfig[cat]
    const catChecks = checks.filter(c => c.category === cat)
    if (catChecks.length === 0) continue

    txt += `\n${'='.repeat(60)}\n`
    txt += `${config.label.toUpperCase()}\n`
    txt += `${'='.repeat(60)}\n\n`

    for (const check of catChecks) {
      const statusLabel = check.status === 'passed' ? '[OK]' : check.status === 'warning' ? '[AVERT.]' : '[ERREUR]'
      txt += `${check.name} - ${check.score}/100 ${statusLabel}\n`
      txt += `${'-'.repeat(40)}\n`
      // Strip markdown bold from report
      txt += `${check.report.replace(/\*\*/g, '')}\n\n`

      if (check.bestPractices.length > 0) {
        txt += `Bonnes pratiques 2026 :\n`
        for (const bp of check.bestPractices) {
          txt += `  - ${bp}\n`
        }
        txt += '\n'
      }

      if (check.sources.length > 0) {
        txt += `Sources : ${check.sources.join(', ')}\n`
      }
      txt += '\n'
    }
  }

  return txt
}

/* ────────────────────────────────────────────────────────────── */
/*  Sub-components                                               */
/* ────────────────────────────────────────────────────────────── */

function ImpactBadge({ impact }: { impact: string }) {
  const cfg = impactConfig[impact] || impactConfig.low
  return (
    <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase rounded-full', cfg.color, cfg.bg)}>
      {cfg.label}
    </span>
  )
}

function ExpandableDetailedCheck({ check }: { check: DetailedCheck }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Build tooltip content: first best practice or report excerpt
  const tooltipText = check.status !== 'passed'
    ? (check.bestPractices[0] || check.report.replace(/\*\*/g, '').split('\n')[0]).slice(0, 200)
    : ''

  return (
    <div className="border border-white/5 rounded-lg bg-white/[0.03] overflow-hidden print:break-inside-avoid relative">
      {/* Header row — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => tooltipText && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors print:hover:bg-transparent"
      >
        {statusIcon(check.status)}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white">{check.name}</span>
          <span className="text-sm text-white/50 ml-2 hidden sm:inline">
            --- {check.summary}
          </span>
        </div>
        <ImpactBadge impact={check.impact} />
        <span className={cn('text-sm font-bold tabular-nums w-8 text-right', getScoreColor(check.score))}>
          {check.score}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-surface-400 transition-transform flex-shrink-0 print:hidden', isExpanded && 'rotate-180')} />
      </button>

      {/* Tooltip on hover — shows solution preview */}
      {showTooltip && !isExpanded && tooltipText && (
        <div className="absolute left-4 right-4 top-full z-30 mt-1 p-3 rounded-lg bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 text-xs leading-relaxed shadow-xl pointer-events-none animate-fade-in">
          <div className="font-semibold mb-1 text-amber-300 dark:text-amber-600">Solution preconisee :</div>
          {tooltipText}
        </div>
      )}

      {/* Summary on mobile */}
      <div className="px-4 pb-2 sm:hidden">
        <p className="text-xs text-white/50">{check.summary}</p>
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="border-t border-surface-100 dark:border-surface-700 px-4 py-4 space-y-4 bg-surface-50/50 dark:bg-surface-800/50">
          {/* Report */}
          <div className="space-y-1.5">
            {renderReport(check.report)}
          </div>

          {/* Best practices */}
          {check.bestPractices.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                Bonnes pratiques 2026
              </h5>
              <ul className="space-y-1">
                {check.bestPractices.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <ChevronRight className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {bp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {check.sources.length > 0 && (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                Sources
              </h5>
              <div className="flex flex-wrap gap-2">
                {check.sources.map((src, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-1 text-xs rounded bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getGaugeColor(score)
  const grade = getGrade(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth="10"
          className="text-surface-200 dark:text-surface-700"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs text-white/50">/100</span>
        <span className="mt-1 px-2 py-0.5 text-xs font-bold rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
          Grade {grade}
        </span>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Main Page                                                    */
/* ────────────────────────────────────────────────────────────── */

export default function AuditPage() {
  const { selectedWebsite } = useWebsite()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ApiAuditData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeCategory, setActiveCategory] = useState<'all' | CategoryKey>('all')
  const [sortByImpact, setSortByImpact] = useState(false)
  const [depth, setDepth] = useState('500')
  const [mode, setMode] = useState('rapide')
  const [userAgent, setUserAgent] = useState('googlebot')

  // Auto-launch audit from URL query param (e.g. from homepage hero)
  const [autoLaunched, setAutoLaunched] = useState(false)

  useEffect(() => {
    if (autoLaunched || result) return
    const params = new URLSearchParams(window.location.search)
    const urlParam = params.get('url')
    if (urlParam) {
      setUrl(urlParam)
      setAutoLaunched(true)
    }
  }, [autoLaunched, result])

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !url && !autoLaunched) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite, autoLaunched])

  // Pre-load results from latest scan if available
  useEffect(() => {
    if (result || autoLaunched || !selectedWebsite?.id) return
    async function loadFromScan() {
      try {
        const statsRes = await fetch(`/api/dashboard/stats?websiteId=${selectedWebsite!.id}`)
        if (!statsRes.ok) return
        const stats = await statsRes.json()
        if (!stats.latestScanId) return

        const scanRes = await fetch(`/api/scan/${stats.latestScanId}`)
        if (!scanRes.ok) return
        const scanJson = await scanRes.json()
        if (!scanJson.success || !scanJson.data?.results) return

        const scanResults = typeof scanJson.data.results === 'string'
          ? JSON.parse(scanJson.data.results)
          : scanJson.data.results

        if (scanResults?.audit) {
          setResult({
            url: scanJson.data.url,
            score: scanResults.audit.score,
            loadTime: 0,
            htmlSize: 0,
            checks: scanResults.audit.checks || [],
            detailedChecks: scanResults.audit.checks || [],
            summary: scanResults.audit.summary || { passed: 0, warnings: 0, errors: 0, totalChecks: 0 },
            meta: scanResults.audit.meta || {},
            content: scanResults.audit.content || {},
          })
        }
      } catch { /* non-critical */ }
    }
    loadFromScan()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWebsite?.id])

  /* ── API call ─────────────────────────────────────────────── */

  const handleAnalyze = useCallback(async () => {
    if (!url) return

    let processedUrl = url.trim()
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: processedUrl }),
      })

      const json: ApiAuditResponse = await response.json()

      if (!json.success || !json.data) {
        setError(json.error || "Erreur lors de l'analyse")
        return
      }

      setResult(json.data)
    } catch {
      setError('Impossible de se connecter au serveur. Vérifiez votre connexion.')
    } finally {
      setIsAnalyzing(false)
    }
  }, [url])

  // Trigger audit after URL is set from query param
  useEffect(() => {
    if (autoLaunched && url && !isAnalyzing && !result) {
      handleAnalyze()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLaunched, url])

  /* ── Derived data ──────────────────────────────────────────── */

  const detailedChecks = result?.detailedChecks || []

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; score: number; passed: number; warnings: number; errors: number }> = {}
    for (const c of detailedChecks) {
      if (!counts[c.category]) counts[c.category] = { total: 0, score: 0, passed: 0, warnings: 0, errors: 0 }
      counts[c.category].total++
      counts[c.category].score += c.score
      if (c.status === 'passed') counts[c.category].passed++
      else if (c.status === 'warning') counts[c.category].warnings++
      else counts[c.category].errors++
    }
    return counts
  }, [detailedChecks])

  const radarData = useMemo(() => {
    return CATEGORY_ORDER
      .filter(cat => categoryCounts[cat])
      .map(cat => ({
        name: categoryConfig[cat].label,
        score: Math.round(categoryCounts[cat].score / categoryCounts[cat].total),
      }))
  }, [categoryCounts])

  const filteredChecks = useMemo(() => {
    let checks = activeCategory === 'all'
      ? [...detailedChecks]
      : detailedChecks.filter(c => c.category === activeCategory)

    if (sortByImpact) {
      checks.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])
    }

    return checks
  }, [detailedChecks, activeCategory, sortByImpact])

  const summary = result?.summary || { passed: 0, warnings: 0, errors: 0, totalChecks: 0 }
  const grade = result ? getGrade(result.score) : ''

  /* ── Export handlers ───────────────────────────────────────── */

  const handleExportPDF = () => window.print()

  const handleExportJSON = () => {
    if (!result) return
    const json = JSON.stringify(result, null, 2)
    const domain = new URL(result.url).hostname.replace(/\./g, '-')
    downloadFile(json, `audit-seo-${domain}.json`, 'application/json')
  }

  const handleExportMD = () => {
    if (!result) return
    const md = generateMarkdownReport(result)
    const domain = new URL(result.url).hostname.replace(/\./g, '-')
    downloadFile(md, `audit-seo-${domain}.md`, 'text/markdown')
  }

  const handleExportTXT = () => {
    if (!result) return
    const txt = generateTextReport(result)
    const domain = new URL(result.url).hostname.replace(/\./g, '-')
    downloadFile(txt, `audit-seo-${domain}.txt`, 'text/plain')
  }

  const handleExportCSV = () => {
    if (!result) return
    const checks = result.detailedChecks || []
    const header = 'Categorie;Nom;Statut;Score;Impact;Resume;Solution\n'
    const rows = checks.map(c => {
      const solution = (c.bestPractices[0] || '').replace(/"/g, '""')
      const summary = c.summary.replace(/"/g, '""')
      const cat = categoryConfig[c.category as CategoryKey]?.label || c.category
      return `"${cat}";"${c.name}";"${c.status}";"${c.score}";"${c.impact}";"${summary}";"${solution}"`
    }).join('\n')
    const domain = new URL(result.url).hostname.replace(/\./g, '-')
    downloadFile('\uFEFF' + header + rows, `audit-seo-${domain}.csv`, 'text/csv;charset=utf-8')
  }

  const handleExportHTML = () => {
    if (!result) return
    const checks = result.detailedChecks || []
    const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    let html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Audit SEO — ${result.url}</title>
<style>body{font-family:Inter,system-ui,sans-serif;max-width:900px;margin:0 auto;padding:2rem;color:#1a1a1a}
h1{color:#2563eb}h2{border-bottom:2px solid #e5e7eb;padding-bottom:.5rem;margin-top:2rem}
.score{font-size:3rem;font-weight:900;text-align:center;margin:1rem 0}
.passed{color:#22c55e}.warning{color:#f59e0b}.error{color:#ef4444}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #e5e7eb;padding:.5rem .75rem;text-align:left;font-size:.875rem}
th{background:#f8fafc;font-weight:600}.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.7rem;font-weight:700}
.critical{background:#fee2e2;color:#dc2626}.high{background:#ffedd5;color:#ea580c}.medium{background:#fef9c3;color:#ca8a04}.low{background:#dbeafe;color:#2563eb}
</style></head><body>
<h1>Rapport d&apos;Audit SEO</h1>
<p><strong>URL</strong> : ${result.url}<br><strong>Date</strong> : ${date}<br><strong>Score</strong> : ${result.score}/100</p>
<div class="score ${result.score >= 80 ? 'passed' : result.score >= 60 ? 'warning' : 'error'}">${result.score}/100</div>
<p>${result.summary.passed} reussis | ${result.summary.warnings} avertissements | ${result.summary.errors} erreurs</p>`

    for (const cat of CATEGORY_ORDER) {
      const catChecks = checks.filter(c => c.category === cat)
      if (catChecks.length === 0) continue
      const cfg = categoryConfig[cat]
      html += `<h2>${cfg.label}</h2><table><tr><th>Controle</th><th>Statut</th><th>Score</th><th>Impact</th><th>Solution</th></tr>`
      for (const c of catChecks) {
        const statusClass = c.status === 'passed' ? 'passed' : c.status === 'warning' ? 'warning' : 'error'
        const solution = c.bestPractices[0] || c.summary
        html += `<tr><td>${c.name}</td><td class="${statusClass}">${c.status.toUpperCase()}</td><td>${c.score}/100</td><td><span class="badge ${c.impact}">${c.impact}</span></td><td>${solution}</td></tr>`
      }
      html += `</table>`
    }

    html += `<p style="margin-top:2rem;color:#888;font-size:.75rem">Généré par Nexus SEO — nexus.kayzen-lyon.fr</p></body></html>`
    const domain = new URL(result.url).hostname.replace(/\./g, '-')
    downloadFile(html, `audit-seo-${domain}.html`, 'text/html')
  }

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 pb-8 print:space-y-4 print:pb-0">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between print:flex-row print:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg print:hidden">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-950 dark:text-surface-50">Audit SEO</h1>
            {result && (
              <p className="text-sm text-white/50">{result.url}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── URL Input Form ──────────────────────────────────── */}
      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 space-y-4 print:hidden">
        <div>
          <label className="block text-sm font-semibold text-white mb-3">
            Entrez l&apos;URL de votre site
          </label>
          <UrlInput
            value={url}
            onChange={setUrl}
            onSubmit={handleAnalyze}
            loading={isAnalyzing}
            submitLabel="Lancer un audit"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Profondeur d&apos;audit</label>
            <select value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-white text-sm outline-none">
              <option value="100">100 pages</option>
              <option value="500">500 pages</option>
              <option value="1000">1000 pages</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Mode de crawl</label>
            <div className="flex gap-2">
              {['rapide', 'complet'].map((m) => (
                <button key={m} onClick={() => setMode(m)} className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors', mode === m ? 'bg-brand-500 text-white' : 'bg-white/[0.03] text-white/70')}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">User-Agent</label>
            <select value={userAgent} onChange={(e) => setUserAgent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-white text-sm outline-none">
              <option value="googlebot">Googlebot (Desktop)</option>
              <option value="mobile">Googlebot (Mobile)</option>
              <option value="firefox">Firefox (Desktop)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-6 print:hidden">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">Erreur d&apos;analyse</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button onClick={handleAnalyze} className="mt-3 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                Reessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────── */}
      {isAnalyzing && (
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-12 print:hidden">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">Analyse en cours...</p>
              <p className="text-sm text-surface-500 mt-1">Nous analysons {url} en profondeur</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      {result && !isAnalyzing && (
        <>
          {/* Export bar */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 print:hidden">
            <span className="text-sm font-semibold text-white/70 mr-2">Exporter :</span>
            <button onClick={handleExportPDF} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <Printer className="h-3.5 w-3.5" /> PDF
            </button>
            <button onClick={handleExportJSON} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <FileJson className="h-3.5 w-3.5" /> JSON
            </button>
            <button onClick={handleExportMD} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <FileDown className="h-3.5 w-3.5" /> Markdown
            </button>
            <button onClick={handleExportTXT} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <Download className="h-3.5 w-3.5" /> TXT
            </button>
            <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <ArrowUpDown className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={handleExportHTML} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-white/[0.03] text-white/70 transition-colors">
              <Globe className="h-3.5 w-3.5" /> HTML
            </button>
          </div>

          {/* Score + Summary + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score gauge */}
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 flex flex-col items-center justify-center print:items-start">
              <ScoreGauge score={result.score} />
              <div className="mt-4 grid grid-cols-3 gap-3 w-full">
                <div className="text-center rounded-lg bg-green-50 dark:bg-green-950/30 p-2">
                  <p className="text-lg font-bold text-green-600">{summary.passed}</p>
                  <p className="text-[10px] text-green-700 dark:text-green-400 font-medium">Réussis</p>
                </div>
                <div className="text-center rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2">
                  <p className="text-lg font-bold text-amber-600">{summary.warnings}</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Avert.</p>
                </div>
                <div className="text-center rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                  <p className="text-lg font-bold text-red-600">{summary.errors}</p>
                  <p className="text-[10px] text-red-700 dark:text-red-400 font-medium">Erreurs</p>
                </div>
              </div>
            </div>

            {/* Category scores list */}
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Scores par categorie</h2>
              <div className="space-y-3">
                {CATEGORY_ORDER.filter(cat => categoryCounts[cat]).map(cat => {
                  const cfg = categoryConfig[cat]
                  const data = categoryCounts[cat]
                  const avgScore = Math.round(data.score / data.total)
                  const CatIcon = cfg.icon
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <CatIcon className={cn('h-4 w-4', cfg.color)} />
                          <span className="text-xs font-medium text-white/70">{cfg.label}</span>
                        </div>
                        <span className={cn('text-sm font-bold', getScoreColor(avgScore))}>{avgScore}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden" role="progressbar" aria-label={cfg.label} aria-valuenow={avgScore} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', avgScore >= 80 ? 'bg-green-500' : avgScore >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${avgScore}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Radar chart */}
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 print:hidden">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Radar</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#666', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Category filter tabs + sort ──────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  activeCategory === 'all'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/[0.03] text-white/50 hover:bg-surface-200 dark:hover:bg-surface-700'
                )}
              >
                Tous ({detailedChecks.length})
              </button>
              {CATEGORY_ORDER.filter(cat => categoryCounts[cat]).map(cat => {
                const cfg = categoryConfig[cat]
                const count = categoryCounts[cat]?.total || 0
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      activeCategory === cat
                        ? 'bg-brand-500 text-white'
                        : 'bg-white/[0.03] text-white/50 hover:bg-surface-200 dark:hover:bg-surface-700'
                    )}
                  >
                    {cfg.label} ({count})
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setSortByImpact(!sortByImpact)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                sortByImpact
                  ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'bg-white/[0.03] text-white/50 hover:bg-surface-200 dark:hover:bg-surface-700'
              )}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortByImpact ? 'Tri par impact' : 'Trier par impact'}
            </button>
          </div>

          {/* ── Checks grouped by category ──────────────────── */}
          <div className="space-y-6 print:space-y-4">
            {activeCategory === 'all' ? (
              // Show grouped by category
              CATEGORY_ORDER.filter(cat => {
                const catChecks = filteredChecks.filter(c => c.category === cat)
                return catChecks.length > 0
              }).map(cat => {
                const cfg = categoryConfig[cat]
                const CatIcon = cfg.icon
                const catChecks = filteredChecks.filter(c => c.category === cat)
                const avgScore = Math.round(catChecks.reduce((s, c) => s + c.score, 0) / catChecks.length)

                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-t-lg border border-b-0', cfg.bgColor, cfg.borderColor)}>
                      <CatIcon className={cn('h-5 w-5', cfg.color)} />
                      <h3 className="text-sm font-bold text-white">{cfg.label}</h3>
                      <span className={cn('ml-auto text-sm font-bold', getScoreColor(avgScore))}>{avgScore}/100</span>
                    </div>
                    <div className="space-y-0 border-x border-b border-white/5 rounded-b-lg overflow-hidden">
                      {catChecks.map(check => (
                        <ExpandableDetailedCheck key={check.id} check={check} />
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              // Show flat list for filtered category
              <div className="space-y-2">
                {filteredChecks.length > 0 ? (
                  filteredChecks.map(check => (
                    <ExpandableDetailedCheck key={check.id} check={check} />
                  ))
                ) : (
                  <div className="rounded-lg border border-white/5 bg-white/[0.03] p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-white">Aucun problème détecté</p>
                    <p className="text-sm text-white/50 mt-2">Votre site respecte toutes les bonnes pratiques pour cette categorie.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Technical Summary ────────────────────────────── */}
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Résumé technique</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs text-surface-500 mb-1">HTTPS</p>
                <p className={cn('text-lg font-bold', result.url.startsWith('https') ? 'text-green-600' : 'text-red-500')}>
                  {result.url.startsWith('https') ? 'Actif' : 'Inactif'}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs text-surface-500 mb-1">Temps de réponse</p>
                <p className="text-lg font-bold text-white">{result.loadTime}ms</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs text-surface-500 mb-1">Taille HTML</p>
                <p className="text-lg font-bold text-white">{(result.htmlSize / 1024).toFixed(1)} KB</p>
              </div>
              <div className="rounded-lg bg-white/[0.02] p-3">
                <p className="text-xs text-surface-500 mb-1">Vérifications</p>
                <p className="text-lg font-bold text-white">
                  {summary.totalChecks}
                  <span className="text-xs font-normal text-surface-500 ml-1">({summary.passed} OK)</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Meta & Content panels ────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Balises Meta</h3>
              <div className="space-y-3">
                {[
                  { label: 'Title', value: result.meta.title, warn: 'Manquant' },
                  { label: 'Description', value: result.meta.description, warn: 'Manquante' },
                  { label: 'Canonical', value: result.meta.canonical, warn: 'Non defini' },
                ].map(({ label, value, warn }) => (
                  <div key={label} className="rounded-lg bg-white/[0.02] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1">{label}</p>
                    <p className="text-sm text-white break-all">
                      {value || <span className="text-red-500 italic">{warn}</span>}
                    </p>
                    {value && <p className="text-[10px] text-surface-400 mt-1">{value.length} caracteres</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Analyse du contenu</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mots', value: formatNumber(result.content.wordCount) },
                  { label: 'H1', value: result.content.h1Count, color: result.content.h1Count === 1 ? 'text-green-600' : 'text-amber-500' },
                  { label: 'H2', value: result.content.h2Count },
                  { label: 'H3', value: result.content.h3Count },
                  { label: 'Images', value: result.content.imageCount, sub: result.content.imageCount - result.content.imagesWithAlt > 0 ? `${result.content.imageCount - result.content.imagesWithAlt} sans alt` : undefined },
                  { label: 'Liens', value: result.content.internalLinks + result.content.externalLinks, sub: `${result.content.internalLinks} int. / ${result.content.externalLinks} ext.` },
                ].map(({ label, value, color, sub }) => (
                  <div key={label} className="rounded-lg bg-white/[0.02] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mb-1">{label}</p>
                    <p className={cn('text-xl font-bold', color || 'text-white')}>{value}</p>
                    {sub && <p className="text-[10px] text-surface-400 mt-1">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Plan d'action SEO ──────────────────────────────── */}
          {result && result.checks && (
            <ActionPlan
              recommendations={generateAuditRecommendations(result.checks)}
              siteName={result.url}
              onPrint={() => window.print()}
              onExportMD={() => {
                const recs = generateAuditRecommendations(result.checks)
                const md = exportRecommendationsAsMarkdown(recs, result.url)
                const blob = new Blob([md], { type: 'text/markdown' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                a.download = `plan-action-seo-${new URL(result.url).hostname}.md`
                a.click(); URL.revokeObjectURL(a.href)
              }}
              onExportHTML={() => {
                const recs = generateAuditRecommendations(result.checks)
                const html = exportRecommendationsAsHTML(recs, result.url)
                const blob = new Blob([html], { type: 'text/html' })
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                a.download = `plan-action-seo-${new URL(result.url).hostname}.html`
                a.click(); URL.revokeObjectURL(a.href)
              }}
            />
          )}
        </>
      )}

      {/* ── Audit History ──────────────────────────────────── */}
      {selectedWebsite && !isAnalyzing && (
        <AuditHistory websiteId={selectedWebsite.id} />
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!result && !isAnalyzing && !error && (
        <div className="rounded-lg border border-dashed border-surface-300 dark:border-surface-700 bg-white/50 dark:bg-surface-900/50 p-16 print:hidden">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-950/30 mb-4">
              <Search className="h-8 w-8 text-brand-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lancez votre premier audit</h3>
            <p className="text-white/50 max-w-md">
              Entrez l&apos;URL de votre site ci-dessus pour obtenir une analyse SEO complète avec des recommandations personnalisées.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Audit History Sub-component                                   */
/* ────────────────────────────────────────────────────────────── */

function AuditHistory({ websiteId }: { websiteId: string }) {
  const [audits, setAudits] = useState<Array<{ id: string; url: string; score: number; grade: string; createdAt: string }>>([])
  const [loadingH, setLoadingH] = useState(false)

  useEffect(() => {
    if (!websiteId) return
    setLoadingH(true)
    fetch(`/api/audit?websiteId=${websiteId}`)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(json => setAudits(json.data || []))
      .catch(() => {})
      .finally(() => setLoadingH(false))
  }, [websiteId])

  if (loadingH || audits.length === 0) return null

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 print:hidden">
      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
        <ChevronRight className="w-4 h-4" /> Historique des audits ({audits.length})
      </h3>
      <div className="space-y-2">
        {audits.slice(0, 10).map((audit) => {
          const date = new Date(audit.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          const scoreColor = audit.score >= 80 ? 'text-green-600' : audit.score >= 60 ? 'text-amber-500' : 'text-red-500'
          return (
            <div key={audit.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn('text-lg font-black tabular-nums w-10', scoreColor)}>{audit.score}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{audit.url}</p>
                  <p className="text-xs text-surface-500">{date}</p>
                </div>
              </div>
              <span className={cn('px-2 py-0.5 text-xs font-bold rounded',
                audit.score >= 80 ? 'bg-green-100 text-green-700' : audit.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              )}>{audit.grade || getGrade(audit.score)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
