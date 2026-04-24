import * as cheerio from 'cheerio'

// ==================== TYPES ====================

export interface GEOCheck {
  name: string
  status: 'passed' | 'warning' | 'error'
  value: string
  recommendation: string
}

export interface GEOCategoryResult {
  score: number
  checks: GEOCheck[]
}

export interface GEOAuditResult {
  overallScore: number
  grade: string
  categories: {
    structuredData: GEOCategoryResult
    entityClarity: GEOCategoryResult
    citationReadiness: GEOCategoryResult
    eeat: GEOCategoryResult
    technicalAI: GEOCategoryResult
  }
  recommendations: string[]
}

// ==================== HELPERS ====================

function getBodyText($: cheerio.CheerioAPI): string {
  return $('body')
    .clone()
    .find('script, style, noscript')
    .remove()
    .end()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
}

function scoreToStatus(score: number): 'passed' | 'warning' | 'error' {
  if (score >= 80) return 'passed'
  if (score >= 40) return 'warning'
  return 'error'
}

function computeCategoryScore(checks: GEOCheck[]): number {
  if (checks.length === 0) return 0
  const passed = checks.filter((c) => c.status === 'passed').length
  const warnings = checks.filter((c) => c.status === 'warning').length
  return Math.round(((passed * 100 + warnings * 50) / (checks.length * 100)) * 100)
}

function getGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 55) return 'C'
  if (score >= 35) return 'D'
  return 'F'
}

// ==================== CATEGORY ANALYZERS ====================

function analyzeStructuredData($: cheerio.CheerioAPI): GEOCategoryResult {
  const checks: GEOCheck[] = []

  // 1. JSON-LD presence
  const jsonLdBlocks = $('script[type="application/ld+json"]')
  const hasJsonLd = jsonLdBlocks.length > 0
  checks.push({
    name: 'JSON-LD',
    status: hasJsonLd ? 'passed' : 'error',
    value: hasJsonLd ? `${jsonLdBlocks.length} bloc(s) JSON-LD` : 'Aucun JSON-LD',
    recommendation: hasJsonLd
      ? 'Balisage JSON-LD correctement implementé.'
      : 'Ajoutez du balisage JSON-LD (schema.org) pour permettre aux IA de comprendre vos entités.',
  })

  // 2. Parse JSON-LD and check schema types
  const targetSchemas = ['Organization', 'Person', 'Product', 'FAQPage', 'HowTo', 'Article', 'WebSite', 'WebPage', 'BreadcrumbList', 'LocalBusiness', 'Review', 'Event']
  const foundSchemas: string[] = []

  jsonLdBlocks.each((_, el) => {
    try {
      const raw = $(el).html()
      if (!raw) return
      const data = JSON.parse(raw)
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const type = item['@type']
        if (type) {
          const types = Array.isArray(type) ? type : [type]
          foundSchemas.push(...types)
        }
        // Check @graph
        if (item['@graph'] && Array.isArray(item['@graph'])) {
          for (const node of item['@graph']) {
            if (node['@type']) {
              const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']]
              foundSchemas.push(...types)
            }
          }
        }
      }
    } catch {
      // Invalid JSON-LD
    }
  })

  const uniqueSchemas = Array.from(new Set(foundSchemas))
  const matchedSchemas = uniqueSchemas.filter((s) => targetSchemas.includes(s))
  const schemaCount = matchedSchemas.length
  const schemaStatus: 'passed' | 'warning' | 'error' = schemaCount >= 3 ? 'passed' : schemaCount >= 1 ? 'warning' : 'error'
  checks.push({
    name: 'Types de schéma',
    status: schemaStatus,
    value: matchedSchemas.length > 0 ? matchedSchemas.join(', ') : 'Aucun schéma reconnu',
    recommendation:
      schemaCount >= 3
        ? 'Excellente diversité de types de schéma.'
        : schemaCount >= 1
          ? 'Ajoutez davantage de types (FAQPage, HowTo, Article, Organization) pour enrichir la compréhension IA.'
          : 'Aucun type de schéma reconnu. Implémentez Organization, Article ou FAQPage au minimum.',
  })

  // 3. JSON-LD validity
  let allValid = true
  let invalidCount = 0
  jsonLdBlocks.each((_, el) => {
    try {
      const raw = $(el).html()
      if (raw) JSON.parse(raw)
    } catch {
      allValid = false
      invalidCount++
    }
  })
  if (jsonLdBlocks.length > 0) {
    checks.push({
      name: 'Validité JSON-LD',
      status: allValid ? 'passed' : 'error',
      value: allValid ? 'Tous les blocs sont valides' : `${invalidCount} bloc(s) invalide(s)`,
      recommendation: allValid
        ? 'Le JSON-LD est syntaxiquement correct.'
        : 'Corrigez les erreurs de syntaxe JSON-LD. Les blocs invalides sont ignorés par les moteurs IA.',
    })
  }

  // 4. Breadcrumb markup
  const hasBreadcrumb = foundSchemas.includes('BreadcrumbList') || $('[itemtype*="BreadcrumbList"]').length > 0 || $('nav[aria-label*="breadcrumb" i], nav[aria-label*="fil" i], .breadcrumb, .breadcrumbs').length > 0
  checks.push({
    name: 'Fil d\'Ariane (Breadcrumb)',
    status: hasBreadcrumb ? 'passed' : 'warning',
    value: hasBreadcrumb ? 'Présent' : 'Absent',
    recommendation: hasBreadcrumb
      ? 'Le fil d\'Ariane aide les IA à comprendre la hiérarchie du site.'
      : 'Ajoutez un fil d\'Ariane avec balisage BreadcrumbList pour faciliter la navigation contextuelle IA.',
  })

  // 5. Microdata / RDFa presence
  const hasMicrodata = $('[itemscope]').length > 0
  const hasRdfa = $('[typeof]').length > 0
  if (hasMicrodata || hasRdfa) {
    checks.push({
      name: 'Microdata / RDFa',
      status: 'passed',
      value: `${hasMicrodata ? 'Microdata' : ''}${hasMicrodata && hasRdfa ? ' + ' : ''}${hasRdfa ? 'RDFa' : ''} détecté`,
      recommendation: 'Balisage sémantique supplémentaire détecté. Privilégiez JSON-LD pour une meilleure compatibilité IA.',
    })
  }

  return { score: computeCategoryScore(checks), checks }
}

