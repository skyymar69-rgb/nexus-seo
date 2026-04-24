'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import { FileText, Globe, Loader2, Copy, Check, Download, Sparkles, ArrowRight } from 'lucide-react'

export default function LLMSTxtPage() {
  const { selectedWebsite } = useWebsite()
  const [brandName, setBrandName] = useState(selectedWebsite?.name || '')
  const [url, setUrl] = useState(selectedWebsite ? `https://${selectedWebsite.domain}` : '')
  const [sector, setSector] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'short' | 'full'>('short')

  const handleGenerate = async () => {
    if (!url.trim() || !brandName.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/llms-txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), brandName: brandName.trim(), sector: sector.trim() || undefined }),
      })
      const data = await res.json()
      if (data.success) setResult(data)
      else setError(data.error || 'Erreur')
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = filename; a.click()
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Générateur llms.txt</h1>
          <p className="text-sm text-surface-500">Créez votre fichier llms.txt pour que les LLMs citent correctement votre site</p>
        </div>
      </div>

      {/* What is llms.txt */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
        <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Qu&apos;est-ce que llms.txt ?
        </h3>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
          Le fichier <code className="px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded text-xs font-mono">llms.txt</code> est un standard (llmstxt.org) qui indique aux LLMs (ChatGPT, Claude, Gemini) les informations essentielles de votre site.
          Placez-le à la racine : <code className="px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded text-xs font-mono">votresite.fr/llms.txt</code>
        </p>
      </div>

      {/* Form */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nom de la marque *</label>
            <input type="text" value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Kayzen Web" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">URL du site *</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://votresite.fr" className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Secteur (optionnel)</label>
            <input type="text" value={sector} onChange={e => setSector(e.target.value)} placeholder="Agence web, E-commerce, SaaS..." className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !url || !brandName} className="btn-primary px-6 py-3 rounded-xl w-full disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {loading ? 'Génération en cours...' : 'Générer llms.txt'}
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">{error}</div>}

      {result && (
        <>
          {/* Tabs */}
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('short')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'short' ? 'bg-brand-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-white/50')}>
              llms.txt (court)
            </button>
            <button onClick={() => setActiveTab('full')} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', activeTab === 'full' ? 'bg-brand-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-white/50')}>
              llms-full.txt (complet)
            </button>
          </div>

          {/* Generated content */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]/50">
              <span className="text-sm font-mono text-white/50">
                {activeTab === 'short' ? 'llms.txt' : 'llms-full.txt'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText(activeTab === 'short' ? result.llmsTxt : result.llmsTxtFull, activeTab)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  {copied === activeTab ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied === activeTab ? 'Copie !' : 'Copier'}
                </button>
                <button
                  onClick={() => downloadFile(activeTab === 'short' ? result.llmsTxt : result.llmsTxtFull, activeTab === 'short' ? 'llms.txt' : 'llms-full.txt')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <Download className="w-3 h-3" /> Télécharger
                </button>
              </div>
            </div>
            <pre className="p-4 text-sm text-white/70 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[500px] overflow-y-auto">
              {activeTab === 'short' ? result.llmsTxt : result.llmsTxtFull}
            </pre>
          </div>

          {/* How to install */}
          <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-4">Comment installer votre llms.txt</h3>
            <ol className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Télécharger les deux fichiers (<code className="px-1 py-0.5 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono">llms.txt</code> et <code className="px-1 py-0.5 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono">llms-full.txt</code>)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Placez-les à la racine de votre site web (dans <code className="px-1 py-0.5 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono">/public/</code> pour Next.js ou à la racine pour WordPress)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Vérifiez que <code className="px-1 py-0.5 bg-surface-100 dark:bg-surface-800 rounded text-xs font-mono">votresite.fr/llms.txt</code> est accessible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                <span>Les LLMs détecteront automatiquement votre fichier lors de leurs prochains crawls</span>
              </li>
            </ol>
          </div>

          {/* Detected info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-5">
              <h4 className="text-sm font-bold text-white mb-3">Pages détectées ({result.keyPages?.length || 0})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.keyPages?.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                    <Globe className="w-3 h-3 shrink-0" /> <span className="truncate">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] rounded-xl border border-white/5 p-5">
              <h4 className="text-sm font-bold text-white mb-3">Réseaux sociaux ({result.socialLinks?.length || 0})</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.socialLinks?.map((link: string, i: number) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-brand-600 hover:underline truncate">
                    <ArrowRight className="w-3 h-3 shrink-0" /> {link}
                  </a>
                ))}
                {(!result.socialLinks || result.socialLinks.length === 0) && (
                  <p className="text-xs text-surface-500">Aucun réseau social détecté</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
