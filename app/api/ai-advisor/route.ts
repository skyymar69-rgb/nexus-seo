import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateRecommendations,
  generateChecklist,
  calculateSEOScore,
  generateActionPlan,
  setGoals,
  getBenchmarks,
  estimateTimeline,
} from '@/lib/ai-advisor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId est requis' },
        { status: 400 }
      )
    }

    // Verify user owns the website
    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId },
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Site non trouve' },
        { status: 404 }
      )
    }

    // Fetch the latest audit
    const latestAudit = await prisma.audit.findFirst({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestAudit) {
      return NextResponse.json({
        empty: true,
        message: 'Aucun audit disponible. Lancez un audit pour obtenir des recommandations personnalisées.',
      })
    }

    // Fetch latest crawl session with pages
    const latestCrawl = await prisma.crawlSession.findFirst({
      where: { websiteId, status: 'completed' },
      orderBy: { startedAt: 'desc' },
      include: {
        pages: {
          take: 100,
          orderBy: { crawledAt: 'desc' },
        },
      },
    })

    // Fetch latest performance data
    const latestPerformance = await prisma.performanceData.findFirst({
      where: { websiteId },
      orderBy: { testedAt: 'desc' },
    })

    // Fetch backlinks data
    const backlinks = await prisma.backlink.findMany({
      where: { websiteId },
    })

    // Fetch AI visibility data
    const aiQueries = await prisma.aIVisibilityQuery.findMany({
      where: { websiteId },
      orderBy: { date: 'desc' },
      take: 50,
    })

    // Fetch content pages
    const contentPages = await prisma.contentPage.findMany({
      where: { websiteId },
      take: 50,
    })

    // Fetch historical audits for trend/evolution
    const historicalAudits = await prisma.audit.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'asc' },
      select: { score: true, grade: true, createdAt: true },
      take: 12,
    })

    // Parse stored JSON fields from the audit
    const metaData = latestAudit.metaData ? JSON.parse(latestAudit.metaData) : {}
    const contentData = latestAudit.contentData ? JSON.parse(latestAudit.contentData) : {}
    const technicalData = latestAudit.technicalData ? JSON.parse(latestAudit.technicalData) : {}
    const checks = latestAudit.checks ? JSON.parse(latestAudit.checks) : []

    // Compute backlink aggregates
    const backlinkCount = backlinks.length
    const qualityBacklinks = backlinks.filter(b => (b.da || 0) >= 40).length
    const toxicBacklinks = backlinks.filter(b => (b.spamScore || 0) > 60).length

    // Compute AI visibility mention rate
    const totalAiQueries = aiQueries.length
    const mentionedQueries = aiQueries.filter(q => q.mentioned).length
    const mentionRate = totalAiQueries > 0 ? Math.round((mentionedQueries / totalAiQueries) * 100) : 0

    // Compute average word count from content pages
    const avgWordCount = contentPages.length > 0
      ? Math.round(contentPages.reduce((sum, p) => sum + (p.wordCount || 0), 0) / contentPages.length)
      : contentData?.wordCount || 0

    // Build the unified audit data object that ai-advisor engine expects
    const auditData: any = {
      score: latestAudit.score,
      grade: latestAudit.grade,
      meta: {
        title: metaData?.title || null,
        description: metaData?.description || null,
        canonical: metaData?.canonical || null,
        ogTags: metaData?.ogTitle || metaData?.ogImage || null,
        robotsMeta: metaData?.robots || null,
      },
      content: {
        wordCount: avgWordCount || contentData?.wordCount || 0,
        h1: contentData?.h1Count > 0,
        h1Count: contentData?.h1Count || 0,
        h2: contentData?.h2Count > 0,
        h2Count: contentData?.h2Count || 0,
        imagesWithoutAlt: contentData?.imagesWithoutAlt
          ?? (contentData?.imageCount ? contentData.imageCount - (contentData?.imagesWithAlt || 0) : 0),
        imagesTotal: contentData?.imageCount || 0,
        keywordDensity: contentData?.keywordDensity || 0,
        lastUpdated: latestAudit.createdAt,
      },
      technical: {
        https: technicalData?.https ?? (checks?.some?.((c: any) => c.id === 'https' && c.status === 'passed') || false),
        structuredData: technicalData?.structuredData ?? false,
        robotsTxt: technicalData?.robotsTxt ?? false,
        sitemap: technicalData?.sitemap ?? false,
        contentFresh: true,
      },
      performance: {
        loadTime: latestPerformance?.ttfb
          ? Math.round(latestPerformance.ttfb + (latestPerformance.fcp || 0))
          : technicalData?.loadTime || 0,
        lcp: latestPerformance?.lcp ? Math.round(latestPerformance.lcp) : 0,
        fid: latestPerformance?.fid ? Math.round(latestPerformance.fid) : 0,
        cls: latestPerformance?.cls || 0,
        pageSize: latestPerformance?.pageSize || 0,
        ttfb: latestPerformance?.ttfb ? Math.round(latestPerformance.ttfb) : 0,
      },
      backlinks: {
        count: backlinkCount,
        quality: qualityBacklinks,
        toxicCount: toxicBacklinks,
      },
      aiVisibility: {
        mentionRate,
      },
      mobile: {
        viewport: true, // assume true if no data contradicts
        pageSpeedScore: latestPerformance?.score || 50,
      },
      ux: {
        internalLinking: true,
        breadcrumb: true,
      },
    }

    // Enrich from crawl data if available
    if (latestCrawl?.pages && latestCrawl.pages.length > 0) {
      const pages = latestCrawl.pages
      const totalImagesNoAlt = pages.reduce((sum, p) => sum + p.imagesNoAlt, 0)
      if (totalImagesNoAlt > 0 && !auditData.content.imagesWithoutAlt) {
        auditData.content.imagesWithoutAlt = totalImagesNoAlt
      }

      // Check for missing H1 across pages
      const pagesWithoutH1 = pages.filter(p => p.h1Count === 0).length
      if (pagesWithoutH1 > pages.length * 0.5) {
        auditData.content.h1 = false
        auditData.content.h1Count = 0
      }
    }

    // Call ai-advisor engine functions
    const scoreBreakdown = calculateSEOScore(auditData)
    const recommendations = generateRecommendations(auditData, { domain: website.domain })
    const checklist = generateChecklist(auditData)
    const actionPlan = generateActionPlan(auditData)
    const goals = setGoals({
      score: latestAudit.score,
      performance: auditData.performance,
      keywords: { top10: 0 },
      backlinks: { quality: qualityBacklinks },
      aiVisibility: { mentionRate },
    })
    const timeline = estimateTimeline(latestAudit.score, Math.min(100, latestAudit.score + 20))
    const benchmarks = getBenchmarks()

    // Build evolution data from historical audits
    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const evolutionData = historicalAudits.map(a => ({
      month: monthNames[new Date(a.createdAt).getMonth()],
      actual: a.score,
      goal: Math.min(100, a.score + 10),
      industry: 68,
    }))

    // ── RAG: GPT-powered personalized insight ──
    let aiInsight: string | null = null
    try {
      if (process.env.OPENAI_API_KEY) {
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const context = `
Site: ${website.domain}
Score SEO: ${latestAudit.score}/100 (${latestAudit.grade})
Performance: LCP=${auditData.performance.lcp}ms, CLS=${auditData.performance.cls}, TTFB=${auditData.performance.ttfb}ms
Contenu: ${auditData.content.wordCount} mots, ${auditData.content.h1Count} H1, ${auditData.content.imagesWithoutAlt} images sans alt
Backlinks: ${backlinkCount} total, ${qualityBacklinks} de qualité (DA>40), ${toxicBacklinks} toxiques
Visibilité IA: ${mentionRate}% de mentions dans les LLMs
Problèmes détectés: ${checks.filter((c: any) => c.status === 'error').map((c: any) => c.name).join(', ') || 'aucun critique'}
Avertissements: ${checks.filter((c: any) => c.status === 'warning').map((c: any) => c.name).join(', ') || 'aucun'}
`.trim()

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 600,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert SEO senior. Analyse les donnees d\'audit fournies et donne 3 recommandations prioritaires ultra-specifiques au site. Sois direct, concis, actionnable. Reponds en francais. Format: 3 paragraphes courts numerotes.',
            },
            {
              role: 'user',
              content: `Voici les donnees d'audit de mon site. Donne-moi tes 3 recommandations prioritaires les plus impactantes :\n\n${context}`,
            },
          ],
        })

        aiInsight = completion.choices[0]?.message?.content || null
      }
    } catch (gptError) {
      console.error('GPT insight generation failed (non-blocking):', gptError)
    }

    return NextResponse.json({
      empty: false,
      scoreBreakdown,
      recommendations,
      checklist,
      actionPlan,
      goals,
      timeline,
      benchmarks,
      evolutionData,
      aiInsight,
      lastAuditDate: latestAudit.createdAt,
      websiteDomain: website.domain,
    })
  } catch (error) {
    console.error('AI Advisor API error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