function analyzeEntityClarity($: cheerio.CheerioAPI, url: string): GEOCategoryResult {
  const checks: GEOCheck[] = []
  const bodyText = getBodyText($)

  // 1. Clear H1 identifying the topic
  const h1Elements = $('h1')
  const h1Count = h1Elements.length
  const h1Text = h1Elements.first().text().trim()
  const h1Good = h1Count === 1 && h1Text.length >= 10 && h1Text.length <= 150
  checks.push({
    name: 'H1 principal clair',
    status: h1Count === 0 ? 'error' : h1Good ? 'passed' : 'warning',
    value: h1Count === 0 ? 'Aucun H1' : `${h1Count} H1 - "${h1Text.substring(0, 80)}${h1Text.length > 80 ? '...' : ''}"`,
    recommendation:
      h1Count === 0
        ? 'Ajoutez un H1 unique qui identifie clairement le sujet/entité de la page.'
        : h1Good
          ? 'Le H1 identifie clairement le sujet de la page.'
          : h1Count > 1
            ? 'Utilisez un seul H1 par page pour une identification sans ambiguïté du sujet.'
            : 'Le H1 devrait contenir entre 10 et 150 caractères pour être clair et descriptif.',
  })

  // 2. Definition-style opening paragraph
  const firstParagraphs = $('main p, article p, .content p, body p').slice(0, 3)
  let hasDefinition = false
  const definitionPatterns = [
    /\best\s+(un|une|le|la|l'|des|du)/i,
    /\bdéfinition\b/i,
    /\bqu'est-ce\s+qu/i,
    /\bse\s+défini/i,
    /\bsignifie\b/i,
    /\brefers?\s+to\b/i,
    /\bis\s+(a|an|the)\b/i,
    /\bdefined\s+as\b/i,
    /\bmeans\b/i,
  ]
  firstParagraphs.each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 30 && definitionPatterns.some((p) => p.test(text))) {
      hasDefinition = true
    }
  })
  checks.push({
    name: 'Paragraphe d\'introduction définitoire',
    status: hasDefinition ? 'passed' : 'warning',
    value: hasDefinition ? 'Détecté' : 'Non détecté',
    recommendation: hasDefinition
      ? 'Le contenu commence par une définition claire, idéal pour la citation IA.'
      : 'Commencez par une phrase définitoire claire (ex: "X est...") pour que les LLMs puissent citer votre contenu.',
  })

  // 3. Consistent entity naming
  if (h1Text) {
    // Extract key terms from H1 (words > 3 chars, not stop words)
    const stopWords = new Set(['pour', 'dans', 'avec', 'sans', 'sur', 'sous', 'entre', 'vers', 'chez', 'the', 'and', 'for', 'with', 'your', 'this', 'that', 'from', 'have', 'been', 'more', 'also', 'comment', 'quoi', 'tout', 'plus'])
    const keyTerms = h1Text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .slice(0, 4)

    if (keyTerms.length > 0) {
      const mainTerm = keyTerms[0]
      const bodyLower = bodyText.toLowerCase()
      const termOccurrences = (bodyLower.match(new RegExp(mainTerm, 'gi')) || []).length
      const isConsistent = termOccurrences >= 3
      checks.push({
        name: 'Cohérence de nommage d\'entité',
        status: isConsistent ? 'passed' : 'warning',
        value: `"${mainTerm}" : ${termOccurrences} occurrence(s)`,
        recommendation: isConsistent
          ? 'Le terme principal est utilisé de façon cohérente dans le contenu.'
          : 'Répétez le terme/entité principal de manière naturelle dans le contenu pour renforcer la reconnaissance IA.',
      })
    }
  }

  // 4. Author/organization attribution
  const hasAuthor =
    $('meta[name="author"]').length > 0 ||
    $('[rel="author"]').length > 0 ||
    $('[itemprop="author"]').length > 0 ||
    $('[class*="author" i]').length > 0 ||
    $('[class*="auteur" i]').length > 0 ||
    $('a[href*="/author/"], a[href*="/auteur/"]').length > 0
  checks.push({
    name: 'Attribution auteur/organisation',
    status: hasAuthor ? 'passed' : 'warning',
    value: hasAuthor ? 'Attribution détectée' : 'Aucune attribution',
    recommendation: hasAuthor
      ? 'L\'auteur ou l\'organisation est identifié, renforçant la crédibilité IA.'
      : 'Ajoutez un byline auteur avec meta[name="author"] et un lien vers la bio pour renforcer la confiance IA.',
  })

  // 5. datePublished / dateModified
  const hasDatePublished =
    $('meta[property="article:published_time"]').length > 0 ||
    $('meta[name="date"]').length > 0 ||
    $('[itemprop="datePublished"]').length > 0 ||
    $('time[datetime]').length > 0
  const hasDateModified =
    $('meta[property="article:modified_time"]').length > 0 ||
    $('[itemprop="dateModified"]').length > 0
  const dateStatus: 'passed' | 'warning' | 'error' = hasDatePublished && hasDateModified ? 'passed' : hasDatePublished ? 'warning' : 'error'
  checks.push({
    name: 'Dates de publication/modification',
    status: dateStatus,
    value: `Publication: ${hasDatePublished ? 'Oui' : 'Non'} | Modification: ${hasDateModified ? 'Oui' : 'Non'}`,
    recommendation:
      dateStatus === 'passed'
        ? 'Dates de publication et modification présentes. Les IA privilégient le contenu frais.'
        : hasDatePublished
          ? 'Ajoutez article:modified_time pour signaler la fraîcheur du contenu aux IA.'
          : 'Ajoutez les méta-tags article:published_time et article:modified_time. Les LLMs favorisent le contenu daté récemment.',
  })

  // 6. Meta description as entity summary
  const metaDesc = $('meta[name="description"]').attr('content') || ''
  const hasGoodDesc = metaDesc.length >= 80 && metaDesc.length <= 160
  checks.push({
    name: 'Résumé d\'entité (meta description)',
    status: hasGoodDesc ? 'passed' : metaDesc.length > 0 ? 'warning' : 'error',
    value: metaDesc.length > 0 ? `${metaDesc.length} caractères` : 'Absente',
    recommendation: hasGoodDesc
      ? 'La meta description sert de résumé concis que les IA peuvent directement citer.'
      : metaDesc.length > 0
        ? 'Optimisez la meta description (80-160 car.) pour servir de résumé citable par les IA.'
        : 'Ajoutez une meta description concise et factuelle. Les LLMs l\'utilisent comme résumé de l\'entité.',
  })

  return { score: computeCategoryScore(checks), checks }
}

