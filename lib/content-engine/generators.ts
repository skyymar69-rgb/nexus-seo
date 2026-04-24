/**
 * Content generators per type.
 * Each generator produces structured Markdown content using template banks,
 * with integrated SEO optimization tips and keyword insertion guidance.
 */

import { getBank } from './templates'
import {
  hashKeyword,
  seededRandom,
  pick,
  pickN,
  capitalize,
  insertKeyword,
  keywordDensity,
} from './keywords'

interface GenerateParams {
  type: string
  keyword: string
  tone: string
  language: string
  wordCount: number
  instructions?: string
}

const currentYear = new Date().getFullYear().toString()

function applyYear(text: string): string {
  return text.replace(/\{year\}/g, currentYear)
}

function applyTone(text: string, tone: string, lang: string, rand: () => number): string {
  const bank = getBank(lang)
  const mod = bank.toneModifiers[tone] || bank.toneModifiers.professional
  if (rand() > 0.7) {
    return pick(mod.connectors, rand) + ' ' + text
  }
  return text
}

/** Generate SEO analysis block appended to content */
function seoAnalysisBlock(content: string, keyword: string, lang: string, type: string): string {
  const isFr = lang === 'fr'
  const words = content.split(/\s+/).filter(w => w.length > 0).length
  const density = keywordDensity(content, keyword)
  const densityStr = density.toFixed(1)
  const h2Count = (content.match(/^## /gm) || []).length
  const h3Count = (content.match(/^### /gm) || []).length
  const bulletCount = (content.match(/^- /gm) || []).length
  const boldCount = (content.match(/\*\*[^*]+\*\*/g) || []).length
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20).length

  // Density assessment
  let densityStatus: string
  let densityIcon: string
  if (density >= 1 && density <= 3) {
    densityStatus = isFr ? 'Optimal' : 'Optimal'
    densityIcon = '✅'
  } else if (density < 1) {
    densityStatus = isFr ? 'Trop faible — ajoutez le mot-cle dans 2-3 phrases supplementaires' : 'Too low — add keyword in 2-3 more sentences'
    densityIcon = '⚠️'
  } else {
    densityStatus = isFr ? 'Trop eleve — risque de sur-optimisation' : 'Too high — risk of over-optimization'
    densityIcon = '🔴'
  }

  // First paragraph check
  const firstPara = content.split('\n\n')[1] || ''
  const kwInFirstPara = firstPara.toLowerCase().includes(keyword.toLowerCase())

  let block = '\n\n---\n\n'
  block += `## ${isFr ? '📊 Analyse SEO du contenu genere' : '📊 SEO Analysis of Generated Content'}\n\n`

  // Metrics table
  block += `| ${isFr ? 'Critere' : 'Criteria'} | ${isFr ? 'Valeur' : 'Value'} | ${isFr ? 'Statut' : 'Status'} |\n`
  block += '|---|---|---|\n'
  block += `| ${isFr ? 'Nombre de mots' : 'Word count'} | ${words} | ${words >= 300 ? '✅' : '⚠️'} |\n`
  block += `| ${isFr ? 'Densite mot-cle' : 'Keyword density'} "${keyword}" | ${densityStr}% | ${densityIcon} ${densityStatus} |\n`
  block += `| ${isFr ? 'Titres H2' : 'H2 headings'} | ${h2Count} | ${h2Count >= 3 ? '✅' : '⚠️'} |\n`
  block += `| ${isFr ? 'Sous-titres H3' : 'H3 subheadings'} | ${h3Count} | ${h3Count >= 1 ? '✅' : 'ℹ️'} |\n`
  block += `| ${isFr ? 'Listes a puces' : 'Bullet lists'} | ${bulletCount} ${isFr ? 'items' : 'items'} | ${bulletCount >= 3 ? '✅' : '⚠️'} |\n`
  block += `| ${isFr ? 'Mots en gras' : 'Bold keywords'} | ${boldCount} | ${boldCount >= 2 ? '✅' : '⚠️'} |\n`
  block += `| ${isFr ? 'Mot-cle dans l\'intro' : 'Keyword in intro'} | ${kwInFirstPara ? (isFr ? 'Oui' : 'Yes') : (isFr ? 'Non' : 'No')} | ${kwInFirstPara ? '✅' : '🔴'} |\n`
  block += `| ${isFr ? 'Paragraphes' : 'Paragraphs'} | ${paragraphs} | ${paragraphs >= 4 ? '✅' : '⚠️'} |\n\n`

  // Actionable tips
  block += `### ${isFr ? '💡 Conseils d\'optimisation avant publication' : '💡 Optimization Tips Before Publishing'}\n\n`

  if (isFr) {
    block += `1. **Balise Title** : Utilisez "${capitalize(keyword)}" au debut de votre balise \`<title>\` (50-60 caracteres max)\n`
    block += `2. **Meta Description** : Redigez 150-160 caracteres incluant "${keyword}" + un appel a l'action\n`
    block += `3. **URL** : Structurez votre URL en \`/votre-page/${keyword.toLowerCase().replace(/\s+/g, '-')}/\`\n`
    block += `4. **Images** : Ajoutez 2-4 images avec \`alt="${keyword} — [description]"\`\n`
    block += `5. **Liens internes** : Creez 3-5 liens vers vos pages existantes en rapport avec "${keyword}"\n`
    block += `6. **Liens externes** : Ajoutez 1-2 liens vers des sources autoritaires de votre secteur\n`
    block += `7. **Schema Markup** : ${type === 'faq' ? 'Implementez le FAQPage schema pour les rich snippets' : type === 'article' ? 'Ajoutez le schema Article pour Google Discover' : 'Implementez le schema adapte a votre type de contenu'}\n`
    block += `8. **Featured Snippet** : Structurez une reponse de 40-60 mots au debut d'une section pour viser la Position 0\n`

    if (!kwInFirstPara) {
      block += `\n> ⚠️ **Action prioritaire** : Inserez "${keyword}" dans votre premiere phrase d'introduction. Google donne un poids important aux 100 premiers mots.\n`
    }

    if (density < 1) {
      block += `\n> ⚠️ **Densite trop faible** : Ajoutez "${keyword}" naturellement dans ${Math.ceil(2 - density * 10)} phrases supplementaires. Visez 1-2% de densite.\n`
    }
  } else {
    block += `1. **Title Tag**: Place "${capitalize(keyword)}" at the beginning of your \`<title>\` tag (50-60 chars max)\n`
    block += `2. **Meta Description**: Write 150-160 characters including "${keyword}" + a call-to-action\n`
    block += `3. **URL**: Structure your URL as \`/your-page/${keyword.toLowerCase().replace(/\s+/g, '-')}/\`\n`
    block += `4. **Images**: Add 2-4 images with \`alt="${keyword} — [description]"\`\n`
    block += `5. **Internal Links**: Create 3-5 links to existing pages related to "${keyword}"\n`
    block += `6. **External Links**: Add 1-2 links to authoritative sources in your niche\n`
    block += `7. **Schema Markup**: ${type === 'faq' ? 'Implement FAQPage schema for rich snippets' : type === 'article' ? 'Add Article schema for Google Discover' : 'Implement the appropriate schema for your content type'}\n`
    block += `8. **Featured Snippet**: Structure a 40-60 word answer at the start of a section to target Position 0\n`

    if (!kwInFirstPara) {
      block += `\n> ⚠️ **Priority Action**: Insert "${keyword}" in your first introductory sentence. Google places high importance on the first 100 words.\n`
    }
  }

  // LSI keywords suggestions
  block += `\n### ${isFr ? '🔗 Mots-cles semantiques a integrer' : '🔗 Semantic Keywords to Include'}\n\n`
  const lsiKeywords = generateLSIKeywords(keyword, lang)
  block += lsiKeywords.map(k => `\`${k}\``).join(' · ') + '\n\n'
  block += isFr
    ? `*Inserez 5-8 de ces termes naturellement dans votre contenu pour renforcer la pertinence semantique.*\n`
    : `*Insert 5-8 of these terms naturally in your content to strengthen semantic relevance.*\n`

  return block
}

/** Generate contextual LSI keywords based on keyword */
function generateLSIKeywords(keyword: string, lang: string): string[] {
  const kw = keyword.toLowerCase()
  const isFr = lang === 'fr'

  // Common SEO-related LSI patterns
  const genericFr = [
    `optimisation ${kw}`, `guide ${kw}`, `strategie ${kw}`,
    `meilleur ${kw}`, `${kw} en ligne`, `${kw} professionnel`,
    `outils ${kw}`, `formation ${kw}`, `tendances ${kw}`,
    `avantages ${kw}`, `prix ${kw}`, `comparatif ${kw}`,
    `avis ${kw}`, `${kw} gratuit`, `${kw} ${new Date().getFullYear()}`,
    `comment ${kw}`, `pourquoi ${kw}`, `${kw} debutant`,
  ]

  const genericEn = [
    `${kw} optimization`, `${kw} guide`, `${kw} strategy`,
    `best ${kw}`, `${kw} online`, `professional ${kw}`,
    `${kw} tools`, `${kw} training`, `${kw} trends`,
    `${kw} benefits`, `${kw} pricing`, `${kw} comparison`,
    `${kw} reviews`, `free ${kw}`, `${kw} ${new Date().getFullYear()}`,
    `how to ${kw}`, `why ${kw}`, `${kw} for beginners`,
  ]

  const list = isFr ? genericFr : genericEn
  const rand = seededRandom(hashKeyword(keyword + 'lsi'))
  return pickN(list, 12, rand)
}

// ─── ARTICLE ───────────────────────────────────────────────
function generateArticle(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + p.type))
  const kw = p.keyword.trim()
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  const sectionCount = Math.max(3, Math.min(8, Math.round(p.wordCount / 250)))

  const title = applyYear(ins(pick(bank.titlePatterns, rand), kw, p.language, rand))
  const intro = ins(pick(bank.introPatterns, rand), kw, p.language, rand)
  const headings = pickN(bank.h2Patterns, sectionCount, rand)
  const conclusion = ins(pick(bank.conclusionPatterns, rand), kw, p.language, rand)
  const cta = ins(pick(bank.ctaPatterns, rand), kw, p.language, rand)

  const sections: string[] = []

  for (let i = 0; i < headings.length; i++) {
    const h2 = ins(headings[i], kw, p.language, rand)
    let sectionContent = ''

    const paraCount = rand() > 0.5 ? 3 : 2
    const paras = pickN(bank.bodyParagraphs, paraCount, rand)

    for (const para of paras) {
      const processed = applyTone(ins(para, kw, p.language, rand), p.tone, p.language, rand)
      sectionContent += processed + '\n\n'
    }

    // Add bullet list in ~40% of sections
    if (rand() > 0.6) {
      const bullets = pickN(bank.bulletPoints, 4, rand)
      sectionContent += bullets.map(b => `- ${b}`).join('\n') + '\n\n'
    }

    // Add a bold key takeaway in some sections
    if (rand() > 0.7) {
      const takeaway = isFr
        ? `**A retenir :** ${ins(pick(bank.bulletPoints, rand), kw, p.language, rand)} est un facteur determinant pour votre reussite avec ${kw}.`
        : `**Key takeaway:** ${ins(pick(bank.bulletPoints, rand), kw, p.language, rand)} is a determining factor for your success with ${kw}.`
      sectionContent += takeaway + '\n\n'
    }

    sections.push(`## ${h2}\n\n${sectionContent}`)
  }

  const conclusionLabel = isFr ? 'Conclusion' : p.language === 'es' ? 'Conclusion' : p.language === 'de' ? 'Fazit' : 'Conclusion'
  let content = `# ${title}\n\n${intro}\n\n${sections.join('')}## ${conclusionLabel}\n\n${conclusion}\n\n${cta}\n`

  if (p.instructions) {
    content += `\n---\n\n*${p.instructions}*\n`
  }

  // Append SEO analysis
  content += seoAnalysisBlock(content, kw, p.language, 'article')

  return content
}

// ─── META DESCRIPTION ──────────────────────────────────────
function generateMetaDescription(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'meta'))
  const kw = p.keyword.trim()
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  const variants = pickN(bank.metaDescPatterns, Math.min(5, bank.metaDescPatterns.length), rand)
  const header = isFr ? 'Variantes de Meta Descriptions' : 'Meta Description Variants'

  let content = `# ${header} — ${capitalize(kw)}\n\n`

  variants.forEach((v, i) => {
    const desc = ins(v, kw, p.language, rand)
    const charCount = desc.length
    const status = charCount >= 120 && charCount <= 160 ? '✅' : charCount < 120 ? '⚠️ Trop court' : '🔴 Trop long'
    content += `### Option ${i + 1} ${status} (${charCount} car.)\n\n`
    content += `> ${desc}\n\n`
  })

  content += '---\n\n'
  content += `### ${isFr ? '💡 Regles d\'or pour une meta description efficace' : '💡 Golden Rules for an Effective Meta Description'}\n\n`

  if (isFr) {
    content += `- **Longueur** : 120-160 caracteres (Google tronque au-dela)\n`
    content += `- **Mot-cle principal** : "${kw}" doit apparaitre dans les 70 premiers caracteres\n`
    content += `- **Appel a l'action** : Utilisez un verbe d'action (Decouvrez, Apprenez, Comparez...)\n`
    content += `- **Proposition de valeur** : Expliquez le benefice pour l'utilisateur\n`
    content += `- **Unicite** : Chaque page doit avoir sa propre meta description\n`
    content += `- **Pas de guillemets doubles** : Ils coupent l'affichage dans les SERP\n`
  } else {
    content += `- **Length**: 120-160 characters (Google truncates beyond this)\n`
    content += `- **Main keyword**: "${kw}" should appear in the first 70 characters\n`
    content += `- **Call-to-action**: Use an action verb (Discover, Learn, Compare...)\n`
    content += `- **Value proposition**: Explain the user benefit\n`
    content += `- **Uniqueness**: Each page must have its own meta description\n`
    content += `- **No double quotes**: They cut the display in SERPs\n`
  }

  return content
}

