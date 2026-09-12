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
  if (href === '/' || href.startsWith('#')) return false
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
    fn()
    window.addEventListener('scroll', fn, { passive: true })
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

  /* Header au modele Kayzen : la barre suit le theme (blanc en clair,
     marine profond en sombre) et porte une ombre une fois la page scrollee.
     Le hero n'etant plus sombre, un menu blanc permanent serait invisible. */
  const isDark = theme === 'dark'

  return (
    <header
      role="banner"
      className={cn(
        'fixed top-0 inset-x-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm transition-shadow duration-200',
        solid ? 'shadow-e2' : ''
      )}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:font-medium focus:ring-2 focus:ring-brand-400">
        Aller au contenu principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" aria-label="Nexus by Kayzen — Retour à l'accueil" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg">
            <AnimatedLogo size={36} />
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
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 min-h-[44px] text-sm font-heading font-semibold rounded-lg transition-colors',
                      'text-foreground hover:text-primary'
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', dropdown === item.label && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                    className={cn(
                      'px-3 py-2 min-h-[44px] flex items-center text-sm font-heading font-semibold border-b-2 transition-colors',
                      isActive(pathname, item.href)
                        ? 'text-primary border-primary'
                        : 'text-foreground border-transparent hover:text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && dropdown === item.label && (
                  <div
                    role="menu"
                    aria-label={`Sous-menu ${item.label}`}
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                    className={cn(
                      'absolute top-full left-0 mt-2 w-64 rounded-xl p-2 animate-slide-down border',
                      'bg-card border-border shadow-e3'
                    )}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className={cn(
                          'block px-4 py-2.5 min-h-[44px] flex items-center text-sm rounded-lg transition-colors',
                          'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
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
            {mounted && <DigitalContactCard />}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                  'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className={cn(
                  'px-4 min-h-[44px] flex items-center text-sm font-heading font-semibold rounded-full transition-colors',
                  'text-foreground hover:text-primary'
                )}
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-heading font-bold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMobile(!mobileOpen)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu de navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={cn(
                'lg:hidden flex h-11 w-11 items-center justify-center rounded-full transition-colors',
                'text-foreground hover:bg-muted'
              )}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="menu"
          aria-label="Navigation mobile"
          className={cn(
            'lg:hidden border-t px-4 py-4 space-y-1 animate-slide-down',
            'border-border bg-background shadow-e3'
          )}
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobile(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={cn(
                  'block px-4 py-3 min-h-[44px] flex items-center text-sm font-heading font-semibold rounded-lg transition-colors',
                  isActive(pathname, item.href)
                    ? 'text-primary bg-muted'
                    : 'text-foreground hover:bg-muted'
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
                      className={cn(
                        'block px-4 py-2 min-h-[44px] flex items-center text-xs rounded-lg transition-colors',
                        'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-border">
            <Link
              href="/login"
              className={cn(
                'flex-1 h-12 flex items-center justify-center text-sm font-heading font-semibold border border-border-strong rounded-full transition-colors',
                'text-foreground bg-card hover:bg-muted'
              )}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="flex-1 h-12 flex items-center justify-center text-sm font-heading font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Démarrer
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
