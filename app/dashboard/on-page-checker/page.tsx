'use client'

import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Loader2, FileSearch, AlertCircle } from 'lucide-react'

interface CheckItem {
  label: string
  key: string
  passed: boolean
  recommendation: string
}

interface OnPageResult {
  score: number
  checks: CheckItem[]
  keywordDensity: number
}

export default function OnPageCheckerPage() {
  const [url, setUrl] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OnPageResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !keyword.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/on-page-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), keyword: keyword.trim() }),
      })
      if (!res.ok) throw new Error('Erreur lors de l\'analyse')
      const data = await res.json()

      const checks: CheckItem[] = [
        { label: 'Mot-clé dans le titre', key: 'inTitle', passed: data.keywordAnalysis?.inTitle ?? false, recommendation: 'Ajoutez votre mot-clé principal dans la balise title.' },
        { label: 'Mot-clé dans le H1', key: 'inH1', passed: data.keywordAnalysis?.inH1 ?? false, recommendation: 'Incluez votre mot-clé dans la balise H1 de la page.' },
        { label: 'Mot-clé dans la meta description', key: 'inMeta', passed: data.keywordAnalysis?.inMetaDescription ?? false, recommendation: 'Intégrez votre mot-clé dans la meta description.' },
        { label: 'Mot-clé dans le premier paragraphe', key: 'inFirstParagraph', passed: data.keywordAnalysis?.inFirstParagraph ?? false, recommendation: 'Mentionnez votre mot-clé dans les 100 premiers mots.' },
        { label: 'Mot-clé dans l\'URL', key: 'inUrl', passed: url.toLowerCase().includes(keyword.toLowerCase()), recommendation: 'Essayez d\'inclure votre mot-clé dans l\'URL.' },
        { label: 'Mot-clé dans les H2/H3', key: 'inSubHeadings', passed: data.keywordAnalysis?.inSubHeadings ?? false, recommendation: 'Utilisez votre mot-clé dans au moins un sous-titre H2 ou H3.' },
        { label: 'Mot-clé dans les attributs alt', key: 'inAlt', passed: data.keywordAnalysis?.inAlt ?? false, recommendation: 'Ajoutez votre mot-clé dans les attributs alt des images.' },
      ]

      const passedCount = checks.filter(c => c.passed).length
      const score = Math.round((passedCount / checks.length) * 100)
      const density = data.keywordAnalysis?.density ?? 0

      setResult({ score, checks, keywordDensity: density })
    } catch {
      setError('Impossible d\'analyser cette page. Vérifiez l\'URL et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileSearch className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-white">Vérificateur On-Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">URL de la page</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://exemple.com/page" className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Mot-clé cible</label>
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ex: référencement naturel" className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Analyse en cours...' : 'Analyser'}
        </button>
      </form>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 flex items-center gap-6">
            <div className={`text-5xl font-bold ${result.score >= 70 ? 'text-green-600' : result.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {result.score}<span className="text-lg text-white/30">/100</span>
            </div>
            <div>
              <p className="font-medium text-white">Score On-Page</p>
              <p className="text-sm text-white/40">Densité du mot-clé : {result.keywordDensity.toFixed(2)}%</p>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white/[0.03] border border-white/5 rounded-lg divide-y divide-white/5">
            {result.checks.map(check => (
              <div key={check.key} className="flex items-start gap-3 px-5 py-4">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${check.passed ? 'text-white' : 'text-white/70'}`}>{check.label}</p>
                  {!check.passed && <p className="text-xs text-white/40 mt-0.5">{check.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
