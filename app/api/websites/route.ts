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

    const websites = await prisma.website.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        domain: true,
        name: true,
        verified: true,
        createdAt: true,
        audits: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { score: true, grade: true, createdAt: true },
        },
      },
    })

    const websitesWithLatestAudit = websites.map((website) => ({
      ...website,
      latestAudit: website.audits[0] || null,
      audits: undefined,
    }))

    return NextResponse.json(websitesWithLatestAudit)
  } catch (error) {
    console.error('Get websites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: { id, userId },
    })

    if (!website) {
      return NextResponse.json({ error: 'Site non trouvé' }, { status: 404 })
    }

    // Delete website (cascade will handle related records thanks to Prisma onDelete: Cascade)
    await prisma.website.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete website error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
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

    // Ensure user exists in DB (demo user is hardcoded in auth)
    await ensureUserExists(userId, session)

    const body = await request.json()
    const { domain, name } = body

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Le domaine est requis.' },
        { status: 400 }
      )
    }

    // Clean domain: remove protocol, www, path, and email prefix
    let cleanedDomain = domain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')

    // If it looks like an email, reject it
    if (cleanedDomain.includes('@')) {
      return NextResponse.json(
        { error: 'Entrez un domaine (ex: monsite.fr), pas une adresse email.' },
        { status: 400 }
      )
    }

    // Validate domain format
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(cleanedDomain)) {
      return NextResponse.json(
        { error: 'Format de domaine invalide. Exemple : monsite.fr' },
        { status: 400 }
      )
    }

    // Check if website already exists for this user
    const existing = await prisma.website.findUnique({
      where: {
        domain_userId: {
          domain: cleanedDomain,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce site est deja dans votre compte.' },
        { status: 409 }
      )
    }

    const website = await prisma.website.create({
      data: {
        domain: cleanedDomain,
        name: name || cleanedDomain,
        userId,
      },
    })

    return NextResponse.json(website, { status: 201 })
  } catch (error) {
    console.error('Create website error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
