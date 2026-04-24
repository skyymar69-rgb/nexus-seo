import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runFullScan } from '@/lib/scan-orchestrator'
import { corsHeaders, corsOptionsResponse } from '@/lib/cors'

// Vercel serverless max duration (seconds)
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401, headers: corsHeaders() })
    }

    const { websiteId, url } = await request.json()

    if (!websiteId || !url) {
      return NextResponse.json(
        { error: 'websiteId et url requis' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Verify website belongs to user
    const website = await (prisma as any).website.findFirst({
      where: { id: websiteId, userId: session.user.id },
    })

    if (!website) {
      return NextResponse.json({ error: 'Site non trouve' }, { status: 404, headers: corsHeaders() })
    }

    // Normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Create scan session
    const scan = await (prisma as any).scanSession.create({
      data: {
        websiteId,
        url: normalizedUrl,
        status: 'pending',
        progress: 0,
        totalSteps: 6,
      },
    })

    // Run scan SYNCHRONOUSLY — Vercel kills background tasks
    try {
      const result = await runFullScan(scan.id, websiteId, normalizedUrl)

      return NextResponse.json(
        {
          success: true,
          scanId: scan.id,
          status: 'completed',
          scores: {
            audit: result.audit?.score ?? null,
            aeo: result.aeo?.overallScore ?? null,
            geo: result.geo?.overallScore ?? null,
            performance: result.performance?.score ?? null,
          },
        },
        { headers: corsHeaders() }
      )
    } catch (err) {
      console.error('[Scan] Error:', err)

      // Update scan as failed
      try {
        await (prisma as any).scanSession.update({
          where: { id: scan.id },
          data: { status: 'failed', error: String(err) },
        })
      } catch { /* ignore */ }

      return NextResponse.json(
        {
          success: true,
          scanId: scan.id,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Erreur inconnue',
        },
        { headers: corsHeaders() }
      )
    }
  } catch (error) {
    console.error('[Scan] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du lancement du scan' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsOptionsResponse()
}
