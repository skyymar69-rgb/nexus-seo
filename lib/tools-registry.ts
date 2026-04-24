// ============================================
// NEXUS SEO - Tools Registry
// Complete registry of 56 SEO tools organized by category
// ============================================

import { ToolDefinition, ToolCategory } from '@/types/tools'

// ===== TECHNICAL SEO TOOLS (12) =====
const technicalSEOTools: ToolDefinition[] = [
  {
    id: 'site-audit',
    name: 'Audit de Site',
    description: 'Analysez votre site web complet et obtenez un score SEO détaillé avec priorités',
    category: 'technical-seo',
    icon: 'CheckCircle2',
    route: '/tools/site-audit',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse complète du site',
      'Détection des erreurs',
      'Score SEO',
      'Rapports détaillés'
    ],
  },
  {
    id: 'website-crawler',
    name: 'Crawleur de Site',
    description: 'Explorez tous les URL de votre site et analysez les liens et métadonnées',
    category: 'technical-seo',
    icon: 'Spider',
    route: '/tools/website-crawler',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Crawl illimité',
      'Analyse des liens internes',
      'Extraction de métadonnées',
      'Visualisation de structure'
    ],
  },
  {
    id: 'core-web-vitals',
    name: 'Core Web Vitals',
    description: 'Mesurez les métriques essentielles de performances Web (LCP, FID, CLS)',
    category: 'technical-seo',
    icon: 'Zap',
    route: '/tools/core-web-vitals',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Mesure LCP',
      'Mesure FID',
      'Mesure CLS',
      'Recommandations'
    ],
  },
  {
    id: 'robots-txt-analyzer',
    name: 'Analyseur Robots.txt',
    description: 'Validez et optimisez votre fichier robots.txt pour une indexation efficace',
    category: 'technical-seo',
    icon: 'Shield',
    route: '/tools/robots-txt-analyzer',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Validation de syntaxe',
      'Directives analysées',
      'Recommandations SEO',
      'Prévisualisation'
    ],
  },
  {
    id: 'sitemap-analyzer',
    name: 'Analyseur Sitemap',
    description: 'Vérifiez votre sitemap XML et optimisez la découverte de vos pages',
    category: 'technical-seo',
    icon: 'Map',
    route: '/tools/sitemap-analyzer',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Validation XML',
      'Contrôle des URL',
      'Analyse de priorité',
      'Vérification de disponibilité'
    ],
  },
  {
    id: 'ssl-security-checker',
    name: 'Vérificateur SSL/Sécurité',
    description: 'Analysez la sécurité SSL, les certificats et les en-têtes de sécurité',
    category: 'technical-seo',
    icon: 'Lock',
    route: '/tools/ssl-security-checker',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Validation SSL',
      'Vérification des certificats',
      'Analyse des en-têtes',
      'Score de sécurité'
    ],
  },
  {
    id: 'mobile-friendliness',
    name: 'Test Convivialité Mobile',
    description: 'Vérifiez que votre site est optimisé pour les appareils mobiles',
    category: 'technical-seo',
    icon: 'Smartphone',
    route: '/tools/mobile-friendliness',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Test de compatibilité',
      'Analyse du viewport',
      'Détection des problèmes',
      'Recommandations'
    ],
  },
  {
    id: 'structured-data-validator',
    name: 'Validateur Données Structurées',
    description: 'Validez vos marquages Schema.org et données structurées',
    category: 'technical-seo',
    icon: 'Code2',
    route: '/tools/structured-data-validator',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Validation Schema.org',
      'Détection des erreurs',
      'Rich snippets',
      'Recommandations'
    ],
  },
  {
    id: 'http-headers-analyzer',
    name: 'Analyseur En-têtes HTTP',
    description: 'Analysez tous les en-têtes HTTP pour optimiser les performances et la sécurité',
    category: 'technical-seo',
    icon: 'Settings',
    route: '/tools/http-headers-analyzer',
    isPro: false,
    isNew: true,
    comingSoon: false,
    features: [
      'Analyse complète des en-têtes',
      'Détection des problèmes',
      'Recommandations',
      'Tests de cache'
    ],
  },
  {
    id: 'redirect-chain-checker',
    name: 'Vérificateur de Chaînes de Redirection',
    description: 'Détecter et analyser les chaînes de redirections inutiles',
    category: 'technical-seo',
    icon: 'ArrowRight',
    route: '/tools/redirect-chain-checker',
    isPro: false,
    isNew: true,
    comingSoon: false,
    features: [
      'Détection de chaînes',
      'Analyse de types',
      'Impact sur le crawl',
      'Recommandations'
    ],
  },
  {
    id: 'broken-link-checker',
    name: 'Vérificateur Liens Cassés',
    description: 'Trouvez tous les liens cassés (404) internes et externes',
    category: 'technical-seo',
    icon: 'AlertCircle',
    route: '/tools/broken-link-checker',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Scan complet',
      'Classification par type',
      'Export des liens',
      'Monitoring continu'
    ],
  },
  {
    id: 'page-speed-optimizer',
    name: 'Optimiseur Vitesse de Page',
    description: 'Obtenez des recommandations détaillées pour améliorer la vitesse de chargement',
    category: 'technical-seo',
    icon: 'Rocket',
    route: '/tools/page-speed-optimizer',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse de performance',
      'Compression d\'images',
      'Optimisation JS/CSS',
      'Recommandations prioritaires'
    ],
  },
]

