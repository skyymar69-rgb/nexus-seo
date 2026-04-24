/**
 * Actionable Recommendations Engine
 * Genere des recommandations concretes avec code, outils et priorite
 * pour chaque probleme detecte par les audits Nexus.
 */

export interface ActionableRec {
  id: string
  priority: 'critique' | 'haute' | 'moyenne' | 'basse'
  category: string
  title: string
  description: string
  impact: string
  estimatedTime: string
  tools: ToolSuggestion[]
  codeSnippets: CodeSnippet[]
  steps: string[]
}

export interface ToolSuggestion {
  name: string
  type: 'ai' | 'platform' | 'code' | 'manual'
  url?: string
  description: string
  free: boolean
}

export interface CodeSnippet {
  language: string
  label: string
  code: string
  where: string // ou implanter ce code
}

// ─── SEO Audit Recommendations ────────────────────────────────

export function generateAuditRecommendations(checks: Array<{
  id: string; name: string; status: string; score: number; category: string; value: string
}>): ActionableRec[] {
  const recs: ActionableRec[] = []

  for (const check of checks) {
    if (check.status === 'passed') continue

    const rec = getRecommendationForCheck(check)
    if (rec) recs.push(rec)
  }

  // Sort by priority
  const priorityOrder = { critique: 0, haute: 1, moyenne: 2, basse: 3 }
  return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

function getRecommendationForCheck(check: { id: string; name: string; status: string; score: number; category: string; value: string }): ActionableRec | null {
  const isCritical = check.status === 'error'
  const priority = isCritical ? 'critique' : check.score < 50 ? 'haute' : 'moyenne'

  // ── Meta Title ──
  if (check.id === 'meta_title' && check.status !== 'passed') {
    return {
      id: 'fix-title',
      priority,
      category: 'Meta & SEO',
      title: 'Optimiser la balise title',
      description: `Votre title "${check.value}" n'est pas optimal. La longueur ideale est 50-60 caracteres avec le mot-cle principal en debut.`,
      impact: 'Fort impact sur le CTR Google (+20-35%) et la visibilite IA',
      estimatedTime: '5 minutes',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: 'Demandez: "Reecris ce title SEO en 55 caracteres max avec le mot-cle X"', free: true },
        { name: 'Google SERP Simulator', type: 'platform', url: 'https://technicalseo.com/tools/google-serp-simulator/', description: 'Previsualiser le rendu dans Google', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'HTML — Balise title optimisee', code: `<title>Mot-cle Principal — Description Courte | Marque</title>`, where: 'Dans le <head> de votre page' },
        { language: 'jsx', label: 'Next.js — Metadata API', code: `export const metadata = {\n  title: 'Mot-cle Principal — Description | Marque',\n}`, where: 'Dans votre fichier page.tsx ou layout.tsx' },
        { language: 'php', label: 'WordPress — functions.php', code: `add_filter('pre_get_document_title', function() {\n  return 'Mot-cle Principal — Description | Marque';\n});`, where: 'Dans functions.php de votre theme' },
      ],
      steps: [
        'Identifiez votre mot-cle principal pour cette page',
        'Placez le mot-cle en debut de title (premiers 30 caracteres)',
        'Ajoutez une proposition de valeur unique',
        'Terminez par votre nom de marque apres un separateur (| ou —)',
        'Verifiez que le total fait 50-60 caracteres',
        'Testez le rendu avec le SERP Simulator',
      ],
    }
  }

  // ── Meta Description ──
  if (check.id === 'meta_description' && check.status !== 'passed') {
    return {
      id: 'fix-meta-desc',
      priority,
      category: 'Meta & SEO',
      title: 'Optimiser la meta description',
      description: `Votre meta description est ${!check.value || check.value === 'Missing' ? 'manquante' : 'trop courte ou longue'}. La longueur ideale est 120-155 caracteres.`,
      impact: 'Ameliore le CTR de 5-15% et aide les LLMs a comprendre votre page',
      estimatedTime: '5 minutes',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: 'Prompt: "Ecris une meta description de 150 caracteres pour une page sur [sujet]"', free: true },
        { name: 'Yoast SEO', type: 'platform', url: 'https://yoast.com', description: 'Plugin WordPress avec compteur de caracteres integre', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'HTML', code: `<meta name="description" content="Decouvrez [sujet]. Guide complet avec conseils pratiques, outils gratuits et resultats mesurables. [CTA].">`, where: 'Dans le <head>' },
        { language: 'jsx', label: 'Next.js', code: `export const metadata = {\n  description: 'Decouvrez [sujet]. Guide complet avec conseils pratiques et outils gratuits.',\n}`, where: 'page.tsx ou layout.tsx' },
      ],
      steps: [
        'Incluez le mot-cle principal naturellement',
        'Commencez par un verbe d\'action (Decouvrez, Apprenez, Optimisez)',
        'Ajoutez votre proposition de valeur unique',
        'Terminez par un appel a l\'action',
        'Restez entre 120-155 caracteres',
      ],
    }
  }

  // ── Heading H1 ──
  if (check.id === 'content_h1' && check.status !== 'passed') {
    return {
      id: 'fix-h1',
      priority: 'haute',
      category: 'Contenu',
      title: 'Corriger la balise H1',
      description: check.value.includes('0') ? 'Aucune balise H1 detectee.' : 'Plusieurs balises H1 detectees. Une seule H1 par page.',
      impact: 'Impact direct sur le classement SEO et la comprehension IA de votre page',
      estimatedTime: '10 minutes',
      tools: [
        { name: 'Editeur de code', type: 'code', description: 'VS Code, Cursor, ou l\'editeur de votre CMS', free: true },
        { name: 'Screaming Frog', type: 'platform', url: 'https://www.screamingfrog.co.uk', description: 'Crawler pour detecter les H1 manquants sur tout le site', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'HTML — H1 unique', code: `<h1>Votre Mot-cle Principal — Proposition de Valeur</h1>\n<!-- Un seul H1 par page, les sous-titres en H2/H3 -->`, where: 'En haut du contenu principal de la page' },
      ],
      steps: [
        'Verifiez qu\'il y a exactement 1 balise H1 par page',
        'Placez le mot-cle principal dans le H1',
        'Le H1 doit etre different du title',
        'Utilisez H2 pour les sous-sections, H3 pour les sous-sous-sections',
      ],
    }
  }

  // ── Images Alt Text ──
  if (check.id === 'content_images' && check.status !== 'passed') {
    return {
      id: 'fix-images-alt',
      priority: 'haute',
      category: 'Contenu',
      title: 'Ajouter les attributs alt aux images',
      description: `${check.value} — Les images sans alt sont invisibles pour Google et les LLMs.`,
      impact: 'Ameliore le SEO images (+15% trafic image) et l\'accessibilite RGAA',
      estimatedTime: '15-30 minutes selon le nombre d\'images',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: 'Envoyez vos images a Claude et demandez des descriptions alt optimisees SEO', free: true },
        { name: 'Lovable', type: 'ai', url: 'https://lovable.dev', description: 'Si votre site est sur Lovable, editez les composants image directement', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'HTML — Alt descriptif', code: `<img src="photo-equipe.jpg" alt="Equipe Kayzen Web dans leurs bureaux a Lyon" width="800" height="600" loading="lazy">`, where: 'Sur chaque balise <img>' },
        { language: 'jsx', label: 'Next.js — Image component', code: `import Image from 'next/image'\n\n<Image\n  src="/photo-equipe.jpg"\n  alt="Equipe Kayzen Web dans leurs bureaux a Lyon"\n  width={800}\n  height={600}\n/>`, where: 'Dans vos composants React' },
      ],
      steps: [
        'Listez toutes les images sans alt (l\'audit vous les indique)',
        'Pour chaque image, ecrivez une description de 5-15 mots',
        'Incluez le mot-cle si pertinent (pas de bourrage)',
        'Ajoutez aussi width et height pour eviter le CLS',
        'Ajoutez loading="lazy" pour les images sous le fold',
      ],
    }
  }

  // ── HTTPS ──
  if (check.id === 'tech_https' && check.status !== 'passed') {
    return {
      id: 'fix-https',
      priority: 'critique',
      category: 'Technique',
      title: 'Passer en HTTPS',
      description: 'Votre site n\'est pas en HTTPS. C\'est un facteur de classement Google et un signal de confiance pour les LLMs.',
      impact: 'CRITIQUE — Google penalise les sites HTTP. Les LLMs ne citent presque jamais des sources non-securisees.',
      estimatedTime: '30 minutes a 2 heures',
      tools: [
        { name: 'Let\'s Encrypt', type: 'platform', url: 'https://letsencrypt.org', description: 'Certificat SSL gratuit', free: true },
        { name: 'Cloudflare', type: 'platform', url: 'https://cloudflare.com', description: 'SSL gratuit + CDN + protection DDoS', free: true },
        { name: 'Vercel', type: 'platform', url: 'https://vercel.com', description: 'HTTPS automatique sur tous les deployments', free: true },
      ],
      codeSnippets: [
        { language: 'nginx', label: 'Nginx — Redirect HTTP vers HTTPS', code: `server {\n  listen 80;\n  server_name votresite.fr;\n  return 301 https://$host$request_uri;\n}`, where: 'Dans votre fichier nginx.conf' },
        { language: 'apache', label: 'Apache — .htaccess', code: `RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`, where: 'Dans .htaccess a la racine' },
      ],
      steps: [
        'Obtenez un certificat SSL (Let\'s Encrypt = gratuit)',
        'Installez le certificat sur votre serveur',
        'Configurez la redirection HTTP → HTTPS (301)',
        'Mettez a jour tous les liens internes en HTTPS',
        'Verifiez dans Google Search Console',
      ],
    }
  }

  // ── Structured Data ──
  if (check.id === 'tech_structured_data' && check.status !== 'passed') {
    return {
      id: 'fix-structured-data',
      priority: 'haute',
      category: 'Technique',
      title: 'Ajouter des donnees structurees JSON-LD',
      description: 'Aucune donnee structuree detectee. Les schemas JSON-LD sont essentiels pour les rich snippets et la visibilite IA.',
      impact: 'Les pages avec schema obtiennent +30% de CTR et sont 2x plus citees par les LLMs',
      estimatedTime: '15-30 minutes',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: 'Prompt: "Genere le schema JSON-LD Organization + WebSite pour mon site [url]"', free: true },
        { name: 'Schema Markup Generator', type: 'platform', url: 'https://technicalseo.com/tools/schema-markup-generator/', description: 'Generateur visuel de schemas', free: true },
        { name: 'Google Rich Results Test', type: 'platform', url: 'https://search.google.com/test/rich-results', description: 'Tester et valider vos schemas', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'Schema Organization', code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Votre Entreprise",\n  "url": "https://votresite.fr",\n  "logo": "https://votresite.fr/logo.png",\n  "contactPoint": {\n    "@type": "ContactPoint",\n    "telephone": "+33-X-XX-XX-XX-XX",\n    "contactType": "customer service"\n  },\n  "sameAs": [\n    "https://linkedin.com/company/votre-entreprise",\n    "https://twitter.com/votre-entreprise"\n  ]\n}\n</script>`, where: 'Dans le <head> de toutes vos pages' },
        { language: 'html', label: 'Schema FAQPage', code: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n    {\n      "@type": "Question",\n      "name": "Votre question ici ?",\n      "acceptedAnswer": {\n        "@type": "Answer",\n        "text": "Votre reponse detaillee ici."\n      }\n    }\n  ]\n}\n</script>`, where: 'Sur les pages avec une section FAQ' },
        { language: 'jsx', label: 'Next.js — Layout', code: `const jsonLd = {\n  '@context': 'https://schema.org',\n  '@type': 'Organization',\n  name: 'Votre Entreprise',\n  url: 'https://votresite.fr',\n  logo: 'https://votresite.fr/logo.png',\n}\n\n<script\n  type="application/ld+json"\n  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n/>`, where: 'Dans votre layout.tsx' },
      ],
      steps: [
        'Ajoutez un schema Organization sur toutes les pages',
        'Ajoutez un schema WebSite avec SearchAction sur la homepage',
        'Ajoutez FAQPage sur les pages avec des FAQ',
        'Ajoutez Article/BlogPosting sur les articles de blog',
        'Testez avec Google Rich Results Test',
        'Verifiez dans Google Search Console > Ameliorations',
      ],
    }
  }

  // ── Open Graph ──
  if (check.id === 'meta_og' && check.status !== 'passed') {
    return {
      id: 'fix-og',
      priority: 'moyenne',
      category: 'Meta & SEO',
      title: 'Ajouter les balises Open Graph',
      description: 'Les balises OG manquent. Elles controlent l\'apparence de votre site quand il est partage sur les reseaux sociaux.',
      impact: 'Ameliore le CTR sur les reseaux sociaux de 2-3x',
      estimatedTime: '10 minutes',
      tools: [
        { name: 'Nexus SEO', type: 'platform', url: 'https://nexus.kayzen-lyon.fr/api/og', description: 'Generateur d\'images OG dynamiques integre', free: true },
        { name: 'Metatags.io', type: 'platform', url: 'https://metatags.io', description: 'Previsualisation des balises OG', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'HTML — Open Graph complet', code: `<meta property="og:title" content="Titre de la page">\n<meta property="og:description" content="Description courte et engageante">\n<meta property="og:image" content="https://votresite.fr/og-image.png">\n<meta property="og:url" content="https://votresite.fr/page">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="fr_FR">`, where: 'Dans le <head>' },
        { language: 'jsx', label: 'Next.js', code: `export const metadata = {\n  openGraph: {\n    title: 'Titre de la page',\n    description: 'Description engageante',\n    images: ['/og-image.png'],\n    url: 'https://votresite.fr',\n    type: 'website',\n    locale: 'fr_FR',\n  },\n}`, where: 'page.tsx' },
      ],
      steps: [
        'Ajoutez og:title, og:description, og:image sur chaque page',
        'Creez une image OG de 1200x630px pour chaque page',
        'Testez avec le debugger Facebook et Twitter Card Validator',
      ],
    }
  }

  // ── Load Time ──
  if (check.id === 'tech_load_time' && check.status !== 'passed') {
    return {
      id: 'fix-speed',
      priority,
      category: 'Performance',
      title: 'Ameliorer le temps de chargement',
      description: `Temps de chargement: ${check.value}. L'objectif est < 3 secondes.`,
      impact: 'Chaque seconde de retard = -7% de conversions. Google penalise les sites lents.',
      estimatedTime: '1-4 heures',
      tools: [
        { name: 'Google PageSpeed Insights', type: 'platform', url: 'https://pagespeed.web.dev', description: 'Audit detaille avec recommandations Google', free: true },
        { name: 'Cloudflare', type: 'platform', url: 'https://cloudflare.com', description: 'CDN gratuit + compression automatique', free: true },
        { name: 'TinyPNG', type: 'platform', url: 'https://tinypng.com', description: 'Compression d\'images sans perte de qualite', free: true },
        { name: 'Squoosh', type: 'platform', url: 'https://squoosh.app', description: 'Conversion images en WebP/AVIF', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'Lazy loading images', code: `<!-- Ajoutez loading="lazy" a toutes les images sous le fold -->\n<img src="photo.jpg" alt="Description" width="800" height="600" loading="lazy">`, where: 'Sur chaque balise <img> sauf la hero image' },
        { language: 'html', label: 'Preconnect fonts', code: `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, where: 'En haut du <head>' },
        { language: 'nginx', label: 'Compression Gzip', code: `gzip on;\ngzip_types text/plain text/css application/json application/javascript text/xml;\ngzip_min_length 256;`, where: 'nginx.conf' },
      ],
      steps: [
        'Lancez un audit PageSpeed Insights',
        'Compressez toutes les images (WebP, < 100KB)',
        'Activez la compression Gzip/Brotli sur le serveur',
        'Ajoutez lazy loading sur les images et iframes',
        'Differez le chargement des scripts non-critiques',
        'Utilisez un CDN (Cloudflare = gratuit)',
        'Optimisez les polices (preconnect + font-display: swap)',
      ],
    }
  }

  // ── Word Count ──
  if (check.id === 'content_word_count' && check.status !== 'passed') {
    return {
      id: 'fix-content-length',
      priority: 'haute',
      category: 'Contenu',
      title: 'Enrichir le contenu de la page',
      description: `${check.value} — Les pages avec moins de 300 mots sont rarement classees par Google et jamais citees par les LLMs.`,
      impact: 'Les pages de 1500+ mots obtiennent 3x plus de trafic et sont 5x plus citees par les IA',
      estimatedTime: '1-3 heures',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: 'Generez du contenu structure et optimise SEO', free: true },
        { name: 'Nexus SEO Content', type: 'platform', url: 'https://nexus.kayzen-lyon.fr/dashboard/ai-content', description: 'Generateur de contenu SEO integre', free: true },
        { name: 'Surfer SEO', type: 'platform', url: 'https://surferseo.com', description: 'Optimisation de contenu basee sur les SERPs', free: false },
      ],
      codeSnippets: [],
      steps: [
        'Analysez les pages concurrentes dans les SERPs pour ce mot-cle',
        'Visez 1500-2500 mots pour un article de blog, 500-1000 pour une page service',
        'Structurez avec H2/H3 (1 H2 tous les 200-300 mots)',
        'Ajoutez des listes a puces, des tableaux, des chiffres',
        'Incluez une section FAQ avec 5-8 questions',
        'Ajoutez des liens internes vers d\'autres pages de votre site',
        'Mettez a jour regulierement (tous les 3-6 mois)',
      ],
    }
  }

  // ── Security Headers ──
  if (check.id === 'security_headers' && check.status !== 'passed') {
    return {
      id: 'fix-security',
      priority: 'moyenne',
      category: 'Securite',
      title: 'Ajouter les en-tetes de securite',
      description: 'Headers de securite manquants (CSP, X-Frame-Options, X-Content-Type-Options).',
      impact: 'Ameliore la confiance Google et protege vos utilisateurs',
      estimatedTime: '15-30 minutes',
      tools: [
        { name: 'Security Headers', type: 'platform', url: 'https://securityheaders.com', description: 'Testeur de headers de securite', free: true },
      ],
      codeSnippets: [
        { language: 'javascript', label: 'Next.js — next.config.js', code: `// next.config.js\nconst securityHeaders = [\n  { key: 'X-Frame-Options', value: 'DENY' },\n  { key: 'X-Content-Type-Options', value: 'nosniff' },\n  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },\n  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },\n]\n\nmodule.exports = {\n  async headers() {\n    return [{ source: '/(.*)', headers: securityHeaders }]\n  },\n}`, where: 'next.config.js a la racine du projet' },
        { language: 'apache', label: 'Apache .htaccess', code: `Header set X-Frame-Options "DENY"\nHeader set X-Content-Type-Options "nosniff"\nHeader set Referrer-Policy "strict-origin-when-cross-origin"\nHeader set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"`, where: '.htaccess' },
      ],
      steps: [
        'Testez vos headers actuels sur securityheaders.com',
        'Ajoutez les headers manquants dans votre configuration serveur',
        'Testez a nouveau pour verifier',
      ],
    }
  }

  // ── Viewport ──
  if (check.id === 'mobile_viewport' && check.status !== 'passed') {
    return {
      id: 'fix-viewport',
      priority: 'critique',
      category: 'Mobile',
      title: 'Ajouter la balise viewport',
      description: 'La balise viewport est manquante. Votre site ne s\'affiche pas correctement sur mobile.',
      impact: 'CRITIQUE — 60%+ du trafic est mobile. Google utilise le mobile-first indexing.',
      estimatedTime: '2 minutes',
      tools: [],
      codeSnippets: [
        { language: 'html', label: 'HTML', code: `<meta name="viewport" content="width=device-width, initial-scale=1">`, where: 'Dans le <head> de TOUTES vos pages' },
      ],
      steps: [
        'Ajoutez la balise viewport dans le <head>',
        'Testez le rendu mobile sur mobile.dev',
      ],
    }
  }

  // ── Generic fallback ──
  if (check.status !== 'passed') {
    return {
      id: `fix-${check.id}`,
      priority,
      category: check.category,
      title: `Corriger: ${check.name}`,
      description: `${check.value} — Score: ${check.score}/100`,
      impact: 'Amelioration du score SEO global',
      estimatedTime: '10-30 minutes',
      tools: [
        { name: 'Claude', type: 'ai', url: 'https://claude.ai', description: `Demandez: "Comment corriger le probleme ${check.name} sur mon site ?"`, free: true },
        { name: 'Google Search Console', type: 'platform', url: 'https://search.google.com/search-console', description: 'Verifiez les erreurs detectees par Google', free: true },
      ],
      codeSnippets: [],
      steps: [
        `Analysez le probleme: ${check.name}`,
        'Identifiez la cause racine',
        'Appliquez la correction',
        'Relancez un audit pour verifier',
      ],
    }
  }

  return null
}

