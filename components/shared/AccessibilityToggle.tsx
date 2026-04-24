'use client'

import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'nexus-a11y-prefs'

interface A11yPrefs {
  fontSize: 'normal' | 'large' | 'xl'
  contrast: 'normal' | 'high'
  dyslexia: boolean
  animations: boolean
}

const DEFAULT_PREFS: A11yPrefs = {
  fontSize: 'normal',
  contrast: 'normal',
  dyslexia: false,
  animations: true,
}

const FONT_SIZES: Record<A11yPrefs['fontSize'], string> = {
  normal: '16px',
  large: '18px',
  xl: '22px',
}

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load prefs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as A11yPrefs
        setPrefs(parsed)
        applyPrefs(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function applyPrefs(p: A11yPrefs) {
    document.documentElement.style.fontSize = FONT_SIZES[p.fontSize]

    if (p.contrast === 'high') {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }

    if (p.dyslexia) {
      document.body.classList.add('dyslexia-font')
    } else {
      document.body.classList.remove('dyslexia-font')
    }

    if (!p.animations) {
      document.body.classList.add('reduce-motion')
    } else {
      document.body.classList.remove('reduce-motion')
    }
  }

  function update(partial: Partial<A11yPrefs>) {
    const next = { ...prefs, ...partial }
    setPrefs(next)
    applyPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-[9998]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Options d'accessibilité"
        aria-expanded={open}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all hover:scale-105"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 8v4" />
          <path d="M8 10h8" />
          <path d="M10 16l-2 4" />
          <path d="M14 16l2 4" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute bottom-16 left-0 w-72 rounded-xl border border-purple-500/20 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-white mb-4">
            Accessibilit&eacute;
          </h3>

          {/* Font size */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-2">Taille du texte</label>
            <div className="flex gap-1">
              {([
                ['normal', 'Normal'],
                ['large', 'Grand'],
                ['xl', 'Tr\u00e8s grand'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => update({ fontSize: value })}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    prefs.fontSize === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-400 mb-2">Contraste</label>
            <div className="flex gap-1">
              {([
                ['normal', 'Normal'],
                ['high', '\u00c9lev\u00e9'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => update({ contrast: value })}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    prefs.contrast === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Dyslexia */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Mode dyslexie</span>
            <button
              onClick={() => update({ dyslexia: !prefs.dyslexia })}
              role="switch"
              aria-checked={prefs.dyslexia}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                prefs.dyslexia ? 'bg-purple-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.dyslexia ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Animations</span>
            <button
              onClick={() => update({ animations: !prefs.animations })}
              role="switch"
              aria-checked={prefs.animations}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                prefs.animations ? 'bg-purple-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  prefs.animations ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