// ===== ON-PAGE SEO TOOLS (8) =====
const onPageSEOTools: ToolDefinition[] = [
  {
    id: 'meta-tags-analyzer',
    name: 'Analyseur Balises Meta',
    description: 'Analysez et optimisez vos balises meta, title et description',
    category: 'on-page-seo',
    icon: 'FileText',
    route: '/tools/meta-tags-analyzer',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse des titles',
      'Analyse des descriptions',
      'Détection des doublons',
      'Recommandations de longueur'
    ],
  },
  {
    id: 'content-optimizer',
    name: 'Optimiseur de Contenu',
    description: 'Optimisez votre contenu pour les mots-clés cibles et la lisibilité',
    category: 'on-page-seo',
    icon: 'BookOpen',
    route: '/tools/content-optimizer',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse de mots-clés',
      'Conseils de rédaction',
      'Score de lisibilité',
      'Suggestions d\'amélioration'
    ],
  },
  {
    id: 'heading-structure',
    name: 'Analyseur Structure Titres',
    description: 'Vérifiez la hiérarchie H1-H6 et l\'optimisation des en-têtes',
    category: 'on-page-seo',
    icon: 'Heading2',
    route: '/tools/heading-structure',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Hiérarchie validée',
      'Détection des H1 dupliqués',
      'Suggestions de titre',
      'Visualisation de structure'
    ],
  },
  {
    id: 'image-optimization',
    name: 'Optimiseur Images',
    description: 'Analysez et optimisez vos images pour le SEO et les performances',
    category: 'on-page-seo',
    icon: 'Image',
    route: '/tools/image-optimization',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Détection alt text manquant',
      'Analyse de compression',
      'Recommandations de format',
      'Suggestions de nom de fichier'
    ],
  },
  {
    id: 'internal-link-analyzer',
    name: 'Analyseur Liens Internes',
    description: 'Analysez votre profil de lien interne et optimisez la distribution',
    category: 'on-page-seo',
    icon: 'Link2',
    route: '/tools/internal-link-analyzer',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Cartographie de liens',
      'Analyse d\'ancres',
      'Détection d\'orphelins',
      'Recommandations de liaison'
    ],
  },
  {
    id: 'keyword-density',
    name: 'Densité de Mots-clés',
    description: 'Mesurez la densité de vos mots-clés et optimisez la fréquence',
    category: 'on-page-seo',
    icon: 'BarChart3',
    route: '/tools/keyword-density',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse de densité',
      'Termes connexes',
      'Recommandations',
      'Comparaison concurrents'
    ],
  },
  {
    id: 'readability-score',
    name: 'Score de Lisibilité',
    description: 'Mesurez la lisibilité et l\'accessibilité de votre contenu',
    category: 'on-page-seo',
    icon: 'Eye',
    route: '/tools/readability-score',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Flesch Kincaid',
      'Analyse de phrases',
      'Recommandations',
      'Métriques détaillées'
    ],
  },
  {
    id: 'schema-markup-generator',
    name: 'Générateur Schema Markup',
    description: 'Générez et optimisez vos marquages Schema pour les rich snippets',
    category: 'on-page-seo',
    icon: 'Code2',
    route: '/tools/schema-markup-generator',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Générateur assisté',
      'Templates populaires',
      'Validation du code',
      'Rich snippets preview'
    ],
  },
]

