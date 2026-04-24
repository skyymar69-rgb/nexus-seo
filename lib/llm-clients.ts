/**
 * Multi-LLM abstraction layer for querying ChatGPT, Claude, Gemini, Perplexity.
 * Used by AI Visibility, LLMO scoring, and competitive analysis features.
 */

export type LLMProvider = 'chatgpt' | 'claude' | 'gemini' | 'perplexity'

export interface LLMResponse {
  text: string
  provider: LLMProvider
  model: string
  simulated: boolean
}

interface LLMClient {
  query(prompt: string): Promise<LLMResponse>
  isConfigured(): boolean
}

// ── OpenAI / ChatGPT ──────────────────────────────────────────────────

class ChatGPTClient implements LLMClient {
  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY
  }

  async query(prompt: string): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      return simulateResponse('chatgpt', prompt)
    }

    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    })

    return {
      text: response.choices[0]?.message?.content || '',
      provider: 'chatgpt',
      model: 'gpt-4o-mini',
      simulated: false,
    }
  }
}

// ── Anthropic / Claude ────────────────────────────────────────────────

class ClaudeClient implements LLMClient {
  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY
  }

  async query(prompt: string): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      return simulateResponse('claude', prompt)
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    return {
      text,
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      simulated: false,
    }
  }
}

// ── Google / Gemini ───────────────────────────────────────────────────

class GeminiClient implements LLMClient {
  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY
  }

  async query(prompt: string): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      return simulateResponse('gemini', prompt)
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
        }),
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return {
      text,
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      simulated: false,
    }
  }
}

// ── Perplexity ────────────────────────────────────────────────────────

class PerplexityClient implements LLMClient {
  isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY
  }

  async query(prompt: string): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      return simulateResponse('perplexity', prompt)
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return {
      text,
      provider: 'perplexity',
      model: 'sonar-small-online',
      simulated: false,
    }
  }
}

// ── Simulation fallback ───────────────────────────────────────────────

function simulateResponse(provider: LLMProvider, prompt: string): LLMResponse {
  const lowerPrompt = prompt.toLowerCase()

  // Generate contextual simulated responses
  const templates = [
    `Based on my analysis, there are several notable tools and platforms in this space. The market has evolved significantly with AI-powered solutions leading the way. Key players include established platforms and emerging innovators that combine traditional approaches with artificial intelligence capabilities.`,
    `When evaluating options in this category, I'd recommend considering factors like accuracy, coverage, pricing, and integration capabilities. Several platforms stand out for their comprehensive feature sets and innovative approaches to solving common challenges.`,
    `This is an excellent question. The landscape includes multiple well-regarded solutions. Some focus on traditional methods while others leverage AI and machine learning for more advanced analysis. The best choice depends on your specific needs, budget, and technical requirements.`,
  ]

  const idx = Math.abs(hashCode(prompt)) % templates.length

  return {
    text: templates[idx],
    provider,
    model: `${provider}-simulated`,
    simulated: true,
  }
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

// ── Public API ────────────────────────────────────────────────────────

const clients: Record<LLMProvider, LLMClient> = {
  chatgpt: new ChatGPTClient(),
  claude: new ClaudeClient(),
  gemini: new GeminiClient(),
  perplexity: new PerplexityClient(),
}

export async function queryLLM(provider: LLMProvider, prompt: string): Promise<LLMResponse> {
  const client = clients[provider]
  if (!client) {
    throw new Error(`Unknown LLM provider: ${provider}`)
  }

  try {
    return await client.query(prompt)
  } catch (error) {
    console.error(`LLM query failed for ${provider}:`, error)
    return simulateResponse(provider, prompt)
  }
}

export async function queryAllLLMs(prompt: string): Promise<LLMResponse[]> {
  const providers: LLMProvider[] = ['chatgpt', 'claude', 'gemini', 'perplexity']
  const results = await Promise.allSettled(
    providers.map((p) => queryLLM(p, prompt))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<LLMResponse> => r.status === 'fulfilled')
    .map((r) => r.value)
}

export function getConfiguredProviders(): LLMProvider[] {
  return (Object.entries(clients) as [LLMProvider, LLMClient][])
    .filter(([, client]) => client.isConfigured())
    .map(([provider]) => provider)
}
