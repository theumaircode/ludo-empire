'use client'

import React from 'react'
import {
  FACTIONS,
  PieceInstance,
  PieceSkinId,
  SCULPTED_PIECES,
} from '@/lib/game-types'
import { SculptedChessPiece3D } from './sculpted-chess-piece-3d'

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

  // Standing 3D Chess Piece dimensions (taller than wide, anchored at bottom pedestal)
  const sizeClasses =
    boardScale === 'compact'
      ? 'w-6 h-8 sm:w-8 sm:h-10'
      : 'w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12'

  return (
    <button
      type="button"
      disabled={!isMovable}
      onClick={(e) => {
        e.stopPropagation()
        if (isMovable) onSelect(piece)
      }}
      title={`${faction.name} — ${sculpt.name}`}
      aria-label={`${faction.name} — ${sculpt.name}`}
      style={{
        transform: `translate(calc(-50% + ${stackOffset.dx}px), calc(-66% + ${stackOffset.dy}px))`,
      }}
      className={`group relative ${sizeClasses} flex flex-col items-center justify-end select-none transition-all duration-300 bg-transparent border-0 p-0 ${
        isMovable
          ? 'cursor-pointer z-30 scale-115 hover:scale-130 -translate-y-1'
          : 'cursor-default z-20'
      } ${isSelected ? 'scale-130 z-40' : ''}`}
    >
      {/* Floating Target Gem Beacon above movable 3D piece */}
      {isMovable && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-bounce z-40">
          <div
            className="w-2.5 h-2.5 rotate-45 border border-white"
            style={{
              backgroundColor: faction.primaryHex,
              boxShadow: `0 0 10px ${faction.glowHex}`,
            }}
          />
        </div>
      )}

      {/* Ground Pulsing Faction Ring Beneath the 3D Chess Pedestal when Movable */}
      {isMovable && (
        <div
          className="absolute bottom-0.5 w-[88%] h-3 rounded-full animate-ping pointer-events-none"
          style={{
            backgroundColor: `${faction.primaryHex}77`,
            border: `1.5px solid ${faction.glowHex}`,
          }}
        />
      )}

      {/* Pure 3D Carved Chess-Piece Structure (No Photo Background!) */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <SculptedChessPiece3D
          sculptType={piece.sculptType}
          faction={piece.faction}
          skinId={skinId}
          isGlowing={isMovable}
          className="w-full h-full"
        />
      </div>

      {/* Tiny Stack Count Badge if multiple pieces occupy the same tile */}
      {stackOffset.count > 1 && (
        <span
          className="absolute -right-1 bottom-1 px-1 rounded-full text-[8px] font-mono font-bold text-white border border-amber-300 z-40"
          style={{ backgroundColor: faction.primaryHex }}
        >
          ×{stackOffset.count}
        </span>
      )}
    </button>
  )
}
