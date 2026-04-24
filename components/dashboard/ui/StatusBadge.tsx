'use client'

import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'

type Status = 'passed' | 'warning' | 'error' | 'info'

interface StatusBadgeProps {
  status: Status
  label?: string
  size?: 'sm' | 'md'
}

const config: Record<Status, { icon: typeof CheckCircle2; color: string; bg: string; defaultLabel: string }> = {
  passed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', defaultLabel: 'OK' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', defaultLabel: 'Attention' },
  error: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', defaultLabel: 'Erreur' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', defaultLabel: 'Info' },
}

export function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const { icon: Icon, color, bg, defaultLabel } = config[status]
  const text = label || defaultLabel
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1'

  return (
    <span className={`inline-flex items-center gap-1 ${padding} rounded font-medium ${bg} ${color} ${textSize}`}>
      <Icon className={iconSize} />
      {text}
    </span>
  )
}

export function StatusIcon({ status, className = 'w-4 h-4' }: { status: string; className?: string }) {
  switch (status) {
    case 'passed': return <CheckCircle2 className={`${className} text-emerald-400`} />
    case 'warning': return <AlertTriangle className={`${className} text-amber-400`} />
    case 'error': return <XCircle className={`${className} text-rose-400`} />
    default: return <Info className={`${className} text-blue-400`} />
  }
}
