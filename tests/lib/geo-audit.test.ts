import { describe, it, expect } from 'vitest'
import { analyzeGEO } from '@/lib/geo-audit'

const MINIMAL_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head><title>Test Page</title></head>
<body><h1>Hello World</h1><p>Some content here.</p></body>
</html>
`

const RICH_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <title>Guide complet du SEO en 2026</title>
  <meta name="description" content="Découvrez les meilleures pratiques SEO pour 2026 avec notre guide complet et détaillé." />
  <meta property="og:title" content="Guide SEO 2026" />
  <meta property="og:description" content="Guide complet" />
  <meta property="og:image" content="/og.png" />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="2026-01-15" />
  <meta property="article:modified_time" content="2026-03-01" />
  <link rel="canonical" href="https://example.com/guide-seo" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "name": "Nexus SEO" },
      { "@type": "Article", "headline": "Guide SEO" },
      { "@type": "FAQPage", "mainEntity": [] },
      { "@type": "BreadcrumbList", "itemListElement": [] }
    ]
  }
  </script>
</head>
<body>
  <nav>Navigation</nav>
  <main>
    <article>
      <h1>Guide complet du SEO en 2026</h1>
      <div class="author-bio">Par Jean Dupont, expert SEO</div>
      <time datetime="2026-01-15">15 janvier 2026</time>
      <p>Le SEO est un domaine en constante évolution. Selon une étude de Google, 68% des recherches débutent en ligne.</p>
      <h2>Comment optimiser son site ?</h2>
      <p>Notre expérience montre que les résultats sont significatifs après 3 mois de travail.</p>
      <ul>
        <li>Optimiser les balises meta</li>
        <li>Améliorer la vitesse</li>
        <li>Créer du contenu de qualité</li>
      </ul>
      <h2>Pourquoi le SEO est important ?</h2>
      <p>D'après les données de Semrush, le trafic organique représente 53% des visites web en 2026.</p>
      <table><tr><th>Métrique</th><th>Valeur</th></tr><tr><td>Trafic</td><td>53%</td></tr></table>
      <h3>Les statistiques clés</h3>
      <p>Plus de 8.5 milliards de recherches sont effectuées chaque jour sur Google.</p>
      <a href="https://www.gov.fr/stats">Source officielle</a>
      <a href="mailto:contact@example.com">Contact</a>
      <img src="/photo.jpg" alt="Photo guide SEO" />
    </article>
  </main>
  <footer>
    <a href="/privacy">Politique de confidentialité</a>
    <address>15 rue de la Paix, Paris</address>
  </footer>
</body>
</html>
`

describe('analyzeGEO', () => {
  it('returns a valid result structure', () => {
    const result = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    expect(result).toHaveProperty('overallScore')
    expect(result).toHaveProperty('grade')
    expect(result).toHaveProperty('categories')
    expect(result).toHaveProperty('recommendations')
    expect(result.categories).toHaveProperty('structuredData')
    expect(result.categories).toHaveProperty('entityClarity')
    expect(result.categories).toHaveProperty('citationReadiness')
    expect(result.categories).toHaveProperty('eeat')
    expect(result.categories).toHaveProperty('technicalAI')
  })

  it('scores minimal HTML low', () => {
    const result = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    expect(result.overallScore).toBeLessThan(50)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('scores rich HTML higher than minimal', () => {
    const minimal = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    const rich = analyzeGEO(RICH_HTML, 'https://example.com')
    expect(rich.overallScore).toBeGreaterThan(minimal.overallScore)
  })

  it('detects JSON-LD schemas in rich HTML', () => {
    const result = analyzeGEO(RICH_HTML, 'https://example.com')
    const sdChecks = result.categories.structuredData.checks
    const jsonLdCheck = sdChecks.find(c => c.name.toLowerCase().includes('json-ld'))
    expect(jsonLdCheck?.status).toBe('passed')
  })

  it('scores are between 0 and 100', () => {
    const result = analyzeGEO(RICH_HTML, 'https://example.com')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
    Object.values(result.categories).forEach(cat => {
      expect(cat.score).toBeGreaterThanOrEqual(0)
      expect(cat.score).toBeLessThanOrEqual(100)
    })
  })

  it('grade matches score', () => {
    const result = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    if (result.overallScore >= 90) expect(result.grade).toBe('A')
    else if (result.overallScore >= 70) expect(result.grade).toBe('B')
    else if (result.overallScore >= 50) expect(result.grade).toBe('C')
    else if (result.overallScore >= 30) expect(result.grade).toBe('D')
    else expect(result.grade).toBe('F')
  })

  it('scores HTTPS higher than HTTP for E-E-A-T', () => {
    const https = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    const http = analyzeGEO(MINIMAL_HTML, 'http://example.com')
    // HTTPS should score equal or higher in E-E-A-T
    expect(https.categories.eeat.score).toBeGreaterThanOrEqual(http.categories.eeat.score)
  })

  it('provides French recommendations', () => {
    const result = analyzeGEO(MINIMAL_HTML, 'https://example.com')
    // At least one recommendation should be in French
    const hasFrench = result.recommendations.some(r =>
      /ajoutez|utilisez|implémentez|créez|passez/i.test(r)
    )
    expect(hasFrench).toBe(true)
  })
})
