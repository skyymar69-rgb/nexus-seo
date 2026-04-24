import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

/**
 * POST /api/report/share — Generate a public share link for a report
 * Body: { auditId: string }
 * Returns: { shareUrl: string, shareId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { auditId } = await request.json()
    if (!auditId) {
      return NextResponse.json({ error: 'auditId requis' }, { status: 400 })
    }

    // Verify user owns the audit
    const audit = await prisma.audit.findFirst({
      where: { id: auditId, website: { userId: session.user.id } },
      include: { website: { select: { domain: true } } },
    })

    if (!audit) {
      return NextResponse.json({ error: 'Audit non trouve' }, { status: 404 })
    }

    // Generate share ID and store as report
    const shareId = uuidv4().slice(0, 12)

    await prisma.report.create({
      data: {
        userId: session.user.id,
        title: `Audit SEO — ${audit.website.domain}`,
        type: 'shared-audit',
        format: 'json',
        status: 'completed',
        data: JSON.stringify({
          shareId,
          auditId: audit.id,
          url: audit.url,
          score: audit.score,
          grade: audit.grade,
          domain: audit.website.domain,
          checks: audit.checks,
          metaData: audit.metaData,
          contentData: audit.contentData,
          createdAt: audit.createdAt,
        }),
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://nexus.kayzen-lyon.fr'
    return NextResponse.json({
      success: true,
      shareUrl: `${baseUrl}/report/${shareId}`,
      shareId,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur de partage' }, { status: 500 })
  }
}
