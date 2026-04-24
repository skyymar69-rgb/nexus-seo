'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, AlertCircle, X, Zap, TrendingUp, BarChart3, Search } from 'lucide-react'
import { useAudit, type AuditCheck, type AuditResults } from '@/hooks/useAudit'
import { UrlInput } from '@/components/shared/UrlInput'

// Score circle component
function ScoreCircle({ score }: { score: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  let color = '#10b981' // accent-500 (green)
  let colorClass = 'text-accent-600'

  if (score >= 90) {
    color = '#10b981'
    colorClass = 'text-accent-600'
  } else if (score >= 70) {
    color = '#6366f1'
    colorClass = 'text-brand-600'
  } else if (score >= 50) {
    color = '#f59e0b'
    colorClass = 'text-amber-600'
  } else {
    color = '#ef4444'
    colorClass = 'text-red-600'
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgb(229, 231, 235)"
          strokeWidth="8"
          className="dark:stroke-surface-700"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className={`absolute text-3xl font-bold ${colorClass}`}>{score}</div>
      <div className="absolute translate-y-12 text-xs font-medium text-surface-500 dark:text-surface-400">
        {score >= 90 ? 'Excellent' : score >= 70 ? 'Bon' : score >= 50 ? 'À améliorer' : 'Critique'}
      </div>
    </div>
  )
}

// Summary card
function SummaryCard({
  title,
  value,
  icon: Icon,
  color = 'brand',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: 'brand' | 'accent' | 'amber' | 'red'
}) {
  const bgClasses = {
    brand: 'bg-brand-50 dark:bg-brand-950/30',
    accent: 'bg-accent-50 dark:bg-accent-950/30',
    amber: 'bg-amber-50 dark:bg-amber-950/30',
    red: 'bg-red-50 dark:bg-red-950/30',
  }

  const iconClasses = {
    brand: 'text-brand-600 dark:text-brand-400',
    accent: 'text-accent-600 dark:text-accent-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className={`${bgClasses[color]} rounded-xl p-6 border border-${color}-200 dark:border-${color}-800/30`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
          <div className={iconClasses[color]}>{Icon}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{title}</p>
          <p className="text-2xl font-bold text-surface-900 dark:text-surface-50">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Meta info card
function MetaInfoCard({
  label,
  value,
  maxLength,
  status,
}: {
  label: string
  value: string | null
  maxLength?: number
  status?: 'success' | 'warning' | 'error'
}) {
  if (!value) {
    return (
      <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-2">{label}</p>
        <p className="text-surface-400 dark:text-surface-600 text-sm italic">Non trouvé</p>
      </div>
    )
  }

  const statusColor = {
    success: 'text-accent-600 dark:text-accent-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-2">{label}</p>
          <p className="text-surface-900 dark:text-surface-50 text-sm break-all">{value}</p>
          {maxLength && <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{value.length} caractères</p>}
        </div>
        {status && <div className={`text-lg ${statusColor[status]} flex-shrink-0`}>{status === 'success' ? '✓' : status === 'warning' ? '!' : '✗'}</div>}
      </div>
    </div>
  )
}

// Check item component
function CheckItem({ check, expanded, onToggle }: { check: AuditCheck; expanded: boolean; onToggle: () => void }) {
  const statusIcons = {
    passed: <Check className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
  }

  const statusColors = {
    passed: 'bg-accent-100 dark:bg-accent-900/30 border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-300',
    warning:
      'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  }

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-2.5 rounded-lg border ${statusColors[check.status]}`}>
            {statusIcons[check.status]}
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-surface-900 dark:text-surface-50">{check.name}</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{check.value}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-bold text-lg text-surface-900 dark:text-surface-50">{check.score}</div>
            <div className="text-xs text-surface-500 dark:text-surface-400">/100</div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform text-surface-400 dark:text-surface-500 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 py-4 bg-surface-50 dark:bg-surface-800/30 border-t border-surface-200 dark:border-surface-700">
          <p className="text-sm text-surface-700 dark:text-surface-300">{check.recommendation}</p>
        </div>
      )}
    </div>
  )
}

// Loading spinner
function LoadingSpinner() {
  const statuses = [
    'Connexion au serveur...',
    'Analyse des meta tags...',
    'Vérification du contenu...',
    'Analyse technique...',
    'Calcul du score...',
  ]

  const [statusIndex, setStatusIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-12 h-12 mb-6">
        <svg
          className="absolute inset-0 animate-spin"
          width="100%"
          height="100%"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="31.4 94.2"
            className="text-brand-600 dark:text-brand-400"
          />
        </svg>
      </div>
      <p className="text-surface-600 dark:text-surface-300 font-medium">{statuses[statusIndex]}</p>
    </div>
  )
}

// Main page component
export default function AuditGratuitPage() {
  const { url, setUrl, loading, error, results, runAudit, clearResults } = useAudit()
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'tous' | 'meta' | 'contenu' | 'technique' | 'performance'>('tous')
  const [autoLaunched, setAutoLaunched] = useState(false)

  // Auto-fill and auto-launch from Hero URL param
  useEffect(() => {
    if (autoLaunched || results) return
    const params = new URLSearchParams(window.location.search)
    const urlParam = params.get('url')
    if (urlParam) {
      setUrl(urlParam)
      setAutoLaunched(true)
      setTimeout(() => runAudit(), 200)
    }
  }, [autoLaunched, results, setUrl, runAudit])

  const handleSubmit = () => {
    runAudit()
  }

  const handleNewAudit = () => {
    clearResults()
    setUrl('')
    setActiveTab('tous')
  }

  // Filter checks by category
  const getFilteredChecks = () => {
    if (!results) return []

    if (activeTab === 'tous') return results.checks

    const categoryMap = {
      meta: 'meta',
      contenu: 'content',
      technique: 'technical',
      performance: 'performance',
    }

    return results.checks.filter((check) => check.category === categoryMap[activeTab as keyof typeof categoryMap])
  }

  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl text-surface-900 dark:text-surface-50">
            Nexus
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
          >
            Tableau de bord
          </Link>
        </div>
      </nav>

      {!results ? (
        <>
          {/* Hero Section */}
          <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-surface-900 dark:text-surface-50 mb-4">
                Audit SEO Gratuit
              </h1>
              <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
                Analysez votre site web en 30 secondes. Obtenez un diagnostic complet avec des recommandations actionnables.
              </p>
            </div>

            {/* Input Form */}
            <div className="mb-8">
              <UrlInput
                value={url}
                onChange={setUrl}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Analyser mon site"
                placeholder="https://www.monsite.fr"
              />
            </div>

            {/* Info text */}
            <p className="text-center text-sm text-surface-500 dark:text-surface-400">
              Aucune inscription requise · Résultats instantanés · Export PDF, Markdown, JSON
            </p>

            {/* Error state */}
            {error && (
              <div className="mt-8 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Loading state */}
            {loading && <LoadingSpinner />}
          </section>

          {/* Features Preview */}
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">15+ Contrôles SEO</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Analyse complète des meta tags, contenu, performances et facteurs techniques
                </p>
              </div>

              <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">Résultats Instantanés</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Obtenez votre score SEO et vos recommandations en quelques secondes
                </p>
              </div>

              <div className="p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">Recommandations Actionnables</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Des conseils précis et faciles à mettre en place pour améliorer votre SEO
                </p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Results Header */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 dark:text-surface-50 mb-2">
                  Résultats de l'audit
                </h2>
                <p className="text-surface-600 dark:text-surface-400 break-all">{results.url}</p>
              </div>
              <button
                onClick={handleNewAudit}
                className="px-6 py-3 rounded-lg font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 border border-brand-200 dark:border-brand-800 transition-colors whitespace-nowrap"
              >
                Nouvel audit
              </button>
            </div>
          </section>

          {/* Score Circle Section */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800/50 dark:to-surface-900/50 rounded-2xl p-8 sm:p-12 border border-surface-200 dark:border-surface-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="relative w-32 h-32">
                  <ScoreCircle score={results.score} />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-50 mb-4">
                    {results.score >= 90
                      ? 'Excellent travail!'
                      : results.score >= 70
                        ? 'Bonne base SEO'
                        : results.score >= 50
                          ? 'À améliorer'
                          : 'Optimisation nécessaire'}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-300 mb-6">
                    {results.score >= 90
                      ? 'Votre site est bien optimisé pour le SEO. Continuez avec les meilleures pratiques!'
                      : results.score >= 70
                        ? 'Votre site a une bonne base. Quelques améliorations peuvent encore être faites.'
                        : 'Votre site a besoin de plusieurs optimisations pour améliorer son SEO.'}
                  </p>

                  {results.score < 90 && (
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Améliorer votre SEO <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Summary Cards */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="Tests réussis"
                value={results.summary.passed}
                icon={<Check className="w-6 h-6" />}
                color="accent"
              />
              <SummaryCard
                title="Avertissements"
                value={results.summary.warnings}
                icon={<AlertCircle className="w-6 h-6" />}
                color="amber"
              />
              <SummaryCard
                title="Erreurs"
                value={results.summary.errors}
                icon={<X className="w-6 h-6" />}
                color="red"
              />
              <SummaryCard
                title="Temps de chargement"
                value={`${(results.loadTime / 1000).toFixed(2)}s`}
                icon={<Zap className="w-6 h-6" />}
              />
            </div>
          </section>

          {/* Meta Analysis */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-4">
                Analyse des Meta Tags
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <MetaInfoCard
                label="Title"
                value={results.meta.title}
                maxLength={60}
                status={results.meta.title && results.meta.title.length >= 30 && results.meta.title.length <= 60 ? 'success' : 'warning'}
              />
              <MetaInfoCard
                label="Meta Description"
                value={results.meta.description}
                maxLength={160}
                status={
                  results.meta.description &&
                  results.meta.description.length >= 120 &&
                  results.meta.description.length <= 160
                    ? 'success'
                    : 'warning'
                }
              />
              <MetaInfoCard label="Canonical" value={results.meta.canonical} status={results.meta.canonical ? 'success' : 'warning'} />
              <MetaInfoCard label="OG Title" value={results.meta.ogTitle} status={results.meta.ogTitle ? 'success' : 'warning'} />
              <MetaInfoCard label="OG Description" value={results.meta.ogDescription} status={results.meta.ogDescription ? 'success' : 'warning'} />
              <MetaInfoCard label="OG Image" value={results.meta.ogImage} status={results.meta.ogImage ? 'success' : 'warning'} />
            </div>
          </section>

          {/* Content Analysis */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-4">
                Analyse du Contenu
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <h4 className="font-semibold text-surface-900 dark:text-surface-50 mb-4">Statistiques textuelles</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Nombre de mots</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.wordCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">H1 tags</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.h1Count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">H2 tags</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.h2Count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">H3 tags</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.h3Count}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <h4 className="font-semibold text-surface-900 dark:text-surface-50 mb-4">Ressources multimédia</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Nombre d'images</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.imageCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Avec alt text</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.imagesWithAlt}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Couverture</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">
                      {results.content.imageCount > 0
                        ? Math.round((results.content.imagesWithAlt / results.content.imageCount) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Liens internes</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.internalLinks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600 dark:text-surface-400">Liens externes</span>
                    <span className="font-semibold text-surface-900 dark:text-surface-50">{results.content.externalLinks}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Checks List */}
          <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-4">
                Tous les contrôles SEO
              </h3>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {(['tous', 'meta', 'contenu', 'technique', 'performance'] as const).map((tab) => {
                const labels = {
                  tous: 'Tous',
                  meta: 'Meta',
                  contenu: 'Contenu',
                  technique: 'Technique',
                  performance: 'Performance',
                }

                const counts = {
                  tous: results.checks.length,
                  meta: results.checks.filter((c) => c.category === 'meta').length,
                  contenu: results.checks.filter((c) => c.category === 'content').length,
                  technique: results.checks.filter((c) => c.category === 'technical').length,
                  performance: results.checks.filter((c) => c.category === 'performance').length,
                }

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setExpandedCheck(null)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-brand-600 dark:bg-brand-700 text-white'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50 hover:bg-surface-200 dark:hover:bg-surface-700'
                    }`}
                  >
                    {labels[tab]} ({counts[tab]})
                  </button>
                )
              })}
            </div>

            {/* Checks List */}
            <div className="space-y-3">
              {getFilteredChecks().length === 0 ? (
                <div className="text-center py-8 text-surface-500 dark:text-surface-400">
                  Aucun contrôle trouvé pour cette catégorie
                </div>
              ) : (
                getFilteredChecks().map((check) => (
                  <CheckItem
                    key={check.id}
                    check={check}
                    expanded={expandedCheck === check.id}
                    onToggle={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                  />
                ))
              )}
            </div>
          </section>

          {/* Upsell Section */}
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-center text-surface-900 dark:text-surface-50 mb-4">
                Vous voulez aller plus loin?
              </h2>
              <p className="text-center text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
                Débloquez des fonctionnalités avancées pour optimiser vraiment votre SEO.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 sm:p-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">Audit en profondeur</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Crawl de 5,000+ pages, et pas juste une. Découvrez tous les problèmes SEO.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">Suivi automatique</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Re-audit chaque semaine avec alertes. Restez au courant de vos performances.
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-950/30 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-surface-50 mb-2">AI Visibility</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Découvrez si votre marque apparaît dans les réponses IA et LLM.
                </p>
              </div>
            </div>

            {/* Continuer l'analyse — outils avec URL pré-remplie */}
            <div className="mt-12 p-6 sm:p-8 bg-brand-50 dark:bg-brand-950/20 rounded-2xl border border-brand-200 dark:border-brand-800">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">
                Continuer l&apos;analyse de {url}
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
                Votre audit SEO est terminé. Approfondissez avec nos outils spécialisés — l&apos;URL est déjà pré-remplie.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Audit GEO (IA)', desc: 'Compatibilité moteurs IA', href: '/dashboard/geo-audit', icon: '🌐' },
                  { label: 'Score AEO', desc: 'Featured snippets & PAA', href: '/dashboard/aeo-score', icon: '⚡' },
                  { label: 'Core Web Vitals', desc: 'Performance & vitesse', href: '/dashboard/performance', icon: '🚀' },
                  { label: 'Analyse sémantique', desc: 'Mots-clés & TF-IDF', href: '/dashboard/semantic', icon: '📊' },
                  { label: 'Optimisation contenu', desc: 'Recommandations SEO', href: '/dashboard/content-optimizer', icon: '✏️' },
                  { label: 'Crawl complet', desc: 'Scanner tout le site', href: '/dashboard/crawl', icon: '🕷️' },
                ].map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm transition-all group"
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-brand-600 transition-colors">{tool.label}</div>
                      <div className="text-xs text-surface-500 truncate">{tool.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-surface-400 group-hover:text-brand-500 flex-shrink-0" />
                  </Link>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Créer un compte gratuit pour sauvegarder vos résultats <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── FREE SEO TOOLS SECTION ── */}
      <section id="outils" className="py-20 border-t border-surface-200 dark:border-surface-800">
        <div className="text-center mb-12">
          <span className="section-badge mb-4">Outils gratuits</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mt-4">
            Outils SEO gratuits pour booster votre productivité
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-2xl mx-auto">
            Automatisez vos tâches, améliorez votre positionnement et générez plus de trafic organique avec nos outils gratuits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: 'Audit SEO complet',
              description: 'Analysez n\'importe quelle URL avec 30+ contrôles techniques, meta, contenu, performance et sécurité.',
              href: '#', // Already on this page
              icon: '🔍',
              badge: 'Populaire',
            },
            {
              title: 'Audit GEO (IA)',
              description: 'Évaluez la compatibilité de votre site avec les moteurs IA : données structurées, E-E-A-T, citation readiness.',
              href: '/dashboard/geo-audit',
              icon: '🌐',
              badge: 'Nouveau',
            },
            {
              title: 'Score AEO',
              description: 'Mesurez la préparation de vos pages pour les featured snippets, réponses vocales et People Also Ask.',
              href: '/dashboard/aeo-score',
              icon: '⚡',
              badge: 'Nouveau',
            },
            {
              title: 'Score LLMO',
              description: 'Testez si ChatGPT, Claude, Gemini et Perplexity recommandent votre marque dans leurs réponses.',
              href: '/dashboard/llmo-score',
              icon: '🤖',
              badge: 'Nouveau',
            },
            {
              title: 'Analyse sémantique',
              description: 'Analysez la densité de mots-clés, le TF-IDF, la lisibilité et les clusters sémantiques d\'une page.',
              href: '/dashboard/semantic',
              icon: '📊',
            },
            {
              title: 'Core Web Vitals',
              description: 'Mesurez le TTFB, FCP, LCP, CLS et le score de performance d\'une URL en temps réel.',
              href: '/dashboard/performance',
              icon: '🚀',
            },
            {
              title: 'Crawleur de site',
              description: 'Crawlez jusqu\'à 50 pages d\'un site pour détecter les erreurs techniques, liens brisés et problèmes meta.',
              href: '/dashboard/crawl',
              icon: '🕷️',
            },
            {
              title: 'Optimisation de contenu',
              description: 'Obtenez des recommandations SEO et AEO actionnables pour optimiser n\'importe quelle page.',
              href: '/dashboard/content-optimizer',
              icon: '✏️',
            },
            {
              title: 'Suivi de mots-clés',
              description: 'Suivez vos positions Google sur vos mots-clés cibles et analysez les tendances.',
              href: '/dashboard/keywords',
              icon: '🎯',
            },
            {
              title: 'Analyse de backlinks',
              description: 'Visualisez votre profil de backlinks, ratio dofollow/nofollow et domaines référents.',
              href: '/dashboard/backlinks',
              icon: '🔗',
            },
            {
              title: 'Visibilité IA',
              description: 'Interrogez les LLMs pour savoir si et comment ils mentionnent votre marque.',
              href: '/dashboard/ai-visibility',
              icon: '✨',
            },
            {
              title: 'Générateur de contenu IA',
              description: 'Générez des articles, meta descriptions et FAQ optimisés SEO avec l\'IA.',
              href: '/dashboard/ai-content',
              icon: '🖊️',
            },
          ].map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group relative bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200"
            >
              {tool.badge && (
                <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  tool.badge === 'Nouveau' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400' :
                  'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                }`}>
                  {tool.badge}
                </span>
              )}
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="text-base font-bold text-surface-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-4">
                {tool.description}
              </p>
              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Utiliser l&apos;outil <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
