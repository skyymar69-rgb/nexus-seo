// Système AI Advisor pour SEO - Moteur d'optimisation complet et intelligent
// Génère des recommandations, plans d'action et suivi de progrès basés sur les données d'audit réelles

// ============= INTERFACES =============

export interface ChecklistItem {
  id: string
  category: 'technique' | 'contenu' | 'performance' | 'backlinks' | 'ai-visibility' | 'securite' | 'mobile' | 'ux'
  priority: 'critique' | 'haute' | 'moyenne' | 'basse'
  title: string
  description: string
  impact: string
  impactScore: number // 1-100: impact potentiel de cette action
  effort: 'faible' | 'moyen' | 'eleve'
  status: 'a_faire' | 'en_cours' | 'termine' | 'ignore'
  estimatedTime: string
  estimatedMinutes: number // pour calculs plus précis
  howTo?: string
  expectedGain?: number // points de score attendus
}

export interface SEOGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline?: string
  category: string
  progress: number // 0-100%
  estimatedWeeks?: number // semaines pour atteindre l'objectif
  milestones?: Milestone[]
}

export interface Milestone {
  week: number
  target: number
  description: string
}

export interface Recommendation {
  id: string
  category: string
  priority: 'critique' | 'haute' | 'moyenne' | 'basse'
  title: string
  description: string
  actionSteps: string[]
  expectedImpact: string
  timelineWeeks: number
  effort: 'faible' | 'moyen' | 'eleve'
  relatedKeywords?: string[]
}

export interface ActionPlan {
  quickWins: ChecklistItem[] // impact fort, effort faible
  shortTerm: ChecklistItem[] // 1-2 semaines
  mediumTerm: ChecklistItem[] // 1-3 mois
  longTerm: ChecklistItem[] // 3-12 mois
  estimatedTotalTime: number // en heures
  estimatedScoreGain: number // points attendus
}

export interface SEOScoreBreakdown {
  totalScore: number
  grade: string
  trend: 'improving' | 'stable' | 'declining'
  categoryScores: Record<string, number>
  strengths: string[]
  weaknesses: string[]
  benchmarkPercentile: number // pourcentage par rapport à la concurrence
}

export interface ProgressTracking {
  goalId: string
  currentValue: number
  targetValue: number
  progress: number // 0-100%
  weeksElapsed: number
  weeksRemaining: number
  expectedCompletionDate: Date
  velocityPerWeek: number // progression moyenne par semaine
  onTrack: boolean
}

export interface IndustryBenchmarks {
  industry: string
  avgTechnicalScore: number
  avgContentScore: number
  avgPerformanceScore: number
  avgBacklinksScore: number
  avgAIVisibilityScore: number
  topPlayersScore: number
  medianScore: number
}

// ============= CONSTANTES ET DÉFINITIONS =============

const categoryLabels: Record<string, string> = {
  technique: 'Technique',
  contenu: 'Contenu',
  performance: 'Performance',
  backlinks: 'Backlinks',
  'ai-visibility': 'Visibilité IA',
  securite: 'Sécurité',
  mobile: 'Mobile',
  ux: 'Expérience Utilisateur',
}

const priorityOrder = { critique: 0, haute: 1, moyenne: 2, basse: 3 }
const effortScore = { faible: 1, moyen: 3, eleve: 5 }

const categoryWeights = {
  technique: 0.15,
  contenu: 0.25,
  performance: 0.20,
  backlinks: 0.20,
  'ai-visibility': 0.12,
  securite: 0.05,
  mobile: 0.02,
  ux: 0.01,
}

const industryBenchmarks: Record<string, IndustryBenchmarks> = {
  ecommerce: {
    industry: 'E-commerce',
    avgTechnicalScore: 72,
    avgContentScore: 65,
    avgPerformanceScore: 58,
    avgBacklinksScore: 62,
    avgAIVisibilityScore: 45,
    topPlayersScore: 88,
    medianScore: 70,
  },
  saas: {
    industry: 'SaaS',
    avgTechnicalScore: 78,
    avgContentScore: 75,
    avgPerformanceScore: 72,
    avgBacklinksScore: 68,
    avgAIVisibilityScore: 62,
    topPlayersScore: 92,
    medianScore: 76,
  },
  blog: {
    industry: 'Blog/Contenu',
    avgTechnicalScore: 74,
    avgContentScore: 82,
    avgPerformanceScore: 64,
    avgBacklinksScore: 70,
    avgAIVisibilityScore: 68,
    topPlayersScore: 90,
    medianScore: 74,
  },
  local: {
    industry: 'Business Local',
    avgTechnicalScore: 68,
    avgContentScore: 60,
    avgPerformanceScore: 55,
    avgBacklinksScore: 52,
    avgAIVisibilityScore: 40,
    topPlayersScore: 82,
    medianScore: 65,
  },
}

// ============= GÉNÉRATION DE RECOMMANDATIONS =============

/**
 * Génère des recommandations intelligentes basées sur les données d'audit réelles
 * Analyse les scores faibles et identifie les opportunités d'impact maximal
 */
