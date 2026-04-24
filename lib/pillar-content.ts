/**
 * Pillar Page Content Generator
 * Genere des pages piliers SEO structurees pour le topic clustering
 *
 * Une page pilier couvre un sujet large et renvoie vers des articles
 * satellites (cluster content) pour le maillage interne.
 */

export interface PillarPageStructure {
  title: string
  metaDescription: string
  slug: string
  tocItems: Array<{ id: string; title: string; level: number }>
  sections: PillarSection[]
  clusterTopics: ClusterTopic[]
  internalLinks: string[]
  estimatedWordCount: number
  seoScore: number
}

export interface PillarSection {
  id: string
  type: 'hero' | 'overview' | 'deep-dive' | 'comparison' | 'faq' | 'cta' | 'stats'
  title: string
  content: string
  subsections?: Array<{ title: string; content: string }>
}

export interface ClusterTopic {
  title: string
  slug: string
  relationship: 'subtopic' | 'related' | 'advanced'
  targetKeyword: string
  suggestedWordCount: number
  outline: string[]
}

/**
 * Generate a pillar page structure from a main topic
 */
export async function generatePillarPage(options: {
  mainTopic: string
  targetAudience: string
  language: string
  depth: 'standard' | 'comprehensive' | 'expert'
}): Promise<PillarPageStructure> {
  const { mainTopic, targetAudience, language, depth } = options

  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      return await generateWithGPT(mainTopic, targetAudience, language, depth)
    } catch (error) {
      console.error('GPT pillar generation failed:', error)
    }
  }

  return generateTemplate(mainTopic, targetAudience, depth)
}

async function generateWithGPT(
  topic: string,
  audience: string,
  language: string,
  depth: string
): Promise<PillarPageStructure> {
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const wordTarget = depth === 'expert' ? 5000 : depth === 'comprehensive' ? 3000 : 2000

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 3000,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `Tu es un expert en content strategy SEO. Genere une structure de page pilier en JSON.
Format strict:
{
  "title": "Titre H1 optimise",
  "metaDescription": "150 chars max",
  "sections": [
    {"id": "overview", "type": "overview", "title": "...", "content": "200+ mots"},
    {"id": "section-1", "type": "deep-dive", "title": "...", "content": "300+ mots", "subsections": [{"title": "...", "content": "150+ mots"}]},
    {"id": "faq", "type": "faq", "title": "FAQ", "content": "Q: ...\\nR: ...\\n\\nQ: ...\\nR: ..."},
    {"id": "cta", "type": "cta", "title": "...", "content": "..."}
  ],
  "clusterTopics": [
    {"title": "...", "slug": "...", "relationship": "subtopic", "targetKeyword": "...", "suggestedWordCount": 1500, "outline": ["Point 1", "Point 2"]}
  ]
}`
      },
      {
        role: 'user',
        content: `Cree une page pilier sur "${topic}" pour "${audience}". Langue: ${language === 'fr' ? 'francais' : 'anglais'}. Profondeur: ${depth}. Objectif: ${wordTarget} mots. Inclus 5-8 cluster topics.`,
      },
    ],
  })

  const text = completion.choices[0]?.message?.content?.trim() || '{}'
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  const sections: PillarSection[] = (parsed.sections || []).map((s: any) => ({
    id: s.id || slugify(s.title || ''),
    type: s.type || 'deep-dive',
    title: s.title || '',
    content: s.content || '',
    subsections: s.subsections,
  }))

  const clusterTopics: ClusterTopic[] = (parsed.clusterTopics || []).map((c: any) => ({
    title: c.title || '',
    slug: c.slug || slugify(c.title || ''),
    relationship: c.relationship || 'subtopic',
    targetKeyword: c.targetKeyword || c.title || '',
    suggestedWordCount: c.suggestedWordCount || 1500,
    outline: c.outline || [],
  }))

  const tocItems = sections
    .filter(s => s.type !== 'cta')
    .map(s => ({ id: s.id, title: s.title, level: 2 }))

  const totalWords = sections.reduce((sum, s) => {
    let words = s.content.split(/\s+/).length
    if (s.subsections) words += s.subsections.reduce((ss, sub) => ss + sub.content.split(/\s+/).length, 0)
    return sum + words
  }, 0)

  return {
    title: parsed.title || topic,
    metaDescription: parsed.metaDescription || '',
    slug: slugify(parsed.title || topic),
    tocItems,
    sections,
    clusterTopics,
    internalLinks: clusterTopics.map(c => `/blog/${c.slug}`),
    estimatedWordCount: totalWords,
    seoScore: calculatePillarSEOScore(sections, clusterTopics, topic),
  }
}

