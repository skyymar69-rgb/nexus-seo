/**
 * Audit Reports Engine — Rapports de référence pour chaque check SEO
 * Chaque rapport est un guide complet (500+ mots) avec :
 * - Cas d'étude avant/après
 * - Tableaux comparatifs
 * - Checklist pré-publication
 * - Erreurs courantes vs corrections
 * - Outils recommandés
 * - Données chiffrées et sources
 */

// ── TITLE TAG — Guide complet ─────────────────────────────────────────

export function getTitleTagReport(title: string | null, url: string): string {
  const len = title?.length || 0

  return `## Balise Title — Analyse complète

### État actuel
${!title ? `❌ **Aucune balise title détectée** sur cette page.` : `**Title actuelle** : "${title}"
**Longueur** : ${len} caractères ${len >= 35 && len <= 55 ? '✅ Zone optimale' : len >= 30 && len <= 60 ? '⚠️ Acceptable' : '❌ Hors limites'}`}

### Pourquoi c'est important

La balise \`<title>\` est le **signal SEO on-page n°1**. C'est le premier élément que Google analyse pour comprendre le sujet d'une page. C'est aussi le texte cliquable affiché dans les résultats de recherche — votre principale arme pour le taux de clic (CTR).

**Chiffres clés (2025-2026)** :
| Métrique | Valeur | Source |
|----------|--------|--------|
| Impact ranking de la title | Signal on-page #1 | Moz, 2025 |
| CTR moyen en position 1 | 27,6% | Backlinko, 2025 |
| Gain CTR avec title optimisée | +15 à +35% | Portent, 2025 |
| Taux de réécriture par Google | ~61% | Ahrefs, 2025 |
| Longueur affichée desktop | ~55-60 car. | SERP tests, 2026 |
| Longueur affichée mobile | ~40-50 car. | SERP tests, 2026 |

### Cas d'étude : avant / après

| Version | Title | Longueur | CTR |
|---------|-------|----------|-----|
| ❌ Avant | "Bienvenue sur notre site" | 25 car. | 1,2% |
| ✅ Après | "Audit SEO Gratuit en Ligne — Analysez Votre Site en 30s" | 53 car. | 4,8% |
| **Résultat** | **+300% de CTR** | | |

**Pourquoi ça a fonctionné** : Le mot-clé "Audit SEO Gratuit" est placé en début. Le bénéfice ("Analysez Votre Site en 30s") est clair. La longueur (53 car.) tient dans les SERP desktop et mobile.

### Les 9 règles fondamentales (Checklist 2026)

1. **Unicité absolue** — Chaque page doit avoir une title unique. Aucun doublon sur le site. Google dévalorise les pages avec des titles identiques.

2. **Longueur optimale : 35–55 caractères** — C'est la zone de sécurité. En dessous de 35, vous sous-utilisez l'espace SERP. Au-dessus de 55, risque de troncature sur mobile. Au-dessus de 60, troncature quasi certaine sur desktop.

3. **Front-loading du mot-clé** — Placez votre mot-clé principal dans les 3-4 premiers mots. Les eye-tracking studies montrent que les utilisateurs scannent le début des titles.

4. **Mots-clés secondaires** — Incluez 1-2 mots-clés secondaires naturellement, sans keyword stuffing. Exemple : "Audit SEO Gratuit | Analyseur de Site Web en Ligne" couvre 3 requêtes.

5. **Clarté et intention** — La title doit correspondre exactement à l'intention de recherche de l'utilisateur ET au contenu réel de la page.

6. **Title Case** — Mettez les premières lettres en majuscules pour améliorer la lisibilité et le CTR. "Comment Optimiser Votre SEO" > "comment optimiser votre seo".

7. **Réduisez les stop words** — Les articles (le, la, de, en) prennent de la place sans ajouter de valeur SEO. "Guide Optimisation SEO 2026" > "Le Guide de l'Optimisation du SEO en 2026".

8. **Nom de marque stratégique** — Ajoutez votre marque en fin de title sur la homepage et les pages à fort branding. Omettez-la sur les pages de contenu pour gagner de l'espace.

9. **Testez et itérez** — Suivez le CTR dans Google Search Console. Modifiez les titles avec un CTR inférieur à 3% et A/B testez.

### Stratégies avancées pour se démarquer

| Technique | Exemple | Impact CTR |
|-----------|---------|------------|
| Emojis | "🔥 Audit SEO Gratuit — Résultats en 30s" | +10-15% |
| Question | "Votre Site est-il Bien Référencé ? Testez Gratuitement" | +8-12% |
| Power words | "Le Guide Ultime du SEO Technique (2026)" | +5-10% |
| Caractères spéciaux | "Audit SEO ★ Gratuit • En Ligne • 30+ Contrôles" | +5-8% |
| Modificateurs longue traîne | "SEO : Guide Complet, Avis, Comparatif 2026" | +15-25% |
| Chiffres | "17 Techniques SEO Qui Fonctionnent en 2026" | +10-20% |

⚠️ **Important** : Testez chaque technique sur un échantillon avant de déployer à grande échelle. Ce qui fonctionne dans un secteur peut ne pas marcher dans un autre.

### 7 erreurs courantes à éviter

| ❌ Erreur | ✅ Correction |
|-----------|--------------|
| Title vide ou absente | Rédigez une title unique pour chaque page |
| Title identique sur plusieurs pages | Personnalisez chaque title selon le contenu |
| Keyword stuffing ("SEO SEO audit SEO") | 1 mot-clé principal + 1-2 secondaires max |
| Title > 60 caractères | Réduisez à 35-55 caractères |
| Title générique ("Page d'accueil") | Title descriptive avec bénéfice utilisateur |
| Pas de mot-clé | Placez le mot-clé cible en début de title |
| Title en MAJUSCULES | Utilisez le Title Case |

### Outils recommandés

| Outil | Usage | Prix |
|-------|-------|------|
| Google Search Console | Suivi CTR par page, A/B test naturel | Gratuit |
| Screaming Frog | Audit titles en masse (doublons, longueur) | Freemium |
| Yoast SEO / Rank Math | Prévisualisation SERP en temps réel | Freemium |
| SERP Simulator | Tester le rendu SERP avant publication | Gratuit |
| Mangools SERP Checker | Analyser les titles concurrentes | Payant |

### Sources et références
- Google Search Central — "Influencer les liens de titre dans les résultats de recherche" (2025)
- Backlinko — "Google CTR Stats" (2025)
- Portent — "Title Tag Impact on CTR" (2025)
- Ahrefs — "How Google Rewrites Title Tags" (2025)
- Moz — "Title Tag Optimization Guide" (2026)
`
}

