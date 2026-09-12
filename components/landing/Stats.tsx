'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 50,  suffix: '+', label: 'Outils IA & SEO' },
  { value: 10,  suffix: '+', label: 'LLMs surveilles' },
  { value: 6,   suffix: '',  label: 'Categories d\'analyse' },
  { value: 100, suffix: '%', label: 'Gratuit, sans limites' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  const runAnimation = () => {
    if (animated.current) return
    animated.current = true
    const duration = 1200
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        runAnimation()
        obs.disconnect()
      }
    }, { threshold: 0.2 })
    obs.observe(el)

    // Fallback: if animation hasn't fired after 3s, set the final value
    const fallbackTimer = setTimeout(() => {
      if (!animated.current) {
        runAnimation()
      }
    }, 3000)

    return () => {
      obs.disconnect()
      clearTimeout(fallbackTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  return (
    <span ref={ref} aria-live="polite" aria-atomic="true">
      {current}{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="section-y bg-[hsl(var(--navy-deep))]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-heading font-extrabold text-gold-bright tabular-nums leading-none mb-2 text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)]">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-[11px] md:text-xs text-white/85 uppercase tracking-[0.14em] font-heading font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
