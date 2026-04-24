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
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    // Build where clause
    const where: any = { userId }
    if (websiteId) {
      where.tracking = {
        some: {
          websiteId,
        },
      }
    }

    const keywords = await prisma.keyword.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        term: true,
        volume: true,
        difficulty: true,
        cpc: true,
        intent: true,
        language: true,
        createdAt: true,
        tracking: websiteId
          ? {
              where: { websiteId },
              orderBy: { date: 'desc' },
              take: 1,
              select: {
                position: true,
                previousPosition: true,
                url: true,
                date: true,
              },
            }
          : {
              orderBy: { date: 'desc' },
              take: 1,
              select: {
                position: true,
                previousPosition: true,
                url: true,
                date: true,
                website: { select: { domain: true } },
              },
            },
      },
    })

    const keywordsWithTracking = keywords.map((keyword) => ({
      ...keyword,
      latestTracking: keyword.tracking[0] || null,
      tracking: undefined,
    }))

    return NextResponse.json(keywordsWithTracking)
  } catch (error) {
    console.error('Get keywords error:', error)
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
    await ensureUserExists(userId, session)

    const body = await request.json()
    const { term, volume, difficulty, cpc, intent, language = 'fr', websiteId } = body

    if (!term || typeof term !== 'string') {
      return NextResponse.json(
        { error: 'Term is required and must be a string' },
        { status: 400 }
      )
    }

    // Create or get keyword
    const keyword = await prisma.keyword.upsert({
      where: {
        term_userId_language: {
          term: term.toLowerCase(),
          userId,
          language,
        },
      },
      update: {},
      create: {
        term: term.toLowerCase(),
        volume: volume || undefined,
        difficulty: difficulty || undefined,
        cpc: cpc || undefined,
        intent: intent || undefined,
        language,
        userId,
      },
    })

    // If websiteId is provided, track the keyword for that website
    if (websiteId) {
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

      // Create tracking entry
      const tracking = await prisma.keywordTracking.create({
        data: {
          keywordId: keyword.id,
          websiteId,
          date: new Date(),
        },
      })

      return NextResponse.json({ keyword, tracking }, { status: 201 })
    }

    return NextResponse.json(keyword, { status: 201 })
  } catch (error) {
    console.error('Create keyword error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
