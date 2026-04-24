'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MapPin, Loader2, Copy, Check, Download, Clock, Star, FileText, Sparkles, Building2, Phone, Mail, Globe, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant / Restauration' },
  { value: 'agence-web', label: 'Agence web / Marketing digital' },
  { value: 'commerce', label: 'Commerce / Boutique' },
  { value: 'artisan', label: 'Artisan / Services' },
  { value: 'sante', label: 'Sante / Medical' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'autre', label: 'Autre' },
]

export default function GMBConfigPage() {
  const [form, setForm] = useState({
    businessName: '', category: '', address: '', city: '', postalCode: '',
    phone: '', email: '', website: '', description: '', services: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleGenerate = async () => {
    if (!form.businessName || !form.category) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/gmb-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) setResult(data.config)
      else setError(data.error)
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Google My Business</h1>
          <p className="text-sm text-surface-500">Configurez votre fiche Google My Business pour le SEO local</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nom de l&apos;entreprise *</label>
            <input type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Kayzen Web" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Categorie *</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm">
              <option value="">Choisir...</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Adresse</label>
            <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="6 rue Pierre Termier" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Ville</label>
              <input type="text" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Lyon" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Code postal</label>
              <input type="text" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="69009" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Telephone</label>
            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+33 4 87 77 68 61" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Site web</label>
            <input type="text" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://votresite.fr" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Description de l&apos;activité</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Décrivez votre activité en quelques phrases..." rows={3} className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm resize-none" />
        </div>
        <button onClick={handleGenerate} disabled={loading || !form.businessName || !form.category} className="btn-primary px-6 py-3 rounded-xl w-full disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {loading ? 'Génération...' : 'Générer la configuration GMB'}
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 text-sm">{error}</div>}

      {result && (
        <>
          {/* Business Info Card */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-brand-500" /> Informations optimisées</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs font-bold text-surface-500 mb-1">NOM (tel qu&apos;il apparaîtra sur Google)</p>
                <p className="text-sm font-semibold text-white">{result.businessInfo.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-xs font-bold text-surface-500 mb-1">CATEGORIE PRINCIPALE</p>
                <p className="text-sm text-white">{result.businessInfo.category}</p>
                <p className="text-xs text-surface-400 mt-1">Sous-catégories suggérées: {result.businessInfo.subcategories.join(', ')}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-surface-500">DESCRIPTION OPTIMISEE ({result.businessInfo.description.length}/750)</p>
                  <button onClick={() => copyText(result.businessInfo.description, 'desc')} className="text-xs text-brand-600 flex items-center gap-1">
                    {copied === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copier
                  </button>
                </div>
                <p className="text-sm text-white/70">{result.businessInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-3">Attributs a activer</h3>
            <div className="flex flex-wrap gap-2">
              {result.attributes.map((attr: string, i: number) => (
                <span key={i} className="px-3 py-1.5 text-xs font-medium rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                  {attr}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-3">Services a ajouter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.services.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] text-sm text-white/70">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Posts suggestions */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-3">Google Posts suggeres</h3>
            <div className="space-y-3">
              {result.posts.map((post: any, i: number) => (
                <div key={i} className="p-4 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">{post.type}</span>
                    <span className="text-sm font-semibold text-white">{post.title}</span>
                  </div>
                  <p className="text-xs text-white/50 mb-2">{post.content}</p>
                  <button onClick={() => copyText(post.content, `post-${i}`)} className="text-xs text-brand-600 flex items-center gap-1">
                    {copied === `post-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copier le texte
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Schema LocalBusiness */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]/50">
              <span className="text-sm font-mono text-white/50">Schema LocalBusiness JSON-LD</span>
              <button onClick={() => copyText(result.schema, 'schema')} className="text-xs text-brand-600 flex items-center gap-1">
                {copied === 'schema' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copier
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-white/70 overflow-x-auto max-h-60 overflow-y-auto">{result.schema}</pre>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-brand-50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-800 p-5">
              <h3 className="font-bold text-brand-800 dark:text-brand-300 mb-3 flex items-center gap-2"><Star className="w-4 h-4" /> SEO Local</h3>
              <ul className="space-y-2">
                {result.seoRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-xs text-brand-700 dark:text-brand-400 flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-5">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> GEO & IA</h3>
              <ul className="space-y-2">
                {result.geoRecommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" /> {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
