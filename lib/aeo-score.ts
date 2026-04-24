/**
 * AEO (Answer Engine Optimization) Scoring Engine
 *
 * Measures how ready content is to appear as featured snippets,
 * voice answers, and "People Also Ask" results.
 * Analyzes HTML content with cheerio.
 */

import * as cheerio from 'cheerio'

// ── Types ────────────────────────────────────────────────────────────

export interface AEOCheck {
  name: string
  passed: boolean
  score: number
  maxScore: number
  details: string
}

export interface AEOCategory {
  score: number
  checks: AEOCheck[]
}

export interface AEOResult {
  overallScore: number
  grade: string
  snippetReadiness: AEOCategory
  qaPatterns: AEOCategory
  voiceReadiness: AEOCategory
  contentStructure: AEOCategory
  recommendations: string[]
}

// ── Helpers ──────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

function categoryScore(checks: AEOCheck[]): number {
  const totalMax = checks.reduce((sum, c) => sum + c.maxScore, 0)
  if (totalMax === 0) return 0
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0)
  return Math.round((totalScore / totalMax) * 100)
}

// ── 1. Snippet Readiness (0-100) ─────────────────────────────────────

function analyzeSnippetReadiness($: cheerio.CheerioAPI): AEOCategory {
  const checks: AEOCheck[] = []

  // 1a. Definition patterns: "X est..." / "X is..." opening paragraphs
  const paragraphs = $('p').toArray()
  const definitionPatterns = /^[A-ZÀ-Ú].{0,80}\s(est|is|sont|are|désigne|signifie|représente|means)\s/
  const definitionCount = paragraphs.filter((el) => {
    const text = $(el).text().trim()
    return definitionPatterns.test(text)
  }).length

  checks.push({
    name: 'Paragraphes de définition',
    passed: definitionCount >= 1,
    score: clamp(definitionCount * 8, 0, 25),
    maxScore: 25,
    details: `${definitionCount} paragraphe(s) de type définition trouvé(s)`,
  })

  // 1b. Numbered/ordered lists that could become list snippets
  const orderedLists = $('ol').length
  const listItems = $('ol li').length

  checks.push({
    name: 'Listes numérotées (snippets liste)',
    passed: orderedLists >= 1 && listItems >= 3,
    score: orderedLists >= 1 && listItems >= 3 ? 25 : orderedLists >= 1 ? 10 : 0,
    maxScore: 25,
    details: `${orderedLists} liste(s) ordonnée(s) avec ${listItems} éléments au total`,
  })

  // 1c. Tables that could become table snippets
  const tables = $('table').length
  const tableRows = $('table tr').length

  checks.push({
    name: 'Tableaux (snippets tableau)',
    passed: tables >= 1 && tableRows >= 2,
    score: tables >= 1 && tableRows >= 2 ? 20 : tables >= 1 ? 8 : 0,
    maxScore: 20,
    details: `${tables} tableau(x) avec ${tableRows} lignes au total`,
  })

  // 1d. Paragraphs under 50 words that directly answer questions
  const conciseParagraphs = paragraphs.filter((el) => {
    const wc = wordCount($(el).text())
    return wc >= 10 && wc <= 50
  }).length

  checks.push({
    name: 'Paragraphes concis (< 50 mots)',
    passed: conciseParagraphs >= 2,
    score: clamp(conciseParagraphs * 5, 0, 15),
    maxScore: 15,
    details: `${conciseParagraphs} paragraphe(s) de 10-50 mots (idéal pour réponses directes)`,
  })

  // 1e. Bold/strong tags highlighting key terms
  const strongTags = $('strong, b').length

  checks.push({
    name: 'Termes clés en gras',
    passed: strongTags >= 3,
    score: clamp(strongTags * 3, 0, 15),
    maxScore: 15,
    details: `${strongTags} balise(s) <strong>/<b> trouvée(s)`,
  })

  return { score: categoryScore(checks), checks }
}

// ── 2. Question-Answer Patterns (0-100) ──────────────────────────────

