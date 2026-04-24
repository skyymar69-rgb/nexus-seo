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
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify website belongs to user
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    })

    if (!website || website.userId !== userId) {
      return NextResponse.json(
        { error: 'Website not found or unauthorized' },
        { status: 403 }
      )
    }

    const skip = (page - 1) * limit

    const [backlinks, total] = await Promise.all([
      prisma.backlink.findMany({
        where: { websiteId },
        orderBy: { firstSeen: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          sourceUrl: true,
          sourceDomain: true,
          targetUrl: true,
          anchorText: true,
          da: true,
          dr: true,
          linkType: true,
          status: true,
          spamScore: true,
          firstSeen: true,
          lastChecked: true,
        },
      }),
      prisma.backlink.count({
        where: { websiteId },
      }),
    ])

    return NextResponse.json({
      backlinks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get backlinks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const body = await request.json()
    const { websiteId, sourceUrl, targetUrl, anchorText, da, linkType = 'dofollow' } = body

    if (!websiteId || !sourceUrl || !targetUrl) {
      return NextResponse.json(
        { error: 'websiteId, sourceUrl, and targetUrl are required' },
        { status: 400 }
      )
    }

    // Verify website belongs to user
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
    })

    if (!website || website.userId !== userId) {
      return NextResponse.json(
        { error: 'Website not found or unauthorized' },
        { status: 403 }
      )
    }

    // Extract source domain from URL
    let sourceDomain = sourceUrl
    try {
      const url = new URL(sourceUrl.startsWith('http') ? sourceUrl : `https://${sourceUrl}`)
      sourceDomain = url.hostname
    } catch {
      // If URL parsing fails, use the provided sourceUrl as domain
      sourceDomain = sourceUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    }

    const backlink = await prisma.backlink.create({
      data: {
        websiteId,
        sourceUrl,
        sourceDomain,
        targetUrl,
        anchorText: anchorText || undefined,
        da: da || undefined,
        linkType,
      },
    })

    return NextResponse.json(backlink, { status: 201 })
  } catch (error) {
    console.error('Create backlink error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
