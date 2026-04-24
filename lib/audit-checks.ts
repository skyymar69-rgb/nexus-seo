/**
 * Audit Checks Engine — Rapports de référence en français
 * Chaque check produit un rapport complet (500+ mots) avec :
 * - Guide complet type article de référence
 * - Cas d'étude avant/après avec chiffres
 * - Tableaux comparatifs
 * - Checklist pré-publication
 * - Erreurs courantes vs corrections
 * - Outils recommandés
 * - Bonnes pratiques 2026
 * - Recommandations actionnables
 * - Impact SEO estimé
 * - Sources de référence
 */

import {
  getTitleTagReport,
  getMetaDescriptionReport,
  getCanonicalReport,
  getHTTPSReport,
  getStructuredDataReport,
  getLoadTimeReport,
  getOpenGraphReport,
  getH1Report,
  getImagesReport,
  getHeadingHierarchyReport,
  getWordCountReport,
  getViewportReport,
  getSecurityHeadersReport,
} from './audit-reports'

export interface DetailedCheck {
  id: string
  category: 'meta' | 'content' | 'technical' | 'performance' | 'security' | 'mobile'
  name: string
  status: 'passed' | 'warning' | 'error'
  score: number
  value: string
  summary: string         // Résumé court (1 phrase)
  report: string          // Rapport détaillé (multi-paragraphe)
  bestPractices: string[] // Liste des bonnes pratiques 2026
  impact: 'critical' | 'high' | 'medium' | 'low'
  sources: string[]       // Références
}

// ── TITLE TAG ─────────────────────────────────────────────────────────

export function checkTitleTag(title: string | null, url: string): DetailedCheck {
  const len = title?.length || 0
  const hasKeywordUpfront = title ? /^[A-ZÀ-Ü]/.test(title) : false

  let status: DetailedCheck['status'] = 'passed'
  let score = 100
  let summary = ''

  if (!title) {
    status = 'error'; score = 0
    summary = 'Balise title absente — impact critique sur le référencement.'
  } else if (len < 30) {
    status = 'warning'; score = 40
    summary = `Title trop courte (${len} car.) — visibilité et CTR réduits dans les SERP.`
  } else if (len > 60) {
    status = 'warning'; score = 65
    summary = `Title trop longue (${len} car.) — sera tronquée dans les résultats Google.`
  } else if (len >= 35 && len <= 55) {
    score = 100
    summary = `Title optimale (${len} car.) — longueur idéale pour les SERP 2026.`
  } else {
    score = 85
    summary = `Title acceptable (${len} car.) — dans les limites mais peut être améliorée.`
  }

  return {
    id: 'meta_title',
    category: 'meta',
    name: 'Balise Title',
    status,
    score,
    value: title || 'Absente',
    summary,
    report: getTitleTagReport(title, url),
    bestPractices: [
      'Longueur optimale : 35–55 caractères (zone de sécurité anti-troncature)',
      'Placez le mot-clé principal dans les 3 premiers mots',
      'Incluez des mots-clés secondaires sans sur-optimiser (keyword stuffing)',
      'Utilisez le Title Case pour maximiser la lisibilité et le CTR',
      'Chaque page doit avoir une title unique — aucun doublon',
      'Réduisez les stop words (le, la, de, en) pour maximiser la densité',
      'Ajoutez le nom de marque stratégiquement (homepage, pages à fort branding)',
      'Testez les emojis pour booster le CTR (📊, ✅, 🔥) — A/B testez avant de généraliser',
      'Utilisez des power words (Ultime, Secret, Exclusif, Meilleur) pour attirer l\'attention',
      'Ajoutez des modificateurs (Guide, Avis, Comparatif, 2026) pour capter le trafic longue traîne',
      'Utilisez des caractères spéciaux (• / ★ ™) pour un pattern interrupt visuel dans les SERP',
      'A/B testez régulièrement vos titles et itérez en fonction du CTR et des positions',
    ],
    impact: !title ? 'critical' : len < 30 || len > 65 ? 'high' : 'medium',
    sources: [
      'Google Search Central — Title Links (2025)',
      'Moz — Title Tag Optimization Guide (2026)',
      'Ahrefs — How to Write Title Tags for SEO (2026)',
      'Google SERP Display Study — Portent (2025)',
    ],
  }
}

// ── META DESCRIPTION ──────────────────────────────────────────────────

