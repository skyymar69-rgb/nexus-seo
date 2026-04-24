'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Home, Zap, Globe, FileSearch, FileText, TrendingUp,
  Wand2, Eye, BookOpen, Tag, LinkIcon, ShieldCheck, Users,
  Lightbulb, LayoutTemplate, Sparkles, LineChart, BarChart3, Settings,
  FolderOpen, X, MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tool {
  label: string
  href: string
  icon: any
  category: string
  keywords: string[]
}

const tools: Tool[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, category: 'SEO', keywords: ['accueil', 'tableau de bord'] },
  { label: 'Audit de Site', href: '/dashboard/audit', icon: Search, category: 'SEO', keywords: ['analyse', 'seo', 'audit'] },
  { label: 'Performance', href: '/dashboard/performance', icon: Zap, category: 'SEO', keywords: ['vitesse', 'core web vitals'] },
  { label: 'Domain Overview', href: '/dashboard/domain-overview', icon: Globe, category: 'SEO', keywords: ['domaine'] },
  { label: 'Top Pages', href: '/dashboard/top-pages', icon: FileSearch, category: 'SEO', keywords: ['pages'] },
  { label: 'Comparaison', href: '/dashboard/compare', icon: Eye, category: 'SEO', keywords: ['comparer', 'vs'] },
  { label: 'Suivi Positions', href: '/dashboard/rank-tracker', icon: TrendingUp, category: 'Mots-clés', keywords: ['positions'] },
  { label: 'Keyword Magic', href: '/dashboard/keyword-magic', icon: Wand2, category: 'Mots-clés', keywords: ['mots clés'] },
  { label: 'Keyword Gap', href: '/dashboard/keyword-gap', icon: Eye, category: 'Mots-clés', keywords: ['concurrent'] },
  { label: 'Sémantique', href: '/dashboard/semantic', icon: BookOpen, category: 'Mots-clés', keywords: ['sémantique'] },
  { label: 'Profil Backlinks', href: '/dashboard/backlinks', icon: LinkIcon, category: 'Backlinks', keywords: ['liens'] },
  { label: 'Backlink Audit', href: '/dashboard/backlink-audit', icon: ShieldCheck, category: 'Backlinks', keywords: ['qualité'] },
  { label: 'Concurrents', href: '/dashboard/competitors', icon: Users, category: 'Backlinks', keywords: ['concurrence'] },
  { label: 'Content Optimizer', href: '/dashboard/content-optimizer', icon: Wand2, category: 'Contenu', keywords: ['contenu'] },
  { label: 'Génération IA', href: '/dashboard/ai-content', icon: Sparkles, category: 'Contenu', keywords: ['ia', 'générer'] },
  { label: 'Content Analyzer', href: '/dashboard/content-analyzer', icon: FileSearch, category: 'Contenu', keywords: ['analyser'] },
  { label: 'Crawleur Web', href: '/dashboard/crawl', icon: Globe, category: 'Contenu', keywords: ['crawl'] },
  { label: 'Visibilité IA', href: '/dashboard/ai-visibility', icon: Sparkles, category: 'IA & GEO', keywords: ['chatgpt', 'claude'] },
  { label: 'Audit GEO', href: '/dashboard/geo-audit', icon: Globe, category: 'IA & GEO', keywords: ['geo'] },
  { label: 'Score AEO', href: '/dashboard/aeo-score', icon: Zap, category: 'IA & GEO', keywords: ['aeo'] },
  { label: 'Score LLMO', href: '/dashboard/llmo-score', icon: TrendingUp, category: 'IA & GEO', keywords: ['llmo'] },
  { label: 'AI Advisor', href: '/dashboard/ai-advisor', icon: Lightbulb, category: 'IA & GEO', keywords: ['conseils'] },
  { label: 'Prompt Tester', href: '/dashboard/prompt-tester', icon: Sparkles, category: 'IA & GEO', keywords: ['prompt'] },
  { label: 'Générateur llms.txt', href: '/dashboard/llms-txt', icon: FileText, category: 'IA & GEO', keywords: ['llms.txt'] },
  { label: 'Google My Business', href: '/dashboard/gmb-config', icon: MapPin, category: 'IA & GEO', keywords: ['gmb', 'google'] },
  { label: 'Analytics', href: '/dashboard/analytics', icon: LineChart, category: 'Rapports', keywords: ['statistiques'] },
  { label: 'Rapports', href: '/dashboard/reports', icon: BarChart3, category: 'Rapports', keywords: ['rapport'] },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings, category: 'Config', keywords: ['config'] },
  { label: 'Mes Sites', href: '/dashboard/projects', icon: FolderOpen, category: 'Config', keywords: ['sites'] },
  { label: 'Parrainage', href: '/dashboard/referral', icon: Users, category: 'Config', keywords: ['referral'] },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const filtered = query.trim()
    ? tools.filter(t => {
        const q = query.toLowerCase()
        return t.label.toLowerCase().includes(q) || t.keywords.some(k => k.includes(q)) || t.category.toLowerCase().includes(q)
      })
    : tools

  useEffect(() => { setSelectedIndex(0) }, [query])

  const handleSelect = useCallback((href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }, [router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex].href) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-surface-200 dark:border-surface-700">
            <Search className="w-5 h-5 text-surface-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un outil..."
              className="w-full py-4 bg-transparent outline-none text-sm text-surface-900 dark:text-surface-100 placeholder-surface-400"
              autoFocus
            />
            <button onClick={() => setOpen(false)} className="shrink-0 p-1 rounded hover:bg-surface-100 dark:hover:bg-surface-800">
              <X className="w-4 h-4 text-surface-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2 px-2">
            {filtered.length === 0 && (
              <div className="py-6 text-center text-sm text-surface-500">Aucun outil trouvé.</div>
            )}
            {filtered.map((tool, i) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.href}
                  onClick={() => handleSelect(tool.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                    i === selectedIndex
                      ? 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{tool.label}</span>
                  <span className="text-[10px] text-surface-400 uppercase tracking-wider">{tool.category}</span>
                </button>
              )
            })}
          </div>

          {/* Footer hints */}
          <div className="border-t border-surface-200 dark:border-surface-700 px-4 py-2 flex items-center gap-4 text-[10px] text-surface-400">
            <span><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">↑↓</kbd> naviguer</span>
            <span><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">↵</kbd> ouvrir</span>
            <span><kbd className="px-1 py-0.5 rounded bg-surface-100 dark:bg-surface-800 font-mono">esc</kbd> fermer</span>
          </div>
        </div>
      </div>
    </div>
  )
}