// ─── FAQ ───────────────────────────────────────────────────
function generateFAQ(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'faq'))
  const kw = p.keyword.trim()
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  const questionCount = Math.max(5, Math.min(10, Math.round(p.wordCount / 150)))
  const questions = pickN(bank.faqQuestions, questionCount, rand)
  const answers = pickN(bank.faqAnswerPatterns, questionCount, rand)

  const header = isFr ? 'Questions Frequentes' : 'Frequently Asked Questions'

  let content = `# ${header} — ${capitalize(kw)}\n\n`

  questions.forEach((q, i) => {
    const question = ins(q, kw, p.language, rand)
    const answer = ins(answers[i % answers.length], kw, p.language, rand)
    content += `## ${question}\n\n${answer}\n\n`
  })

  // SEO tips for FAQ
  content += '---\n\n'
  content += `### ${isFr ? '📋 Guide d\'implementation SEO pour vos FAQ' : '📋 SEO Implementation Guide for Your FAQ'}\n\n`

  if (isFr) {
    content += `**Schema FAQ (obligatoire pour les rich snippets) :**\n\n`
    content += '```json\n'
    content += '{\n'
    content += '  "@context": "https://schema.org",\n'
    content += '  "@type": "FAQPage",\n'
    content += '  "mainEntity": [{\n'
    content += '    "@type": "Question",\n'
    content += `    "name": "${ins(questions[0] || '', kw, p.language, rand)}",\n`
    content += '    "acceptedAnswer": {\n'
    content += '      "@type": "Answer",\n'
    content += `      "text": "Votre reponse ici..."\n`
    content += '    }\n'
    content += '  }]\n'
    content += '}\n'
    content += '```\n\n'
    content += `**Bonnes pratiques :**\n`
    content += `- Inserez "${kw}" dans au moins 50% des questions\n`
    content += `- Reponses entre 50-100 mots pour les featured snippets\n`
    content += `- Commencez chaque reponse par une phrase directe (pas de "En fait...")\n`
    content += `- Ajoutez des liens internes dans les reponses detaillees\n`
    content += `- Utilisez le balisage \`<h2>\` pour chaque question\n`
  } else {
    content += `**FAQ Schema (required for rich snippets):**\n\n`
    content += '```json\n'
    content += '{\n'
    content += '  "@context": "https://schema.org",\n'
    content += '  "@type": "FAQPage",\n'
    content += '  "mainEntity": [{\n'
    content += '    "@type": "Question",\n'
    content += `    "name": "${ins(questions[0] || '', kw, p.language, rand)}",\n`
    content += '    "acceptedAnswer": {\n'
    content += '      "@type": "Answer",\n'
    content += `      "text": "Your answer here..."\n`
    content += '    }\n'
    content += '  }]\n'
    content += '}\n'
    content += '```\n\n'
    content += `**Best practices:**\n`
    content += `- Include "${kw}" in at least 50% of questions\n`
    content += `- Answers between 50-100 words for featured snippets\n`
    content += `- Start each answer with a direct sentence\n`
    content += `- Add internal links in detailed answers\n`
    content += `- Use \`<h2>\` tags for each question\n`
  }

  return content
}