export function checkMetaDescription(desc: string | null): DetailedCheck {
  const len = desc?.length || 0

  let status: DetailedCheck['status'] = 'passed'
  let score = 100
  let summary = ''

  if (!desc) {
    status = 'error'; score = 0
    summary = 'Meta description absente — Google générera un extrait automatique souvent inadapté.'
  } else if (len < 120) {
    status = 'warning'; score = 50
    summary = `Meta description trop courte (${len} car.) — sous-utilise l'espace SERP.`
  } else if (len > 160) {
    status = 'warning'; score = 70
    summary = `Meta description trop longue (${len} car.) — sera tronquée dans les SERP.`
  } else {
    summary = `Meta description optimale (${len} car.) — bonne longueur pour les SERP.`
  }

  return {
    id: 'meta_description',
    category: 'meta',
    name: 'Meta Description',
    status,
    score,
    value: desc ? `${desc.substring(0, 80)}... (${len} car.)` : 'Absente',
    summary,
    report: getMetaDescriptionReport(desc),
    bestPractices: [
      'Longueur idéale : 120–155 caractères (safe zone desktop + mobile)',
      'Incluez le mot-clé principal naturellement (Google le met en gras dans les SERP)',
      'Ajoutez un appel à l\'action clair (Découvrez, Comparez, Essayez gratuitement)',
      'Chaque page doit avoir une description unique — pas de duplication',
      'Rédigez pour l\'humain, pas pour le robot — c\'est du copywriting SERP',
      'Utilisez des chiffres et données pour crédibiliser ("+340% de trafic", "98% de satisfaction")',
      'Testez les emojis et caractères Unicode pour augmenter le CTR',
      'Adaptez le ton à l\'intention de recherche (informationnelle vs transactionnelle)',
    ],
    impact: !desc ? 'high' : 'medium',
    sources: [
      'Google Search Central — Meta Description Best Practices (2025)',
      'Backlinko — Meta Description Study (2026)',
      'Search Engine Journal — SERP CTR Optimization (2025)',
    ],
  }
}

// ── CANONICAL TAG ─────────────────────────────────────────────────────

export function checkCanonical(canonical: string | null, url: string): DetailedCheck {
  const hasCanonical = !!canonical
  const isSelfReferencing = canonical === url || canonical === url + '/'

  let status: DetailedCheck['status'] = hasCanonical ? 'passed' : 'warning'
  let score = hasCanonical ? (isSelfReferencing ? 100 : 85) : 40

  return {
    id: 'meta_canonical',
    category: 'meta',
    name: 'Balise Canonical',
    status,
    score,
    value: canonical || 'Absente',
    summary: hasCanonical
      ? `Canonical définie${isSelfReferencing ? ' (auto-référencée ✅)' : ' — vérifiez qu\'elle pointe vers la bonne URL'}`
      : 'Balise canonical absente — risque de contenu dupliqué.',
    report: getCanonicalReport(canonical, url),
    bestPractices: [
      'Ajoutez une canonical auto-référencée sur chaque page',
      'Utilisez des URLs absolues (https://domaine.fr/page), jamais relatives',
      'Assurez-vous que la canonical est cohérente avec le sitemap.xml',
      'Pour les pages paginées, la canonical doit pointer vers elle-même (pas vers la page 1)',
      'Vérifiez qu\'il n\'y a pas de conflit entre canonical et meta robots noindex',
    ],
    impact: hasCanonical ? 'low' : 'high',
    sources: [
      'Google Search Central — Consolidate Duplicate URLs (2025)',
      'Yoast — Canonical URL Guide (2026)',
    ],
  }
}

// ── H1 HEADING ────────────────────────────────────────────────────────

export function checkH1(h1Count: number, h1Text: string | null): DetailedCheck {
  let status: DetailedCheck['status'] = 'passed'
  let score = 100

  if (h1Count === 0) { status = 'error'; score = 0 }
  else if (h1Count > 1) { status = 'warning'; score = 60 }

  const h1Len = h1Text?.length || 0

  return {
    id: 'content_h1',
    category: 'content',
    name: 'Balise H1',
    status,
    score,
    value: h1Count === 0 ? 'Absente' : h1Count > 1 ? `${h1Count} H1 détectées (trop)` : `"${h1Text?.substring(0, 60)}${h1Len > 60 ? '...' : ''}"`,
    summary: h1Count === 0
      ? 'Aucune balise H1 détectée — signal de pertinence manquant pour Google.'
      : h1Count > 1
        ? `${h1Count} balises H1 détectées — une seule H1 par page est recommandé.`
        : `H1 unique détectée (${h1Len} car.) — bonne structure.`,
    report: getH1Report(h1Count, h1Text),
    bestPractices: [
      'Une seule H1 par page — elle définit le sujet principal',
      'Incluez le mot-clé principal dans la H1',
      'La H1 doit être différente de la title tag (complémentaire, pas identique)',
      'Longueur recommandée : 20–70 caractères',
      'La H1 doit être le premier heading visible sur la page',
      'Suivez une hiérarchie logique : H1 > H2 > H3 (pas de saut de niveau)',
    ],
    impact: h1Count === 0 ? 'critical' : h1Count > 1 ? 'medium' : 'low',
    sources: [
      'Semrush — H1 Tag Study: Impact on Rankings (2025)',
      'Google Search Central — Headings Best Practices (2025)',
      'Moz — On-Page SEO: Heading Tags (2026)',
    ],
  }
}

// ── IMAGES ALT TEXT ───────────────────────────────────────────────────

