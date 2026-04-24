'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface DashCardProps {
  icon: ReactNode
  iconBg?: string
  title: string
  subtitle?: string
  rightContent?: ReactNode
  detailHref?: string
  detailLabel?: string
  children: ReactNode
  className?: string
}

export function DashCard({
  icon,
  iconBg = 'bg-brand-500/10',
  title,
  subtitle,
  rightContent,
  detailHref,
  detailLabel = 'Voir le detail',
  children,
  className = '',
}: DashCardProps) {
  return (
    <section className={`rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {rightContent}
          {detailHref && (
            <Link
              href={detailHref}
              className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {detailLabel} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
      {/* Body */}
      <div className="p-6">{children}</div>
    </section>
  )
}
