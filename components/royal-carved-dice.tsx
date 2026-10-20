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
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showLabel?: boolean
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
  showLabel = true,
}: RoyalCarvedDiceProps) {
  const skin = DICE_SKINS[skinId] || DICE_SKINS['ruby-diamond']
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[6]

  const dimensions =
    size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24'
      : size === 'md'
        ? 'w-14 h-14 sm:w-16 sm:h-16'
        : size === 'sm'
          ? 'w-11 h-11 sm:w-13 sm:h-13'
          : 'w-9 h-9 sm:w-11 sm:h-11'

  const pipSize =
    size === 'lg'
      ? 'w-3 h-3 sm:w-3.5 sm:h-3.5'
      : size === 'md'
        ? 'w-2.5 h-2.5 sm:w-3 sm:h-3'
        : 'w-2 h-2 sm:w-2.5 sm:h-2.5'

  return (
    <div className="relative flex flex-col items-center select-none shrink-0">
      {/* Active turn pulsing halo beneath the Royal Dice */}
      {canRoll && (
        <div
          className="absolute -inset-2 rounded-2xl blur-md animate-pulse-aura pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${activeFactionColor}aa 0%, transparent 72%)`,
          }}
        />
      )}

      <button
        type="button"
        disabled={!canRoll || isRolling}
        onClick={onRoll}
        aria-label={`Roll Royal Dice, current value ${value}`}
        className={`relative ${dimensions} rounded-[26%] p-1 sm:p-1.5 transition-all duration-300 ${
          canRoll
            ? 'cursor-pointer hover:scale-108 active:scale-95 ring-2 ring-amber-300/90'
            : 'cursor-default opacity-90'
        } ${isRolling ? 'animate-spin' : ''}`}
        style={{
          background: skin.frameGradient,
          boxShadow: canRoll
            ? `0 8px 22px rgba(0,0,0,0.9), 0 0 18px ${activeFactionColor}88, inset 0 2px 3px rgba(255,255,255,0.65)`
            : '0 6px 14px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255,255,255,0.35)',
        }}
      >
        {/* Ornate Filigree Corner Scrollwork SVG Overlay */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        >
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="none"
            stroke="rgba(255, 248, 210, 0.55)"
            strokeWidth="1.8"
          />
          <path
            d="M16,8 C10,10 10,16 8,22 M84,8 C90,10 90,16 92,22 M16,92 C10,90 10,84 8,78 M84,92 C90,90 90,84 92,78"
            stroke="rgba(255, 240, 170, 0.85)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="14" cy="14" r="2.5" fill="#fef08a" />
          <circle cx="86" cy="14" r="2.5" fill="#fef08a" />
          <circle cx="14" cy="86" r="2.5" fill="#fef08a" />
          <circle cx="86" cy="86" r="2.5" fill="#fef08a" />
        </svg>

        {/* Recessed Circular Enamel Core with Diamond Pips */}
        <div
          className="relative w-full h-full rounded-full p-1.5 sm:p-2 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center border border-amber-200/40"
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
                    className={`${pipSize} rounded-full relative flex items-center justify-center`}
                    style={{
                      background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${skin.pipColor} 55%, #b45309 100%)`,
                      boxShadow: `0 0 6px ${skin.pipGlow}, inset 0 0 2px #ffffff`,
                      border: '1px solid rgba(253, 224, 71, 0.85)',
                    }}
                  >
                    <div className="w-0.5 h-0.5 rotate-45 bg-white rounded-[1px]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </button>

      {showLabel && canRoll && !isRolling && (
        <span className="mt-1 text-[8px] sm:text-[9px] font-display tracking-[0.16em] uppercase text-amber-300 font-bold animate-pulse whitespace-nowrap">
          ROLL DICE
        </span>
      )}
    </div>
  )
}