export function generateRecommendations(auditData: any, websiteData: any = {}): Recommendation[] {
  const recommendations: Recommendation[] = []
  let id = 0

  // Analyser les scores par catégorie
  const categoryScores = calculateCategoryScores(auditData)
  const weakestCategories = Object.entries(categoryScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([cat]) => cat)

  // TECHNIQUE - Priorité maximale si score faible
  if (categoryScores['technique'] < 75) {
    const techIssues = findTechnicalIssues(auditData)

    techIssues.forEach(issue => {
      recommendations.push({
        id: `rec-${++id}`,
        category: 'technique',
        priority: issue.priority,
        title: issue.title,
        description: issue.description,
        actionSteps: issue.steps,
        expectedImpact: `+${issue.expectedGain} points de score`,
        timelineWeeks: issue.timelineWeeks,
        effort: issue.effort,
        relatedKeywords: issue.relatedKeywords || [],
      })
    })
  }

  // CONTENU - Si trop peu de mots ou pas de H1
  if (categoryScores['contenu'] < 75) {
    const contentIssues = findContentIssues(auditData)

    contentIssues.forEach(issue => {
      recommendations.push({
        id: `rec-${++id}`,
        category: 'contenu',
        priority: issue.priority,
        title: issue.title,
        description: issue.description,
        actionSteps: issue.steps,
        expectedImpact: `+${issue.expectedGain} points de score`,
        timelineWeeks: issue.timelineWeeks,
        effort: issue.effort,
        relatedKeywords: issue.relatedKeywords || [],
      })
    })
  }

  // PERFORMANCE - Très important pour le classement et UX
  if (categoryScores['performance'] < 70) {
    const perfIssues = findPerformanceIssues(auditData)

    perfIssues.forEach(issue => {
      recommendations.push({
        id: `rec-${++id}`,
        category: 'performance',
        priority: issue.priority,
        title: issue.title,
        description: issue.description,
        actionSteps: issue.steps,
        expectedImpact: `+${issue.expectedGain} points de score`,
        timelineWeeks: issue.timelineWeeks,
        effort: issue.effort,
        relatedKeywords: issue.relatedKeywords || [],
      })
    })
  }

  // BACKLINKS - Facteur de classement le plus puissant
  if (categoryScores['backlinks'] < 60) {
    recommendations.push({
      id: `rec-${++id}`,
      category: 'backlinks',
      priority: 'haute',
      title: 'Développer une stratégie de backlinking active',
      description: 'Votre profil de backlinks est faible pour votre secteur. Les liens de sites autoritaires sont le facteur de classement #1.',
      actionSteps: [
        'Identifier les 20 sites de plus haute autorité dans votre niche',
        'Créez du contenu hautement linkable (guides complets, données originales)',
        'Lancez une campagne de PR digitale et guest posting',
        'Établissez des partenariats avec des influenceurs du secteur',
        'Participez à des roundups et articles cités',
      ],
      expectedImpact: '+15-30 points de score avec 50-100 liens de qualité',

      timelineWeeks: 12,
      effort: 'eleve',
      relatedKeywords: ['backlinks qualité', 'autorité domaine', 'guest posting'],
    })
  }

  // AI VISIBILITY - Tendance 2026
  if (categoryScores['ai-visibility'] < 60) {
    recommendations.push({
      id: `rec-${++id}`,
      category: 'ai-visibility',
      priority: 'haute',
      title: 'Optimiser pour la visibilité LLM et Generative Engines',
      description: 'L\'optimisation GEO (Generative Engine Optimization) est devenue critique. Les LLM citent les sources structurées et autoritaires.',
      actionSteps: [
        'Structurez le contenu avec des FAQ, définitions et listes',
        'Implémentez schema.org complet (Article, FAQPage, Organization)',
        'Enrichissez le contenu avec des données primaires et recherche originale',
        'Démontrez l\'E-E-A-T (Expertise, Expérience, Autorité, Fiabilité)',
        'Créez du contenu factuel avec sources vérifiables',
      ],
      expectedImpact: '+8-12 points de score + mentions dans ChatGPT/Perplexity',
      timelineWeeks: 8,
      effort: 'moyen',
      relatedKeywords: ['GEO', 'LLM optimization', 'generative AI'],
    })
  }

  // Trier par priorité et impact
  return recommendations.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    return priorityDiff !== 0 ? priorityDiff : 0
  })
}

/**
 * Génère une checklist structurée d'amélioration par catégorie
 */