function analyzeCitationReadiness($: cheerio.CheerioAPI): GEOCategoryResult {
  const checks: GEOCheck[] = []
  const bodyText = getBodyText($)

  // 1. Data points (numbers, statistics, percentages)
  const statPatterns = [
    /\d+[\s]*%/g,
    /\d+[\s]*(?:millions?|milliards?|billion|million|thousand|milliers?)/gi,
    /(?:en|depuis|jusqu'en)\s+\d{4}/gi,
    /\d+(?:\.\d+)?[\s]*(?:x|fois)/gi,
    /\+\s*\d+/g,
  ]
  let totalStats = 0
  for (const pattern of statPatterns) {
    const matches = bodyText.match(pattern)
    if (matches) totalStats += matches.length
  }
  const statsStatus: 'passed' | 'warning' | 'error' = totalStats >= 5 ? 'passed' : totalStats >= 2 ? 'warning' : 'error'
  checks.push({
    name: 'Données chiffrées et statistiques',
    status: statsStatus,
    value: `${totalStats} donnée(s) chiffrée(s) détectée(s)`,
    recommendation:
      statsStatus === 'passed'
        ? 'Excellente densité de données chiffrées. Les LLMs citent en priorité les contenus avec des statistiques.'
        : totalStats >= 2
          ? 'Enrichissez avec davantage de statistiques, pourcentages et données vérifiables.'
          : 'Ajoutez des données chiffrées (statistiques, pourcentages, dates). Les IA citent les faits quantifiés en priorité.',
  })

  // 2. Source attributions
  const citationPatterns = [
    /selon\s+/gi,
    /d'après\s+/gi,
    /source\s*:/gi,
    /étude\s+(?:de|du|publiée|réalisée)/gi,
    /according\s+to/gi,
    /research\s+(?:by|from|shows)/gi,
    /survey\s+(?:by|from|shows)/gi,
  ]
  let citations = 0
  for (const p of citationPatterns) {
    const matches = bodyText.match(p)
    if (matches) citations += matches.length
  }
  const externalLinks = $('a[href^="http"]').filter((_, el) => {
    try {
      return true
    } catch {
      return false
    }
  }).length
  const blockquotes = $('blockquote, cite, q').length
  const totalAttributions = citations + blockquotes
  const attrStatus: 'passed' | 'warning' | 'error' = totalAttributions >= 3 ? 'passed' : totalAttributions >= 1 ? 'warning' : 'error'
  checks.push({
    name: 'Attributions et sources',
    status: attrStatus,
    value: `${citations} citation(s), ${blockquotes} blockquote(s), ${externalLinks} lien(s) externe(s)`,
    recommendation:
      attrStatus === 'passed'
        ? 'Bonnes attributions de sources. Cela renforce la fiabilité perçue par les IA.'
        : 'Ajoutez des attributions ("selon...", "d\'après...") et des citations avec sources. Les IA favorisent le contenu sourcé.',
  })

  // 3. Original research indicators
  const researchPatterns = [
    /notre\s+(?:étude|enquête|recherche|analyse|sondage)/gi,
    /nous\s+avons\s+(?:analysé|étudié|testé|mesuré|interrogé)/gi,
    /our\s+(?:study|research|survey|analysis)/gi,
    /we\s+(?:analyzed|studied|tested|measured|surveyed|found)/gi,
    /résultats?\s+(?:de\s+notre|montrent|révèlent)/gi,
    /données?\s+(?:collectées?|recueillies?)/gi,
  ]
  let researchSignals = 0
  for (const p of researchPatterns) {
    const matches = bodyText.match(p)
    if (matches) researchSignals += matches.length
  }
  checks.push({
    name: 'Indicateurs de recherche originale',
    status: researchSignals >= 2 ? 'passed' : researchSignals >= 1 ? 'warning' : 'error',
    value: `${researchSignals} indicateur(s)`,
    recommendation:
      researchSignals >= 2
        ? 'Signaux de recherche originale détectés. Les IA privilégient fortement les sources primaires.'
        : 'Intégrez des éléments de recherche originale (enquêtes, analyses propriétaires). Les LLMs citent les sources primaires en priorité.',
  })

  // 4. FAQ patterns
  const faqSchemaPresent = $('script[type="application/ld+json"]').filter((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      const items = Array.isArray(data) ? data : [data]
      return items.some((item) => item['@type'] === 'FAQPage' || (item['@graph'] && item['@graph'].some((n: { '@type': string }) => n['@type'] === 'FAQPage')))
    } catch {
      return false
    }
  }).length > 0
  const questionElements = $('details summary, [class*="faq" i], [class*="question" i], [id*="faq" i]').length
  const questionPatterns = bodyText.match(/(?:comment|pourquoi|quand|combien|qu'est-ce|est-ce|how|what|why|when|where|which)\s*[\s\w]+\s*\?/gi) || []
  const hasFaq = faqSchemaPresent || questionElements > 0 || questionPatterns.length >= 3
  checks.push({
    name: 'Sections FAQ / Questions-Réponses',
    status: hasFaq ? 'passed' : 'warning',
    value: `Schema FAQ: ${faqSchemaPresent ? 'Oui' : 'Non'} | Éléments FAQ: ${questionElements} | Questions: ${questionPatterns.length}`,
    recommendation: hasFaq
      ? 'Section FAQ détectée. Format idéal pour les réponses directes des IA.'
      : 'Ajoutez une section FAQ avec balisage FAQPage. Les LLMs extraient facilement les réponses Q&A.',
  })

  // 5. Definition/answer patterns (concise, direct answers)
  const definitionPatterns = [
    /(?:est|sont|c'est|il\s+s'agit)\s+(?:un|une|de|du|des|le|la|l')\s+/gi,
    /(?:se\s+définit|se\s+caractérise|désigne)\s+/gi,
    /(?:refers?\s+to|is\s+defined\s+as|is\s+a|means)\s+/gi,
    /en\s+résumé\s*[,:]/gi,
    /en\s+bref\s*[,:]/gi,
    /concrètement\s*[,:]/gi,
  ]
  let definitionCount = 0
  for (const p of definitionPatterns) {
    const matches = bodyText.match(p)
    if (matches) definitionCount += matches.length
  }
  checks.push({
    name: 'Réponses directes et définitions',
    status: definitionCount >= 3 ? 'passed' : definitionCount >= 1 ? 'warning' : 'error',
    value: `${definitionCount} pattern(s) de réponse directe`,
    recommendation:
      definitionCount >= 3
        ? 'Le contenu contient des réponses directes et concises, idéales pour la citation IA.'
        : 'Formulez des réponses concises et directes. Les IA extraient les phrases déclaratives claires.',
  })

  // 6. Tables (structured data that LLMs love)
  const tableCount = $('table').length
  const hasCaption = $('table caption, table[aria-label]').length > 0
  checks.push({
    name: 'Données tabulaires',
    status: tableCount > 0 ? 'passed' : 'warning',
    value: tableCount > 0 ? `${tableCount} tableau(x)${hasCaption ? ' avec légende' : ''}` : 'Aucun tableau',
    recommendation:
      tableCount > 0
        ? 'Les tableaux structurent l\'information de manière optimale pour l\'extraction IA.'
        : 'Ajoutez des tableaux comparatifs ou de données. Les LLMs extraient très efficacement les données tabulaires.',
  })

  // 7. Lists (ordered and unordered)
  const olCount = $('ol').length
  const ulCount = $('ul').not('nav ul').length
  const listCount = olCount + ulCount
  checks.push({
    name: 'Listes structurées',
    status: listCount >= 2 ? 'passed' : listCount >= 1 ? 'warning' : 'error',
    value: `${olCount} liste(s) ordonnée(s), ${ulCount} liste(s) non-ordonnée(s)`,
    recommendation:
      listCount >= 2
        ? 'Les listes facilitent l\'extraction d\'étapes et de points clés par les IA.'
        : 'Structurez l\'information en listes (étapes, avantages, critères). Les LLMs les extraient facilement.',
  })

  return { score: computeCategoryScore(checks), checks }
}

function analyzeEEAT($: cheerio.CheerioAPI, url: string): GEOCategoryResult {
  const checks: GEOCheck[] = []
  const bodyText = getBodyText($)

  // === EXPERIENCE ===
  const experiencePatterns = [
    /j'ai\s+(?:testé|utilisé|essayé|travaillé|expérimenté)/gi,
    /nous\s+avons\s+(?:testé|utilisé|essayé|constaté)/gi,
    /notre\s+expérience/gi,
    /en\s+pratique/gi,
    /cas\s+(?:client|concret|pratique|réel)/gi,
    /témoignage/gi,
    /retour\s+d'expérience/gi,
    /I\s+(?:tested|used|tried|worked|experienced)/gi,
    /in\s+my\s+experience/gi,
    /case\s+study/gi,
  ]
  let experienceSignals = 0
  for (const p of experiencePatterns) {
    const matches = bodyText.match(p)
    if (matches) experienceSignals += matches.length
  }
  const hasTestimonials = $('[class*="testimonial" i], [class*="temoignage" i], [class*="review" i], [class*="avis" i]').length > 0
  const hasCaseStudy = $('[class*="case-stud" i], [class*="cas-client" i], [class*="etude-de-cas" i]').length > 0
  const expTotal = experienceSignals + (hasTestimonials ? 2 : 0) + (hasCaseStudy ? 2 : 0)
  checks.push({
    name: 'Experience - Vécu et cas concrets',
    status: expTotal >= 3 ? 'passed' : expTotal >= 1 ? 'warning' : 'error',
    value: `${experienceSignals} signal(aux), témoignages: ${hasTestimonials ? 'Oui' : 'Non'}, études de cas: ${hasCaseStudy ? 'Oui' : 'Non'}`,
    recommendation:
      expTotal >= 3
        ? 'Signaux d\'expérience vécue forts. Les IA valorisent le contenu basé sur l\'expérience réelle.'
        : 'Ajoutez des témoignages, études de cas et retours d\'expérience concrets. Le "E" d\'Experience est clé pour les LLMs.',
  })

  // === EXPERTISE ===
  const hasAuthorBio =
    $('[class*="author-bio" i], [class*="bio-auteur" i], [class*="about-author" i], [class*="a-propos-auteur" i]').length > 0 ||
    $('[itemprop="author"] [itemprop="description"]').length > 0
  const hasCredentials =
    $('[class*="credential" i], [class*="qualification" i], [class*="certif" i]').length > 0 ||
    /(?:certifié|diplômé|expert|spécialiste|PhD|MBA|certified|qualified)/i.test(bodyText)
  const hasAuthorSchema = $('script[type="application/ld+json"]').filter((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      const items = Array.isArray(data) ? data : [data]
      return items.some((item) => {
        if (item.author) return true
        if (item['@graph']) return item['@graph'].some((n: Record<string, unknown>) => n['@type'] === 'Person' || n.author)
        return false
      })
    } catch {
      return false
    }
  }).length > 0
  const expertiseScore = (hasAuthorBio ? 1 : 0) + (hasCredentials ? 1 : 0) + (hasAuthorSchema ? 1 : 0)
  checks.push({
    name: 'Expertise - Bio et qualifications',
    status: expertiseScore >= 2 ? 'passed' : expertiseScore >= 1 ? 'warning' : 'error',
    value: `Bio auteur: ${hasAuthorBio ? 'Oui' : 'Non'} | Qualifications: ${hasCredentials ? 'Oui' : 'Non'} | Schema author: ${hasAuthorSchema ? 'Oui' : 'Non'}`,
    recommendation:
      expertiseScore >= 2
        ? 'Signaux d\'expertise solides. Les IA accordent plus de confiance aux experts identifiés.'
        : 'Ajoutez une bio auteur avec qualifications et balisage Person. Les LLMs évaluent l\'expertise de la source.',
  })

  // === AUTHORITATIVENESS ===
  const externalLinks = $('a[href^="http"]')
  let govEduLinks = 0
  let authorityLinks = 0
  const authorityDomains = ['.gov', '.edu', '.gouv', '.ac.', 'who.int', 'europa.eu', 'insee.fr', 'wikipedia.org']
  externalLinks.each((_, el) => {
    const href = $(el).attr('href') || ''
    if (authorityDomains.some((d) => href.includes(d))) {
      govEduLinks++
      authorityLinks++
    }
  })
  const hasHreflang = $('link[rel="alternate"][hreflang]').length > 0
  checks.push({
    name: 'Authoritativeness - Sources autoritaires',
    status: govEduLinks >= 2 ? 'passed' : govEduLinks >= 1 ? 'warning' : 'error',
    value: `${govEduLinks} lien(s) .gov/.edu/.gouv | ${externalLinks.length} lien(s) externe(s) total`,
    recommendation:
      govEduLinks >= 2
        ? 'Références à des sources institutionnelles. Cela renforce votre autorité aux yeux des IA.'
        : 'Citez des sources institutionnelles (.gov, .edu, .gouv.fr). Les LLMs pondèrent fortement l\'autorité des sources.',
  })

  // === TRUST ===
  let trustScore = 0
  const trustDetails: string[] = []

  // HTTPS
  let isHttps = false
  try {
    isHttps = new URL(url).protocol === 'https:'
  } catch { /* ignore */ }
  if (isHttps) { trustScore++; trustDetails.push('HTTPS') }

  // Privacy policy
  const hasPrivacy = $('a[href*="privacy"], a[href*="politique-de-confidentialite"], a[href*="vie-privee"], a[href*="rgpd"], a[href*="donnees-personnelles"]').length > 0
  if (hasPrivacy) { trustScore++; trustDetails.push('Politique de confidentialité') }

  // Contact info
  const hasContact = $('a[href*="contact"], a[href*="mailto:"], a[href^="tel:"]').length > 0 ||
    $('[class*="contact" i]').length > 0
  if (hasContact) { trustScore++; trustDetails.push('Page contact') }

  // Legal mentions
  const hasLegal = $('a[href*="mentions-legales"], a[href*="legal"], a[href*="cgv"], a[href*="cgu"], a[href*="terms"]').length > 0
  if (hasLegal) { trustScore++; trustDetails.push('Mentions légales') }

  // Organization schema
  const hasOrgSchema = $('script[type="application/ld+json"]').filter((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '')
      const items = Array.isArray(data) ? data : [data]
      return items.some((item) => {
        const type = item['@type']
        if (type === 'Organization' || type === 'LocalBusiness') return true
        if (item['@graph']) return item['@graph'].some((n: { '@type': string }) => n['@type'] === 'Organization' || n['@type'] === 'LocalBusiness')
        return false
      })
    } catch {
      return false
    }
  }).length > 0
  if (hasOrgSchema) { trustScore++; trustDetails.push('Schema Organization') }

  checks.push({
    name: 'Trust - Signaux de confiance',
    status: trustScore >= 4 ? 'passed' : trustScore >= 2 ? 'warning' : 'error',
    value: trustDetails.length > 0 ? trustDetails.join(', ') : 'Aucun signal de confiance',
    recommendation:
      trustScore >= 4
        ? 'Excellents signaux de confiance. Les IA favorisent les sources fiables.'
        : 'Renforcez la confiance : HTTPS, mentions légales, politique de confidentialité, page contact, et schéma Organization.',
  })

  return { score: computeCategoryScore(checks), checks }
}

