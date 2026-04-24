'use client'

import { useEffect, useState } from 'react'

interface LiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
  clearAfterMs?: number
}

/**
 * Announces dynamic content changes to screen readers.
 * WCAG 4.1.3 / RGAA 7.5
 */
export function LiveRegion({ message, politeness = 'polite', clearAfterMs }: LiveRegionProps) {
  const [current, setCurrent] = useState(message)

  useEffect(() => {
    setCurrent(message)
    if (clearAfterMs && message) {
      const timer = setTimeout(() => setCurrent(''), clearAfterMs)
      return () => clearTimeout(timer)
    }
  }, [message, clearAfterMs])

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {current}
    </div>
  )
}
