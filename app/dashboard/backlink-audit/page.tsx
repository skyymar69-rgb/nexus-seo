'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Link2, Shield, AlertTriangle, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'

interface Backlink {
  id: string
  sourceUrl: string
  sourceDomain: string
  anchorText: string | null
  da: number
  dr: number
  linkType: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
  spamScore: number
  status: 'active' | 'lost' | 'broken'
}

type Quality = 'good' | 'medium' | 'toxic'

function scoreBacklink(b: Backlink): Quality {
  if (b.spamScore > 50 || b.da < 10) return 'toxic'
  if (b.da > 30 && b.linkType === 'dofollow') return 'good'
  return 'medium'
}

const qualityConfig: Record<Quality, { label: string; color: string; bg: string }> = {
  good: { label: 'Bon', color: 'text-green-700', bg: 'bg-green-100' },
  medium: { label: 'Moyen', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  toxic: { label: 'Toxique', color: 'text-red-700', bg: 'bg-red-100' },
}

export default function BacklinkAuditPage() {
  const { selectedWebsite } = useWebsite()
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedWebsite) return
    setLoading(true)
    setError('')
    fetch(`/api/backlinks?websiteId=${selectedWebsite.id}`)
      .then(r => r.ok ? r.json() : Promise.reject('Erreur de chargement'))
      .then(data => setBacklinks(Array.isArray(data) ? data : data.backlinks || []))
      .catch(() => setError('Impossible de charger les backlinks.'))
      .finally(() => setLoading(false))
  }, [selectedWebsite])

  const scored = useMemo(() => backlinks.map(b => ({ ...b, quality: scoreBacklink(b) })), [backlinks])

  const stats = useMemo(() => {
    const total = scored.length
    if (!total) return null
    const good = scored.filter(b => b.quality === 'good').length
    const medium = scored.filter(b => b.quality === 'medium').length
    const toxic = scored.filter(b => b.quality === 'toxic').length
    const dofollow = scored.filter(b => b.linkType === 'dofollow').length
    const nofollow = total - dofollow
    const overallScore = Math.round(((good * 100 + medium * 50) / total))
    return { total, good, medium, toxic, dofollow, nofollow, dofollowPct: Math.round((dofollow / total) * 100), nofollowPct: Math.round((nofollow / total) * 100), overallScore }
  }, [scored])

  if (!selectedWebsite) {
    return <div className="p-8 text-center text-white/40">Veuillez sélectionner un site web pour commencer l&apos;audit.</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-white">Audit des Backlinks</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Analyse des backlinks en cours...</span>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {!loading && !error && scored.length === 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-12 text-center">
          <Link2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/40 text-lg">Aucun backlink trouvé pour ce site.</p>
          <p className="text-white/30 mt-1">Les backlinks apparaîtront ici une fois détectés.</p>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5">
              <p className="text-sm text-white/40">Score global</p>
              <p className="text-3xl font-bold text-white">{stats.overallScore}<span className="text-lg text-white/30">/100</span></p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5">
              <p className="text-sm text-white/40">Ratio Dofollow / Nofollow</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-3 bg-white/[0.03] rounded-full overflow-hidden flex">
                  <div className="bg-blue-500 h-full" style={{ width: `${stats.dofollowPct}%` }} />
                  <div className="bg-white/10 h-full" style={{ width: `${stats.nofollowPct}%` }} />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-1">{stats.dofollowPct}% dofollow / {stats.nofollowPct}% nofollow</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <p className="text-sm text-white/40">Bons liens</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.good}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-white/40">Liens toxiques</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.toxic}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Domaine source</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Texte d&apos;ancre</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">DA</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">DR</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">Type</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">Statut</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">Qualité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scored.map(b => {
                    const q = qualityConfig[b.quality]
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <a href={b.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            {b.sourceDomain} <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-white/70 max-w-[200px] truncate">{b.anchorText || '-'}</td>
                        <td className="px-4 py-3 text-center font-medium">{b.da}</td>
                        <td className="px-4 py-3 text-center font-medium">{b.dr}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${b.linkType === 'dofollow' ? 'bg-blue-100 text-blue-700' : 'bg-white/[0.03] text-white/50'}`}>
                            {b.linkType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'active' ? 'bg-green-100 text-green-700' : b.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.bg} ${q.color}`}>{q.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toxic links disavow section */}
          {stats.toxic > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-300">
                    {stats.toxic} lien{stats.toxic > 1 ? 's' : ''} toxique{stats.toxic > 1 ? 's' : ''} détecté{stats.toxic > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Ces liens peuvent nuire à votre classement. Utilisez l&apos;outil de désaveu de Google.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Liens à désavouer :</h4>
                {scored.filter(b => b.quality === 'toxic').map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-2 border border-red-100 dark:border-red-900">
                    <span className="text-sm text-red-700 dark:text-red-400 truncate">{b.sourceDomain}</span>
                    <span className="text-xs text-red-500">Spam: {b.spamScore}% | DA: {b.da}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const lines = scored.filter(b => b.quality === 'toxic').map(b => `domain:${b.sourceDomain}`)
                    const content = `# Fichier de désaveu Google\n# Généré par Nexus SEO — ${new Date().toLocaleDateString('fr-FR')}\n# Soumettez ce fichier sur https://search.google.com/search-console/disavow-links\n\n${lines.join('\n')}`
                    const blob = new Blob([content], { type: 'text/plain' })
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
                    a.download = `disavow-${selectedWebsite?.domain || 'site'}.txt`
                    a.click()
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Télécharger le fichier de désaveu (.txt)
                </button>
                <a
                  href="https://search.google.com/search-console/disavow-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Ouvrir l&apos;outil Google Disavow
                </a>
              </div>

              <div className="bg-white/[0.03] rounded-lg p-4 border border-red-100 dark:border-red-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Comment utiliser le fichier de désaveu</h4>
                <ol className="text-sm text-red-700 dark:text-red-400 space-y-1 list-decimal pl-4">
                  <li>Télécharger le fichier .txt ci-dessus</li>
                  <li>Aller sur Google Search Console &gt; Désavouer des liens</li>
                  <li>Sélectionner votre propriété</li>
                  <li>Importer le fichier .txt</li>
                  <li>Attendre quelques semaines que Google traite le désaveu</li>
                </ol>
              </div>
            </div>
          )}

          {/* Health recommendations */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4">Recommandations</h3>
            <ul className="space-y-2">
              {stats.overallScore < 50 && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  Votre profil de backlinks est de mauvaise qualité. Priorisez le désaveu des liens toxiques.
                </li>
              )}
              {stats.dofollowPct < 50 && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  Ratio dofollow faible ({stats.dofollowPct}%). Cherchez des opportunités de liens dofollow.
                </li>
              )}
              {stats.good < stats.total * 0.5 && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  Moins de 50% de vos liens sont de bonne qualité. Focalisez-vous sur le guest blogging et les liens éditoriaux.
                </li>
              )}
              {stats.overallScore >= 70 && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Bon profil de backlinks ! Continuez à développer des liens de qualité.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