function analyzeTechnicalAI($: cheerio.CheerioAPI, html: string, url: string): GEOCategoryResult {
  const checks: GEOCheck[] = []

  // 1. AI bot access (check meta robots for AI-specific directives)
  const robotsMeta = $('meta[name="robots"]').attr('content') || ''
  const aiRobotsTags = [
    { name: 'GPTBot', meta: $('meta[name="GPTBot"]').attr('content') || '' },
    { name: 'ClaudeBot', meta: $('meta[name="ClaudeBot"]').attr('content') || '' },
    { name: 'Google-Extended', meta: $('meta[name="Google-Extended"]').attr('content') || '' },
    { name: 'CCBot', meta: $('meta[name="CCBot"]').attr('content') || '' },
  ]
  const blockedBots = aiRobotsTags.filter((b) => b.meta.toLowerCase().includes('noindex') || b.meta.toLowerCase().includes('none'))
  const globalNoindex = robotsMeta.toLowerCase().includes('noindex')
  const aiBotStatus: 'passed' | 'warning' | 'error' = globalNoindex ? 'error' : blockedBots.length > 0 ? 'warning' : 'passed'
  checks.push({
    name: 'Accès bots IA (meta robots)',
    status: aiBotStatus,
    value: globalNoindex
      ? 'noindex global - page non indexable'
      : blockedBots.length > 0
        ? `${blockedBots.map((b) => b.name).join(', ')} bloqué(s)`
        : 'Aucun blocage IA détecté',
    recommendation:
      aiBotStatus === 'passed'
        ? 'Les bots IA ont accès à votre contenu.'
        : globalNoindex
          ? 'La page est en noindex. Les moteurs IA ne pourront pas indexer ce contenu.'
          : 'Certains bots IA sont bloqués. Vérifiez si c\'est intentionnel. Le blocage réduit votre visibilité IA.',
  })

  // 2. Semantic HTML structure
  const hasMain = $('main').length > 0
  const hasArticle = $('article').length > 0
  const hasNav = $('nav').length > 0
  const hasHeader = $('header').length > 0
  const hasFooter = $('footer').length > 0
  const hasSection = $('section').length > 0
  const hasAside = $('aside').length > 0
  const semanticCount = [hasMain, hasArticle, hasNav, hasHeader, hasFooter, hasSection, hasAside].filter(Boolean).length
  const semanticStatus: 'passed' | 'warning' | 'error' = semanticCount >= 4 ? 'passed' : semanticCount >= 2 ? 'warning' : 'error'
  checks.push({
    name: 'Structure HTML sémantique',
    status: semanticStatus,
    value: [
      hasMain ? 'main' : null,
      hasArticle ? 'article' : null,
      hasNav ? 'nav' : null,
      hasHeader ? 'header' : null,
      hasFooter ? 'footer' : null,
      hasSection ? 'section' : null,
      hasAside ? 'aside' : null,
    ].filter(Boolean).join(', ') || 'Aucun élément sémantique',
    recommendation:
      semanticStatus === 'passed'
        ? 'Excellente utilisation du HTML sémantique. Les IA comprennent mieux la structure.'
        : 'Utilisez les balises sémantiques (main, article, nav, header, footer, section). Les LLMs les utilisent pour comprendre la hiérarchie.',
  })

  // 3. Proper heading hierarchy
  const headings: { level: number; text: string }[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = (el as any).tagName
    headings.push({
      level: parseInt(tag.charAt(1)),
      text: $(el).text().trim(),
    })
  })
  let hierarchyValid = true
  let prevLevel = 0
  for (const h of headings) {
    if (h.level > prevLevel + 1 && prevLevel > 0) {
      hierarchyValid = false
      break
    }
    prevLevel = h.level
  }
  const h1Count = headings.filter((h) => h.level === 1).length
  const headingStatus: 'passed' | 'warning' | 'error' = hierarchyValid && h1Count === 1 ? 'passed' : hierarchyValid || h1Count === 1 ? 'warning' : 'error'
  checks.push({
    name: 'Hiérarchie des titres',
    status: headingStatus,
    value: `${headings.length} titre(s) | H1: ${h1Count} | Hiérarchie: ${hierarchyValid ? 'Valide' : 'Cassée'}`,
    recommendation:
      headingStatus === 'passed'
        ? 'Hiérarchie des titres correcte. Les IA l\'utilisent pour structurer leur compréhension.'
        : 'Respectez la hiérarchie H1 > H2 > H3 sans sauter de niveaux. Les IA analysent la structure des titres.',
  })

  // 4. Table data
  const tables = $('table')
  let wellStructuredTables = 0
  tables.each((_, el) => {
    const hasThead = $(el).find('thead').length > 0 || $(el).find('th').length > 0
    if (hasThead) wellStructuredTables++
  })
  checks.push({
    name: 'Tableaux structurés',
    status: tables.length > 0 && wellStructuredTables > 0 ? 'passed' : tables.length > 0 ? 'warning' : 'warning',
    value: `${tables.length} tableau(x), ${wellStructuredTables} avec en-têtes (th/thead)`,
    recommendation:
      wellStructuredTables > 0
        ? 'Tableaux avec en-têtes structurés. Les LLMs extraient très efficacement ces données.'
        : tables.length > 0
          ? 'Ajoutez des balises <th> et <thead> à vos tableaux. Les IA interprètent mieux les tableaux balisés.'
          : 'Envisagez d\'ajouter des tableaux de données. Les LLMs adorent les données tabulaires structurées.',
  })

  // 5. Language declaration
  const htmlLang = $('html').attr('lang') || ''
  checks.push({
    name: 'Déclaration de langue',
    status: htmlLang ? 'passed' : 'error',
    value: htmlLang || 'Non déclarée',
    recommendation: htmlLang
      ? 'La langue est déclarée, aidant les IA à comprendre le contexte linguistique.'
      : 'Ajoutez l\'attribut lang sur <html>. Les IA l\'utilisent pour choisir le bon modèle linguistique.',
  })

  // 6. Open Graph completeness (AI uses OG for understanding)
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  const ogType = $('meta[property="og:type"]').attr('content')
  const ogCount = [ogTitle, ogDesc, ogImage, ogType].filter(Boolean).length
  checks.push({
    name: 'Open Graph (compréhension IA)',
    status: ogCount >= 3 ? 'passed' : ogCount >= 1 ? 'warning' : 'error',
    value: `${ogCount}/4 tags OG (title, description, image, type)`,
    recommendation:
      ogCount >= 3
        ? 'Tags Open Graph complets. Les IA les utilisent comme signaux de compréhension.'
        : 'Complétez les tags og:title, og:description, og:image, og:type. Les LLMs les utilisent pour comprendre la page.',
  })

  // 7. Content length and readability signals
  const bodyText = getBodyText($)
  const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length
  const paragraphs = $('main p, article p, .content p, body p').length
  const avgWordsPerParagraph = paragraphs > 0 ? Math.round(wordCount / paragraphs) : 0
  const goodLength = wordCount >= 500
  const goodParagraphs = avgWordsPerParagraph > 0 && avgWordsPerParagraph <= 100
  checks.push({
    name: 'Longueur et lisibilité du contenu',
    status: goodLength && goodParagraphs ? 'passed' : goodLength || goodParagraphs ? 'warning' : 'error',
    value: `${wordCount} mots | ${paragraphs} paragraphe(s) | ~${avgWordsPerParagraph} mots/paragraphe`,
    recommendation:
      goodLength && goodParagraphs
        ? 'Contenu suffisamment long et bien structuré en paragraphes.'
        : !goodLength
          ? 'Visez au moins 500 mots. Les IA préfèrent le contenu approfondi et complet.'
          : 'Raccourcissez vos paragraphes (max 100 mots). Les IA extraient mieux les paragraphes concis.',
  })

  // 8. ARIA and accessibility (AI readability)
  const ariaLabels = $('[aria-label], [aria-labelledby], [aria-describedby]').length
  const roleAttributes = $('[role]').length
  const altImages = $('img[alt]').length
  const totalImages = $('img').length
  const a11yScore = (ariaLabels > 0 ? 1 : 0) + (roleAttributes > 0 ? 1 : 0) + (totalImages === 0 || altImages === totalImages ? 1 : 0)
  checks.push({
    name: 'Accessibilité et ARIA',
    status: a11yScore >= 2 ? 'passed' : a11yScore >= 1 ? 'warning' : 'error',
    value: `${ariaLabels} aria-label(s) | ${roleAttributes} role(s) | ${altImages}/${totalImages} alt`,
    recommendation:
      a11yScore >= 2
        ? 'Bons signaux d\'accessibilité. Les IA interprètent les attributs ARIA pour mieux comprendre le contenu.'
        : 'Améliorez l\'accessibilité (ARIA, alt text, roles). Les crawlers IA bénéficient des même attributs que les lecteurs d\'écran.',
  })

  return { score: computeCategoryScore(checks), checks }
}

