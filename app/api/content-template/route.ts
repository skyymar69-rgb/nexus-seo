import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, corsOptionsResponse } from '@/lib/cors';
import * as cheerio from 'cheerio';

export async function OPTIONS() {
  return corsOptionsResponse();
}

interface ContentBrief {
  keyword: string;
  recommendedWordCount: number;
  suggestedH2: string[];
  secondaryKeywords: string[];
  questionsToAnswer: string[];
  contentStructure: string[];
  analyzedUrl?: string;
  existingH2?: string[];
  existingWordCount?: number;
}

function generateGenericBrief(keyword: string): ContentBrief {
  const kw = keyword.trim();
  return {
    keyword: kw,
    recommendedWordCount: 1500,
    suggestedH2: [
      `Qu'est-ce que le ${kw} ?`,
      `Pourquoi le ${kw} est important`,
      `Comment mettre en place une stratégie de ${kw}`,
      `Les meilleures pratiques du ${kw}`,
      `Les outils recommandés pour le ${kw}`,
      `Erreurs courantes à éviter en ${kw}`,
      `Exemples et études de cas`,
      `FAQ sur le ${kw}`,
    ],
    secondaryKeywords: [
      `${kw} stratégie`,
      `${kw} outils`,
      `${kw} débutant`,
      `${kw} guide`,
      `optimiser ${kw}`,
      `meilleur ${kw}`,
    ],
    questionsToAnswer: [
      `Comment débuter en ${kw} ?`,
      `Quels sont les avantages du ${kw} ?`,
      `Combien coûte une stratégie de ${kw} ?`,
      `Quels résultats attendre du ${kw} ?`,
      `Quelles sont les tendances ${kw} en 2026 ?`,
    ],
    contentStructure: [
      `Introduction (100-150 mots) — Accroche et promesse de valeur`,
      `Section 1 : Définition et contexte (200-250 mots)`,
      `Section 2 : Importance et bénéfices (200-250 mots)`,
      `Section 3 : Guide pratique étape par étape (300-400 mots)`,
      `Section 4 : Bonnes pratiques (200-250 mots)`,
      `Section 5 : Outils et ressources (150-200 mots)`,
      `Section 6 : FAQ (200-250 mots)`,
      `Conclusion avec CTA (100-150 mots)`,
    ],
  };
}

async function analyzeUrl(url: string, keyword: string): Promise<ContentBrief> {
  const brief = generateGenericBrief(keyword);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'NexusSEO-ContentAnalyzer/1.0' },
    });
    clearTimeout(timeout);

    if (!res.ok) return brief;

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract existing H2s
    const existingH2: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) existingH2.push(text);
    });

    // Count words
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const existingWordCount = bodyText.split(/\s+/).length;

    // Recommend 20% more than existing
    const recommendedWordCount = Math.max(1500, Math.round(existingWordCount * 1.2));

    // Extract key terms from page
    const words = bodyText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const topTerms = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([term]) => term);

    return {
      ...brief,
      recommendedWordCount,
      analyzedUrl: url,
      existingH2,
      existingWordCount,
      secondaryKeywords: Array.from(new Set([...brief.secondaryKeywords, ...topTerms])).slice(0, 10),
    };
  } catch {
    return brief;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, url } = body;

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Le champ "keyword" est requis.' }, { status: 400, headers: corsHeaders() });
    }

    let brief: ContentBrief;
    if (url && typeof url === 'string') {
      brief = await analyzeUrl(url, keyword);
    } else {
      brief = generateGenericBrief(keyword);
    }

    return NextResponse.json(brief, { headers: corsHeaders() });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders() });
  }
}
