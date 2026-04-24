import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';

interface PerformanceMetrics {
  url: string;
  score: number;
  grade: string;
  source: 'pagespeed' | 'local';
  coreWebVitals: {
    lcp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
    inp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor' };
  };
  metrics: {
    ttfb: number;
    fcp: number;
    lcp: number;
    tti: number;
    speedIndex: number;
    tbt: number;
  };
  resources: {
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    totalSize: number;
    breakdown: Array<{ type: string; size: number; percentage: number }>;
  };
  opportunities: Array<{ title: string; description: string; savings: string }>;
  technical: {
    https: boolean;
    ttfb: number;
    responseTime: number;
    contentLength: number;
    contentType: string;
  };
}

export async function OPTIONS() {
  return corsOptionsResponse();
}

function getGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getRating(value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/* ─────────────────────────────────────────────────────────────────
   GOOGLE PAGESPEED INSIGHTS API (primary source)
   ───────────────────────────────────────────────────────────────── */

async function fetchPageSpeedInsights(url: string, strategy: string): Promise<PerformanceMetrics | null> {
  try {
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('strategy', strategy.toUpperCase() === 'MOBILE' ? 'MOBILE' : 'DESKTOP');
    apiUrl.searchParams.set('category', 'PERFORMANCE');
    if (apiKey) apiUrl.searchParams.set('key', apiKey);

    const response = await fetch(apiUrl.toString(), {
      signal: AbortSignal.timeout(60000), // PageSpeed can take up to 60s
    });

    if (!response.ok) {
      console.error(`PageSpeed API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    if (!lighthouse) return null;

    // Extract score (0-1 → 0-100)
    const score = Math.round((lighthouse.categories?.performance?.score || 0) * 100);

    // Extract Core Web Vitals from audits
    const audits = lighthouse.audits || {};

    const lcpMs = Math.round(audits['largest-contentful-paint']?.numericValue || 0);
    const fcpMs = Math.round(audits['first-contentful-paint']?.numericValue || 0);
    const tbtMs = Math.round(audits['total-blocking-time']?.numericValue || 0);
    const clsVal = parseFloat((audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3));
    const siMs = Math.round(audits['speed-index']?.numericValue || 0);
    const ttiMs = Math.round(audits['interactive']?.numericValue || 0);
    const ttfbMs = Math.round(audits['server-response-time']?.numericValue || 0);

    // Extract opportunities from Lighthouse
    const opportunities: Array<{ title: string; description: string; savings: string }> = [];
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'server-response-time',
      'redirects',
      'uses-rel-preconnect',
      'dom-size',
      'font-display',
    ];

    for (const auditId of opportunityAudits) {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1 && audit.title) {
        const savingsMs = audit.numericValue ? `~${Math.round(audit.numericValue)}ms` : '';
        const savingsBytes = audit.details?.overallSavingsBytes
          ? `~${Math.round(audit.details.overallSavingsBytes / 1024)}KB`
          : '';
        opportunities.push({
          title: audit.title,
          description: audit.description?.split('.')[0] || '',
          savings: savingsMs || savingsBytes || 'Amelioration possible',
        });
      }
    }

    // Extract resource summary from Lighthouse
    const resourceSummary = audits['resource-summary']?.details?.items || [];
    let scripts = 0, stylesheets = 0, images = 0, fonts = 0, totalSize = 0;
    const breakdown: Array<{ type: string; size: number; percentage: number }> = [];

    for (const item of resourceSummary) {
      totalSize += item.transferSize || 0;
      if (item.resourceType === 'script') { scripts = item.requestCount || 0; breakdown.push({ type: 'scripts', size: item.transferSize || 0, percentage: 0 }); }
      if (item.resourceType === 'stylesheet') { stylesheets = item.requestCount || 0; breakdown.push({ type: 'stylesheets', size: item.transferSize || 0, percentage: 0 }); }
      if (item.resourceType === 'image') { images = item.requestCount || 0; breakdown.push({ type: 'images', size: item.transferSize || 0, percentage: 0 }); }
      if (item.resourceType === 'font') { fonts = item.requestCount || 0; breakdown.push({ type: 'fonts', size: item.transferSize || 0, percentage: 0 }); }
      if (item.resourceType === 'document') { breakdown.push({ type: 'document', size: item.transferSize || 0, percentage: 0 }); }
    }

    // Calculate percentages
    for (const item of breakdown) {
      item.percentage = totalSize > 0 ? Math.round((item.size / totalSize) * 100) : 0;
    }

    return {
      url,
      score,
      grade: getGrade(score),
      source: 'pagespeed',
      coreWebVitals: {
        lcp: { value: lcpMs, unit: 'ms', rating: getRating(lcpMs, 2500, 4000) },
        inp: { value: tbtMs, unit: 'ms', rating: getRating(tbtMs, 200, 500) },
        cls: { value: clsVal, unit: '', rating: getRating(clsVal, 0.1, 0.25) },
      },
      metrics: {
        ttfb: ttfbMs,
        fcp: fcpMs,
        lcp: lcpMs,
        tti: ttiMs,
        speedIndex: siMs,
        tbt: tbtMs,
      },
      resources: {
        scripts,
        stylesheets,
        images,
        fonts,
        totalSize,
        breakdown: breakdown.filter(b => b.percentage > 0),
      },
      opportunities: opportunities.slice(0, 10),
      technical: {
        https: url.startsWith('https'),
        ttfb: ttfbMs,
        responseTime: fcpMs,
        contentLength: totalSize,
        contentType: 'text/html',
      },
    };
  } catch (error) {
    console.error('PageSpeed Insights API failed, falling back to local analysis:', error);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────
   LOCAL HTML ANALYSIS (fallback)
   ───────────────────────────────────────────────────────────────── */

function parseUrl(urlString: string): URL {
  try {
    return new URL(urlString);
  } catch {
    const withProtocol = urlString.startsWith('http') ? urlString : `https://${urlString}`;
    return new URL(withProtocol);
  }
}

async function localAnalysis(urlString: string): Promise<PerformanceMetrics> {
  const url = parseUrl(urlString);
  const startTime = performance.now();

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });

  const ttfb = performance.now() - startTime;

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

  const html = await response.text();
  const responseTime = performance.now() - startTime;
  const contentLength = new TextEncoder().encode(html).length;

  const $ = cheerio.load(html);

  // Count resources
  const scripts = $('script[src]').length;
  const stylesheets = $('link[rel="stylesheet"]').length;
  const imgElements = $('img');
  const imagesCount = imgElements.length;
  const imagesWithoutDimensions = imgElements.filter((_, el) => !$(el).attr('width') || !$(el).attr('height')).length;
  const lazyLoaded = imgElements.filter((_, el) => $(el).attr('loading') === 'lazy').length;
  const renderBlocking = $('head link[rel="stylesheet"]').length + $('head script[src]:not([async]):not([defer])').length;
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;

  // Estimate metrics
  const ttfbVal = Math.round(ttfb);
  const fcp = Math.round(ttfbVal + renderBlocking * 150);
  const lcp = Math.round(fcp + (imagesCount > 0 ? Math.max(500, (contentLength / 1000000) * 1000) : 0));
  const tti = Math.round(lcp + scripts * 150);
  const speedIndex = Math.round((ttfbVal + fcp * 2 + lcp * 3 + tti) / 7);
  const tbt = Math.round(Math.max(0, scripts * 20));
  const clsVal = parseFloat((imagesWithoutDimensions * 0.05 + renderBlocking * 0.02).toFixed(3));

  // Score
  let score = 100;
  if (ttfbVal > 1800) score -= 30; else if (ttfbVal > 600) score -= 20; else if (ttfbVal > 300) score -= 10;
  if (contentLength > 5 * 1024 * 1024) score -= 20; else if (contentLength > 1024 * 1024) score -= 10;
  if (renderBlocking > 10) score -= 20; else if (renderBlocking > 5) score -= 15; else if (renderBlocking > 2) score -= 10;
  if (imagesWithoutDimensions > 5) score -= 10; else if (imagesWithoutDimensions > 0) score -= 5;
  if (!hasViewport) score -= 15;
  if (scripts > 20) score -= 15; else if (scripts > 10) score -= 10;
  if (hasJsonLd) score += 3;
  if (lazyLoaded > 0) score += Math.min(5, lazyLoaded);
  score = Math.max(0, Math.min(100, score));

  // Opportunities
  const opportunities: Array<{ title: string; description: string; savings: string }> = [];
  if (renderBlocking > 2) opportunities.push({ title: 'Eliminer les ressources bloquantes', description: `${renderBlocking} ressources bloquent le rendu.`, savings: `~${renderBlocking * 150}ms` });
  if (imagesWithoutDimensions > 0) opportunities.push({ title: 'Ajouter width/height aux images', description: `${imagesWithoutDimensions} images sans dimensions (CLS).`, savings: `CLS -${(imagesWithoutDimensions * 0.05).toFixed(2)}` });
  if (!hasViewport) opportunities.push({ title: 'Ajouter le meta viewport', description: 'Requis pour le rendu mobile.', savings: 'Fix mobile' });
  if (scripts > 5) opportunities.push({ title: 'Optimiser le JavaScript', description: `${scripts} scripts externes. Utiliser async/defer.`, savings: `~${scripts * 100}ms` });
  if (lazyLoaded === 0 && imagesCount > 3) opportunities.push({ title: 'Lazy loading images', description: `${imagesCount} images sans lazy loading.`, savings: `~${imagesCount * 100}ms` });

  const totalSize = contentLength + scripts * 45000 + stylesheets * 35000 + imagesCount * 65000;

  return {
    url: urlString,
    score: Math.round(score),
    grade: getGrade(score),
    source: 'local',
    coreWebVitals: {
      lcp: { value: lcp, unit: 'ms', rating: getRating(lcp, 2500, 4000) },
      inp: { value: tbt, unit: 'ms', rating: getRating(tbt, 200, 500) },
      cls: { value: clsVal, unit: '', rating: getRating(clsVal, 0.1, 0.25) },
    },
    metrics: { ttfb: ttfbVal, fcp, lcp, tti, speedIndex, tbt },
    resources: {
      scripts, stylesheets, images: imagesCount, fonts: 0, totalSize,
      breakdown: [
        { type: 'images', size: imagesCount * 65000, percentage: Math.round((imagesCount * 65000 / totalSize) * 100) },
        { type: 'scripts', size: scripts * 45000, percentage: Math.round((scripts * 45000 / totalSize) * 100) },
        { type: 'stylesheets', size: stylesheets * 35000, percentage: Math.round((stylesheets * 35000 / totalSize) * 100) },
        { type: 'document', size: contentLength, percentage: Math.round((contentLength / totalSize) * 100) },
      ].filter(b => b.percentage > 0),
    },
    opportunities,
    technical: {
      https: url.protocol === 'https:',
      ttfb: ttfbVal,
      responseTime: Math.round(responseTime),
      contentLength,
      contentType: response.headers.get('content-type') || 'text/html',
    },
  };
}

/* ─────────────────────────────────────────────────────────────────
   POST HANDLER
   ───────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, device = 'desktop', websiteId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Try Google PageSpeed Insights API first
    let result = await fetchPageSpeedInsights(normalizedUrl, device);

    // Fallback to local analysis
    if (!result) {
      result = await localAnalysis(normalizedUrl);
    }

    // Save to database if websiteId provided
    if (websiteId && result) {
      try {
        await prisma.performanceData.create({
          data: {
            websiteId,
            device,
            url: normalizedUrl,
            score: result.score,
            grade: result.grade,
            ttfb: result.metrics.ttfb,
            lcp: result.metrics.lcp,
            fid: result.metrics.tbt,
            cls: result.coreWebVitals.cls.value,
            fcp: result.metrics.fcp,
            tti: result.metrics.tti,
            tbt: result.metrics.tbt,
            speedIndex: result.metrics.speedIndex,
            pageSize: result.resources.totalSize,
            requests: result.resources.scripts + result.resources.stylesheets + result.resources.images,
            resources: JSON.stringify(result.resources.breakdown),
            opportunities: JSON.stringify(result.opportunities),
          },
        });
      } catch (dbError) {
        console.error('Failed to save performance data:', dbError);
      }
    }

    return NextResponse.json(result, { status: 200, headers: corsHeaders() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Analyse de performance echouee: ${msg}` },
      { status: 500, headers: corsHeaders() }
    );
  }
}