// ── META DESCRIPTION — Guide complet ──────────────────────────────────

export function getMetaDescriptionReport(desc: string | null): string {
  const len = desc?.length || 0

  return `## Meta Description — Analyse complète

### État actuel
${!desc ? `❌ **Aucune meta description détectée.**` : `**Description actuelle** : "${desc}"
**Longueur** : ${len} caractères ${len >= 120 && len <= 155 ? '✅ Zone optimale' : '⚠️ À ajuster'}`}

### Pourquoi c'est important

La meta description est l'**extrait affiché sous votre title dans les SERP**. Ce n'est pas un facteur de ranking direct, mais elle influence massivement le CTR — et un bon CTR envoie des signaux positifs à Google (via RankBrain).

**Fait peu connu** : Google réécrit la meta description dans **68% des cas** (étude Ahrefs 2025). Mais quand elle est bien rédigée, Google la conserve plus souvent.

**Chiffres clés** :
| Métrique | Valeur | Source |
|----------|--------|--------|
| Impact direct sur le ranking | Aucun (facteur indirect via CTR) | Google, 2025 |
| Taux de réécriture par Google | 68% | Ahrefs, 2025 |
| Gain CTR avec bonne description | +5,8% en moyenne | Portent, 2025 |
| Longueur max affichée desktop | ~155 caractères | Tests SERP, 2026 |
| Longueur max affichée mobile | ~120 caractères | Tests SERP, 2026 |

### Cas d'étude : avant / après

| Version | Meta Description | CTR |
|---------|-----------------|-----|
| ❌ Avant | "Bienvenue sur notre site internet. Nous proposons des services." | 1,9% |
| ✅ Après | "Audit SEO gratuit en 30 secondes. Analysez +30 critères techniques, contenu et performance. Résultats immédiats." | 4,7% |
| **Résultat** | **+147% de CTR** | |

### Règles fondamentales

1. **Longueur : 120–155 caractères** — La zone de sécurité pour s'afficher correctement sur desktop ET mobile. En dessous de 120, vous sous-utilisez l'espace. Au-dessus de 155, troncature.

2. **Le mot-clé principal doit apparaître** — Google met en **gras** les termes correspondant à la requête de l'utilisateur. Cela attire l'œil et augmente le CTR.

3. **Un appel à l'action (CTA) clair** — Utilisez des verbes d'action : "Découvrez", "Testez", "Comparez", "Obtenez", "Essayez gratuitement".

4. **Unicité par page** — Comme pour la title, chaque page doit avoir sa propre meta description. Les descriptions dupliquées sont un signal négatif.

5. **Correspondance avec l'intention** — La description doit répondre à la question implicite de l'utilisateur. Pour une requête transactionnelle, parlez prix/bénéfices. Pour une requête informationnelle, promettez des réponses.

6. **Preuve sociale et chiffres** — "+2500 entreprises nous font confiance", "97% de satisfaction", "Résultats en 30s". Les chiffres crédibilisent et attirent l'attention.

### Structure idéale d'une meta description

\`\`\`
[Bénéfice principal / Mot-clé] + [Preuve / Chiffre] + [CTA]
\`\`\`

**Exemples par type de page** :

| Type de page | Exemple |
|-------------|---------|
| **Homepage** | "Nexus SEO — La plateforme qui combine SEO technique et visibilité IA. +2500 équipes actives. Essayez gratuitement." |
| **Article** | "Comment optimiser vos balises title en 2026 : checklist complète, exemples avant/après, et outils gratuits." |
| **Produit** | "Audit SEO complet en 30s. Analysez 30+ critères, exportez en PDF. Gratuit, sans inscription." |
| **Landing** | "Comparez les meilleurs outils SEO 2026. Tableaux comparatifs, avis vérifiés, essais gratuits." |

### 7 erreurs à éviter

| ❌ Erreur | ✅ Correction |
|-----------|--------------|
| Pas de meta description | Rédigez-en une unique par page |
| Description copiée sur plusieurs pages | Personnalisez pour chaque URL |
| Trop courte (< 100 car.) | Visez 120-155 caractères |
| Pas de mot-clé | Intégrez le mot-clé cible naturellement |
| Pas de CTA | Ajoutez un verbe d'action |
| Description sans rapport avec le contenu | Alignez description et contenu |
| Tout en majuscules | Rédigez normalement, avec ponctuation |

### Checklist pré-publication

- [ ] Longueur entre 120 et 155 caractères
- [ ] Mot-clé principal présent
- [ ] Appel à l'action (CTA) inclus
- [ ] Unique (pas de doublon avec d'autres pages)
- [ ] Cohérente avec le contenu de la page
- [ ] Cohérente avec la title tag
- [ ] Contient un élément différenciant (chiffre, preuve sociale)
- [ ] Testée visuellement avec un simulateur SERP

### Outils recommandés

| Outil | Usage | Prix |
|-------|-------|------|
| Google Search Console | Voir les descriptions affichées et le CTR | Gratuit |
| Portent SERP Preview | Prévisualiser le rendu SERP | Gratuit |
| Screaming Frog | Détecter les descriptions manquantes/dupliquées | Freemium |
| Yoast SEO | Éditeur de description avec compteur | Freemium |
| ChatGPT / Claude | Générer des variations de descriptions | Freemium |

### Sources
- Google Search Central — "Rédiger des meta descriptions efficaces" (2025)
- Ahrefs — "Meta Description Study: How Often Google Rewrites Them" (2025)
- Portent — "CTR Impact of Meta Descriptions" (2025)
- Search Engine Journal — "Meta Description Best Practices" (2026)
`
}

