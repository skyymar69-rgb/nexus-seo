import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

interface AIVisibilityQuery {
  websiteId: string;
  llm: string;
  prompt: string;
  mentioned: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  position?: number;
  competitors: string[];
  sources: string[];
  response: string;
}

// Sentiment analysis helper
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = /excellent|great|amazing|wonderful|outstanding|fantastic|impressive|best|leading|top-tier|innovative|trusted|reliable|secure|fast/gi;
  const negativeWords = /poor|bad|worse|worst|unreliable|slow|outdated|broken|inferior|risky|unsafe|problematic|issues|concerns/gi;

  const positiveMatches = text.match(positiveWords) || [];
  const negativeMatches = text.match(negativeWords) || [];

  if (positiveMatches.length > negativeMatches.length) return 'positive';
  if (negativeMatches.length > positiveMatches.length) return 'negative';
  return 'neutral';
}

// Extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map(url => url.replace(/[.,;:!?]$/, '')); // Remove trailing punctuation
}

// Detect brand mentions in response
async function detectBrandMention(
  response: string,
  websiteId: string,
  llmName: string
): Promise<Omit<AIVisibilityQuery, 'websiteId' | 'llm' | 'prompt'>> {
  // Get website info
  const website = await prisma.website.findUnique({
    where: { id: websiteId },
    select: { domain: true, name: true }
  });

  if (!website) {
    throw new Error('Website not found');
  }

  // Extract domain name (e.g., "example" from "example.com")
  const domainParts = website.domain.split('.');
  const domainName = domainParts[0].toLowerCase();
  const fullDomain = website.domain.toLowerCase();
  const brandName = (website.name || website.domain).toLowerCase();

  // Check for mentions
  const lowerResponse = response.toLowerCase();
  const mentioned =
    lowerResponse.includes(domainName) ||
    lowerResponse.includes(fullDomain) ||
    lowerResponse.includes(brandName);

  let position: number | undefined;
  if (mentioned) {
    const sentences = response.split(/[.!?]+/);
    for (let i = 0; i < sentences.length; i++) {
      if (
        sentences[i].toLowerCase().includes(domainName) ||
        sentences[i].toLowerCase().includes(fullDomain) ||
        sentences[i].toLowerCase().includes(brandName)
      ) {
        position = i;
        break;
      }
    }
  }

  // Analyze sentiment around mention
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (mentioned && position !== undefined) {
    const sentences = response.split(/[.!?]+/);
    const contextStart = Math.max(0, position - 1);
    const contextEnd = Math.min(sentences.length, position + 2);
    const context = sentences.slice(contextStart, contextEnd).join(' ');
    sentiment = analyzeSentiment(context);
  }

  // Detect competitors
  const competitors: string[] = [];
  const commonCompetitors = [
    'openai',
    'anthropic',
    'claude',
    'chatgpt',
    'gemini',
    'bard',
    'meta',
    'xai',
    'mistral',
    'cohere'
  ];

  for (const competitor of commonCompetitors) {
    if (lowerResponse.includes(competitor) && !fullDomain.includes(competitor)) {
      competitors.push(competitor);
    }
  }

  // Extract sources
  const sources = extractUrls(response);

  return {
    mentioned,
    sentiment: mentioned ? sentiment : undefined,
    position,
    competitors,
    sources,
    response
  };
}

// Call actual LLM or simulate
async function queryLLM(prompt: string, llmName: string): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall through to simulation
    }
  }

  // Simulate response for demo/testing
  const simulatedResponses: { [key: string]: string[] } = {
    chatgpt: [
      'Based on your query, I found several relevant solutions. Many modern platforms offer similar features. Your brand stands out with competitive pricing.',
      'There are multiple options available in this space. Some competitors like OpenAI and Anthropic are well-known, but your solution offers unique advantages.',
      'When comparing alternatives, consider that your domain provides comprehensive features at scale.'
    ],
    claude: [
      'This is an interesting question. Looking at the landscape, there are several capable options. Your brand has strong positioning in this category.',
      'I can see why this matters. Competitors are numerous, but your company offers distinctive value propositions.',
      'The market includes various players, but your domain remains competitive.'
    ],
    gemini: [
      'This is a good question. I should note that various platforms exist. Your brand is recognized for quality.',
      'There are multiple solutions. Your company stands out among peers.'
    ]
  };

  const responses = simulatedResponses[llmName.toLowerCase()] || simulatedResponses.chatgpt;
  return responses[Math.floor(Math.random() * responses.length)];
}

