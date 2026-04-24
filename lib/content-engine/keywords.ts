/**
 * Keyword processing utilities for the content engine.
 * Handles variations, hashing for pseudo-random selection, and density control.
 */

/** Simple string hash for deterministic pseudo-random selection */
export function hashKeyword(keyword: string): number {
  let hash = 0
  for (let i = 0; i < keyword.length; i++) {
    hash = ((hash << 5) - hash + keyword.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Seeded pseudo-random number generator */
export function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

/** Pick a random item from array using seed */
export function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

/** Pick N unique items from array */
export function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Generate keyword variations */
export function keywordVariations(keyword: string, lang: string): string[] {
  const kw = keyword.trim().toLowerCase()
  const variations = [kw, capitalize(kw)]

  if (lang === 'fr') {
    if (!kw.startsWith('le ') && !kw.startsWith('la ') && !kw.startsWith("l'") && !kw.startsWith('les ')) {
      variations.push(`le ${kw}`, `la ${kw}`, `les ${kw}`)
    }
    variations.push(`de ${kw}`, `du ${kw}`, `en ${kw}`)
  } else if (lang === 'en') {
    if (!kw.startsWith('the ')) {
      variations.push(`the ${kw}`)
    }
    variations.push(`${kw}s`)
  } else if (lang === 'es') {
    variations.push(`el ${kw}`, `la ${kw}`, `los ${kw}`, `de ${kw}`)
  } else if (lang === 'de') {
    variations.push(`der ${kw}`, `die ${kw}`, `das ${kw}`)
  }

  return Array.from(new Set(variations))
}

/**
 * Insert keyword naturally into text, replacing {keyword} placeholders.
 * Uses variations to avoid repetition.
 */
export function insertKeyword(
  text: string,
  keyword: string,
  lang: string,
  rand: () => number
): string {
  const vars = keywordVariations(keyword, lang)
  const kw = keyword.trim()

  return text
    .replace(/\{keyword\}/g, () => kw)
    .replace(/\{Keyword\}/g, () => capitalize(kw))
    .replace(/\{keyword_var\}/g, () => pick(vars, rand))
}

/** Count keyword occurrences in text */
export function keywordDensity(text: string, keyword: string): number {
  const words = text.split(/\s+/).length
  if (words === 0) return 0
  const kw = keyword.toLowerCase()
  const kwWords = kw.split(/\s+/).length
  const textLower = text.toLowerCase()
  let count = 0
  let pos = 0
  while ((pos = textLower.indexOf(kw, pos)) !== -1) {
    count++
    pos += kw.length
  }
  return (count * kwWords * 100) / words
}
