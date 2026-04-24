'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  iconBg?: string
  actions?: ReactNode
  backHref?: string
  backLabel?: string
}

export function PageHeader({
  title,
  description,
  icon,
  iconBg = 'bg-brand-500/10',
  actions,
  backHref = '/dashboard',
  backLabel = 'Retour au rapport',
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {backLabel}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {description && <p className="text-sm text-white/50 mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
