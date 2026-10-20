'use client'

import React from 'react'
import {
  BOARD_SKINS,
  BoardSkinId,
  FACTIONS,
  FactionId,
  PieceInstance,
  PieceSkinId,
  PlayerCountOption,
  PlayerState,
  SCULPTED_PIECES,
} from '@/lib/game-types'
import {
  BASE_PEDESTALS_6P_COORDS,
  canPieceMove,
  getCornerForPlayer,
  getPieceBoardCoord,
  HOME_STRETCH_4P_RC,
  HOME_STRETCH_6P_COORDS,
  OUTER_TRACK_4P_RC,
  OUTER_TRACK_6P_COORDS,
  SAFE_INDICES_4P,
  SAFE_INDICES_6P,
} from '@/lib/ludo-engine'
import { BlackHoleSingularity } from './black-hole-singularity'
import { SculptedPieceToken } from './sculpted-piece-token'
import { SculptedChessPiece3D } from './sculpted-chess-piece-3d'

interface LudoEmpireBoardProps {
  players: PlayerState[]
  playerCount: PlayerCountOption
  currentPlayerIndex: number
  diceValue: number | null
  hasRolled: boolean
  onSelectPiece: (piece: PieceInstance) => void
  boardSkinId: BoardSkinId
  pieceSkinId: PieceSkinId
  recentAbsorbedPiece: PieceInstance | null
  selectedPieceId?: string | null
}

const ANCIENT_RUNES = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'I',
  'V',
  'X',
  'M',
]