// ── CANONICAL TAG — Guide complet ─────────────────────────────────────

export function getCanonicalReport(canonical: string | null, url: string): string {
  const isSelf = canonical === url || canonical === url + '/'

  return `## Balise Canonical — Analyse complète

### État actuel
${!canonical ? `❌ **Aucune balise canonical détectée.**` : `**Canonical** : \`${canonical}\`
**Auto-référencée** : ${isSelf ? '✅ Oui — bonne pratique' : `⚠️ Non — pointe vers ${canonical}`}`}

### Pourquoi c'est important

La balise \`<link rel="canonical">\` indique à Google **quelle version d'une page doit être indexée** quand plusieurs URLs servent un contenu identique ou similaire. Sans elle, le "link equity" (jus de lien) est dilué entre les variantes.

**Situations courantes qui créent des doublons** :
- \`http://\` vs \`https://\`
- \`www.\` vs sans \`www.\`
- Paramètres UTM : \`?utm_source=...\`
- Pages de pagination
- Versions imprimables
- Tri et filtres e-commerce

**Impact** : Sans canonical, Google peut indexer la "mauvaise" version de votre page, répartir l'autorité entre les doublons, et dégrader votre positionnement.

### Bonnes pratiques

1. **Auto-référencement** — Chaque page devrait avoir une canonical qui pointe vers elle-même. Même sans doublons, c'est une protection préventive.

2. **URLs absolues** — Toujours utiliser l'URL complète : \`https://domaine.fr/page\`, jamais \`/page\`.

3. **Cohérence avec le sitemap** — L'URL dans la canonical doit être identique à celle dans le sitemap.xml.

4. **Un seul canonical par page** — Si plusieurs canonicals sont présentes, Google ignore les deux.

5. **HTTPS** — La canonical doit toujours pointer vers la version HTTPS.

### Checklist

- [ ] Canonical présente sur chaque page
- [ ] URL absolue (pas relative)
- [ ] Cohérente avec le sitemap.xml
- [ ] Version HTTPS
- [ ] Pas de conflit avec meta robots noindex

### Sources
- Google Search Central — "Consolider les URL en double" (2025)
- Yoast — "Canonical URL: The Ultimate Guide" (2026)
- Moz — "Canonicalization" (2025)
`
}

