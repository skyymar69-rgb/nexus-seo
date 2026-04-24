'use client';

const logos = [
  'TechCorp',
  'MediaGroup',
  'Growth.io',
  'DataFlow',
  'ScaleLab',
  'WebPeak',
  'DigitalFirst',
  'MetaRank',
];

export function Logos() {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 border-y border-surface-200/50 dark:border-surface-800/50 bg-surface-50/50 dark:bg-surface-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-4">
            Utilise par les meilleures equipes
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Plus de 2,500 entreprises nous font confiance dans 45 pays
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlay Left */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface-50 dark:from-surface-950 to-transparent z-10 pointer-events-none" />
          {/* Gradient Overlay Right */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface-50 dark:from-surface-950 to-transparent z-10 pointer-events-none" />

          {/* Animated Logos */}
          <div className="flex gap-12 animate-[scroll_30s_linear_infinite]">
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex items-center justify-center h-16"
              >
                <span className="text-lg font-bold text-surface-400 dark:text-surface-600 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
