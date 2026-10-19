'use client'

import React from 'react'
import { DICE_SKINS, DiceSkinId } from '@/lib/game-types'

interface RoyalCarvedDiceProps {
  value: number
  isRolling: boolean
  canRoll: boolean
  onRoll: () => void
  skinId: DiceSkinId
  activeFactionColor: string
  size?: 'sm' | 'md' | 'lg'
}

// Pip positions on a 3x3 grid for faces 1..6
const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function RoyalCarvedDice({
  value,
  isRolling,
  canRoll,
  onRoll,
  skinId,
  activeFactionColor,
  size = 'md',
}: RoyalCarvedDiceProps) {
  const skin = DICE_SKINS[skinId] || DICE_SKINS['ruby-diamond']
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[6]

  const dimensions =
    size === 'lg'
      ? 'w-24 h-24'
      : size === 'sm'
        ? 'w-14 h-14'
        : 'w-20 h-20'

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Active turn pulsing halo beneath the Royal Dice */}
      {canRoll && (
        <div
          className="absolute -inset-3 rounded-3xl blur-md animate-pulse-aura pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${activeFactionColor}88 0%, transparent 72%)`,
          }}
        />
      )}

      <button
        type="button"
        disabled={!canRoll || isRolling}
        onClick={onRoll}
        aria-label={`Roll Royal Dice, current value ${value}`}
        className={`relative ${dimensions} rounded-[26%] p-1.5 transition-all duration-300 ${
          canRoll
            ? 'cursor-pointer hover:scale-105 active:scale-95'
            : 'cursor-not-allowed opacity-80'
        } ${isRolling ? 'animate-spin' : ''}`}
        style={{
          background: skin.frameGradient,
          boxShadow: canRoll
            ? `0 12px 30px rgba(0,0,0,0.85), 0 0 22px ${activeFactionColor}66, inset 0 2px 3px rgba(255,255,255,0.65)`
            : '0 10px 25px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.4)',
        }}
      >
        {/* Ornate Filigree Corner Scrollwork SVG Overlay */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        >
          {/* Outer carved gold ring */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="none"
            stroke="rgba(255, 248, 210, 0.55)"
            strokeWidth="1.5"
          />
          {/* Corner baroque flourishes */}
          <path
            d="M16,8 C10,10 10,16 8,22 M84,8 C90,10 90,16 92,22 M16,92 C10,90 10,84 8,78 M84,92 C90,90 90,84 92,78"
            stroke="rgba(255, 240, 170, 0.8)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="14" cy="14" r="2.2" fill="#fef08a" />
          <circle cx="86" cy="14" r="2.2" fill="#fef08a" />
          <circle cx="14" cy="86" r="2.2" fill="#fef08a" />
          <circle cx="86" cy="86" r="2.2" fill="#fef08a" />
        </svg>

        {/* Recessed Circular Enamel Core with Diamond Pips (matching the reference photo) */}
        <div
          className="relative w-full h-full rounded-full p-2.5 grid grid-cols-3 grid-rows-3 gap-1 items-center justify-items-center border border-amber-200/40"
          style={{
            background: skin.coreBg,
            boxShadow:
              'inset 0 4px 10px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.35)',
          }}
        >
          {Array.from({ length: 9 }).map((_, idx) => {
            const hasPip = pips.includes(idx)
            return (
              <div
                key={idx}
                className="w-full h-full flex items-center justify-center"
              >
                {hasPip && (
                  <div
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full relative flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${skin.pipColor} 55%, #b45309 100%)`,
                      boxShadow: `0 0 8px ${skin.pipGlow}, inset 0 0 2px #ffffff`,
                      border: '1px solid rgba(253, 224, 71, 0.85)',
                    }}
                  >
                    {/* Faceted diamond glint */}
                    <div className="w-1 h-1 rotate-45 bg-white rounded-[1px]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </button>

      {canRoll && !isRolling && (
        <span className="mt-1.5 text-[10px] font-display tracking-[0.2em] uppercase text-amber-300 font-semibold animate-pulse">
          TAP TO ROLL
        </span>
      )}
    </div>
  )
}
