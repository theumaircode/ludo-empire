'use client'

import React from 'react'
import { FACTIONS, PieceInstance, SCULPTED_PIECES } from '@/lib/game-types'

interface BlackHoleSingularityProps {
  absorbedPieces: PieceInstance[]
  recentAbsorbedPiece?: PieceInstance | null
  size?: 'board' | 'showcase'
}

export function BlackHoleSingularity({
  absorbedPieces,
  recentAbsorbedPiece,
  size = 'board',
}: BlackHoleSingularityProps) {
  const isBoard = size === 'board'

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none pointer-events-none"
      style={{ perspective: '700px' }}
    >
      {/* Outer Gravitational Lensing Shockwave Ring */}
      <div
        className="absolute inset-[-12%] rounded-full animate-pulse-aura"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.38) 0%, rgba(168,85,247,0.42) 48%, rgba(234,88,12,0.18) 68%, transparent 76%)',
        }}
      />

      {/* Blazing Outer Golden-Fire Accretion Ring (matches forest-arena.jpg center vortex) */}
      <div
        className="absolute inset-[-4%] rounded-full animate-spin-slow"
        style={{
          background:
            'conic-gradient(from 0deg, #f59e0b, #a855f7, #ec4899, #eab308, #7c3aed, #f97316, #f59e0b)',
          filter: 'blur(3px)',
          boxShadow:
            '0 0 28px rgba(245, 158, 11, 0.75), inset 0 0 18px rgba(168, 85, 247, 0.85)',
        }}
      />

      {/* Counter-rotating Relativistic Spiral Nebula Disk */}
      <div
        className="absolute inset-[5%] rounded-full animate-spin-reverse-slow overflow-hidden"
        style={{
          background:
            'radial-gradient(circle, #000000 28%, #3b0764 52%, #7e22ce 68%, #f59e0b 88%, #fef08a 100%)',
          boxShadow: 'inset 0 0 24px #000000',
        }}
      >
        {/* Spiral arms SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-75">
          <defs>
            <radialGradient id="spiralGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="45%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M50,50 C68,32 86,46 78,68 C70,88 40,92 24,74 C10,58 18,26 42,16 C64,8 88,24 90,48"
            fill="none"
            stroke="url(#spiralGlow)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M50,50 C32,68 14,54 22,32 C30,12 60,8 76,26 C90,42 82,74 58,84"
            fill="none"
            stroke="#fde047"
            strokeWidth="1.8"
            strokeOpacity="0.55"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Pitch-Black Event Horizon Singularity Core */}
      <div
        className="relative w-[54%] h-[54%] rounded-full bg-black flex items-center justify-center"
        style={{
          boxShadow:
            '0 0 22px 6px #000000, 0 0 35px 10px rgba(168, 85, 247, 0.65), inset 0 0 20px rgba(192, 132, 252, 0.45)',
          border: '1.5px solid rgba(253, 224, 71, 0.6)',
        }}
      >
        {/* THE MYSTERIOUS UNIVERSE RULING / CONTROL RING FLOATING IN THE MIDDLE */}
        <div className="relative w-[78%] h-[78%] flex items-center justify-center animate-float-ring">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(250,204,21,0.95)]"
          >
            <defs>
              <linearGradient id="universeRingGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="22%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="78%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Outer Sovereign Control Ring Band */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="url(#universeRingGold)"
              strokeWidth="9"
            />
            {/* Inner Cosmic Rune Engraving Ring */}
            <circle
              cx="50"
              cy="50"
              r="31"
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Crown Jewel of the Universe Ring */}
            <polygon
              points="50,4 56,13 50,20 44,13"
              fill="#38bdf8"
              stroke="#fef08a"
              strokeWidth="1.5"
            />
            <circle cx="12" cy="50" r="3.5" fill="#ec4899" stroke="#fef08a" strokeWidth="1" />
            <circle cx="88" cy="50" r="3.5" fill="#10b981" stroke="#fef08a" strokeWidth="1" />
            <circle cx="50" cy="88" r="3.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
          </svg>
        </div>

        {/* Center Singularity Core Spark */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-amber-200"
          style={{
            boxShadow: '0 0 14px 4px #f59e0b, 0 0 24px 8px #a855f7',
          }}
        />
      </div>

      {/* Orbiting Micro-Sigils of Pieces that have already Ascended into the Black Hole */}
      {isBoard && absorbedPieces.length > 0 && (
        <div className="absolute inset-0 animate-spin-slow">
          {absorbedPieces.map((p, i) => {
            const angle = (i / absorbedPieces.length) * Math.PI * 2
            const r = 42
            const x = 50 + Math.cos(angle) * r
            const y = 50 + Math.sin(angle) * r
            const faction = FACTIONS[p.faction]
            return (
              <div
                key={p.id}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: faction.primaryHex,
                  boxShadow: `0 0 8px ${faction.glowHex}`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-amber-200"
              />
            )
          })}
        </div>
      )}

      {/* Dramatic Cinematic Animation when a Piece Reaches the Black Hole & Vanishes into it! */}
      {recentAbsorbedPiece && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-300 animate-black-hole-suck">
            <img
              src={
                SCULPTED_PIECES.find((s) => s.id === recentAbsorbedPiece.sculptType)
                  ?.image || '/images/piece-crown.jpg'
              }
              alt="Piece vanishing into Black Hole"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}
