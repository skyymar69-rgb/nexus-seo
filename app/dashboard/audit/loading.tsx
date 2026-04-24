export default function Loading() {
  return (
    <div className="p-6 space-y-6" role="status" aria-busy="true" aria-label="Chargement de l'audit">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-surface-800" />
        <div className="h-6 w-48 bg-surface-800 rounded" />
      </div>
      <div className="bg-surface-800 rounded-lg border border-surface-700 p-6 space-y-4 animate-pulse" style={{ animationDelay: '150ms' }}>
        <div className="h-4 w-32 bg-surface-700 rounded" />
        <div className="h-10 w-full bg-surface-700 rounded" />
        <div className="h-10 w-40 bg-surface-700 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-800 rounded-lg border border-surface-700 p-6 space-y-3 animate-pulse" style={{ animationDelay: `${300 + i * 100}ms` }}>
            <div className="h-3 w-20 bg-surface-700 rounded" />
            <div className="h-8 w-16 bg-surface-700 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-surface-800 rounded-lg border border-surface-700 p-6 animate-pulse" style={{ animationDelay: '600ms' }}>
        <div className="h-[300px] bg-surface-700/50 rounded" />
      </div>
      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}