// ─── PRODUCT DESCRIPTION ───────────────────────────────────
function generateProductDescription(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'product'))
  const kw = p.keyword.trim()
  const Kw = capitalize(kw)
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  const features = pickN(bank.productFeatures, 6, rand).map(f => ins(f, kw, p.language, rand))
  const intro = ins(pick(bank.introPatterns, rand), kw, p.language, rand)
  const paras = pickN(bank.bodyParagraphs, 3, rand)

  let content = `# ${Kw} — ${isFr ? 'Description Produit Optimisee SEO' : 'SEO-Optimized Product Description'}\n\n`

  content += `## ${isFr ? 'Presentation' : 'Overview'}\n\n${intro}\n\n`

  content += `## ${isFr ? 'Caracteristiques principales' : 'Key Features'}\n\n`
  features.forEach(f => { content += `- **${f}**\n` })
  content += '\n'

  content += `## ${isFr ? 'Description detaillee' : 'Detailed Description'}\n\n`
  for (const para of paras) {
    content += ins(para, kw, p.language, rand) + '\n\n'
  }

  content += `## ${isFr ? 'Pourquoi choisir' : 'Why Choose'} ${Kw} ?\n\n`
  const bullets = pickN(bank.bulletPoints, 4, rand)
  bullets.forEach(b => { content += `- ${b}\n` })
  content += '\n'

  content += ins(pick(bank.ctaPatterns, rand), kw, p.language, rand) + '\n'

  // Product SEO tips
  content += seoAnalysisBlock(content, kw, p.language, 'product-description')

  return content
}

