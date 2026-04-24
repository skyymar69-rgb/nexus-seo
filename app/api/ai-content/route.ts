import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiContentSchema } from '@/lib/validations'
import { generateContent } from '@/lib/content-engine'
import { generateStructuredArticle } from '@/lib/structured-content'

export const runtime = 'nodejs'

// GET: Generate structured article (non-streaming, JSON response)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword')
    const type = searchParams.get('type') || 'article'
    const tone = searchParams.get('tone') || 'professionnel'
    const language = searchParams.get('language') || 'fr'
    const wordCount = parseInt(searchParams.get('wordCount') || '1200')

    if (!keyword) {
      return NextResponse.json({ error: 'Mot-cle requis' }, { status: 400 })
    }

    const article = await generateStructuredArticle({
      keyword,
      type: type as any,
      tone,
      language,
      wordCount,
    })

    return NextResponse.json({ success: true, article })
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}` },
      { status: 500 }
    )
  }
}

// POST: Stream content (existing behavior)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = aiContentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Donnees invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, keyword, tone, language, wordCount, instructions } = parsed.data

    // Generate content using the local template engine (no API key needed)
    const fullContent = generateContent({ type, keyword, tone, language, wordCount, instructions })

    // Stream the content via SSE for a smooth typing UX
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const words = fullContent.split(/(\s+)/)
          let buffer = ''

          for (const word of words) {
            buffer += word
            // Send chunks of ~20-40 chars for natural streaming
            if (buffer.length >= 15 + Math.floor(Math.random() * 25)) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: buffer })}\n\n`)
              )
              buffer = ''
              // Small delay for typing effect
              await new Promise(r => setTimeout(r, 15 + Math.floor(Math.random() * 25)))
            }
          }
          // Flush remaining buffer
          if (buffer) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: buffer })}\n\n`)
            )
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[ai-content] Error:', error)
    return NextResponse.json(
      { error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
