'use client'

import { useState } from 'react'
import { useSession } from '@/hooks/useSession'
import { usePlan } from '@/hooks/usePlan'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Save,
  Key,
  Bell,
  CreditCard,
  User,
  Sun,
  Moon,
  Zap,
  Loader2,
  Info,
  Globe,
  ExternalLink,
  Check,
  Shield,
} from 'lucide-react'

const PLAN_LABELS: Record<string, { label: string; price: string }> = {
  free: { label: 'Gratuit', price: '100% Gratuit' },
}

const PLAN_FEATURES = [
  'Audit SEO complet',
  'Audit GEO / AEO',
  'Score AI Visibility',
  'Analyse de performance',
  'Export PDF / HTML',
  'Schema Generator',
  'Suivi multi-sites',
  'Historique des scans',
]

export default function SettingsPage() {
  const { user, isLoading: sessionLoading } = useSession()
  const { currentPlan } = usePlan()
  const { theme, setTheme } = useTheme()

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReports: true,
    newFeatures: true,
    productUpdates: false,
  })

  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleNotificationChange = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))
  }

  const handleSave = () => {
    setSaveMessage('Contactez-nous pour modifier votre profil.')
    setTimeout(() => setSaveMessage(null), 4000)
  }

  const planInfo = PLAN_LABELS[currentPlan] || PLAN_LABELS.free

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        <p className="text-white/50 mt-1">Gérez vos paramètres et préférences</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-blue-400" />
          Profil
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Nom</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-4 py-2.5 text-white outline-none cursor-not-allowed placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white/70">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full rounded-lg bg-white/[0.05] border border-white/10 px-4 py-2.5 text-white outline-none cursor-not-allowed placeholder:text-white/30"
              />
            </div>
          </div>

          {saveMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 text-sm text-blue-300">
              <Info className="h-4 w-4 flex-shrink-0" />
              {saveMessage}
            </div>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
          >
            <Save className="h-4 w-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* Plan Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5 text-emerald-400" />
          Plan et facturation
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-emerald-300">Plan {planInfo.label}</p>
                <p className="text-sm text-white/50 mt-1">
                  Accès complet à toutes les fonctionnalités
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {planInfo.price}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PLAN_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>

          <button className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-medium text-white/70 transition-colors">
            Gérer mon abonnement
          </button>
        </div>
      </div>

      {/* Websites Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
          <Globe className="h-5 w-5 text-purple-400" />
          Mes sites web
        </h2>

        <p className="text-sm text-white/50 mb-4">
          Gérez vos sites web, lancez des audits et suivez leurs performances.
        </p>

        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Gérer mes projets
        </Link>
      </div>

      {/* Theme Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <Sun className="h-5 w-5 text-amber-400" />
          Thème
        </h2>

        <div className="space-y-3">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
              theme === 'light'
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            )}
          >
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Mode clair</p>
                <p className="text-xs text-white/50">Interface en couleurs claires</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
              theme === 'dark'
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            )}
          >
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Mode sombre</p>
                <p className="text-xs text-white/50">Interface en couleurs sombres</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={cn(
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
              theme === 'system'
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            )}
          >
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-white/70" />
              <div>
                <p className="font-medium text-white">Automatique</p>
                <p className="text-xs text-white/50">
                  Suit les préférences du système
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <Bell className="h-5 w-5 text-orange-400" />
          Notifications
        </h2>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-white">
                  {key === 'emailAlerts'
                    ? 'Alertes par email'
                    : key === 'weeklyReports'
                      ? 'Rapports hebdomadaires'
                      : key === 'newFeatures'
                        ? 'Nouvelles fonctionnalités'
                        : 'Mises à jour produit'}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {key === 'emailAlerts'
                    ? 'Recevez des alertes importantes par email'
                    : key === 'weeklyReports'
                      ? 'Rapport résumé chaque semaine'
                      : key === 'newFeatures'
                        ? 'Soyez informé des nouvelles fonctionnalités'
                        : 'Recevez les informations sur les mises à jour'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key)}
                className={cn(
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0',
                  value ? 'bg-blue-600' : 'bg-white/10'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow',
                    value ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys Section */}
      <div className="rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
          <Key className="h-5 w-5 text-cyan-400" />
          Clé API
        </h2>

        <p className="text-sm text-white/50 mb-4">
          Utilisez une clé API pour intégrer Nexus dans vos outils.
        </p>

        <button
          className="w-full px-4 py-3 rounded-lg border font-medium transition-colors border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70"
        >
          Générez votre clé API pour intégrer Nexus
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.05] backdrop-blur-sm p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
          <Shield className="h-5 w-5" />
          Zone de danger
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Ces actions sont irréversibles. Soyez prudent.
        </p>
        <button className="px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-colors">
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
