'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Code, Globe, Loader2, Copy, Check, Download, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'

interface GeneratedSchema {
  type: string
  label: string
  description: string
  schema: Record<string, any>
}

interface SchemaResult {
  url: string
  pageData: {
    title: string
    description: string
    domain: string
    hasFAQ: boolean
    hasArticle: boolean
    hasProduct: boolean
    hasLocalBusiness: boolean
    faqCount: number
    breadcrumbCount: number
  }
  existingSchemas: string[]
  generatedSchemas: GeneratedSchema[]
}

export default function SchemaMarkupPage() {
  const { selectedWebsite } = useWebsite()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SchemaResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (selectedWebsite?.domain && !url) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  const handleGenerate = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/schema-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || 'Erreur lors de la génération')
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAllSchemas = () => {
    if (!result) return
    const allSchemas = result.generatedSchemas.map(s =>
      `<script type="application/ld+json">\n${JSON.stringify(s.schema, null, 2)}\n</script>`
    ).join('\n\n')
    copyToClipboard(allSchemas, 'all')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Code className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Générateur de Schema Markup</h1>
        </div>
        <p className="text-white/40">
          Générez automatiquement les données structurées JSON-LD adaptées à votre page pour améliorer vos rich snippets Google.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6">
        <label className="block text-sm font-medium text-white/70 mb-2">URL de la page à analyser</label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://monsite.fr/page"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Générer
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          <span className="ml-3 text-white/40">Analyse de la page en cours...</span>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          {/* Page info */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Page analysée</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-white/40">Titre</span>
                <p className="text-white truncate">{result.pageData.title || '(absent)'}</p>
              </div>
              <div>
                <span className="text-white/40">FAQ détectée</span>
                <p className={result.pageData.hasFAQ ? 'text-emerald-400' : 'text-white/30'}>
                  {result.pageData.hasFAQ ? `Oui (${result.pageData.faqCount} questions)` : 'Non'}
                </p>
              </div>
              <div>
                <span className="text-white/40">Article</span>
                <p className={result.pageData.hasArticle ? 'text-emerald-400' : 'text-white/30'}>
                  {result.pageData.hasArticle ? 'Oui' : 'Non'}
                </p>
              </div>
              <div>
                <span className="text-white/40">Business local</span>
                <p className={result.pageData.hasLocalBusiness ? 'text-emerald-400' : 'text-white/30'}>
                  {result.pageData.hasLocalBusiness ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>

            {result.existingSchemas.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-xs text-white/40">Schemas déjà présents :</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {result.existingSchemas.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Copy all button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {result.generatedSchemas.length} schemas générés
            </h3>
            <button
              onClick={copyAllSchemas}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {copied === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied === 'all' ? 'Copié !' : 'Copier tout'}
            </button>
          </div>

          {/* Individual schemas */}
          <div className="space-y-4">
            {result.generatedSchemas.map((schema, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-violet-400" />
                      {schema.label}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">{schema.type}</span>
                    </h4>
                    <p className="text-xs text-white/40 mt-0.5">{schema.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(
                      `<script type="application/ld+json">\n${JSON.stringify(schema.schema, null, 2)}\n</script>`,
                      `schema-${i}`
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    {copied === `schema-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === `schema-${i}` ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <pre className="px-5 py-4 text-xs text-white/60 overflow-x-auto font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {JSON.stringify(schema.schema, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Code className="w-12 h-12 text-white/10 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Prêt à générer</h3>
          <p className="text-sm text-white/40 max-w-md">
            Entrez l&apos;URL d&apos;une page de votre site. Nexus analysera son contenu et générera les schemas JSON-LD les plus adaptés : WebSite, Organization, FAQPage, Article, LocalBusiness, BreadcrumbList.
          </p>
        </div>
      )}
    </div>
  )
}