function generateTemplate(topic: string, audience: string, depth: string): PillarPageStructure {
  const sections: PillarSection[] = [
    { id: 'overview', type: 'overview', title: `Tout savoir sur ${topic}`, content: `${topic} est un sujet essentiel pour ${audience}. Ce guide complet couvre tous les aspects de ${topic}, des fondamentaux aux strategies avancees. Vous decouvrirez comment maitriser ${topic} pour ameliorer vos resultats.` },
    { id: 'definition', type: 'deep-dive', title: `Qu'est-ce que ${topic} ?`, content: `${topic} designe l'ensemble des techniques et methodes utilisees pour optimiser votre presence digitale. Comprendre ${topic} est la premiere etape vers une strategie efficace.` },
    { id: 'importance', type: 'deep-dive', title: `Pourquoi ${topic} est essentiel en 2026`, content: `L'importance de ${topic} ne cesse de croitre. Les entreprises qui investissent dans ${topic} constatent une amelioration significative de leurs performances.` },
    { id: 'methode', type: 'deep-dive', title: `Comment mettre en place ${topic}`, content: `La mise en place de ${topic} necessite une approche methodique. Voici les etapes cles pour reussir.`, subsections: [
      { title: 'Etape 1 : Audit initial', content: `Commencez par analyser votre situation actuelle vis-a-vis de ${topic}.` },
      { title: 'Etape 2 : Strategie', content: `Definissez des objectifs SMART pour ${topic}.` },
      { title: 'Etape 3 : Execution', content: `Mettez en oeuvre votre plan ${topic} et mesurez les resultats.` },
    ]},
    { id: 'faq', type: 'faq', title: 'FAQ', content: `Q: Combien de temps pour voir des resultats avec ${topic} ?\nR: Les premiers resultats sont visibles en 4 a 8 semaines.\n\nQ: ${topic} est-il adapte aux petites entreprises ?\nR: Oui, ${topic} est accessible a tous les budgets.\n\nQ: Quels outils pour ${topic} ?\nR: Nexus SEO est un excellent point de depart gratuit.` },
    { id: 'cta', type: 'cta', title: `Pret a maitriser ${topic} ?`, content: `Lancez votre audit gratuit sur Nexus SEO et commencez a optimiser ${topic} des aujourd'hui.` },
  ]

  const clusterTopics: ClusterTopic[] = [
    { title: `${topic} pour debutants`, slug: `${slugify(topic)}-debutants`, relationship: 'subtopic', targetKeyword: `${topic} debutant`, suggestedWordCount: 1500, outline: ['Introduction', 'Les bases', 'Premiers pas', 'Erreurs a eviter'] },
    { title: `${topic} avance`, slug: `${slugify(topic)}-avance`, relationship: 'advanced', targetKeyword: `${topic} avance`, suggestedWordCount: 2000, outline: ['Techniques avancees', 'Cas d\'usage', 'Optimisation', 'Mesure des resultats'] },
    { title: `Outils pour ${topic}`, slug: `outils-${slugify(topic)}`, relationship: 'related', targetKeyword: `outils ${topic}`, suggestedWordCount: 1200, outline: ['Comparatif', 'Gratuits vs payants', 'Notre selection', 'Comment choisir'] },
  ]

  return {
    title: `${topic} : Guide Complet 2026`,
    metaDescription: `Decouvrez tout sur ${topic}. Guide complet pour ${audience} avec strategies, outils et conseils pratiques.`,
    slug: slugify(topic),
    tocItems: sections.filter(s => s.type !== 'cta').map(s => ({ id: s.id, title: s.title, level: 2 })),
    sections,
    clusterTopics,
    internalLinks: clusterTopics.map(c => `/blog/${c.slug}`),
    estimatedWordCount: 800,
    seoScore: 65,
  }
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
}

function calculatePillarSEOScore(sections: PillarSection[], clusters: ClusterTopic[], topic: string): number {
  let score = 40
  if (sections.length >= 5) score += 10
  if (sections.some(s => s.type === 'faq')) score += 10
  if (sections.some(s => s.subsections && s.subsections.length >= 2)) score += 10
  if (clusters.length >= 5) score += 15
  if (clusters.some(c => c.outline.length >= 4)) score += 5
  const totalWords = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0)
  if (totalWords >= 2000) score += 10
  return Math.min(100, score)
}