export function checkImages(total: number, withAlt: number, withoutAlt: number): DetailedCheck {
  if (total === 0) {
    return {
      id: 'content_images',
      category: 'content',
      name: 'Images & Alt Text',
      status: 'warning',
      score: 70,
      value: 'Aucune image détectée',
      summary: 'Aucune image trouvée — le contenu visuel améliore l\'engagement et le SEO.',
      report: getImagesReport(total, withAlt),
      bestPractices: [
        'Ajoutez des images pertinentes pour enrichir le contenu',
        'Chaque image doit avoir un attribut alt descriptif',
        'Optimisez le poids des images (WebP, compression)',
        'Utilisez le lazy loading pour les images sous la ligne de flottaison',
      ],
      impact: 'low',
      sources: ['Google Search Central — Image Best Practices (2025)'],
    }
  }

  const ratio = withAlt / total
  const status: DetailedCheck['status'] = ratio >= 0.9 ? 'passed' : ratio >= 0.5 ? 'warning' : 'error'
  const score = Math.round(ratio * 100)

  return {
    id: 'content_images',
    category: 'content',
    name: 'Images & Alt Text',
    status,
    score,
    value: `${withAlt}/${total} images avec alt text (${Math.round(ratio * 100)}%)`,
    summary: ratio >= 0.9
      ? `${withAlt}/${total} images ont un alt text — excellent.`
      : `${withoutAlt} image(s) sans alt text — accessibilité et SEO impactés.`,
    report: getImagesReport(total, withAlt),
    bestPractices: [
      'Chaque image doit avoir un alt text descriptif et unique',
      'Incluez le mot-clé dans l\'alt de l\'image principale (naturellement)',
      'Alt text idéal : 5-15 mots décrivant le contenu de l\'image',
      'N\'utilisez pas "image de..." ou "photo de..." — soyez direct',
      'Les images décoratives peuvent avoir un alt="" vide',
      'Utilisez le format WebP pour réduire le poids de 25-35%',
      'Activez le lazy loading (loading="lazy") pour les images hors viewport',
      'Renseignez les dimensions (width/height) pour éviter le CLS',
    ],
    impact: ratio < 0.5 ? 'high' : ratio < 0.9 ? 'medium' : 'low',
    sources: [
      'Google Search Central — Image SEO Best Practices (2025)',
      'WebAIM — Alternative Text Guide (2026)',
      'Web.dev — Optimize Images (2025)',
    ],
  }
}

// ── HTTPS / SSL ───────────────────────────────────────────────────────

export function checkHTTPS(url: string): DetailedCheck {
  const isHttps = url.startsWith('https://')

  return {
    id: 'security_https',
    category: 'security',
    name: 'HTTPS / SSL',
    status: isHttps ? 'passed' : 'error',
    score: isHttps ? 100 : 0,
    value: isHttps ? 'HTTPS actif ✅' : 'HTTP non sécurisé ❌',
    summary: isHttps
      ? 'Connexion HTTPS sécurisée — facteur de ranking confirmé par Google.'
      : 'Site non sécurisé (HTTP) — bloquant pour le SEO et la confiance utilisateur.',
    report: getHTTPSReport(url),
    bestPractices: [
      'Utilisez HTTPS sur 100% de votre site',
      'Configurez une redirection 301 permanente de HTTP vers HTTPS',
      'Activez le header HSTS (Strict-Transport-Security: max-age=31536000)',
      'Vérifiez l\'absence de contenu mixte (Mixed Content)',
      'Renouvelez votre certificat SSL avant expiration',
      'Utilisez TLS 1.3 minimum (désactivez TLS 1.0 et 1.1)',
    ],
    impact: isHttps ? 'low' : 'critical',
    sources: [
      'Google — HTTPS as a Ranking Signal (2014, confirmé 2025)',
      'Let\'s Encrypt — Free SSL/TLS Certificates',
      'Mozilla — HTTPS Best Practices (2026)',
    ],
  }
}

// ── PAGE SPEED / LOAD TIME ────────────────────────────────────────────

