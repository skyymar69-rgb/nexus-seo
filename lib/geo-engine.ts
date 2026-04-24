/**
 * GEO Engine — Generative Engine Optimization Core
 * Surpasse les concurrents: Natural-Net, Datashake, BotRank, Qwairy
 *
 * Features:
 * - Share of Voice vs concurrents dans les LLMs
 * - Support 7+ LLMs (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Mistral, Grok)
 * - Citation source tracking (URLs citees par les LLMs)
 * - Prompt library par secteur d'activite
 * - E-E-A-T scoring detaille
 * - Schema markup validation avancee
 * - FAQ auto-detection & optimization scoring
 */

import * as cheerio from 'cheerio'

// ─── Share of Voice ───────────────────────────────────────────

export interface ShareOfVoiceResult {
  brand: string
  mentions: number
  totalQueries: number
  sharePercent: number
  sentiment: { positive: number; neutral: number; negative: number }
  avgPosition: number
}

export interface ShareOfVoiceReport {
  yourBrand: ShareOfVoiceResult
  competitors: ShareOfVoiceResult[]
  totalQueries: number
  dominantBrand: string
  insights: string[]
}

export function calculateShareOfVoice(
  queries: Array<{ response: string; mentioned: boolean; sentiment: string; position: number }>,
  brandName: string,
  competitorNames: string[]
): ShareOfVoiceReport {
  const totalQueries = queries.length

  function countBrand(name: string): ShareOfVoiceResult {
    const nameLower = name.toLowerCase()
    const mentionedQueries = queries.filter(q => q.response.toLowerCase().includes(nameLower))
    const mentions = mentionedQueries.length
    const sentiments = { positive: 0, neutral: 0, negative: 0 }
    mentionedQueries.forEach(q => {
      if (q.sentiment === 'positive') sentiments.positive++
      else if (q.sentiment === 'negative') sentiments.negative++
      else sentiments.neutral++
    })
    const positions = mentionedQueries.map(q => {
      const sentences = q.response.split(/[.!?]+/)
      const idx = sentences.findIndex(s => s.toLowerCase().includes(nameLower))
      return idx >= 0 ? idx + 1 : 10
    })
    const avgPosition = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0

    return {
      brand: name,
      mentions,
      totalQueries,
      sharePercent: totalQueries > 0 ? Math.round((mentions / totalQueries) * 100) : 0,
      sentiment: sentiments,
      avgPosition: Math.round(avgPosition * 10) / 10,
    }
  }

  const yourBrand = countBrand(brandName)
  const competitors = competitorNames.map(c => countBrand(c))
  const all = [yourBrand, ...competitors]
  const dominantBrand = all.reduce((best, c) => c.sharePercent > best.sharePercent ? c : best).brand

  const insights: string[] = []
  if (yourBrand.sharePercent === 0) insights.push(`${brandName} n'est mentionne dans aucune reponse IA. Action urgente requise.`)
  else if (yourBrand.sharePercent < 20) insights.push(`${brandName} a une visibilite IA faible (${yourBrand.sharePercent}%). Objectif: depasser 30%.`)
  else if (yourBrand.sharePercent >= 50) insights.push(`${brandName} domine les reponses IA avec ${yourBrand.sharePercent}% de share of voice.`)

  const topCompetitor = competitors.reduce((best, c) => c.sharePercent > best.sharePercent ? c : best, { sharePercent: 0, brand: '' })
  if (topCompetitor.sharePercent > yourBrand.sharePercent) {
    insights.push(`${topCompetitor.brand} vous devance avec ${topCompetitor.sharePercent}% vs ${yourBrand.sharePercent}%.`)
  }

  if (yourBrand.sentiment.negative > yourBrand.sentiment.positive) {
    insights.push(`Attention: le sentiment des mentions de ${brandName} est majoritairement negatif.`)
  }

  return { yourBrand, competitors, totalQueries, dominantBrand, insights }
}

// ─── Citation Source Tracking ─────────────────────────────────

export interface CitationSource {
  url: string
  domain: string
  count: number
  contexts: string[]
}