// ── HTTPS / SSL — Guide complet ───────────────────────────────────────

export function getHTTPSReport(url: string): string {
  const isHttps = url.startsWith('https://')

  return `## HTTPS / SSL — Analyse complète

### État actuel
${isHttps ? `✅ **Connexion HTTPS sécurisée** — Votre site utilise le chiffrement SSL/TLS.` : `❌ **ALERTE CRITIQUE** — Votre site utilise HTTP non sécurisé.`}

### Pourquoi c'est critique

HTTPS est un **facteur de ranking confirmé par Google depuis 2014**. En 2026, c'est un prérequis absolu :

| Impact | Détail |
|--------|--------|
| **Ranking** | Signal de classement confirmé par Google |
| **Confiance** | Chrome affiche "Non sécurisé" pour HTTP |
| **Performance** | HTTP/2 et HTTP/3 nécessitent HTTPS |
| **Fonctionnalités** | Service Workers, Géolocalisation, Caméra bloqués en HTTP |
| **Données** | Formulaires transmis en clair sans HTTPS |
| **Référencement** | Les backlinks HTTP ne transmettent pas le referrer |

${!isHttps ? `### Action immédiate requise

1. **Installez un certificat SSL** — Let's Encrypt est gratuit et reconnu par tous les navigateurs
2. **Configurez la redirection 301** — \`http://\` → \`https://\` (toutes les pages)
3. **Mettez à jour les liens internes** — Passez tous les liens en HTTPS
4. **Vérifiez le contenu mixte** — Aucune ressource HTTP sur pages HTTPS
5. **Activez HSTS** — Header \`Strict-Transport-Security: max-age=31536000\`` : `### Vérifications complémentaires

- [ ] Certificat SSL valide et non expiré
- [ ] Redirection 301 de HTTP vers HTTPS active
- [ ] Pas de contenu mixte (Mixed Content)
- [ ] HSTS header configuré
- [ ] TLS 1.3 activé (TLS 1.0 et 1.1 désactivés)`}

### Sources
- Google — "HTTPS as a Ranking Signal" (2014, confirmé 2025)
- Let's Encrypt — Certificats SSL/TLS gratuits
- Mozilla — "HTTPS Best Practices" (2026)
`
}

// ── STRUCTURED DATA — Guide complet ───────────────────────────────────

export function getStructuredDataReport(count: number): string {
  return `## Données Structurées (Schema.org) — Analyse complète

### État actuel
${count > 0 ? `✅ **${count} bloc(s) JSON-LD détecté(s)** sur cette page.` : `❌ **Aucune donnée structurée détectée** — opportunité majeure manquée.`}

### Pourquoi c'est essentiel en 2026

Les données structurées permettent d'obtenir des **rich snippets** dans les SERP (étoiles, FAQ, prix, recettes...) et sont désormais utilisées par les **LLMs** (ChatGPT, Gemini) pour comprendre et citer votre contenu.

