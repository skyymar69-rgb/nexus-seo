import { describe, it, expect } from 'vitest'
import { analyzeAEO } from '@/lib/aeo-score'

const MINIMAL_HTML = `
<!DOCTYPE html>
<html><head><title>Test</title></head>
<body><p>Simple page.</p></body>
</html>
`

const FAQ_HTML = `
<!DOCTYPE html>
<html lang="fr">
<head><title>FAQ - Questions fréquentes</title></head>
<body>
  <main>
    <h1>Questions fréquentes sur le SEO</h1>
    <h2>Comment optimiser mon site pour Google ?</h2>
    <p>Pour optimiser votre site, suivez ces étapes simples et efficaces pour améliorer votre positionnement.</p>
    <ol>
      <li>Recherchez vos mots-clés cibles</li>
      <li>Optimisez vos balises title et meta</li>
      <li>Créez du contenu de qualité</li>
    </ol>
    <h2>Qu'est-ce que le GEO ?</h2>
    <p>Le GEO est l'optimisation pour les moteurs génératifs comme ChatGPT et Perplexity.</p>
    <h2>Pourquoi le SEO est-il important ?</h2>
    <p>Le SEO est essentiel car il génère du trafic organique qualifié et durable.</p>
    <h3>Sous-question détaillée</h3>
    <p>Cette section fournit des détails supplémentaires importants pour comprendre les enjeux du référencement naturel.</p>
    <ul>
      <li>Visibilité accrue</li>
      <li>Trafic qualifié</li>
      <li>ROI long terme</li>
    </ul>
    <table>
      <tr><th>Stratégie</th><th>Impact</th></tr>
      <tr><td>Contenu</td><td>Élevé</td></tr>
      <tr><td>Technique</td><td>Moyen</td></tr>
    </table>
  </main>
</body>
</html>
`

describe('analyzeAEO', () => {
  it('returns a valid result structure', () => {
    const result = analyzeAEO(MINIMAL_HTML, 'https://example.com')
    expect(result).toHaveProperty('overallScore')
    expect(result).toHaveProperty('grade')
    expect(result).toHaveProperty('snippetReadiness')
    expect(result).toHaveProperty('qaPatterns')
    expect(result).toHaveProperty('voiceReadiness')
    expect(result).toHaveProperty('contentStructure')
    expect(result).toHaveProperty('recommendations')
  })

  it('scores minimal HTML low', () => {
    const result = analyzeAEO(MINIMAL_HTML, 'https://example.com')
    expect(result.overallScore).toBeLessThan(40)
  })

  it('scores FAQ-rich HTML higher', () => {
    const minimal = analyzeAEO(MINIMAL_HTML, 'https://example.com')
    const faq = analyzeAEO(FAQ_HTML, 'https://example.com')
    expect(faq.overallScore).toBeGreaterThan(minimal.overallScore)
  })

  it('detects Q&A patterns in headings', () => {
    const result = analyzeAEO(FAQ_HTML, 'https://example.com')
    expect(result.qaPatterns.score).toBeGreaterThan(0)
  })

  it('scores are between 0 and 100', () => {
    const result = analyzeAEO(FAQ_HTML, 'https://example.com')
    expect(result.overallScore).toBeGreaterThanOrEqual(0)
    expect(result.overallScore).toBeLessThanOrEqual(100)
  })

  it('generates recommendations', () => {
    const result = analyzeAEO(MINIMAL_HTML, 'https://example.com')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})
