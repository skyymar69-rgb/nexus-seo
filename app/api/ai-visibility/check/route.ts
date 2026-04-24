import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// Sentiment analysis helper (reused from main route)
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
  websiteId: string
): Promise<{
  mentioned: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  position?: number;
  competitors: string[];
  sources: string[];
}> {
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
    sources
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

// POST: Quick check for a single prompt against one LLM
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { websiteId, prompt, llm } = body;

    if (!websiteId || !prompt || !llm) {
      return NextResponse.json(
        { error: 'websiteId, prompt, and llm required' },
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

    // Query the LLM
    const llmResponse = await queryLLM(prompt, llm);

    // Detect mentions and analyze
    const analysis = await detectBrandMention(llmResponse, websiteId);

    // Save to database
    const saved = await prisma.aIVisibilityQuery.create({
      data: {
        websiteId,
        llm,
        prompt,
        response: llmResponse,
        mentioned: analysis.mentioned,
        sentiment: analysis.sentiment,
        position: analysis.position,
        competitors: JSON.stringify(analysis.competitors),
        sources: JSON.stringify(analysis.sources),
      }
    });

    // Return immediate result with full response
    return NextResponse.json({
      success: true,
      query: {
        id: saved.id,
        llm,
        prompt,
        response: llmResponse,
        mentioned: analysis.mentioned,
        sentiment: analysis.sentiment,
        position: analysis.position,
        competitors: analysis.competitors,
        sources: analysis.sources,
        savedAt: saved.date
      }
    });
  } catch (error) {
    console.error('POST /api/ai-visibility/check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