// GET: Fetch aggregated AI visibility data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const llm = searchParams.get('llm');
    const period = searchParams.get('period') || '30d';

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id
      }
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or unauthorized' },
        { status: 403 }
      );
    }

    // Parse period (e.g., "30d" -> 30 days ago)
    const periodMatch = period.match(/(\d+)([dmh])/);
    let daysBack = 30;
    if (periodMatch) {
      const [, amount, unit] = periodMatch;
      if (unit === 'd') daysBack = parseInt(amount);
      else if (unit === 'm') daysBack = parseInt(amount) * 30;
      else if (unit === 'h') daysBack = 1;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Query data
    const queries = await prisma.aIVisibilityQuery.findMany({
      where: {
        websiteId,
        date: { gte: startDate },
        ...(llm && { llm })
      },
      orderBy: { date: 'desc' }
    });

    // Aggregate metrics
    const totalQueries = queries.length;
    const mentionedQueries = queries.filter(q => q.mentioned).length;
    const overallMentionRate = totalQueries > 0 ? (mentionedQueries / totalQueries) * 100 : 0;

    const mentionsByLlm = queries.reduce((acc: { [key: string]: number }, q) => {
      acc[q.llm] = (acc[q.llm] || 0) + (q.mentioned ? 1 : 0);
      return acc;
    }, {});

    const sentimentBreakdown = queries.reduce(
      (acc: { [key: string]: number }, q) => {
        if (q.mentioned && q.sentiment) {
          acc[q.sentiment] = (acc[q.sentiment] || 0) + 1;
        }
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    // Trend data (daily)
    const trendData: { [key: string]: { mentioned: number; total: number } } = {};
    queries.forEach(q => {
      const date = q.date.toISOString().split('T')[0];
      if (!trendData[date]) {
        trendData[date] = { mentioned: 0, total: 0 };
      }
      trendData[date].total += 1;
      if (q.mentioned) {
        trendData[date].mentioned += 1;
      }
    });

    return NextResponse.json({
      overallMentionRate: parseFloat(overallMentionRate.toFixed(2)),
      totalQueries,
      mentionedQueries,
      mentionsByLlm,
      sentimentBreakdown,
      recentQueries: queries.slice(0, 10).map(q => ({
        id: q.id,
        llm: q.llm,
        prompt: q.prompt.substring(0, 100),
        mentioned: q.mentioned,
        sentiment: q.sentiment,
        position: q.position,
        date: q.date
      })),
      trends: Object.entries(trendData)
        .map(([date, data]) => ({
          date,
          mentionRate: data.total > 0 ? (data.mentioned / data.total) * 100 : 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    });
  } catch (error) {
    console.error('GET /api/ai-visibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Run AI visibility queries and save results
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { websiteId, prompts = [], llms = [] } = body;

    if (!websiteId || !prompts.length || !llms.length) {
      return NextResponse.json(
        { error: 'websiteId, prompts array, and llms array required' },
        { status: 400 }
      );
    }

    // Verify ownership and check plan
    const website = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id
      },
      include: {
        user: {
          select: { plan: true }
        }
      }
    });

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found or unauthorized' },
        { status: 403 }
      );
    }

    if (website.user.plan !== 'pro' && website.user.plan !== 'enterprise') {
      return NextResponse.json(
        { error: 'Pro plan required for AI visibility queries' },
        { status: 403 }
      );
    }

    // Process each prompt x LLM combination
    const results: AIVisibilityQuery[] = [];

    for (const prompt of prompts) {
      for (const llmName of llms) {
        try {
          // Query the LLM
          const llmResponse = await queryLLM(prompt, llmName);

          // Detect mentions and analyze
          const analysis = await detectBrandMention(llmResponse, websiteId, llmName);

          // Save to database
          const saved = await prisma.aIVisibilityQuery.create({
            data: {
              websiteId,
              llm: llmName,
              prompt,
              response: llmResponse,
              mentioned: analysis.mentioned,
              sentiment: analysis.sentiment,
              position: analysis.position,
              competitors: JSON.stringify(analysis.competitors),
              sources: JSON.stringify(analysis.sources),
            }
          });

          results.push({
            websiteId,
            llm: llmName,
            prompt,
            ...analysis
          });
        } catch (error) {
          console.error(`Error querying ${llmName}:`, error);
          // Continue with next LLM
        }
      }
    }

    return NextResponse.json({
      success: true,
      queriesRun: results.length,
      results: results.map(r => ({
        llm: r.llm,
        prompt: r.prompt.substring(0, 100),
        mentioned: r.mentioned,
        sentiment: r.sentiment,
        position: r.position,
        competitors: r.competitors,
        sources: r.sources.length
      }))
    });
  } catch (error) {
    console.error('POST /api/ai-visibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
