'use client'

import React from 'react'
import {
  FACTIONS,
  PIECE_SKINS,
  PieceInstance,
  PieceSkinId,
  SCULPTED_PIECES,
} from '@/lib/game-types'

interface SculptedPieceTokenProps {
  piece: PieceInstance
  isMovable: boolean
  isSelected?: boolean
  onSelect: (piece: PieceInstance) => void
  skinId: PieceSkinId
  stackOffset?: { dx: number; dy: number; count: number }
  boardScale?: 'normal' | 'compact'
}

export function SculptedPieceToken({
  piece,
  isMovable,
  isSelected,
  onSelect,
  skinId,
  stackOffset = { dx: 0, dy: 0, count: 1 },
  boardScale = 'normal',
}: SculptedPieceTokenProps) {
  const sculpt =
    SCULPTED_PIECES.find((s) => s.id === piece.sculptType) || SCULPTED_PIECES[0]
  const faction = FACTIONS[piece.faction]
  const skin = PIECE_SKINS[skinId] || PIECE_SKINS['heirloom-gold']

  const sizeClasses =
    boardScale === 'compact'
      ? 'w-6 h-7 sm:w-8 sm:h-9'
      : 'w-7 h-8 sm:w-9 sm:h-11 md:w-10 md:h-12'

  return (
    <button
      type="button"
      disabled={!isMovable}
      onClick={(e) => {
        e.stopPropagation()
        if (isMovable) onSelect(piece)
      }}
      title={`${faction.name} — ${sculpt.name}`}
      style={{
        transform: `translate(calc(-50% + ${stackOffset.dx}px), calc(-62% + ${stackOffset.dy}px))`,
      }}
      className={`group relative ${sizeClasses} flex flex-col items-center justify-end select-none transition-all duration-300 ${
        isMovable
          ? 'cursor-pointer z-30 scale-110 hover:scale-125'
          : 'cursor-default z-20'
      } ${isSelected ? 'scale-125 z-40' : ''}`}
    >
      {/* Floating Target Beacon when this sculpted piece can move */}
      {isMovable && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce">
          <div
            className="w-2.5 h-2.5 rotate-45 border border-white"
            style={{
              backgroundColor: faction.primaryHex,
              boxShadow: `0 0 10px ${faction.glowHex}`,
            }}
          />
        </div>
      )}

      {/* Ground Pulsing Faction Ring when Movable */}
      {isMovable && (
        <div
          className="absolute -bottom-1 w-full h-3.5 rounded-full animate-ping pointer-events-none"
          style={{
            backgroundColor: `${faction.primaryHex}66`,
            border: `1.5px solid ${faction.glowHex}`,
          }}
        />
      )}

      {/* 3D Sculpted Bust / Figurine Body */}
      <div
        className="relative w-full h-[84%] rounded-t-full rounded-b-xl overflow-hidden border-2 transition-transform"
        style={{
          borderColor: isMovable ? '#fef08a' : faction.primaryHex,
          background: skin.rimGradient,
          boxShadow: isMovable
            ? `0 6px 16px rgba(0,0,0,0.9), 0 0 16px ${faction.glowHex}`
            : `0 5px 12px rgba(0,0,0,0.88), 0 0 6px ${faction.primaryHex}88`,
        }}
      >
        {/* Actual Hyper-Realistic 3D Reference Image of the Sculpted Piece */}
        <img
          src={sculpt.image}
          alt={sculpt.name}
          className="w-full h-full object-cover object-top scale-125"
          style={{
            filter: skin.imageFilter,
          }}
        />

        {/* Faction Color Crest Tint Overlay at the bottom of the pedestal */}
        <div
          className="absolute inset-x-0 bottom-0 h-2.5"
          style={{
            background: `linear-gradient(to top, ${faction.primaryHex} 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Heavy Carved Gold & Gemstone Pedestal Base */}
      <div
        className="w-[92%] h-[22%] -mt-1 rounded-full border flex items-center justify-center relative z-10"
        style={{
          background: `linear-gradient(90deg, ${faction.secondaryHex} 0%, ${faction.primaryHex} 50%, ${faction.secondaryHex} 100%)`,
          borderColor: '#fde68a',
          boxShadow: '0 3px 6px rgba(0,0,0,0.95)',
        }}
      >
        <span className="text-[6.5px] sm:text-[7.5px] font-display font-bold tracking-tighter text-white drop-shadow">
          {sculpt.shortLabel[0]}
        </span>
      </div>
    </button>
  )
}
