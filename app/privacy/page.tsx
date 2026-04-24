import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Politique de confidentialité — Nexus SEO',
  description: 'Politique de confidentialité et de protection des données personnelles de Nexus SEO, conformément au RGPD.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950 min-h-screen">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="section-badge mb-6">RGPD & Confidentialité</div>
            <h1 className="text-4xl font-black text-surface-900 dark:text-white mb-3">Politique de confidentialité</h1>
            <p className="text-surface-400 text-sm mb-12">Dernière mise à jour : 1er avril 2026 — Conforme au Règlement (UE) 2016/679 (RGPD)</p>

            <div className="space-y-10 text-surface-600 dark:text-surface-400 text-sm">

              <div className="card p-6 border-l-4 border-brand-500">
                <p className="font-semibold text-surface-900 dark:text-white mb-2">Résumé clair</p>
                <p>Nous collectons uniquement les données nécessaires au fonctionnement du service. Nous ne vendons jamais vos données. Vous pouvez exercer vos droits à tout moment. Vos données sont hébergées en Europe.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">1. Responsable du traitement</h2>
                <p>Le responsable du traitement des données à caractère personnel est :</p>
                <div className="card p-5 mt-3 space-y-1">
                  <p><strong className="text-surface-900 dark:text-white">KAYZEN LYON</strong></p>
                  <p>6, rue Pierre Termier, 69009 LYON, France</p>
                  <p>Email DPO : <a href="mailto:dpo@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">dpo@kayzen-lyon.fr</a></p>
                  <p>SIREN : 999 418 346 000 14</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">2. Données collectées et finalités</h2>
                <div className="space-y-4">
                  {[
                    {
                      type: 'Données d\'identification et de compte',
                      data: 'Nom, prénom, adresse email, nom d\'entreprise, mot de passe haché',
                      purpose: 'Création et gestion du compte utilisateur, authentification',
                      basis: 'Exécution du contrat (Art. 6.1.b RGPD)',
                      retention: '3 ans après la dernière connexion active',
                    },
                    {
                      type: 'Données de facturation',
                      data: 'Adresse de facturation, numéro de TVA, référence de transaction (via Stripe — aucune donnée de carte stockée chez nous)',
                      purpose: 'Gestion de la facturation, obligations comptables',
                      basis: 'Obligation légale (Art. 6.1.c RGPD)',
                      retention: '10 ans (délai légal de conservation comptable)',
                    },
                    {
                      type: 'Données d\'utilisation du service',
                      data: 'Domaines audités, mots-clés suivis, rapports générés, logs d\'actions',
                      purpose: 'Fourniture du service, amélioration de la plateforme',
                      basis: 'Exécution du contrat (Art. 6.1.b RGPD)',
                      retention: 'Durée de l\'abonnement + 90 jours',
                    },
                    {
                      type: 'Données de navigation',
                      data: 'Adresse IP (anonymisée), type de navigateur, pages visitées, durée de session',
                      purpose: 'Analyse d\'audience anonymisée (aucun cookie tiers publicitaire)',
                      basis: 'Intérêt légitime (Art. 6.1.f RGPD)',
                      retention: '13 mois maximum',
                    },
                    {
                      type: 'Communications',
                      data: 'Email, contenu des messages envoyés via le formulaire de contact',
                      purpose: 'Réponse aux demandes de support et commerciales',
                      basis: 'Intérêt légitime / consentement',
                      retention: '3 ans',
                    },
                  ].map((item) => (
                    <div key={item.type} className="card p-5">
                      <p className="font-semibold text-surface-900 dark:text-white mb-2">{item.type}</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-medium text-surface-700 dark:text-surface-300">Données :</span> {item.data}</p>
                        <p><span className="font-medium text-surface-700 dark:text-surface-300">Finalité :</span> {item.purpose}</p>
                        <p><span className="font-medium text-surface-700 dark:text-surface-300">Base légale :</span> {item.basis}</p>
                        <p><span className="font-medium text-surface-700 dark:text-surface-300">Conservation :</span> {item.retention}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">3. Destinataires des données</h2>
                <p className="mb-3">Vos données sont transmises uniquement aux sous-traitants nécessaires au fonctionnement du service, tous liés par des clauses contractuelles conformes au RGPD :</p>
                <div className="space-y-2">
                  {[
                    { name: 'Railway Corp. (hébergement)', location: 'UE/USA', dpa: 'DPA signé, clauses SCC' },
                    { name: 'Stripe Inc. (paiement)', location: 'USA', dpa: 'Privacy Shield / SCC' },
                    { name: 'Resend / SendGrid (emails transactionnels)', location: 'USA', dpa: 'SCC' },
                  ].map((s) => (
                    <div key={s.name} className="flex items-start justify-between card px-4 py-3">
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white text-xs">{s.name}</p>
                        <p className="text-surface-400 text-xs">{s.dpa}</p>
                      </div>
                      <span className="text-xs text-surface-400 shrink-0 ml-4">{s.location}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-surface-400">Nous ne vendons, ne louons et ne communiquons jamais vos données à des tiers à des fins commerciales ou publicitaires.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">4. Vos droits RGPD</h2>
                <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { right: 'Droit d\'accès', desc: 'Obtenir une copie de vos données' },
                    { right: 'Droit de rectification', desc: 'Corriger des données inexactes' },
                    { right: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données' },
                    { right: 'Droit à la portabilité', desc: 'Exporter vos données en format lisible' },
                    { right: 'Droit d\'opposition', desc: 'Vous opposer à certains traitements' },
                    { right: 'Droit de limitation', desc: 'Limiter le traitement de vos données' },
                  ].map((r) => (
                    <div key={r.right} className="card p-4">
                      <p className="font-semibold text-surface-900 dark:text-white text-xs mb-1">{r.right}</p>
                      <p className="text-surface-400 text-xs">{r.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4">Pour exercer vos droits : <a href="mailto:dpo@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">dpo@kayzen-lyon.fr</a>. Réponse sous 30 jours. En cas de litige non résolu, vous pouvez saisir la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">CNIL</a>.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">5. Cookies</h2>
                <p className="mb-3">Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du service (session, authentification, préférences de thème). Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé sans votre consentement préalable.</p>
                <p>Vous pouvez configurer votre navigateur pour refuser les cookies. Cela peut affecter le fonctionnement de certaines fonctionnalités (connexion, préférences).</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">6. Sécurité</h2>
                <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement TLS en transit, hachage bcrypt des mots de passe, accès restreint aux données de production, sauvegardes chiffrées, audit de sécurité régulier.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">7. Modifications</h2>
                <p>Nous nous réservons le droit de modifier cette politique. Toute modification substantielle sera notifiée par email aux utilisateurs enregistrés. La version en vigueur est toujours accessible sur cette page.</p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
