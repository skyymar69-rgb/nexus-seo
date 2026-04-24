/**
 * Blog System — Markdown-based content
 * Lit les fichiers .md depuis content/blog/ et les sert comme articles
 *
 * Pour publier un article:
 * 1. Creer un fichier .md dans content/blog/
 * 2. Ajouter le frontmatter (title, slug, date, author, etc.)
 * 3. Ecrire le contenu en Markdown
 * 4. Le deployer — l'article apparait automatiquement
 */

import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  date: string
  author: string
  category: string
  excerpt: string
  tags: string[]
  readingTime: number
  content: string
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Get all blog posts from the content directory
 */
export function getAllPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(BLOG_DIR)) return []

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
    const posts: BlogPost[] = []

    for (const file of files) {
      const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
      const post = parseMarkdown(content)
      if (post) posts.push(post)
    }

    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts()
  return posts.find(p => p.slug === slug) || null
}

/**
 * Parse markdown file with frontmatter
 */
function parseMarkdown(raw: string): BlogPost | null {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = raw.match(frontmatterRegex)
  if (!match) return null

  const frontmatter = match[1]
  const content = match[2].trim()

  const meta: Record<string, any> = {}
  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        meta[key] = JSON.parse(value)
      } catch {
        meta[key] = value
      }
    } else {
      meta[key] = value
    }
  }

  if (!meta.title || !meta.slug) return null

  return {
    slug: meta.slug,
    title: meta.title,
    date: meta.date || new Date().toISOString().split('T')[0],
    author: meta.author || 'Nexus SEO',
    category: meta.category || 'SEO',
    excerpt: meta.excerpt || content.slice(0, 150) + '...',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    readingTime: parseInt(meta.readingTime) || Math.ceil(content.split(/\s+/).length / 200),
    content,
  }
}