export function generateChecklist(auditData: any, category?: string): ChecklistItem[] {
  const items: ChecklistItem[] = []
  let idx = 0

  const addItem = (
    cat: ChecklistItem['category'],
    priority: ChecklistItem['priority'],
    title: string,
    description: string,
    impact: string,
    impactScore: number,
    effort: ChecklistItem['effort'],
    estimatedMinutes: number,
    howTo?: string,
    expectedGain?: number
  ) => {
    if (category && cat !== category) return

    items.push({
      id: `check-${++idx}`,
      category: cat,
      priority,
      title,
      description,
      impact,
      impactScore,
      effort,
      status: 'a_faire',
      estimatedTime: formatTime(estimatedMinutes),
      estimatedMinutes,
      howTo,
      expectedGain: expectedGain || 0,
    })
  }

  // ===== TECHNIQUE (TECHNICAL SEO) =====
  // Meta tags et balises HTML
  if (!auditData?.meta?.title || auditData?.meta?.title?.length === 0) {
    addItem('technique', 'critique', 'Ajouter une balise title',
      'La page n\'a pas de balise title. C\'est le facteur on-page le plus important pour le SEO.',
      'Impact majeur sur le classement et le CTR', 85, 'faible', 5,
      'Ajoutez <title>Votre titre (50-60 caractères)</title>', 8)
  } else if (auditData?.meta?.title?.length > 60) {
    addItem('technique', 'haute', 'Optimiser la longueur du title',
      `Le title fait ${auditData.meta.title.length} caractères. Google tronque après 55-60.`,
      'Meilleure visibilité dans les SERP', 70, 'faible', 5,
      'Réduisez à 50-60 caractères max', 4)
  }

  if (!auditData?.meta?.description || auditData?.meta?.description?.length === 0) {
    addItem('technique', 'critique', 'Ajouter une meta description',
      'Aucune meta description. Google affichera un extrait automatique.',
      'Contrôle du CTR (augmente de 15-25%)', 80, 'faible', 10,
      'Meta description 150-160 caractères, persuasive', 7)
  } else if (auditData?.meta?.description?.length > 160) {
    addItem('technique', 'moyenne', 'Optimiser la meta description',
      `${auditData.meta.description.length} caractères. Google tronque après 155-160.`,
      'Meilleure apparence dans les SERP', 50, 'faible', 5,
      'Réduisez à 150-160 caractères', 2)
  }

  if (!auditData?.meta?.canonical) {
    addItem('technique', 'haute', 'Implémenter une URL canonique',
      'Pas de balise canonical. Risque de contenu dupliqué.',
      'Évite les pénalités, consolide le PageRank', 65, 'faible', 5,
      'Ajoutez <link rel="canonical" href="URL">', 5)
  }

  if (!auditData?.meta?.ogTags) {
    addItem('technique', 'moyenne', 'Ajouter les balises Open Graph',
      'Pas de balises OG. Partage social sous-optimal.',
      'Meilleure apparence sur Facebook, LinkedIn, etc.', 45, 'faible', 15,
      'Implémentez og:title, og:description, og:image', 2)
  }

  if (!auditData?.meta?.robotsMeta) {
    addItem('technique', 'moyenne', 'Ajouter la balise meta robots',
      'Pas de directive robots meta. Les moteurs peuvent mal interpréter votre intention.',
      'Contrôle précis de l\'indexation', 40, 'faible', 5,
      '<meta name="robots" content="index, follow">', 1)
  }

  // Sécurité
  if (!auditData?.technical?.https) {
    addItem('securite', 'critique', 'Passer en HTTPS',
      'Le site n\'utilise pas HTTPS. Google classe les sites non-SSL moins bien.',
      'Signal de classement Google + confiance', 95, 'eleve', 240,
      'Achetez un certificat SSL et redirigez HTTP vers HTTPS', 15)
  }

  // Données structurées
  if (!auditData?.technical?.structuredData) {
    addItem('technique', 'haute', 'Ajouter des données structurées Schema.org',
      'Aucune donnée structurée. Vous perdez les rich snippets (CTR +20-30%).',
      'Rich snippets + meilleure visibilité IA', 75, 'moyen', 90,
      'Implémentez JSON-LD pour Article, Organization, Product, FAQ', 10)
  }

  // Fichiers techniques
  if (!auditData?.technical?.robotsTxt) {
    addItem('technique', 'haute', 'Créer un fichier robots.txt',
      'Aucun robots.txt. Les moteurs ne savent pas exactement quoi crawler.',
      'Contrôle précis de l\'indexation', 50, 'faible', 15,
      'Créer /robots.txt avec User-agent et Disallow', 3)
  }

  if (!auditData?.technical?.sitemap) {
    addItem('technique', 'haute', 'Créer un sitemap XML',
      'Pas de sitemap. Les pages importantes peuvent ne pas être découverts.',
      'Indexation plus rapide et complète', 60, 'moyen', 30,
      'Générez sitemap.xml et submitez dans Google Search Console', 5)
  }

  // Actualisation de contenu
  if (auditData?.technical?.contentFresh === false) {
    addItem('technique', 'moyenne', 'Rafraîchir le contenu ancien',
      'Le contenu n\'a pas été mis à jour depuis longtemps.',
      'Signal de fraîcheur (freshness) à Google', 55, 'moyen', 120,
      'Revisitez et mettez à jour les articles majeurs', 4)
  }

  // ===== CONTENU (ON-PAGE SEO) =====
  const wordCount = auditData?.content?.wordCount || 0

  if (wordCount < 300) {
    addItem('contenu', 'critique', 'Enrichir le contenu',
      `Seulement ${wordCount} mots. Le contenu court est rarement compétitif.`,
      'Contenu long = meilleur classement (études confirment)', 90, 'eleve', 240,
      'Visez 800-1200 mots min, 1500+ pour articles', 12)
  } else if (wordCount < 800) {
    addItem('contenu', 'haute', 'Développer le contenu',
      `${wordCount} mots. En dessous de la moyenne des top 10 (1200+ mots).`,
      'Meilleure couverture sémantique du sujet', 70, 'moyen', 120,
      'Ajoutez des sections manquantes, plus de profondeur', 8)
  } else if (wordCount < 1500) {
    addItem('contenu', 'moyenne', 'Étendre le contenu pour dominance',
      `${wordCount} mots. Bon mais les meilleurs concurrents en ont 1500+.`,
      'Position plus haute pour des mots-clés liés', 55, 'moyen', 90,
      'Complétez avec des sous-sections et données originales', 5)
  }

  // Structure de contenu
  if (!auditData?.content?.h1 || auditData?.content?.h1Count === 0) {
    addItem('contenu', 'critique', 'Ajouter un titre H1',
      'Aucun H1 détecté. Impossible pour les moteurs de comprendre le sujet.',
      'Structure cruciale pour SEO et accessibilité', 85, 'faible', 5,
      'Chaque page doit avoir exactement UN H1', 8)
  } else if (auditData?.content?.h1Count > 1) {
    addItem('contenu', 'moyenne', 'Utiliser un seul H1 par page',
      `${auditData.content.h1Count} H1 détectés. Trop de hiérarchies confuses.`,
      'Structure claire pour les moteurs et lecteurs', 50, 'faible', 10,
      'Gardez 1 H1, convertissez les autres en H2/H3', 3)
  }

  if (!auditData?.content?.h2 || auditData?.content?.h2Count === 0) {
    addItem('contenu', 'haute', 'Ajouter des sous-titres H2/H3',
      'Aucun H2 ou H3. Le contenu manque de structure.',
      'Meilleure scannabilité pour l\'utilisateur et SEO', 70, 'moyen', 30,
      'Divisez le contenu avec des H2/H3 logiques toutes les 200-300 mots', 6)
  }

  // Images
  if (auditData?.content?.imagesWithoutAlt > 0) {
    addItem('contenu', 'haute', 'Ajouter des attributs alt aux images',
      `${auditData.content.imagesWithoutAlt} images sans alt. Manquez le trafic Google Images.`,
      'SEO images (trafic additionnel) + accessibilité', 65, 'moyen', 45,
      'Décrivez chaque image avec du texte pertinent dans alt=""', 6)
  }

  if (auditData?.content?.imagesTotal > 0 && !auditData?.content?.imageTitles) {
    addItem('contenu', 'moyenne', 'Ajouter des titres aux images',
      'Pas de titres d\'images. Opportunité de SEO images manquée.',
      'Contexte supplémentaire pour le classement images', 35, 'faible', 30,
      'Utilisez title="" avec mots-clés pertinents', 2)
  }

  // Mots-clés
  if (!auditData?.content?.keywordDensity || auditData?.content?.keywordDensity < 0.5) {
    addItem('contenu', 'moyenne', 'Optimiser la densité de mots-clés',
      'Densité de mots-clés insuffisante.',
      'Meilleur signal pour le classement sur votre mot-clé cible', 55, 'moyen', 60,
      'Répétez votre mot-clé principal 3-5 fois (1-2% densité)', 4)
  }

  // Fraîcheur de contenu
  if (auditData?.content?.lastUpdated) {
    const daysOld = Math.floor((Date.now() - new Date(auditData.content.lastUpdated).getTime()) / (1000 * 60 * 60 * 24))
    if (daysOld > 365) {
      addItem('contenu', 'moyenne', 'Mettre à jour le contenu',
        `Contenu non mis à jour depuis ${Math.floor(daysOld / 30)} mois.`,
        'Signal de fraîcheur (important pour certains topics)', 50, 'moyen', 90,
        'Revoyez, actualisez et republier avec nouvelle date', 4)
    }
  }

  // Lisibilité et formatage
  addItem('contenu', 'moyenne', 'Améliorer la lisibilité du contenu',
    'Utilisez du formatage: listes, gras, italique.',
    'Meilleure expérience utilisateur et temps sur page', 45, 'moyen', 45,
    'Ajoutez des listes à puces, gras pour les idées clés, paragraphes courts', 3)

  // ===== PERFORMANCE =====
  const loadTime = auditData?.performance?.loadTime || auditData?.performance?.ttfb || 0

  if (loadTime > 3000) {
    addItem('performance', 'critique', 'Réduire le temps de chargement',
      `Chargement: ${(loadTime / 1000).toFixed(1)}s. Google recommande < 2.5s.`,
      '53% des utilisateurs quittent après 3s (CRO majeur)', 90, 'eleve', 480,
      'Compressez images, minifiez CSS/JS, utiliser CDN, caching', 12)
  } else if (loadTime > 1500) {
    addItem('performance', 'haute', 'Optimiser la vitesse de chargement',
      `${(loadTime / 1000).toFixed(1)}s. Perfectible selon les standards.`,
      'Core Web Vitals + UX signal pour Google', 70, 'moyen', 240,
      'Analyser avec Lighthouse, optimiser bottlenecks', 8)
  }

  // Core Web Vitals
  if (auditData?.performance?.lcp > 2500) {
    addItem('performance', 'haute', 'Optimiser le Largest Contentful Paint (LCP)',
      `LCP: ${auditData.performance.lcp}ms. Google recommande < 2.5s.`,
      'Core Web Vital critique pour le classement', 75, 'moyen', 180,
      'Optimiser serveur, preload ressources, defer JavaScript', 8)
  }

  if (auditData?.performance?.fid > 100) {
    addItem('performance', 'moyenne', 'Réduire le First Input Delay (FID)',
      `FID: ${auditData.performance.fid}ms. Devrait être < 100ms.`,
      'Meilleure interactivité et Core Web Vital', 55, 'moyen', 120,
      'Réduire JavaScript blocking, utiliser Web Workers', 5)
  }

  if (auditData?.performance?.cls > 0.1) {
    addItem('performance', 'moyenne', 'Réduire le Cumulative Layout Shift (CLS)',
      `CLS: ${auditData.performance.cls}. Devrait être < 0.1.`,
      'Stabilité visuelle et expérience utilisateur', 50, 'moyen', 90,
      'Ajouter dimensions aux images, éviter les insertions DOM', 4)
  }

  // Taille de page
  if (auditData?.performance?.pageSize > 3000000) {
    addItem('performance', 'haute', 'Réduire la taille de la page',
      `${(auditData.performance.pageSize / 1024 / 1024).toFixed(1)} MB. Excessif.`,
      'Chargement plus rapide, moins de bande passante', 65, 'moyen', 120,
      'Compressez images (WebP), minifiez, supprimez ressources inutiles', 7)
  }

  // Images sans dimensions
  if (auditData?.performance?.imagesWithoutDimensions > 0) {
    addItem('performance', 'moyenne', 'Ajouter width/height aux images',
      `${auditData.performance.imagesWithoutDimensions} images sans dimensions.`,
      'Élimine le Cumulative Layout Shift', 50, 'faible', 45,
      'Spécifiez width et height pour chaque <img>', 4)
  }

  // JavaScript
  if (auditData?.performance?.renderBlockingJS > 0) {
    addItem('performance', 'moyenne', 'Éliminer le JavaScript bloquant',
      `${auditData.performance.renderBlockingJS} fichiers JS bloquent le rendering.`,
      'Chargement plus rapide de la page', 55, 'moyen', 120,
      'Defer ou async sur les scripts non-critiques', 5)
  }

  // CSS
  if (auditData?.performance?.unusedCSS > 50) {
    addItem('performance', 'basse', 'Éliminer le CSS inutilisé',
      `${auditData.performance.unusedCSS}% de CSS inutilisé.`,
      'Réduction de la taille de page', 30, 'moyen', 90,
      'Utilisez PurgeCSS ou PurgeCSS pour supprimer CSS inutile', 2)
  }

  // ===== BACKLINKS (OFF-PAGE SEO) =====
  const backlinksCount = auditData?.backlinks?.count || 0
  const qualityBacklinks = auditData?.backlinks?.quality || 0

  if (backlinksCount < 20) {
    addItem('backlinks', 'critique', 'Développer votre profil de backlinks',
      `${backlinksCount} backlinks seulement. Insuffisant pour la compétitivité.`,
      'Backlinks = #1 facteur de classement hors-page', 95, 'eleve', 600,
      'Stratégies: contenu linkable, guest posting, PR, partenariats', 20)
  } else if (backlinksCount < 100) {
    addItem('backlinks', 'haute', 'Accroître la qualité et quantité des backlinks',
      `${backlinksCount} backlinks. Bon début mais potentiel énorme.`,
      'Plus de liens = plus haut classement', 80, 'eleve', 480,
      'Prospectez sites de DA > 40 dans votre secteur', 15)
  }

  if (qualityBacklinks < backlinksCount * 0.3) {
    addItem('backlinks', 'haute', 'Améliorer la qualité des backlinks',
      'Beaucoup de liens de faible qualité. Qualité > quantité.',
      'Évite les pénalités, maximise l\'impact SEO', 70, 'moyen', 240,
      'Visez des liens de domaines avec DA > 40', 10)
  }

  if (auditData?.backlinks?.toxicCount > 0) {
    addItem('backlinks', 'haute', 'Disavow les liens toxiques',
      `${auditData.backlinks.toxicCount} liens potentiellement toxiques.`,
      'Protège contre les pénalités Google', 65, 'moyen', 60,
      'Utilisez Google Search Console > Disavow Links', 6)
  }

  addItem('backlinks', 'moyenne', 'Créer du contenu hautement linkable',
    'Produisez des actifs que les autres veulent linkuer.',
    'Attirez les links naturellement sans outreach', 60, 'eleve', 240,
    'Données originales, guides complets, recherche unique', 8)

  // ===== AI VISIBILITY =====
  if (auditData?.aiVisibility?.mentionRate < 30) {
    addItem('ai-visibility', 'haute', 'Optimiser pour les LLM et AI Engines',
      'Peu de citations dans les réponses LLM actuelles.',
      'Les LLM citent les sources structurées et autoritaires', 75, 'moyen', 180,
      'FAQ structurées, schema.org, contenu factuel avec sources', 9)
  }

  addItem('ai-visibility', 'moyenne', 'Créer du contenu E-E-A-T',
    'Démontrez Expertise, Expérience, Autorité, Fiabilité.',
    'Les LLM privilégient les sources autoritaires', 65, 'eleve', 240,
    'Biographies d\'auteur, certifications, témoignages, données primaires', 8)

  addItem('ai-visibility', 'basse', 'Soumettre au web de l\'IA',
    'Enregistrez-vous dans les annuaires d\'IA.',
    'Augmente la visibilité dans les agrégateurs d\'IA', 30, 'faible', 30,
    'Perplexity Pages, OpenAI directory, etc.', 1)

  // ===== MOBILE =====
  if (!auditData?.mobile?.viewport) {
    addItem('mobile', 'critique', 'Ajouter la balise meta viewport',
      'Pas de viewport meta. Site non mobile-friendly.',
      'Mobile-first indexing = critique', 90, 'faible', 5,
      '<meta name="viewport" content="width=device-width, initial-scale=1">', 10)
  }

  if (auditData?.mobile?.pageSpeedScore < 50) {
    addItem('mobile', 'haute', 'Optimiser la performance mobile',
      `Score mobile: ${auditData.mobile.pageSpeedScore}. Google priorise mobile.`,
      'Ranking mobile est dominant depuis 2020', 75, 'moyen', 180,
      'Testez sur PageSpeed Insights, suivez les recommandations', 9)
  }

  if (auditData?.mobile?.textTooSmall > 0) {
    addItem('mobile', 'moyenne', 'Augmenter la taille du texte mobile',
      'Texte trop petit sur mobile.',
      'Meilleure UX et Core Web Vitals', 45, 'faible', 30,
      'Minimum 16px pour le corps texte sur mobile', 2)
  }

  // ===== UX =====
  addItem('ux', 'moyenne', 'Améliorer le maillage interne',
    'Liez intelligemment vos pages importantes entre elles.',
    'Distribution du PageRank + navigation + temps sur site', 60, 'moyen', 120,
    'Ancres descriptives, 3-5 liens internes par page', 6)

  addItem('ux', 'basse', 'Optimiser le breadcrumb',
    'Ajouter navigation par fil d\'Ariane.',
    'UX + rich snippets dans Google', 35, 'faible', 30,
    'Schema.org BreadcrumbList avec liens cliquables', 2)

  // Filtre par catégorie si demandé
  let filtered = items
  if (category) {
    filtered = items.filter(item => item.category === category)
  }

  // Trier par priorité
  return filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Calcule le score SEO global avec analyse de catégories
 */
export function calculateSEOScore(auditData: any): SEOScoreBreakdown {
  const categoryScores = calculateCategoryScores(auditData)

  // Calcul pondéré du score global
  let totalScore = 0
  Object.entries(categoryWeights).forEach(([category, weight]) => {
    totalScore += (categoryScores[category] || 50) * weight
  })

  totalScore = Math.round(totalScore)

  // Détermination de la grade
  const grade = totalScore >= 90 ? 'A+' :
                totalScore >= 80 ? 'A' :
                totalScore >= 70 ? 'B' :
                totalScore >= 60 ? 'C' :
                totalScore >= 40 ? 'D' : 'F'

  // Détection de la tendance
  const trend = auditData?.trend === 'improving' ? 'improving' :
                auditData?.trend === 'declining' ? 'declining' : 'stable'

  // Forces et faiblesses
  const sorted = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)

  const strengths = sorted
    .filter(([, score]) => score >= 75)
    .slice(0, 3)
    .map(([cat]) => categoryLabels[cat])

  const weaknesses = sorted
    .filter(([, score]) => score < 70)
    .slice(0, 3)
    .map(([cat]) => categoryLabels[cat])

  // Percentile vs benchmark
  const industryAvg = auditData?.industry ?
    (industryBenchmarks[auditData.industry]?.medianScore || 70) : 70
  const benchmarkPercentile = totalScore >= industryAvg ? 75 : 50

  return {
    totalScore,
    grade,
    trend,
    categoryScores,
    strengths,
    weaknesses,
    benchmarkPercentile,
  }
}