// ===== KEYWORDS TOOLS (6) =====
const keywordsTools: ToolDefinition[] = [
  {
    id: 'keyword-research',
    name: 'Recherche de Mots-clés',
    description: 'Découvrez des mots-clés pertinents avec volume, difficulté et CPC',
    category: 'keywords',
    icon: 'Search',
    route: '/tools/keyword-research',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Suggestions de mots-clés',
      'Volume de recherche',
      'Difficulté SEO',
      'Analyse d\'intention'
    ],
  },
  {
    id: 'rank-tracker',
    name: 'Suivi des Classements',
    description: 'Suivez vos positions de classement et analysez les tendances',
    category: 'keywords',
    icon: 'TrendingUp',
    route: '/tools/rank-tracker',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Suivi quotidien',
      'Historique des positions',
      'Alertes de changement',
      'Comparaison concurrents'
    ],
  },
  {
    id: 'keyword-gap-analysis',
    name: 'Analyse Écart Mots-clés',
    description: 'Trouvez les mots-clés que vos concurrents classent mais pas vous',
    category: 'keywords',
    icon: 'GitCompare',
    route: '/tools/keyword-gap-analysis',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Mots-clés manquants',
      'Opportunités rapides',
      'Volume d\'opportunité',
      'Analyse de difficulté'
    ],
  },
  {
    id: 'long-tail-finder',
    name: 'Outil Longue Traîne',
    description: 'Découvrez les mots-clés longue traîne moins compétitifs',
    category: 'keywords',
    icon: 'MessageSquare',
    route: '/tools/long-tail-finder',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Génération de variations',
      'Analyse de longueur',
      'Volume par phrase',
      'Recommandations'
    ],
  },
  {
    id: 'question-keywords',
    name: 'Mots-clés Sous Forme de Questions',
    description: 'Trouvez les questions que posent les utilisateurs sur vos sujets',
    category: 'keywords',
    icon: 'HelpCircle',
    route: '/tools/question-keywords',
    isPro: false,
    isNew: true,
    comingSoon: false,
    features: [
      'Extraction de questions',
      'Variations de questions',
      'Volume de recherche',
      'FAQ suggestions'
    ],
  },
  {
    id: 'keyword-clustering',
    name: 'Regroupement de Mots-clés',
    description: 'Groupez les mots-clés par intention et similarité pour l\'organisation',
    category: 'keywords',
    icon: 'Layers',
    route: '/tools/keyword-clustering',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Clustering automatique',
      'Groupes par intention',
      'Suggestions de pages',
      'Visualisation interactive'
    ],
  },
]