export function checkLoadTime(loadTime: number, htmlSize: number): DetailedCheck {
  const sizeKB = Math.round(htmlSize / 1024)
  const sizeMB = (htmlSize / (1024 * 1024)).toFixed(2)

  let status: DetailedCheck['status'] = 'passed'
  let score = 100

  if (loadTime > 5000) { status = 'error'; score = 20 }
  else if (loadTime > 3000) { status = 'warning'; score = 50 }
  else if (loadTime > 1500) { status = 'warning'; score = 75 }

  const loadSec = (loadTime / 1000).toFixed(2)

  return {
    id: 'performance_speed',
    category: 'performance',
    name: 'Temps de chargement',
    status,
    score,
    value: `${loadSec}s (HTML: ${sizeKB} KB)`,
    summary: loadTime <= 1500
      ? `Chargement rapide (${loadSec}s) — excellent pour l'UX et le SEO.`
      : loadTime <= 3000
        ? `Chargement acceptable (${loadSec}s) — peut être optimisé.`
        : `Chargement lent (${loadSec}s) — impact négatif sur le SEO et l'UX.`,
    report: getLoadTimeReport(loadTime, htmlSize),
    bestPractices: [
      'TTFB cible : < 800ms (Time to First Byte)',
      'Activez la compression Gzip/Brotli sur le serveur',
      'Utilisez un CDN pour réduire la latence géographique',
      'Configurez le cache navigateur (Cache-Control headers)',
      'Minifiez HTML, CSS et JavaScript',
      'Optimisez les requêtes base de données',
      'Utilisez HTTP/2 ou HTTP/3 pour le multiplexage',
      'Réduisez le nombre de redirections (chaque 301 ajoute ~100ms)',
    ],
    impact: loadTime > 3000 ? 'critical' : loadTime > 1500 ? 'high' : 'low',
    sources: [
      'Google — Core Web Vitals Thresholds (2025)',
      'Web.dev — Optimize Time to First Byte (2025)',
      'Portent — Site Speed & Conversion Study (2025)',
      'Google — Mobile Speed Benchmarks (2025)',
    ],
  }
}

// ── STRUCTURED DATA ───────────────────────────────────────────────────

export function checkStructuredData(count: number): DetailedCheck {
  const status: DetailedCheck['status'] = count >= 2 ? 'passed' : count >= 1 ? 'warning' : 'error'
  const score = count >= 3 ? 100 : count >= 2 ? 85 : count >= 1 ? 60 : 0

  return {
    id: 'technical_structured_data',
    category: 'technical',
    name: 'Données Structurées (Schema.org)',
    status,
    score,
    value: count > 0 ? `${count} bloc(s) JSON-LD détecté(s)` : 'Aucune donnée structurée',
    summary: count >= 2
      ? `${count} schemas JSON-LD détectés — bonne implémentation pour les rich snippets.`
      : count === 1
        ? '1 seul schema détecté — enrichissez avec d\'autres types (FAQ, Product, etc.).'
        : 'Aucune donnée structurée — manque d\'opportunité pour les rich snippets.',
    report: getStructuredDataReport(count),
    bestPractices: [
      'Utilisez le format JSON-LD (recommandé par Google vs Microdata)',
      'Au minimum : Organization + WebSite + BreadcrumbList',
      'Ajoutez FAQPage pour les pages avec des Q&A — excellent pour les PAA',
      'Testez avec le Rich Results Test (search.google.com/test/rich-results)',
      'Validez le JSON-LD avec Schema.org Validator',
      'Ne marquez que le contenu visible sur la page (pas de spam)',
      'Ajoutez AggregateRating si vous avez des avis clients',
      'Utilisez HowTo pour les tutoriels et guides pas-à-pas',
    ],
    impact: count === 0 ? 'high' : 'medium',
    sources: [
      'Google Search Central — Structured Data Guidelines (2025)',
      'Schema.org — Full Hierarchy (2026)',
      'Google — Rich Results Test Tool',
      'Merkle — Schema Markup Generator',
    ],
  }
}

// ── OPEN GRAPH ────────────────────────────────────────────────────────

export function checkOpenGraph(ogTitle: string | null, ogDesc: string | null, ogImage: string | null): DetailedCheck {
  const tags = [ogTitle, ogDesc, ogImage].filter(Boolean).length
  const score = tags === 3 ? 100 : tags === 2 ? 70 : tags === 1 ? 40 : 0
  const status: DetailedCheck['status'] = tags === 3 ? 'passed' : tags > 0 ? 'warning' : 'error'

  return {
    id: 'meta_og',
    category: 'meta',
    name: 'Open Graph (Réseaux sociaux)',
    status,
    score,
    value: `og:title ${ogTitle ? '✅' : '❌'} | og:description ${ogDesc ? '✅' : '❌'} | og:image ${ogImage ? '✅' : '❌'}`,
    summary: tags === 3
      ? 'Balises Open Graph complètes — partage social optimisé.'
      : `${3 - tags} balise(s) OG manquante(s) — partage social sous-optimal.`,
    report: getOpenGraphReport(ogTitle, ogDesc, ogImage),
    bestPractices: [
      'og:title : 40-60 caractères, différent de la title tag',
      'og:description : 60-90 caractères, accrocheur et concis',
      'og:image : 1200×630px minimum, format PNG ou JPG',
      'Ajoutez og:type (website, article, product)',
      'Ajoutez og:url avec l\'URL canonique',
      'Testez avec le Facebook Sharing Debugger',
      'Ajoutez aussi les Twitter Card tags (twitter:card, twitter:image)',
    ],
    impact: tags === 0 ? 'high' : tags < 3 ? 'medium' : 'low',
    sources: [
      'Open Graph Protocol — ogp.me',
      'Facebook — Sharing Debugger',
      'Buffer — Social Media Image Study (2025)',
    ],
  }
}

