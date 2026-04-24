import { z } from 'zod'

// URL validation with protocol normalization
export const urlSchema = z
  .string()
  .min(1, 'URL requise')
  .transform((url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`
    }
    return url
  })
  .pipe(z.string().url('URL invalide'))

// Domain validation
export const domainSchema = z
  .string()
  .min(1, 'Domaine requis')
  .regex(
    /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    'Domaine invalide (ex: example.com)'
  )

// Keyword creation
export const keywordSchema = z.object({
  term: z.string().min(1, 'Mot-clé requis').max(200, 'Mot-clé trop long'),
  volume: z.number().int().min(0).optional(),
  difficulty: z.number().int().min(0).max(100).optional(),
  cpc: z.number().min(0).optional(),
  intent: z.enum(['informational', 'navigational', 'transactional', 'commercial']).optional(),
  language: z.string().default('fr'),
})

// Website creation
export const websiteSchema = z.object({
  domain: domainSchema,
  name: z.string().max(100).optional(),
})

// Audit request
export const auditRequestSchema = z.object({
  url: urlSchema,
  websiteId: z.string().cuid().optional(),
})

// Crawl request
export const crawlRequestSchema = z.object({
  url: urlSchema,
  websiteId: z.string().cuid().optional(),
  maxPages: z.number().int().min(1).max(200).default(50),
})

// AI Visibility check
export const aiVisibilityCheckSchema = z.object({
  prompt: z.string().min(5, 'Prompt trop court').max(500, 'Prompt trop long'),
  brand: z.string().min(1, 'Marque requise').max(100),
  llm: z.enum(['chatgpt', 'claude', 'gemini', 'perplexity']).default('chatgpt'),
  websiteId: z.string().cuid(),
})

// AI Content generation
export const aiContentSchema = z.object({
  type: z.enum(['article', 'meta-description', 'title', 'faq', 'product-description', 'landing-page', 'category-description']),
  keyword: z.string().min(1).max(200),
  tone: z.enum(['professional', 'casual', 'academic', 'persuasive']).default('professional'),
  language: z.string().default('fr'),
  wordCount: z.number().int().min(50).max(5000).default(800),
  instructions: z.string().max(1000).optional(),
})

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Registration
export const registerSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
})
