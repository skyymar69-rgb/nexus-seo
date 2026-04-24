import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400 })
    }

    // Verify website ownership
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    })
    if (!website || website.userId !== userId) {
      return NextResponse.json({ error: 'Site non trouvé' }, { status: 404 })
    }

    // --- Audits ---
    const audits = await prisma.audit.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, score: true, grade: true, createdAt: true },
    })
    const totalAudits = audits.length
    const avgAuditScore =
      totalAudits > 0
        ? Math.round(audits.reduce((s, a) => s + a.score, 0) / totalAudits)
        : null
    const auditScoresOverTime = audits.map((a) => ({
      date: a.createdAt.toISOString().split('T')[0],
      score: a.score,
      grade: a.grade,
    }))

    // --- Keywords ---
    const keywords = await prisma.keyword.findMany({
      where: {
        userId,
        tracking: { some: { websiteId } },
      },
      select: {
        id: true,
        term: true,
        tracking: {
          where: { websiteId },
          orderBy: { date: 'desc' },
          take: 1,
          select: { position: true, previousPosition: true, date: true },
        },
      },
    })
    const totalKeywords = keywords.length
    const keywordsWithPosition = keywords
      .filter((k) => k.tracking[0]?.position != null)
      .map((k) => ({
        term: k.term,
        position: k.tracking[0].position!,
        previousPosition: k.tracking[0].previousPosition,
      }))
    const bestKeyword =
      keywordsWithPosition.length > 0
        ? keywordsWithPosition.reduce((best, cur) =>
            cur.position < best.position ? cur : best
          )
        : null
    const worstKeyword =
      keywordsWithPosition.length > 0
        ? keywordsWithPosition.reduce((worst, cur) =>
            cur.position > worst.position ? cur : worst
          )
        : null

    // Keyword positions trend (last 30 tracking entries for this website)
    const keywordTrend = await prisma.keywordTracking.findMany({
      where: { websiteId, position: { not: null } },
      orderBy: { date: 'asc' },
      take: 100,
      select: { position: true, date: true },
    })
    // Group by date and average positions
    const positionByDate: Record<string, { sum: number; count: number }> = {}
    for (const t of keywordTrend) {
      const d = t.date.toISOString().split('T')[0]
      if (!positionByDate[d]) positionByDate[d] = { sum: 0, count: 0 }
      positionByDate[d].sum += t.position!
      positionByDate[d].count += 1
    }
    const keywordPositionsOverTime = Object.entries(positionByDate).map(
      ([date, v]) => ({
        date,
        avgPosition: Math.round((v.sum / v.count) * 10) / 10,
      })
    )

    // --- Backlinks ---
    const backlinks = await prisma.backlink.findMany({
      where: { websiteId },
      select: { id: true, firstSeen: true, linkType: true, status: true },
    })
    const totalBacklinks = backlinks.length
    const dofollowCount = backlinks.filter(
      (b) => b.linkType === 'dofollow'
    ).length
    const dofollowRatio =
      totalBacklinks > 0
        ? Math.round((dofollowCount / totalBacklinks) * 100)
        : 0

    // Backlinks growth grouped by month
    const backlinksByMonth: Record<string, number> = {}
    for (const b of backlinks) {
      const month = b.firstSeen.toISOString().slice(0, 7)
      backlinksByMonth[month] = (backlinksByMonth[month] || 0) + 1
    }
    let cumulative = 0
    const backlinksGrowth = Object.entries(backlinksByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        cumulative += count
        return { month, newLinks: count, total: cumulative }
      })

    // --- AI Visibility ---
    const aiQueries = await prisma.aIVisibilityQuery.findMany({
      where: { websiteId },
      orderBy: { date: 'asc' },
      select: { id: true, mentioned: true, date: true },
    })
    const totalAIQueries = aiQueries.length
    const mentionedCount = aiQueries.filter((q) => q.mentioned).length
    const mentionRate =
      totalAIQueries > 0
        ? Math.round((mentionedCount / totalAIQueries) * 100)
        : null

    // Mention rate trend by date
    const mentionByDate: Record<
      string,
      { mentioned: number; total: number }
    > = {}
    for (const q of aiQueries) {
      const d = q.date.toISOString().split('T')[0]
      if (!mentionByDate[d]) mentionByDate[d] = { mentioned: 0, total: 0 }
      mentionByDate[d].total += 1
      if (q.mentioned) mentionByDate[d].mentioned += 1
    }

    // --- Performance ---
    const performanceData = await prisma.performanceData.findMany({
      where: { websiteId },
      orderBy: { testedAt: 'asc' },
      select: {
        score: true,
        lcp: true,
        cls: true,
        fcp: true,
        testedAt: true,
      },
    })
    const latestPerf =
      performanceData.length > 0
        ? performanceData[performanceData.length - 1]
        : null
    const avgPerformanceScore =
      performanceData.length > 0
        ? Math.round(
            performanceData.reduce((s, p) => s + p.score, 0) /
              performanceData.length
          )
        : null
    const performanceOverTime = performanceData.map((p) => ({
      date: p.testedAt.toISOString().split('T')[0],
      score: p.score,
      lcp: p.lcp,
      cls: p.cls,
      fcp: p.fcp,
    }))

    return NextResponse.json({
      kpis: {
        totalAudits,
        avgAuditScore,
        totalKeywords,
        totalBacklinks,
        dofollowRatio,
        mentionRate,
        avgPerformanceScore,
        totalAIQueries,
      },
      bestKeyword,
      worstKeyword,
      charts: {
        auditScoresOverTime,
        keywordPositionsOverTime,
        backlinksGrowth,
        performanceOverTime,
      },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
