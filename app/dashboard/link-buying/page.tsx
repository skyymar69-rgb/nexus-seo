'use client'

import { useState } from 'react'
import { ShoppingCart, ExternalLink, Globe, TrendingUp, Shield, Filter, Search, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkOpportunity {
  id: string
  domain: string
  da: number
  dr: number
  traffic: string
  category: string
  type: 'guest-post' | 'editorial' | 'niche-edit' | 'directory'
  price: string
  turnaround: string
  languages: string[]
  rating: number
}

const mockOpportunities: LinkOpportunity[] = [
  { id: '1', domain: 'techblog.fr', da: 52, dr: 48, traffic: '25K/mois', category: 'Tech', type: 'guest-post', price: 'Gratuit (echange)', turnaround: '5-7 jours', languages: ['fr'], rating: 4.5 },
  { id: '2', domain: 'marketing-digital.com', da: 45, dr: 42, traffic: '18K/mois', category: 'Marketing', type: 'editorial', price: 'Gratuit (echange)', turnaround: '3-5 jours', languages: ['fr'], rating: 4.2 },
  { id: '3', domain: 'annuaire-pro.fr', da: 38, dr: 35, traffic: '12K/mois', category: 'Annuaire', type: 'directory', price: 'Gratuit', turnaround: '1-2 jours', languages: ['fr'], rating: 3.8 },
  { id: '4', domain: 'startup-mag.io', da: 55, dr: 51, traffic: '40K/mois', category: 'Business', type: 'niche-edit', price: 'Gratuit (echange)', turnaround: '7-10 jours', languages: ['fr', 'en'], rating: 4.7 },
  { id: '5', domain: 'web-actu.fr', da: 42, dr: 39, traffic: '15K/mois', category: 'Web', type: 'guest-post', price: 'Gratuit (echange)', turnaround: '5-7 jours', languages: ['fr'], rating: 4.0 },
  { id: '6', domain: 'seo-journal.com', da: 60, dr: 56, traffic: '50K/mois', category: 'SEO', type: 'editorial', price: 'Gratuit (contribution)', turnaround: '10-14 jours', languages: ['fr', 'en'], rating: 4.8 },
  { id: '7', domain: 'pme-magazine.fr', da: 48, dr: 44, traffic: '22K/mois', category: 'Business', type: 'guest-post', price: 'Gratuit (echange)', turnaround: '5-7 jours', languages: ['fr'], rating: 4.3 },
  { id: '8', domain: 'dev-community.io', da: 50, dr: 47, traffic: '30K/mois', category: 'Dev', type: 'niche-edit', price: 'Gratuit (open source)', turnaround: '3-5 jours', languages: ['en', 'fr'], rating: 4.4 },
]

const typeLabels: Record<string, string> = {
  'guest-post': 'Guest Post',
  'editorial': 'Editorial',
  'niche-edit': 'Niche Edit',
  'directory': 'Annuaire',
}

const typeColors: Record<string, string> = {
  'guest-post': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  'editorial': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  'niche-edit': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'directory': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
}

function DABadge({ value }: { value: number }) {
  const color = value >= 50 ? 'text-green-600' : value >= 30 ? 'text-amber-600' : 'text-red-600'
  return <span className={cn('text-sm font-bold tabular-nums', color)}>{value}</span>
}

export default function LinkBuyingPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [minDA, setMinDA] = useState(0)

  const filtered = mockOpportunities.filter(o => {
    if (search && !o.domain.includes(search.toLowerCase()) && !o.category.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && o.type !== typeFilter) return false
    if (o.da < minDA) return false
    return true
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Opportunites de Liens</h1>
          <p className="text-sm text-surface-500">Trouvez des opportunités de backlinks gratuits et de qualité</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
        <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">100% Gratuit — Aucun achat de lien</p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-1">Nexus vous propose uniquement des opportunités de liens naturels : guest posts, contributions éditoriales, annuaires de qualité. Conformité Google Webmaster Guidelines.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Opportunites', value: mockOpportunities.length, icon: Globe, color: 'text-brand-600' },
          { label: 'DA moyen', value: Math.round(mockOpportunities.reduce((s, o) => s + o.da, 0) / mockOpportunities.length), icon: TrendingUp, color: 'text-green-600' },
          { label: 'Gratuites', value: `${mockOpportunities.length}/${mockOpportunities.length}`, icon: ShoppingCart, color: 'text-amber-600' },
          { label: 'Fiabilite', value: '4.3/5', icon: Shield, color: 'text-violet-600' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-surface-500 uppercase tracking-wider">{stat.label}</span>
                <Icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <span className={cn('text-2xl font-black', stat.color)}>{stat.value}</span>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02]">
          <Search className="w-4 h-4 text-surface-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un domaine..." className="flex-1 bg-transparent outline-none text-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-sm">
          <option value="all">Tous les types</option>
          <option value="guest-post">Guest Post</option>
          <option value="editorial">Editorial</option>
          <option value="niche-edit">Niche Edit</option>
          <option value="directory">Annuaire</option>
        </select>
        <select value={minDA} onChange={e => setMinDA(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-sm">
          <option value={0}>DA minimum: 0+</option>
          <option value={30}>DA 30+</option>
          <option value={40}>DA 40+</option>
          <option value={50}>DA 50+</option>
        </select>
      </div>

      {/* Opportunities list */}
      <div className="space-y-3">
        {filtered.map(opp => (
          <div key={opp.id} className="bg-white/[0.03] rounded-xl border border-white/5 p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-surface-400" />
                  <span className="font-bold text-white">{opp.domain}</span>
                  <span className={cn('px-2 py-0.5 text-[10px] font-bold rounded-full', typeColors[opp.type])}>
                    {typeLabels[opp.type]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span>Categorie: {opp.category}</span>
                  <span>Trafic: {opp.traffic}</span>
                  <span>Delai: {opp.turnaround}</span>
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500" />{opp.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] text-surface-400 uppercase">DA</div>
                  <DABadge value={opp.da} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-surface-400 uppercase">DR</div>
                  <DABadge value={opp.dr} />
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-surface-400 uppercase">Prix</div>
                  <span className="text-xs font-bold text-green-600">{opp.price}</span>
                </div>
                <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center gap-1">
                  Contacter <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-500">
            <Search className="w-8 h-8 mx-auto mb-3 text-surface-300" />
            <p>Aucune opportunité trouvée avec ces filtres.</p>
          </div>
        )}
      </div>
    </div>
  )
}