function analyzeQAPatterns($: cheerio.CheerioAPI): AEOCategory {
  const checks: AEOCheck[] = []

  // 2a. H2/H3 headings phrased as questions
  const questionPattern = /^(comment|qu[''']est[- ]ce|pourquoi|quand|combien|quel|quelle|quels|quelles|how|what|why|when|where|which|who|can|do|does|is|are|should)\b/i
  const questionHeadings = $('h2, h3').toArray().filter((el) => {
    return questionPattern.test($(el).text().trim())
  }).length

  checks.push({
    name: 'Titres formulés en questions (H2/H3)',
    passed: questionHeadings >= 2,
    score: clamp(questionHeadings * 10, 0, 35),
    maxScore: 35,
    details: `${questionHeadings} titre(s) H2/H3 formulé(s) en question`,
  })

  // 2b. FAQ sections (dl/dt/dd or structured div patterns)
  const faqByDl = $('dl dt').length
  const faqBySchema = $('[itemtype*="FAQPage"], [itemtype*="Question"], .faq, #faq, [data-faq]').length
  const faqByAccordion = $('[class*="accordion"], [class*="faq"], details summary').length
  const faqScore = faqByDl + faqBySchema + faqByAccordion

  checks.push({
    name: 'Sections FAQ structurées',
    passed: faqScore >= 1,
    score: faqScore >= 3 ? 35 : faqScore >= 1 ? 20 : 0,
    maxScore: 35,
    details: `${faqScore} pattern(s) FAQ détecté(s) (dl/dt: ${faqByDl}, schema/class: ${faqBySchema}, accordion: ${faqByAccordion})`,
  })

  // 2c. "People Also Ask" alignment - common question patterns in content
  const allText = $('body').text().toLowerCase()
  const paaPatterns = [
    /comment\s+\w+/g,
    /qu[''']est[- ]ce que/g,
    /pourquoi\s+\w+/g,
    /combien\s+(coûte|de|faut)/g,
    /est[- ]ce que/g,
    /how to\s+\w+/g,
    /what is\s+\w+/g,
  ]
  let paaMatches = 0
  for (const pattern of paaPatterns) {
    const matches = allText.match(pattern)
    if (matches) paaMatches += matches.length
  }

  checks.push({
    name: 'Alignement "People Also Ask"',
    passed: paaMatches >= 3,
    score: clamp(paaMatches * 5, 0, 30),
    maxScore: 30,
    details: `${paaMatches} patron(s) de question courante détecté(s) dans le contenu`,
  })

  return { score: categoryScore(checks), checks }
}

// ── 3. Voice Search Readiness (0-100) ────────────────────────────────