// ── MOBILE VIEWPORT ───────────────────────────────────────────────────

export function checkViewport(viewport: string | null): DetailedCheck {
  const hasViewport = !!viewport
  const hasWidthDevice = viewport?.includes('width=device-width') || false

  return {
    id: 'mobile_viewport',
    category: 'mobile',
    name: 'Viewport Mobile',
    status: hasViewport && hasWidthDevice ? 'passed' : hasViewport ? 'warning' : 'error',
    score: hasViewport && hasWidthDevice ? 100 : hasViewport ? 60 : 0,
    value: viewport || 'Absente',
    summary: hasViewport && hasWidthDevice
      ? 'Viewport correctement configuré pour le responsive.'
      : 'Viewport manquant ou mal configuré — site non adapté au mobile.',
    report: getViewportReport(viewport),
    bestPractices: [
      'Ajoutez : <meta name="viewport" content="width=device-width, initial-scale=1">',
      'Ne bloquez pas le zoom utilisateur (évitez maximum-scale=1)',
      'Testez avec le Mobile-Friendly Test de Google',
      'Utilisez un design responsive (pas de site mobile séparé)',
    ],
    impact: hasViewport ? 'low' : 'critical',
    sources: [
      'Google — Mobile-First Indexing (2025)',
      'MDN — Viewport Meta Tag',
      'Web.dev — Responsive Design Basics',
    ],
  }
}

// ── WORD COUNT ─────────────────────────────────────────────────────────

export function checkWordCount(wordCount: number): DetailedCheck {
  let status: DetailedCheck['status'] = 'passed'
  let score = 100

  if (wordCount < 100) { status = 'error'; score = 20 }
  else if (wordCount < 300) { status = 'warning'; score = 50 }
  else if (wordCount < 600) { status = 'warning'; score = 75 }

  return {
    id: 'content_wordcount',
    category: 'content',
    name: 'Volume de Contenu',
    status,
    score,
    value: `${wordCount} mots`,
    summary: wordCount >= 600
      ? `${wordCount} mots — volume suffisant pour couvrir le sujet en profondeur.`
      : wordCount >= 300
        ? `${wordCount} mots — contenu court, envisagez d'approfondir.`
        : `${wordCount} mots — contenu insuffisant pour le SEO.`,
    report: getWordCountReport(wordCount),
    bestPractices: [
      'Adaptez la longueur à l\'intention de recherche et au type de page',
      'Privilégiez la qualité et la profondeur à la quantité',
      'Analysez la longueur des pages concurrentes en top 3 pour calibrer',
      'Utilisez des sous-titres (H2, H3) pour structurer les contenus longs',
      'Ajoutez des éléments multimédias (images, vidéos, tableaux) pour enrichir',
      'Évitez le contenu dupliqué ou généré automatiquement de faible qualité',
    ],
    impact: wordCount < 300 ? 'high' : wordCount < 600 ? 'medium' : 'low',
    sources: [
      'Backlinko — Content Length vs Rankings Study (2025)',
      'Google Search Central — Thin Content (2025)',
      'HubSpot — Ideal Blog Post Length Study (2026)',
    ],
  }
}

// ── HEADING HIERARCHY ─────────────────────────────────────────────────

export function checkHeadingHierarchy(h1: number, h2: number, h3: number): DetailedCheck {
  const good = h1 === 1 && h2 >= 2
  const score = good ? 100 : h1 === 1 ? 70 : h1 === 0 ? 30 : 50

  return {
    id: 'content_headings',
    category: 'content',
    name: 'Hiérarchie des Titres',
    status: good ? 'passed' : h1 === 1 && h2 >= 1 ? 'warning' : 'error',
    score,
    value: `H1: ${h1} | H2: ${h2} | H3: ${h3}`,
    summary: good
      ? `Hiérarchie correcte — 1 H1, ${h2} H2, ${h3} H3.`
      : h1 === 0
        ? 'Aucune H1 détectée — la hiérarchie de titres est incomplète.'
        : `Hiérarchie à améliorer — ${h1 > 1 ? 'trop de H1' : 'pas assez de H2'}.`,
    report: getHeadingHierarchyReport(h1, h2, h3),
    bestPractices: [
      '1 seul H1 par page (le titre principal)',
      'Au moins 2-3 H2 pour structurer les sous-sections',
      'Pas de saut de niveau (H1 → H3 sans H2)',
      'Incluez des mots-clés dans les H2 naturellement',
      'Les H2 sous forme de questions améliorent les chances d\'apparaître dans les PAA',
      'Utilisez les H3-H6 pour les sous-sous-sections',
    ],
    impact: h1 === 0 ? 'high' : good ? 'low' : 'medium',
    sources: [
      'Google Search Central — Heading Elements (2025)',
      'W3C — HTML Heading Specification',
      'WebAIM — Headings Accessibility Guide',
    ],
  }
}