export function extractCitationSources(responses: string[]): CitationSource[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  const sources = new Map<string, CitationSource>()

  for (const response of responses) {
    const urls = response.match(urlRegex) || []
    for (const url of urls) {
      try {
        const parsed = new URL(url)
        const domain = parsed.hostname
        const existing = sources.get(domain)
        if (existing) {
          existing.count++
          if (existing.contexts.length < 3) {
            const sentence = response.split(/[.!?]+/).find(s => s.includes(url))?.trim()
            if (sentence) existing.contexts.push(sentence.slice(0, 200))
          }
        } else {
          const sentence = response.split(/[.!?]+/).find(s => s.includes(url))?.trim()
          sources.set(domain, {
            url,
            domain,
            count: 1,
            contexts: sentence ? [sentence.slice(0, 200)] : [],
          })
        }
      } catch { /* invalid URL */ }
    }
  }

  return Array.from(sources.values()).sort((a, b) => b.count - a.count)
}

// ─── Prompt Library par Secteur ───────────────────────────────

export interface PromptTemplate {
  id: string
  category: string
  sector: string
  prompt: string
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational'
  difficulty: 'easy' | 'medium' | 'hard'
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  // E-commerce
  { id: 'ecom-1', category: 'E-commerce', sector: 'retail', prompt: 'Quels sont les meilleurs sites pour acheter {product} en ligne en France ?', intent: 'transactional', difficulty: 'medium' },
  { id: 'ecom-2', category: 'E-commerce', sector: 'retail', prompt: 'Quel site recommandes-tu pour {product} pas cher ?', intent: 'commercial', difficulty: 'hard' },
  { id: 'ecom-3', category: 'E-commerce', sector: 'retail', prompt: 'Comparatif des meilleurs {product} en 2026', intent: 'commercial', difficulty: 'medium' },

  // SaaS / Tech
  { id: 'saas-1', category: 'SaaS', sector: 'tech', prompt: 'Quel est le meilleur outil de {category} en 2026 ?', intent: 'commercial', difficulty: 'hard' },
  { id: 'saas-2', category: 'SaaS', sector: 'tech', prompt: 'Alternative gratuite a {competitor} pour {usecase}', intent: 'commercial', difficulty: 'medium' },
  { id: 'saas-3', category: 'SaaS', sector: 'tech', prompt: 'Comment choisir un outil de {category} pour une PME ?', intent: 'informational', difficulty: 'easy' },

  // Agence / Services
  { id: 'agency-1', category: 'Agence', sector: 'services', prompt: 'Meilleure agence {specialty} a {city}', intent: 'navigational', difficulty: 'hard' },
  { id: 'agency-2', category: 'Agence', sector: 'services', prompt: 'Comment choisir une agence {specialty} ?', intent: 'informational', difficulty: 'easy' },
  { id: 'agency-3', category: 'Agence', sector: 'services', prompt: 'Combien coute une prestation de {specialty} ?', intent: 'commercial', difficulty: 'medium' },

  // Restaurant / Local
  { id: 'local-1', category: 'Local', sector: 'restaurant', prompt: 'Meilleur restaurant {cuisine} a {city}', intent: 'navigational', difficulty: 'hard' },
  { id: 'local-2', category: 'Local', sector: 'restaurant', prompt: 'Ou manger {cuisine} a {city} ?', intent: 'navigational', difficulty: 'medium' },

  // Sante / Bien-etre
  { id: 'health-1', category: 'Sante', sector: 'health', prompt: 'Quel est le meilleur {product} pour {condition} ?', intent: 'informational', difficulty: 'medium' },
  { id: 'health-2', category: 'Sante', sector: 'health', prompt: 'Avis sur {brand} pour {condition}', intent: 'commercial', difficulty: 'hard' },

  // Immobilier
  { id: 'immo-1', category: 'Immobilier', sector: 'realestate', prompt: 'Meilleure agence immobiliere a {city}', intent: 'navigational', difficulty: 'hard' },
  { id: 'immo-2', category: 'Immobilier', sector: 'realestate', prompt: 'Comment estimer la valeur de mon bien a {city} ?', intent: 'informational', difficulty: 'easy' },

  // SEO (notre secteur)
  { id: 'seo-1', category: 'SEO', sector: 'marketing', prompt: 'Meilleur outil SEO gratuit en 2026', intent: 'commercial', difficulty: 'hard' },
  { id: 'seo-2', category: 'SEO', sector: 'marketing', prompt: 'Comment auditer mon site SEO gratuitement ?', intent: 'informational', difficulty: 'easy' },
  { id: 'seo-3', category: 'SEO', sector: 'marketing', prompt: 'Quel outil pour mesurer ma visibilite dans ChatGPT ?', intent: 'commercial', difficulty: 'medium' },
  { id: 'seo-4', category: 'SEO', sector: 'marketing', prompt: 'Difference entre SEO et GEO en 2026', intent: 'informational', difficulty: 'easy' },
  { id: 'seo-5', category: 'SEO', sector: 'marketing', prompt: 'Comment optimiser mon site pour les AI Overviews de Google ?', intent: 'informational', difficulty: 'medium' },
]

