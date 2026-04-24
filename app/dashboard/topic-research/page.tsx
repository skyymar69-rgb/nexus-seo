'use client'

import { useState } from 'react'
import { Lightbulb, Search, Loader2, BookOpen, HelpCircle, Compass } from 'lucide-react'

interface TopicItem {
  title: string
  description: string
  difficulty: 'facile' | 'moyen' | 'difficile'
}

interface TopicResult {
  topic: string
  subTopics: TopicItem[]
  questions: TopicItem[]
  angles: TopicItem[]
}

const difficultyConfig = {
  facile: { label: 'Facile', color: 'text-green-700', bg: 'bg-green-100' },
  moyen: { label: 'Moyen', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  difficile: { label: 'Difficile', color: 'text-red-700', bg: 'bg-red-100' },
}

function TopicCard({ item }: { item: TopicItem }) {
  const d = difficultyConfig[item.difficulty]
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${d.bg} ${d.color}`}>{d.label}</span>
      </div>
      <p className="text-xs text-white/40 mt-2 leading-relaxed">{item.description}</p>
    </div>
  )
}

export default function TopicResearchPage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TopicResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/topic-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      setError('Erreur lors de la génération des idées.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-white">Recherche de Sujets</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-lg p-6">
        <label className="block text-sm font-medium text-white/70 mb-1">Sujet ou thématique</label>
        <div className="flex gap-3">
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: SEO, marketing digital, e-commerce..." className="flex-1 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Recherche...' : 'Générer'}
          </button>
        </div>
      </form>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Génération des idées en cours...</span>
        </div>
      )}

      {result && (
        <div className="space-y-8">
          {/* Sub-topics */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-white">Sous-thématiques</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.subTopics.map((item, i) => <TopicCard key={i} item={item} />)}
            </div>
          </section>

          {/* Questions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-white">Questions fréquentes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.questions.map((item, i) => <TopicCard key={i} item={item} />)}
            </div>
          </section>

          {/* Angles */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-white">Angles d&apos;articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.angles.map((item, i) => <TopicCard key={i} item={item} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