export function LudoEmpireBoard({
  players,
  playerCount,
  currentPlayerIndex,
  diceValue,
  hasRolled,
  onSelectPiece,
  boardSkinId,
  pieceSkinId,
  recentAbsorbedPiece,
  selectedPieceId,
}: LudoEmpireBoardProps) {
  const boardSkin = BOARD_SKINS[boardSkinId] || BOARD_SKINS.eldergrove
  const currentPlayer = players[currentPlayerIndex]

  const absorbedPieces = players.flatMap((p) =>
    p.pieces.filter((piece) => piece.isFinished)
  )

  const activePieces = players.flatMap((p) =>
    p.pieces.filter((piece) => !piece.isFinished)
  )

  const coordGroups = new Map<string, PieceInstance[]>()
  for (const piece of activePieces) {
    const c = getPieceBoardCoord(piece, playerCount)
    const key = `${Math.round(c.x * 10)}_${Math.round(c.y * 10)}`
    const list = coordGroups.get(key) || []
    list.push(piece)
    coordGroups.set(key, list)
  }

  const cornerFactions: Record<number, FactionId> = {
    0: 'crimson',
    1: 'emerald',
    2: 'sapphire',
    3: 'gold',
  }
  if (playerCount === 2) {
    cornerFactions[0] = players[0]?.faction || 'crimson'
    cornerFactions[2] = players[1]?.faction || 'gold'
  }

  return (
    <div className="relative w-full aspect-square mx-auto select-none">
      {/* Outer Ancient Carved Rune Stone Altar Base */}
      <div
        className="relative w-full h-full rounded-2xl p-2.5 sm:p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-2"
        style={{
          background: boardSkin.stoneBorder,
          borderColor: boardSkin.goldTrim,
        }}
      >
        {/* Glowing Futhark Runes along the Stone Altar Rim */}
        <div className="absolute inset-x-6 top-0.5 flex justify-between pointer-events-none opacity-80">
          {ANCIENT_RUNES.slice(0, 8).map((rune, i) => (
            <span
              key={i}
              className="text-[9px] sm:text-[11px] font-mono font-bold animate-pulse"
              style={{
                color: boardSkin.runeColor,
                textShadow: `0 0 8px ${boardSkin.runeColor}`,
              }}
            >
              {rune}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-0.5 flex justify-between pointer-events-none opacity-80">
          {ANCIENT_RUNES.slice(8, 16).map((rune, i) => (
            <span
              key={i}
              className="text-[9px] sm:text-[11px] font-mono font-bold animate-pulse"
              style={{
                color: boardSkin.runeColor,
                textShadow: `0 0 8px ${boardSkin.runeColor}`,
              }}
            >
              {rune}
            </span>
          ))}
        </div>

        {/* Main Carved Board Surface */}
        <div
          className="relative w-full h-full rounded-xl overflow-hidden border-2"
          style={{
            background: boardSkin.woodGradient,
            borderColor: boardSkin.goldTrim,
            boxShadow:
              'inset 0 0 50px rgba(0,0,0,0.85), 0 4px 20px rgba(0,0,0,0.9)',
          }}
        >
          {/* Engraved Filigree Scrollwork SVG Background */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={boardSkin.goldTrim}
              strokeWidth="0.4"
              strokeDasharray="1.5 1"
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke={boardSkin.goldTrim}
              strokeWidth="0.35"
            />
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke={boardSkin.goldTrim}
              strokeWidth="0.25"
            />
            <line
              x1="100"
              y1="0"
              x2="0"
              y2="100"
              stroke={boardSkin.goldTrim}
              strokeWidth="0.25"
            />
          </svg>

          {/* 4-ARM IMPERIAL ALTAR BOARD (FOR 2 PLAYERS & 4 PLAYERS) */}
          {playerCount !== 6 && (
            <>
              {OUTER_TRACK_4P_RC.map(([r, c], idx) => {
                const isSafe = SAFE_INDICES_4P.has(idx)
                const isStart0 = idx === 0
                const isStart1 = idx === 13
                const isStart2 = idx === 26
                const isStart3 = idx === 39
                const startFaction = isStart0
                  ? FACTIONS[cornerFactions[0]]
                  : isStart1
                    ? FACTIONS[cornerFactions[1]]
                    : isStart2
                      ? FACTIONS[cornerFactions[2]]
                      : isStart3
                        ? FACTIONS[cornerFactions[3]]
                        : null

                return (
                  <div
                    key={`outer-${idx}`}
                    style={{
                      left: `${(c / 15) * 100}%`,
                      top: `${(r / 15) * 100}%`,
                      width: `${100 / 15}%`,
                      height: `${100 / 15}%`,
                      backgroundColor: startFaction
                        ? `${startFaction.primaryHex}55`
                        : boardSkin.tileBase,
                      borderColor: boardSkin.tileBorder,
                    }}
                    className="absolute border flex items-center justify-center"
                  >
                    {isSafe ? (
                      <div
                        className="w-2.5 h-2.5 rotate-45 border"
                        style={{
                          backgroundColor: startFaction
                            ? '#ffffff'
                            : boardSkin.runeColor,
                          borderColor: '#fef08a',
                          boxShadow: `0 0 8px ${boardSkin.runeColor}`,
                        }}
                      />
                    ) : (
                      <span
                        className="text-[7px] sm:text-[8px] opacity-40 font-display font-bold"
                        style={{ color: boardSkin.runeColor }}
                      >
                        {ANCIENT_RUNES[idx % ANCIENT_RUNES.length]}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* 4 Glowing Home Stretch Lanes leading into the Black Hole */}
              {[0, 1, 2, 3].map((cornerIdx) => {
                const faction = FACTIONS[cornerFactions[cornerIdx]]
                const cells = HOME_STRETCH_4P_RC[cornerIdx]
                return cells.map(([r, c], stepIdx) => (
                  <div
                    key={`home-${cornerIdx}-${stepIdx}`}
                    style={{
                      left: `${(c / 15) * 100}%`,
                      top: `${(r / 15) * 100}%`,
                      width: `${100 / 15}%`,
                      height: `${100 / 15}%`,
                      background: `radial-gradient(circle, ${faction.primaryHex}88 0%, ${faction.secondaryHex}cc 100%)`,
                      borderColor: boardSkin.goldTrim,
                    }}
                    className="absolute border flex items-center justify-center"
                  >
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/50"
                      style={{
                        backgroundColor: faction.primaryHex,
                        boxShadow: `0 0 8px ${faction.glowHex}`,
                      }}
                    />
                  </div>
                ))
              })}

              {/* 4 Raised Jeweled Corner Sanctuaries */}
              {[0, 1, 2, 3].map((cornerIdx) => {
                const faction = FACTIONS[cornerFactions[cornerIdx]]
                const topRow = cornerIdx === 1 || cornerIdx === 2 ? 0 : 9
                const leftCol = cornerIdx === 0 || cornerIdx === 1 ? 0 : 9
                const matchingPlayer = players.find(
                  (p) =>
                    getCornerForPlayer(p.index, playerCount) === cornerIdx
                )
                const isCurrentTurn =
                  matchingPlayer && matchingPlayer.index === currentPlayerIndex

                return (
                  <div
                    key={`sanctuary-${cornerIdx}`}
                    style={{
                      left: `${(leftCol / 15) * 100}%`,
                      top: `${(topRow / 15) * 100}%`,
                      width: `${(6 / 15) * 100}%`,
                      height: `${(6 / 15) * 100}%`,
                      background: `linear-gradient(145deg, ${faction.secondaryHex}ee 0%, #090b10 100%)`,
                      borderColor: isCurrentTurn
                        ? '#fef08a'
                        : boardSkin.goldTrim,
                      boxShadow: isCurrentTurn
                        ? `inset 0 0 25px ${faction.primaryHex}88, 0 0 22px ${faction.glowHex}66`
                        : 'inset 0 0 20px rgba(0,0,0,0.85)',
                    }}
                    className="absolute p-2 sm:p-3 border-2 rounded-lg flex flex-col justify-between transition-all duration-300"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] sm:text-[10px] font-display font-bold tracking-wider uppercase text-amber-100 truncate">
                        {matchingPlayer ? matchingPlayer.name : faction.shortName}
                      </span>
                      {matchingPlayer && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-400/30">
                          {matchingPlayer.finishedCount}/4
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 grid-rows-2 gap-1 sm:gap-2 flex-1 my-0.5">
                      {SCULPTED_PIECES.map((sculpt) => (
                        <div
                          key={sculpt.id}
                          className="rounded-lg border flex flex-col items-center justify-end p-0.5 sm:p-1 relative overflow-hidden"
                          style={{
                            borderColor: `${boardSkin.goldTrim}88`,
                            background:
                              'radial-gradient(circle, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.88) 100%)',
                          }}
                        >
                          <div className="w-5 h-6 sm:w-6 sm:h-7 opacity-20 pointer-events-none">
                            <SculptedChessPiece3D
                              sculptType={sculpt.id}
                              faction={cornerFactions[cornerIdx]}
                              skinId={pieceSkinId}
                            />
                          </div>
                          <span className="text-[6px] sm:text-[7.5px] font-display tracking-widest text-amber-200/60 uppercase leading-none">
                            {sculpt.shortLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* 6-PLAYER HEXAGONAL IMPERIAL ALTAR BOARD */}
          {playerCount === 6 && (
            <>
              {OUTER_TRACK_6P_COORDS.map((coord, idx) => {
                const isSafe = SAFE_INDICES_6P.has(idx)
                const isStart = idx % 8 === 0
                const sectorPlayer = players[Math.floor(idx / 8)]
                const faction = sectorPlayer
                  ? FACTIONS[sectorPlayer.faction]
                  : null

                return (
                  <div
                    key={`hex-outer-${idx}`}
                    style={{
                      left: `${coord.x}%`,
                      top: `${coord.y}%`,
                      backgroundColor:
                        isStart && faction
                          ? `${faction.primaryHex}88`
                          : boardSkin.tileBase,
                      borderColor: isSafe
                        ? '#fde047'
                        : boardSkin.tileBorder,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[5.2%] h-[5.2%] rounded-md border flex items-center justify-center"
                  >
                    {isSafe ? (
                      <div
                        className="w-2 h-2 rotate-45"
                        style={{
                          backgroundColor: '#fef08a',
                          boxShadow: '0 0 6px #fef08a',
                        }}
                      />
                    ) : (
                      <div
                        className="w-1 h-1 rounded-full opacity-50"
                        style={{ backgroundColor: boardSkin.runeColor }}
                      />
                    )}
                  </div>
                )
              })}

              {players.map((p) => {
                const faction = FACTIONS[p.faction]
                const coords = HOME_STRETCH_6P_COORDS[p.index] || []
                return coords.map((c, sIdx) => (
                  <div
                    key={`hex-home-${p.index}-${sIdx}`}
                    style={{
                      left: `${c.x}%`,
                      top: `${c.y}%`,
                      backgroundColor: faction.primaryHex,
                      borderColor: '#fef08a',
                      boxShadow: `0 0 10px ${faction.glowHex}`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[4.6%] h-[4.6%] rounded-full border"
                  />
                ))
              })}

              {players.map((p) => {
                const faction = FACTIONS[p.faction]
                const pedestals = BASE_PEDESTALS_6P_COORDS[p.index] || []
                return pedestals.map((ped, sIdx) => (
                  <div
                    key={`hex-base-${p.index}-${sIdx}`}
                    style={{
                      left: `${ped.x}%`,
                      top: `${ped.y}%`,
                      backgroundColor: `${faction.secondaryHex}dd`,
                      borderColor:
                        p.index === currentPlayerIndex
                          ? '#fef08a'
                          : faction.primaryHex,
                      boxShadow: `inset 0 0 8px ${faction.primaryHex}`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-[5.5%] h-[5.5%] rounded-full border-2 flex items-center justify-center"
                  >
                    <span className="text-[6px] font-display text-white/60">
                      {SCULPTED_PIECES[sIdx].shortLabel[0]}
                    </span>
                  </div>
                ))
              })}
            </>
          )}

          {/* CENTER BLACK HOLE & FLOATING UNIVERSE RULING RING */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              width: playerCount === 6 ? '23%' : '26%',
              height: playerCount === 6 ? '23%' : '26%',
            }}
          >
            <BlackHoleSingularity
              absorbedPieces={absorbedPieces}
              recentAbsorbedPiece={recentAbsorbedPiece}
              size="board"
            />
          </div>

          {/* ALL ACTIVE 3D SCULPTED PIECES (CROWN, HORSE, ALIEN, HUMAN) */}
          {activePieces.map((piece) => {
            const coord = getPieceBoardCoord(piece, playerCount)
            const key = `${Math.round(coord.x * 10)}_${Math.round(coord.y * 10)}`
            const group = coordGroups.get(key) || [piece]
            const idxInGroup = group.findIndex((p) => p.id === piece.id)

            let dx = 0
            let dy = 0
            if (group.length > 1) {
              const angle = (idxInGroup / group.length) * Math.PI * 2
              dx = Math.cos(angle) * 7
              dy = Math.sin(angle) * 7
            }

            const isMovable =
              hasRolled &&
              diceValue !== null &&
              currentPlayer &&
              !currentPlayer.isAI &&
              piece.playerIndex === currentPlayer.index &&
              canPieceMove(piece, diceValue, playerCount)

            return (
              <div
                key={piece.id}
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                }}
                className="absolute transition-all duration-300 ease-out"
              >
                <SculptedPieceToken
                  piece={piece}
                  isMovable={Boolean(isMovable)}
                  isSelected={selectedPieceId === piece.id}
                  onSelect={onSelectPiece}
                  skinId={pieceSkinId}
                  stackOffset={{ dx, dy, count: group.length }}
                  boardScale={playerCount === 6 ? 'compact' : 'normal'}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