// ─── TITLE VARIANTS ────────────────────────────────────────
function generateTitle(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'title'))
  const kw = p.keyword.trim()
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  const allTitles = bank.titlePatterns.map(t => applyYear(ins(t, kw, p.language, rand)))

  const extras = isFr ? [
    `${capitalize(kw)} : Comparatif et Avis d'Experts ${currentYear}`,
    `Top 10 des Meilleures Pratiques pour ${capitalize(kw)}`,
    `Comment ${capitalize(kw)} Peut Transformer Vos Resultats`,
    `${capitalize(kw)} pour Debutants : Par Ou Commencer ?`,
    `Les 5 Erreurs Fatales a Eviter avec ${capitalize(kw)}`,
    `Pourquoi Vous Devriez Investir dans ${capitalize(kw)} des Maintenant`,
  ] : [
    `${capitalize(kw)}: Expert Reviews & Comparison ${currentYear}`,
    `Top 10 Best Practices for ${capitalize(kw)}`,
    `How ${capitalize(kw)} Can Transform Your Results`,
    `${capitalize(kw)} for Beginners: Where to Start?`,
    `5 Fatal Mistakes to Avoid with ${capitalize(kw)}`,
    `Why You Should Invest in ${capitalize(kw)} Right Now`,
  ]

  const titles = [...allTitles, ...extras]
  const header = isFr ? 'Suggestions de Titres SEO' : 'SEO Title Suggestions'

  let content = `# ${header} — ${capitalize(kw)}\n\n`

  titles.forEach((t, i) => {
    const charCount = t.length
    const status = charCount <= 60 ? '✅' : charCount <= 70 ? '⚠️' : '🔴'
    content += `${i + 1}. **${t}** ${status} (${charCount} car.)\n`
  })

  content += `\n---\n\n### ${isFr ? '💡 Regles pour un titre SEO performant' : '💡 Rules for a High-Performing SEO Title'}\n\n`

  if (isFr) {
    content += `- **50-60 caracteres** : Au-dela, Google tronque avec "..."\n`
    content += `- **Mot-cle en debut** : "${capitalize(kw)}" doit etre dans les 5 premiers mots\n`
    content += `- **Nombres** : Les titres avec chiffres ont +36% de CTR\n`
    content += `- **Power words** : "Guide", "Complet", "Ultime", "Gratuit" boostent le clic\n`
    content += `- **Annee** : Ajoutez "${currentYear}" pour le contenu evergreen\n`
    content += `- **Unique** : Chaque page = un titre unique, jamais de doublons\n`
    content += `- **Intent** : Alignez le titre avec l'intention de recherche (info, transactionnel, navigational)\n`
  } else {
    content += `- **50-60 characters**: Beyond this, Google truncates with "..."\n`
    content += `- **Keyword first**: "${capitalize(kw)}" should be in the first 5 words\n`
    content += `- **Numbers**: Titles with numbers get +36% CTR\n`
    content += `- **Power words**: "Guide", "Complete", "Ultimate", "Free" boost clicks\n`
    content += `- **Year**: Add "${currentYear}" for evergreen content\n`
    content += `- **Unique**: Each page = one unique title, never duplicate\n`
    content += `- **Intent**: Align title with search intent (info, transactional, navigational)\n`
  }

  return content
}

