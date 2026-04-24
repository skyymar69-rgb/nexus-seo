'use client'

import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

export function AnimateOnScroll({
  children,
  animation = 'slide-up',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  animation?: 'slide-up' | 'slide-left' | 'slide-right' | 'fade-in' | 'scale-in'
  delay?: number
  className?: string
}) {
  const { ref, isVisible } = useScrollAnimation()

  const animationClass = {
    'slide-up': 'animate-slide-up',
    'slide-left': 'animate-slide-left',
    'slide-right': 'animate-slide-right',
    'fade-in': 'animate-fade-in',
    'scale-in': 'animate-scale-in',
  }[animation]

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  )
}
