import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeLLMO } from '@/lib/llmo-score'
import type { LLMProvider } from '@/lib/llm-clients'

const VALID_PROVIDERS: LLMProvider[] = ['chatgpt', 'claude', 'gemini', 'perplexity']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { brand, domain, queries, providers, websiteId } = body as {
      brand: string
      domain: string
      queries: string[]
      providers?: string[]
      websiteId: string
    }

    if (!brand || !domain || !queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'brand, domain, queries[] et websiteId sont requis' },
        { status: 400 }
      )
    }

    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId requis' }, { status: 400 })
    }

    // Verify website ownership
    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId: session.user.id },
    })
    if (!website) {
      return NextResponse.json({ error: 'Site non trouvé' }, { status: 403 })
    }

    // Validate providers
    const selectedProviders = (providers || ['chatgpt', 'claude', 'gemini', 'perplexity'])
      .filter((p): p is LLMProvider => VALID_PROVIDERS.includes(p as LLMProvider))

    // Run LLMO analysis
    const result = await analyzeLLMO(brand, domain, queries, selectedProviders)

    // Save individual query results to AIVisibilityQuery
    for (const qr of result.queryResults) {
      await prisma.aIVisibilityQuery.create({
        data: {
          websiteId,
          prompt: qr.query,
          llm: qr.provider,
          mentioned: qr.mentioned,
          position: qr.position,
          sentiment: qr.sentiment,
          competitors: JSON.stringify(qr.competitors),
          response: qr.responseSnippet,
        },
      })
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('LLMO score error:', error)
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: `Erreur scoring LLMO : ${message}` }, { status: 500 })
  }
}