// ── SECURITY HEADERS ──────────────────────────────────────────────────

export function checkSecurityHeaders(csp: string | null, xFrame: string | null, xContentType: string | null): DetailedCheck {
  const headers = [csp, xFrame, xContentType].filter(Boolean).length
  const score = headers === 3 ? 100 : headers === 2 ? 70 : headers === 1 ? 40 : 10

  return {
    id: 'security_headers',
    category: 'security',
    name: 'Headers de Sécurité',
    status: headers >= 2 ? 'passed' : headers >= 1 ? 'warning' : 'error',
    score,
    value: `CSP ${csp ? '✅' : '❌'} | X-Frame ${xFrame ? '✅' : '❌'} | X-Content-Type ${xContentType ? '✅' : '❌'}`,
    summary: headers >= 2
      ? `${headers}/3 headers de sécurité configurés — bonne protection.`
      : `${headers}/3 headers de sécurité — protection insuffisante.`,
    report: getSecurityHeadersReport(csp, xFrame, xContentType),
    bestPractices: [
      'Content-Security-Policy : définissez les sources autorisées pour scripts, styles, images',
      'X-Frame-Options : DENY ou SAMEORIGIN pour empêcher l\'embedding non autorisé',
      'X-Content-Type-Options : nosniff pour empêcher le MIME sniffing',
      'Strict-Transport-Security (HSTS) : max-age=31536000; includeSubDomains',
      'Referrer-Policy : strict-origin-when-cross-origin',
      'Permissions-Policy : désactivez caméra, micro, géoloc si non utilisés',
    ],
    impact: headers === 0 ? 'high' : 'medium',
    sources: [
      'OWASP — Secure Headers Project (2026)',
      'Mozilla — HTTP Security Headers',
      'SecurityHeaders.com — Header Analysis Tool',
    ],
  }
}

// ─── NEW CHECKS (10 additional) ───────────────────────────────

export function checkRobotsTxt(hasRobots: boolean, content?: string): DetailedCheck {
  const hasDisallow = content?.includes('Disallow') || false
  const hasSitemap = content?.includes('Sitemap') || false
  const score = hasRobots ? (hasSitemap ? 100 : 70) : 20

  return {
    id: 'tech_robots',
    category: 'technical',
    name: 'Fichier robots.txt',
    status: hasRobots ? 'passed' : 'error',
    score,
    value: hasRobots ? `Present${hasSitemap ? ' + Sitemap' : ''}${hasDisallow ? ' + Disallow' : ''}` : 'Absent',
    summary: hasRobots ? 'robots.txt détecté et configuré.' : 'robots.txt manquant — les moteurs de recherche ne connaissent pas vos règles de crawl.',
    report: hasRobots ? 'Votre fichier robots.txt est présent et guide les crawlers.' : 'Le fichier robots.txt est essentiel pour contrôler quelles pages Google et les LLMs peuvent explorer. Sans lui, toutes les pages sont crawlées sans priorité.',
    bestPractices: ['Ajoutez un lien vers votre sitemap.xml dans robots.txt', 'Bloquez les pages admin, API, et duplicats', 'Ne bloquez pas les CSS/JS nécessaires au rendu', 'Testez avec Google Search Console > robots.txt Tester'],
    impact: hasRobots ? 'low' : 'high',
    sources: ['Google — robots.txt Specifications (2026)', 'Yoast — robots.txt Guide'],
  }
}

export function checkSitemapXml(hasSitemap: boolean, urlCount?: number): DetailedCheck {
  const score = hasSitemap ? (urlCount && urlCount > 10 ? 100 : 70) : 15

  return {
    id: 'tech_sitemap',
    category: 'technical',
    name: 'Sitemap XML',
    status: hasSitemap ? 'passed' : 'error',
    score,
    value: hasSitemap ? `Present${urlCount ? ` (${urlCount} URLs)` : ''}` : 'Absent',
    summary: hasSitemap ? `Sitemap XML détecté${urlCount ? ` avec ${urlCount} URLs` : ''}.` : 'Sitemap XML manquant — Google ne connaît pas toutes vos pages.',
    report: hasSitemap ? 'Votre sitemap XML aide les moteurs à découvrir toutes vos pages efficacement.' : 'Sans sitemap.xml, Google doit découvrir vos pages uniquement via les liens. Les pages orphelines ne seront jamais indexées.',
    bestPractices: ['Générez un sitemap dynamique (Next.js: app/sitemap.ts)', 'Incluez toutes les pages publiques avec priorité et lastmod', 'Soumettez-le dans Google Search Console', 'Limitez à 50 000 URLs par sitemap'],
    impact: hasSitemap ? 'low' : 'high',
    sources: ['Google — Sitemap Protocol', 'Sitemaps.org — Protocol Specification'],
  }
}