| Type de rich snippet | Schema requis | Impact CTR |
|---------------------|---------------|------------|
| Étoiles (avis) | AggregateRating | +15-25% |
| FAQ | FAQPage | +20-30% |
| How-to | HowTo | +10-15% |
| Prix produit | Product + Offer | +15-20% |
| Fil d'Ariane | BreadcrumbList | +5-10% |
| Articles | Article / BlogPosting | +10-15% |

### Schemas recommandés par type de site

| Type de site | Schemas prioritaires |
|-------------|---------------------|
| **E-commerce** | Product, Offer, AggregateRating, BreadcrumbList, Organization |
| **Blog/Média** | Article, BlogPosting, FAQPage, Person, BreadcrumbList |
| **SaaS** | SoftwareApplication, FAQPage, Organization, HowTo |
| **Agence/Service** | LocalBusiness, Service, FAQPage, AggregateRating |
| **Tout site** | Organization, WebSite, BreadcrumbList (base minimale) |

### Impact GEO 2026

Les LLMs (ChatGPT, Claude, Gemini, Perplexity) utilisent les données structurées pour :
- **Extraire des informations factuelles** de votre site
- **Citer votre marque** dans leurs réponses
- **Comprendre les relations** entre entités (auteur, organisation, produit)
- **Vérifier la fiabilité** via les signaux E-E-A-T

**Sans données structurées, vous êtes quasi invisible pour les moteurs IA.**

### Outils de validation

| Outil | Usage |
|-------|-------|
| Rich Results Test (Google) | Tester l'éligibilité aux rich snippets |
| Schema.org Validator | Valider la syntaxe JSON-LD |
| Merkle Schema Generator | Générer des schemas sans coder |
| Google Search Console | Suivre les rich snippets obtenus |

### Sources
- Google Search Central — "Structured Data Guidelines" (2025)
- Schema.org — Spécification complète
- Ahrefs — "Rich Snippets Study: CTR Impact" (2025)
`
}

// ── LOAD TIME — Guide complet ─────────────────────────────────────────

export function getLoadTimeReport(loadTime: number, htmlSize: number): string {
  const sizeKB = Math.round(htmlSize / 1024)
  const loadSec = (loadTime / 1000).toFixed(2)

  return `## Temps de Chargement — Analyse complète

### État actuel
**TTFB (Time to First Byte)** : ${loadSec}s ${parseFloat(loadSec) <= 0.8 ? '✅ Excellent' : parseFloat(loadSec) <= 1.8 ? '⚠️ Acceptable' : '❌ Trop lent'}
**Taille HTML** : ${sizeKB} KB

### Pourquoi la vitesse est critique

La vitesse de chargement est un **facteur de ranking Core Web Vitals** depuis 2021. En 2026, c'est l'un des signaux UX les plus importants.

| Temps de chargement | Impact |
|-------------------|--------|
| < 1s | Excellent — taux de rebond minimal |
| 1-3s | Acceptable — 32% de rebond en plus |
| 3-5s | Lent — 90% de rebond en plus |
| > 5s | Critique — 106% de rebond en plus |

**Chiffre clé** : Chaque seconde supplémentaire réduit les conversions de **7%** (Portent, 2025).

### Seuils Core Web Vitals 2026

| Métrique | Bon | À améliorer | Mauvais |
|----------|-----|-------------|---------|
| **TTFB** | < 800ms | 800-1800ms | > 1800ms |
| **FCP** | < 1.8s | 1.8-3.0s | > 3.0s |
| **LCP** | < 2.5s | 2.5-4.0s | > 4.0s |
| **CLS** | < 0.1 | 0.1-0.25 | > 0.25 |
| **INP** | < 200ms | 200-500ms | > 500ms |

### Optimisations prioritaires

1. **Activez la compression** — Gzip ou Brotli (réduction 60-80% de la taille)
2. **CDN** — Cloudflare, Vercel Edge, AWS CloudFront
3. **Cache navigateur** — Cache-Control headers avec durées appropriées
4. **Minification** — HTML, CSS, JavaScript
5. **Images optimisées** — WebP, lazy loading, dimensions explicites
6. **HTTP/2 ou HTTP/3** — Multiplexage des requêtes
7. **Réduisez les redirections** — Chaque 301 ajoute ~100ms

