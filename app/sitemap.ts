import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://nexus-seo.app'

const casesSlugs = ['maison-lumiere', 'flowstack', 'lefort-associes', 'techflow-saas', 'agence-digitale-lyon', 'ecommerce-sante']
const blogSlugs = ['geo-guide-complet-2026', 'llmo-chatgpt-recommande-votre-marque', 'aeo-featured-snippets-voice-search', 'core-web-vitals-2026-guide', 'eeat-seo-ia-2026', 'semrush-vs-nexus-comparaison']
const citySlugs = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'grenoble', 'rouen', 'toulon', 'clermont-ferrand', 'dijon', 'angers', 'saint-etienne', 'brest', 'le-mans']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages = [
    { url: BASE_URL, changeFrequency: 'weekly' as const, priority: 1.0, lastModified: now },
    { url: `${BASE_URL}/services`, changeFrequency: 'monthly' as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly' as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/cases`, changeFrequency: 'weekly' as const, priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily' as const, priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly' as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly' as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/faq`, changeFrequency: 'monthly' as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/audit-gratuit`, changeFrequency: 'weekly' as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/signup`, changeFrequency: 'monthly' as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/login`, changeFrequency: 'monthly' as const, priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/mentions-legales`, changeFrequency: 'yearly' as const, priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3, lastModified: now },
    { url: `${BASE_URL}/cgu`, changeFrequency: 'yearly' as const, priority: 0.3, lastModified: now },
  ]

  const casePages = casesSlugs.map((slug) => ({
    url: `${BASE_URL}/cases/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: now,
  }))

  const blogPages = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    lastModified: now,
  }))

  const cityPages = citySlugs.map((slug) => ({
    url: `${BASE_URL}/outils/audit-seo-${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified: now,
  }))

  return [...staticPages, ...casePages, ...blogPages, ...cityPages]
}