/**
 * Génère un plan d'action structuré et prioritaire
 */
export function generateActionPlan(auditData: any, goals: SEOGoal[] = []): ActionPlan {
  const checklist = generateChecklist(auditData)

  // Séparer les actions par timeline
  const quickWins = checklist.filter(
    item => item.effort === 'faible' && item.impactScore >= 60
  ).slice(0, 5)

  const shortTerm = checklist.filter(
    item => item.estimatedMinutes <= 120 &&
            !quickWins.includes(item) &&
            item.priority !== 'critique'
  ).slice(0, 8)

  const mediumTerm = checklist.filter(
    item => item.estimatedMinutes > 120 && item.estimatedMinutes <= 480 &&
            !quickWins.concat(shortTerm).includes(item)
  ).slice(0, 8)

  const longTerm = checklist.filter(
    item => item.estimatedMinutes > 480 &&
            !quickWins.concat(shortTerm).concat(mediumTerm).includes(item)
  )

  // Calculer temps total et gain de score attendu
  const allActions = quickWins.concat(shortTerm).concat(mediumTerm).concat(longTerm)
  const estimatedTotalTime = allActions.reduce((sum, item) => sum + item.estimatedMinutes, 0) / 60
  const estimatedScoreGain = allActions.reduce((sum, item) => sum + (item.expectedGain || 0), 0)

  return {
    quickWins,
    shortTerm,
    mediumTerm,
    longTerm,
    estimatedTotalTime,
    estimatedScoreGain,
  }
}