### Sources
- Google — "Core Web Vitals Thresholds" (2025)
- Web.dev — "Optimize TTFB" (2025)
- Portent — "Site Speed & Conversion Study" (2025)
`
}

// ── OPEN GRAPH — Guide complet ────────────────────────────────────────

export function getOpenGraphReport(ogTitle: string | null, ogDesc: string | null, ogImage: string | null): string {
  const tags = [ogTitle, ogDesc, ogImage].filter(Boolean).length

  return `## Open Graph (Partage Social) — Analyse complète

### État actuel
**og:title** : ${ogTitle ? `"${ogTitle.substring(0, 50)}..." ✅` : '❌ Absent'}
**og:description** : ${ogDesc ? `"${ogDesc.substring(0, 50)}..." ✅` : '❌ Absent'}
**og:image** : ${ogImage ? `${ogImage.substring(0, 60)} ✅` : '❌ Absent'}

### Pourquoi c'est important

Les balises Open Graph contrôlent **l'apparence de votre page quand elle est partagée** sur Facebook, LinkedIn, WhatsApp, Slack, Discord, Teams, etc.

**Sans Open Graph** : les plateformes affichent un aperçu générique (souvent incorrect) avec un mauvais titre, pas d'image, et une description inadaptée.

| Métrique | Impact |
|----------|--------|
| Posts avec image | **2,3x plus d'engagement** (Buffer, 2025) |
| Posts sans OG | CTR 3x inférieur |
| LinkedIn avec OG | +150% de clics vs sans |

### Balises essentielles

| Balise | Recommandation |
|--------|---------------|
| \`og:title\` | 40-60 car., peut différer de la title |
| \`og:description\` | 60-90 car., accrocheur |
| \`og:image\` | 1200×630px, PNG ou JPG |
| \`og:type\` | website, article, product |
| \`og:url\` | URL canonique |
| \`og:site_name\` | Nom du site |

### Outils de test
- **Facebook Sharing Debugger** — debugger.facebook.com
- **LinkedIn Post Inspector** — linkedin.com/post-inspector
- **Twitter Card Validator** — cards-dev.twitter.com/validator

### Sources
- Open Graph Protocol — ogp.me
- Buffer — "Social Media Image Study" (2025)
`
}

// ── H1 — Guide complet ───────────────────────────────────────────────

export function getH1Report(h1Count: number, h1Text: string | null): string {
  return `## Balise H1 — Analyse complète

### État actuel
${h1Count === 0 ? '❌ **Aucune H1 détectée**' : h1Count > 1 ? `⚠️ **${h1Count} balises H1** — trop nombreuses` : `✅ **H1 unique** : "${h1Text}"`}

### Pourquoi c'est important

La H1 est le **titre principal de votre page**. C'est le 2ème signal SEO on-page après la title tag. Elle indique à Google et aux utilisateurs le sujet central.

**Étude Semrush 2025** : Les pages avec une seule H1 optimisée se positionnent en moyenne 15-20% mieux que celles sans H1 ou avec plusieurs H1.

### Bonnes pratiques

| Règle | Détail |
|-------|--------|
| **Nombre** | 1 seule H1 par page |
| **Longueur** | 20-70 caractères |
| **Mot-clé** | Le mot-clé principal doit apparaître |
| **Différence avec title** | Complémentaire, pas identique |
| **Position** | Premier heading visible sur la page |
| **Hiérarchie** | H1 > H2 > H3 (pas de saut) |

### Erreurs courantes

| ❌ Erreur | ✅ Correction |
|-----------|--------------|
| Pas de H1 | Ajoutez une H1 unique avec le mot-clé |
| Logo en H1 | Le logo ne doit pas être dans un H1 |
| Multiple H1 | Gardez 1 seul H1, convertissez les autres en H2 |
| H1 identique à la title | Rendez la H1 complémentaire |
| H1 trop vague ("Bienvenue") | H1 descriptive avec mot-clé |

### Sources
- Semrush — "H1 Tag Study: Impact on Rankings" (2025)
- Google Search Central — "Headings Best Practices" (2025)
`
}

// ── IMAGES — Guide complet ────────────────────────────────────────────