export function checkHreflang(hasHreflang: boolean, languages?: string[]): DetailedCheck {
  const score = hasHreflang ? 100 : 50

  return {
    id: 'meta_hreflang',
    category: 'meta',
    name: 'Balises Hreflang',
    status: hasHreflang ? 'passed' : 'warning',
    score,
    value: hasHreflang ? `Présent (${languages?.join(', ') || 'détecté'})` : 'Absent',
    summary: hasHreflang ? 'Hreflang configuré pour le ciblage international.' : 'Pas de balise hreflang — OK si votre site cible un seul pays.',
    report: 'Les balises hreflang indiquent aux moteurs de recherche quelle version linguistique servir selon la localisation de l\'utilisateur.',
    bestPractices: ['Ajoutez hreflang si vous avez plusieurs versions linguistiques', 'Chaque page doit référencer toutes ses alternatives', 'Incluez un x-default pour la version par défaut', 'Cohérence avec le canonical'],
    impact: 'low',
    sources: ['Google — Hreflang pour les résultats de recherche régionaux'],
  }
}

export function checkFavicon(hasFavicon: boolean): DetailedCheck {
  return {
    id: 'meta_favicon',
    category: 'meta',
    name: 'Favicon',
    status: hasFavicon ? 'passed' : 'warning',
    score: hasFavicon ? 100 : 40,
    value: hasFavicon ? 'Present' : 'Absent',
    summary: hasFavicon ? 'Favicon détecté.' : 'Aucun favicon — impact sur la reconnaissance de marque dans les onglets et favoris.',
    report: 'Le favicon apparaît dans les onglets du navigateur, les favoris, et les résultats Google mobile. C\'est un signal de professionnalisme.',
    bestPractices: ['Fournissez un favicon.ico + PNG 32x32 + 16x16', 'Ajoutez un apple-touch-icon 180x180 pour iOS', 'Utilisez un format SVG pour la netteté sur tous les écrans'],
    impact: 'low',
    sources: ['Favicon.io — Favicon Generator'],
  }
}

export function checkMetaRobots(content: string | null): DetailedCheck {
  const isNoindex = content?.includes('noindex') || false
  const isNofollow = content?.includes('nofollow') || false
  const score = isNoindex ? 20 : 100

  return {
    id: 'meta_robots',
    category: 'meta',
    name: 'Meta Robots',
    status: isNoindex ? 'error' : 'passed',
    score,
    value: content || 'Non défini (index, follow par défaut)',
    summary: isNoindex ? 'ATTENTION: meta robots noindex détecté — cette page ne sera PAS indexée par Google.' : 'Meta robots OK — la page est indexable.',
    report: isNoindex ? 'La directive noindex empêche Google d\'indexer cette page. Si c\'est intentionnel (page admin, merci), c\'est correct. Sinon, supprimez-la immédiatement.' : 'Votre page est correctement configurée pour être indexée et suivie par les moteurs.',
    bestPractices: ['Utilisez noindex uniquement sur les pages privées ou dupliquées', 'Ne mettez jamais noindex sur vos pages principales', 'Préférez le canonical pour gérer les doublons', 'Vérifiez dans Google Search Console > Couverture'],
    impact: isNoindex ? 'critical' : 'low',
    sources: ['Google — Meta robots specifications'],
  }
}

export function checkLanguageAttr(lang: string | null): DetailedCheck {
  const hasLang = !!lang && lang.length >= 2
  return {
    id: 'tech_lang',
    category: 'technical',
    name: 'Attribut lang HTML',
    status: hasLang ? 'passed' : 'warning',
    score: hasLang ? 100 : 40,
    value: lang || 'Non défini',
    summary: hasLang ? `Langue ${lang} déclarée — aide les moteurs et l'accessibilité.` : 'Attribut lang manquant sur la balise <html>.',
    report: 'L\'attribut lang aide les moteurs de recherche à comprendre la langue de votre contenu et améliore l\'accessibilité pour les lecteurs d\'écran.',
    bestPractices: ['Ajoutez lang="fr" sur <html> pour un site français', 'Utilisez le code ISO 639-1 (fr, en, es, de, etc.)', 'Cohérent avec vos balises hreflang si elles existent'],
    impact: 'medium',
    sources: ['W3C — Language Tags in HTML', 'MDN — lang attribute'],
  }
}

export function checkImageDimensions(withDimensions: number, total: number): DetailedCheck {
  const withoutDimensions = total - withDimensions
  const ratio = total > 0 ? withDimensions / total : 1
  const score = Math.round(ratio * 100)

  return {
    id: 'perf_img_dimensions',
    category: 'performance',
    name: 'Dimensions des images',
    status: ratio >= 0.9 ? 'passed' : ratio >= 0.5 ? 'warning' : 'error',
    score,
    value: `${withDimensions}/${total} images avec width/height`,
    summary: withoutDimensions > 0 ? `${withoutDimensions} images sans dimensions explicites — cause de Cumulative Layout Shift (CLS).` : 'Toutes les images ont des dimensions — excellent pour le CLS.',
    report: 'Les images sans attributs width et height causent des sauts de mise en page (CLS) quand elles se chargent. C\'est un des 3 Core Web Vitals mesurés par Google.',
    bestPractices: ['Ajoutez width et height à TOUTES les balises <img>', 'Utilisez aspect-ratio en CSS comme fallback', 'Next.js Image component ajoute les dimensions automatiquement'],
    impact: withoutDimensions > 5 ? 'high' : 'medium',
    sources: ['Google — Cumulative Layout Shift (CLS)', 'web.dev — Optimize CLS'],
  }
}

