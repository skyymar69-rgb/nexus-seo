'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, Globe, Zap, Search, Loader2 } from 'lucide-react'

export function Hero() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  return (
    <section className="relative bg-background pt-24 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8">

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

      {/* ── Content grid ── */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* ─── Colonne texte ─── */}
        <div>

          {/* Sur-titre */}
          <p className="overline mb-5">
            Agence SEO IA &middot; GEO &middot; AEO &middot; LLMO
          </p>

          {/* Titre : une promesse, une phrase en terracotta */}
          <h1 className="mb-5 text-balance">
            Votre audit SEO complet.{' '}
            <span className="text-primary">Gratuit, en 30 secondes.</span>
          </h1>

          {/* Accroche */}
          <p className="text-lg md:text-xl text-muted-foreground measure mb-8 text-pretty">
            Nexus analyse votre site et vous rend un diagnostic actionnable :
            SEO technique, visibilite dans les reponses des IA, contenu et
            performance. Sans inscription, sans carte bancaire.
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
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <input
                  type="url"
                  name="url"
                  placeholder="https://www.monsite.fr"
                  aria-label="URL du site web à analyser"
                  className="w-full h-14 pl-12 pr-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-base"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-heading font-bold text-base hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 disabled:cursor-wait"
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

          {/* Micro-reassurances — liste semantique */}
          <ul className="flex flex-wrap gap-2.5 mt-6 mb-8 list-none p-0">
            {[
              { Icon: Zap, text: 'Aucune inscription requise' },
              { Icon: TrendingUp, text: '50+ outils gratuits' },
              { Icon: Globe, text: '10+ moteurs IA surveilles' },
            ].map(({ Icon, text }) => (
              <li key={text} className="pill">
                <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          {/* Signature */}
          <p className="text-sm text-muted-foreground">
            Developpe par{' '}
            <a
              href="https://www.kayzen-lyon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              Kayzen Web
            </a>{' '}
            — Agence web &amp; IA a Lyon
          </p>
        </div>

        {/* ─── Colonne visuelle — apercu du rapport ─── */}
        <div className="order-last">
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-border bg-surface-sunken shadow-e3 p-4 sm:p-6">
          <svg
            viewBox="0 0 420 390"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative w-full max-w-[440px] h-auto"
            style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5)) drop-shadow(0 0 80px rgba(43,74,116,0.2))' }}
            role="img"
            aria-label="Dashboard de performance SEO avec graphiques animés"
          >
            <defs>
              {/* Area chart gradient */}
              
              {/* Frame gradient */}
              
              {/* Titlebar gradient */}
              
              {/* Score ring gradient */}
              
              {/* Bar gradient */}

              {/* Glow filter */}
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0.8 0 0 0  0.8 0.6 0 0 0  0 0 0 0 0  0 0 0 1.5 0" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Inner shadow */}
              <filter id="inner-shadow">
                <feOffset dx="0" dy="2" />
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in2="SourceGraphic" operator="out" result="shadow" />
                <feColorMatrix in="shadow" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0" />
                <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Outer ambient glow ── */}
            <ellipse cx="210" cy="200" rx="180" ry="160" fill="rgba(124,58,237,0.04)" />

            {/* ── Dashboard frame ── */}
            <rect x="10" y="10" width="400" height="368" rx="18" fill="rgba(22,41,63,0.95)" />
            {/* Frame border with gradient */}
            <rect x="10" y="10" width="400" height="368" rx="18" fill="none" stroke="rgba(109,140,181,0.45)" strokeWidth="1" />
            <defs>
              
            </defs>
            {/* Inner top highlight */}
            <rect x="11" y="11" width="398" height="2" rx="1" fill="rgba(255,255,255,0.08)" />

            {/* ── Title bar ── */}
            <rect x="10" y="10" width="400" height="40" rx="18" fill="rgba(31,59,97,0.9)" />
            <rect x="10" y="40" width="400" height="10" fill="rgba(15,31,53,0.9)" />

            {/* Window dots with glow */}
            <circle cx="30" cy="30" r="5" fill="#dc2626" opacity="0.9" />
            <circle cx="30" cy="30" r="3" fill="#fca5a5" opacity="0.4" />
            <circle cx="46" cy="30" r="5" fill="#d15f42" opacity="0.9" />
            <circle cx="46" cy="30" r="3" fill="#eeae9f" opacity="0.4" />
            <circle cx="62" cy="30" r="5" fill="#34d399" opacity="0.9" />
            <circle cx="62" cy="30" r="3" fill="#a6f3d5" opacity="0.4" />

            {/* URL bar */}
            <rect x="95" y="20" width="220" height="20" rx="6" fill="rgba(0,0,0,0.25)" />
            <circle cx="108" cy="30" r="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text x="210" y="34" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8.5" fontFamily="system-ui, monospace">nexus.kayzen-lyon.fr/audit</text>

            {/* ── Separator ── */}
            <line x1="10" y1="50" x2="410" y2="50" stroke="rgba(124,58,237,0.2)" strokeWidth="0.5" />

            {/* ── Score gauge (top-left) ── */}
            <g transform="translate(74, 108)">
              {/* Ambient glow behind gauge */}
              <circle cx="0" cy="0" r="52" fill="rgba(254,205,77,0.04)" />
              {/* Track ring */}
              <circle cx="0" cy="0" r="42" fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="7" />
              {/* Second decorative track */}
              <circle cx="0" cy="0" r="35" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              {/* Progress ring */}
              <circle cx="0" cy="0" r="42" fill="none" stroke="#e18268" strokeWidth="7"
                strokeDasharray="226" strokeDashoffset="28" strokeLinecap="round"
                transform="rotate(-90)" className="hero-line-draw"
                filter="url(#glow-gold)"
              />
              {/* Score text */}
              <text x="0" y="-6" textAnchor="middle" fill="#e18268" fontSize="26" fontWeight="900" fontFamily="system-ui" className="hero-score-text">94</text>
              <text x="0" y="10" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="7.5" fontWeight="600" fontFamily="system-ui" letterSpacing="1.5">/100</text>
              {/* Grade badge */}
              <rect x="-12" y="15" width="24" height="13" rx="4" fill="rgba(225,130,104,0.2)" />
              <text x="0" y="25" textAnchor="middle" fill="#e18268" fontSize="8" fontWeight="800" fontFamily="system-ui">A+</text>
            </g>
            <text x="74" y="168" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7.5" fontWeight="700" fontFamily="system-ui" letterSpacing="1.5">SCORE SEO</text>

            {/* ── 3 mini KPI cards (top-right) ── */}
            {[
              { y: 64, label: 'Performance', value: '96', color: '#34d399', bar: 77, icon: '▲' },
              { y: 102, label: 'Accessibilité', value: '91', color: '#e18268', bar: 73, icon: '●' },
              { y: 140, label: 'Visibilité IA', value: '87', color: '#6d8cb5', bar: 70, icon: '◆' },
            ].map((kpi, i) => (
              <g key={i} transform={`translate(148, ${kpi.y})`} style={{ animation: `hero-grow-bar 0.6s ease-out ${0.3 + i * 0.15}s both` }}>
                {/* Card background */}
                <rect width="248" height="32" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(109,140,181,0.25)" strokeWidth="0.5" />
                {/* Left accent line */}
                <rect x="0" y="4" width="2.5" height="24" rx="1.5" fill={kpi.color} opacity="0.7" />
                <text x="14" y="20" fill={kpi.color} fontSize="9" fontFamily="system-ui">{kpi.icon}</text>
                <text x="28" y="20" fill="rgba(255,255,255,0.65)" fontSize="9" fontFamily="system-ui">{kpi.label}</text>
                <text x="234" y="21" textAnchor="end" fill={kpi.color} fontSize="13" fontWeight="900" fontFamily="system-ui">{kpi.value}</text>
                {/* Progress track */}
                <rect x="130" y="13" width="85" height="5" rx="2.5" fill="rgba(255,255,255,0.05)" />
                {/* Progress fill */}
                <rect x="130" y="13" width={kpi.bar} height="5" rx="2.5" fill={kpi.color} opacity="0.55" className="hero-bar" style={{ '--bar-delay': `${0.5 + i * 0.2}s` } as React.CSSProperties} />
              </g>
            ))}

            {/* ── Divider ── */}
            <line x1="30" y1="182" x2="390" y2="182" stroke="rgba(124,58,237,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* ── Bar chart (bottom-left) ── */}
            <g transform="translate(30, 194)">
              <text x="0" y="10" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="700" fontFamily="system-ui" letterSpacing="1">TRAFIC ORGANIQUE</text>
              <text x="170" y="10" textAnchor="end" fill="#34d399" fontSize="7.5" fontWeight="700" fontFamily="system-ui" filter="url(#glow-green)">+142%</text>
              {/* Grid lines */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={22 + i * 27} x2="170" y2={22 + i * 27} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              ))}
              {/* Bars with gradients */}
              {[
                { x: 5,   h: 22, delay: '0.3s', grad: 'bar-grad-violet' },
                { x: 19,  h: 32, delay: '0.4s', grad: 'bar-grad-violet' },
                { x: 33,  h: 28, delay: '0.5s', grad: 'bar-grad-violet' },
                { x: 47,  h: 42, delay: '0.6s', grad: 'bar-grad-violet' },
                { x: 61,  h: 36, delay: '0.7s', grad: 'bar-grad-violet' },
                { x: 75,  h: 50, delay: '0.8s', grad: 'bar-grad-violet' },
                { x: 89,  h: 46, delay: '0.9s', grad: 'bar-grad-violet' },
                { x: 103, h: 60, delay: '1.0s', grad: 'bar-grad-violet' },
                { x: 117, h: 56, delay: '1.1s', grad: 'bar-grad-violet' },
                { x: 131, h: 70, delay: '1.2s', grad: 'bar-grad-violet' },
                { x: 145, h: 65, delay: '1.3s', grad: 'bar-grad-gold' },
                { x: 159, h: 85, delay: '1.4s', grad: 'bar-grad-gold' },
              ].map((bar, i) => (
                <rect
                  key={i} x={bar.x} y={107 - bar.h} width="10" height={bar.h} rx="3"
                  fill={`url(#${bar.grad})`}
                  className="hero-bar"
                  style={{ '--bar-delay': bar.delay } as React.CSSProperties}
                />
              ))}
              <line x1="0" y1="107" x2="170" y2="107" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </g>

            {/* ── Line chart (bottom-right) ── */}
            <g transform="translate(218, 194)">
              <text x="0" y="10" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="700" fontFamily="system-ui" letterSpacing="1">POSITIONS GOOGLE</text>
              <text x="172" y="10" textAnchor="end" fill="#e18268" fontSize="7.5" fontWeight="700" fontFamily="system-ui">Top 3 ↑</text>
              {/* Grid */}
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={22 + i * 27} x2="172" y2={22 + i * 27} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              ))}
              {/* Area fill */}
              <polygon
                points="0,90 15,85 30,80 45,76 60,70 75,62 90,56 105,43 120,37 135,28 150,22 165,16 165,107 0,107"
                fill="#e18268" opacity="0.5" className="hero-line-draw" style={{ animationDelay: '0.8s' }}
              />
              {/* Line */}
              <polyline
                points="0,90 15,85 30,80 45,76 60,70 75,62 90,56 105,43 120,37 135,28 150,22 165,16"
                stroke="#e18268" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
                className="hero-line-draw"
                filter="url(#glow-gold)"
              />
              {/* Dots on line */}
              {[[0,90],[45,76],[90,56],[135,28],[165,16]].map(([cx,cy],i) => (
                <circle key={i} cx={cx} cy={cy} r={i === 4 ? 4.5 : 2.5} fill="#e18268"
                  opacity={i === 4 ? 1 : 0.5}
                  className={i === 4 ? 'hero-score-text' : ''}
                  filter={i === 4 ? 'url(#glow-gold)' : undefined}
                />
              ))}
              <line x1="0" y1="107" x2="172" y2="107" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </g>

            {/* ── Bottom status bar ── */}
            <g transform="translate(30, 338)">
              <rect width="360" height="28" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(43,74,116,0.2)" strokeWidth="0.5" />
              {/* Live pulse */}
              <circle cx="16" cy="14" r="5" fill="#34d399" opacity="0.15" className="hero-score-text" />
              <circle cx="16" cy="14" r="3.5" fill="#34d399" filter="url(#glow-green)" />
              <text x="28" y="18.5" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="system-ui">Analyse complète · 50+ contrôles validés</text>
              <rect x="298" y="8" width="55" height="14" rx="4" fill="rgba(254,205,77,0.12)" />
              <text x="325" y="18.5" textAnchor="middle" fill="#e18268" fontSize="8" fontWeight="800" fontFamily="system-ui">94/100 ✓</text>
            </g>

          </svg>
          </div>
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
                { x: 54, h: 85, delay: '0.8s', color: '#2b4a74' },
                { x: 72, h: 60, delay: '1.0s', color: 'rgba(124,58,237,0.7)' },
                { x: 90, h: 95, delay: '1.2s', color: '#e18268' },
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
                stroke="#e18268"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hero-line-draw"
              />
              <polygon
                points="0,80 25,65 50,55 75,35 100,25 125,10 125,90 0,90"
                fill="#e18268"
                opacity="0.25"
                className="hero-line-draw"
                style={{ animationDelay: '1s' }}
              />
              <line x1="0" y1="90" x2="125" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </g>

            <defs>
              
            </defs>
          </svg>
        </div>

      </div>
    </section>
  )
}
