import React from 'react';
import Link from 'next/link';
import { AnimatedLogo } from '@/components/shared/AnimatedLogo';

export const metadata = {
  title: 'Nexus SEO - Authentification',
  description: 'Connectez-vous ou créez un compte Nexus SEO',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-surface-950 p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center max-w-md">
          <Link href="/" className="inline-block mb-8">
            <AnimatedLogo size={64} lightText />
          </Link>

          <h2 className="text-2xl font-bold text-white mb-3">
            La plateforme SEO & IA de référence
          </h2>
          <p className="text-white/50 mb-10">
            Analysez, optimisez et dominez les moteurs de recherche traditionnels et génératifs.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            {[
              { emoji: '🔍', text: '50+ outils SEO & IA gratuits et illimités' },
              { emoji: '🤖', text: 'Visibilité IA : GEO, AEO, LLMO' },
              { emoji: '📊', text: 'Rapports complets avec recommandations actionnables' },
              { emoji: '⚡', text: 'Scan complet de votre site en moins de 2 minutes' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm text-white/70">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/" className="text-sm text-white/30 hover:text-white/50 transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center bg-surface-950 p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <AnimatedLogo size={48} lightText />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
