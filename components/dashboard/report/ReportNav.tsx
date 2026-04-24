'use client'

import { useEffect, useState } from 'react'
import { Shield, MessageSquare, Globe, Gauge, Search, Lightbulb } from 'lucide-react'

interface ReportNavProps {
  scores?: {
    audit?: number | null
    aeo?: number | null
    geo?: number | null
    performance?: number | null
    crawl?: number | null
  }
}

const NAV_ITEMS = [
  { id: 'audit', label: 'Audit SEO', icon: Shield, scoreKey: 'audit' },
  { id: 'aeo', label: 'AEO', icon: MessageSquare, scoreKey: 'aeo' },
  { id: 'geo', label: 'GEO', icon: Globe, scoreKey: 'geo' },
  { id: 'performance', label: 'Performance', icon: Gauge, scoreKey: 'performance' },
  { id: 'crawl', label: 'Crawl', icon: Search, scoreKey: 'crawl' },
  { id: 'actions', label: 'Actions', icon: Lightbulb, scoreKey: '' },
]

function ScoreDot({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) return null
  const color = score >= 75 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
  return (
    <span className="ml-auto flex items-center gap-1">
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-[10px] text-white/30">{score}</span>
    </span>
  )
}

export function ReportNav({ scores }: ReportNavProps) {
  const [active, setActive] = useState('audit')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-20% 0px -60% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* Desktop — sticky sidebar */}
      <nav className="hidden lg:block sticky top-24 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon, scoreKey }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === id
                ? 'bg-brand-500/10 text-brand-400 font-medium'
                : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
            {scoreKey && scores && <ScoreDot score={(scores as any)[scoreKey]} />}
          </button>
        ))}
      </nav>

      {/* Mobile — horizontal pills */}
      <nav className="lg:hidden sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-white/5 -mx-4 px-4 py-2 overflow-x-auto flex gap-2 scrollbar-hide">
        {NAV_ITEMS.map(({ id, label, icon: Icon, scoreKey }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${
              active === id
                ? 'bg-brand-500/10 text-brand-400 font-medium border border-brand-500/20'
                : 'text-white/40 border border-white/5'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
            {scoreKey && scores && (scores as any)[scoreKey] != null && (
              <span className="text-[10px] text-white/30">{(scores as any)[scoreKey]}</span>
            )}
          </button>
        ))}
      </nav>
    </>
  )
}
