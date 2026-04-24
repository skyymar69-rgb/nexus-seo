'use client'

import { Leaf, Zap, Globe, Server, ArrowRight, TrendingDown, Gauge } from 'lucide-react'
import Link from 'next/link'

const stats = [
  {
    value: '1,76 g',
    unit: 'CO2 / page vue',
    desc: 'Émission moyenne d\'une page web standard. Les pages mal optimisées peuvent atteindre 5 à 10 g.',
    source: 'Website Carbon Calculator',
  },
  {
    value: '2 %',
    unit: 'des émissions mondiales',
    desc: 'Le numérique représente autant d\'émissions que le transport aérien. Chaque page lourde y contribue.',
    source: 'The Shift Project',
  },
  {
    value: '×3',
    unit: 'poids moyen depuis 2010',
    desc: 'Le poids moyen d\'une page web est passé de 700 Ko à 2,2 Mo. Plus lourd = plus de serveurs = plus d\'énergie.',
    source: 'HTTP Archive',
  },
]

const optimizations = [
  {
    icon: Gauge,
    title: 'Core Web Vitals',
    problem: 'Un LCP > 4s = 3x plus de rebond + surconsommation serveur',
    solution: 'Nexus identifie les éléments bloquants et recommande des corrections concrètes',
  },
  {
    icon: Zap,
    title: 'CSS & JS non différés',
    problem: 'Charger 500 Ko de CSS/JS inutiles = ~0,5 g CO2 par visite',
    solution: 'Détectez le code mort et le render-blocking pour réduire le poids de 60%',
  },
  {
    icon: Globe,
    title: 'Images non optimisées',
    problem: 'Une image PNG de 2 Mo au lieu de WebP = 10x le transfert réseau',
    solution: 'Auditez toutes vos images : format, compression, lazy loading, dimensions',
  },
  {
    icon: Server,
    title: 'Pages mal indexées',
    problem: 'Les crawlers revisitent des pages inutiles : erreurs 404, redirections en chaîne',
    solution: 'Nexus détecte les pages orphelines, les boucles de redirect et le crawl budget gaspillé',
  },
]

export function EcoImpact() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-950 to-surface-950 text-white overflow-hidden relative" id="eco">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm font-semibold">Notre raison d&apos;être</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Optimiser le SEO,{' '}
            <span className="text-green-400">c&apos;est réduire l&apos;empreinte carbone</span>
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Une page rapide, légère et bien référencée consomme moins d&apos;énergie, sollicite moins les serveurs et offre une meilleure expérience utilisateur. Le SEO technique et la performance web ne sont pas que des leviers de croissance — ce sont des actes concrets pour un numérique plus responsable.
          </p>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="mb-4">
                <span className="text-4xl font-black text-green-400">{s.value}</span>
                <span className="block text-sm text-green-300/80 mt-1">{s.unit}</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">{s.desc}</p>
              <p className="text-xs text-white/40">Source : {s.source}</p>
            </div>
          ))}
        </div>

        {/* How Nexus helps */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-10">
            Comment Nexus réduit concrètement votre impact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {optimizations.map((opt, i) => {
              const Icon = opt.icon
              return (
                <div key={i} className="rounded-2xl p-6 bg-white/5 border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">{opt.title}</h4>
                      <p className="text-sm text-red-300/80 mb-2 flex items-start gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {opt.problem}
                      </p>
                      <p className="text-sm text-green-300/80 flex items-start gap-1.5">
                        <Leaf className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {opt.solution}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Equation */}
        <div className="rounded-2xl p-8 sm:p-10 bg-white/5 border border-green-500/20 text-center mb-16">
          <p className="text-lg sm:text-xl font-semibold text-white mb-4">
            Site rapide + SEO optimisé = Moins de requêtes serveur, moins de transfert, moins d&apos;énergie
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/60">
            <span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">Page 3 Mo, LCP 6s → ~4,5 g CO2/visite</span>
            <ArrowRight className="w-4 h-4 text-green-400" />
            <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">Page 400 Ko, LCP 1,2s → ~0,3 g CO2/visite</span>
          </div>
          <p className="text-sm text-white/50 mt-4">
            Sur 100 000 pages vues/mois, c&apos;est l&apos;équivalent de 500 km en voiture économisés chaque mois.
          </p>
        </div>

        {/* Kayzen bridge */}
        <div className="rounded-2xl p-8 sm:p-10 bg-gradient-to-r from-brand-600/20 to-green-600/20 border border-brand-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Nexus diagnostique. Kayzen Web construit.
          </h3>
          <p className="text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed">
            Nexus identifie les problèmes. Pour aller plus loin, <strong className="text-white">Kayzen Web</strong> crée des sites React/Next.js ultra-légers, optimisés SEO dès la conception — avec un bilan carbone minimal. Et avec <strong className="text-white">Kayzen Reconditionné</strong>, l&apos;engagement va jusqu&apos;au matériel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://internet.kayzen-lyon.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-950 font-bold text-sm hover:bg-white/90 transition-all"
            >
              Découvrir Kayzen Web <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://www.kayzen-lyon.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 text-green-300 font-bold text-sm border border-green-500/30 hover:bg-green-500/30 transition-all"
            >
              <Leaf className="w-4 h-4" /> Kayzen Reconditionné
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
