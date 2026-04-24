/**
 * Automatic Competitor Detection
 * Utilise GPT pour identifier les vrais concurrents d'un site
 * a partir de son contenu et de son secteur d'activite
 */

import * as cheerio from 'cheerio'

export interface DetectedCompetitor {
  name: string
  domain: string
  relevance: number // 0-100
  category: string
  reason: string
}

/**
 * Detect competitors by analyzing the site's content + GPT
 */
export async function detectCompetitors(
  domain: string,
  siteContent?: string
): Promise<DetectedCompetitor[]> {
  // Step 1: If we have site content, extract context
  let siteContext = ''
  if (siteContent) {
    const $ = cheerio.load(siteContent)
    const title = $('title').text()
    const description = $('meta[name="description"]').attr('content') || ''
    const h1 = $('h1').first().text()
    const h2s = $('h2').map((_, el) => $(el).text()).get().slice(0, 5).join(', ')
    siteContext = `Titre: ${title}\nDescription: ${description}\nH1: ${h1}\nSujets: ${h2s}`
  }

  // Step 2: Try GPT for intelligent detection
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    try {
      const OpenAI = (await import('openai')).default
      const openai = new OpenAI({ apiKey })

      const prompt = siteContext
        ? `Analyse ce site web et identifie ses 5 principaux concurrents directs.\n\nDomaine: ${domain}\n${siteContext}\n\nReponds en JSON uniquement, format:\n[{"name":"Nom","domain":"domaine.com","relevance":85,"category":"categorie","reason":"explication courte"}]`
        : `Identifie les 5 principaux concurrents du site ${domain}.\n\nReponds en JSON uniquement, format:\n[{"name":"Nom","domain":"domaine.com","relevance":85,"category":"categorie","reason":"explication courte"}]`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'Tu es un analyste SEO expert. Reponds uniquement en JSON valide, sans markdown ni commentaires.' },
          { role: 'user', content: prompt },
        ],
      })

      const text = completion.choices[0]?.message?.content?.trim() || '[]'
      // Parse JSON, handle potential markdown code blocks
      const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      const competitors = JSON.parse(jsonStr)

      if (Array.isArray(competitors)) {
        return competitors.map((c: any) => ({
          name: c.name || '',
          domain: c.domain || '',
          relevance: Math.min(100, Math.max(0, c.relevance || 50)),
          category: c.category || 'general',
          reason: c.reason || '',
        }))
      }
    } catch (error) {
      console.error('GPT competitor detection failed:', error)
    }
  }

  // Step 3: Fallback — static detection based on domain keywords
  return detectCompetitorsFallback(domain)
}

/**
 * Fallback: detect competitors based on known industry mappings
 */
function detectCompetitorsFallback(domain: string): DetectedCompetitor[] {
  const lower = domain.toLowerCase()

  // SEO tools
  if (lower.includes('seo') || lower.includes('nexus') || lower.includes('audit')) {
    return [
      { name: 'Semrush', domain: 'semrush.com', relevance: 90, category: 'SEO', reason: 'Leader des outils SEO professionnels' },
      { name: 'Ahrefs', domain: 'ahrefs.com', relevance: 88, category: 'SEO', reason: 'Specialiste backlinks et recherche de mots-cles' },
      { name: 'Moz', domain: 'moz.com', relevance: 75, category: 'SEO', reason: 'Outil SEO historique avec Domain Authority' },
      { name: 'Ubersuggest', domain: 'neilpatel.com/ubersuggest', relevance: 70, category: 'SEO', reason: 'Alternative gratuite avec volume de mots-cles' },
      { name: 'SE Ranking', domain: 'seranking.com', relevance: 65, category: 'SEO', reason: 'Outil SEO abordable avec suivi de positions' },
    ]
  }

  // E-commerce
  if (lower.includes('shop') || lower.includes('store') || lower.includes('boutique')) {
    return [
      { name: 'Shopify', domain: 'shopify.com', relevance: 85, category: 'E-commerce', reason: 'Plateforme e-commerce leader' },
      { name: 'WooCommerce', domain: 'woocommerce.com', relevance: 80, category: 'E-commerce', reason: 'Plugin e-commerce WordPress' },
      { name: 'PrestaShop', domain: 'prestashop.com', relevance: 75, category: 'E-commerce', reason: 'Solution e-commerce francaise' },
    ]
  }

  // Agency
  if (lower.includes('agence') || lower.includes('agency') || lower.includes('kayzen') || lower.includes('web')) {
    return [
      { name: 'WebFlow Agency', domain: 'webflow.com', relevance: 70, category: 'Agence', reason: 'Plateforme no-code pour agences' },
      { name: 'Duda', domain: 'duda.co', relevance: 65, category: 'Agence', reason: 'Plateforme web pour agences' },
    ]
  }

  // Generic
  return [
    { name: 'Google Search Console', domain: 'search.google.com', relevance: 60, category: 'SEO', reason: 'Outil gratuit Google pour le SEO' },
    { name: 'Bing Webmaster Tools', domain: 'bing.com/webmasters', relevance: 40, category: 'SEO', reason: 'Equivalent Bing de la Search Console' },
  ]
}

/**
 * Detect competitors from an LLM response
 * Used in AI Visibility monitoring
 */
export function extractCompetitorsFromResponse(response: string, ownDomain: string): string[] {
  const knownCompetitors = [
    'semrush', 'ahrefs', 'moz', 'ubersuggest', 'se ranking', 'serpstat',
    'screaming frog', 'majestic', 'mangools', 'surfer seo', 'clearscope',
    'marketmuse', 'frase', 'jasper', 'copy.ai', 'writesonic',
    'shopify', 'woocommerce', 'prestashop', 'wix', 'squarespace', 'webflow',
  ]

  const lower = response.toLowerCase()
  const ownDomainLower = ownDomain.toLowerCase()

  return knownCompetitors.filter(comp =>
    lower.includes(comp) && !ownDomainLower.includes(comp)
  )
}