export function getPromptsForSector(sector: string): PromptTemplate[] {
  return PROMPT_LIBRARY.filter(p => p.sector === sector || p.category.toLowerCase() === sector.toLowerCase())
}

export function getAllSectors(): string[] {
  return Array.from(new Set(PROMPT_LIBRARY.map(p => p.category)))
}

// ─── E-E-A-T Scoring ──────────────────────────────────────────

export interface EEATScore {
  total: number // 0-100
  experience: { score: number; signals: string[]; recommendations: string[] }
  expertise: { score: number; signals: string[]; recommendations: string[] }
  authority: { score: number; signals: string[]; recommendations: string[] }
  trust: { score: number; signals: string[]; recommendations: string[] }
}

export function calculateEEATScore(html: string, url: string): EEATScore {
  const $ = cheerio.load(html)

  // ── Experience ──
  const experienceSignals: string[] = []
  const experienceRecs: string[] = []
  let experienceScore = 25

  if ($('[class*="testimonial"], [class*="review"], [class*="temoignage"]').length > 0) {
    experienceSignals.push('Temoignages clients detectes')
    experienceScore += 15
  } else experienceRecs.push('Ajoutez des temoignages clients avec nom, photo et entreprise')

  if ($('[class*="case-stud"], [class*="cas-client"], [class*="portfolio"]').length > 0) {
    experienceSignals.push('Cas clients / portfolio detecte')
    experienceScore += 15
  } else experienceRecs.push('Publiez des etudes de cas detaillees avec resultats chiffres')

  if ($('img[alt*="photo"], img[alt*="equipe"], img[alt*="team"]').length > 0) {
    experienceSignals.push('Photos d\'equipe detectees')
    experienceScore += 10
  } else experienceRecs.push('Ajoutez des photos de votre equipe pour humaniser votre marque')

  // ── Expertise ──
  const expertiseSignals: string[] = []
  const expertiseRecs: string[] = []
  let expertiseScore = 25

  const blogLinks = $('a[href*="/blog"], a[href*="/article"], a[href*="/guide"]').length
  if (blogLinks > 3) {
    expertiseSignals.push(`${blogLinks} liens vers du contenu expert detectes`)
    expertiseScore += 15
  } else expertiseRecs.push('Creez un blog avec des articles de fond pour demontrer votre expertise')

  if ($('script[type="application/ld+json"]').length > 0) {
    const schemas = $('script[type="application/ld+json"]').map((_, el) => $(el).html()).get()
    const hasAuthor = schemas.some(s => s?.includes('"author"') || s?.includes('"Person"'))
    if (hasAuthor) {
      expertiseSignals.push('Schema author/Person detecte')
      expertiseScore += 15
    } else expertiseRecs.push('Ajoutez un schema Person pour les auteurs de vos contenus')

    const hasOrg = schemas.some(s => s?.includes('"Organization"'))
    if (hasOrg) {
      expertiseSignals.push('Schema Organization detecte')
      expertiseScore += 10
    }
  } else expertiseRecs.push('Ajoutez des donnees structurees JSON-LD (Organization, Person, Article)')

  // ── Authority ──
  const authoritySignals: string[] = []
  const authorityRecs: string[] = []
  let authorityScore = 25

  if ($('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="github.com"]').length > 0) {
    authoritySignals.push('Liens vers profils sociaux detectes')
    authorityScore += 10
  } else authorityRecs.push('Ajoutez des liens vers vos profils LinkedIn, Twitter, GitHub')

  if ($('a[href*="mention"], a[href*="press"], [class*="press"], [class*="media"]').length > 0) {
    authoritySignals.push('Mentions presse detectees')
    authorityScore += 15
  } else authorityRecs.push('Obtenez des mentions dans la presse et affichez-les sur votre site')

  const externalLinks = $('a[href^="http"]').filter((_, el) => {
    try { return new URL($(el).attr('href') || '').hostname !== new URL(url).hostname } catch { return false }
  }).length
  if (externalLinks > 5) {
    authoritySignals.push(`${externalLinks} liens externes sortants (citations)`)
    authorityScore += 10
  } else authorityRecs.push('Citez des sources externes fiables pour renforcer votre autorite')

  // ── Trust ──
  const trustSignals: string[] = []
  const trustRecs: string[] = []
  let trustScore = 25

  if (url.startsWith('https')) {
    trustSignals.push('HTTPS actif')
    trustScore += 10
  } else trustRecs.push('Passez en HTTPS immediatement')

  if ($('a[href*="privacy"], a[href*="confidentialite"], a[href*="rgpd"]').length > 0) {
    trustSignals.push('Lien vers politique de confidentialite detecte')
    trustScore += 10
  } else trustRecs.push('Ajoutez un lien visible vers votre politique de confidentialite')

  if ($('a[href*="mention"], a[href*="legales"], a[href*="cgu"]').length > 0) {
    trustSignals.push('Mentions legales detectees')
    trustScore += 10
  } else trustRecs.push('Affichez vos mentions legales (obligatoire en France)')

  if ($('[class*="contact"], a[href*="contact"], a[href^="tel:"], a[href^="mailto:"]').length > 0) {
    trustSignals.push('Informations de contact detectees')
    trustScore += 10
  } else trustRecs.push('Affichez clairement vos coordonnees (adresse, telephone, email)')

  if ($('[class*="avis"], [class*="rating"], [class*="star"]').length > 0) {
    trustSignals.push('Avis/notes detectes')
    trustScore += 5
  } else trustRecs.push('Integrez des avis clients verifies (Google, Trustpilot)')

  const total = Math.round(
    (Math.min(100, experienceScore) + Math.min(100, expertiseScore) + Math.min(100, authorityScore) + Math.min(100, trustScore)) / 4
  )

  return {
    total,
    experience: { score: Math.min(100, experienceScore), signals: experienceSignals, recommendations: experienceRecs },
    expertise: { score: Math.min(100, expertiseScore), signals: expertiseSignals, recommendations: expertiseRecs },
    authority: { score: Math.min(100, authorityScore), signals: authoritySignals, recommendations: authorityRecs },
    trust: { score: Math.min(100, trustScore), signals: trustSignals, recommendations: trustRecs },
  }
}

