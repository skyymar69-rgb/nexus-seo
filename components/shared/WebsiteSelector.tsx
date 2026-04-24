'use client'

import { useState, useRef, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Globe, ChevronDown, Plus, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WebsiteSelector() {
  const { websites, selectedWebsite, isLoading, selectWebsite, addWebsite } = useWebsite()
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAdd = async () => {
    if (!newDomain.trim()) return
    const cleaned = newDomain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/^.*@/, '')
    if (cleaned.includes('@')) { setError('Entrez un domaine, pas un email'); return }
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(cleaned)) { setError('Domaine invalide (ex: monsite.fr)'); return }
    setIsAdding(true)
    setError('')
    try {
      const website = await addWebsite(newDomain.trim(), newName.trim() || undefined)
      if (website) {
        setNewDomain('')
        setNewName('')
        setShowAddForm(false)
        setIsOpen(false)
      }
    } catch (err: any) {
      const msg = err?.message || 'Erreur lors de l\'ajout'
      if (msg.includes('Non autorisé') || msg.includes('401')) {
        setError('Connectez-vous pour ajouter un site')
      } else {
        setError(msg)
      }
    }
    setIsAdding(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700">
        <Loader2 className="h-4 w-4 animate-spin text-surface-500" />
        <span className="text-sm text-surface-500">Chargement...</span>
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-800 border border-surface-700 hover:border-surface-600 transition-colors w-full min-w-[220px]"
      >
        <div className="p-1.5 rounded-md bg-brand-500/15">
          <Globe className="h-4 w-4 text-brand-400" />
        </div>
        <div className="flex-1 text-left min-w-0">
          {selectedWebsite ? (
            <>
              <p className="text-sm font-medium text-surface-100 truncate">
                {selectedWebsite.name || selectedWebsite.domain}
              </p>
              <p className="text-xs text-surface-500 truncate">{selectedWebsite.domain}</p>
            </>
          ) : (
            <p className="text-sm text-surface-400">Selectionnez un site</p>
          )}
        </div>
        {selectedWebsite?.latestAudit && (
          <div className={cn(
            'px-2 py-0.5 rounded text-xs font-bold',
            selectedWebsite.latestAudit.score >= 80 ? 'bg-green-500/20 text-green-400' :
            selectedWebsite.latestAudit.score >= 50 ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {selectedWebsite.latestAudit.score}
          </div>
        )}
        <ChevronDown className={cn('h-4 w-4 text-surface-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg bg-surface-800 border border-surface-700 shadow-xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {websites.map((website) => (
              <button
                key={website.id}
                onClick={() => {
                  selectWebsite(website.id)
                  setIsOpen(false)
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 w-full hover:bg-surface-700 transition-colors',
                  selectedWebsite?.id === website.id && 'bg-surface-700/50'
                )}
              >
                <Globe className="h-4 w-4 text-surface-500 shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-surface-200 truncate">
                    {website.name || website.domain}
                  </p>
                  <p className="text-xs text-surface-500 truncate">{website.domain}</p>
                </div>
                {selectedWebsite?.id === website.id && (
                  <Check className="h-4 w-4 text-brand-400 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-3 w-full border-t border-surface-700 hover:bg-surface-700/50 transition-colors text-brand-400"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Ajouter un site</span>
            </button>
          ) : (
            <div className="border-t border-surface-700 p-3 space-y-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                aria-label="Domaine du site"
                className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-600 text-surface-100 text-sm placeholder:text-surface-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du site (optionnel)"
                aria-label="Nom du site"
                className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-600 text-surface-100 text-sm placeholder:text-surface-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              {error && (
                <p className="text-xs text-red-400 px-1">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isAdding || !newDomain.trim()}
                  className="flex-1 px-3 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Ajouter
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewDomain(''); setNewName('') }}
                  className="px-3 py-2 rounded-lg bg-surface-700 text-surface-300 text-sm hover:bg-surface-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