// ─── LANDING PAGE ──────────────────────────────────────────
function generateLandingPage(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'landing'))
  const kw = p.keyword.trim()
  const Kw = capitalize(kw)
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  let content = `# ${Kw} — ${isFr ? 'Structure Landing Page Optimisee' : 'Optimized Landing Page Structure'}\n\n`

  // Hero section
  content += `## ${isFr ? 'Section Hero' : 'Hero Section'}\n\n`
  content += `### ${isFr ? 'Titre principal' : 'Main Headline'}\n\n`
  content += `**${applyYear(ins(pick(bank.titlePatterns, rand), kw, p.language, rand))}**\n\n`
  content += `### ${isFr ? 'Sous-titre' : 'Subheadline'}\n\n`
  content += ins(pick(bank.metaDescPatterns, rand), kw, p.language, rand) + '\n\n'
  content += `### CTA\n\n`
  content += `**[${isFr ? 'Commencer Gratuitement' : 'Get Started Free'}]** | **[${isFr ? 'Voir la Demo' : 'Watch Demo'}]**\n\n`

  // Features
  content += `## ${isFr ? 'Fonctionnalites Cles' : 'Key Features'}\n\n`
  const features = pickN(bank.productFeatures, 4, rand)
  features.forEach(f => {
    content += `### ${ins(f, kw, p.language, rand)}\n\n`
    content += ins(pick(bank.bodyParagraphs, rand), kw, p.language, rand) + '\n\n'
  })

  // Social proof
  content += `## ${isFr ? 'Preuve Sociale' : 'Social Proof'}\n\n`
  content += `> "${isFr ? `${Kw} a transforme notre approche et nos resultats ont augmente de 150% en 6 mois.` : `${Kw} has transformed our approach and our results increased by 150% in 6 months.`}"\n`
  content += `> — ${isFr ? 'Directeur Marketing, Entreprise Leader' : 'Marketing Director, Leading Company'}\n\n`

  // Final CTA
  content += `## ${isFr ? 'Passez a l\'Action' : 'Take Action'}\n\n`
  content += ins(pick(bank.ctaPatterns, rand), kw, p.language, rand) + '\n'

  // Landing page SEO tips
  content += seoAnalysisBlock(content, kw, p.language, 'landing-page')

  return content
}

