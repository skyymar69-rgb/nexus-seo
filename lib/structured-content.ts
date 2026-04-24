/**
 * Structured Content Generator
 * Genere des articles SEO complets et structures via GPT
 * Fallback sur le template engine local si pas de cle API
 */

export interface ArticleSection {
  type: 'title' | 'meta' | 'introduction' | 'heading' | 'paragraph' | 'list' | 'conclusion' | 'faq'
  level?: number // h2, h3
  content: string
}

export interface StructuredArticle {
  title: string
  metaDescription: string
  slug: string
  sections: ArticleSection[]
  wordCount: number
  readingTime: number
  seoScore: number
  targetKeyword: string
  secondaryKeywords: string[]
  method: 'gpt' | 'template'
}

/**
 * Generate a full structured article
 */
export async function generateStructuredArticle(options: {
  keyword: string
  tone: string
  language: string
  wordCount: number
  type: 'article' | 'guide' | 'listicle' | 'comparison' | 'tutorial'
  instructions?: string
}): Promise<StructuredArticle> {
  const { keyword, tone, language, wordCount, type, instructions } = options

  // Try GPT first
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      return await generateWithGPT(keyword, tone, language, wordCount, type, instructions)
    } catch (error) {
      console.error('GPT article generation failed, using template:', error)
    }
  }

  // Fallback to template
  return generateWithTemplate(keyword, tone, language, wordCount, type)
}

async function generateWithGPT(
  keyword: string,
  tone: string,
  language: string,
  wordCount: number,
  type: string,
  instructions?: string
): Promise<StructuredArticle> {
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const lang = language === 'fr' ? 'francais' : 'anglais'
  const typeLabel = {
    article: 'un article de blog',
    guide: 'un guide complet',
    listicle: 'un article sous forme de liste',
    comparison: 'un comparatif',
    tutorial: 'un tutoriel pas a pas',
  }[type] || 'un article'

  const systemPrompt = `Tu es un redacteur SEO expert. Tu ecris ${typeLabel} en ${lang}, optimise pour le mot-cle "${keyword}".

Regles:
- Ton: ${tone}
- Longueur cible: ${wordCount} mots
- Structure claire avec H2 et H3
- Introduction accrocheuse (probleme → solution)
- Paragraphes courts (3-4 phrases max)
- Inclure des listes a puces quand pertinent
- Conclusion avec appel a l'action
- 3-5 questions FAQ a la fin
- Meta description de 150 caracteres max
- Densite du mot-cle principal: 1-2%
${instructions ? `\nInstructions supplementaires: ${instructions}` : ''}

Format de reponse STRICTEMENT en JSON:
{
  "title": "Titre H1 optimise SEO",
  "metaDescription": "Meta description de 150 chars max",
  "secondaryKeywords": ["mot2", "mot3", "mot4"],
  "sections": [
    {"type": "introduction", "content": "..."},
    {"type": "heading", "level": 2, "content": "Titre H2"},
    {"type": "paragraph", "content": "..."},
    {"type": "list", "content": "- Item 1\\n- Item 2\\n- Item 3"},
    {"type": "heading", "level": 3, "content": "Titre H3"},
    {"type": "paragraph", "content": "..."},
    {"type": "conclusion", "content": "..."},
    {"type": "faq", "content": "Q: Question?\\nR: Reponse.\\n\\nQ: Question 2?\\nR: Reponse 2."}
  ]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: Math.min(4000, Math.ceil(wordCount * 1.5)),
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Ecris ${typeLabel} complet sur "${keyword}" en ${lang}. ${wordCount} mots minimum.` },
    ],
  })

  const text = completion.choices[0]?.message?.content?.trim() || '{}'
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  const sections: ArticleSection[] = (parsed.sections || []).map((s: any) => ({
    type: s.type || 'paragraph',
    level: s.level,
    content: s.content || '',
  }))

  // Add meta section
  sections.unshift({
    type: 'meta',
    content: parsed.metaDescription || '',
  })

  // Calculate actual word count
  const totalWords = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0)

  return {
    title: parsed.title || keyword,
    metaDescription: parsed.metaDescription || '',
    slug: slugify(parsed.title || keyword),
    sections,
    wordCount: totalWords,
    readingTime: Math.ceil(totalWords / 200),
    seoScore: calculateArticleSEOScore(parsed.title, sections, keyword),
    targetKeyword: keyword,
    secondaryKeywords: parsed.secondaryKeywords || [],
    method: 'gpt',
  }
}

