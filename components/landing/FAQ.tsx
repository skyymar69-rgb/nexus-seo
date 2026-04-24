'use client'

import { useState, useCallback, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "Qu'est-ce que le GEO, l'AEO et le LLMO ?",
    answer: "Le GEO (Generative Engine Optimization) optimise votre contenu pour apparaître dans les réponses générées par IA de Google SGE et Bing Copilot. L'AEO (Answer Engine Optimization) vous positionne sur les featured snippets et la voice search. Le LLMO (Large Language Model Optimization) fait en sorte que ChatGPT, Claude, Gemini et Perplexity recommandent naturellement votre marque dans leurs réponses.",
  },
  {
    question: "Nexus est-il vraiment 100% gratuit ?",
    answer: "Oui, tous les outils Nexus sont gratuits et sans limitation : audits illimités, suivi de mots-clés, backlinks, générateur de contenu SEO, scores GEO/AEO/LLMO. Aucune carte bancaire n'est requise. L'inscription sert uniquement à sauvegarder vos sites et suivre l'évolution de vos résultats dans le temps.",
  },
  {
    question: "Pourquoi Nexus est-il gratuit ?",
    answer: "Nexus est développé par Kayzen Web, agence de création de sites à Lyon. L'outil gratuit permet aux entreprises de diagnostiquer leurs problèmes SEO. Pour ceux qui souhaitent aller plus loin avec une refonte ou création de site optimisé, Kayzen Web propose ses services d'agence.",
  },
  {
    question: "En combien de temps voit-on les premiers résultats ?",
    answer: "Les premiers insights sont disponibles immédiatement après l'audit initial (quelques minutes). Pour les résultats concrets — amélioration des positions, meilleures pratiques SEO — les changements significatifs arrivent généralement dès la 4ème semaine pour le SEO technique, et après 6 à 12 semaines pour le GEO et le LLMO.",
  },
  {
    question: "Nexus est-il compatible avec mon CMS (WordPress, Shopify, etc.) ?",
    answer: "Oui, Nexus analyse n'importe quel site web, quel que soit le CMS : WordPress, Shopify, Webflow, Squarespace, Wix, Prestashop, ou les sites custom en React/Next.js. Il suffit d'entrer votre domaine pour lancer un audit complet.",
  },
  {
    question: "Comment Nexus surveille-t-il les mentions dans les LLMs ?",
    answer: "Nexus envoie des requêtes aux APIs de ChatGPT, Claude, Gemini, Perplexity et d'autres LLMs avec les questions-types de votre secteur. Il analyse si votre marque est citée, avec quel sentiment, et comment vous vous comparez à vos concurrents.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Oui. Nexus est hébergé sur des serveurs en Europe via Vercel et Railway, et respecte le RGPD. Vos données ne sont jamais partagées avec des tiers ni utilisées pour entraîner des modèles IA.",
  },
  {
    question: "Quel est le lien entre Nexus et Kayzen Web ?",
    answer: "Nexus est un outil gratuit développé par Kayzen Web (internet.kayzen-lyon.fr), agence web lyonnaise spécialisée dans la création de sites performants et éco-responsables en React/Next.js. Nexus diagnostique les problèmes, Kayzen Web les résout avec des sites optimisés dès la conception.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let targetIndex: number | null = null
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      targetIndex = (index + 1) % faqs.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      targetIndex = (index - 1 + faqs.length) % faqs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      targetIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      targetIndex = faqs.length - 1
    }
    if (targetIndex !== null) {
      buttonRefs.current[targetIndex]?.focus()
    }
  }, [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-badge mx-auto mb-4">FAQ</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-surface-700 dark:text-surface-400">
            Tout ce que vous voulez savoir sur Nexus, le GEO, l&apos;AEO et le LLMO.
          </p>
        </div>

        <div className="space-y-3" role="list">
          {faqs.map((faq, i) => {
            const panelId = `faq-panel-${i}`
            const buttonId = `faq-button-${i}`
            return (
              <div
                key={i}
                role="listitem"
                className={cn(
                  'card rounded-2xl overflow-hidden transition-all duration-200',
                  open === i && 'ring-1 ring-brand-500/30 dark:ring-brand-500/20'
                )}
              >
                <button
                  id={buttonId}
                  ref={(el) => { buttonRefs.current[i] = el }}
                  onClick={() => setOpen(open === i ? null : i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  aria-expanded={open === i}
                  aria-controls={panelId}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className={cn(
                    'text-sm font-semibold transition-colors',
                    open === i
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-surface-900 dark:text-white'
                  )}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                      open === i
                        ? 'rotate-180 text-brand-500'
                        : 'text-surface-600'
                    )}
                    aria-hidden="true"
                  />
                </button>

                {open === i && (
                  <div id={panelId} role="region" aria-labelledby={buttonId} className="px-5 pb-5">
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-surface-600 dark:text-surface-400 mt-10">
          Vous n&apos;avez pas trouvé votre réponse ?{' '}
          <a href="/contact" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Contactez-nous
          </a>
        </p>
      </div>
    </section>
  )
}