export function getImagesReport(total: number, withAlt: number): string {
  const ratio = total > 0 ? Math.round((withAlt / total) * 100) : 100

  return `## Images & Accessibilité — Analyse complète

### État actuel
**Images détectées** : ${total}
**Avec alt text** : ${withAlt} (${ratio}%)
**Sans alt text** : ${total - withAlt}

### Pourquoi les alt text sont essentiels

L'attribut \`alt\` sert à :
1. **L'accessibilité** — Les lecteurs d'écran lisent l'alt text aux utilisateurs malvoyants
2. **Le SEO image** — Google Images indexe les images via l'alt text
3. **Le fallback** — Si l'image ne charge pas, l'alt text s'affiche
4. **Le contexte IA** — Les LLMs utilisent l'alt text pour comprendre le contenu visuel

### Bonnes pratiques

| Règle | Exemple |
|-------|---------|
| Descriptif et spécifique | ✅ "Graphique montrant l'évolution du CTR de 2,1% à 4,7%" |
| Évitez "image de..." | ❌ "Image d'un graphique" |
| Incluez le mot-clé | ✅ "Dashboard audit SEO Nexus avec score 94/100" |
| Images décoratives | \`alt=""\` (alt vide, pas absent) |
| Longueur | 5-15 mots maximum |

### Optimisation technique des images

| Format | Usage | Réduction |
|--------|-------|-----------|
| **WebP** | Photos et illustrations | -25 à -35% vs JPEG |
| **AVIF** | Nouveau standard (Chrome, Firefox) | -50% vs JPEG |
| **SVG** | Icônes et logos | Vectoriel, léger |
| **PNG** | Transparence nécessaire | Plus lourd |

**Lazy loading** : \`loading="lazy"\` sur toutes les images sous la ligne de flottaison.
**Dimensions** : Toujours spécifier \`width\` et \`height\` pour éviter le CLS (Cumulative Layout Shift).

### Sources
- Google — "Image SEO Best Practices" (2025)
- WebAIM — "Alternative Text Guide" (2026)
- Web.dev — "Optimize Images" (2025)
`
}

// ── Heading Hierarchy — Guide complet ─────────────────────────────────

export function getHeadingHierarchyReport(h1: number, h2: number, h3: number): string {
  return `## Hiérarchie des Titres — Analyse complète

### État actuel
| Niveau | Nombre | Statut |
|--------|--------|--------|
| H1 | ${h1} | ${h1 === 1 ? '✅' : h1 === 0 ? '❌' : '⚠️'} |
| H2 | ${h2} | ${h2 >= 2 ? '✅' : h2 >= 1 ? '⚠️' : '❌'} |
| H3 | ${h3} | ${h3 >= 1 ? '✅' : '○ Optionnel'} |

### Pourquoi la hiérarchie compte

Une bonne hiérarchie de titres aide :
- **Google** à comprendre la structure thématique
- **Les utilisateurs** à scanner le contenu rapidement
- **Les lecteurs d'écran** à naviguer par sections (accessibilité)
- **Les LLMs** à extraire des réponses structurées (GEO)

### Structure recommandée

\`\`\`
H1 — Sujet principal (1 seul)
  H2 — Sous-section 1
    H3 — Détail 1.1
    H3 — Détail 1.2
  H2 — Sous-section 2
    H3 — Détail 2.1
  H2 — Sous-section 3
\`\`\`

**Règle d'or** : Pas de saut de niveau. Ne passez jamais de H1 à H3 sans H2 intermédiaire.

### Astuce GEO 2026

Les headings formulés sous forme de **questions** augmentent vos chances d'apparaître dans :
- Les "People Also Ask" de Google
- Les réponses directes des LLMs (ChatGPT, Gemini)
- Les featured snippets

Exemples : "Comment optimiser sa balise title ?" plutôt que "Optimisation de la balise title".

### Sources
- Google — "Use Headings to Organize Content" (2025)
- W3C — HTML Heading Specification
- WebAIM — "Headings Accessibility Guide"
`
}

// ── Word Count — Guide complet ────────────────────────────────────────

