import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400 })
    }

    // Verify website belongs to user
    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId },
      select: { id: true },
    })

    if (!website) {
      return NextResponse.json({ error: 'Site non trouve' }, { status: 404 })
    }

    const scans = await (prisma as any).scanSession.findMany({
      where: {
        websiteId,
        status: 'completed',
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        completedAt: true,
        auditScore: true,
        aeoScore: true,
        geoScore: true,
        perfScore: true,
        crawlPages: true,
      },
    })

    return NextResponse.json({ success: true, data: scans })
  } catch (error) {
    console.error('Scan history error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
