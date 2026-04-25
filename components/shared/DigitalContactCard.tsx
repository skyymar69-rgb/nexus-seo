'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import {
  QrCode, X, Download, Phone, Mail, MapPin, Star, Globe, Share2,
  Check, Copy, Camera, ExternalLink, Sparkles, MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type QRTab = 'site' | 'maps' | 'reviews' | 'vcard'

const TABS: Array<{
  id: QRTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  src: string
  deepLink: string
  caption: string
  accent: string
  accentFrom: string
  accentTo: string
}> = [
  {
    id: 'site',
    label: 'Site',
    icon: Globe,
    src: '/qr/site.svg',
    deepLink: 'https://nexus.kayzen-lyon.fr',
    caption: 'Ouvrir Nexus — By Kayzen',
    accent: 'from-brand-500 to-cyan-500',
    accentFrom: '#3b82f6',
    accentTo: '#06b6d4',
  },
  {
    id: 'maps',
    label: 'Maps',
    icon: MapPin,
    src: '/qr/maps.svg',
    deepLink: 'https://maps.google.com/?q=6+rue+Pierre+Termier+69009+Lyon',
    caption: 'Itinéraire vers nos bureaux',
    accent: 'from-emerald-500 to-teal-500',
    accentFrom: '#10b981',
    accentTo: '#14b8a6',
  },
  {
    id: 'reviews',
    label: 'Avis',
    icon: Star,
    src: '/qr/reviews.svg',
    deepLink: 'https://www.google.com/search?q=Kayzen+Lyon+6+rue+Pierre+Termier+avis&hl=fr',
    caption: 'Consulter ou laisser un avis Google',
    accent: 'from-amber-500 to-orange-500',
    accentFrom: '#f59e0b',
    accentTo: '#f97316',
  },
  {
    id: 'vcard',
    label: 'Contact',
    icon: Download,
    src: '/qr/vcard.svg',
    deepLink: '/kayzen-lyon.vcf',
    caption: 'Ajouter à vos contacts (vCard)',
    accent: 'from-violet-500 to-fuchsia-500',
    accentFrom: '#7c3aed',
    accentTo: '#d946ef',
  },
]

const SERVICES = ['GEO', 'AEO', 'LLMO', 'SEO Tech']