// ─── Performance Recommendations ──────────────────────────────

export function generatePerformanceRecommendations(metrics: {
  lcp: number; cls: number; tbt: number; fcp: number; ttfb: number; score: number
}): ActionableRec[] {
  const recs: ActionableRec[] = []

  if (metrics.lcp > 2500) {
    recs.push({
      id: 'fix-lcp',
      priority: metrics.lcp > 4000 ? 'critique' : 'haute',
      category: 'Core Web Vitals',
      title: `Reduire le LCP (${Math.round(metrics.lcp)}ms → < 2500ms)`,
      description: 'Le Largest Contentful Paint est trop lent. L\'element le plus grand de la page met trop de temps a s\'afficher.',
      impact: 'Le LCP est le Core Web Vital le plus important pour le classement Google',
      estimatedTime: '1-3 heures',
      tools: [
        { name: 'Google PageSpeed Insights', type: 'platform', url: 'https://pagespeed.web.dev', description: 'Identifie l\'element LCP et les causes', free: true },
        { name: 'WebPageTest', type: 'platform', url: 'https://webpagetest.org', description: 'Film strip detaille du chargement', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'Preload de l\'image hero', code: `<link rel="preload" as="image" href="/hero-image.webp" fetchpriority="high">`, where: 'Dans le <head>, pour l\'image LCP' },
        { language: 'html', label: 'Priority hints', code: `<img src="/hero.webp" alt="..." fetchpriority="high" width="1200" height="600">`, where: 'Sur l\'image hero / LCP element' },
      ],
      steps: [
        'Identifiez l\'element LCP avec PageSpeed Insights',
        'Si c\'est une image: preload + format WebP + compression',
        'Si c\'est du texte: optimisez les fonts (preconnect + font-display: swap)',
        'Reduisez les render-blocking resources (defer JS, inline critical CSS)',
        'Utilisez un CDN pour servir les assets plus rapidement',
      ],
    })
  }

  if (metrics.cls > 0.1) {
    recs.push({
      id: 'fix-cls',
      priority: metrics.cls > 0.25 ? 'critique' : 'haute',
      category: 'Core Web Vitals',
      title: `Reduire le CLS (${metrics.cls} → < 0.1)`,
      description: 'Le Cumulative Layout Shift est trop eleve. Les elements bougent pendant le chargement.',
      impact: 'Un CLS eleve = mauvaise experience utilisateur + penalite Google',
      estimatedTime: '30 minutes - 2 heures',
      tools: [
        { name: 'Layout Shift Debugger', type: 'platform', url: 'https://webvitals.dev/cls', description: 'Visualise les layout shifts', free: true },
      ],
      codeSnippets: [
        { language: 'css', label: 'Reserve d\'espace pour images', code: `img, video {\n  width: 100%;\n  height: auto;\n  aspect-ratio: 16 / 9; /* Ajustez selon vos images */\n}`, where: 'Dans votre CSS global' },
        { language: 'css', label: 'Reserve pour fonts', code: `@font-face {\n  font-family: 'MaFont';\n  src: url('/font.woff2') format('woff2');\n  font-display: swap; /* Evite le FOIT */\n  size-adjust: 100%; /* Evite le layout shift */\n}`, where: 'CSS global' },
      ],
      steps: [
        'Ajoutez width et height a TOUTES les images et videos',
        'Utilisez font-display: swap pour les polices web',
        'Reservez l\'espace pour les pubs/bannieres avec CSS',
        'Evitez d\'inserer du contenu dynamique au-dessus du fold',
      ],
    })
  }

  if (metrics.tbt > 200) {
    recs.push({
      id: 'fix-tbt',
      priority: metrics.tbt > 500 ? 'haute' : 'moyenne',
      category: 'Core Web Vitals',
      title: `Reduire le TBT (${Math.round(metrics.tbt)}ms → < 200ms)`,
      description: 'Le Total Blocking Time est trop eleve. Le JavaScript bloque le thread principal trop longtemps.',
      impact: 'Impact direct sur l\'interactivite et le score Performance',
      estimatedTime: '2-4 heures',
      tools: [
        { name: 'Chrome DevTools', type: 'code', description: 'Onglet Performance > Long Tasks', free: true },
        { name: 'Bundlephobia', type: 'platform', url: 'https://bundlephobia.com', description: 'Verifiez le poids de vos dependances npm', free: true },
      ],
      codeSnippets: [
        { language: 'html', label: 'Defer JavaScript', code: `<!-- Avant -->\n<script src="/app.js"></script>\n\n<!-- Apres -->\n<script src="/app.js" defer></script>`, where: 'Sur tous les <script> non-critiques' },
        { language: 'javascript', label: 'Code splitting (Next.js)', code: `import dynamic from 'next/dynamic'\n\n// Lazy load les composants lourds\nconst HeavyChart = dynamic(() => import('./HeavyChart'), {\n  loading: () => <p>Chargement...</p>,\n  ssr: false,\n})`, where: 'Dans vos composants React' },
      ],
      steps: [
        'Identifiez les Long Tasks dans Chrome DevTools',
        'Differez le JavaScript non-critique (defer/async)',
        'Utilisez le code splitting pour les gros composants',
        'Supprimez les dependances inutilisees',
        'Envisagez les Web Workers pour les calculs lourds',
      ],
    })
  }

  return recs.sort((a, b) => {
    const p = { critique: 0, haute: 1, moyenne: 2, basse: 3 }
    return p[a.priority] - p[b.priority]
  })
}

