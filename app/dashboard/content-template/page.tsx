'use client'

import { useState, useRef } from 'react'
import { FileText, Search, Loader2, Copy, Check, Link, List, HelpCircle, LayoutTemplate } from 'lucide-react'

interface ContentBrief {
  keyword: string
  recommendedWordCount: number
  suggestedH2: string[]
  secondaryKeywords: string[]
  questionsToAnswer: string[]
  contentStructure: string[]
  analyzedUrl?: string
  existingH2?: string[]
  existingWordCount?: number
}

export default function ContentTemplatePage() {
  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState<ContentBrief | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const briefRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return
    setLoading(true)
    setError('')
    setBrief(null)
    try {
      const body: Record<string, string> = { keyword: keyword.trim() }
      if (url.trim()) body.url = url.trim()
      const res = await fetch('/api/content-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setBrief(await res.json())
    } catch {
      setError('Erreur lors de la génération du brief.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!briefRef.current) return
    const text = briefRef.current.innerText
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <LayoutTemplate className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-white">Générateur de Brief Contenu</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Mot-clé cible *</label>
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ex: référencement naturel" className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">URL à analyser (optionnel)</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://exemple.com/page-concurrente" className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          <p className="text-xs text-white/30 mt-1">Fournissez une URL concurrente pour un brief plus précis.</p>
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Génération...' : 'Générer le brief'}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Génération du brief en cours...</span>
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={handleCopy} className="flex items-center gap-2 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm hover:bg-white/[0.03] transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copié !' : 'Copier le brief'}
            </button>
          </div>

          <div ref={briefRef} className="bg-white/[0.03] border border-white/5 rounded-lg divide-y divide-white/5">
            {/* Header */}
            <div className="p-5">
              <h2 className="text-lg font-bold text-white">Brief : {brief.keyword}</h2>
              <p className="text-sm text-white/40 mt-1">Nombre de mots recommandé : <span className="font-semibold text-white">{brief.recommendedWordCount}</span></p>
              {brief.analyzedUrl && (
                <p className="text-xs text-white/30 mt-1 flex items-center gap-1"><Link className="w-3 h-3" /> Basé sur l&apos;analyse de : {brief.analyzedUrl}</p>
              )}
              {brief.existingWordCount && (
                <p className="text-xs text-white/30">Contenu existant : {brief.existingWordCount} mots</p>
              )}
            </div>

            {/* H2 suggestions */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-white">Titres H2 suggérés</h3>
              </div>
              <ol className="space-y-1.5 list-decimal list-inside">
                {brief.suggestedH2.map((h2, i) => <li key={i} className="text-sm text-white/70">{h2}</li>)}
              </ol>
            </div>

            {/* Existing H2s */}
            {brief.existingH2 && brief.existingH2.length > 0 && (
              <div className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">H2 existants sur la page analysée</h3>
                <ul className="space-y-1">
                  {brief.existingH2.map((h2, i) => <li key={i} className="text-sm text-white/40">- {h2}</li>)}
                </ul>
              </div>
            )}

            {/* Secondary keywords */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-white">Mots-clés secondaires à inclure</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {brief.secondaryKeywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{kw}</span>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-white">Questions à répondre</h3>
              </div>
              <ul className="space-y-1.5">
                {brief.questionsToAnswer.map((q, i) => <li key={i} className="text-sm text-white/70">- {q}</li>)}
              </ul>
            </div>

            {/* Structure */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <LayoutTemplate className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-white">Structure recommandée</h3>
              </div>
              <ol className="space-y-2 list-decimal list-inside">
                {brief.contentStructure.map((s, i) => <li key={i} className="text-sm text-white/70">{s}</li>)}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
