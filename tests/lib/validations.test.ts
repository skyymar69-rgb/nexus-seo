import { describe, it, expect } from 'vitest'
import {
  urlSchema,
  domainSchema,
  keywordSchema,
  websiteSchema,
  auditRequestSchema,
  aiContentSchema,
  registerSchema,
  paginationSchema,
} from '@/lib/validations'

describe('urlSchema', () => {
  it('accepts valid https URL', () => {
    expect(urlSchema.parse('https://example.com')).toBe('https://example.com')
  })

  it('accepts valid http URL', () => {
    expect(urlSchema.parse('http://example.com')).toBe('http://example.com')
  })

  it('auto-prepends https:// to bare domains', () => {
    expect(urlSchema.parse('example.com')).toBe('https://example.com')
  })

  it('rejects empty string', () => {
    expect(() => urlSchema.parse('')).toThrow()
  })

  it('rejects invalid URLs', () => {
    expect(() => urlSchema.parse('not a url at all')).toThrow()
  })
})

describe('domainSchema', () => {
  it('accepts valid domain', () => {
    expect(domainSchema.parse('example.com')).toBe('example.com')
  })

  it('accepts subdomain', () => {
    expect(domainSchema.parse('sub.example.com')).toBe('sub.example.com')
  })

  it('rejects domain with protocol', () => {
    expect(() => domainSchema.parse('https://example.com')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => domainSchema.parse('')).toThrow()
  })
})

describe('keywordSchema', () => {
  it('accepts valid keyword', () => {
    const result = keywordSchema.parse({ term: 'seo tools' })
    expect(result.term).toBe('seo tools')
    expect(result.language).toBe('fr')
  })

  it('accepts keyword with all fields', () => {
    const result = keywordSchema.parse({
      term: 'seo tools',
      volume: 1000,
      difficulty: 45,
      cpc: 2.5,
      intent: 'transactional',
      language: 'en',
    })
    expect(result.volume).toBe(1000)
    expect(result.intent).toBe('transactional')
  })

  it('rejects empty term', () => {
    expect(() => keywordSchema.parse({ term: '' })).toThrow()
  })

  it('rejects difficulty > 100', () => {
    expect(() => keywordSchema.parse({ term: 'test', difficulty: 150 })).toThrow()
  })

  it('rejects invalid intent', () => {
    expect(() => keywordSchema.parse({ term: 'test', intent: 'invalid' })).toThrow()
  })
})

describe('websiteSchema', () => {
  it('accepts valid website', () => {
    const result = websiteSchema.parse({ domain: 'example.com' })
    expect(result.domain).toBe('example.com')
  })

  it('accepts website with name', () => {
    const result = websiteSchema.parse({ domain: 'example.com', name: 'My Site' })
    expect(result.name).toBe('My Site')
  })

  it('rejects invalid domain', () => {
    expect(() => websiteSchema.parse({ domain: 'not valid' })).toThrow()
  })
})

describe('aiContentSchema', () => {
  it('accepts valid content request', () => {
    const result = aiContentSchema.parse({
      type: 'article',
      keyword: 'seo optimization',
    })
    expect(result.type).toBe('article')
    expect(result.tone).toBe('professional')
    expect(result.language).toBe('fr')
    expect(result.wordCount).toBe(800)
  })

  it('rejects invalid type', () => {
    expect(() => aiContentSchema.parse({ type: 'poem', keyword: 'test' })).toThrow()
  })

  it('rejects wordCount > 5000', () => {
    expect(() => aiContentSchema.parse({ type: 'article', keyword: 'test', wordCount: 10000 })).toThrow()
  })
})

describe('registerSchema', () => {
  it('accepts valid registration', () => {
    const result = registerSchema.parse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password1',
    })
    expect(result.email).toBe('john@example.com')
  })

  it('rejects short password', () => {
    expect(() => registerSchema.parse({ name: 'John', email: 'j@e.com', password: 'short' })).toThrow()
  })

  it('rejects password without uppercase', () => {
    expect(() => registerSchema.parse({ name: 'John', email: 'j@e.com', password: 'password1' })).toThrow()
  })

  it('rejects password without number', () => {
    expect(() => registerSchema.parse({ name: 'John', email: 'j@e.com', password: 'Password' })).toThrow()
  })

  it('rejects invalid email', () => {
    expect(() => registerSchema.parse({ name: 'John', email: 'not-email', password: 'Password1' })).toThrow()
  })
})

describe('paginationSchema', () => {
  it('uses defaults', () => {
    const result = paginationSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  it('coerces strings to numbers', () => {
    const result = paginationSchema.parse({ page: '3', limit: '50' })
    expect(result.page).toBe(3)
    expect(result.limit).toBe(50)
  })

  it('rejects limit > 100', () => {
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow()
  })
})
