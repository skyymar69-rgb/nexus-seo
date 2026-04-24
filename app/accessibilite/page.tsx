import { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export const metadata: Metadata = {
  title: "Declaration d'accessibilite | Nexus SEO",
  description:
    "Declaration de conformite RGAA, WCAG 2.1 AA et European Accessibility Act (EAA) de Nexus SEO.",
}

export default function AccessibilityStatementPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-white dark:bg-surface-950">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Breadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: "Accessibilite" },
              ]}
            />

            <h1 className="text-4xl font-black text-surface-900 dark:text-white mt-8 mb-6">
              Declaration d&apos;accessibilite
            </h1>

            <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-surface-700 dark:text-surface-300">
              <p>
                <strong>Nexus SEO</strong> s&apos;engage a rendre son site internet et ses
                applications accessibles conformement a l&apos;article 47 de la loi
                n&deg;&nbsp;2005-102 du 11 fevrier 2005, au{' '}
                <strong>Referentiel General d&apos;Amelioration de l&apos;Accessibilite (RGAA) version 4.1</strong>,
                aux{' '}
                <strong>Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA</strong>, et a
                l&apos;<strong>European Accessibility Act (EAA)</strong> entrant en vigueur le 28 juin 2025.
              </p>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Etat de conformite
              </h2>
              <p>
                Le site <strong>nexus-seo.com</strong> est en <strong>conformite partielle</strong> avec
                le RGAA 4.1 et les WCAG 2.1 AA. Les non-conformites et derogations sont
                listees ci-dessous.
              </p>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Resultats des tests
              </h2>
              <p>
                Un audit de conformite a ete realise en avril 2026. Le taux de conformite
                global est en cours d&apos;amelioration continue.
              </p>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Contenus non accessibles
              </h2>
              <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                Non-conformites connues
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Certains graphiques interactifs (Recharts) ne disposent pas encore d&apos;un tableau de donnees alternatif sur toutes les pages.</li>
                <li>Certains contrastes de couleurs sur les textes secondaires en mode sombre sont en cours d&apos;amelioration.</li>
              </ul>

              <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                Derogations pour charge disproportionnee
              </h3>
              <p>Aucune derogation n&apos;est invoquee a ce stade.</p>

              <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                Contenus non soumis a l&apos;obligation
              </h3>
              <p>Les contenus tiers (Google OAuth, services externes) ne sont pas sous le controle de Nexus SEO.</p>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Technologies utilisees
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>HTML5</li>
                <li>CSS (Tailwind CSS)</li>
                <li>JavaScript / TypeScript (React, Next.js 14)</li>
                <li>WAI-ARIA 1.2</li>
              </ul>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Environnement de test
              </h2>
              <p>Les verifications ont ete realisees avec :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>NVDA 2024 + Firefox</li>
                <li>VoiceOver + Safari (macOS)</li>
                <li>axe DevTools (Deque)</li>
                <li>Lighthouse (Google Chrome)</li>
              </ul>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Retour d&apos;information et contact
              </h2>
              <p>
                Si vous n&apos;arrivez pas a acceder a un contenu ou un service, vous pouvez
                nous contacter pour etre oriente vers une alternative accessible ou obtenir
                le contenu sous une autre forme :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email : <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 hover:underline">contact@kayzen-lyon.fr</a></li>
                <li>Telephone : <a href="tel:+33487776861" className="text-brand-600 hover:underline">+33 (0)4 87 77 68 61</a></li>
                <li>Adresse : 6, rue Pierre Termier, 69009 Lyon</li>
              </ul>

              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Voie de recours
              </h2>
              <p>
                Si vous constatez un defaut d&apos;accessibilite vous empechant d&apos;acceder
                a un contenu ou une fonctionnalite du site, et que vous nous avez signale
                ce probleme sans obtenir de reponse satisfaisante, vous pouvez :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ecrire un message au <a href="https://formulaire.defenseurdesdroits.fr/" className="text-brand-600 hover:underline" target="_blank" rel="noopener noreferrer">Defenseur des droits</a></li>
                <li>Contacter le delegue du Defenseur des droits dans votre region</li>
                <li>Envoyer un courrier par la poste (gratuit) : Defenseur des droits — Libre reponse 71120 — 75342 Paris CEDEX 07</li>
              </ul>

              <p className="text-sm text-surface-400 mt-8">
                Cette declaration a ete etablie le 16 avril 2026.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
