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

    // Get total websites count
    const websitesCount = await prisma.website.count({
      where: { userId },
    })

    // Get total audits count and latest audit score
    const auditsCount = await prisma.audit.count({
      where: { website: { userId } },
    })

    const latestAudit = await prisma.audit.findFirst({
      where: { website: { userId } },
      orderBy: { createdAt: 'desc' },
      select: { score: true },
    })

    // Get total tracked keywords
    const keywordsCount = await prisma.keyword.count({
      where: { userId },
    })

    // Get average position from latest tracking
    const latestTrackings = await prisma.keywordTracking.findMany({
      where: {
        keyword: { userId },
      },
      orderBy: { date: 'desc' },
      distinct: ['keywordId'],
      select: { position: true },
    })

    const avgPosition =
      latestTrackings.length > 0
        ? latestTrackings.reduce((sum, t) => sum + (t.position || 0), 0) / latestTrackings.length
        : null

    // Get total backlinks count and dofollow ratio
    const backlinksCount = await prisma.backlink.count({
      where: { website: { userId } },
    })

    const dofollowCount = await prisma.backlink.count({
      where: {
        website: { userId },
        linkType: 'dofollow',
      },
    })

    const dofollowRatio = backlinksCount > 0 ? ((dofollowCount / backlinksCount) * 100).toFixed(1) : '0'

    // Get total AI visibility queries
    const aiQueriesCount = await prisma.aIVisibilityQuery.count({
      where: { website: { userId } },
    })

    // Get mention rate
    const mentionedCount = await prisma.aIVisibilityQuery.count({
      where: {
        website: { userId },
        mentioned: true,
      },
    })

    const mentionRate = aiQueriesCount > 0 ? ((mentionedCount / aiQueriesCount) * 100).toFixed(1) : '0'

    // Get latest scan session for the selected website (or any user website)
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    let latestScanId: string | null = null
    try {
      const latestScan = await (prisma as any).scanSession.findFirst({
        where: websiteId
          ? { websiteId, website: { userId } }
          : { website: { userId } },
        orderBy: { startedAt: 'desc' },
        select: { id: true, status: true },
      })
      if (latestScan && latestScan.status === 'completed') {
        latestScanId = latestScan.id
      }
    } catch { /* ScanSession model may not exist yet */ }

    // Get unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    })

    // Get recent activity (last 5 audits)
    const recentAudits = await prisma.audit.findMany({
      where: { website: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        score: true,
        grade: true,
        createdAt: true,
        website: { select: { domain: true } },
      },
    })

    // Get recent notifications (last 5)
    const recentNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        read: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      latestScanId,
      websites: {
        total: websitesCount,
      },
      audits: {
        total: auditsCount,
        latestScore: latestAudit?.score || null,
      },
      keywords: {
        total: keywordsCount,
        avgPosition: avgPosition ? parseFloat(avgPosition.toFixed(2)) : null,
      },
      backlinks: {
        total: backlinksCount,
        dofollowRatio: parseFloat(dofollowRatio),
      },
      aiVisibility: {
        totalQueries: aiQueriesCount,
        mentionRate: parseFloat(mentionRate),
      },
      notifications: {
        unread: unreadNotifications,
      },
      recentActivity: {
        audits: recentAudits,
        notifications: recentNotifications,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
