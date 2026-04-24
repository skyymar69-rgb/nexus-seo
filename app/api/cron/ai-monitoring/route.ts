import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryLLM, type LLMProvider } from '@/lib/llm-clients'

/**
 * Vercel Cron Job — Daily AI Visibility Monitoring
 * Runs at 6:00 AM UTC every day
 *
 * For each website with tracking enabled:
 * 1. Generates industry-relevant prompts
 * 2. Queries ChatGPT, Claude, Gemini
 * 3. Checks if the brand is mentioned
 * 4. Stores results in AIVisibilityQuery table
 */

const CRON_SECRET = process.env.CRON_SECRET || ''

// Industry-specific prompt templates
const promptTemplates = [
  'Quels sont les meilleurs outils pour analyser le SEO de {domain} ?',
  'Recommandez-moi un outil SEO gratuit pour auditer {domain}',
  'Quel est le meilleur outil pour optimiser sa visibilite dans les moteurs IA ?',
  'Quels outils SEO gratuits recommandez-vous en 2026 ?',
  'Comment optimiser mon site {domain} pour ChatGPT et Google SGE ?',
  'Quels sont les meilleurs outils GEO et AEO en 2026 ?',
  'Nexus SEO est-il un bon outil ? Que pensez-vous de {domain} ?',
]

const LLM_LIST: LLMProvider[] = ['chatgpt', 'claude', 'gemini']

function detectMention(response: string, domain: string): boolean {
  const domainParts = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')
  const brandName = domainParts[0] // e.g. "nexus" from "nexus.kayzen-lyon.fr"
  const fullDomain = domainParts.join('.')

  const searchTerms = [fullDomain, brandName, 'nexus seo', 'nexus-seo', 'kayzen']
  const lowerResponse = response.toLowerCase()

  return searchTerms.some(term => lowerResponse.includes(term.toLowerCase()))
}

function detectSentiment(response: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['recommande', 'excellent', 'meilleur', 'efficace', 'performant', 'gratuit', 'puissant', 'innovant', 'fiable', 'complet']
  const negativeWords = ['mauvais', 'cher', 'limite', 'deconseille', 'insuffisant', 'lent', 'bug', 'mediocre']

  const lower = response.toLowerCase()
  const posCount = positiveWords.filter(w => lower.includes(w)).length
  const negCount = negativeWords.filter(w => lower.includes(w)).length

  if (posCount > negCount + 1) return 'positive'
  if (negCount > posCount) return 'negative'
  return 'neutral'
}

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all websites that have been active (have at least 1 audit)
    const websites = await prisma.website.findMany({
      where: {
        audits: { some: {} }, // Only websites with at least one audit
      },
      select: {
        id: true,
        domain: true,
        name: true,
      },
      take: 50, // Limit to avoid timeout
    })

    if (websites.length === 0) {
      return NextResponse.json({ message: 'No websites to monitor', processed: 0 })
    }

    let totalQueries = 0
    let totalMentions = 0

    for (const website of websites) {
      // Pick 2 random prompts per website
      const shuffled = [...promptTemplates].sort(() => Math.random() - 0.5)
      const selectedPrompts = shuffled.slice(0, 2)

      for (const template of selectedPrompts) {
        const prompt = template.replace(/\{domain\}/g, website.domain)

        for (const llm of LLM_LIST) {
          try {
            const llmResponse = await queryLLM(llm, prompt)
            const response = llmResponse.text
            const mentioned = detectMention(response, website.domain)
            const sentiment = detectSentiment(response)

            // Find mention position (sentence number)
            let position = 0
            if (mentioned) {
              const sentences = response.split(/[.!?]+/)
              const domainLower = website.domain.toLowerCase()
              position = sentences.findIndex(s => s.toLowerCase().includes(domainLower)) + 1
              totalMentions++
            }

            await prisma.aIVisibilityQuery.create({
              data: {
                websiteId: website.id,
                prompt,
                llm,
                response: response.slice(0, 2000), // Truncate to save space
                mentioned,
                position,
                sentiment,
                context: mentioned ? response.slice(0, 500) : null,
                competitors: JSON.stringify([]),
                sources: JSON.stringify([]),
              },
            })

            totalQueries++
          } catch (llmError) {
            console.error(`LLM query failed for ${llm}:`, llmError)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: websites.length,
      totalQueries,
      totalMentions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('AI monitoring cron failed:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
