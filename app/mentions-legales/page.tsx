import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Mentions légales — Nexus SEO',
  description: 'Mentions légales de la plateforme Nexus SEO, éditée par KAYZEN LYON.',
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950 min-h-screen">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="section-badge mb-6">Informations légales</div>
            <h1 className="text-4xl font-black text-surface-900 dark:text-white mb-3">Mentions légales</h1>
            <p className="text-surface-400 text-sm mb-12">Dernière mise à jour : 1er avril 2026</p>

            <div className="space-y-10 text-surface-600 dark:text-surface-400">

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">1. Éditeur du site</h2>
                <div className="card p-6 space-y-2 text-sm">
                  <p><strong className="text-surface-900 dark:text-white">Raison sociale :</strong> KAYZEN LYON</p>
                  <p><strong className="text-surface-900 dark:text-white">Forme juridique :</strong> Entreprise individuelle / Société commerciale</p>
                  <p><strong className="text-surface-900 dark:text-white">SIREN :</strong> 999 418 346 000 14</p>
                  <p><strong className="text-surface-900 dark:text-white">RCS :</strong> Lyon — 999 418 346</p>
                  <p><strong className="text-surface-900 dark:text-white">N° TVA intracommunautaire :</strong> FR85 999 418 346</p>
                  <p><strong className="text-surface-900 dark:text-white">Code APE :</strong> 4791B</p>
                  <p><strong className="text-surface-900 dark:text-white">Siège social :</strong> 6, rue Pierre Termier, 69009 LYON, France</p>
                  <p><strong className="text-surface-900 dark:text-white">Téléphone :</strong> <a href="tel:+33487776861" className="text-brand-600 dark:text-brand-400 hover:underline">+33 (0)4 87 77 68 61</a></p>
                  <p><strong className="text-surface-900 dark:text-white">Email :</strong> <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">contact@kayzen-lyon.fr</a></p>
                  <p><strong className="text-surface-900 dark:text-white">Site principal :</strong> <a href="https://www.kayzen-lyon.fr" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">www.kayzen-lyon.fr</a></p>
                  <p><strong className="text-surface-900 dark:text-white">Agence Web :</strong> <a href="https://internet.kayzen-lyon.fr" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">internet.kayzen-lyon.fr</a></p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">2. Directeur de la publication</h2>
                <p className="text-sm">Le directeur de la publication est le représentant légal de KAYZEN LYON, joignable à l&apos;adresse email : <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">contact@kayzen-lyon.fr</a>.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">3. Hébergement</h2>
                <div className="card p-6 space-y-2 text-sm">
                  <p><strong className="text-surface-900 dark:text-white">Hébergeur principal :</strong> Vercel Inc.</p>
                  <p><strong className="text-surface-900 dark:text-white">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
                  <p><strong className="text-surface-900 dark:text-white">Site :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">vercel.com</a></p>
                  <p className="text-surface-500 italic text-xs mt-2">🌱 Nexus SEO s&apos;engage dans une démarche d&apos;éco-responsabilité numérique. Nos services privilégient les infrastructures à bilan carbone réduit.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">4. Propriété intellectuelle</h2>
                <p className="text-sm leading-relaxed">L&apos;ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, sons, logiciels…) est la propriété exclusive de KAYZEN LYON ou de ses partenaires, protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication ou adaptation, totale ou partielle, des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de KAYZEN LYON.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">5. Responsabilité</h2>
                <p className="text-sm leading-relaxed">KAYZEN LYON s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, KAYZEN LYON ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à la disposition sur ce site. KAYZEN LYON décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">6. Liens hypertextes</h2>
                <p className="text-sm leading-relaxed">Le site peut contenir des liens hypertextes vers d&apos;autres sites. KAYZEN LYON n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu. La présence de liens vers d&apos;autres sites ne saurait constituer une approbation de ces sites ou de leur contenu par KAYZEN LYON.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">7. Droit applicable</h2>
                <p className="text-sm leading-relaxed">Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents. Le tribunal compétent est celui du ressort de Lyon.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">8. Médiation et règlement des litiges</h2>
                <p className="text-sm leading-relaxed">Conformément à l&apos;article L.612-1 du Code de la consommation, tout consommateur peut recourir gratuitement au service de médiation de la consommation. Nos coordonnées de médiateur vous seront communiquées sur simple demande à <a href="mailto:contact@kayzen-lyon.fr" className="text-brand-600 dark:text-brand-400 hover:underline">contact@kayzen-lyon.fr</a>.</p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
