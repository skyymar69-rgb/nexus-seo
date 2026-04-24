import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'CGU & CGV — Conditions Générales | Nexus SEO',
  description: 'Conditions Générales d\'Utilisation et de Vente de la plateforme Nexus SEO, éditée par KAYZEN LYON.',
}

export default function CguPage() {
  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950 min-h-screen">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="section-badge mb-6">Conditions contractuelles</div>
            <h1 className="text-4xl font-black text-surface-900 dark:text-white mb-3">Conditions Générales d&apos;Utilisation et de Vente</h1>
            <p className="text-surface-400 text-sm mb-12">En vigueur au 1er avril 2026 — Droit applicable : droit français</p>

            <div className="space-y-10 text-surface-600 dark:text-surface-400 text-sm leading-relaxed">

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 1 — Objet et définitions</h2>
                <p className="mb-3">Les présentes Conditions Générales d&apos;Utilisation et de Vente (ci-après &laquo; CGU/CGV &raquo;) régissent l&apos;utilisation de la plateforme Nexus SEO (ci-après &laquo; le Service &raquo;), accessible à l&apos;adresse <strong className="text-surface-900 dark:text-white">nexus.kayzen-lyon.fr</strong>, éditée par KAYZEN LYON (ci-après &laquo; l&apos;Éditeur &raquo;).</p>
                <p>On entend par &laquo; Utilisateur &raquo; toute personne physique ou morale accédant au Service. On entend par &laquo; Client &raquo; tout Utilisateur ayant souscrit à un abonnement payant.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 2 — Accès au Service</h2>
                <p className="mb-3">Le Service est accessible 24h/24 et 7j/7, sous réserve des interruptions nécessaires à la maintenance ou en cas de force majeure. L&apos;Éditeur se réserve le droit de suspendre l&apos;accès pour des opérations de maintenance, avec notification préalable dans la mesure du possible.</p>
                <p>L&apos;inscription est réservée aux personnes majeures. En créant un compte, l&apos;Utilisateur garantit l&apos;exactitude des informations fournies. Chaque compte est strictement personnel et non cessible.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 3 — Plans et tarifs</h2>
                <p className="mb-3">Le Service est proposé selon les formules d&apos;abonnement suivantes (prix HT) :</p>
                <div className="card overflow-hidden mb-3">
                  <table className="w-full text-xs">
                    <thead className="bg-surface-50 dark:bg-surface-800">
                      <tr>
                        <th className="text-left p-3 font-semibold text-surface-900 dark:text-white">Plan</th>
                        <th className="text-right p-3 font-semibold text-surface-900 dark:text-white">Mensuel HT</th>
                        <th className="text-right p-3 font-semibold text-surface-900 dark:text-white">Annuel HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { plan: 'Explorer', monthly: '99 €', annual: '79,20 €/mois (950,40 €/an)' },
                        { plan: 'Professionnel', monthly: '199 €', annual: '159,20 €/mois (1 910,40 €/an)' },
                        { plan: 'Entreprise', monthly: '299 €', annual: '239,20 €/mois (2 870,40 €/an)' },
                        { plan: 'Souveraine', monthly: '499 €', annual: '399,20 €/mois (4 790,40 €/an)' },
                      ].map((r, i) => (
                        <tr key={r.plan} className={i % 2 === 0 ? '' : 'bg-surface-50/50 dark:bg-surface-900/20'}>
                          <td className="p-3 font-medium text-surface-900 dark:text-white">{r.plan}</td>
                          <td className="p-3 text-right">{r.monthly}</td>
                          <td className="p-3 text-right">{r.annual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>Les prix s&apos;entendent hors taxes. La TVA applicable est celle en vigueur au jour de la facturation (20% pour les clients français). L&apos;Éditeur se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 4 — Paiement et facturation</h2>
                <p className="mb-3">Le paiement s&apos;effectue par prélèvement automatique via Stripe. L&apos;abonnement est renouvelé automatiquement à chaque échéance. La facture est émise électroniquement et accessible dans l&apos;espace client.</p>
                <p>En cas d&apos;échec de paiement, l&apos;accès au Service sera suspendu après une période de grâce de 7 jours et deux tentatives de débit. L&apos;Éditeur se réserve le droit de facturer des frais de retard au taux légal.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 5 — Droit de rétractation et remboursement</h2>
                <p className="mb-3">Conformément à l&apos;article L.221-18 du Code de la consommation, les consommateurs (personnes physiques agissant à titre non professionnel) bénéficient d&apos;un droit de rétractation de <strong className="text-surface-900 dark:text-white">14 jours</strong> à compter de la souscription, sans justification.</p>
                <p className="mb-3">Pour exercer ce droit, envoyez un email à <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">contact@kayzen-lyon.fr</a> avec la mention &laquo; Rétractation &raquo;. Le remboursement sera effectué sous 14 jours.</p>
                <p>Au-delà de la période de rétractation, aucun remboursement partiel n&apos;est accordé pour la période en cours. Le Client peut mettre fin à son abonnement à tout moment ; la résiliation prend effet à la fin de la période en cours.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 6 — Utilisation du Service</h2>
                <p className="mb-3">L&apos;Utilisateur s&apos;engage à utiliser le Service de façon licite et à ne pas :</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>tenter de contourner les mesures de sécurité ;</li>
                  <li>utiliser le Service pour des activités illégales ou frauduleuses ;</li>
                  <li>scraper ou extraire massivement les données du Service ;</li>
                  <li>revendre ou sublicencier l&apos;accès au Service sans accord écrit ;</li>
                  <li>soumettre à l&apos;audit des sites dont il n&apos;est pas propriétaire ou mandataire.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 7 — Propriété intellectuelle</h2>
                <p className="mb-3">L&apos;Éditeur concède à l&apos;Utilisateur un droit d&apos;usage personnel, non exclusif et non transférable sur le Service pour la durée de l&apos;abonnement. Les rapports et données générés par le Service à partir des données du Client appartiennent au Client.</p>
                <p>L&apos;algorithme, le code source, les interfaces et la marque Nexus SEO restent la propriété exclusive de KAYZEN LYON.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 8 — Limitation de responsabilité</h2>
                <p className="mb-3">Le Service est fourni &laquo; en l&apos;état &raquo;. L&apos;Éditeur ne garantit pas que les recommandations SEO produiront des résultats spécifiques, les performances des moteurs de recherche dépendant de facteurs extérieurs à son contrôle.</p>
                <p>La responsabilité de l&apos;Éditeur est limitée au montant des sommes effectivement versées par le Client au titre des 12 derniers mois d&apos;abonnement. L&apos;Éditeur ne saurait être tenu responsable des dommages indirects, pertes de profit ou pertes de données.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 9 — Résiliation</h2>
                <p className="mb-3">L&apos;Éditeur se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU, avec effet immédiat et sans remboursement.</p>
                <p>Le Client peut résilier son abonnement à tout moment depuis son espace client. La résiliation prend effet à l&apos;échéance de la période en cours. Les données du Client sont conservées 90 jours après la résiliation, puis définitivement supprimées.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 10 — Droit applicable et juridiction</h2>
                <p>Les présentes CGU/CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Lyon seront saisis. Pour les consommateurs, la juridiction compétente est celle du domicile du défendeur conformément aux règles du Code de la consommation.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">Article 11 — Contact</h2>
                <p>Pour toute question relative aux présentes CGU/CGV : <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">contact@kayzen-lyon.fr</a> — KAYZEN LYON, 6 rue Pierre Termier, 69009 LYON.</p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
