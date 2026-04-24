'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WebsiteProvider, useWebsite } from '@/contexts/WebsiteContext'
import { WebsiteSelector } from '@/components/shared/WebsiteSelector'
import dynamic from 'next/dynamic'

const CommandPalette = dynamic(
  () => import('@/components/shared/CommandPalette').then(m => ({ default: m.CommandPalette })),
  { ssr: false }
)
import {
  Search,
  Link as LinkIcon,
  TrendingUp,
  Sparkles,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Command,
  Gauge,
  Wand2,
  Lightbulb,
  FileText,
  LineChart,
  Zap,
  X,
  Menu,
  Home,
  Globe,
  FolderOpen,
  Users,
  Eye,
  FileSearch,
  BookOpen,
  LayoutTemplate,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Code2,
} from 'lucide-react'

interface CategoryItem {
  category: string
  label: string
  href: string
  icon: any
  badge?: 'PRO' | 'NEW'
}

// Define navigation categories with their tools
const navigationCategories = [
  {
    id: 'seo',
    label: 'SEO',
    icon: Gauge,
    isCategory: true,
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home, badge: undefined },
      { label: 'Audit de Site', href: '/dashboard/audit', icon: Search, badge: undefined },
      { label: 'Performance', href: '/dashboard/performance', icon: Zap, badge: undefined },
      { label: 'Domain Overview', href: '/dashboard/domain-overview', icon: Globe, badge: 'NEW' as const },
      { label: 'Top Pages', href: '/dashboard/top-pages', icon: FileSearch, badge: 'NEW' as const },
      { label: 'On-Page Checker', href: '/dashboard/on-page-checker', icon: FileText, badge: 'NEW' as const },
      { label: 'Schema Markup', href: '/dashboard/schema-markup', icon: Code2, badge: 'NEW' as const },
      { label: 'Comparaison', href: '/dashboard/compare', icon: Eye, badge: 'NEW' as const },
      { label: 'Benchmark', href: '/dashboard/competitor-compare', icon: Users, badge: 'NEW' as const },
    ],
  },
  {
    id: 'keywords',
    label: 'Mots-clés',
    icon: Search,
    isCategory: true,
    items: [
      { label: 'Suivi de Positions', href: '/dashboard/rank-tracker', icon: TrendingUp, badge: undefined },
      { label: 'Keyword Magic', href: '/dashboard/keyword-magic', icon: Wand2, badge: 'NEW' as const },
      { label: 'Keyword Gap', href: '/dashboard/keyword-gap', icon: Eye, badge: 'NEW' as const },
      { label: 'Recherche Sémantique', href: '/dashboard/semantic', icon: BookOpen, badge: undefined },
      { label: 'Mes Mots-clés', href: '/dashboard/keywords', icon: Tag, badge: undefined },
    ],
  },
  {
    id: 'backlinks',
    label: 'Backlinks',
    icon: LinkIcon,
    isCategory: true,
    items: [
      { label: 'Profil Backlinks', href: '/dashboard/backlinks', icon: LinkIcon, badge: undefined },
      { label: 'Backlink Audit', href: '/dashboard/backlink-audit', icon: ShieldCheck, badge: 'NEW' as const },
      { label: 'Concurrents', href: '/dashboard/competitors', icon: Users, badge: undefined },
      { label: 'Achat de Liens', href: '/dashboard/link-buying', icon: ShoppingCart, badge: 'NEW' as const },
    ],
  },
  {
    id: 'content',
    label: 'Contenu',
    icon: FileText,
    isCategory: true,
    items: [
      { label: 'Optimisation Contenu', href: '/dashboard/content-optimizer', icon: Wand2, badge: undefined },
      { label: 'Topic Research', href: '/dashboard/topic-research', icon: Lightbulb, badge: 'NEW' as const },
      { label: 'Content Template', href: '/dashboard/content-template', icon: LayoutTemplate, badge: 'NEW' as const },
      { label: 'Génération IA', href: '/dashboard/ai-content', icon: Sparkles, badge: undefined },
      { label: 'Crawleur Web', href: '/dashboard/crawl', icon: Globe, badge: undefined },
      { label: 'Content Analyzer', href: '/dashboard/content-analyzer', icon: Sparkles, badge: 'NEW' as const },
      { label: 'Suggestions', href: '/dashboard/content-suggestions', icon: Lightbulb, badge: 'NEW' as const },
    ],
  },
  {
    id: 'ai-geo',
    label: 'IA & GEO',
    icon: Sparkles,
    isCategory: true,
    badge: 'NEW' as const,
    items: [
      { label: 'Visibilité IA', href: '/dashboard/ai-visibility', icon: Sparkles, badge: undefined },
      { label: 'Audit GEO', href: '/dashboard/geo-audit', icon: Globe, badge: undefined },
      { label: 'Score AEO', href: '/dashboard/aeo-score', icon: Zap, badge: undefined },
      { label: 'Score LLMO', href: '/dashboard/llmo-score', icon: TrendingUp, badge: undefined },
      { label: 'AI Advisor', href: '/dashboard/ai-advisor', icon: Lightbulb, badge: undefined },
      { label: 'Prompt Tester', href: '/dashboard/prompt-tester', icon: Wand2, badge: 'NEW' as const },
      { label: 'Generateur llms.txt', href: '/dashboard/llms-txt', icon: FileText, badge: 'NEW' as const },
      { label: 'Google My Business', href: '/dashboard/gmb-config', icon: Globe, badge: 'NEW' as const },
    ],
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart3,
    isCategory: true,
    items: [
      { label: 'Analytics', href: '/dashboard/analytics', icon: LineChart, badge: undefined },
      { label: 'Évolution', href: '/dashboard/evolution', icon: TrendingUp, badge: undefined },
      { label: 'Rapports', href: '/dashboard/reports', icon: FileText, badge: undefined },
    ],
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: Settings,
    isCategory: true,
    items: [
      { label: 'Paramètres', href: '/dashboard/settings', icon: Settings, badge: undefined },
      { label: 'Mes Sites', href: '/dashboard/projects', icon: FolderOpen, badge: undefined },
      { label: 'Parrainage', href: '/dashboard/referral', icon: Users, badge: 'NEW' as const },
    ],
  },
]

