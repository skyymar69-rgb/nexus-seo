'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Globe, ArrowRight, Check, Loader2, AlertCircle, Sparkles, Shield, Search } from 'lucide-react'

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

function cleanDomain(input: string): string {
  return input.trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/^.*@/, '')
}

function isValidDomain(domain: string): boolean {
  if (!domain) return false
  if (domain.includes('@')) return false
  return DOMAIN_REGEX.test(domain)
}

const SCAN_FEATURES = [
  { icon: Shield, label: 'Audit technique SEO', desc: '25+ vérifications' },
  { icon: Sparkles, label: 'Score AEO & GEO', desc: 'Visibilité IA complète' },
  { icon: Search, label: 'Crawl du site', desc: 'Analyse de toutes vos pages' },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const { refreshWebsites } = useWebsite()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [domain, setDomain] = useState('')
  const [siteName, setSiteName] = useState('')
  const [domainTouched, setDomainTouched] = useState(false)

  const cleaned = cleanDomain(domain)
  const domainValid = isValidDomain(cleaned)
  const domainHasError = domainTouched && domain.trim().length > 0 && !domainValid

  const handleSubmit = async () => {
    setDomainTouched(true)

    if (!domain.trim()) { setError('Veuillez entrer le domaine de votre site.'); return }
    if (domain.includes('@')) { setError('Entrez un domaine (ex: monsite.fr), pas une adresse email.'); return }
    if (!domainValid) { setError('Format invalide. Exemple : monsite.fr'); return }

    setLoading(true)
    setError('')

    try {
      // 1. Create website
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleaned, name: siteName || cleaned }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'ajout du site')
      }

      const websiteData = await res.json()
      await refreshWebsites()

      // 2. Launch full scan (synchrone — attend la fin)
      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: websiteData.data?.id || websiteData.id,
          url: 'https://' + cleaned,
        }),
      })

      // Redirect to dashboard whether scan succeeded or not
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-950">
      <div className="w-full max-w-lg">
        {/* Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Bienvenue {session?.user?.name ? `, ${session.user.name}` : ''} !
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Analysons votre site
          </h1>
          <p className="text-white/50 text-sm">
            Entrez votre domaine et on lance un scan complet automatiquement.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8">
          <div className="space-y-4">
            {/* Domain input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Domaine de votre site *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => { setDomain(e.target.value); setDomainTouched(true) }}
                  onBlur={() => setDomainTouched(true)}
                  placeholder="monsite.fr"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-colors ${
                    domainHasError
                      ? 'border-rose-500/50 focus:ring-rose-500/50'
                      : domainTouched && domainValid
                      ? 'border-emerald-500/50 focus:ring-emerald-500/50'
                      : 'border-white/10 focus:ring-brand-500/50'
                  }`}
                />
              </div>
              {domainHasError ? (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {domain.includes('@') ? 'Entrez un domaine, pas un email.' : 'Format invalide. Ex: monsite.fr'}
                </p>
              ) : domainTouched && domainValid ? (
                <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> {cleaned}
                </p>
              ) : (
                <p className="mt-1 text-xs text-white/30">Sans https:// — ex: monsite.fr</p>
              )}
            </div>

            {/* Site name (optional) */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Nom du site <span className="text-white/30">(optionnel)</span>
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Mon Site"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyse en cours... (30-60 secondes)</>
            ) : (
              <>Lancer le scan complet <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        {/* What will be analyzed */}
        <div className="mt-6 space-y-3">
          <p className="text-xs text-white/30 text-center mb-3">Le scan va analyser :</p>
          {SCAN_FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <Icon className="w-4 h-4 text-brand-400" />
                <div className="flex-1">
                  <span className="text-sm text-white/70">{feature.label}</span>
                  <span className="text-xs text-white/30 ml-2">{feature.desc}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Skip */}
        <p className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Passer cette étape
          </button>
        </p>
      </div>
    </div>
  )
}
