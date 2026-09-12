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

  /* Le header repose toujours sur une surface sombre (navy Kayzen) :
     transparent au-dessus du hero, navy translucide une fois scrollé.
     Le menu et le logo restent donc blancs en thème clair comme en thème sombre. */
  const isDark = theme === 'dark'

  return (
    <header
      role="banner"
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        solid
          ? 'bg-secondary-900/95 backdrop-blur-md border-b border-white/10 shadow-elev-md'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:font-medium focus:ring-2 focus:ring-brand-400">
        Aller au contenu principal
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" aria-label="Nexus by Kayzen — Retour à l'accueil" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-lg">
            <AnimatedLogo size={36} lightText />
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
                      'flex items-center gap-1 px-4 py-2 min-h-[44px] text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      'text-white/80 hover:text-white hover:bg-white/10'
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
                      'px-4 py-2 min-h-[44px] flex items-center text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                      isActive(pathname, item.href)
                        ? 'text-white bg-white/12 underline underline-offset-4 decoration-2 decoration-brand-400'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
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
                      'absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 animate-slide-down backdrop-blur-xl border',
                      'bg-secondary-900/98 border-white/10 shadow-elev-lg'
                    )}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className={cn(
                          'block px-4 py-2.5 min-h-[44px] flex items-center text-sm rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                          'text-white/75 hover:text-white hover:bg-white/10'
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
                  'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  'text-white/75 hover:text-white hover:bg-white/10'
                )}
              >
                {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className={cn(
                  'px-4 py-2 min-h-[44px] flex items-center text-sm font-medium rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                Connexion
              </Link>
              <Link href="/signup" className="btn-primary px-5 py-2 text-sm rounded-xl min-h-[44px] flex items-center">
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
                'lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                'text-white/80 hover:text-white hover:bg-white/10'
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
            'border-white/10 bg-secondary-900/98 backdrop-blur-xl shadow-elev-lg'
          )}
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobile(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={cn(
                  'block px-4 py-3 min-h-[44px] flex items-center text-sm font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                  isActive(pathname, item.href)
                    ? 'text-white bg-white/12 underline underline-offset-4 decoration-2 decoration-brand-400'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
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
                        'block px-4 py-2 min-h-[44px] flex items-center text-xs rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                        'text-white/65 hover:text-white'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Link
              href="/login"
              className={cn(
                'flex-1 text-center py-3 min-h-[44px] flex items-center justify-center text-sm font-medium border rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                'text-white/85 border-white/25 hover:bg-white/10'
              )}
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center py-3 min-h-[44px] flex items-center justify-center text-sm font-semibold text-white rounded-full bg-brand-600 hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Démarrer
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
