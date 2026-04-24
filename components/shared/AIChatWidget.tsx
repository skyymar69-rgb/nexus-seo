'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Comment am\u00e9liorer mon SEO ?',
  "Qu'est-ce que le GEO ?",
  'Comment optimiser ma balise title ?',
]

const AGENCY_CTA =
  '\n\n---\nBesoin d\u2019aide professionnelle ? \u2192 [Agence Kayzen](https://internet.kayzen-lyon.fr)'

function getLocalResponse(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('title') || lower.includes('titre')) {
    return (
      'Pour optimiser votre balise title :\n' +
      '- Placez votre mot-cl\u00e9 principal au d\u00e9but\n' +
      '- Limitez-la \u00e0 55-60 caract\u00e8res\n' +
      '- Rendez-la unique et descriptive\n' +
      '- Int\u00e9grez votre marque \u00e0 la fin' +
      AGENCY_CTA
    )
  }

  if (lower.includes('meta') || lower.includes('description')) {
    return (
      'Conseils pour la meta description :\n' +
      '- R\u00e9digez 150-160 caract\u00e8res maximum\n' +
      '- Incluez un appel \u00e0 l\u2019action clair\n' +
      '- Int\u00e9grez les mots-cl\u00e9s naturellement\n' +
      '- Chaque page doit avoir une description unique' +
      AGENCY_CTA
    )
  }

  if (lower.includes('geo')) {
    return (
      'Le GEO (Generative Engine Optimization) vise \u00e0 optimiser votre visibilit\u00e9 dans les r\u00e9ponses g\u00e9n\u00e9r\u00e9es par les IA comme ChatGPT, Perplexity ou Claude.\n\n' +
      'Principes cl\u00e9s :\n' +
      '- Structurez vos contenus avec des donn\u00e9es factuelles\n' +
      '- Utilisez le balisage schema.org\n' +
      '- Citez des sources fiables\n' +
      '- Cr\u00e9ez du contenu de r\u00e9f\u00e9rence sur votre domaine' +
      AGENCY_CTA
    )
  }

  if (lower.includes('aeo')) {
    return (
      'L\u2019AEO (Answer Engine Optimization) optimise votre contenu pour les moteurs de r\u00e9ponses :\n\n' +
      '- Ciblez les questions fr\u00e9quentes (People Also Ask)\n' +
      '- Structurez en FAQ avec schema.org\n' +
      '- R\u00e9pondez directement d\u00e8s le premier paragraphe\n' +
      '- Utilisez des listes et tableaux clairs' +
      AGENCY_CTA
    )
  }

  if (lower.includes('backlink') || lower.includes('lien')) {
    return (
      'Strat\u00e9gie backlinks :\n' +
      '- Privil\u00e9giez la qualit\u00e9 \u00e0 la quantit\u00e9\n' +
      '- Ciblez des sites de votre th\u00e9matique (DR > 30)\n' +
      '- Cr\u00e9ez du contenu linkable (guides, \u00e9tudes, outils)\n' +
      '- Surveillez et d\u00e9savouez les liens toxiques' +
      AGENCY_CTA
    )
  }

  if (lower.includes('seo') || lower.includes('r\u00e9f\u00e9rencement')) {
    return (
      'Pour am\u00e9liorer votre SEO global :\n' +
      '1. Audit technique : vitesse, Core Web Vitals, mobile-first\n' +
      '2. Contenu : mots-cl\u00e9s longue tra\u00eene, intention de recherche\n' +
      '3. Netlinking : backlinks de qualit\u00e9\n' +
      '4. GEO/AEO : optimisez pour les IA g\u00e9n\u00e9ratives\n\n' +
      'Lancez un audit gratuit sur Nexus pour un diagnostic complet !' +
      AGENCY_CTA
    )
  }

  return (
    'Pour une analyse approfondie, lancez un audit gratuit ou contactez l\u2019Agence Kayzen : [internet.kayzen-lyon.fr](https://internet.kayzen-lyon.fr)' +
    AGENCY_CTA
  )
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text: string) {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    // Try the API first, fall back to local
    let response: string
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      if (!res.ok) throw new Error('API unavailable')
      const data = await res.json()
      response = data.response || getLocalResponse(text)
    } catch {
      // Simulate a small delay for realism
      await new Promise((r) => setTimeout(r, 600))
      response = getLocalResponse(text)
    }

    setTyping(false)
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'assistant', content: response },
    ])
  }

  function renderContent(content: string) {
    // Very lightweight markdown: **bold**, [text](url), \n
    const parts = content.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|\n)/g)
    return parts.map((part, i) => {
      const link = part.match(/^\[(.*?)\]\((.*?)\)$/)
      if (link) {
        return (
          <a
            key={i}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            {link[1]}
          </a>
        )
      }
      const bold = part.match(/^\*\*(.*?)\*\*$/)
      if (bold) return <strong key={i}>{bold[1]}</strong>
      if (part === '\n') return <br key={i} />
      if (part === '---') return <hr key={i} className="border-zinc-700 my-2" />
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9998]">
      {/* Chat panel */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] flex flex-col rounded-2xl border border-amber-500/20 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-amber-900/10 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/80 border-b border-zinc-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                N
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Assistant SEO Nexus</h3>
                <p className="text-[10px] text-zinc-500">Propuls&eacute; par Nexus AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              className="w-7 h-7 rounded-lg hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              &#x2715;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-live="polite" aria-label="Messages du chat">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 mb-3">
                  Posez-moi vos questions SEO, GEO ou AEO :
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="block w-full text-left rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-400">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>&#8226;</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>&#8226;</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>&#8226;</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
            className="flex items-center gap-2 px-3 py-3 border-t border-zinc-700/50"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question SEO..."
              aria-label="Question pour l'assistant SEO"
              className="flex-1 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &#10148;
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir l'assistant SEO"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-900 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all"
      >
        {open ? (
          <span className="text-xl font-bold">&#x2715;</span>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
