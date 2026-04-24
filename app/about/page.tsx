import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Zap, Target, Globe, Users, TrendingUp, Award } from 'lucide-react'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export const metadata = {
  title: 'À propos — Notre Mission SEO IA',
  description: 'Nexus est né d\'une conviction : les outils SEO du passé ne suffisent plus à l\'ère de l\'IA. Découvrez notre mission, notre équipe et notre vision du SEO en 2026.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'À propos — Nexus SEO',
    description: 'Nexus est né d\'une conviction : les outils SEO du passé ne suffisent plus à l\'ère de l\'IA. Découvrez notre mission et notre équipe.',
    images: ['/api/og?title=A%20propos&subtitle=Kayzen%20Web%20x%20Nexus'],
  },
}

const values = [
  { icon: Target, title: 'Mission', desc: 'Rendre la visibilité IA accessible à toutes les entreprises, pas seulement aux grandes corporations avec des équipes de 20 personnes.' },
  { icon: Globe, title: 'Vision', desc: 'Devenir la référence mondiale du SEO à l\'ère des moteurs génératifs — là où Google SGE, ChatGPT et Perplexity remplacent les résultats traditionnels.' },
  { icon: Zap, title: 'Innovation', desc: 'Nexus est le seul outil qui monitore en temps réel les mentions dans 10+ LLMs. Nous inventons les disciplines de demain : GEO, AEO, LLMO.' },
]

const stats = [
  { value: '2 500+', label: 'Équipes actives', desc: '45 pays' },
  { value: '2026', label: 'Fondé en', desc: 'Lyon, France' },
  { value: '4,9/5', label: 'Note G2', desc: '847 avis' },
  { value: '98%', label: 'Rétention', desc: 'Taux annuel' },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-surface-950">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'À propos' }]} />
            <div className="text-center">
            <div className="section-badge mx-auto mb-6">Notre histoire</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 dark:text-white mb-6 leading-tight">
              Nous construisons{' '}
              <span className="gradient-text">le SEO de demain</span>
            </h1>
            <p className="text-xl text-surface-500 dark:text-surface-400 leading-relaxed max-w-2xl mx-auto">
              Nexus est né d&apos;une conviction simple : les outils SEO de 2015 ne peuvent pas résoudre les défis de 2026. L&apos;IA a tout changé — nous l&apos;avons accepté avant tout le monde.
            </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800/60">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black gradient-text mb-1">{s.value}</p>
                <p className="font-semibold text-surface-900 dark:text-white text-sm">{s.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-surface-950">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">Notre histoire</h2>
            <div className="prose-custom space-y-5 text-surface-600 dark:text-surface-400 leading-relaxed">
              <p>En 2024, Google lance les AI Overviews. Du jour au lendemain, des centaines de milliers de sites voient leur trafic s&apos;effondrer — sans comprendre pourquoi. Les outils SEO existants affichent des scores verts pendant que le trafic chute de 40%.</p>
              <p>C&apos;est ce moment de rupture qui a donné naissance à Nexus. Nous avons compris que le problème n&apos;était pas technique — c&apos;était structurel. Les anciens outils mesurent des signaux du passé. Ils ne voient pas ce qui se passe dans les LLMs.</p>
              <p>Nexus a été conçu from scratch pour répondre aux trois nouvelles disciplines du référencement IA : le <strong className="text-surface-900 dark:text-white">GEO</strong> (être cité dans les réponses génératives), l&apos;<strong className="text-surface-900 dark:text-white">AEO</strong> (dominer les featured snippets) et le <strong className="text-surface-900 dark:text-white">LLMO</strong> (être recommandé par ChatGPT, Claude et Gemini).</p>
              <p>Aujourd&apos;hui, 2 500+ équipes dans 45 pays font confiance à Nexus pour naviguer dans cette nouvelle réalité du search.</p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-12 text-center">Ce qui nous guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v) => {
                const Icon = v.icon
                return (
                  <div key={v.title} className="card p-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-3">{v.title}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{v.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
