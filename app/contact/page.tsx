'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import {
  Mail, Phone, MapPin, ArrowRight, Check,
  ShieldCheck, Info, ChevronDown, ChevronUp,
  Eye, Pencil, Trash2, Download as DownloadIcon,
} from 'lucide-react'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

/* ── Types ───────────────────────────────────────────────────────── */
type FormState = {
  name: string
  email: string
  company: string
  message: string
  subject: string
  consent: boolean
  marketing: boolean
}

const INITIAL: FormState = {
  name: '', email: '', company: '', message: '', subject: 'demo',
  consent: false, marketing: false,
}

/* ── Composant principal ─────────────────────────────────────────── */
export default function ContactPage() {
  const [sent, setSent]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [form, setForm]           = useState<FormState>(INITIAL)
  const [showRights, setShowRights] = useState(false)
  const [consentError, setConsentError] = useState(false)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'consent' && value) setConsentError(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.consent) { setConsentError(true); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSent(true)
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-surface-950">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Contact' }]} />

            <div className="text-center mb-16">
              <div className="section-badge mx-auto mb-4">Contact</div>
              <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white mb-4">
                Parlons de votre{' '}
                <span className="gradient-text">visibilité IA</span>
              </h1>
              <p className="text-lg text-surface-500 dark:text-surface-400">
                Notre équipe répond sous 24h · Démo personnalisée disponible
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

              {/* ── Colonne info ────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">
                {[
                  { icon: Mail,   label: 'Email',     value: 'contact@kayzen-lyon.fr',           href: 'mailto:contact@kayzen-lyon.fr' },
                  { icon: Phone,  label: 'Téléphone', value: '+33 (0)4 87 77 68 61',             href: 'tel:+33487776861' },
                  { icon: MapPin, label: 'Adresse',   value: '6, rue Pierre Termier, 69009 Lyon', href: 'https://maps.google.com/?q=6+rue+Pierre+Termier+69009+Lyon' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} className="flex items-start gap-4 card p-5 hover:ring-1 hover:ring-brand-500/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{value}</p>
                    </div>
                  </a>
                ))}

                {/* Temps de réponse */}
                <div className="card p-5">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Temps de réponse moyen</p>
                  <div className="space-y-2">
                    {[
                      { type: 'Email',   time: '< 4h',        color: 'bg-brand-500' },
                      { type: 'Démo',    time: 'Même jour',   color: 'bg-accent-500' },
                      { type: 'Support', time: '< 2h (pro+)', color: 'bg-violet-500' },
                    ].map((r) => (
                      <div key={r.type} className="flex items-center justify-between text-xs">
                        <span className="text-surface-500 dark:text-surface-400">{r.type}</span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-white ${r.color}`}>{r.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vos droits RGPD — accordéon */}
                <div className="card p-5 border-brand-200 dark:border-brand-800/50">
                  <button
                    type="button"
                    onClick={() => setShowRights((v) => !v)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-surface-900 dark:text-white"
                    aria-expanded={showRights}
                    aria-controls="rgpd-rights-panel"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-500" />
                      Vos droits RGPD
                    </span>
                    {showRights
                      ? <ChevronUp className="w-4 h-4 text-surface-400" />
                      : <ChevronDown className="w-4 h-4 text-surface-400" />}
                  </button>

                  {showRights && (
                    <div id="rgpd-rights-panel" className="mt-4 space-y-3 text-xs text-surface-500 dark:text-surface-400 animate-slide-down">
                      {[
                        { icon: Eye,            label: 'Accès',       desc: 'Obtenir une copie de vos données' },
                        { icon: Pencil,         label: 'Rectification', desc: 'Corriger des données inexactes' },
                        { icon: Trash2,         label: 'Effacement',  desc: 'Demander la suppression ("droit à l\'oubli")' },
                        { icon: DownloadIcon,   label: 'Portabilité', desc: 'Recevoir vos données dans un format lisible' },
                      ].map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="flex items-start gap-2">
                          <Icon className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-surface-700 dark:text-surface-300">{label} —</span>{' '}
                            {desc}
                          </div>
                        </div>
                      ))}
                      <p className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-800">
                        Exercez vos droits à{' '}
                        <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-500 underline underline-offset-2">
                          contact@kayzen-lyon.fr
                        </a>
                        {' '}ou auprès de la{' '}
                        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline underline-offset-2">CNIL</a>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Formulaire ──────────────────────────────────── */}
              <div className="lg:col-span-3">
                {sent ? (
                  <div className="card p-12 text-center" role="status" aria-live="polite">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-5">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Message envoyé !</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-6">
                      Notre équipe vous répondra dans les 4 heures.
                    </p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">
                      Conformément au RGPD, vos données sont conservées 3 ans maximum
                      et ne seront jamais revendues à des tiers.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    aria-label="Formulaire de contact"
                    noValidate
                    className="card p-8 space-y-5"
                  >

                    {/* Notice d'information RGPD (Art. 13 RGPD) */}
                    <div className="flex gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/50">
                      <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                        <strong className="text-surface-800 dark:text-surface-200 font-semibold">Traitement de vos données (Art. 13 RGPD)</strong>
                        <br />
                        Responsable : <strong>Kayzen Lyon</strong>, 6 rue Pierre Termier, 69009 Lyon.
                        {' '}Finalité : traitement de votre demande de contact et, si vous y consentez, envoi d'informations commerciales.
                        {' '}Base légale : consentement (Art. 6-1-a RGPD).
                        {' '}Durée de conservation : <strong>3 ans</strong> après le dernier contact.
                        {' '}Vos données ne sont ni vendues ni transmises à des tiers.{' '}
                        <Link href="/privacy" className="text-brand-600 dark:text-brand-400 underline underline-offset-2 font-medium">
                          Politique de confidentialité complète →
                        </Link>
                      </div>
                    </div>

                    {/* Champs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                          Nom <span aria-hidden="true" className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          required
                          aria-required="true"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => setField('name', e.target.value)}
                          placeholder="Jean Dupont"
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                          Email <span aria-hidden="true" className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          required
                          aria-required="true"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => setField('email', e.target.value)}
                          placeholder="jean@entreprise.fr"
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-company" className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Entreprise</label>
                      <input
                        id="contact-company"
                        autoComplete="organization"
                        value={form.company}
                        onChange={(e) => setField('company', e.target.value)}
                        placeholder="Ma Société"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Sujet</label>
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(e) => setField('subject', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                      >
                        <option value="demo">Demander une démo</option>
                        <option value="sales">Question commerciale</option>
                        <option value="support">Support technique</option>
                        <option value="partnership">Partenariat</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">
                        Message <span aria-hidden="true" className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        aria-required="true"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setField('message', e.target.value)}
                        placeholder="Décrivez votre projet, vos besoins..."
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                      />
                    </div>

                    {/* ─── Consentements RGPD ─────────────────────── */}
                    <fieldset className="space-y-3 pt-1">
                      <legend className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                        Consentements <span className="normal-case font-normal">(requis)</span>
                      </legend>

                      {/* Consentement principal — OBLIGATOIRE */}
                      <div className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-colors ${
                        consentError
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                          : form.consent
                            ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/20'
                            : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50'
                      }`}>
                        <div className="flex h-5 items-center">
                          <input
                            id="consent-main"
                            type="checkbox"
                            required
                            aria-required="true"
                            aria-describedby="consent-main-desc"
                            checked={form.consent}
                            onChange={(e) => setField('consent', e.target.checked)}
                            className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="consent-main" className="text-sm font-semibold text-surface-900 dark:text-white cursor-pointer">
                            J'accepte le traitement de mes données personnelles <span className="text-red-500" aria-hidden="true">*</span>
                          </label>
                          <p id="consent-main-desc" className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                            Je consens à ce que Kayzen Lyon traite mes données (nom, email, message) pour répondre à ma demande.
                            Conformément au RGPD, je peux retirer ce consentement à tout moment.{' '}
                            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 underline underline-offset-2">
                              En savoir plus
                            </Link>
                          </p>
                          {consentError && (
                            <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-semibold">
                              ⚠ Vous devez accepter ce consentement pour envoyer le formulaire.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Consentement marketing — OPTIONNEL */}
                      <div className={`relative flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                        form.marketing
                          ? 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/20'
                          : 'border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50'
                      }`}>
                        <div className="flex h-5 items-center">
                          <input
                            id="consent-marketing"
                            type="checkbox"
                            aria-describedby="consent-marketing-desc"
                            checked={form.marketing}
                            onChange={(e) => setField('marketing', e.target.checked)}
                            className="h-4 w-4 rounded border-surface-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor="consent-marketing" className="text-sm font-medium text-surface-700 dark:text-surface-300 cursor-pointer">
                            J'accepte de recevoir des informations commerciales{' '}
                            <span className="text-surface-400 font-normal">(facultatif)</span>
                          </label>
                          <p id="consent-marketing-desc" className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                            Actualités Nexus SEO, nouveautés, conseils SEO/GEO. Désabonnement en un clic à tout moment.
                          </p>
                        </div>
                      </div>
                    </fieldset>

                    {/* Bouton submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      aria-busy={loading}
                      className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          Envoyer le message
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Pied de formulaire RGPD */}
                    <div className="flex items-start gap-2 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed">
                        Données protégées · Jamais revendues · Chiffrement TLS.{' '}
                        <Link href="/privacy" className="underline underline-offset-2 hover:text-brand-500 transition-colors">
                          Politique de confidentialité
                        </Link>
                        {' '}·{' '}
                        <a href="mailto:contact@kayzen-lyon.fr?subject=Exercice%20droits%20RGPD" className="underline underline-offset-2 hover:text-brand-500 transition-colors">
                          Exercer mes droits
                        </a>
                      </p>
                    </div>

                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
