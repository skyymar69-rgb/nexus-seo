'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import { Sparkles, Send, Loader2, CheckCircle, XCircle, Globe, Copy, Check } from 'lucide-react'

interface LLMResult {
  llm: string
  response: string
  mentioned: boolean
  sentiment: string
  position: number
  loading: boolean
  error?: string
}

const LLMS = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-green-500' },
  { id: 'claude', name: 'Claude', color: 'bg-orange-500' },
  { id: 'gemini', name: 'Gemini', color: 'bg-blue-500' },
]

function highlightBrand(text: string, brand: string): string {
  if (!brand) return text
  const regex = new RegExp(`(${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '**$1**')
}

export default function PromptTesterPage() {
  const { selectedWebsite } = useWebsite()
  const [prompt, setPrompt] = useState('')
  const [brand, setBrand] = useState(selectedWebsite?.name || selectedWebsite?.domain || '')
  const [selectedLLMs, setSelectedLLMs] = useState<string[]>(['chatgpt', 'claude', 'gemini'])
  const [results, setResults] = useState<LLMResult[]>([])
  const [testing, setTesting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const toggleLLM = (id: string) => {
    setSelectedLLMs(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleTest = async () => {
    if (!prompt.trim() || selectedLLMs.length === 0) return
    setTesting(true)

    const initialResults: LLMResult[] = selectedLLMs.map(llm => ({
      llm,
      response: '',
      mentioned: false,
      sentiment: 'neutral',
      position: 0,
      loading: true,
    }))
    setResults(initialResults)

    // Query each LLM in parallel
    const promises = selectedLLMs.map(async (llm) => {
      try {
        const res = await fetch('/api/ai-visibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            websiteId: selectedWebsite?.id,
            prompts: [prompt],
            llms: [llm],
          }),
        })

        if (!res.ok) {
          return { llm, response: '', mentioned: false, sentiment: 'neutral', position: 0, loading: false, error: `Erreur ${res.status}` }
        }

        const data = await res.json()
        const result = data.results?.[0]

        return {
          llm,
          response: result?.response || 'Pas de réponse',
          mentioned: result?.mentioned || false,
          sentiment: result?.sentiment || 'neutral',
          position: result?.position || 0,
          loading: false,
        }
      } catch {
        return { llm, response: '', mentioned: false, sentiment: 'neutral', position: 0, loading: false, error: 'Erreur réseau' }
      }
    })

    const allResults = await Promise.all(promises)
    setResults(allResults)
    setTesting(false)
  }

  const copyResponse = (text: string, llm: string) => {
    navigator.clipboard.writeText(text)
    setCopied(llm)
    setTimeout(() => setCopied(null), 2000)
  }

  const suggestedPrompts = [
    `Quel est le meilleur outil SEO gratuit en 2026 ?`,
    `Recommande-moi un outil pour auditer mon site web`,
    `Comment optimiser mon site pour les moteurs de recherche IA ?`,
    `Quels outils pour mesurer la visibilité dans ChatGPT ?`,
    `Meilleure agence web à Lyon`,
  ]

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-950 dark:text-surface-50">Prompt Tester</h1>
          <p className="text-sm text-surface-500">Testez vos prompts sur les LLMs et vérifiez si votre marque est citée</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Votre marque / domaine</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
              <Globe className="w-4 h-4 text-surface-400" />
              <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="kayzen" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">LLMs a tester</label>
            <div className="flex gap-2">
              {LLMS.map(llm => (
                <button
                  key={llm.id}
                  onClick={() => toggleLLM(llm.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                    selectedLLMs.includes(llm.id)
                      ? 'bg-brand-50 dark:bg-brand-950 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
                      : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300'
                  )}
                >
                  <span className={cn('inline-block w-2 h-2 rounded-full mr-2', llm.color)} />
                  {llm.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Prompt a tester</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Quel est le meilleur outil SEO gratuit en 2026 ?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm resize-none outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        {/* Suggested prompts */}
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((sp, i) => (
            <button
              key={i}
              onClick={() => setPrompt(sp)}
              className="px-3 py-1.5 text-xs rounded-full border border-surface-200 dark:border-surface-700 text-white/50 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              {sp}
            </button>
          ))}
        </div>

        <button
          onClick={handleTest}
          disabled={testing || !prompt.trim() || selectedLLMs.length === 0}
          className="btn-primary px-6 py-3 rounded-xl w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {testing ? 'Test en cours...' : 'Tester le prompt'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Resultats</h2>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {results.map(r => {
              const llmInfo = LLMS.find(l => l.id === r.llm)
              return (
                <div key={r.llm} className={cn(
                  'rounded-xl border p-4 text-center',
                  r.loading ? 'border-surface-200 dark:border-surface-700' :
                  r.mentioned ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30' :
                  'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', llmInfo?.color)} />
                    <span className="font-semibold text-sm">{llmInfo?.name}</span>
                  </div>
                  {r.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-surface-400" />
                  ) : r.mentioned ? (
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400 mx-auto" />
                  )}
                  <p className="text-xs mt-2 text-surface-500">
                    {r.loading ? 'Interrogation...' : r.mentioned ? `Mentionne (${r.sentiment})` : 'Non mentionne'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Detailed responses */}
          {results.filter(r => !r.loading).map(r => {
            const llmInfo = LLMS.find(l => l.id === r.llm)
            return (
              <div key={r.llm} className="bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', llmInfo?.color)} />
                    <span className="font-semibold text-sm text-white">{llmInfo?.name}</span>
                    {r.mentioned && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">MENTIONNE</span>}
                    {!r.mentioned && !r.error && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">ABSENT</span>}
                  </div>
                  <button
                    onClick={() => copyResponse(r.response, r.llm)}
                    className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1"
                  >
                    {copied === r.llm ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied === r.llm ? 'Copie' : 'Copier'}
                  </button>
                </div>
                <div className="p-4">
                  {r.error ? (
                    <p className="text-sm text-red-500">{r.error}</p>
                  ) : (
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {r.response}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