// ===== BACKLINKS TOOLS (5) =====
const backlinksTools: ToolDefinition[] = [
  {
    id: 'backlink-analyzer',
    name: 'Analyseur Backlinks',
    description: 'Analysez votre profil de backlinks en détail',
    category: 'backlinks',
    icon: 'Link',
    route: '/tools/backlink-analyzer',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Profil de backlinks',
      'Autorité de domaine',
      'Ancres texte',
      'Types de liens'
    ],
  },
  {
    id: 'backlink-monitor',
    name: 'Moniteur de Backlinks',
    description: 'Suivez les nouveaux backlinks et les liens perdus en temps réel',
    category: 'backlinks',
    icon: 'AlertCircle',
    route: '/tools/backlink-monitor',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Nouveaux backlinks',
      'Liens perdus',
      'Alertes en temps réel',
      'Historique détaillé'
    ],
  },
  {
    id: 'toxic-link-detector',
    name: 'Détecteur de Liens Toxiques',
    description: 'Identifiez et analysez les backlinks potentiellement nuisibles',
    category: 'backlinks',
    icon: 'AlertTriangle',
    route: '/tools/toxic-link-detector',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Détection d\'anomalies',
      'Score de toxicité',
      'Recommandations',
      'Suivi de récupération'
    ],
  },
  {
    id: 'link-intersect',
    name: 'Intersection de Liens',
    description: 'Trouvez les domaines qui créent des liens vers vos concurrents',
    category: 'backlinks',
    icon: 'Share2',
    route: '/tools/link-intersect',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Domaines concurrents',
      'Analyse d\'opportunité',
      'Contact d\'outreach',
      'Potentiel de liaison'
    ],
  },
  {
    id: 'anchor-text-analysis',
    name: 'Analyse Texte d\'Ancre',
    description: 'Analysez votre distribution de texte d\'ancre pour l\'optimisation',
    category: 'backlinks',
    icon: 'Type',
    route: '/tools/anchor-text-analysis',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Distribution d\'ancres',
      'Types d\'ancres',
      'Recommandations',
      'Comparaison concurrents'
    ],
  },
]

// ===== CONTENT TOOLS (5) =====
const contentTools: ToolDefinition[] = [
  {
    id: 'content-gap-analysis',
    name: 'Analyse Écart Contenu',
    description: 'Découvrez les lacunes dans votre couverture de contenu',
    category: 'content',
    icon: 'BookMarked',
    route: '/tools/content-gap-analysis',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse d\'audience',
      'Sujets manquants',
      'Recommandations',
      'Planification contenu'
    ],
  },
  {
    id: 'ai-content-generator',
    name: 'Générateur de Contenu IA',
    description: 'Générez du contenu SEO optimisé avec l\'IA',
    category: 'content',
    icon: 'Sparkles',
    route: '/tools/ai-content-generator',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Génération assistée',
      'Optimisation SEO',
      'Variations multiples',
      'Édition interactive'
    ],
  },
  {
    id: 'content-calendar',
    name: 'Calendrier Éditorial',
    description: 'Planifiez et gérez votre calendrier de contenu',
    category: 'content',
    icon: 'Calendar',
    route: '/tools/content-calendar',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Calendrier visuel',
      'Collaboration d\'équipe',
      'Rappels de publication',
      'Analytics intégrées'
    ],
  },
  {
    id: 'duplicate-content-checker',
    name: 'Vérificateur Contenu Dupliqué',
    description: 'Détectez le contenu dupliqué interne et externe',
    category: 'content',
    icon: 'Copy',
    route: '/tools/duplicate-content-checker',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Détection interne',
      'Détection externe',
      'Scores de similarité',
      'Recommandations'
    ],
  },
  {
    id: 'content-score-grader',
    name: 'Évaluateur Score Contenu',
    description: 'Obtenez un score global et des recommandations pour votre contenu',
    category: 'content',
    icon: 'Award',
    route: '/tools/content-score-grader',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Score global',
      'Répartition détaillée',
      'Benchmarking',
      'Plan d\'amélioration'
    ],
  },
]

