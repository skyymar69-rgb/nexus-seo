'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedLogoProps {
  size?: number
  className?: string
  lightText?: boolean
}

export function AnimatedLogo({ size = 36, className, lightText = false }: AnimatedLogoProps) {
  const [nexus, setNexus] = useState('Nexus SEO')
  const [kayzen, setKayzen] = useState('By Kayzen')
  const [phase, setPhase] = useState<'idle' | 'typing-nexus' | 'typing-kayzen' | 'done'>('idle')

  useEffect(() => {
    setNexus('')
    setKayzen('')
    setPhase('typing-nexus')

    const textN = 'Nexus SEO'
    let i = 0
    const t1 = setInterval(() => {
      i++
      setNexus(textN.slice(0, i))
      if (i >= textN.length) {
        clearInterval(t1)
        setPhase('typing-kayzen')
        const textK = 'By Kayzen'
        let j = 0
        const t2 = setInterval(() => {
          j++
          setKayzen(textK.slice(0, j))
          if (j >= textK.length) {
            clearInterval(t2)
            setPhase('done')
          }
        }, 40)
      }
    }, 60)

    return () => clearInterval(t1)
  }, [])

  const dotSize = Math.max(4, size / 6)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Animated colored dots logo */}
      <div className="shrink-0 flex items-center justify-center gap-[3px]" style={{ width: size, height: size }}>
        {['bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'].map((color, idx) => (
          <span
            key={idx}
            className={cn('rounded-full', color)}
            style={{
              width: dotSize,
              height: dotSize,
              animation: `bounceSoft 1.2s ease-in-out ${idx * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Animated text */}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-heading text-lg font-black tracking-tight',
            lightText ? 'text-white' : 'text-surface-900 dark:text-white'
          )}
        >
          {nexus}
          {phase === 'typing-nexus' && (
            <span className="inline-block w-[2px] h-[1em] bg-gold-400 ml-px animate-pulse" />
          )}
        </span>
        <span
          className={cn(
            'text-[10px] font-medium tracking-widest uppercase italic h-3',
            lightText ? 'text-white/60' : 'text-surface-400 dark:text-surface-500'
          )}
        >
          {kayzen}
          {phase === 'typing-kayzen' && (
            <span className="inline-block w-[1px] h-[0.8em] bg-current ml-px animate-pulse" />
          )}
        </span>
      </div>
    </div>
  )
}
