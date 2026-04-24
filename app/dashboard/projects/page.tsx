'use client'

import { useState } from 'react'
import { Globe, Plus, Zap, Link2, BarChart3, Trash2, ExternalLink, Loader2, Search, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const { websites, selectedWebsite, selectWebsite, addWebsite, refreshWebsites } = useWebsite()
  const router = useRouter()
  const [newDomain, setNewDomain] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!newDomain.trim()) { setError('Domaine requis'); return }
    const domain = newDomain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*/, '')
    setAdding(true)
    setError('')
    try {
      await addWebsite(domain, newName || domain)
      setNewDomain('')
      setNewName('')
      setShowForm(false)
      await refreshWebsites()
    } catch (e: any) {
      setError(e.message || 'Erreur lors de l\'ajout')
    } finally {
      setAdding(false)
    }
  }

  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce site et toutes ses données ? Cette action est irréversible.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/websites?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
        return
      }
      await refreshWebsites()
    } catch {
      setError('Erreur réseau lors de la suppression')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-brand-500/10">
              <Globe className="h-6 w-6 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Mes Sites</h1>
          </div>
          <p className="text-sm text-white/40">
            Gérez vos sites web. Sélectionnez un site pour voir ses données dans le dashboard.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter un site
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-4">Ajouter un site</h3>
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-white/40 mb-1">Domaine</label>
              <input
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="exemple.fr"
                className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-white/40 mb-1">Nom (optionnel)</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Mon site principal"
                className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleAdd} disabled={adding} className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sites list */}
      {websites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {websites.map((site) => {
            const isSelected = selectedWebsite?.id === site.id
            return (
              <div
                key={site.id}
                onClick={() => selectWebsite(site.id)}
                className={cn(
                  'rounded-xl border bg-white/[0.03] overflow-hidden cursor-pointer transition-all hover:shadow-md',
                  isSelected
                    ? 'border-brand-400 dark:border-brand-600 ring-2 ring-brand-400/20'
                    : 'border-white/5 hover:border-white/10'
                )}
              >
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                        isSelected ? 'bg-brand-500/10 text-brand-400' : 'bg-white/[0.03] text-white/50'
                      )}>
                        {site.domain.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{site.name || site.domain}</h3>
                        <p className="text-xs text-white/40">{site.domain}</p>
                      </div>
                    </div>
                    {isSelected && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/10 text-brand-400">Actif</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); selectWebsite(site.id); router.push('/dashboard/audit') }}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-colors"
                  >
                    Auditer
                  </button>
                  <a
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:bg-white/[0.05] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(site.id) }}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/[0.03] rounded-xl border border-dashed border-white/10 p-16 text-center">
          <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun site ajoute</h3>
          <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
            Ajoutez votre premier site pour commencer a auditer et suivre votre SEO.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3 rounded-xl">
            <Plus className="w-4 h-4" /> Ajouter un site
          </button>
        </div>
      )}
    </div>
  )
}
