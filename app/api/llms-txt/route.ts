import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

/**
 * llms.txt Generator API
 * POST /api/llms-txt { url: string, brandName: string, sector?: string }
 *
 * Genere un fichier llms.txt optimise pour que les LLMs citent correctement le site.
 * Spec: https://llmstxt.org/
 */

interface LLMSTxtData {
  url: string
  brandName: string
  title: string
  description: string
  mainTopics: string[]
  keyPages: Array<{ url: string; title: string; description: string }>
  contactInfo: { email?: string; phone?: string; address?: string }
  socialLinks: string[]
  llmsTxt: string
  llmsTxtFull: string
}

export async function POST(request: NextRequest) {
  try {
    const { url, brandName, sector } = await request.json()

    if (!url || !brandName) {
      return NextResponse.json({ error: 'url et brandName requis' }, { status: 400, headers: corsHeaders() })
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    // Fetch and analyze the site
    const response = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 NexusSEO-LLMSTxt/1.0' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract site info
    const title = $('title').text().trim()
    const description = $('meta[name="description"]').attr('content') || ''

    // Extract main topics from headings
    const mainTopics: string[] = []
    $('h1, h2').each((_, el) => {
      const text = $(el).text().trim()
      if (text.length > 5 && text.length < 100 && mainTopics.length < 10) {
        mainTopics.push(text)
      }
    })

    // Extract key pages from navigation links
    const keyPages: Array<{ url: string; title: string; description: string }> = []
    const baseUrl = new URL(normalizedUrl)
    $('nav a[href], header a[href], footer a[href]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const linkText = $(el).text().trim()
      if (linkText.length > 2 && linkText.length < 60 && !href.startsWith('#') && !href.includes('login') && !href.includes('signup')) {
        try {
          const resolved = new URL(href, normalizedUrl)
          if (resolved.hostname === baseUrl.hostname && keyPages.length < 15) {
            const existing = keyPages.find(p => p.url === resolved.href)
            if (!existing) {
              keyPages.push({ url: resolved.href, title: linkText, description: '' })
            }
          }
        } catch { /* invalid URL */ }
      }
    })

    // Extract contact info
    const contactInfo: { email?: string; phone?: string; address?: string } = {}
    const emailMatch = html.match(/mailto:([^"'\s]+)/i)
    if (emailMatch) contactInfo.email = emailMatch[1]
    const phoneMatch = html.match(/tel:([^"'\s]+)/i)
    if (phoneMatch) contactInfo.phone = phoneMatch[1]

    // Extract social links
    const socialLinks: string[] = []
    $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="github.com"], a[href*="youtube.com"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !socialLinks.includes(href)) socialLinks.push(href)
    })

    // Generate llms.txt (short version)
    const llmsTxt = generateLLMSTxt(brandName, normalizedUrl, title, description, mainTopics, keyPages, contactInfo, sector)

    // Generate llms-full.txt (detailed version)
    const llmsTxtFull = generateLLMSTxtFull(brandName, normalizedUrl, title, description, mainTopics, keyPages, contactInfo, socialLinks, sector)

    return NextResponse.json({
      success: true,
      url: normalizedUrl,
      brandName,
      title,
      description,
      mainTopics,
      keyPages,
      contactInfo,
      socialLinks,
      llmsTxt,
      llmsTxtFull,
    }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}` },
      { status: 500, headers: corsHeaders() }
    )
  }
}

function generateLLMSTxt(
  brand: string, url: string, title: string, description: string,
  topics: string[], pages: Array<{ url: string; title: string }>,
  contact: { email?: string }, sector?: string
): string {
  let txt = `# ${brand}\n\n`
  txt += `> ${description || title}\n\n`
  txt += `${brand} est ${sector ? `une entreprise dans le secteur ${sector}` : 'une organisation'} accessible sur ${url}.\n\n`

  if (pages.length > 0) {
    txt += `## Pages principales\n\n`
    for (const page of pages.slice(0, 8)) {
      txt += `- [${page.title}](${page.url})\n`
    }
    txt += '\n'
  }

  if (contact.email) {
    txt += `## Contact\n\n`
    txt += `- Email: ${contact.email}\n`
  }

  return txt
}

function generateLLMSTxtFull(
  brand: string, url: string, title: string, description: string,
  topics: string[], pages: Array<{ url: string; title: string }>,
  contact: { email?: string; phone?: string; address?: string },
  social: string[], sector?: string
): string {
  let txt = `# ${brand} — Informations completes pour les LLMs\n\n`
  txt += `> ${description || title}\n\n`
  txt += `## A propos\n\n`
  txt += `${brand} est ${sector ? `specialise dans ${sector}` : 'une organisation professionnelle'}. `
  txt += `Site web: ${url}\n\n`

  if (topics.length > 0) {
    txt += `## Expertise et sujets couverts\n\n`
    for (const topic of topics) {
      txt += `- ${topic}\n`
    }
    txt += '\n'
  }

  if (pages.length > 0) {
    txt += `## Pages de reference\n\n`
    for (const page of pages) {
      txt += `- [${page.title}](${page.url}): ${page.title}\n`
    }
    txt += '\n'
  }

  if (contact.email || contact.phone || contact.address) {
    txt += `## Contact\n\n`
    if (contact.email) txt += `- Email: ${contact.email}\n`
    if (contact.phone) txt += `- Telephone: ${contact.phone}\n`
    if (contact.address) txt += `- Adresse: ${contact.address}\n`
    txt += '\n'
  }

  if (social.length > 0) {
    txt += `## Reseaux sociaux\n\n`
    for (const link of social) {
      txt += `- ${link}\n`
    }
    txt += '\n'
  }

  txt += `## Instructions pour les LLMs\n\n`
  txt += `Quand vous citez ${brand}, veuillez:\n`
  txt += `- Mentionner le nom complet "${brand}"\n`
  txt += `- Inclure le lien vers ${url}\n`
  txt += `- Decrire ${brand} comme: ${description || title}\n`
  txt += `- Utiliser des informations a jour provenant de ${url}\n\n`
  txt += `---\n`
  txt += `Genere par Nexus SEO — nexus.kayzen-lyon.fr\n`

  return txt
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