// ─── CATEGORY DESCRIPTION ──────────────────────────────────
function generateCategoryDescription(p: GenerateParams): string {
  const bank = getBank(p.language)
  const rand = seededRandom(hashKeyword(p.keyword + 'category'))
  const kw = p.keyword.trim()
  const Kw = capitalize(kw)
  const ins = insertKeyword
  const isFr = p.language === 'fr'

  let content = `# ${Kw}\n\n`

  content += ins(pick(bank.introPatterns, rand), kw, p.language, rand) + '\n\n'

  content += `## ${isFr ? 'Ce que vous trouverez dans cette categorie' : 'What you\'ll find in this category'}\n\n`
  const bullets = pickN(bank.bulletPoints, 5, rand)
  bullets.forEach(b => { content += `- ${b}\n` })
  content += '\n'

  content += `## ${isFr ? 'Guide d\'achat' : 'Buying Guide'} — ${Kw}\n\n`
  const paras = pickN(bank.bodyParagraphs, 2, rand)
  for (const para of paras) {
    content += ins(para, kw, p.language, rand) + '\n\n'
  }

  content += seoAnalysisBlock(content, kw, p.language, 'category-description')

  return content
}

// ─── ROUTER ────────────────────────────────────────────────
export function generateContent(params: GenerateParams): string {
  switch (params.type) {
    case 'article':
      return generateArticle(params)
    case 'meta-description':
      return generateMetaDescription(params)
    case 'faq':
      return generateFAQ(params)
    case 'product-description':
      return generateProductDescription(params)
    case 'title':
      return generateTitle(params)
    case 'landing-page':
      return generateLandingPage(params)
    case 'category-description':
      return generateCategoryDescription(params)
    default:
      return generateArticle(params)
  }
}
