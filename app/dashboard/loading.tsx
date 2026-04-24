export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 bg-white/5 rounded-lg" />
          <div className="h-4 w-36 bg-white/5 rounded mt-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-white/5 rounded-xl" />
          <div className="h-9 w-28 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 space-y-3">
            <div className="h-8 w-8 bg-white/5 rounded-lg" />
            <div className="h-7 w-12 bg-white/5 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Score overview skeleton */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-8">
        <div className="flex items-center justify-center gap-8">
          <div className="w-32 h-32 rounded-full border-4 border-white/5" />
          <div className="hidden sm:block w-px h-24 bg-white/5" />
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-[100px] h-[100px] rounded-full border-4 border-white/5" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
        <div className="h-4 w-32 bg-white/5 rounded mb-4" />
        <div className="h-48 bg-white/[0.02] rounded-xl" />
      </div>

      {/* Report sections skeleton */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl" />
            <div>
              <div className="h-5 w-32 bg-white/5 rounded" />
              <div className="h-3 w-24 bg-white/5 rounded mt-1" />
            </div>
          </div>
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-white/[0.02] rounded w-full" style={{ width: `${85 - j * 10}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
