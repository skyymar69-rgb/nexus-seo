'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react'
import dynamicImport from 'next/dynamic'
import { cn } from '@/lib/utils'
import { AnimatedLogo } from '@/components/shared/AnimatedLogo'

const DigitalContactCard = dynamicImport(
  () => import('@/components/shared/DigitalContactCard'),
  { ssr: false }
)

const navItems = [
  {
    label: 'Produit', href: '#', children: [
      { label: 'GEO — Generative Engine', href: '/services#geo' },
      { label: 'AEO — Answer Engine',     href: '/services#aeo' },
      { label: 'LLMO — LLM Optimization', href: '/services#llmo' },
      { label: 'SEO Technique',           href: '/services#technical' },
      { label: 'Analytics & Rapports',    href: '/services#analytics' },
    ],
  },
  { label: 'Outils gratuits', href: '#outils' },
  { label: 'Cas clients',     href: '/cases' },
  { label: 'Tarifs',          href: '/pricing' },
  { label: 'Blog',            href: '/blog' },
  { label: 'Contact',         href: '/contact' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '#' || href === '/') return false
  const basePath = href.split('#')[0]
  return pathname === basePath || pathname.startsWith(basePath + '/')
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobile] = useState(false)
  const [dropdown, setDropdown] = useState<string | null>(null)
  const [mounted, setMounted]   = useState(false)
  const { theme, setTheme }     = useTheme()
  const pathname                = usePathname()
  const dropdownRef             = useRef<HTMLDivElement>(null)
  const mobileMenuRef           = useRef<HTMLDivElement>(null)

  const isHomepage = pathname === '/'
  const solid      = scrolled || !isHomepage

  const closeAll = useCallback(() => {
    setDropdown(null)
    setMobile(false)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeAll])

  /* Focus trap mobile */
  useEffect(() => {
    if (!mobileOpen || !mobileMenuRef.current) return
    const menu = mobileMenuRef.current
    menu.setAttribute('tabIndex', '-1')
    menu.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === menu) {
          e.preventDefault(); last.focus()
        }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    menu.addEventListener('keydown', trap)
    return () => menu.removeEventListener('keydown', trap)
  }, [mobileOpen])

  /* Click outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdown(null)
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setMobile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        /* ── Toujours fond sombre, jamais blanc ── */
        solid
          ? 'bg-[#0b1220]/95 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — toujours texte blanc */}
          <Link href="/" className="shrink-0">
            <AnimatedLogo size={36} lightText={true} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navigation principale">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                ref={item.children ? dropdownRef : undefined}
              >
                {item.children ? (
                  <button
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                    onClick={() => setDropdown(dropdown === item.label ? null : item.label)}
                    aria-expanded={dropdown === item.label}
                    aria-haspopup="true"
                    /* ── Toujours blanc ── */
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all text-white/75 hover:text-white hover:bg-white/10"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform duration-200',
                        dropdown === item.label && 'rotate-180'
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    /* ── Toujours blanc, actif = souligné ── */
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all block',
                      isActive(pathname, item.href)
                        ? 'text-white bg-white/12 underline underline-offset-4 decoration-2 decoration-brand-400'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown — fond toujours sombre */}
                {item.children && dropdown === item.label && (
                  <div
                    role="menu"
                    aria-label={`Sous-menu ${item.label}`}
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                    className="absolute top-full left-0 mt-2 w-64 bg-[#0f1e35] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-2 animate-slide-down backdrop-blur-xl"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-white/65 hover:text-white hover:bg-white/8 rounded-xl transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-1.5">

            {/* Carte de contact numérique */}
            {mounted && <DigitalContactCard />}

            {/* Theme toggle — toujours blanc */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Changer de thème"
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                {theme === 'dark'
                  ? <Sun  className="w-4.5 h-4.5" />
                  : <Moon className="w-4.5 h-4.5" />
                }
              </button>
            )}

            {/* CTA connexion / inscription — toujours blanc */}
            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-xl transition-all text-white/75 hover:text-white hover:bg-white/10"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="btn-primary px-5 py-2 text-sm rounded-xl"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Hamburger mobile — toujours blanc */}
            <button
              onClick={() => setMobile(!mobileOpen)}
              aria-label="Menu de navigation"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="lg:hidden p-2.5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menu mobile — fond toujours sombre ── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="menu"
          aria-label="Navigation mobile"
          className="lg:hidden border-t border-white/8 bg-[#0b1220]/98 backdrop-blur-xl px-4 py-4 space-y-1 animate-slide-down"
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobile(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={cn(
                  'block px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                  isActive(pathname, item.href)
                    ? 'text-white bg-white/12 underline underline-offset-4 decoration-brand-400'
                    : 'text-white/75 hover:text-white hover:bg-white/8'
                )}
              >
                {item.label}
              </Link>

              {item.children && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      onClick={() => setMobile(false)}
                      className="block px-4 py-2 text-xs text-white/50 hover:text-white/90 rounded-lg transition-all"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-white/8">
            <Link
              href="/login"
              className="flex-1 text-center py-2.5 text-sm font-medium text-white/75 border border-white/15 rounded-xl hover:bg-white/8 transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-xl bg-brand-600 hover:bg-brand-500 transition-colors"
            >
              Démarrer
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
