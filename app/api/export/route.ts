import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const scanId = searchParams.get('scanId')
    const format = searchParams.get('format') || 'json'

    if (!scanId) {
      return NextResponse.json({ error: 'scanId requis' }, { status: 400 })
    }

    // Fetch scan with website
    const scan = await (prisma as any).scanSession.findUnique({
      where: { id: scanId },
      include: { website: { select: { domain: true, name: true, userId: true } } },
    })

    if (!scan || scan.website.userId !== session.user.id) {
      return NextResponse.json({ error: 'Scan non trouve' }, { status: 404 })
    }

    let results: any = null
    if (scan.results) {
      try { results = JSON.parse(scan.results) } catch { results = null }
    }

    // JSON export
    if (format === 'json') {
      const jsonData = {
        rapport: {
          site: scan.website.domain,
          nom: scan.website.name,
          date: scan.completedAt || scan.startedAt,
          scores: {
            seo: scan.auditScore,
            aeo: scan.aeoScore,
            geo: scan.geoScore,
            performance: scan.perfScore,
          },
        },
        audit: results?.audit || null,
        aeo: results?.aeo || null,
        geo: results?.geo || null,
        geoEngine: results?.geoEngine || null,
        performance: results?.performance || null,
        crawl: results?.crawl || null,
      }

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="nexus-rapport-${scan.website.domain}-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    // HTML report (can be printed as PDF by browser)
    if (format === 'html' || format === 'pdf') {
      const audit = results?.audit
      const aeo = results?.aeo
      const geo = results?.geo
      const perf = results?.performance
      const crawl = results?.crawl
      const eeat = results?.geoEngine?.eeat

      const scoreColor = (s: number | null) => !s ? '#666' : s >= 75 ? '#34d399' : s >= 50 ? '#fbbf24' : '#fb7185'
      const grade = (s: number | null) => !s ? '—' : s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 55 ? 'C' : s >= 35 ? 'D' : 'F'

      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport SEO — ${scan.website.domain}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; background: #fff; line-height: 1.6; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb; }
    .logo { font-size: 24px; font-weight: 900; color: #3b82f6; margin-bottom: 8px; }
    .site-name { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .date { color: #9ca3af; font-size: 14px; }
    .scores { display: flex; justify-content: center; gap: 30px; margin: 30px 0; }
    .score-card { text-align: center; padding: 20px; border-radius: 12px; background: #f9fafb; border: 1px solid #e5e7eb; min-width: 120px; }
    .score-value { font-size: 36px; font-weight: 900; }
    .score-label { font-size: 12px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .score-grade { font-size: 14px; font-weight: 700; margin-top: 2px; }
    .section { margin: 30px 0; page-break-inside: avoid; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px; }
    .section-icon { width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; }
    .check-list { list-style: none; }
    .check-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .check-status { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; flex-shrink: 0; margin-top: 2px; }
    .check-passed { background: #34d399; }
    .check-warning { background: #fbbf24; }
    .check-error { background: #fb7185; }
    .check-name { font-weight: 600; font-size: 14px; }
    .check-value { font-size: 13px; color: #6b7280; }
    .check-score { font-size: 12px; font-weight: 700; margin-left: auto; flex-shrink: 0; }
    .bar-container { height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; margin-top: 4px; }
    .bar-fill { height: 100%; border-radius: 4px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .metric-card { padding: 15px; border-radius: 8px; background: #f9fafb; border: 1px solid #e5e7eb; }
    .metric-label { font-size: 12px; color: #9ca3af; }
    .metric-value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .reco-list { list-style: none; counter-reset: reco; }
    .reco-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .reco-num { width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
    @media print {
      .page { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo">● ● ● Nexus SEO</div>
      <div class="site-name">${scan.website.name || scan.website.domain}</div>
      <div class="date">Rapport généré le ${new Date(scan.completedAt || scan.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>

    <div class="scores">
      <div class="score-card">
        <div class="score-value" style="color: ${scoreColor(scan.auditScore)}">${scan.auditScore ?? '—'}</div>
        <div class="score-label">SEO Technique</div>
        <div class="score-grade" style="color: ${scoreColor(scan.auditScore)}">Note ${grade(scan.auditScore)}</div>
      </div>
      <div class="score-card">
        <div class="score-value" style="color: ${scoreColor(scan.aeoScore)}">${scan.aeoScore ?? '—'}</div>
        <div class="score-label">AEO</div>
        <div class="score-grade" style="color: ${scoreColor(scan.aeoScore)}">Note ${grade(scan.aeoScore)}</div>
      </div>
      <div class="score-card">
        <div class="score-value" style="color: ${scoreColor(scan.geoScore)}">${scan.geoScore ?? '—'}</div>
        <div class="score-label">GEO</div>
        <div class="score-grade" style="color: ${scoreColor(scan.geoScore)}">Note ${grade(scan.geoScore)}</div>
      </div>
      <div class="score-card">
        <div class="score-value" style="color: ${scoreColor(scan.perfScore)}">${scan.perfScore ?? '—'}</div>
        <div class="score-label">Performance</div>
        <div class="score-grade" style="color: ${scoreColor(scan.perfScore)}">Note ${grade(scan.perfScore)}</div>
      </div>
    </div>

    ${audit ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background: #3b82f620; color: #3b82f6;">🔍</span>
        Audit Technique SEO — ${audit.score}/100
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
        ${audit.summary?.passed || 0} OK · ${audit.summary?.warnings || 0} avertissements · ${audit.summary?.errors || 0} erreurs
      </p>
      <ul class="check-list">
        ${(audit.checks || []).map((c: any) => `
          <li class="check-item">
            <span class="check-status check-${c.status}">
              ${c.status === 'passed' ? '✓' : c.status === 'warning' ? '!' : '✕'}
            </span>
            <div>
              <div class="check-name">${c.name}</div>
              <div class="check-value">${c.value}</div>
              ${c.status !== 'passed' ? `<div class="check-value" style="color: #ef4444; margin-top: 2px;">${c.summary}</div>` : ''}
            </div>
            <span class="check-score" style="color: ${scoreColor(c.score)}">${c.score}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}

    ${aeo ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background: #8b5cf620; color: #8b5cf6;">💬</span>
        Score AEO — ${aeo.overallScore}/100
      </div>
      <div class="metric-grid">
        ${aeo.snippetReadiness ? `<div class="metric-card"><div class="metric-label">Featured Snippets</div><div class="metric-value">${aeo.snippetReadiness.score}/100</div></div>` : ''}
        ${aeo.qaPatterns ? `<div class="metric-card"><div class="metric-label">Patterns Q&A</div><div class="metric-value">${aeo.qaPatterns.score}/100</div></div>` : ''}
        ${aeo.voiceReadiness ? `<div class="metric-card"><div class="metric-label">Recherche vocale</div><div class="metric-value">${aeo.voiceReadiness.score}/100</div></div>` : ''}
        ${aeo.contentStructure ? `<div class="metric-card"><div class="metric-label">Structure contenu</div><div class="metric-value">${aeo.contentStructure.score}/100</div></div>` : ''}
      </div>
      ${aeo.recommendations?.length ? `
      <div style="margin-top: 15px;">
        <ol class="reco-list">
          ${aeo.recommendations.slice(0, 5).map((r: string, i: number) => `
            <li class="reco-item"><span class="reco-num">${i + 1}</span><span>${r}</span></li>
          `).join('')}
        </ol>
      </div>` : ''}
    </div>
    ` : ''}

    ${geo ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background: #34d39920; color: #34d399;">🌐</span>
        Audit GEO — ${geo.overallScore}/100
      </div>
      ${eeat ? `
      <div class="metric-grid" style="margin-bottom: 15px;">
        <div class="metric-card"><div class="metric-label">Experience</div><div class="metric-value">${Math.round(eeat.experience)}</div></div>
        <div class="metric-card"><div class="metric-label">Expertise</div><div class="metric-value">${Math.round(eeat.expertise)}</div></div>
        <div class="metric-card"><div class="metric-label">Autorite</div><div class="metric-value">${Math.round(eeat.authority)}</div></div>
        <div class="metric-card"><div class="metric-label">Fiabilite</div><div class="metric-value">${Math.round(eeat.trust)}</div></div>
      </div>
      ` : ''}
      ${geo.recommendations?.length ? `
      <ol class="reco-list">
        ${geo.recommendations.slice(0, 5).map((r: string, i: number) => `
          <li class="reco-item"><span class="reco-num">${i + 1}</span><span>${r}</span></li>
        `).join('')}
      </ol>` : ''}
    </div>
    ` : ''}

    ${perf ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background: #22d3ee20; color: #22d3ee;">⚡</span>
        Performance — ${perf.score}/100
      </div>
      <div class="metric-grid">
        ${perf.lcp != null ? `<div class="metric-card"><div class="metric-label">LCP</div><div class="metric-value">${perf.lcp > 1000 ? (perf.lcp / 1000).toFixed(1) + 's' : Math.round(perf.lcp) + 'ms'}</div></div>` : ''}
        ${perf.fid != null ? `<div class="metric-card"><div class="metric-label">FID / INP</div><div class="metric-value">${Math.round(perf.fid)}ms</div></div>` : ''}
        ${perf.cls != null ? `<div class="metric-card"><div class="metric-label">CLS</div><div class="metric-value">${perf.cls.toFixed(3)}</div></div>` : ''}
        ${perf.ttfb != null ? `<div class="metric-card"><div class="metric-label">TTFB</div><div class="metric-value">${perf.ttfb > 1000 ? (perf.ttfb / 1000).toFixed(1) + 's' : Math.round(perf.ttfb) + 'ms'}</div></div>` : ''}
      </div>
    </div>
    ` : ''}

    ${crawl ? `
    <div class="section">
      <div class="section-title">
        <span class="section-icon" style="background: #fb718520; color: #fb7185;">🔎</span>
        Crawl — ${crawl.pagesCrawled} pages analysees
      </div>
      <div class="metric-grid" style="margin-bottom: 15px;">
        <div class="metric-card"><div class="metric-label">Pages trouvees</div><div class="metric-value">${crawl.pagesFound}</div></div>
        <div class="metric-card"><div class="metric-label">Pages crawlees</div><div class="metric-value">${crawl.pagesCrawled}</div></div>
      </div>
      ${crawl.issues?.length ? `
      <p style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Problemes detectes (${crawl.issues.length})</p>
      <ul class="check-list">
        ${crawl.issues.slice(0, 15).map((issue: any) => `
          <li class="check-item">
            <span class="check-status check-warning">!</span>
            <div>
              <div class="check-name" style="font-size: 13px;">${issue.url.replace(/^https?:\/\//, '')}</div>
              <div class="check-value">${issue.issue}</div>
            </div>
          </li>
        `).join('')}
      </ul>` : '<p style="color: #34d399; font-size: 14px;">✓ Aucun probleme majeur detecte</p>'}
    </div>
    ` : ''}

    <div class="footer">
      <div class="logo" style="font-size: 16px; margin-bottom: 4px;">● ● ● Nexus SEO</div>
      <p>Rapport généré automatiquement par Nexus SEO — nexus.kayzen-lyon.fr</p>
      <p>Développé par Kayzen Web — Agence web Lyon</p>
    </div>
  </div>
</body>
</html>`

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `${format === 'pdf' ? 'attachment' : 'inline'}; filename="nexus-rapport-${scan.website.domain}.html"`,
        },
      })
    }

    return NextResponse.json({ error: 'Format non supporte. Utilisez json ou html.' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