// ─── Schema Markup Validator ──────────────────────────────────

export interface SchemaValidation {
  found: Array<{ type: string; valid: boolean; issues: string[] }>
  missing: string[]
  score: number
  recommendations: string[]
}

export function validateSchemaMarkup(html: string): SchemaValidation {
  const $ = cheerio.load(html)
  const schemas = $('script[type="application/ld+json"]')
  const found: SchemaValidation['found'] = []
  const detectedTypes = new Set<string>()
  const recommendations: string[] = []

  schemas.each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}')
      const items = json['@graph'] || [json]
      for (const item of items) {
        const type = item['@type']
        if (!type) continue
        detectedTypes.add(type)
        const issues: string[] = []

        if (type === 'Organization') {
          if (!item.name) issues.push('name manquant')
          if (!item.url) issues.push('url manquant')
          if (!item.logo) issues.push('logo manquant')
          if (!item.contactPoint) issues.push('contactPoint manquant (recommande)')
        }
        if (type === 'WebSite') {
          if (!item.url) issues.push('url manquant')
          if (!item.potentialAction) issues.push('SearchAction manquante (recommande)')
        }
        if (type === 'Article' || type === 'BlogPosting') {
          if (!item.author) issues.push('author manquant')
          if (!item.datePublished) issues.push('datePublished manquant')
          if (!item.image) issues.push('image manquante')
        }
        if (type === 'FAQPage') {
          if (!item.mainEntity || item.mainEntity.length === 0) issues.push('mainEntity vide')
        }
        if (type === 'Product') {
          if (!item.offers) issues.push('offers manquant')
          if (!item.aggregateRating) issues.push('aggregateRating manquant (recommande)')
        }

        found.push({ type, valid: issues.length === 0, issues })
      }
    } catch { /* invalid JSON-LD */ }
  })

  // Check for missing recommended schemas
  const missing: string[] = []
  const recommended = ['Organization', 'WebSite', 'BreadcrumbList']
  for (const type of recommended) {
    if (!detectedTypes.has(type)) {
      missing.push(type)
      recommendations.push(`Ajoutez un schema ${type} pour ameliorer votre visibilite dans les resultats enrichis`)
    }
  }

  // Check for FAQ presence
  if ($('details, [class*="faq"], [class*="accordion"]').length > 0 && !detectedTypes.has('FAQPage')) {
    missing.push('FAQPage')
    recommendations.push('Votre page contient une FAQ — ajoutez un schema FAQPage pour apparaitre dans les resultats enrichis')
  }

  // Check for article content
  if ($('article, [class*="blog"], [class*="post"]').length > 0 && !detectedTypes.has('Article') && !detectedTypes.has('BlogPosting')) {
    missing.push('Article')
    recommendations.push('Contenu editorial detecte — ajoutez un schema Article ou BlogPosting')
  }

  const score = Math.min(100, found.filter(f => f.valid).length * 15 + (missing.length === 0 ? 20 : 0))

  return { found, missing, score, recommendations }
}

