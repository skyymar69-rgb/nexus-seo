import { NextRequest, NextResponse } from 'next/server'

/**
 * Embeddable SEO Score Widget
 * GET /api/widget?domain=example.com
 *
 * Returns an SVG badge showing the SEO score
 * Usage: <img src="https://nexus.kayzen-lyon.fr/api/widget?domain=monsite.fr" alt="SEO Score">
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return new NextResponse(generateBadge('?', '#999', 'Domaine requis'), {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
    })
  }

  // Try to fetch the latest audit score for this domain
  let score = '--'
  let color = '#6366f1'
  let label = 'SEO Score'

  try {
    const { prisma } = await import('@/lib/prisma')
    const website = await prisma.website.findFirst({
      where: { domain: domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*/, '') },
    })

    if (website) {
      const audit = await prisma.audit.findFirst({
        where: { websiteId: website.id },
        orderBy: { createdAt: 'desc' },
        select: { score: true },
      })

      if (audit?.score !== undefined && audit.score !== null) {
        score = String(audit.score)
        color = audit.score >= 80 ? '#22c55e' : audit.score >= 60 ? '#f59e0b' : '#ef4444'
      }
    }
  } catch {
    // DB not available, return default badge
  }

  return new NextResponse(generateBadge(score, color, label), {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

function generateBadge(score: string, color: string, label: string): string {
  const labelWidth = 70
  const scoreWidth = 50
  const totalWidth = labelWidth + scoreWidth

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" viewBox="0 0 ${totalWidth} 20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${scoreWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Inter,Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">Nexus SEO</text>
    <text x="${labelWidth / 2}" y="14">Nexus SEO</text>
    <text x="${labelWidth + scoreWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${score}/100</text>
    <text x="${labelWidth + scoreWidth / 2}" y="14">${score}/100</text>
  </g>
</svg>`
}
