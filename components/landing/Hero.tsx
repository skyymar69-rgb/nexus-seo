'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Globe, Zap, Search, Loader2 } from 'lucide-react'


export function Hero() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-hero">

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes hero-draw-line {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }

        @keyframes hero-grow-bar {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }

        @keyframes hero-score-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.15); opacity: 0.7; }
        }

        .hero-bar {
          transform-origin: bottom;
          animation: hero-grow-bar 1.2s ease-out forwards;
          animation-delay: var(--bar-delay);
          transform: scaleY(0);
          will-change: transform;
        }

        .hero-line-draw {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: hero-draw-line 2.5s ease-out 0.8s forwards;
          will-change: stroke-dashoffset;
          will-change: transform;
        }

        .hero-score-text {
          animation: hero-score-pulse 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-bar, .hero-line-draw, .hero-score-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-grid-line bg-grid opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-brand-500/10 blur-[160px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gold-400/5 blur-[120px] pointer-events-none" aria-hidden="true" />

      {/* ── Content grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center">

        {/* ─── LEFT COLUMN — text (3/5 on desktop) ─── */}
        <div className="lg:col-span-3 text-center lg:text-left">

          {/* Badge */}
          <div className="flex justify-center lg:justify-start mb-8">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-gold-400/30 bg-gold-400/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-gold-400 tracking-wide">
                Agence SEO IA — GEO &middot; AEO &middot; LLMO
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-4">
            Audit SEO{' '}
            <span className="text-gold-400 drop-shadow-[0_0_30px_rgba(254,205,77,0.3)]">
              Gratuit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
            Analysez votre site web en 30 secondes. Obtenez un diagnostic complet
            avec des recommandations actionnables.
          </p>

          {/* Audit form directly in hero */}
          <div className="w-full max-w-xl mx-auto lg:mx-0 mb-4">
            <form
              aria-label="Lancer un audit SEO gratuit"
              onSubmit={(e) => {
                e.preventDefault()
                const input = (e.target as HTMLFormElement).querySelector('input') as HTMLInputElement
                const url = input?.value?.trim()
                if (url) {
                  setIsAnalyzing(true)
                  window.location.href = `/dashboard/audit?url=${encodeURIComponent(url)}`
                }
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="url"
                  name="url"
                  placeholder="https://www.monsite.fr"
                  aria-label="URL du site web à analyser"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 backdrop-blur-sm transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-8 py-4 rounded-xl bg-gold-400 text-brand-950 font-bold text-base hover:bg-gold-300 transition-all duration-300 shadow-gold hover:shadow-[0_0_40px_rgba(254,205,77,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser mon site'}
              </button>
            </form>
          </div>

          {/* Trust text */}
          <p className="text-sm text-white/70 mb-10">
            Aucune inscription requise · Résultats instantanés · Export PDF, Markdown, JSON
          </p>

          {/* Stats bar */}
          <div className="mb-10" role="region" aria-label="Statistiques cl&#233;s">
            <div className="inline-flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 px-8 py-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              {[
                { value: '50+', label: 'outils gratuits', icon: TrendingUp },
                { value: '10+', label: 'LLMs surveillés', icon: Globe },
                { value: '0€', label: 'pour toujours', icon: Zap },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gold-400/60 hidden sm:block" />
                    <div className="text-center sm:text-left">
                      <p className="text-2xl sm:text-3xl font-black text-gold-400">
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/70 uppercase tracking-wider font-medium">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Trust signal */}
          <p className="text-sm text-white/70 font-medium">
            Développé par <a href="https://internet.kayzen-lyon.fr" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-gold-400 transition-colors">Kayzen Web</a> — Agence web Lyon
          </p>
        </div>

        {/* ─── RIGHT COLUMN — SEO Performance Dashboard (2/5 on desktop) ─── */}
        <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
          <svg
            viewBox="0 0 420 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-[440px] h-auto drop-shadow-2xl"
            role="img"
            aria-label="Dashboard de performance SEO avec graphiques animés"
          >
            {/* ── Dashboard frame ── */}
            <rect x="10" y="10" width="400" height="360" rx="16" fill="rgba(15,5,32,0.9)" stroke="rgba(124,58,237,0.25)" strokeWidth="1" />
            {/* Title bar */}
            <rect x="10" y="10" width="400" height="38" rx="16" fill="rgba(43,18,76,0.8)" />
            <rect x="10" y="38" width="400" height="10" fill="rgba(43,18,76,0.8)" />
            {/* Window dots */}
            <circle cx="30" cy="29" r="4" fill="#ef4444" opacity="0.8" />
            <circle cx="44" cy="29" r="4" fill="#eab308" opacity="0.8" />
            <circle cx="58" cy="29" r="4" fill="#22c55e" opacity="0.8" />
            <text x="210" y="33" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">nexus.app/audit</text>

            {/* ── Score gauge (top-left) ── */}
            <g transform="translate(70, 100)">
              {/* Background ring */}
              <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="6" />
              {/* Progress ring — animated */}
              <circle cx="0" cy="0" r="40" fill="none" stroke="#FECD4D" strokeWidth="6"
                strokeDasharray="226" strokeDashoffset="30" strokeLinecap="round"
                transform="rotate(-90)" className="hero-line-draw" />
              {/* Score text */}
              <text x="0" y="-4" textAnchor="middle" fill="#FECD4D" fontSize="24" fontWeight="800" fontFamily="system-ui">94</text>
              <text x="0" y="10" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7" fontWeight="600" fontFamily="system-ui" letterSpacing="1">/100</text>
            </g>
            <text x="70" y="157" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="600" fontFamily="system-ui" letterSpacing="0.5">SCORE SEO</text>

            {/* ── 3 mini KPI cards (top-right) ── */}
            {[
              { y: 62, label: 'Performance', value: '96', color: '#22c55e', icon: '▲' },
              { y: 98, label: 'Accessibilité', value: '91', color: '#FECD4D', icon: '●' },
              { y: 134, label: 'Visibilité IA', value: '87', color: '#7c3aed', icon: '◆' },
            ].map((kpi, i) => (
              <g key={i} transform={`translate(145, ${kpi.y})`} style={{ animation: `hero-grow-bar 0.6s ease-out ${0.3 + i * 0.15}s both` }}>
                <rect width="250" height="30" rx="6" fill="rgba(43,18,76,0.5)" stroke="rgba(124,58,237,0.15)" strokeWidth="0.5" />
                <text x="12" y="19" fill={kpi.color} fontSize="9" fontFamily="system-ui">{kpi.icon}</text>
                <text x="28" y="19" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="system-ui">{kpi.label}</text>
                <text x="232" y="19" textAnchor="end" fill={kpi.color} fontSize="12" fontWeight="800" fontFamily="system-ui">{kpi.value}</text>
                {/* Progress bar */}
                <rect x="135" y="11" width="80" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
                <rect x="135" y="11" width={parseInt(kpi.value) * 0.8} height="6" rx="3" fill={kpi.color} opacity="0.6" className="hero-bar" style={{ '--bar-delay': `${0.5 + i * 0.2}s` } as React.CSSProperties} />
              </g>
            ))}

            {/* ── Bar chart (bottom-left) ── */}
            <g transform="translate(30, 185)">
              <text x="0" y="10" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600" fontFamily="system-ui" letterSpacing="0.5">TRAFIC ORGANIQUE</text>
              <text x="170" y="10" textAnchor="end" fill="#22c55e" fontSize="8" fontWeight="700" fontFamily="system-ui">SEO</text>
              {/* Grid lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={25 + i * 30} x2="170" y2={25 + i * 30} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              ))}
              {/* Bars */}
              {[
                { x: 5,   h: 25, delay: '0.3s' },
                { x: 19,  h: 35, delay: '0.4s' },
                { x: 33,  h: 30, delay: '0.5s' },
                { x: 47,  h: 45, delay: '0.6s' },
                { x: 61,  h: 40, delay: '0.7s' },
                { x: 75,  h: 55, delay: '0.8s' },
                { x: 89,  h: 50, delay: '0.9s' },
                { x: 103, h: 65, delay: '1.0s' },
                { x: 117, h: 60, delay: '1.1s' },
                { x: 131, h: 75, delay: '1.2s' },
                { x: 145, h: 70, delay: '1.3s' },
                { x: 159, h: 90, delay: '1.4s' },
              ].map((bar, i) => (
                <rect
                  key={i} x={bar.x} y={115 - bar.h} width="10" height={bar.h} rx="2"
                  fill={i >= 10 ? '#FECD4D' : i >= 8 ? '#7c3aed' : 'rgba(124,58,237,0.5)'}
                  className="hero-bar"
                  style={{ '--bar-delay': bar.delay } as React.CSSProperties}
                />
              ))}
              <line x1="0" y1="115" x2="170" y2="115" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </g>

            {/* ── Line chart (bottom-right) ── */}
            <g transform="translate(215, 185)">
              <text x="0" y="10" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600" fontFamily="system-ui" letterSpacing="0.5">POSITIONS GOOGLE</text>
              <text x="175" y="10" textAnchor="end" fill="#FECD4D" fontSize="8" fontWeight="700" fontFamily="system-ui">Top 3</text>
              {/* Grid */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={25 + i * 30} x2="175" y2={25 + i * 30} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              ))}
              {/* Line — positions improving (going UP = lower number = better) */}
              <polyline
                points="0,95 15,90 30,85 45,80 60,75 75,65 90,60 105,45 120,40 135,30 150,25 165,18"
                stroke="#FECD4D" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
                className="hero-line-draw"
              />
              {/* Area fill */}
              <polygon
                points="0,95 15,90 30,85 45,80 60,75 75,65 90,60 105,45 120,40 135,30 150,25 165,18 165,115 0,115"
                fill="url(#hero-area-grad)" opacity="0.4" className="hero-line-draw" style={{ animationDelay: '0.8s' }}
              />
              {/* End dot */}
              <circle cx="165" cy="18" r="4" fill="#FECD4D" className="hero-score-pulse" />
              <line x1="0" y1="115" x2="175" y2="115" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </g>

            {/* ── Bottom status bar ── */}
            <g transform="translate(30, 330)">
              <rect width="360" height="28" rx="6" fill="rgba(43,18,76,0.4)" />
              <circle cx="16" cy="14" r="4" fill="#22c55e" />
              <text x="26" y="18" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="system-ui">Audit en cours... 50+ contrôles analysés</text>
              <text x="344" y="18" textAnchor="end" fill="#FECD4D" fontSize="8" fontWeight="700" fontFamily="system-ui">94/100 ✓</text>
            </g>

            {/* Gradient defs */}
            <defs>
              <linearGradient id="hero-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FECD4D" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FECD4D" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ─── Mobile illustration (simplified) ─── */}
        <div className="flex lg:hidden justify-center mt-4" aria-hidden="true">
          <svg
            viewBox="0 0 320 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-sm h-auto"
          >
            {/* Mini bar chart */}
            <g transform="translate(20, 10)">
              {[
                { x: 0,  h: 50, delay: '0.2s', color: 'rgba(124,58,237,0.6)' },
                { x: 18, h: 70, delay: '0.4s', color: 'rgba(124,58,237,0.7)' },
                { x: 36, h: 45, delay: '0.6s', color: 'rgba(124,58,237,0.6)' },
                { x: 54, h: 85, delay: '0.8s', color: '#7c3aed' },
                { x: 72, h: 60, delay: '1.0s', color: 'rgba(124,58,237,0.7)' },
                { x: 90, h: 95, delay: '1.2s', color: '#FECD4D' },
              ].map((bar, i) => (
                <rect
                  key={i}
                  x={bar.x}
                  y={100 - bar.h}
                  width="12"
                  height={bar.h}
                  rx="3"
                  fill={bar.color}
                  className="hero-bar"
                  style={{ '--bar-delay': bar.delay } as React.CSSProperties}
                />
              ))}
              <line x1="0" y1="100" x2="102" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </g>

            {/* Mini line chart */}
            <g transform="translate(160, 15)">
              <polyline
                points="0,80 25,65 50,55 75,35 100,25 125,10"
                stroke="#FECD4D"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hero-line-draw"
              />
              <polygon
                points="0,80 25,65 50,55 75,35 100,25 125,10 125,90 0,90"
                fill="url(#hero-area-grad-m)"
                opacity="0.25"
                className="hero-line-draw"
                style={{ animationDelay: '1s' }}
              />
              <line x1="0" y1="90" x2="125" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </g>

            <defs>
              <linearGradient id="hero-area-grad-m" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FECD4D" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FECD4D" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </div>
    </section>
  )
}