// Helper component for the sidebar content
function SidebarContent() {
  const pathname = usePathname()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
      new Set(['seo', 'keywords', 'backlinks', 'content', 'ai-geo', 'reports', 'config'])
    )
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true
    if (href !== '/dashboard' && pathname.startsWith(href)) return true
    return false
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Navigation principale du tableau de bord"
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/95 backdrop-blur-xl transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20',
          !mobileMenuOpen && 'max-lg:-translate-x-full'
        )}
      >
        {/* Logo Section */}
        <div className="border-b border-zinc-200 dark:border-white/5 px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 transition-all"
              title="Retour a l'accueil"
            >
              {/* Colored dots logo */}
              <div className="flex items-center gap-[3px] shrink-0" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              {sidebarOpen && (
                <span className="font-black text-xl tracking-tight text-zinc-900 dark:text-white">
                  Nexus
                </span>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
              aria-label={sidebarOpen ? 'Réduire la barre latérale' : 'Ouvrir la barre latérale'}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-zinc-400 dark:text-white/50" />
              ) : (
                <ChevronRight className="h-5 w-5 text-zinc-400 dark:text-white/50" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5 text-zinc-400 dark:text-white/50" />
            </button>
          </div>
        </div>

        {/* Website Selector */}
        {sidebarOpen && (
          <div className="border-b border-zinc-200 dark:border-white/5 px-3 py-3">
            <WebsiteSelector />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-white/10">
          {navigationCategories.map((cat) => {
            // Category with items
            const Icon = cat.icon
            const isExpanded = expandedCategories.has(cat.id)

            return (
              <div key={cat.id}>
                {sidebarOpen ? (
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`nav-${cat.id}`}
                    className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{cat.label}</span>
                      {(cat as any).badge && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold rounded whitespace-nowrap bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          {(cat as any).badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform flex-shrink-0',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-lg px-3 py-2 text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-all cursor-help"
                    title={cat.label}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                )}

                {/* Sub-items */}
                {isExpanded && sidebarOpen && (
                  <div id={`nav-${cat.id}`} className="mt-1 space-y-0.5 ml-2 border-l border-zinc-200 dark:border-white/5 pl-3">
                    {cat.items?.map((item) => {
                      const ItemIcon = item.icon
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                            active
                              ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                              : 'text-zinc-500 dark:text-white/50 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ItemIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                'px-1.5 py-0.5 text-[8px] font-bold rounded whitespace-nowrap flex-shrink-0',
                                (item.badge as string) === 'PRO'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Section - intentionally minimal */}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed left-4 top-4 z-50 rounded-lg p-2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-white"
        aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>
    </>
  )
}

// Breadcrumb component
function Breadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    let path = ''
    for (const segment of segments) {
      path += `/${segment}`
      const label = segment.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
      breadcrumbs.push({ label, path })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav aria-label="Fil d'Ariane" className="text-sm">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70">
            Dashboard
          </Link>
        </li>
        {breadcrumbs.slice(1).map((crumb, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-white/30" aria-hidden="true" />
            <Link
              href={crumb.path}
              aria-current={idx === breadcrumbs.length - 2 ? 'page' : undefined}
              className="text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70"
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Main layout component
function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto text-brand-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-zinc-500 dark:text-white/50">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userName = session.user?.name || 'User'
  const userEmail = session.user?.email || ''
  const userInitials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const userPlan = 'Gratuit'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <SidebarContent />

        {/* Main Content */}
        <main id="main-content" className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <header className="border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 lg:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Top row: Breadcrumb + Theme + User */}
            <div className="flex items-center justify-between gap-4">
              <Breadcrumb />
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
                  aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-zinc-400 dark:text-white/50" />
                  ) : (
                    <Moon className="h-5 w-5 text-zinc-400 dark:text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom row: Search + Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search */}
              <div className="flex-1 lg:flex-none lg:max-w-sm">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.03] px-3 py-2 focus-within:border-brand-500 transition-all">
                  <Command className="h-4 w-4 text-zinc-400 dark:text-white/30" />
                  <input
                    type="text"
                    placeholder="Rechercher un outil... (Cmd+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Rechercher un outil"
                    className="w-full bg-transparent outline-none placeholder-zinc-400 dark:placeholder-white/30 text-sm text-zinc-900 dark:text-white"
                  />
                  <kbd className="ml-auto rounded border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-500 dark:text-white/40 font-medium hidden lg:inline-block">
                    Cmd+K
                  </kbd>
                </div>
              </div>

              {/* Notifications */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                  className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
                  aria-label="Notifications"
                  aria-expanded={notificationMenuOpen}
                  aria-haspopup="true"
                >
                  <Bell className="h-5 w-5 text-zinc-400 dark:text-white/50" />
                </button>

                {notificationMenuOpen && (
                  <div role="dialog" aria-label="Notifications" className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/50 z-50">
                    <div className="border-b border-zinc-200 dark:border-white/5 px-4 py-3">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="py-2 max-h-96 overflow-y-auto">
                      <div className="px-4 py-6 text-center">
                        <Bell className="w-8 h-8 text-zinc-200 dark:text-white/10 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-xs text-zinc-400 dark:text-white/30">Aucune notification</p>
                        <p className="text-[10px] text-zinc-300 dark:text-white/20 mt-1">Les alertes de scan et de monitoring apparaitront ici</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden lg:flex rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
                aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-zinc-400 dark:text-white/50" />
                ) : (
                  <Moon className="h-5 w-5 text-zinc-400 dark:text-white/50" />
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
                  aria-label="Menu utilisateur"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-semibold">
                    {userInitials}
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-400 dark:text-white/50 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div role="menu" aria-label="Menu utilisateur" className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/50 z-50">
                    <div className="border-b border-zinc-200 dark:border-white/5 px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{userName}</p>
                      <p className="text-xs text-zinc-500 dark:text-white/40">{userEmail}</p>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">100% {userPlan} — Tous les outils</p>
                    </div>
                    <nav className="py-1">
                      <Link
                        href="/dashboard/settings"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                      >
                        <User className="h-4 w-4" />
                        Mon profil
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                      >
                        <Settings className="h-4 w-4" />
                        Parametres
                      </Link>
                    </nav>
                    <div className="border-t border-zinc-200 dark:border-white/5 py-1">
                      <button
                        onClick={async () => {
                          await signOut({ redirect: true, callbackUrl: '/login' })
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Deconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">{children}</div>
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

// Export main component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WebsiteProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </WebsiteProvider>
  )
}
