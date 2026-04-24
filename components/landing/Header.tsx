'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Zap, ChevronDown } from 'lucide-react'
import dynamicImport from 'next/dynamic'
import { cn } from '@/lib/utils'
import { AnimatedLogo } from '@/components/shared/AnimatedLogo'

const DigitalContactCard = dynamicImport(
  () => import('@/components/shared/DigitalContactCard'),
  { ssr: false }
)

const navItems = [
  { label: 'Produit', href: '#', children: [
    { label: 'GEO — Generative Engine', href: '/services#geo' },
    { label: 'AEO — Answer Engine',      href: '/services#aeo' },
    { label: 'LLMO — LLM Optimization',  href: '/services#llmo' },
    { label: 'SEO Technique',            href: '/services#technical' },
    { label: 'Analytics & Rapports',     href: '/services#analytics' },
  ]},
  { label: 'Outils gratuits', href: '#outils' },
  { label: 'Cas clients', href: '/cases' },
  { label: 'Tarifs',      href: '/pricing' },
  { label: 'Blog',        href: '/blog' },
  { label: 'Contact',     href: '/contact' },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '#' || href === '/') return false
  const basePath = href.split('#')[0]
  return pathname === basePath || pathname.startsWith(basePath + '/')
}

export function Header() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const [dropdown, setDropdown]   = useState<string | null>(null)
  const [mounted, setMounted]     = useState(false)
  const { theme, setTheme }       = useTheme()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Only use transparent header on homepage hero
  const isHomepage = pathname === '/'
  const solid = scrolled || !isHomepage

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

  // Escape key closes dropdown and mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeAll])

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileOpen || !mobileMenuRef.current) return
    const menu = mobileMenuRef.current
    menu.setAttribute('tabIndex', '-1')
    menu.focus()

    const handleTrapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === menu) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    menu.addEventListener('keydown', handleTrapFocus)
    return () => menu.removeEventListener('keydown', handleTrapFocus)
  }, [mobileOpen])

  // Click outside closes dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(null)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        solid
          ? 'bg-white dark:bg-surface-950 border-b border-surface-200 dark:border-surface-800 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <AnimatedLogo size={36} lightText={!solid} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative" ref={item.children ? dropdownRef : undefined}>
                {item.children ? (
                  <button
                    onMouseEnter={() => setDropdown(item.label)}
                    onMouseLeave={() => setDropdown(null)}
                    onClick={() => setDropdown(dropdown === item.label ? null : item.label)}
                    aria-expanded={dropdown === item.label}
                    aria-haspopup="true"
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      solid
                        ? 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn('w-4 h-4 transition-transform', dropdown === item.label && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all block',
                      isActive(pathname, item.href)
                        ? solid
                          ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30'
                          : 'text-white bg-white/15 underline underline-offset-4 decoration-2'
                        : solid
                          ? 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                    aria-current={isActive(pathname, item.href) ? 'page' : undefined}
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
                    className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 p-2 animate-slide-down"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-50 dark:hover:bg-surface-800 rounded-xl transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Digital contact card — QR codes + vCard */}
            {mounted && <DigitalContactCard />}

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Changer de thème"
              >
                {theme === 'dark'
                  ? <Sun className="w-4.5 h-4.5" />
                  : <Moon className="w-4.5 h-4.5" />
                }
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-xl transition-all',
                  solid
                    ? 'text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                    : 'text-white hover:text-white hover:bg-white/10'
                )}
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

            {/* Mobile toggle */}
            <button
              onClick={() => setMobile(!mobileOpen)}
              aria-label="Menu de navigation"
              aria-expanded={mobileOpen}
              className="lg:hidden p-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div ref={mobileMenuRef} role="menu" aria-label="Navigation mobile" className="lg:hidden border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 px-4 py-4 space-y-1 animate-slide-down">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobile(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className={cn(
                  'block px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                  isActive(pathname, item.href)
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
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
                      className="block px-4 py-2 text-xs text-surface-500 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg transition-all"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
            <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all">
              Connexion
            </Link>
            <Link href="/signup" className="flex-1 text-center py-2.5 text-sm font-semibold text-white rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors">
              Démarrer
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
