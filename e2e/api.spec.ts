import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('POST /api/audit should work', async ({ request }) => {
    const response = await request.post('/api/audit', {
      data: { url: 'https://nexus.kayzen-lyon.fr' },
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.score).toBeGreaterThanOrEqual(0)
    expect(data.data.score).toBeLessThanOrEqual(100)
  })

  test('POST /api/performance should work', async ({ request }) => {
    const response = await request.post('/api/performance', {
      data: { url: 'https://nexus.kayzen-lyon.fr', device: 'desktop' },
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.score).toBeGreaterThanOrEqual(0)
  })

  test('POST /api/compare should work', async ({ request }) => {
    const response = await request.post('/api/compare', {
      data: { url1: 'https://nexus.kayzen-lyon.fr', url2: 'https://internet.kayzen-lyon.fr' },
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.site1.score).toBeGreaterThanOrEqual(0)
    expect(data.site2.score).toBeGreaterThanOrEqual(0)
  })

  test('POST /api/geo-engine should work', async ({ request }) => {
    const response = await request.post('/api/geo-engine', {
      data: { url: 'https://nexus.kayzen-lyon.fr' },
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.geoScore).toBeGreaterThanOrEqual(0)
    expect(data.eeat).toBeDefined()
  })

  test('GET /api/widget should return SVG', async ({ request }) => {
    const response = await request.get('/api/widget?domain=nexus.kayzen-lyon.fr')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/svg+xml')
  })

  test('GET /api/og should return image', async ({ request }) => {
    const response = await request.get('/api/og?title=Test')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('image/')
  })

  test('POST /api/semantic should work', async ({ request }) => {
    const response = await request.post('/api/semantic', {
      data: { url: 'https://nexus.kayzen-lyon.fr', keyword: 'SEO' },
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.score).toBeGreaterThanOrEqual(0)
  })

  test('POST /api/audit without URL should return 400', async ({ request }) => {
    const response = await request.post('/api/audit', {
      data: {},
    })
    expect(response.status()).toBe(400)
  })
})

test.describe('Programmatic SEO Pages', () => {
  const cities = ['paris', 'lyon', 'marseille', 'toulouse', 'nice']

  for (const city of cities) {
    test(`/outils/audit-seo-${city} should load`, async ({ page }) => {
      const response = await page.goto(`/outils/audit-seo-${city}`)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toBeVisible()
    })
  }
})