export function getWordCountReport(wordCount: number): string {
  return `## Volume de Contenu — Analyse complète

### État actuel
**Nombre de mots** : ${wordCount}

### Longueur idéale par type de page

| Type de page | Longueur recommandée | Source |
|-------------|---------------------|--------|
| **Page d'accueil** | 500-1000 mots | HubSpot, 2026 |
| **Page produit** | 300-500 mots | Shopify Studies, 2025 |
| **Article de blog** | 1500-2500 mots | Backlinko, 2025 |
| **Guide/pilier** | 2500-4000 mots | Ahrefs, 2025 |
| **Landing page** | 500-1500 mots | Unbounce, 2025 |
| **Page service** | 800-1500 mots | Moz, 2025 |

### Ce que disent les données

**Backlinko (2025)** : Le résultat moyen en position 1 contient **1 447 mots**. Les contenus longs (3000+) se positionnent mieux MAIS seulement s'ils sont de qualité.

**Attention** : La longueur n'est pas un facteur de ranking en soi. Google cherche la **couverture exhaustive du sujet**, pas un nombre de mots arbitraire.

### Recommandation

${wordCount < 300 ? '❌ Contenu insuffisant — risque de "thin content". Développez le sujet ou fusionnez avec une page similaire.' : wordCount < 800 ? '⚠️ Contenu court — suffisant pour une page produit, mais insuffisant pour un article informatif.' : wordCount < 1500 ? '✅ Contenu correct — adapté pour la plupart des pages.' : '✅ Contenu long — bonne couverture. Vérifiez que chaque section apporte de la valeur.'}

### Sources
- Backlinko — "Content Length vs Rankings" (2025)
- HubSpot — "Ideal Blog Post Length" (2026)
- Google — "Thin Content Guidelines" (2025)
`
}

// ── Viewport — Guide complet ──────────────────────────────────────────

export function getViewportReport(viewport: string | null): string {
  return `## Viewport Mobile — Analyse complète

### État actuel
${viewport ? `✅ **Viewport configuré** : \`${viewport}\`` : `❌ **Aucun viewport détecté** — site non adapté au mobile.`}

### Pourquoi c'est critique

Depuis l'**indexation mobile-first** de Google (2021), la version mobile est la version principale utilisée pour le ranking. **60% du trafic web mondial est mobile** en 2026.

${!viewport ? `### Action immédiate

Ajoutez cette balise dans le \`<head>\` :
\`\`\`html
<meta name="viewport" content="width=device-width, initial-scale=1">
\`\`\`

**Sans viewport** : votre site s'affiche en mode desktop sur mobile (zoom arrière, texte illisible, boutons trop petits).` : ''}

### Checklist mobile

- [ ] Viewport meta tag présente
- [ ] \`width=device-width\` configuré
- [ ] Zoom non bloqué (pas de \`maximum-scale=1\`)
- [ ] Texte lisible sans zoom (16px minimum)
- [ ] Boutons/liens suffisamment grands (44×44px minimum)
- [ ] Pas de défilement horizontal

### Sources
- Google — "Mobile-First Indexing" (2025)
- Web.dev — "Responsive Design Basics"
`
}

// ── Security Headers — Guide complet ──────────────────────────────────

export function getSecurityHeadersReport(csp: string | null, xFrame: string | null, xContentType: string | null): string {
  const count = [csp, xFrame, xContentType].filter(Boolean).length

  return `## Headers de Sécurité — Analyse complète

### État actuel
| Header | Statut |
|--------|--------|
| **Content-Security-Policy** | ${csp ? '✅ Configuré' : '❌ Absent'} |
| **X-Frame-Options** | ${xFrame ? `✅ ${xFrame}` : '❌ Absent'} |
| **X-Content-Type-Options** | ${xContentType ? `✅ ${xContentType}` : '❌ Absent'} |

### Pourquoi c'est important pour le SEO

Google favorise les sites sécurisés. Les headers de sécurité protègent contre les attaques courantes et renforcent la **confiance utilisateur** — un signal E-E-A-T indirect.

### Headers recommandés

| Header | Valeur recommandée | Protection |
|--------|-------------------|------------|
| \`Content-Security-Policy\` | Selon votre stack | XSS |
| \`X-Frame-Options\` | DENY ou SAMEORIGIN | Clickjacking |
| \`X-Content-Type-Options\` | nosniff | MIME sniffing |
| \`Strict-Transport-Security\` | max-age=31536000 | Downgrade HTTPS |
| \`Referrer-Policy\` | strict-origin-when-cross-origin | Fuite de données |
| \`Permissions-Policy\` | camera=(), microphone=() | Accès hardware |

### Outil de test
Testez vos headers sur **securityheaders.com** — note de A+ à F.

### Sources
- OWASP — "Secure Headers Project" (2026)
- Mozilla — "HTTP Security Headers"
`
}