// ===== COMPETITORS TOOLS (4) =====
const competitorsTools: ToolDefinition[] = [
  {
    id: 'competitor-overview',
    name: 'Aperçu Concurrents',
    description: 'Obtenez une vue d\'ensemble complète de vos concurrents',
    category: 'competitors',
    icon: 'Users',
    route: '/tools/competitor-overview',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse de marché',
      'Métriques clés',
      'Benchmarking',
      'Suivi de tendances'
    ],
  },
  {
    id: 'competitor-keyword-gap',
    name: 'Écart Mots-clés Concurrents',
    description: 'Analysez les mots-clés que classent vos concurrents',
    category: 'competitors',
    icon: 'GitCompare',
    route: '/tools/competitor-keyword-gap',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Mots-clés partagés',
      'Mots-clés uniques',
      'Opportunités',
      'Stratégie concurrente'
    ],
  },
  {
    id: 'competitor-backlink-gap',
    name: 'Écart Backlinks Concurrents',
    description: 'Trouvez les domaines qui créent des liens vers vos concurrents',
    category: 'competitors',
    icon: 'Link',
    route: '/tools/competitor-backlink-gap',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Domaines concurrents',
      'Liens uniques',
      'Opportunités de liaison',
      'Analyse d\'autorité'
    ],
  },
  {
    id: 'competitor-content-analysis',
    name: 'Analyse Contenu Concurrents',
    description: 'Analysez la stratégie de contenu de vos concurrents',
    category: 'competitors',
    icon: 'BookOpen',
    route: '/tools/competitor-content-analysis',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Sujets populaires',
      'Formats de contenu',
      'Performance du contenu',
      'Tendances identifiées'
    ],
  },
]

// ===== LOCAL SEO TOOLS (3) =====
const localSEOTools: ToolDefinition[] = [
  {
    id: 'local-seo-checker',
    name: 'Vérificateur SEO Local',
    description: 'Optimisez votre présence dans les résultats de recherche locaux',
    category: 'local-seo',
    icon: 'MapPin',
    route: '/tools/local-seo-checker',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Citations locales',
      'Profil Google Business',
      'Avis et notes',
      'Optimisation locale'
    ],
  },
  {
    id: 'nap-consistency',
    name: 'Cohérence NAP',
    description: 'Vérifiez la cohérence de votre NAP (Nom, Adresse, Téléphone)',
    category: 'local-seo',
    icon: 'CheckCircle2',
    route: '/tools/nap-consistency',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Vérification NAP',
      'Citations de base de données',
      'Incohérences détectées',
      'Plan de correction'
    ],
  },
  {
    id: 'google-business-optimizer',
    name: 'Optimiseur Google Business',
    description: 'Optimisez votre profil Google Business Profile',
    category: 'local-seo',
    icon: 'Building2',
    route: '/tools/google-business-optimizer',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Audit du profil',
      'Recommandations',
      'Gestion des avis',
      'Posts et mises à jour'
    ],
  },
]

// ===== AI & GEO TOOLS (3) =====
const aiGeoTools: ToolDefinition[] = [
  {
    id: 'ai-visibility-tracker',
    name: 'Suivi Visibilité IA',
    description: 'Suivez votre visibilité dans les réponses des LLM (ChatGPT, Gemini, Claude...)',
    category: 'ai-geo',
    icon: 'Brain',
    route: '/tools/ai-visibility-tracker',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Suivi multi-LLM',
      'Analyse de mentions',
      'Contexte d\'utilisation',
      'Tendances et scores'
    ],
  },
  {
    id: 'ai-content-optimization',
    name: 'Optimisation Contenu pour IA',
    description: 'Optimisez votre contenu pour une meilleure extraction par les LLM',
    category: 'ai-geo',
    icon: 'Wand2',
    route: '/tools/ai-content-optimization',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Structure de contenu',
      'Extraction de contexte',
      'Recommandations SEO',
      'Prévisualisation IA'
    ],
  },
  {
    id: 'llm-brand-monitoring',
    name: 'Monitoring Marque LLM',
    description: 'Suivez comment votre marque est mentionnée dans les réponses IA',
    category: 'ai-geo',
    icon: 'Shield',
    route: '/tools/llm-brand-monitoring',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Mentions de marque',
      'Sentiment d\'analyse',
      'Comparaison concurrents',
      'Alertes en temps réel'
    ],
  },
]

