'use client'

import React from 'react'
import {
  DiceSkinId,
  FACTIONS,
  PieceInstance,
  PieceSkinId,
  PlayerCountOption,
  PlayerState,
  SCULPTED_PIECES,
} from '@/lib/game-types'
import { canPieceMove } from '@/lib/ludo-engine'
import { RoyalCarvedDice } from './royal-carved-dice'
import { SculptedChessPiece3D } from './sculpted-chess-piece-3d'

interface PlayerSideStationProps {
  player: PlayerState
  compassSide: 'NW' | 'N' | 'NE' | 'SW' | 'S' | 'SE'
  isCurrentTurn: boolean
  diceValue: number
  isRolling: boolean
  hasRolled: boolean
  canRoll: boolean
  onRollDice: () => void
  onMovePiece: (piece: PieceInstance) => void
  diceSkinId: DiceSkinId
  pieceSkinId: PieceSkinId
  playerCount: PlayerCountOption
  requiredToWin: number
  rotateForTabletop?: boolean
  compact?: boolean
}

const COMPASS_LABELS: Record<'NW' | 'N' | 'NE' | 'SW' | 'S' | 'SE', string> = {
  NW: 'NORTH-WEST',
  N: 'NORTH',
  NE: 'NORTH-EAST',
  SW: 'SOUTH-WEST',
  S: 'SOUTH',
  SE: 'SOUTH-EAST',
}