/**
 * Définit des objectifs SEO intelligents et mesurables
 */
export function setGoals(currentData: any, targets?: any): SEOGoal[] {
  const goals: SEOGoal[] = []
  let id = 0

  const score = currentData?.score || 50
  const targetScore = targets?.score || Math.min(100, score + 20)

  // Objectif score global
  const scoreGap = targetScore - score
  const weeksToTarget = Math.ceil(scoreGap / 2) // ~2 points par semaine est réaliste

  goals.push({
    id: `goal-${++id}`,
    title: 'Score SEO global',
    current: score,
    target: targetScore,
    unit: '/100',
    category: 'global',
    progress: (score / targetScore) * 100,
    estimatedWeeks: weeksToTarget,
    deadline: new Date(Date.now() + weeksToTarget * 7 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: generateMilestones(score, targetScore, weeksToTarget),
  })

  // Objectif performance (LCP)
  if (currentData?.performance?.lcp || currentData?.performance?.loadTime) {
    const currentLCP = currentData?.performance?.lcp || currentData?.performance?.loadTime || 3000
    const targetLCP = Math.max(1200, currentLCP * 0.6) // Réduction de 40%
    const lcpWeeks = Math.ceil((currentLCP - targetLCP) / 200) // 200ms par semaine

    goals.push({
      id: `goal-${++id}`,
      title: 'Largest Contentful Paint (LCP)',
      current: currentLCP,
      target: targetLCP,
      unit: 'ms',
      category: 'performance',
      progress: 100 - ((currentLCP - targetLCP) / currentLCP * 100),
      estimatedWeeks: lcpWeeks,
      deadline: new Date(Date.now() + lcpWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  // Objectif mots-cles
  const top10Keywords = currentData?.keywords?.top10 || 0
  const targetTop10 = top10Keywords + Math.max(5, Math.floor(top10Keywords * 0.5))

  goals.push({
    id: `goal-${++id}`,
    title: 'Mots-clés en position top 10',
    current: top10Keywords,
    target: targetTop10,
    unit: 'mots-clés',
    category: 'keywords',
    progress: (top10Keywords / targetTop10) * 100,
    estimatedWeeks: 12, // Ranking typically takes 8-12 weeks
    deadline: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Objectif backlinks qualite
  const qualityBacklinks = currentData?.backlinks?.quality || 0
  const targetQualityBacklinks = qualityBacklinks + Math.max(10, Math.floor(qualityBacklinks * 0.5))

  goals.push({
    id: `goal-${++id}`,
    title: 'Backlinks qualité (DA > 40)',
    current: qualityBacklinks,
    target: targetQualityBacklinks,
    unit: 'liens',
    category: 'backlinks',
    progress: (qualityBacklinks / targetQualityBacklinks) * 100,
    estimatedWeeks: 16,
    deadline: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  // Objectif visibilité IA
  const aiMentionRate = currentData?.aiVisibility?.mentionRate || 20
  const targetAIMentionRate = Math.min(100, aiMentionRate + 30)
  const aiWeeks = Math.ceil((targetAIMentionRate - aiMentionRate) / 3)

  goals.push({
    id: `goal-${++id}`,
    title: 'Taux de citation dans les LLM',
    current: aiMentionRate,
    target: targetAIMentionRate,
    unit: '%',
    category: 'ai-visibility',
    progress: (aiMentionRate / targetAIMentionRate) * 100,
    estimatedWeeks: aiWeeks,
    deadline: new Date(Date.now() + aiWeeks * 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  return goals
}

/**
 * Suit la progression vers les objectifs
 */
export function trackProgress(historicalData: any[], goals: SEOGoal[]): ProgressTracking[] {
  if (!historicalData || historicalData.length === 0) {
    return []
  }

  const tracking: ProgressTracking[] = []
  const latest = historicalData[historicalData.length - 1]
  const earliest = historicalData[0]

  goals.forEach(goal => {
    const currentValue = latest?.[goal.category]?.current || goal.current
    const timeElapsed = historicalData.length * 7 // Assuming weekly data
    const timeRemaining = (goal.estimatedWeeks || 12) - (timeElapsed / 7)

    // Calculer la vélocité (progression par semaine)
    let velocityPerWeek = 0
    if (historicalData.length > 1) {
      const valueGain = (latest?.[goal.category]?.current || goal.current) -
                        (earliest?.[goal.category]?.current || goal.current)
      velocityPerWeek = valueGain / (historicalData.length - 1)
    }

    const progress = Math.min(100, (currentValue / goal.target) * 100)
    const expectedDate = new Date(Date.now() + timeRemaining * 7 * 24 * 60 * 60 * 1000)

    // Vérifier si on est en bonne voie
    const expectedProgress = (timeElapsed / ((goal.estimatedWeeks || 12) * 7)) * 100
    const onTrack = progress >= expectedProgress * 0.8 // 80% de la progression attendue

    tracking.push({
      goalId: goal.id,
      currentValue,
      targetValue: goal.target,
      progress,
      weeksElapsed: timeElapsed / 7,
      weeksRemaining: Math.max(0, timeRemaining),
      expectedCompletionDate: expectedDate,
      velocityPerWeek,
      onTrack,
    })
  })

  return tracking
}

/**
 * Estime le timeline pour atteindre un score cible
 */
export function estimateTimeline(currentScore: number, targetScore: number): {
  weeksEstimate: number,
  monthsEstimate: number,
  expectedDate: Date,
  quarterlyMilestones: Array<{ quarter: number, expectedScore: number }>
} {
  const scoreGap = Math.max(0, targetScore - currentScore)
  const weeksPerPoint = 0.5 // Empiriquement: ~0.5 semaine par point de score
  const weeksEstimate = Math.ceil(scoreGap * weeksPerPoint)
  const monthsEstimate = Math.ceil(weeksEstimate / 4.33)
  const expectedDate = new Date(Date.now() + weeksEstimate * 7 * 24 * 60 * 60 * 1000)

  const quarterlyMilestones: Array<{ quarter: number, expectedScore: number }> = []
  for (let q = 1; q <= 4; q++) {
    quarterlyMilestones.push({
      quarter: q,
      expectedScore: Math.min(targetScore, currentScore + (scoreGap * q / 4)),
    })
  }

  return {
    weeksEstimate,
    monthsEstimate,
    expectedDate,
    quarterlyMilestones,
  }
}

/**
 * Identifie les quick wins (impact fort, effort faible)
 */
export function getQuickWins(auditData: any): ChecklistItem[] {
  const checklist = generateChecklist(auditData)
  return checklist.filter(
    item => item.effort === 'faible' && item.impactScore >= 60
  ).slice(0, 10)
}

/**
 * Retourne les benchmarks d'industrie
 */
export function getBenchmarks(industry?: string): IndustryBenchmarks | Record<string, IndustryBenchmarks> {
  if (industry && industryBenchmarks[industry]) {
    return industryBenchmarks[industry]
  }
  return industryBenchmarks
}

// ============= FONCTIONS HELPERS PRIVÉES =============

function calculateCategoryScores(auditData: any): Record<string, number> {
  const scores: Record<string, number> = {}

  // TECHNIQUE
  let techScore = 70
  if (!auditData?.meta?.title) techScore -= 15
  if (!auditData?.meta?.description) techScore -= 15
  if (!auditData?.meta?.canonical) techScore -= 10
  if (!auditData?.technical?.https) techScore -= 20
  if (!auditData?.technical?.structuredData) techScore -= 15
  if (!auditData?.technical?.robotsTxt) techScore -= 5
  if (!auditData?.technical?.sitemap) techScore -= 5
  scores.technique = Math.max(0, Math.min(100, techScore))

  // CONTENU
  let contentScore = 70
  const wordCount = auditData?.content?.wordCount || 0
  if (wordCount < 300) contentScore -= 25
  else if (wordCount < 800) contentScore -= 15
  if (!auditData?.content?.h1) contentScore -= 15
  if (auditData?.content?.h1Count > 1) contentScore -= 5
  if (auditData?.content?.imagesWithoutAlt > 0) contentScore -= 10
  scores.contenu = Math.max(0, Math.min(100, contentScore))

  // PERFORMANCE
  let perfScore = 70
  const loadTime = auditData?.performance?.loadTime || 0
  if (loadTime > 3000) perfScore -= 25
  else if (loadTime > 1500) perfScore -= 15
  if (auditData?.performance?.lcp > 2500) perfScore -= 15
  if (auditData?.performance?.cls > 0.1) perfScore -= 10
  if (auditData?.performance?.pageSize > 3000000) perfScore -= 10
  scores.performance = Math.max(0, Math.min(100, perfScore))

  // BACKLINKS
  const backlinksCount = auditData?.backlinks?.count || 0
  let backScore = 50 + Math.min(40, backlinksCount / 5) // Scale: 5 liens = 1 point
  if (auditData?.backlinks?.toxicCount > 0) backScore -= 10
  const qualityRatio = auditData?.backlinks?.quality ? auditData.backlinks.quality / backlinksCount : 0.3
  if (qualityRatio < 0.3) backScore -= 10
  scores.backlinks = Math.max(0, Math.min(100, backScore))

  // AI VISIBILITY
  const aiMentionRate = auditData?.aiVisibility?.mentionRate || 0
  let aiScore = 30 + (aiMentionRate * 0.7)
  if (auditData?.technical?.structuredData) aiScore += 15
  scores['ai-visibility'] = Math.max(0, Math.min(100, aiScore))

  // SECURITE
  let secScore = 100
  if (!auditData?.technical?.https) secScore -= 50
  scores.securite = secScore

  // MOBILE
  let mobileScore = 70
  if (!auditData?.mobile?.viewport) mobileScore -= 30
  if (auditData?.mobile?.pageSpeedScore < 50) mobileScore -= 20
  scores.mobile = Math.max(0, Math.min(100, mobileScore))

  // UX
  let uxScore = 75
  if (!auditData?.ux?.internalLinking) uxScore -= 15
  if (!auditData?.ux?.breadcrumb) uxScore -= 10
  scores.ux = Math.max(0, Math.min(100, uxScore))

  return scores
}

function findTechnicalIssues(auditData: any): any[] {
  const issues: any[] = []

  if (!auditData?.meta?.title) {
    issues.push({
      priority: 'critique',
      title: 'Balise title manquante',
      description: 'Aucune balise title détectée.',
      steps: [
        'Accès au <head> de votre page',
        'Ajouter <title>Votre titre de 50-60 caractères</title>',
        'Incluez votre mot-clé principal',
        'Validez avec un outil SEO',
      ],
      timelineWeeks: 1,
      effort: 'faible',
      expectedGain: 8,
      relatedKeywords: ['title tag', 'on-page SEO'],
    })
  }

  if (!auditData?.technical?.https) {
    issues.push({
      priority: 'critique',
      title: 'Certificat SSL manquant (HTTP vs HTTPS)',
      description: 'Le site n\'utilise pas HTTPS, signal de classement important.',
      steps: [
        'Achetez un certificat SSL (souvent ~15$/an)',
        'Installez le certificat sur votre serveur',
        'Configurez les redirections HTTP -> HTTPS',
        'Mettez à jour les URL internes',
        'Submitez la propriété HTTPS dans GSC',
      ],
      timelineWeeks: 2,
      effort: 'eleve',
      expectedGain: 15,
      relatedKeywords: ['HTTPS', 'SSL certificate', 'site security'],
    })
  }

  if (!auditData?.technical?.structuredData) {
    issues.push({
      priority: 'haute',
      title: 'Données structurées Schema.org manquantes',
      description: 'Aucune données structurées JSON-LD détectées.',
      steps: [
        'Identifiez le type de page (Article, Product, Organization, etc.)',
        'Générez JSON-LD structuré avec schema.org',
        'Incluez dans le <head> avec <script type="application/ld+json">',
        'Validez avec Google Rich Result Tester',
        'Testez les rich snippets',
      ],
      timelineWeeks: 2,
      effort: 'moyen',
      expectedGain: 10,
      relatedKeywords: ['structured data', 'JSON-LD', 'rich snippets'],
    })
  }

  return issues
}

function findContentIssues(auditData: any): any[] {
  const issues: any[] = []
  const wordCount = auditData?.content?.wordCount || 0

  if (wordCount < 300) {
    issues.push({
      priority: 'critique',
      title: 'Contenu trop court',
      description: `Seulement ${wordCount} mots. Les résultats top 10 ont en moyenne 1400+ mots.`,
      steps: [
        'Expandez les sections existantes',
        'Ajoutez des sous-sections abordant des sujets connexes',
        'Incluez des données, citations, exemples',
        'Visez minimum 800 mots, idéalement 1200-1500',
        'Maintenez la qualité plutôt que de remplir',
      ],
      timelineWeeks: 2,
      effort: 'eleve',
      expectedGain: 12,
      relatedKeywords: ['content length', 'word count', 'content depth'],
    })
  }

  if (!auditData?.content?.h1) {
    issues.push({
      priority: 'critique',
      title: 'Titre H1 manquant',
      description: 'Aucun H1 détecté. Structure critique pour le SEO.',
      steps: [
        'Identifiez le titre principal de la page',
        'Encapsulez avec <h1>Votre titre principal</h1>',
        'Un seul H1 par page',
        'Incluez votre mot-clé principal',
        'Assurez-vous qu\'il a du sens pour les utilisateurs',
      ],
      timelineWeeks: 1,
      effort: 'faible',
      expectedGain: 8,
      relatedKeywords: ['H1 tag', 'page structure', 'heading hierarchy'],
    })
  }

  return issues
}

function findPerformanceIssues(auditData: any): any[] {
  const issues: any[] = []
  const loadTime = auditData?.performance?.loadTime || 0

  if (loadTime > 3000) {
    issues.push({
      priority: 'critique',
      title: 'Temps de chargement critique',
      description: `Le site met ${(loadTime / 1000).toFixed(1)}s à charger. Cible: < 2.5s.`,
      steps: [
        'Compressez les images (WebP, tinypng)',
        'Minifiez CSS et JavaScript',
        'Utilisez un CDN pour les fichiers statiques',
        'Activez la compression gzip/brotli',
        'Utilisez la mise en cache du navigateur',
        'Différez les scripts non-critiques',
      ],
      timelineWeeks: 4,
      effort: 'eleve',
      expectedGain: 12,
      relatedKeywords: ['page speed', 'Core Web Vitals', 'performance optimization'],
    })
  }

  return issues
}

function generateMilestones(currentScore: number, targetScore: number, weeks: number): Milestone[] {
  const milestones: Milestone[] = []
  const scoreGap = targetScore - currentScore

  for (let w = 1; w <= Math.min(weeks, 8); w++) {
    const weekInterval = Math.ceil(weeks / 4)
    if (w % weekInterval === 0 || w === weeks) {
      milestones.push({
        week: w,
        target: Math.round(currentScore + (scoreGap * w / weeks)),
        description: `Semaine ${w}: Continuer avec les actions programmées`,
      })
    }
  }

  return milestones
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  if (minutes < 120) return `${Math.floor(minutes / 60)}h`
  return `${Math.floor(minutes / 60)}h${minutes % 60 > 0 ? ` ${minutes % 60}m` : ''}`
}

export { categoryLabels }
