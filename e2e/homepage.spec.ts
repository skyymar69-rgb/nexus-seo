import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load without errors', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
  })

  test('should have correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Nexus SEO/)
  })

  test('should show header with navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('text=Demarrer gratuitement').first()).toBeVisible()
  })

  test('should have audit input in hero', async ({ page }) => {
    await page.goto('/')
    const input = page.locator('input[placeholder*="monsite"]').first()
    await expect(input).toBeVisible()
  })

  test('should show footer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })
})

test.describe('Public Pages', () => {
  const pages = [
    { path: '/pricing', title: /Tarifs/ },
    { path: '/faq', title: /FAQ/ },
    { path: '/contact', title: /Contact/ },
    { path: '/services', title: /Services/ },
    { path: '/blog', title: /Blog/ },
    { path: '/about', title: /propos/ },
    { path: '/cases', title: /clients/ },
  ]

  for (const p of pages) {
    test(`${p.path} should load`, async ({ page }) => {
      const response = await page.goto(p.path)
      expect(response?.status()).toBe(200)
    })
  }
})

test.describe('404 Page', () => {
  test('should show custom 404', async ({ page }) => {
    await page.goto('/page-qui-nexiste-pas')
    await expect(page.locator('text=404')).toBeVisible()
    await expect(page.locator('text=Page introuvable')).toBeVisible()
  })
})

test.describe('Auth Pages', () => {
  test('login page should load', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBe(200)
    await expect(page.locator('text=Se connecter')).toBeVisible()
  })

  test('signup page should load', async ({ page }) => {
    const response = await page.goto('/signup')
    expect(response?.status()).toBe(200)
  })
})