// ===== ANALYTICS TOOLS (5) =====
const analyticsTools: ToolDefinition[] = [
  {
    id: 'traffic-analytics',
    name: 'Analytics de Trafic',
    description: 'Analyser votre trafic organique et les sources de visite',
    category: 'analytics',
    icon: 'BarChart3',
    route: '/tools/traffic-analytics',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Trafic organique',
      'Sources de trafic',
      'Tendances',
      'Conversion tracking'
    ],
  },
  {
    id: 'report-generator',
    name: 'Générateur de Rapports',
    description: 'Générez des rapports SEO personnalisés et automatisés',
    category: 'analytics',
    icon: 'FileText',
    route: '/tools/report-generator',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Rapports automatisés',
      'Branding personnalisé',
      'Distribution email',
      'Scheduling'
    ],
  },
  {
    id: 'seo-dashboard',
    name: 'Tableau de Bord SEO',
    description: 'Un tableau de bord centralisé avec tous vos métriques SEO',
    category: 'analytics',
    icon: 'LayoutGrid',
    route: '/tools/seo-dashboard',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Métriques en temps réel',
      'Widgets personnalisables',
      'Historique',
      'Alertes'
    ],
  },
  {
    id: 'log-file-analyzer',
    name: 'Analyseur Fichiers Log',
    description: 'Analysez les logs serveur pour comprendre le comportement de Googlebot',
    category: 'analytics',
    icon: 'FileJson',
    route: '/tools/log-file-analyzer',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Analyse du crawl',
      'Budget de crawl',
      'Erreurs détectées',
      'Recommandations'
    ],
  },
  {
    id: 'custom-alerts-monitoring',
    name: 'Alertes & Monitoring Personnalisés',
    description: 'Configurez des alertes personnalisées pour vos métriques critiques',
    category: 'analytics',
    icon: 'Bell',
    route: '/tools/custom-alerts-monitoring',
    isPro: true,
    isNew: true,
    comingSoon: false,
    features: [
      'Alertes personnalisées',
      'Multi-canaux',
      'Seuils configurables',
      'Historique d\'alertes'
    ],
  },
]

// ===== UTILITIES TOOLS (5) =====
const utilitiesTools: ToolDefinition[] = [
  {
    id: 'serp-simulator',
    name: 'Simulateur SERP',
    description: 'Prévisualisez comment vos pages apparaîtront dans les résultats de recherche',
    category: 'utilities',
    icon: 'Eye',
    route: '/tools/serp-simulator',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Prévisualisation SERP',
      'Éditeur de métadonnées',
      'Optimisation de CTR',
      'Variations d\'affichage'
    ],
  },
  {
    id: 'canonical-url-checker',
    name: 'Vérificateur URL Canonique',
    description: 'Vérifiez et optimisez vos URL canoniques',
    category: 'utilities',
    icon: 'Link2',
    route: '/tools/canonical-url-checker',
    isPro: false,
    isNew: false,
    comingSoon: false,
    features: [
      'Détection canonique',
      'Validation de chaînes',
      'Recommandations',
      'Audit complet'
    ],
  },
  {
    id: 'hreflang-generator',
    name: 'Générateur Hreflang',
    description: 'Générez et validez vos balises hreflang pour le multi-lingue/multi-régional',
    category: 'utilities',
    icon: 'Globe',
    route: '/tools/hreflang-generator',
    isPro: true,
    isNew: false,
    comingSoon: false,
    features: [
      'Générateur assisté',
      'Validation de code',
      'Formats alternatifs',
      'Recommandations'
    ],
  },
  {
    id: 'open-graph-previewer',
    name: 'Prévisualeur Open Graph',
    description: 'Prévisualisez et optimisez vos balises Open Graph',
    category: 'utilities',
    icon: 'Share2',
    route: '/tools/open-graph-previewer',
    isPro: false,
    isNew: true,
    comingSoon: false,
    features: [
      'Prévisualisation sociale',
      'Validation de balises',
      'Éditeur interactif',
      'Tests réseaux sociaux'
    ],
  },
  {
    id: 'social-card-previewer',
    name: 'Prévisualeur Cartes Sociales',
    description: 'Prévisualisez vos pages sur les réseaux sociaux (Twitter, Facebook, LinkedIn)',
    category: 'utilities',
    icon: 'Image',
    route: '/tools/social-card-previewer',
    isPro: false,
    isNew: true,
    comingSoon: false,
    features: [
      'Aperçu multi-réseau',
      'Recommandations',
      'Générateur de cartes',
      'Tests en temps réel'
    ],
  },
]