// ==================== RECOMMENDATIONS GENERATOR ====================

function generateRecommendations(categories: GEOAuditResult['categories']): string[] {
  const recs: string[] = []

  // Priority 1: Critical errors
  for (const [, cat] of Object.entries(categories)) {
    for (const check of cat.checks) {
      if (check.status === 'error') {
        recs.push(check.recommendation)
      }
    }
  }

  // Priority 2: Category-level strategic recommendations
  if (categories.structuredData.score < 50) {
    recs.push('Priorité haute : implémentez le balisage JSON-LD schema.org. C\'est le signal #1 pour la visibilité IA.')
  }
  if (categories.entityClarity.score < 50) {
    recs.push('Clarifiez l\'entité principale de chaque page avec un H1 descriptif et un paragraphe d\'introduction définitoire.')
  }
  if (categories.citationReadiness.score < 50) {
    recs.push('Enrichissez votre contenu avec des données chiffrées, des sources vérifiables et des sections FAQ pour maximiser les citations IA.')
  }
  if (categories.eeat.score < 50) {
    recs.push('Renforcez les signaux E-E-A-T : ajoutez des bios auteur, des études de cas et des références institutionnelles.')
  }
  if (categories.technicalAI.score < 50) {
    recs.push('Améliorez la structure technique : HTML sémantique, hiérarchie des titres, et accessibilité pour les crawlers IA.')
  }

  // Priority 3: Quick wins for warnings
  const warnings = Object.values(categories).flatMap((cat) => cat.checks.filter((c) => c.status === 'warning'))
  if (warnings.length > 5) {
    recs.push(`${warnings.length} points d'amélioration identifiés. Concentrez-vous sur les données structurées et la clarté des entités en priorité.`)
  }

  // Deduplicate
  return Array.from(new Set(recs)).slice(0, 10)
}

// ==================== MAIN EXPORT ====================

export function analyzeGEO(html: string, url: string): GEOAuditResult {
  const $ = cheerio.load(html)

  const structuredData = analyzeStructuredData($)
  const entityClarity = analyzeEntityClarity($, url)
  const citationReadiness = analyzeCitationReadiness($)
  const eeat = analyzeEEAT($, url)
  const technicalAI = analyzeTechnicalAI($, html, url)

  const categories = { structuredData, entityClarity, citationReadiness, eeat, technicalAI }

  // Weighted overall score: structured data and citation readiness are most important for GEO
  const weights = {
    structuredData: 0.25,
    entityClarity: 0.20,
    citationReadiness: 0.25,
    eeat: 0.15,
    technicalAI: 0.15,
  }

  const overallScore = Math.round(
    structuredData.score * weights.structuredData +
    entityClarity.score * weights.entityClarity +
    citationReadiness.score * weights.citationReadiness +
    eeat.score * weights.eeat +
    technicalAI.score * weights.technicalAI
  )

  const grade = getGrade(overallScore)
  const recommendations = generateRecommendations(categories)

  return {
    overallScore,
    grade,
    categories,
    recommendations,
  }
}
