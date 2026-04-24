'use client'

import { useState } from 'react'
import { Globe, ChevronDown, Search, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UrlInputProps {
  value: string
  onChange: (url: string) => void
  onSubmit: () => void
  loading?: boolean
  submitLabel?: string
  placeholder?: string
  className?: string
  domain?: string
  websites?: { id: string; domain: string }[]
}

export function UrlInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  submitLabel = 'Analyser',
  placeholder,
  className,
  domain = '',
  websites = [],
}: UrlInputProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const siteUrl = domain ? `https://${domain}` : ''

  const quickOptions = [
    ...(domain ? [
      { label: `${domain} (site principal)`, url: siteUrl, icon: Globe },
      { label: `${domain}/sitemap.xml`, url: `${siteUrl}/sitemap.xml`, icon: FileText },
    ] : []),
    ...(websites || [])
      .filter(w => w.domain !== domain)
      .slice(0, 3)
      .map(w => ({
        label: w.domain,
        url: `https://${w.domain}`,
        icon: ExternalLink,
      })),
  ]

  const handleSelect = (url: string) => {
    onChange(url)
    setShowDropdown(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => quickOptions.length > 0 && !value && setShowDropdown(true)}
            placeholder={placeholder || (domain ? `https://${domain}` : 'https://exemple.com')}
            aria-label="URL du site web à analyser"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
          />
          {quickOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <ChevronDown className={cn('w-4 h-4 text-surface-400 transition-transform', showDropdown && 'rotate-180')} />
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider border-b border-surface-100 dark:border-surface-800">
                  Accès rapide
                </div>
                {quickOptions.map((opt) => (
                  <button
                    key={opt.url}
                    type="button"
                    onClick={() => handleSelect(opt.url)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left"
                  >
                    <opt.icon className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
                <div className="border-t border-surface-100 dark:border-surface-800">
                  <button
                    type="button"
                    onClick={() => { onChange(''); setShowDropdown(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left"
                  >
                    <Search className="w-4 h-4 flex-shrink-0" />
                    <span>Saisir une autre URL...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className={cn(
            'px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            loading && 'animate-pulse'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyse...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {submitLabel}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
