'use client'

import React, { useEffect, useRef } from 'react'
import { ENVIRONMENT_SKINS, EnvironmentSkinId } from '@/lib/game-types'

interface LiveForestEnvironmentProps {
  skinId: EnvironmentSkinId
  intensity?: 'menu' | 'match'
}

interface SporeParticle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  alpha: number
  pulseSpeed: number
  pulseOffset: number
  isPrimaryColor: boolean
  isVortexBound: boolean
  angle: number
  dist: number
}

interface MistLayer {
  x: number
  y: number
  width: number
  height: number
  speed: number
  alpha: number
}

export function LiveForestEnvironment({
  skinId,
  intensity = 'match',
}: LiveForestEnvironmentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const skin = ENVIRONMENT_SKINS[skinId] || ENVIRONMENT_SKINS['bioluminescent-forest']

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Create floating bioluminescent forest fireflies, embers, and cosmic vortex particles
    const particleCount = intensity === 'match' ? 95 : 75
    const particles: SporeParticle[] = Array.from({ length: particleCount }, (_, i) => {
      const cx = width / 2
      const cy = height / 2
      const angle = Math.random() * Math.PI * 2
      const dist = 70 + Math.random() * Math.max(width, height) * 0.55
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.1 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.25 - Math.random() * 0.55,
        alpha: 0.25 + Math.random() * 0.7,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        isPrimaryColor: i % 3 !== 0,
        isVortexBound: i < 24,
        angle,
        dist: Math.min(dist, Math.hypot(cx, cy)),
      }
    })

    // Volumetric drifting forest fog clouds
    const mists: MistLayer[] = Array.from({ length: 6 }, (_, i) => ({
      x: (width / 6) * i,
      y: height * (0.25 + (i % 3) * 0.25),
      width: width * 0.55,
      height: height * 0.32,
      speed: (i % 2 === 0 ? 1 : -1) * (0.18 + Math.random() * 0.16),
      alpha: 0.06 + Math.random() * 0.06,
    }))

    let tick = 0

    const render = () => {
      tick += 1
      ctx.clearRect(0, 0, width, height)

      // 1. Subtle canopy crepuscular god-rays
      const rayGrad1 = ctx.createLinearGradient(0, 0, width * 0.45, height * 0.75)
      rayGrad1.addColorStop(0, `${skin.sporeColor1}14`)
      rayGrad1.addColorStop(0.5, `${skin.sporeColor2}08`)
      rayGrad1.addColorStop(1, 'transparent')
      ctx.fillStyle = rayGrad1
      ctx.fillRect(0, 0, width, height)

      // 2. Drifting mysterious forest mist banks
      for (const mist of mists) {
        mist.x += mist.speed
        if (mist.x > width + mist.width * 0.5) mist.x = -mist.width * 0.5
        if (mist.x < -mist.width * 0.5) mist.x = width + mist.width * 0.5

        const radial = ctx.createRadialGradient(
          mist.x,
          mist.y,
          10,
          mist.x,
          mist.y,
          mist.width * 0.5
        )
        radial.addColorStop(0, skin.fogTint)
        radial.addColorStop(1, 'transparent')
        ctx.fillStyle = radial
        ctx.beginPath()
        ctx.arc(mist.x, mist.y, mist.width * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }

      const centerX = width / 2
      const centerY = height / 2

      // 3. Fireflies, glowing mushroom spores & singularity-bound dust
      for (const p of particles) {
        const pulse = 0.5 + 0.5 * Math.sin(tick * p.pulseSpeed + p.pulseOffset)
        const currentAlpha = p.alpha * (0.4 + 0.6 * pulse)
        const color = p.isPrimaryColor ? skin.sporeColor1 : skin.sporeColor2

        if (p.isVortexBound) {
          // Orbiting gently around the center Black Hole
          p.angle += 0.0045 + (140 / Math.max(80, p.dist)) * 0.004
          p.dist -= 0.18
          if (p.dist < 28) {
            p.dist = 180 + Math.random() * 220
          }
          p.x = centerX + Math.cos(p.angle) * p.dist
          p.y = centerY + Math.sin(p.angle) * p.dist * 0.85
        } else {
          // Rising and swaying through the ancient forest
          p.x += p.vx + Math.sin(tick * 0.012 + p.pulseOffset) * 0.28
          p.y += p.vy

          if (p.y < -20) {
            p.y = height + 15
            p.x = Math.random() * width
          }
          if (p.x < -20) p.x = width + 15
          if (p.x > width + 20) p.x = -15
        }

        // Outer bioluminescent halo
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4.5)
        glow.addColorStop(0, color)
        glow.addColorStop(0.4, `${color}66`)
        glow.addColorStop(1, 'transparent')

        ctx.globalAlpha = currentAlpha
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 4.5, 0, Math.PI * 2)
        ctx.fill()

        // Bright core
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [skin, intensity])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Live breathing forest scenery backdrop from the attached reference */}
      <div
        className="absolute inset-[-4%] bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url('/images/forest-arena.jpg')`,
          filter:
            skinId === 'eclipse-singularity'
              ? 'brightness(0.45) contrast(1.18) saturate(1.25) hue-rotate(25deg)'
              : skinId === 'blood-moon-altar'
                ? 'brightness(0.42) contrast(1.22) saturate(1.3) hue-rotate(-30deg)'
                : 'brightness(0.5) contrast(1.15) saturate(1.18)',
          animation: 'pulse-aura 18s ease-in-out infinite',
        }}
      />

      {/* Deep cinematic vignette & atmospheric forest shadows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(4, 6, 10, 0.25) 0%, rgba(3, 5, 8, 0.72) 68%, rgba(2, 3, 5, 0.95) 100%)',
        }}
      />

      {/* Real-time 60fps Canvas for mist, fireflies, glowing spores, and Black Hole dust */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