/* ── Bouton déclencheur ───────────────────────────────────────────── */
export default function DigitalContactCard() {
  const [open, setOpen]           = useState(false)
  const [tab, setTab]             = useState<QRTab>('site')
  const [copied, setCopied]       = useState<string | null>(null)
  const [confetti, setConfetti]   = useState(false)
  const [mounted, setMounted]     = useState(false)
  const dialogRef  = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const closeModal = useCallback(() => setOpen(false), [])

  /* Clavier */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, closeModal])

  /* Focus trap */
  useEffect(() => {
    if (!open) { triggerRef.current?.focus(); return }
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) { if (document.activeElement === first || document.activeElement === el) { e.preventDefault(); last.focus() } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus() } }
    }
    el.addEventListener('keydown', trap)
    return () => el.removeEventListener('keydown', trap)
  }, [open])

  const active = TABS.find((t) => t.id === tab)!

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(active.deepLink)
      setCopied(active.id)
      setTimeout(() => setCopied(null), 1800)
    } catch { /* noop */ }
  }

  async function handleShare() {
    const data = { title: 'Nexus — By Kayzen', text: 'La plateforme SEO de l\'ère IA · GEO · AEO · LLMO', url: 'https://nexus.kayzen-lyon.fr' }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try { await navigator.share(data); return } catch { /* cancelled */ }
    }
    copyLink()
  }

  function handleVcardClick() {
    setConfetti(true)
    setTimeout(() => setConfetti(false), 900)
  }

  /* ── Modal via React Portal (hors DOM du header) ─────────────── */
  const modal = !mounted ? null : (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dcc-title"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-4',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      style={{ display: open ? 'flex' : 'none' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Carte */}
      <div className="relative w-full max-w-md animate-spring-in">

        {/* Gradient border animé */}
        <div
          aria-hidden="true"
          className="absolute -inset-[1.5px] rounded-[25px] opacity-80 blur-[1px]"
          style={{
            background: `conic-gradient(from var(--gradient-angle, 0deg), ${active.accentFrom}, #7c3aed, #ec4899, ${active.accentTo}, ${active.accentFrom})`,
            animation: 'rotate-gradient 4s linear infinite',
          }}
        />

        <div
          ref={dialogRef}
          className="relative bg-white dark:bg-surface-900 rounded-3xl shadow-2xl ring-1 ring-surface-200/60 dark:ring-surface-800 overflow-hidden"
        >
          {/* ── Header gradient ────────────────────────────────── */}
          <div
            className={cn('relative h-28 bg-gradient-to-br overflow-hidden', active.accent)}
            style={{ background: `linear-gradient(135deg, ${active.accentFrom} 0%, ${active.accentTo} 100%)` }}
          >
            {/* Radial shine */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 15% 120%, rgba(255,255,255,0.55) 0%, transparent 50%), radial-gradient(circle at 85% -20%, rgba(255,255,255,0.4) 0%, transparent 45%)',
              }}
            />
            {/* Noise texture */}
            <div aria-hidden="true" className="absolute inset-0 noise-overlay opacity-30" />

            <div className="relative flex items-start justify-between p-5 h-full">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <p className="text-white/80 text-[9px] font-bold tracking-[0.28em] uppercase">
                    Carte numérique
                  </p>
                  <h2 id="dcc-title" className="text-white font-heading font-black text-2xl leading-tight mt-0.5">
                    Kayzen Lyon
                  </h2>
                  <p className="text-white/75 text-[11px] mt-0.5">
                    Agence SEO · GEO · AEO · LLMO
                  </p>
                </div>
                {/* Services tags */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {SERVICES.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white/95 rounded text-[9px] font-bold tracking-wider uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between h-full">
                {/* Close */}
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Fermer"
                  className="text-white/90 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full p-1.5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                {/* 5 étoiles */}
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-300 fill-amber-300 drop-shadow" />
                  ))}
                  <span className="text-white/80 text-[10px] ml-1 font-semibold">5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ───────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Choix du QR code"
            className="flex border-b border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-950/60"
          >
            {TABS.map((t, i) => {
              const Icon = t.icon
              const isActive = t.id === tab
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`qr-panel-${t.id}`}
                  id={`qr-tab-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-all relative',
                    `stagger-${i + 1}`,
                    isActive
                      ? 'text-surface-900 dark:text-white'
                      : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 inset-x-2 h-[2px] rounded-full"
                      style={{ background: `linear-gradient(90deg, ${t.accentFrom}, ${t.accentTo})` }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* ── QR panel ───────────────────────────────────────── */}
          <div
            role="tabpanel"
            id={`qr-panel-${active.id}`}
            aria-labelledby={`qr-tab-${active.id}`}
            className="p-6"
          >
            {/* Frame QR avec coins décoratifs + scan line */}
            <div className="qr-crisp relative mx-auto mb-3 w-52 h-52">
              {/* Pulse ring */}
              <div
                aria-hidden="true"
                className="absolute -inset-2 rounded-2xl border border-brand-400/30 pulse-ring"
              />
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-3xl border border-brand-400/15 pulse-ring pulse-ring-outer-delay"
              />

              {/* Glow */}
              <div
                aria-hidden="true"
                className="absolute -inset-2 rounded-2xl opacity-40 blur-xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${active.accentFrom}66, transparent 70%)` }}
              />

              {/* QR card */}
              <div className="relative w-full h-full flex items-center justify-center rounded-2xl bg-white ring-1 ring-surface-200 shadow-lg p-3 overflow-hidden">
                {/* Corner brackets */}
                <div aria-hidden="true" className="absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 border-brand-500 rounded-tl z-10" />
                <div aria-hidden="true" className="absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 border-violet-500 rounded-tr z-10" />
                <div aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 border-violet-500 rounded-bl z-10" />
                <div aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 border-brand-500 rounded-br z-10" />

                {/* Scan line */}
                <div aria-hidden="true" className="qr-scan-line" />

                <Image
                  key={active.id}
                  src={active.src}
                  alt={`QR code — ${active.caption}`}
                  width={208}
                  height={208}
                  priority
                  className="relative w-full h-full animate-fade-in"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>

            {/* Instruction scan */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Camera className="w-3.5 h-3.5 text-surface-400" />
              <p className="text-[11px] text-surface-400 dark:text-surface-500 font-medium">
                Pointez votre appareil photo vers le code
              </p>
            </div>

            <p className="text-center text-sm font-semibold text-surface-700 dark:text-surface-200 mb-0.5">
              {active.caption}
            </p>
            <p className="text-center text-[11px] text-surface-400 dark:text-surface-500 mb-4 truncate px-4">
              {active.deepLink.replace(/^https?:\/\//, '')}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              {active.id === 'vcard' ? (
                <a
                  href={active.deepLink}
                  download="kayzen-lyon.vcf"
                  onClick={handleVcardClick}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]',
                    confetti ? 'confetti-burst active' : 'confetti-burst',
                    'bg-gradient-to-br',
                    active.accent
                  )}
                >
                  <Download className="w-4 h-4" />
                  Télécharger vCard
                  {confetti && <Sparkles className="w-3.5 h-3.5 animate-ping" />}
                </a>
              ) : (
                <a
                  href={active.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-gradient-to-br',
                    active.accent
                  )}
                >
                  Ouvrir <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={copyLink}
                aria-label="Copier le lien"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
              >
                {copied === active.id
                  ? <Check className="w-4 h-4 text-emerald-500" />
                  : <Copy className="w-4 h-4" />
                }
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Partager"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-700 dark:text-surface-200 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Quick contacts (4 boutons) ─────────────────────── */}
          <div className="border-t border-surface-200 dark:border-surface-800 bg-surface-50/70 dark:bg-surface-950/50 px-5 py-3 grid grid-cols-4 gap-1.5">
            {[
              {
                href: 'tel:+33487776861',
                label: 'Appeler',
                icon: Phone,
                gradient: 'from-brand-500 to-cyan-500',
              },
              {
                href: 'mailto:contact@kayzen-lyon.fr',
                label: 'Écrire',
                icon: Mail,
                gradient: 'from-violet-500 to-fuchsia-500',
              },
              {
                href: 'https://maps.google.com/?q=6+rue+Pierre+Termier+69009+Lyon',
                label: 'Itinéraire',
                icon: MapPin,
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                href: 'https://wa.me/33487776861?text=Bonjour%20Kayzen%20Lyon%2C%20je%20vous%20contacte%20depuis%20votre%20carte%20num%C3%A9rique.',
                label: 'WhatsApp',
                icon: MessageCircle,
                gradient: 'from-green-500 to-emerald-600',
              },
            ].map(({ href, label, icon: Icon, gradient }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className="group flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white dark:hover:bg-surface-900 transition-all"
              >
                <span
                  className={cn(
                    'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform',
                    gradient
                  )}
                >
                  <Icon className="w-4 h-4 text-white" />
                </span>
                <span className="text-[9px] font-bold text-surface-500 dark:text-surface-400 leading-tight text-center">
                  {label}
                </span>
              </a>
            ))}
          </div>

          {/* ── Social footer ──────────────────────────────────── */}
          <div className="border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/40 px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a
                href="https://linkedin.com/company/kayzen-lyon"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Kayzen Lyon"
                className="social-badge social-badge-linkedin text-[10px] px-2.5 py-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
            <a
              href="https://nexus-seo.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-surface-400 dark:text-surface-500 hover:text-brand-500 transition-colors font-medium"
            >
              nexus-seo.app
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir la carte de contact numérique"
        aria-expanded={open}
        className="relative p-2 rounded-xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group"
      >
        <QrCode
          className="w-[18px] h-[18px] transition-transform group-hover:rotate-6"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
        />
        {/* Ping badge */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-brand-500 to-violet-500" />
        </span>
      </button>

      {/* Portal — rendu à la racine du document, hors du header */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(modal, document.body)
        : null}
    </>
  )
}
