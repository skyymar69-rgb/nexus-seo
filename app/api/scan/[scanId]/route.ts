import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401, headers: corsHeaders() })
    }

    const scan = await (prisma as any).scanSession.findUnique({
      where: { id: params.scanId },
      include: {
        website: { select: { userId: true, domain: true, name: true } },
      },
    })

    if (!scan || scan.website.userId !== session.user.id) {
      return NextResponse.json({ error: 'Scan non trouve' }, { status: 404, headers: corsHeaders() })
    }

    // Parse results JSON if available
    let results = null
    if (scan.results) {
      try {
        results = JSON.parse(scan.results)
      } catch { results = null }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: scan.id,
        websiteId: scan.websiteId,
        url: scan.url,
        status: scan.status,
        progress: scan.progress,
        totalSteps: scan.totalSteps,
        currentStep: scan.currentStep,
        auditScore: scan.auditScore,
        auditGrade: scan.auditGrade,
        aeoScore: scan.aeoScore,
        geoScore: scan.geoScore,
        perfScore: scan.perfScore,
        crawlPages: scan.crawlPages,
        error: scan.error,
        startedAt: scan.startedAt,
        completedAt: scan.completedAt,
        results,
        website: {
          domain: scan.website.domain,
          name: scan.website.name,
        },
      },
    }, { headers: corsHeaders() })
  } catch (error) {
    console.error('[Scan GET] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation du scan' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