function generateWithTemplate(
  keyword: string,
  tone: string,
  language: string,
  wordCount: number,
  type: string
): StructuredArticle {
  const sections: ArticleSection[] = [
    { type: 'meta', content: `Decouvrez tout sur ${keyword}. Guide complet avec conseils pratiques et exemples concrets.` },
    { type: 'introduction', content: `Dans un monde numerique en constante evolution, ${keyword} est devenu un element essentiel pour toute strategie digitale reussie. Ce guide complet vous explique tout ce que vous devez savoir pour maitriser ${keyword} et obtenir des resultats concrets.` },
    { type: 'heading', level: 2, content: `Qu'est-ce que ${keyword} ?` },
    { type: 'paragraph', content: `${keyword} designe l'ensemble des techniques et methodes permettant d'optimiser votre presence en ligne. Comprendre ses fondamentaux est la premiere etape vers une strategie efficace.` },
    { type: 'heading', level: 2, content: `Pourquoi ${keyword} est essentiel en 2026` },
    { type: 'paragraph', content: `L'importance de ${keyword} ne cesse de croitre. Les entreprises qui investissent dans cette approche constatent une amelioration significative de leurs performances digitales.` },
    { type: 'list', content: `- Amelioration de la visibilite en ligne\n- Augmentation du trafic qualifie\n- Meilleur retour sur investissement\n- Avantage concurrentiel durable\n- Credibilite renforcee aupres des utilisateurs` },
    { type: 'heading', level: 2, content: `Comment mettre en place ${keyword}` },
    { type: 'paragraph', content: `La mise en place d'une strategie de ${keyword} efficace necessite une approche methodique. Voici les etapes cles a suivre pour maximiser vos chances de succes.` },
    { type: 'heading', level: 3, content: 'Etape 1 : Audit initial' },
    { type: 'paragraph', content: `Commencez par un audit complet de votre situation actuelle. Identifiez vos forces, vos faiblesses et les opportunites d'amelioration. Utilisez des outils comme Nexus SEO pour obtenir un diagnostic precis.` },
    { type: 'heading', level: 3, content: 'Etape 2 : Strategie et planification' },
    { type: 'paragraph', content: `Definissez des objectifs clairs et mesurables. Etablissez un calendrier d'actions et priorisez les taches en fonction de leur impact potentiel.` },
    { type: 'heading', level: 3, content: 'Etape 3 : Execution et suivi' },
    { type: 'paragraph', content: `Mettez en oeuvre votre plan d'action de maniere systematique. Suivez vos KPIs regulierement et ajustez votre strategie en fonction des resultats obtenus.` },
    { type: 'conclusion', content: `Maitriser ${keyword} est un investissement qui porte ses fruits a long terme. En suivant les conseils de ce guide et en utilisant les bons outils, vous pouvez transformer votre presence digitale. N'attendez plus pour passer a l'action — lancez votre premier audit gratuit sur Nexus SEO.` },
    { type: 'faq', content: `Q: Combien de temps faut-il pour voir des resultats avec ${keyword} ?\nR: Les premiers resultats sont visibles en 4 a 8 semaines pour les optimisations techniques, et 3 a 6 mois pour les strategies de contenu.\n\nQ: ${keyword} est-il adapte aux petites entreprises ?\nR: Absolument. Les petites entreprises peuvent obtenir d'excellents resultats avec un budget limite en se concentrant sur les actions a fort impact.\n\nQ: Quels outils recommandez-vous pour ${keyword} ?\nR: Nexus SEO est un excellent point de depart gratuit, combinant audit SEO, suivi de mots-cles et visibilite IA.` },
  ]

  const totalWords = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0)

  return {
    title: `${keyword} : Guide complet 2026`,
    metaDescription: `Decouvrez tout sur ${keyword}. Guide complet avec conseils pratiques et exemples concrets.`,
    slug: slugify(keyword),
    sections,
    wordCount: totalWords,
    readingTime: Math.ceil(totalWords / 200),
    seoScore: 72,
    targetKeyword: keyword,
    secondaryKeywords: [],
    method: 'template',
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function calculateArticleSEOScore(title: string, sections: ArticleSection[], keyword: string): number {
  let score = 50
  const kw = keyword.toLowerCase()

  // Title contains keyword
  if (title.toLowerCase().includes(kw)) score += 10

  // Has introduction
  if (sections.some(s => s.type === 'introduction')) score += 5

  // Has conclusion
  if (sections.some(s => s.type === 'conclusion')) score += 5

  // Has FAQ
  if (sections.some(s => s.type === 'faq')) score += 5

  // Has H2 headings
  const h2Count = sections.filter(s => s.type === 'heading' && s.level === 2).length
  if (h2Count >= 3) score += 10
  else if (h2Count >= 2) score += 5

  // Has lists
  if (sections.some(s => s.type === 'list')) score += 5

  // Word count check
  const totalWords = sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0)
  if (totalWords >= 1500) score += 10
  else if (totalWords >= 800) score += 5

  return Math.min(100, score)
}
