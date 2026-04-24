import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Check, X, AlertTriangle, ExternalLink, Printer } from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const report = await findReport(params.id)
  if (!report) return { title: 'Rapport non trouvé' }

  return {
    title: `Audit SEO — ${report.domain} | Nexus SEO`,
    description: `Score SEO: ${report.score}/100 (${report.grade}). Rapport d'audit complet généré par Nexus SEO.`,
    openGraph: {
      title: `Audit SEO — ${report.domain}: ${report.score}/100`,
      description: `Rapport d'audit SEO détaillé. Score: ${report.score}/100.`,
      images: [`/api/og?title=Audit+SEO+${report.domain}&score=${report.score}`],
    },
  }
}

async function findReport(shareId: string) {
  try {
    const reports = await prisma.report.findMany({
      where: { type: 'shared-audit' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    for (const report of reports) {
      try {
        const data = JSON.parse(report.data || '{}')
        if (data.shareId === shareId) return data
      } catch { continue }
    }
    return null
  } catch { return null }
}

export default async function PublicReportPage({ params }: { params: { id: string } }) {
  const report = await findReport(params.id)
  if (!report) notFound()

  const checks = report.checks ? JSON.parse(report.checks) : []
  const meta = report.metaData ? JSON.parse(report.metaData) : {}
  const content = report.contentData ? JSON.parse(report.contentData) : {}

  const passed = checks.filter((c: any) => c.status === 'passed').length
  const warnings = checks.filter((c: any) => c.status === 'warning').length
  const errors = checks.filter((c: any) => c.status === 'error').length

  const scoreColor = report.score >= 80 ? 'text-green-600' : report.score >= 60 ? 'text-amber-500' : 'text-red-500'

  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-full mb-4">
              <span className="text-brand-600 text-sm font-bold">Rapport d&apos;audit SEO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-2">{report.domain}</h1>
            <p className="text-surface-500">{report.url}</p>
            <p className="text-xs text-surface-400 mt-2">
              Généré le {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Score */}
          <div className="flex justify-center mb-10">
            <div className="text-center">
              <span className={`text-7xl font-black ${scoreColor}`}>{report.score}</span>
              <span className="text-2xl text-surface-400 font-bold">/100</span>
              <p className={`text-lg font-bold mt-2 ${scoreColor}`}>Grade {report.grade}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-2xl font-black text-green-600">{passed}</p>
              <p className="text-xs text-green-700">Réussis</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-2xl font-black text-amber-600">{warnings}</p>
              <p className="text-xs text-amber-700">Avertissements</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-2xl font-black text-red-600">{errors}</p>
              <p className="text-xs text-red-700">Erreurs</p>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2 mb-10">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Détail des contrôles</h2>
            {checks.map((check: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
                {check.status === 'passed' ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{check.name}</span>
                  <span className="text-xs text-surface-500 ml-2">{check.value}</span>
                </div>
                <span className={`text-sm font-bold ${check.score >= 80 ? 'text-green-600' : check.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                  {check.score}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600">
            <h3 className="text-xl font-bold text-white mb-2">Lancez votre propre audit gratuit</h3>
            <p className="text-white/70 mb-4">50+ outils SEO & IA. 100% gratuit.</p>
            <a href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-bold hover:bg-surface-50 transition-colors">
              Créer mon compte <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-center text-xs text-surface-400 mt-8">
            Généré par <a href="https://nexus.kayzen-lyon.fr" className="text-brand-500 hover:underline">Nexus SEO</a> — Outil SEO & IA gratuit par Kayzen Web
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