// ─── Export Helpers ────────────────────────────────────────────

export function exportRecommendationsAsMarkdown(recs: ActionableRec[], siteName: string): string {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  let md = `# Plan d'action SEO — ${siteName}\n`
  md += `*Genere par Nexus SEO le ${date}*\n\n`
  md += `## Resume\n`
  md += `- ${recs.filter(r => r.priority === 'critique').length} actions critiques\n`
  md += `- ${recs.filter(r => r.priority === 'haute').length} actions haute priorite\n`
  md += `- ${recs.filter(r => r.priority === 'moyenne').length} actions moyenne priorite\n`
  md += `- ${recs.filter(r => r.priority === 'basse').length} actions basse priorite\n\n`
  md += `---\n\n`

  for (const rec of recs) {
    md += `## ${rec.priority === 'critique' ? '🔴' : rec.priority === 'haute' ? '🟠' : rec.priority === 'moyenne' ? '🟡' : '🟢'} [${rec.priority.toUpperCase()}] ${rec.title}\n\n`
    md += `**Categorie:** ${rec.category} | **Temps estime:** ${rec.estimatedTime}\n\n`
    md += `${rec.description}\n\n`
    md += `**Impact:** ${rec.impact}\n\n`

    if (rec.steps.length > 0) {
      md += `### Etapes\n\n`
      rec.steps.forEach((step, i) => { md += `${i + 1}. ${step}\n` })
      md += `\n`
    }

    if (rec.tools.length > 0) {
      md += `### Outils recommandes\n\n`
      rec.tools.forEach(tool => {
        md += `- **${tool.name}**${tool.free ? ' (gratuit)' : ''}: ${tool.description}${tool.url ? ` — ${tool.url}` : ''}\n`
      })
      md += `\n`
    }

    if (rec.codeSnippets.length > 0) {
      md += `### Code a implanter\n\n`
      rec.codeSnippets.forEach(snippet => {
        md += `**${snippet.label}** *(${snippet.where})*\n\n`
        md += `\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n`
      })
    }

    md += `---\n\n`
  }

  md += `\n*Genere par [Nexus SEO](https://nexus.kayzen-lyon.fr) — Outil SEO & IA gratuit par Kayzen Web*\n`
  return md
}

