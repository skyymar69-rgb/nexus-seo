import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400 })
    }

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId: session.user.id },
    })

    if (!website) {
      return NextResponse.json({ error: 'Site non trouve' }, { status: 404 })
    }

    // Fetch audits ordered by date (score over time)
    const audits = await prisma.audit.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, score: true },
    })

    // Fetch keyword tracking (average position over time)
    // Group by date and compute average position
    const keywordTrackings = await prisma.keywordTracking.findMany({
      where: { websiteId, position: { not: null } },
      orderBy: { date: 'asc' },
      select: { date: true, position: true },
    })

    // Group keyword trackings by date (YYYY-MM-DD)
    const keywordsByDate: Record<string, number[]> = {}
    for (const kt of keywordTrackings) {
      const dateKey = kt.date.toISOString().split('T')[0]
      if (!keywordsByDate[dateKey]) keywordsByDate[dateKey] = []
      if (kt.position !== null) keywordsByDate[dateKey].push(kt.position)
    }

    const keywords = Object.entries(keywordsByDate).map(([date, positions]) => ({
      date,
      avgPosition: Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10,
    }))

    // Fetch backlinks growth over time (count by firstSeen date)
    const backlinks = await prisma.backlink.findMany({
      where: { websiteId },
      orderBy: { firstSeen: 'asc' },
      select: { firstSeen: true },
    })

    // Build cumulative backlink count by date
    const backlinksByDate: Record<string, number> = {}
    for (const bl of backlinks) {
      const dateKey = bl.firstSeen.toISOString().split('T')[0]
      backlinksByDate[dateKey] = (backlinksByDate[dateKey] || 0) + 1
    }

    let cumulativeCount = 0
    const backlinkGrowth = Object.entries(backlinksByDate).map(([date, count]) => {
      cumulativeCount += count
      return { date, count: cumulativeCount }
    })

    return NextResponse.json({
      audits: audits.map((a) => ({
        date: a.createdAt.toISOString().split('T')[0],
        score: a.score,
      })),
      keywords,
      backlinks: backlinkGrowth,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: `Erreur serveur: ${message}` }, { status: 500 })
  }
}
