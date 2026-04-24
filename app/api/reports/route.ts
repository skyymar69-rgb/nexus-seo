import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureUserExists } from '@/lib/ensure-user'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        format: true,
        data: true,
        status: true,
        createdAt: true,
      },
    })

    // Parse data JSON for each report
    const parsed = reports.map((r) => ({
      ...r,
      data: r.data ? JSON.parse(r.data) : null,
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    await ensureUserExists(userId, session)

    const body = await request.json()
    const { websiteId } = body

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId requis' },
        { status: 400 }
      )
    }

    // Verify website ownership
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    })
    if (!website || website.userId !== userId) {
      return NextResponse.json(
        { error: 'Site non trouvé' },
        { status: 404 }
      )
    }

    // --- Aggregate data ---

    // Latest audit
    const latestAudit = await prisma.audit.findFirst({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
      select: {
        score: true,
        grade: true,
        categories: true,
        createdAt: true,
      },
    })

    // Keyword summary
    const keywords = await prisma.keyword.findMany({
      where: {
        userId,
        tracking: { some: { websiteId } },
      },
      select: {
        term: true,
        tracking: {
          where: { websiteId },
          orderBy: { date: 'desc' },
          take: 1,
          select: { position: true },
        },
      },
    })
    const keywordCount = keywords.length
    const positionsArr = keywords
      .map((k) => k.tracking[0]?.position)
      .filter((p): p is number => p != null)
    const avgPosition =
      positionsArr.length > 0
        ? Math.round(
            (positionsArr.reduce((a, b) => a + b, 0) / positionsArr.length) * 10
          ) / 10
        : null

    // Backlink summary
    const backlinks = await prisma.backlink.findMany({
      where: { websiteId },
      select: { linkType: true },
    })
    const backlinkCount = backlinks.length
    const dofollowCount = backlinks.filter(
      (b) => b.linkType === 'dofollow'
    ).length
    const dofollowRatio =
      backlinkCount > 0
        ? Math.round((dofollowCount / backlinkCount) * 100)
        : 0

    // AI Visibility summary
    const aiQueries = await prisma.aIVisibilityQuery.findMany({
      where: { websiteId },
      select: { mentioned: true },
    })
    const aiQueryCount = aiQueries.length
    const mentionedCount = aiQueries.filter((q) => q.mentioned).length
    const mentionRate =
      aiQueryCount > 0
        ? Math.round((mentionedCount / aiQueryCount) * 100)
        : null

    // Performance summary
    const latestPerf = await prisma.performanceData.findFirst({
      where: { websiteId },
      orderBy: { testedAt: 'desc' },
      select: {
        score: true,
        grade: true,
        lcp: true,
        fid: true,
        cls: true,
        fcp: true,
        testedAt: true,
      },
    })

    const reportData = {
      website: { domain: website.domain, name: website.name },
      generatedAt: new Date().toISOString(),
      audit: latestAudit
        ? {
            score: latestAudit.score,
            grade: latestAudit.grade,
            date: latestAudit.createdAt.toISOString(),
          }
        : null,
      keywords: {
        count: keywordCount,
        avgPosition,
      },
      backlinks: {
        count: backlinkCount,
        dofollowRatio,
      },
      aiVisibility: {
        queriesAnalyzed: aiQueryCount,
        mentionRate,
      },
      performance: latestPerf
        ? {
            score: latestPerf.score,
            grade: latestPerf.grade,
            lcp: latestPerf.lcp,
            fcp: latestPerf.fcp,
            cls: latestPerf.cls,
            date: latestPerf.testedAt.toISOString(),
          }
        : null,
    }

    const now = new Date()
    const title = `Rapport - ${website.domain} - ${now.toLocaleDateString('fr-FR')}`

    const report = await prisma.report.create({
      data: {
        userId,
        title,
        type: 'complete',
        format: 'json',
        data: JSON.stringify(reportData),
        status: 'completed',
      },
    })

    return NextResponse.json(
      {
        ...report,
        data: reportData,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