function analyzeVoiceReadiness($: cheerio.CheerioAPI): AEOCategory {
  const checks: AEOCheck[] = []
  const paragraphs = $('p').toArray()

  // 3a. Content written in conversational/natural language
  const allText = $('body').text()
  const conversationalMarkers = /\b(vous|tu|votre|ton|notre|we|you|your|our|n[''']hésitez pas|feel free|par exemple|for example|en résumé|in short)\b/gi
  const conversationalMatches = allText.match(conversationalMarkers) || []

  checks.push({
    name: 'Langage conversationnel / naturel',
    passed: conversationalMatches.length >= 3,
    score: clamp(conversationalMatches.length * 4, 0, 25),
    maxScore: 25,
    details: `${conversationalMatches.length} marqueur(s) de langage conversationnel`,
  })

  // 3b. Short, direct answers (40-60 words ideal for voice)
  const voiceOptimalParagraphs = paragraphs.filter((el) => {
    const wc = wordCount($(el).text())
    return wc >= 25 && wc <= 60
  }).length

  checks.push({
    name: 'Réponses courtes optimales pour la voix (25-60 mots)',
    passed: voiceOptimalParagraphs >= 2,
    score: clamp(voiceOptimalParagraphs * 8, 0, 30),
    maxScore: 30,
    details: `${voiceOptimalParagraphs} paragraphe(s) dans la plage idéale pour la recherche vocale`,
  })

  // 3c. Local intent signals (address, phone, "near me" / "près de moi")
  const localSignals = [
    /\b\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/,          // FR phone
    /\b\+33[\s.-]?\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}\b/, // FR international phone
    /\b\d{5}\b/,                                              // Postal code
    /\b(rue|avenue|boulevard|place|chemin)\b/i,               // FR address
    /\b(près de (moi|chez)|near me|à proximité)\b/i,         // local intent
    /\b(horaires|ouvert|fermé|hours|open|closed)\b/i,        // business hours
  ]
  const localText = allText.toLowerCase()
  const localMatchCount = localSignals.filter((p) => p.test(localText)).length

  checks.push({
    name: 'Signaux d\'intention locale',
    passed: localMatchCount >= 2,
    score: clamp(localMatchCount * 7, 0, 20),
    maxScore: 20,
    details: `${localMatchCount} signal(aux) local(aux) détecté(s) (adresse, téléphone, proximité)`,
  })

  // 3d. Speakable schema markup
  const speakableSchema = $('script[type="application/ld+json"]').toArray().some((el) => {
    const text = $(el).html() || ''
    return text.includes('speakable') || text.includes('Speakable')
  })
  const hasSchemaOrg = $('[itemtype], script[type="application/ld+json"]').length > 0

  checks.push({
    name: 'Balisage schema Speakable',
    passed: speakableSchema,
    score: speakableSchema ? 25 : hasSchemaOrg ? 10 : 0,
    maxScore: 25,
    details: speakableSchema
      ? 'Balisage Speakable détecté'
      : hasSchemaOrg
        ? 'Schema.org présent mais sans balisage Speakable'
        : 'Aucun balisage schema structuré détecté',
  })

  return { score: categoryScore(checks), checks }
}

// ── 4. Content Structure Score (0-100) ───────────────────────────────

function analyzeContentStructure($: cheerio.CheerioAPI): AEOCategory {
  const checks: AEOCheck[] = []

  // 4a. Proper heading hierarchy (H1 > H2 > H3)
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const h3Count = $('h3').length
  const hasProperHierarchy = h1Count === 1 && h2Count >= 2 && h3Count >= h2Count * 0.5

  let hierarchyScore = 0
  if (h1Count === 1) hierarchyScore += 8
  if (h2Count >= 2) hierarchyScore += 7
  if (h3Count >= 1) hierarchyScore += 5
  if (hasProperHierarchy) hierarchyScore = 20

  checks.push({
    name: 'Hiérarchie des titres (H1 > H2 > H3)',
    passed: hasProperHierarchy,
    score: clamp(hierarchyScore, 0, 20),
    maxScore: 20,
    details: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}${h1Count !== 1 ? ' (1 seul H1 recommandé)' : ''}`,
  })

  // 4b. Table of contents / jump links
  const tocPatterns = $('nav a[href^="#"], [class*="toc"] a, [id*="toc"], [class*="table-of-content"], [class*="sommaire"]')
  const hasTOC = tocPatterns.length >= 3

  checks.push({
    name: 'Table des matières / liens d\'ancrage',
    passed: hasTOC,
    score: hasTOC ? 20 : tocPatterns.length >= 1 ? 8 : 0,
    maxScore: 20,
    details: `${tocPatterns.length} lien(s) de navigation interne détecté(s)`,
  })

  // 4c. Summary/TL;DR sections
  const summaryPatterns = $('[class*="summary"], [class*="resume"], [class*="tldr"], [class*="key-takeaway"], [class*="points-cles"], [class*="en-bref"]')
  const summaryInText = $('h2, h3, strong').toArray().some((el) => {
    const text = $(el).text().toLowerCase()
    return /\b(résumé|en bref|points clés|tl;?dr|à retenir|summary|key takeaways)\b/.test(text)
  })
  const hasSummary = summaryPatterns.length > 0 || summaryInText

  checks.push({
    name: 'Section résumé / Points clés',
    passed: hasSummary,
    score: hasSummary ? 20 : 0,
    maxScore: 20,
    details: hasSummary
      ? 'Section résumé ou points clés détectée'
      : 'Aucune section résumé trouvée (ajoutez un TL;DR ou "Points clés")',
  })

  // 4d. Bullet point lists
  const unorderedLists = $('ul').length
  const ulItems = $('ul li').length

  checks.push({
    name: 'Listes à puces',
    passed: unorderedLists >= 2 && ulItems >= 6,
    score: unorderedLists >= 2 && ulItems >= 6 ? 20 : unorderedLists >= 1 ? 10 : 0,
    maxScore: 20,
    details: `${unorderedLists} liste(s) à puces avec ${ulItems} éléments au total`,
  })

  // 4e. Short paragraphs (under 150 words)
  const allParagraphs = $('p').toArray()
  const totalParagraphs = allParagraphs.length
  const shortParagraphs = allParagraphs.filter((el) => wordCount($(el).text()) <= 150).length
  const shortParagraphRatio = totalParagraphs > 0 ? shortParagraphs / totalParagraphs : 0

  checks.push({
    name: 'Paragraphes courts (< 150 mots)',
    passed: shortParagraphRatio >= 0.8,
    score: Math.round(shortParagraphRatio * 20),
    maxScore: 20,
    details: `${shortParagraphs}/${totalParagraphs} paragraphes sous 150 mots (${Math.round(shortParagraphRatio * 100)}%)`,
  })

  return { score: categoryScore(checks), checks }
}

// ── Recommendations ──────────────────────────────────────────────────

function generateRecommendations(
  snippet: AEOCategory,
  qa: AEOCategory,
  voice: AEOCategory,
  structure: AEOCategory
): string[] {
  const recs: string[] = []

  // Snippet readiness recommendations
  for (const check of snippet.checks) {
    if (!check.passed) {
      if (check.name.includes('définition')) {
        recs.push('Ajoutez des paragraphes de définition en ouverture de section ("X est...", "X désigne...") pour faciliter l\'extraction en featured snippet.')
      }
      if (check.name.includes('numérotées')) {
        recs.push('Intégrez des listes numérotées (étapes, classements) pour déclencher des snippets de type liste dans Google.')
      }
      if (check.name.includes('Tableaux')) {
        recs.push('Ajoutez des tableaux comparatifs ou de données pour cibler les snippets tableau.')
      }
      if (check.name.includes('concis')) {
        recs.push('Rédigez des paragraphes courts (10-50 mots) qui répondent directement à une question pour maximiser les chances de featured snippet.')
      }
      if (check.name.includes('gras')) {
        recs.push('Mettez en gras les termes clés et concepts importants avec les balises <strong>.')
      }
    }
  }

  // QA recommendations
  for (const check of qa.checks) {
    if (!check.passed) {
      if (check.name.includes('questions')) {
        recs.push('Formulez vos titres H2/H3 sous forme de questions ("Comment...", "Qu\'est-ce que...", "Pourquoi...") pour cibler les PAA.')
      }
      if (check.name.includes('FAQ')) {
        recs.push('Ajoutez une section FAQ structurée avec le balisage Schema.org FAQPage pour apparaitre dans les People Also Ask.')
      }
      if (check.name.includes('People Also Ask')) {
        recs.push('Intégrez davantage de questions courantes que votre audience pourrait poser dans le corps du contenu.')
      }
    }
  }

  // Voice readiness recommendations
  for (const check of voice.checks) {
    if (!check.passed) {
      if (check.name.includes('conversationnel')) {
        recs.push('Adoptez un ton plus conversationnel avec "vous", "votre", "par exemple" pour optimiser la recherche vocale.')
      }
      if (check.name.includes('voix')) {
        recs.push('Ciblez des paragraphes de 25-60 mots pour les réponses vocales des assistants (Google Assistant, Siri, Alexa).')
      }
      if (check.name.includes('locale')) {
        recs.push('Ajoutez des signaux locaux (adresse, téléphone, horaires) si votre activité a une composante locale.')
      }
      if (check.name.includes('Speakable')) {
        recs.push('Implémentez le balisage Schema.org "Speakable" pour indiquer aux moteurs quelles parties lire à voix haute.')
      }
    }
  }

  // Structure recommendations
  for (const check of structure.checks) {
    if (!check.passed) {
      if (check.name.includes('Hiérarchie')) {
        recs.push('Structurez vos titres avec exactement 1 H1, plusieurs H2 et des H3 sous chaque H2 pour une hiérarchie claire.')
      }
      if (check.name.includes('Table des matières')) {
        recs.push('Ajoutez une table des matières avec des liens d\'ancrage pour faciliter la navigation et le crawl.')
      }
      if (check.name.includes('résumé')) {
        recs.push('Ajoutez une section "En bref" ou "Points clés" en début ou fin d\'article pour les lecteurs pressés et les moteurs.')
      }
      if (check.name.includes('puces')) {
        recs.push('Utilisez davantage de listes à puces pour structurer l\'information et améliorer la lisibilité.')
      }
      if (check.name.includes('courts')) {
        recs.push('Découpez les paragraphes longs (> 150 mots) en paragraphes plus courts pour une meilleure lisibilité et extraction.')
      }
    }
  }

  return recs
}

// ── Main Export ───────────────────────────────────────────────────────

export function analyzeAEO(html: string, url: string): AEOResult {
  const $ = cheerio.load(html)

  const snippetReadiness = analyzeSnippetReadiness($)
  const qaPatterns = analyzeQAPatterns($)
  const voiceReadiness = analyzeVoiceReadiness($)
  const contentStructure = analyzeContentStructure($)

  // Weighted average: snippet 30%, QA 25%, voice 20%, structure 25%
  const overallScore = Math.round(
    snippetReadiness.score * 0.3 +
    qaPatterns.score * 0.25 +
    voiceReadiness.score * 0.2 +
    contentStructure.score * 0.25
  )

  const grade = scoreToGrade(overallScore)
  const recommendations = generateRecommendations(
    snippetReadiness,
    qaPatterns,
    voiceReadiness,
    contentStructure
  )

  return {
    overallScore,
    grade,
    snippetReadiness,
    qaPatterns,
    voiceReadiness,
    contentStructure,
    recommendations,
  }
}