export function PlayerSideStation({
  player,
  compassSide,
  isCurrentTurn,
  diceValue,
  isRolling,
  hasRolled,
  canRoll,
  onRollDice,
  onMovePiece,
  diceSkinId,
  pieceSkinId,
  playerCount,
  requiredToWin,
  rotateForTabletop = false,
  compact = false,
}: PlayerSideStationProps) {
  const faction = FACTIONS[player.faction]
  const isRightAligned = compassSide === 'NE' || compassSide === 'SE'

  return (
    <div
      style={{
        borderColor: isCurrentTurn ? '#fef08a' : `${faction.primaryHex}66`,
        background: isCurrentTurn
          ? `linear-gradient(135deg, ${faction.secondaryHex}f2 0%, rgba(10, 13, 22, 0.96) 100%)`
          : 'rgba(8, 11, 18, 0.88)',
        boxShadow: isCurrentTurn
          ? `0 0 24px ${faction.primaryHex}77, inset 0 0 16px ${faction.primaryHex}44`
          : '0 8px 20px rgba(0,0,0,0.8)',
      }}
      className={`relative rounded-xl border-2 p-1.5 sm:p-2.5 transition-all duration-300 flex items-center gap-2 sm:gap-3 ${
        isRightAligned ? 'flex-row-reverse text-right' : 'flex-row text-left'
      } ${rotateForTabletop ? 'rotate-180' : ''} ${
        isCurrentTurn ? 'scale-[1.02] z-20' : 'opacity-85 hover:opacity-100'
      }`}
    >
      {/* PLAYER SIDE DICE COMPARTMENT — Active Royal Carved Dice on this player's side when it's their turn! */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl p-1 sm:p-1.5 border shrink-0 transition-all ${
          isCurrentTurn
            ? 'bg-black/80 border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
            : 'bg-black/45 border-white/10'
        }`}
      >
        {isCurrentTurn ? (
          <RoyalCarvedDice
            value={diceValue}
            isRolling={isRolling}
            canRoll={canRoll}
            onRoll={onRollDice}
            skinId={diceSkinId}
            activeFactionColor={faction.primaryHex}
            size={compact ? 'xs' : 'sm'}
            showLabel={!compact}
          />
        ) : (
          /* Resting Side Dice Slot when waiting for turn */
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg border border-white/10 bg-black/60 flex flex-col items-center justify-center opacity-45">
            <div
              className="w-3.5 h-3.5 rounded-sm rotate-45 border"
              style={{
                borderColor: faction.primaryHex,
                backgroundColor: `${faction.secondaryHex}`,
              }}
            />
            <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400 mt-1">
              {compassSide}
            </span>
          </div>
        )}
      </div>

      {/* PLAYER INFO & 4 SCULPTED 3D CHESS RELICS DOCK */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Top Row: Compass Side + Name + Ring Score */}
        <div
          className={`flex items-center justify-between gap-1 mb-1 ${
            isRightAligned ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 min-w-0 ${
              isRightAligned ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <span
              className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: isCurrentTurn
                  ? '#fef08a'
                  : `${faction.primaryHex}33`,
                color: isCurrentTurn ? '#000000' : '#fef08a',
              }}
              title={COMPASS_LABELS[compassSide]}
            >
              {compassSide}
            </span>
            <span className="font-display font-bold text-[10px] sm:text-xs text-white truncate">
              {player.name}
            </span>
          </div>

          <span className="text-[8px] sm:text-[10px] font-mono font-bold text-amber-300 shrink-0 px-1 sm:px-1.5 py-0.5 rounded bg-black/60 border border-amber-500/30">
            {player.finishedCount}/{requiredToWin}
            {!compact && <span className="hidden md:inline"> RING</span>}
          </span>
        </div>

        {/* Turn Status Banner or 4 Mini 3D Sculpted Chess Pieces */}
        <div className="grid grid-cols-4 gap-1">
          {player.pieces.map((pc) => {
            const sculpt = SCULPTED_PIECES[pc.sculptIndex]
            const movable =
              isCurrentTurn &&
              hasRolled &&
              !player.isAI &&
              canPieceMove(pc, diceValue, playerCount)
            const inHole = pc.isFinished
            const inBase = pc.stepsMoved === -1

            return (
              <button
                key={pc.id}
                type="button"
                disabled={!movable}
                onClick={() => {
                  if (movable) onMovePiece(pc)
                }}
                title={`${sculpt.name} (${inHole ? 'Ascended into Black Hole' : inBase ? 'In Sanctuary' : 'On Track'})`}
                className={`relative rounded-lg p-0.5 sm:p-1 border flex flex-col items-center justify-center transition-all ${
                  movable
                    ? 'bg-amber-400/25 border-amber-300 cursor-pointer scale-105 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse'
                    : inHole
                      ? 'bg-purple-950/80 border-amber-400/60 opacity-90 cursor-default'
                      : inBase
                        ? 'bg-black/55 border-white/10 opacity-65 cursor-default'
                        : 'bg-black/80 border-amber-500/35 cursor-default'
                }`}
              >
                <div className="w-4 h-5 sm:w-5 sm:h-6">
                  <SculptedChessPiece3D
                    sculptType={pc.sculptType}
                    faction={pc.faction}
                    skinId={pieceSkinId}
                    isGlowing={movable}
                  />
                </div>
                <span className="text-[7px] font-display font-bold tracking-tighter text-amber-100 uppercase leading-none mt-0.5">
                  {inHole ? 'RING' : sculpt.shortLabel.slice(0, 3)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Turn Action Prompt inside the player's own side station */}
        {isCurrentTurn && (
          <div
            className={`mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] font-display font-bold uppercase tracking-wider ${
              isRightAligned ? 'justify-end' : 'justify-start'
            }`}
          >
            {player.isAI ? (
              <span className="text-amber-300 animate-pulse">
                {isRolling
                  ? `ROLLING DICE ON ${compassSide} SIDE...`
                  : `AI COMMANDING (${diceValue})...`}
              </span>
            ) : !hasRolled ? (
              <span className="text-amber-300 animate-pulse">
                {isRolling
                  ? 'ROLLING ROYAL DICE...'
                  : `YOUR TURN (${compassSide}) — TAP DICE TO ROLL`}
              </span>
            ) : (
              <span className="text-emerald-300">
                ROLLED {diceValue} — TAP GLOWING 3D PIECE TO MOVE
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
