'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Gift, Copy, Check, Users, Share2, Twitter, Linkedin, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ReferralPage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  const userId = (session?.user as any)?.id || ''
  const referralCode = userId ? userId.slice(0, 8) : 'NEXUS'
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexus.kayzen-lyon.fr'
  const referralUrl = `${baseUrl}/signup?ref=${referralCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = encodeURIComponent('Découvrez Nexus SEO — 50+ outils SEO & IA 100% gratuits ! Audit, mots-clés, visibilité IA, contenu')

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-950 dark:text-surface-50">Programme Ambassadeur</h1>
          <p className="text-sm text-surface-500">Partagez Nexus SEO et gagnez des badges</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Votre code', value: referralCode, icon: Gift, color: 'text-amber-600' },
          { label: 'Invitations', value: '0', icon: Users, color: 'text-brand-600' },
          { label: 'Statut', value: 'Ambassadeur', icon: Share2, color: 'text-green-600' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/[0.03] rounded-xl border border-white/5 p-5 text-center">
              <Icon className={cn('w-5 h-5 mx-auto mb-2', stat.color)} />
              <p className={cn('text-xl font-black', stat.color)}>{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Share link */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4">Votre lien de parrainage</h3>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-sm font-mono text-white/70 truncate">
            {referralUrl}
          </div>
          <button onClick={copyLink} className="btn-primary px-4 py-3 rounded-xl flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copie !' : 'Copier'}
          </button>
        </div>

        {/* Social share buttons */}
        <div className="flex gap-2 mt-4">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:border-brand-400 transition-colors"
          >
            <Twitter className="w-4 h-4" /> Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:border-brand-400 transition-colors"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent('Découvre Nexus SEO')}&body=${shareText}%20${encodeURIComponent(referralUrl)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:border-brand-400 transition-colors"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4">Comment ça marche</h3>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Partagez votre lien', desc: 'Envoyez votre lien de parrainage a vos contacts, clients ou sur les réseaux sociaux.' },
            { step: '2', title: 'Vos contacts s\'inscrivent', desc: 'Ils créent un compte gratuit sur Nexus SEO via votre lien.' },
            { step: '3', title: 'Gagnez des badges', desc: 'À chaque inscription, vous gagnez le badge Ambassadeur et des fonctionnalités exclusives à venir.' },
          ].map(item => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-sm font-bold shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{item.title}</p>
                <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget embed */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4">Badge SEO pour votre site</h3>
        <p className="text-sm text-surface-500 mb-3">Affichez votre score SEO sur votre site et générez des backlinks vers Nexus.</p>
        <div className="bg-white/[0.02] rounded-lg p-3 font-mono text-xs text-surface-600 dark:text-surface-400 overflow-x-auto">
          {`<a href="${baseUrl}"><img src="${baseUrl}/api/widget?domain=VOTRE-DOMAINE.FR" alt="Score SEO par Nexus"></a>`}
        </div>
      </div>
    </div>
  )
}