export function exportRecommendationsAsHTML(recs: ActionableRec[], siteName: string): string {
  const date = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
  const priorityColors: Record<string, string> = { critique: '#dc2626', haute: '#ea580c', moyenne: '#ca8a04', basse: '#2563eb' }

  let html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Plan d'action SEO — ${siteName}</title>
<style>
body{font-family:Inter,system-ui,sans-serif;max-width:900px;margin:0 auto;padding:2rem;color:#1a1a1a;line-height:1.6}
h1{color:#2563eb;border-bottom:3px solid #2563eb;padding-bottom:.5rem}
h2{margin-top:2rem}h3{color:#374151;font-size:.95rem}
.badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:.75rem;font-weight:700;color:#fff;margin-right:8px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:1.5rem;margin:1rem 0;background:#fafafa}
pre{background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:8px;overflow-x:auto;font-size:.85rem}
code{font-family:'JetBrains Mono',monospace}.tool{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:.8rem;margin:2px}
.tool.free{border-color:#22c55e;color:#16a34a}
.steps li{margin:.5rem 0}
@media print{body{font-size:11pt}.card{break-inside:avoid}pre{font-size:9pt}}
</style></head><body>
<h1>Plan d'action SEO</h1>
<p><strong>${siteName}</strong> — ${date}</p>
<p>${recs.filter(r => r.priority === 'critique').length} critiques | ${recs.filter(r => r.priority === 'haute').length} hautes | ${recs.filter(r => r.priority === 'moyenne').length} moyennes | ${recs.filter(r => r.priority === 'basse').length} basses</p>`

  for (const rec of recs) {
    html += `<div class="card">
<h2><span class="badge" style="background:${priorityColors[rec.priority]}">${rec.priority.toUpperCase()}</span>${rec.title}</h2>
<p><strong>${rec.category}</strong> | Temps: ${rec.estimatedTime}</p>
<p>${rec.description}</p>
<p><strong>Impact:</strong> ${rec.impact}</p>`

    if (rec.steps.length > 0) {
      html += `<h3>Etapes</h3><ol class="steps">`
      rec.steps.forEach(s => { html += `<li>${s}</li>` })
      html += `</ol>`
    }

    if (rec.tools.length > 0) {
      html += `<h3>Outils</h3><div>`
      rec.tools.forEach(t => {
        html += `<span class="tool${t.free ? ' free' : ''}">${t.name}${t.free ? ' (gratuit)' : ''}</span> `
      })
      html += `</div>`
    }

    if (rec.codeSnippets.length > 0) {
      html += `<h3>Code a implanter</h3>`
      rec.codeSnippets.forEach(s => {
        html += `<p><strong>${s.label}</strong> <em>(${s.where})</em></p><pre><code>${s.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
      })
    }

    html += `</div>`
  }

  html += `<p style="margin-top:2rem;color:#888;font-size:.8rem">Genere par <a href="https://nexus.kayzen-lyon.fr">Nexus SEO</a> — Outil SEO & IA gratuit par Kayzen Web</p></body></html>`
  return html
}
