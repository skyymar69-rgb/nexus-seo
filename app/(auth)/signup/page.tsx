'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, ShieldCheck, Info } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeRgpd, setAgreeRgpd] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // Password strength
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (!password) { setStrength({ score: 0, label: '', color: '' }); return; }
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z\d]/.test(password)) s++;
    s = Math.min(s, 4);
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Très fort'];
    const colors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
    setStrength({ score: s, label: labels[s] || '', color: colors[s] || '' });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) { setError('Le nom doit contenir au moins 2 caractères.'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Adresse e-mail invalide.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (!agreeTerms) { setError('Veuillez accepter les conditions d\'utilisation.'); return; }
    if (!agreeRgpd) { setError('Veuillez accepter le traitement de vos données personnelles (RGPD).'); return; }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: 'free' }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Erreur lors de l\'inscription.'); return; }

      const signInResult = await signIn('credentials', { email, password, redirect: false });
      if (signInResult?.ok) {
        router.push('/dashboard/onboarding');
      } else {
        router.push('/login');
      }
    } catch {
      setError('Erreur serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Créer un compte</h2>
        <p className="text-sm text-surface-600 dark:text-white/50">
          Rejoignez Nexus SEO et commencez à optimiser votre référencement
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/dashboard/onboarding' })}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-surface-200 dark:border-white/10 bg-surface-100 dark:bg-white/[0.03] text-surface-800 dark:text-white text-sm font-medium hover:bg-surface-200 dark:hover:bg-white/[0.06] transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        S&apos;inscrire avec Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-200 dark:bg-white/10" />
        <span className="text-xs text-surface-500 dark:text-white/30">ou avec votre e-mail</span>
        <div className="flex-1 h-px bg-surface-200 dark:bg-white/10" />
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-1.5">Nom complet</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-white/30" />
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              aria-required="true"
              autoComplete="name"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-1.5">Adresse e-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-white/30" />
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@example.com"
              aria-required="true"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-1.5">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-white/30" />
            <input
              id="password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              aria-required="true"
              aria-describedby={password ? 'password-strength' : undefined}
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-surface-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-white/30 hover:text-surface-700 dark:hover:text-white/60">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-2" id="password-strength" role="meter" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={4} aria-label={`Force du mot de passe : ${strength.label || 'non évaluée'}`}>
              <div className="flex-1 h-1 bg-surface-200 dark:bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
                <div className={`h-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 4) * 100}%` }} />
              </div>
              <span className="text-xs text-surface-500 dark:text-white/40" aria-live="polite">{strength.label}</span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 dark:text-white/70 mb-1.5">Confirmer le mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 dark:text-white/30" />
            <input
              id="confirmPassword" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
              aria-required="true"
              autoComplete="new-password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
            />
          </div>
        </div>

        {/* ─── Consentements RGPD ─────────────────────────────── */}
        <fieldset className="space-y-3 pt-1">
          <legend className="sr-only">Consentements requis</legend>

          {/* Notice Art. 13 RGPD */}
          <div className="flex gap-2.5 p-3.5 rounded-xl bg-surface-50 dark:bg-white/[0.04] border border-surface-200 dark:border-white/10">
            <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-surface-600 dark:text-white/50 leading-relaxed">
              <strong className="text-surface-700 dark:text-white/70 font-semibold">Traitement de vos données (Art. 13 RGPD) —</strong>{' '}
              Responsable : <strong className="text-surface-700 dark:text-white/70">Kayzen Lyon</strong>.
              Finalité : création et gestion de votre compte, fourniture du service.
              Base légale : exécution du contrat + consentement.
              Conservation : durée du compte + 3 ans.{' '}
              <Link href="/privacy" className="text-brand-600 dark:text-brand-400 underline underline-offset-2">Politique complète →</Link>
            </p>
          </div>

          {/* CGU */}
          <div className="flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              aria-required="true"
              className="mt-1 w-4 h-4 rounded border-surface-300 dark:border-white/20 bg-white dark:bg-white/5 text-brand-500 focus:ring-brand-500/50"
            />
            <label htmlFor="terms" className="text-sm text-surface-600 dark:text-white/50 leading-relaxed cursor-pointer">
              J&apos;accepte les{' '}
              <Link href="/cgu" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-2">conditions d&apos;utilisation</Link>
              {' '}et la{' '}
              <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-2">politique de confidentialité</Link>
              <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </label>
          </div>

          {/* Consentement RGPD traitement — OBLIGATOIRE */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
            agreeRgpd ? 'border-brand-500/40 bg-brand-500/5' : 'border-surface-200 dark:border-white/10 bg-surface-50 dark:bg-white/[0.02]'
          }`}>
            <input
              id="rgpd-consent"
              type="checkbox"
              checked={agreeRgpd}
              onChange={(e) => setAgreeRgpd(e.target.checked)}
              aria-required="true"
              aria-describedby="rgpd-consent-desc"
              className="mt-0.5 w-4 h-4 rounded border-surface-300 dark:border-white/20 bg-white dark:bg-white/5 text-brand-500 focus:ring-brand-500/50"
            />
            <div>
              <label htmlFor="rgpd-consent" className="text-sm font-medium text-surface-700 dark:text-white/70 cursor-pointer">
                J&apos;accepte le traitement de mes données personnelles
                <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
              </label>
              <p id="rgpd-consent-desc" className="text-xs text-surface-500 dark:text-white/40 mt-0.5">
                Nom, email, usage de la plateforme. Je peux retirer ce consentement à tout moment.
              </p>
            </div>
          </div>

          {/* Consentement marketing — OPTIONNEL */}
          <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
            agreeMarketing ? 'border-violet-500/40 bg-violet-500/5' : 'border-surface-200 dark:border-white/10 bg-surface-50 dark:bg-white/[0.02]'
          }`}>
            <input
              id="marketing-consent"
              type="checkbox"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
              aria-describedby="marketing-desc"
              className="mt-0.5 w-4 h-4 rounded border-surface-300 dark:border-white/20 bg-white dark:bg-white/5 text-violet-500 focus:ring-violet-500/50"
            />
            <div>
              <label htmlFor="marketing-consent" className="text-sm text-surface-600 dark:text-white/50 cursor-pointer">
                Recevoir les actualités &amp; conseils Nexus SEO{' '}
                <span className="text-surface-400 dark:text-white/30">(facultatif)</span>
              </label>
              <p id="marketing-desc" className="text-xs text-surface-500 dark:text-white/30 mt-0.5">
                Désabonnement en un clic. Aucune revente à des tiers.
              </p>
            </div>
          </div>

          {/* Droits */}
          <p className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-white/30">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" aria-hidden="true" />
            Droits : accès, rectification, effacement —{' '}
            <a href="mailto:contact@kayzen-lyon.fr?subject=Exercice%20droits%20RGPD" className="text-brand-600 dark:text-brand-400/70 underline underline-offset-2 hover:text-brand-700 dark:hover:text-brand-400">
              contact@kayzen-lyon.fr
            </a>
            {' '}ou{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400/70 underline underline-offset-2 hover:text-brand-700 dark:hover:text-brand-400">CNIL</a>
          </p>
        </fieldset>

        <button type="submit" disabled={isLoading} aria-busy={isLoading}
          className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Inscription en cours...</>
          ) : (
            <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-surface-600 dark:text-white/40">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">Se connecter</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="space-y-6 animate-pulse" />}>
      <SignupForm />
    </Suspense>
  );
}
