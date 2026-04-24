'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Skeleton({ className, width, height, rounded = 'lg' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-200 dark:bg-surface-700',
        rounded === 'sm' && 'rounded-sm',
        rounded === 'md' && 'rounded-md',
        rounded === 'lg' && 'rounded-lg',
        rounded === 'xl' && 'rounded-xl',
        rounded === 'full' && 'rounded-full',
        className
      )}
      style={{ width, height }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={16} />
        <Skeleton width={40} height={40} rounded="xl" />
      </div>
      <Skeleton width={80} height={32} />
      <Skeleton width="60%" height={12} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
        <Skeleton width={200} height={16} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-b-0">
          <Skeleton width={24} height={24} rounded="full" />
          <Skeleton className="flex-1" height={14} />
          <Skeleton width={60} height={14} />
          <Skeleton width={40} height={24} rounded="full" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6">
      <Skeleton width={150} height={16} className="mb-4" />
      <Skeleton width="100%" height={200} rounded="lg" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      {/* Table */}
      <TableSkeleton />
    </div>
  )
}