export function checkLazyLoading(lazyImages: number, totalImages: number): DetailedCheck {
  const belowFoldEstimate = Math.max(0, totalImages - 1) // First image is usually above fold
  const ratio = belowFoldEstimate > 0 ? lazyImages / belowFoldEstimate : 1
  const score = totalImages <= 1 ? 100 : Math.round(ratio * 100)

  return {
    id: 'perf_lazy_loading',
    category: 'performance',
    name: 'Lazy Loading Images',
    status: ratio >= 0.7 ? 'passed' : ratio >= 0.3 ? 'warning' : totalImages > 3 ? 'error' : 'passed',
    score: Math.max(30, score),
    value: `${lazyImages}/${totalImages} images avec loading="lazy"`,
    summary: lazyImages > 0 ? `${lazyImages} images en lazy loading — bon pour la performance.` : totalImages > 3 ? 'Aucune image en lazy loading — les images hors écran ralentissent le chargement.' : 'Peu d\'images détectées.',
    report: 'Le lazy loading diffère le chargement des images hors écran, accélérant le First Contentful Paint et réduisant la bande passante.',
    bestPractices: ['Ajoutez loading="lazy" à toutes les images sauf la hero/LCP', 'Ne mettez PAS lazy sur la première image visible (LCP)', 'Les navigateurs modernes supportent nativement loading="lazy"'],
    impact: totalImages > 5 && lazyImages === 0 ? 'high' : 'low',
    sources: ['web.dev — Lazy Loading Images', 'MDN — loading attribute'],
  }
}

export function checkInternalLinking(internalLinks: number): DetailedCheck {
  const score = internalLinks >= 10 ? 100 : internalLinks >= 5 ? 80 : internalLinks >= 2 ? 50 : 20

  return {
    id: 'content_internal_links',
    category: 'content',
    name: 'Maillage Interne',
    status: internalLinks >= 5 ? 'passed' : internalLinks >= 2 ? 'warning' : 'error',
    score,
    value: `${internalLinks} liens internes`,
    summary: internalLinks >= 5 ? `${internalLinks} liens internes — bon maillage.` : `Seulement ${internalLinks} liens internes — le maillage est insuffisant.`,
    report: 'Le maillage interne distribue le "link juice" entre vos pages et aide Google à comprendre votre architecture. Les LLMs suivent aussi les liens internes pour comprendre la structure de votre site.',
    bestPractices: ['Visez 5-10 liens internes par page', 'Utilisez des ancres descriptives (pas "cliquez ici")', 'Liez vers vos pages les plus importantes', 'Créez des pages piliers avec beaucoup de liens entrants'],
    impact: internalLinks < 3 ? 'high' : 'medium',
    sources: ['Moz — Internal Linking for SEO', 'Ahrefs — Internal Links Guide'],
  }
}

export function checkSocialPresence(hasTwitter: boolean, hasLinkedIn: boolean, hasFacebook: boolean): DetailedCheck {
  const count = [hasTwitter, hasLinkedIn, hasFacebook].filter(Boolean).length
  const score = count >= 2 ? 100 : count === 1 ? 60 : 30

  return {
    id: 'content_social',
    category: 'content',
    name: 'Présence Réseaux Sociaux',
    status: count >= 2 ? 'passed' : count >= 1 ? 'warning' : 'error',
    score,
    value: `${count}/3 réseaux détectés (Twitter: ${hasTwitter ? 'oui' : 'non'}, LinkedIn: ${hasLinkedIn ? 'oui' : 'non'}, Facebook: ${hasFacebook ? 'oui' : 'non'})`,
    summary: count >= 2 ? 'Bonne présence sur les réseaux sociaux.' : 'Présence sociale insuffisante — les LLMs considèrent la présence sociale comme signal d\'autorité.',
    report: 'Les liens vers vos profils sociaux renforcent votre E-E-A-T (Expertise, Expérience, Authority, Trust). Les LLMs utilisent ces signaux pour évaluer la légitimité d\'une source.',
    bestPractices: ['Ajoutez des liens vers vos profils LinkedIn, Twitter/X, Facebook', 'Incluez-les dans le footer de toutes vos pages', 'Ajoutez les URLs dans votre schema Organization (sameAs)', 'Publiez régulièrement pour montrer que les comptes sont actifs'],
    impact: 'medium',
    sources: ['Google — E-E-A-T Guidelines', 'Schema.org — sameAs property'],
  }
}
