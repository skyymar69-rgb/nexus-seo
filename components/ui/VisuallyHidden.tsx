'use client'

import { ReactNode } from 'react'

interface VisuallyHiddenProps {
  children: ReactNode
  as?: 'span' | 'div' | 'p'
}

/**
 * Renders content visible only to screen readers.
 * WCAG 2.4.6 / RGAA 10.2
 */
export function VisuallyHidden({ children, as: Tag = 'span' }: VisuallyHiddenProps) {
  return (
    <Tag
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </Tag>
  )
}
