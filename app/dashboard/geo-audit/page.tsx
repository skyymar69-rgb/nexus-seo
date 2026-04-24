'use client'

import { useState, useEffect } from 'react'
import { cn, getScoreColor } from '@/lib/utils'
import {
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Database,
  Users,
  Quote,
  ShieldCheck,
  Bot,
  Globe,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GeoCheck {
  name: string
  status: 'passed' | 'warning' | 'error'
  value: string
  recommendation: string
}

interface GeoCategory {
  score: number
  checks: GeoCheck[]
}

interface GeoResult {
  success: boolean
  url: string
  overallScore: number
  grade: string
  categories: {
    structuredData: GeoCategory
    entityClarity: GeoCategory
    citationReadiness: GeoCategory
    eeat: GeoCategory
    technicalAI: GeoCategory
  }
  recommendations: string[]
  // GEO Engine enrichment (optional)
  eeat?: { total: number; experience: { score: number; recommendations: string[] }; expertise: { score: number; recommendations: string[] }; authority: { score: number; recommendations: string[] }; trust: { score: number; recommendations: string[] } }
  schema?: { score: number; found: Array<{ type: string; valid: boolean; issues: string[] }>; missing: string[]; recommendations: string[] }
  faq?: { detected: boolean; questionsFound: number; hasSchema: boolean; score: number; recommendations: string[] }
  geoRecommendations?: string[]
}

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */

type CategoryKey = keyof GeoResult['categories']

const categoryConfig: Record<CategoryKey, { label: string; icon: any; color: string; bgColor: string }> = {
  structuredData:   { label: 'Données structurées',    icon: Database,    color: 'text-blue-500',   bgColor: 'bg-blue-500/10' },
  entityClarity:    { label: 'Clarté des entités',     icon: Users,       color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  citationReadiness:{ label: 'Prêt pour la citation',  icon: Quote,       color: 'text-amber-500',  bgColor: 'bg-amber-500/10' },
  eeat:             { label: 'E-E-A-T',                icon: ShieldCheck, color: 'text-green-500',  bgColor: 'bg-green-500/10' },
  technicalAI:      { label: 'Technique IA',           icon: Bot,         color: 'text-cyan-500',   bgColor: 'bg-cyan-500/10' },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A': return { text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' }
    case 'B': return { text: 'text-blue-500',    bg: 'bg-blue-500/10 border-blue-500/30' }
    case 'C': return { text: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/30' }
    case 'D': return { text: 'text-orange-500',  bg: 'bg-orange-500/10 border-orange-500/30' }
    default:  return { text: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/30' }
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'passed':  return { label: 'Réussi',         icon: CheckCircle,  color: 'text-green-500',  border: 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900',   badge: 'bg-green-200/50' }
    case 'warning': return { label: 'Avertissement',  icon: AlertTriangle,color: 'text-orange-500', border: 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900', badge: 'bg-orange-200/50' }
    case 'error':   return { label: 'Critique',       icon: AlertCircle,  color: 'text-red-500',    border: 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900',           badge: 'bg-red-200/50' }
    default:        return { label: 'Info',            icon: CheckCircle,  color: 'text-blue-500',   border: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900',       badge: 'bg-blue-200/50' }
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ExpandableCheck({ check }: { check: GeoCheck }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cfg = getStatusConfig(check.status)
  const Icon = cfg.icon

  return (
    <div className={cn('rounded-lg border p-4 transition-all', cfg.border)}>
      <div
        className="flex items-start gap-3 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn('flex-shrink-0 mt-1 p-1.5 rounded-lg', cfg.badge)}>
          <Icon className={cn('h-5 w-5', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white group-hover:underline">
            {check.name}
          </h4>
          <p className="text-sm text-white/50 mt-1">{check.value}</p>
        </div>
        <button className="flex-shrink-0 p-2 hover:bg-surface-200/50 dark:hover:bg-surface-700/50 rounded-lg transition-colors">
          <ChevronDown className={cn('h-4 w-4 text-surface-400 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          <div className="bg-white/[0.03]/50 rounded-lg p-4">
            <h5 className="font-semibold text-white text-sm mb-2">Recommandation</h5>
            <p className="text-sm text-white/50 leading-relaxed">{check.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryCard({
  categoryKey,
  category,
}: {
  categoryKey: CategoryKey
  category: GeoCategory
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cfg = categoryConfig[categoryKey]
  const Icon = cfg.icon
  const passed = category.checks.filter(c => c.status === 'passed').length
  const warnings = category.checks.filter(c => c.status === 'warning').length
  const errors = category.checks.filter(c => c.status === 'error').length

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div
        className="p-5 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('p-2 rounded-lg', cfg.bgColor)}>
            <Icon className={cn('h-5 w-5', cfg.color)} />
          </div>
          <h3 className="font-semibold text-white group-hover:underline">
            {cfg.label}
          </h3>
          <div className="ml-auto flex items-center gap-2">
            <span className={cn('text-lg font-bold', getScoreColor(category.score))}>{category.score}</span>
            <ChevronDown className={cn('h-4 w-4 text-surface-400 transition-transform', isExpanded && 'rotate-180')} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              category.score >= 80 ? 'bg-emerald-500' :
              category.score >= 60 ? 'bg-amber-500' :
              category.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
            )}
            style={{ width: `${category.score}%` }}
          />
        </div>

        {/* Mini summary */}
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-green-600 dark:text-green-400">{passed} reussi{passed > 1 ? 's' : ''}</span>
          <span className="text-orange-600 dark:text-orange-400">{warnings} avert.</span>
          <span className="text-red-600 dark:text-red-400">{errors} critique{errors > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Expanded checks */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
          {category.checks.map((check, idx) => (
            <ExpandableCheck key={idx} check={check} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function GeoAuditPage() {
  const { selectedWebsite } = useWebsite()
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<GeoResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !url) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  // Auto-load latest scan results
  useEffect(() => {
    if (!selectedWebsite?.id || result) return

    let cancelled = false

    async function loadLatestScan() {
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
        const geo = results?.geo
        if (!geo || cancelled) return

        setResult({
          success: true,
          url: scan.url || `https://${selectedWebsite!.domain}`,
          overallScore: geo.overallScore ?? 0,
          grade: geo.grade ?? 'N/A',
          categories: {
            structuredData: geo.categories?.structuredData ?? { score: 0, checks: [] },
            entityClarity: geo.categories?.entityClarity ?? { score: 0, checks: [] },
            citationReadiness: geo.categories?.citationReadiness ?? { score: 0, checks: [] },
            eeat: geo.categories?.eeat ?? { score: 0, checks: [] },
            technicalAI: geo.categories?.technicalAI ?? { score: 0, checks: [] },
          },
          recommendations: geo.recommendations ?? [],
        })
      } catch {
        // Silent fail — user can still trigger manual analysis
      }
    }

    loadLatestScan()
    return () => { cancelled = true }
  }, [selectedWebsite?.id])

  async function handleAnalyze() {
    if (!url.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/geo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'analyse')
      }

      // Enrich with GEO Engine (E-E-A-T, Schema, FAQ) — non-blocking
      try {
        const geoRes = await fetch('/api/geo-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.success) {
            data.eeat = geoData.eeat
            data.schema = geoData.schema
            data.faq = geoData.faq
            data.geoRecommendations = geoData.recommendations
          }
        }
      } catch { /* GEO engine enrichment is optional */ }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const gradeColor = result ? getGradeColor(result.grade) : null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">
          Audit GEO
        </h1>
        <p className="text-white/50 mt-1">
          Évaluez la compatibilité de votre site avec les moteurs de recherche génératifs (SGE, Perplexity, ChatGPT Search)
        </p>
      </div>

      {/* URL input form */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
        <UrlInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          loading={isAnalyzing}
          submitLabel="Analyser GEO"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">Analyse GEO en cours...</p>
              <p className="text-sm text-surface-500 mt-1">Nous evaluons {url} pour les moteurs generatifs</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !isAnalyzing && !error && (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Globe className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Pret pour l&apos;analyse GEO</p>
              <p className="text-sm text-surface-500 mt-1 max-w-md">
                Entrez l&apos;URL de votre site pour évaluer sa compatibilité avec les moteurs de recherche génératifs et obtenir des recommandations personnalisées.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <>
          {/* Score + Grade header */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Circular gauge */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100" cy="100" r="90"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-surface-200 dark:text-surface-700"
                    />
                    <circle
                      cx="100" cy="100" r="90"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${(result.overallScore / 100) * 565} 565`}
                      strokeLinecap="round"
                      className={cn(
                        'transition-all duration-1000',
                        result.overallScore >= 80 && 'text-green-500',
                        result.overallScore >= 60 && result.overallScore < 80 && 'text-amber-500',
                        result.overallScore < 60 && 'text-red-500',
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={cn('text-4xl font-bold', getScoreColor(result.overallScore))}>
                        {result.overallScore}
                      </p>
                      <p className="text-sm text-surface-500 mt-1">/100</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grade badge + info */}
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">
                    Score GEO Global
                  </h2>
                  {gradeColor && (
                    <span className={cn('px-4 py-1.5 rounded-full border text-lg font-bold', gradeColor.bg, gradeColor.text)}>
                      {result.grade}
                    </span>
                  )}
                </div>
                <p className="text-white/50 text-sm">
                  Analyse de <span className="font-medium text-white">{result.url}</span>
                </p>

                {/* Quick stats grid */}
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(result.categories) as CategoryKey[]).map((key) => {
                    const cfg = categoryConfig[key]
                    const cat = result.categories[key]
                    return (
                      <div key={key} className="rounded-lg bg-white/[0.03] p-3 text-center">
                        <p className={cn('text-xl font-bold', getScoreColor(cat.score))}>{cat.score}</p>
                        <p className="text-xs text-white/50 mt-1 truncate">{cfg.label}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Category cards grid */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Analyse par categorie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(Object.keys(result.categories) as CategoryKey[]).map((key) => (
                <CategoryCard key={key} categoryKey={key} category={result.categories[key]} />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-500/10">
                  <Lightbulb className="h-5 w-5 text-brand-500" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Recommandations prioritaires
                </h2>
              </div>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg bg-white/[0.03] p-4"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-white/70 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E-E-A-T Score (from GEO Engine) */}
          {result.eeat && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" /> Score E-E-A-T — {result.eeat.total}/100
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Expérience', score: result.eeat.experience.score },
                  { label: 'Expertise', score: result.eeat.expertise.score },
                  { label: 'Autorite', score: result.eeat.authority.score },
                  { label: 'Confiance', score: result.eeat.trust.score },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 rounded-lg bg-white/[0.02]">
                    <p className="text-xs text-surface-500 mb-1">{item.label}</p>
                    <p className={cn('text-2xl font-black', item.score >= 60 ? 'text-green-600' : item.score >= 40 ? 'text-amber-500' : 'text-red-500')}>
                      {item.score}
                    </p>
                  </div>
                ))}
              </div>
              {result.eeat.experience.recommendations.length > 0 && (
                <div className="space-y-1 mt-3">
                  <p className="text-xs font-bold uppercase text-surface-500">Recommandations E-E-A-T</p>
                  {[...result.eeat.experience.recommendations, ...result.eeat.expertise.recommendations, ...result.eeat.authority.recommendations, ...result.eeat.trust.recommendations].slice(0, 5).map((rec: string, i: number) => (
                    <p key={i} className="text-sm text-white/70 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> {rec}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schema Validation (from GEO Engine) */}
          {result.schema && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-violet-500" /> Validation Schema — {result.schema.score}/100
              </h2>
              {result.schema.found.length > 0 && (
                <div className="space-y-2 mb-3">
                  {result.schema.found.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {s.valid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <span className="font-medium text-white">{s.type}</span>
                      {s.issues.length > 0 && <span className="text-xs text-amber-600">({s.issues.join(', ')})</span>}
                    </div>
                  ))}
                </div>
              )}
              {result.schema.missing.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Schemas manquants</p>
                  <p className="text-sm text-amber-600 dark:text-amber-300">{result.schema.missing.join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* GEO Engine Recommendations */}
          {result.geoRecommendations && result.geoRecommendations.length > 0 && (
            <div className="rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/20 p-6">
              <h2 className="text-lg font-bold text-brand-800 dark:text-brand-300 mb-3">Recommandations GEO avancees</h2>
              <div className="space-y-2">
                {result.geoRecommendations.map((rec: string, i: number) => (
                  <p key={i} className="text-sm text-brand-700 dark:text-brand-400 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" /> {rec}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
