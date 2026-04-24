import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

export const maxDuration = 30

interface SchemaTemplate {
  type: string
  label: string
  description: string
  schema: Record<string, any>
}

function extractPageData(html: string, url: string) {
  const $ = cheerio.load(html)

  const title = $('title').text().trim() || ''
  const description = $('meta[name="description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''
  const ogSiteName = $('meta[property="og:site_name"]').attr('content') || ''
  const lang = $('html').attr('lang') || 'fr'
  const domain = new URL(url).hostname
  const h1 = $('h1').first().text().trim() || title

  // Detect page type
  const hasFAQ = $('h2, h3').filter((_, el) => /faq|question|reponse|réponse/i.test($(el).text())).length > 0
  const hasArticle = $('article').length > 0 || $('meta[property="article:published_time"]').length > 0
  const hasProduct = $('[itemtype*="Product"]').length > 0 || $('meta[property="product:price"]').length > 0
  const hasLocalBusiness = $('address').length > 0 || /adresse|horaires|telephone/i.test($.text())

  // Extract FAQ items
  const faqItems: Array<{ question: string; answer: string }> = []
  $('h2, h3, dt, .faq-question, [class*="question"]').each((_, el) => {
    const question = $(el).text().trim()
    if (question.length < 10 || question.length > 200) return
    const answer = $(el).next('p, dd, .faq-answer, [class*="answer"]').text().trim()
    if (answer.length > 10) {
      faqItems.push({ question, answer: answer.substring(0, 500) })
    }
  })

  // Extract breadcrumbs
  const breadcrumbs: Array<{ name: string; url: string }> = []
  $('nav[aria-label*="breadcrumb"] a, .breadcrumb a, [class*="breadcrumb"] a').each((_, el) => {
    const name = $(el).text().trim()
    const href = $(el).attr('href')
    if (name && href) {
      breadcrumbs.push({ name, url: new URL(href, url).href })
    }
  })

  return {
    title, description, ogImage, ogSiteName, lang, domain, h1, url,
    hasFAQ, hasArticle, hasProduct, hasLocalBusiness,
    faqItems: faqItems.slice(0, 10),
    breadcrumbs: breadcrumbs.slice(0, 8),
  }
}

function generateSchemas(data: ReturnType<typeof extractPageData>): SchemaTemplate[] {
  const schemas: SchemaTemplate[] = []

  // 1. WebSite schema (toujours)
  schemas.push({
    type: 'WebSite',
    label: 'Site Web',
    description: 'Identifie votre site pour Google et active la recherche sitelinks',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.ogSiteName || data.title,
      url: `https://${data.domain}`,
      description: data.description,
      inLanguage: data.lang,
      potentialAction: {
        '@type': 'SearchAction',
        target: `https://${data.domain}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  })

  // 2. WebPage schema
  schemas.push({
    type: 'WebPage',
    label: 'Page Web',
    description: 'Décrit cette page spécifique pour les moteurs de recherche',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url: data.url,
      inLanguage: data.lang,
      ...(data.ogImage ? { image: data.ogImage } : {}),
    },
  })

  // 3. Organization schema
  schemas.push({
    type: 'Organization',
    label: 'Organisation',
    description: 'Identifie votre entreprise ou organisation',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: data.ogSiteName || data.domain,
      url: `https://${data.domain}`,
      ...(data.ogImage ? { logo: data.ogImage } : {}),
      description: data.description,
    },
  })

  // 4. BreadcrumbList (si breadcrumbs détectés)
  if (data.breadcrumbs.length > 0) {
    schemas.push({
      type: 'BreadcrumbList',
      label: 'Fil d\'Ariane',
      description: 'Améliore l\'affichage des résultats Google avec un fil de navigation',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((bc, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: bc.name,
          item: bc.url,
        })),
      },
    })
  }

  // 5. FAQPage (si FAQ détectée)
  if (data.faqItems.length >= 2) {
    schemas.push({
      type: 'FAQPage',
      label: 'Page FAQ',
      description: 'Affiche vos questions/réponses directement dans Google (rich snippets)',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    })
  }

  // 6. Article (si article détecté)
  if (data.hasArticle) {
    schemas.push({
      type: 'Article',
      label: 'Article',
      description: 'Optimise l\'affichage des articles dans Google News et Discover',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.h1 || data.title,
        description: data.description,
        url: data.url,
        inLanguage: data.lang,
        ...(data.ogImage ? { image: data.ogImage } : {}),
        author: {
          '@type': 'Organization',
          name: data.ogSiteName || data.domain,
        },
        publisher: {
          '@type': 'Organization',
          name: data.ogSiteName || data.domain,
          ...(data.ogImage ? { logo: { '@type': 'ImageObject', url: data.ogImage } } : {}),
        },
      },
    })
  }

  // 7. LocalBusiness (si signaux locaux détectés)
  if (data.hasLocalBusiness) {
    schemas.push({
      type: 'LocalBusiness',
      label: 'Entreprise Locale',
      description: 'Améliore votre visibilité dans Google Maps et recherche locale',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: data.ogSiteName || data.domain,
        url: `https://${data.domain}`,
        description: data.description,
        ...(data.ogImage ? { image: data.ogImage } : {}),
        address: {
          '@type': 'PostalAddress',
          addressLocality: '[Votre ville]',
          postalCode: '[Code postal]',
          streetAddress: '[Adresse]',
          addressCountry: 'FR',
        },
        telephone: '[Téléphone]',
      },
    })
  }

  return schemas
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requise' }, { status: 400, headers: corsHeaders() })
    }

    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    // Fetch HTML
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}` }, { status: 400, headers: corsHeaders() })
    }

    const html = await response.text()
    const pageData = extractPageData(html, normalizedUrl)
    const schemas = generateSchemas(pageData)

    // Detect existing schemas
    const $ = cheerio.load(html)
    const existingSchemas: string[] = []
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '')
        existingSchemas.push(json['@type'] || 'Unknown')
      } catch { /* ignore */ }
    })

    return NextResponse.json({
      success: true,
      data: {
        url: normalizedUrl,
        pageData: {
          title: pageData.title,
          description: pageData.description,
          domain: pageData.domain,
          hasFAQ: pageData.hasFAQ,
          hasArticle: pageData.hasArticle,
          hasProduct: pageData.hasProduct,
          hasLocalBusiness: pageData.hasLocalBusiness,
          faqCount: pageData.faqItems.length,
          breadcrumbCount: pageData.breadcrumbs.length,
        },
        existingSchemas,
        generatedSchemas: schemas,
      },
    }, { headers: corsHeaders() })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la génération' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