// ===== COMPLETE TOOLS REGISTRY =====
export const TOOLS_REGISTRY: ToolDefinition[] = [
  ...technicalSEOTools,
  ...onPageSEOTools,
  ...keywordsTools,
  ...backlinksTools,
  ...contentTools,
  ...competitorsTools,
  ...localSEOTools,
  ...aiGeoTools,
  ...analyticsTools,
  ...utilitiesTools,
]

// ===== HELPER FUNCTIONS =====

/**
 * Get all tools in a specific category
 */
export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.category === category)
}

/**
 * Get a specific tool by ID
 */
export function getToolById(toolId: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find(tool => tool.id === toolId)
}

/**
 * Get all tools that are pro features
 */
export function getProTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.isPro)
}

/**
 * Get all new tools (isNew = true)
 */
export function getNewTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.isNew)
}

/**
 * Get all coming soon tools
 */
export function getComingSoonTools(): ToolDefinition[] {
  return TOOLS_REGISTRY.filter(tool => tool.comingSoon)
}

/**
 * Get tools available for a specific plan
 */
export function getToolsForPlan(plan: 'free' | 'starter' | 'pro' | 'enterprise'): ToolDefinition[] {
  const freeToolIds = new Set(['site-audit', 'website-crawler', 'core-web-vitals', 'robots-txt-analyzer', 'sitemap-analyzer', 'ssl-security-checker', 'mobile-friendliness', 'structured-data-validator', 'http-headers-analyzer', 'redirect-chain-checker', 'broken-link-checker', 'meta-tags-analyzer', 'heading-structure', 'internal-link-analyzer', 'keyword-density', 'readability-score', 'keyword-research', 'long-tail-finder', 'question-keywords', 'duplicate-content-checker', 'content-score-grader', 'seo-dashboard', 'serp-simulator', 'canonical-url-checker', 'open-graph-previewer', 'social-card-previewer'])

  if (plan === 'free') {
    return TOOLS_REGISTRY.filter(tool => !tool.isPro)
  }
  return TOOLS_REGISTRY.filter(tool => !tool.comingSoon)
}

/**
 * Get tool categories with their tools
 */
export function getToolsByCategories(): Record<ToolCategory, ToolDefinition[]> {
  const categories: ToolCategory[] = ['technical-seo', 'on-page-seo', 'keywords', 'backlinks', 'content', 'competitors', 'local-seo', 'ai-geo', 'analytics', 'utilities']

  const result: Record<ToolCategory, ToolDefinition[]> = {} as Record<ToolCategory, ToolDefinition[]>

  categories.forEach(category => {
    result[category] = getToolsByCategory(category)
  })

  return result
}

/**
 * Get localized category name
 */
export function getCategoryLabel(category: ToolCategory): string {
  const labels: Record<ToolCategory, string> = {
    'technical-seo': 'SEO Technique',
    'on-page-seo': 'SEO On-Page',
    'keywords': 'Mots-clés',
    'backlinks': 'Backlinks',
    'content': 'Contenu',
    'competitors': 'Concurrents',
    'local-seo': 'SEO Local',
    'ai-geo': 'IA & GEO',
    'analytics': 'Analytics',
    'utilities': 'Utilitaires',
  }
  return labels[category] || category
}

/**
 * Search tools by name or description
 */
export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase()
  return TOOLS_REGISTRY.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.features?.some(f => f.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get total number of tools
 */
export function getTotalToolCount(): number {
  return TOOLS_REGISTRY.length
}

/**
 * Get tool count by category
 */
export function getToolCountByCategory(): Record<ToolCategory, number> {
  const categories: ToolCategory[] = ['technical-seo', 'on-page-seo', 'keywords', 'backlinks', 'content', 'competitors', 'local-seo', 'ai-geo', 'analytics', 'utilities']

  const result: Record<ToolCategory, number> = {} as Record<ToolCategory, number>

  categories.forEach(category => {
    result[category] = getToolsByCategory(category).length
  })

  return result
}