// ─── FAQ Detection & Optimization ─────────────────────────────

export interface FAQAnalysis {
  detected: boolean
  questionsFound: number
  questions: Array<{ question: string; answer: string; wordCount: number; hasLink: boolean }>
  hasSchema: boolean
  score: number
  recommendations: string[]
}

export function analyzeFAQ(html: string): FAQAnalysis {
  const $ = cheerio.load(html)
  const recommendations: string[] = []
  const questions: FAQAnalysis['questions'] = []

  // Detect FAQ sections
  const faqSections = $('details, [class*="faq"] [class*="question"], [class*="accordion"] summary, dt')
  const detected = faqSections.length > 0

  faqSections.each((_, el) => {
    const q = $(el).text().trim()
    const a = $(el).is('details')
      ? $(el).find('div, p').first().text().trim()
      : $(el).next('dd, div, p').text().trim()

    if (q && q.length > 10) {
      questions.push({
        question: q.slice(0, 200),
        answer: a.slice(0, 500),
        wordCount: a.split(/\s+/).length,
        hasLink: $(el).next().find('a').length > 0 || $(el).find('a').length > 0,
      })
    }
  })

  // Check schema
  const hasSchema = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).html())
    .get()
    .some(s => s?.includes('FAQPage'))

  let score = 0
  if (detected) score += 20
  if (questions.length >= 5) score += 20
  else if (questions.length >= 3) score += 10
  if (hasSchema) score += 30
  if (questions.some(q => q.wordCount >= 50)) score += 15
  if (questions.some(q => q.hasLink)) score += 15

  if (!detected) recommendations.push('Ajoutez une section FAQ a votre page pour repondre aux questions frequentes des utilisateurs')
  if (detected && !hasSchema) recommendations.push('Ajoutez un schema FAQPage JSON-LD pour que Google affiche vos questions dans les resultats enrichis')
  if (questions.length < 5) recommendations.push(`Vous avez ${questions.length} questions — visez au moins 5-8 questions pour couvrir les intentions de recherche`)
  if (questions.every(q => q.wordCount < 50)) recommendations.push('Vos reponses sont trop courtes — visez 50-150 mots par reponse pour satisfaire les LLMs')
  if (questions.every(q => !q.hasLink)) recommendations.push('Ajoutez des liens internes dans vos reponses FAQ pour ameliorer le maillage')

  return { detected, questionsFound: questions.length, questions, hasSchema, score, recommendations }
}

// ─── LLM Provider Registry ───────────────────────────────────

export const SUPPORTED_LLMS = [
  { id: 'chatgpt', name: 'ChatGPT', provider: 'OpenAI', model: 'gpt-4o-mini', status: 'active' },
  { id: 'claude', name: 'Claude', provider: 'Anthropic', model: 'claude-sonnet-4-20250514', status: 'active' },
  { id: 'gemini', name: 'Gemini', provider: 'Google', model: 'gemini-pro', status: 'active' },
  { id: 'perplexity', name: 'Perplexity', provider: 'Perplexity AI', model: 'sonar', status: 'planned' },
  { id: 'deepseek', name: 'DeepSeek', provider: 'DeepSeek', model: 'deepseek-chat', status: 'planned' },
  { id: 'mistral', name: 'Mistral', provider: 'Mistral AI', model: 'mistral-large', status: 'planned' },
  { id: 'grok', name: 'Grok', provider: 'xAI', model: 'grok-2', status: 'planned' },
] as const

export type LLMId = typeof SUPPORTED_LLMS[number]['id']

export function getActiveLLMs() {
  return SUPPORTED_LLMS.filter(l => l.status === 'active')
}

export function getAllLLMs() {
  return SUPPORTED_LLMS
}
