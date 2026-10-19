'use client'

import React, { useEffect, useState } from 'react'
import { soundEngine } from '@/lib/sound-engine'

interface StudioSplashProps {
  onComplete: () => void
}

export function StudioSplash({ onComplete }: StudioSplashProps) {
  const [phase, setPhase] = useState<'hold' | 'exit'>('hold')

  useEffect(() => {
    soundEngine.playStudioIntro()

    const exitTimer = setTimeout(() => {
      setPhase('exit')
    }, 2200)

    const doneTimer = setTimeout(() => {
      onComplete()
    }, 2900)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div
      onClick={onComplete}
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black select-none cursor-pointer overflow-hidden"
    >
      <div
        className={`transition-all duration-700 ease-out transform ${
          phase === 'hold'
            ? 'opacity-100 scale-100 tracking-[0.36em]'
            : 'opacity-0 scale-105 tracking-[0.42em]'
        }`}
      >
        <span
          className="font-display font-bold text-2xl sm:text-4xl md:text-5xl text-white uppercase"
          style={{
            textShadow: '0 0 38px rgba(255, 255, 255, 0.22)',
          }}
        >
          THE UMAIR CODE®
        </span>
      </div>
    </div>
  )
}
