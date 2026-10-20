'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bot,
  Clock,
  Coins,
  Compass,
  Maximize2,
  Palette,
  Play,
  RefreshCw,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import {
  BOARD_SKINS,
  BoardSkinId,
  DiceSkinId,
  ENVIRONMENT_SKINS,
  EnvironmentSkinId,
  FACTIONS,
  MatchMode,
  PIECE_SKINS,
  PieceInstance,
  PieceSculptType,
  PieceSkinId,
  PlayerCountOption,
  PlayerState,
  SCULPTED_PIECES,
} from '@/lib/game-types'
import {
  canPieceMove,
  createMatchPlayers,
  getGlobalOuterIndex,
  getGoalSteps,
  SAFE_INDICES_4P,
  SAFE_INDICES_6P,
  selectBestAIMove,
} from '@/lib/ludo-engine'
import { soundEngine } from '@/lib/sound-engine'
import { StudioSplash } from './studio-splash'
import { LiveForestEnvironment } from './live-forest-environment'
import { LudoEmpireBoard } from './ludo-empire-board'
import { RoyalCarvedDice } from './royal-carved-dice'
import { BlackHoleSingularity } from './black-hole-singularity'
import { DailySpinWheel } from './daily-spin-wheel'
import { ArmorySkinsModal } from './armory-skins-modal'
import { VictoryRingModal } from './victory-ring-modal'
import { PlayerSideStation } from './player-side-station'
import { SculptedChessPiece3D } from './sculpted-chess-piece-3d'

export function LudoEmpireApp() {
  // 1. Opening AAA Studio Splash Screen ("THE UMAIR CODE®" on full black)
  const [showSplash, setShowSplash] = useState(true)

  // 2. Navigation & Modals
  const [screen, setScreen] = useState<'lobby' | 'match'>('lobby')
  const [showSpinWheel, setShowSpinWheel] = useState(false)
  const [showArmory, setShowArmory] = useState(false)

  // 3. Economy, Skins & Strict 24-Hour Spin Timestamp
  const [goldBalance, setGoldBalance] = useState(1400)
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([
    'eldergrove',
    'obsidian',
    'heirloom-gold',
    'dark-damascus',
    'ruby-diamond',
    'singularity-void',
    'bioluminescent-forest',
    'eclipse-singularity',
  ])
  const [boardSkin, setBoardSkin] = useState<BoardSkinId>('eldergrove')
  const [pieceSkin, setPieceSkin] = useState<PieceSkinId>('heirloom-gold')
  const [diceSkin, setDiceSkin] = useState<DiceSkinId>('ruby-diamond')
  const [envSkin, setEnvSkin] = useState<EnvironmentSkinId>(
    'bioluminescent-forest'
  )
  const [lastSpinTimestamp, setLastSpinTimestamp] = useState<number | null>(
    null
  )
  const [soundEnabled, setSoundEnabled] = useState(true)

  // 4. Lobby Configuration
  const [playerCount, setPlayerCount] = useState<PlayerCountOption>(4)
  const [matchMode, setMatchMode] = useState<MatchMode>('ai')
  const [inspectedSculpt, setInspectedSculpt] =
    useState<PieceSculptType>('crown')
  const [lobbyPreviewMode, setLobbyPreviewMode] = useState<'3d-model' | 'render'>(
    '3d-model'
  )
  const [roomCode] = useState('849-204')

  // 5. Active Match State & Tabletop Orientation
  const [players, setPlayers] = useState<PlayerState[]>(() =>
    createMatchPlayers(4, 'ai')
  )
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState<number>(6)
  const [isRolling, setIsRolling] = useState(false)
  const [hasRolled, setHasRolled] = useState(false)
  const [tabletopFlipNorth, setTabletopFlipNorth] = useState(false)
  const [combatLog, setCombatLog] = useState<string>(
    'Roll the Royal Dice on your side to command your 3D sculpted pieces toward the Black Hole.'
  )
  const [recentAbsorbedPiece, setRecentAbsorbedPiece] =
    useState<PieceInstance | null>(null)
  const [winner, setWinner] = useState<PlayerState | null>(null)

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    soundEngine.enabled = next
    if (next) soundEngine.playUiClick()
  }

  const toggleFullscreen = () => {
    soundEngine.playUiClick()
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else {
        document.exitFullscreen?.().catch(() => {})
      }
    }
  }

  // Start a new match with selected configuration
  const startMatch = useCallback(
    (count: PlayerCountOption = playerCount, mode: MatchMode = matchMode) => {
      soundEngine.playPieceSpawn()
      const freshPlayers = createMatchPlayers(count, mode)
      setPlayers(freshPlayers)
      setCurrentPlayerIndex(0)
      setDiceValue(6)
      setIsRolling(false)
      setHasRolled(false)
      setWinner(null)
      setRecentAbsorbedPiece(null)
      setCombatLog(
        `Battle commenced (${count} Players). Each player rolls the Royal Dice on their own side!`
      )
      setScreen('match')
    },
    [playerCount, matchMode]
  )

  const advanceToNextPlayer = useCallback((nextIdx: number) => {
    setCurrentPlayerIndex(nextIdx)
    setHasRolled(false)
    setIsRolling(false)
  }, [])

  // Execute a piece movement
  const handleMovePiece = useCallback(
    (pieceToMove: PieceInstance, rolledVal: number) => {
      if (winner) return
      const goalStep = getGoalSteps(playerCount)
      const safeSet = playerCount === 6 ? SAFE_INDICES_6P : SAFE_INDICES_4P
      const requiredToWin = matchMode === 'quick-blitz' ? 2 : 4

      const isDeploying = pieceToMove.stepsMoved === -1
      const targetSteps = isDeploying ? 0 : pieceToMove.stepsMoved + rolledVal
      const reachedBlackHole = targetSteps === goalStep

      if (isDeploying) {
        soundEngine.playPieceSpawn()
      } else if (reachedBlackHole) {
        soundEngine.playBlackHoleAbsorb()
      } else {
        soundEngine.playPieceStep()
      }

      let capturedOpponentName: string | null = null
      let capturedSculptLabel: string | null = null
      let bonusTurn = rolledVal === 6 || reachedBlackHole

      const targetGlobalIdx = getGlobalOuterIndex(
        pieceToMove.playerIndex,
        targetSteps,
        playerCount
      )

      setPlayers((prevPlayers) => {
        const updated = prevPlayers.map((p) => ({
          ...p,
          pieces: p.pieces.map((pc) => ({ ...pc })),
        }))

        const mover = updated[pieceToMove.playerIndex]
        const targetPiece = mover.pieces.find((pc) => pc.id === pieceToMove.id)!

        // Check captures on outer track if not a safe star tile
        if (targetGlobalIdx !== null && !safeSet.has(targetGlobalIdx)) {
          for (const otherPlayer of updated) {
            if (otherPlayer.index === mover.index) continue
            for (const opPiece of otherPlayer.pieces) {
              if (opPiece.isFinished || opPiece.stepsMoved < 0) continue
              const opGlobalIdx = getGlobalOuterIndex(
                opPiece.playerIndex,
                opPiece.stepsMoved,
                playerCount
              )
              if (opGlobalIdx === targetGlobalIdx) {
                opPiece.stepsMoved = -1
                mover.capturesCount += 1
                bonusTurn = true
                capturedOpponentName = otherPlayer.name
                capturedSculptLabel =
                  SCULPTED_PIECES.find((s) => s.id === opPiece.sculptType)
                    ?.name || 'Relic'
                soundEngine.playPieceCapture()
              }
            }
          }
        }

        targetPiece.stepsMoved = targetSteps
        if (reachedBlackHole) {
          targetPiece.isFinished = true
          targetPiece.justFinishedAt = Date.now()
          mover.finishedCount += 1
        }

        if (mover.finishedCount >= requiredToWin) {
          setTimeout(() => {
            soundEngine.playVictoryFanfare()
            setWinner(mover)
            setGoldBalance((g) => g + 500)
          }, 950)
        }

        return updated
      })

      const sculptMeta =
        SCULPTED_PIECES.find((s) => s.id === pieceToMove.sculptType) ||
        SCULPTED_PIECES[0]

      if (reachedBlackHole) {
        setRecentAbsorbedPiece(pieceToMove)
        setTimeout(() => setRecentAbsorbedPiece(null), 1200)
        setCombatLog(
          `${players[pieceToMove.playerIndex]?.name}'s ${sculptMeta.name} vanished into the Black Hole! Bonus Roll!`
        )
      } else if (capturedOpponentName) {
        setCombatLog(
          `${sculptMeta.name} shattered ${capturedOpponentName}'s ${capturedSculptLabel}! Bonus Roll!`
        )
      } else if (isDeploying) {
        setCombatLog(
          `${sculptMeta.name} deployed onto the Ancient Rune Track! Roll again on your side!`
        )
      } else {
        setCombatLog(
          `${sculptMeta.name} advanced ${rolledVal} steps toward the Black Hole.`
        )
      }

      const nextIndex = bonusTurn
        ? pieceToMove.playerIndex
        : (pieceToMove.playerIndex + 1) % players.length

      setTimeout(() => {
        advanceToNextPlayer(nextIndex)
      }, 420)
    },
    [winner, playerCount, matchMode, players, advanceToNextPlayer]
  )

  // Roll the Royal Carved Dice from the active player's side station
  const handleRollDice = useCallback(() => {
    if (isRolling || hasRolled || winner) return
    soundEngine.playDiceRoll()
    setIsRolling(true)

    setTimeout(() => {
      const currentP = players[currentPlayerIndex]
      const allInBase = currentP?.pieces.every(
        (p) => p.stepsMoved === -1 || p.isFinished
      )
      const roll =
        allInBase && Math.random() < 0.38
          ? 6
          : Math.floor(Math.random() * 6) + 1

      if (roll === 6) {
        soundEngine.playDiceSix()
      }
      setDiceValue(roll)
      setIsRolling(false)
      setHasRolled(true)

      const movablePieces = currentP.pieces.filter((p) =>
        canPieceMove(p, roll, playerCount)
      )

      if (movablePieces.length === 0) {
        setCombatLog(
          `${currentP.name} rolled ${roll} — no legal moves available. Passing dice to next side...`
        )
        setTimeout(() => {
          advanceToNextPlayer((currentPlayerIndex + 1) % players.length)
        }, 900)
      } else if (currentP.isAI) {
        const bestPiece = selectBestAIMove(
          currentP,
          players,
          roll,
          playerCount
        )
        if (bestPiece) {
          setTimeout(() => {
            handleMovePiece(bestPiece, roll)
          }, 650)
        }
      } else if (movablePieces.length === 1) {
        setCombatLog(
          `Rolled ${roll}! Advancing ${
            SCULPTED_PIECES.find((s) => s.id === movablePieces[0].sculptType)
              ?.name
          }...`
        )
        setTimeout(() => {
          handleMovePiece(movablePieces[0], roll)
        }, 480)
      } else {
        setCombatLog(
          `Rolled ${roll}! Tap any glowing 3D piece on the board or in your side dock to move.`
        )
      }
    }, 560)
  }, [
    isRolling,
    hasRolled,
    winner,
    players,
    currentPlayerIndex,
    playerCount,
    advanceToNextPlayer,
    handleMovePiece,
  ])

  // Trigger AI turn automatically
  useEffect(() => {
    if (screen !== 'match' || winner || showSplash) return
    const currentP = players[currentPlayerIndex]
    if (currentP && currentP.isAI && !hasRolled && !isRolling) {
      aiTimeoutRef.current = setTimeout(() => {
        handleRollDice()
      }, 750)
    }
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current)
    }
  }, [
    screen,
    winner,
    showSplash,
    players,
    currentPlayerIndex,
    hasRolled,
    isRolling,
    handleRollDice,
  ])

  const handleSelectOrUnlockSkin = (
    category: 'board' | 'piece' | 'dice' | 'env',
    skinId: string,
    cost: number
  ) => {
    soundEngine.playUiClick()
    const alreadyUnlocked = cost === 0 || unlockedSkins.includes(skinId)
    if (!alreadyUnlocked) {
      if (goldBalance < cost) return
      setGoldBalance((prev) => prev - cost)
      setUnlockedSkins((prev) => [...prev, skinId])
    }

    if (category === 'board') setBoardSkin(skinId as BoardSkinId)
    if (category === 'piece') setPieceSkin(skinId as PieceSkinId)
    if (category === 'dice') setDiceSkin(skinId as DiceSkinId)
    if (category === 'env') setEnvSkin(skinId as EnvironmentSkinId)
  }

  const inspectedSculptMeta =
    SCULPTED_PIECES.find((s) => s.id === inspectedSculpt) || SCULPTED_PIECES[0]

  const isSpinReady =
    !lastSpinTimestamp || Date.now() - lastSpinTimestamp >= 24 * 60 * 60 * 1000

  const requiredToWin = matchMode === 'quick-blitz' ? 2 : 4

  // Helper to render a PlayerSideStation for a given player index and compass position
  const renderPlayerStation = (
    pIdx: number,
    compassSide: 'NW' | 'N' | 'NE' | 'SW' | 'S' | 'SE',
    isNorthSide: boolean
  ) => {
    const p = players[pIdx]
    if (!p) return null
    const isTurn = currentPlayerIndex === p.index
    return (
      <PlayerSideStation
        key={`station-${p.index}-${compassSide}`}
        player={p}
        compassSide={compassSide}
        isCurrentTurn={isTurn}
        diceValue={diceValue}
        isRolling={isTurn && isRolling}
        hasRolled={isTurn && hasRolled}
        canRoll={isTurn && !p.isAI && !hasRolled && !winner}
        onRollDice={handleRollDice}
        onMovePiece={(pc) => handleMovePiece(pc, diceValue)}
        diceSkinId={diceSkin}
        pieceSkinId={pieceSkin}
        playerCount={playerCount}
        requiredToWin={requiredToWin}
        rotateForTabletop={isNorthSide && tabletopFlipNorth}
        compact={playerCount === 6}
      />
    )
  }

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. OPENING FULL-BLACK STUDIO SPLASH: ONLY "THE UMAIR CODE®" */}
      {showSplash && <StudioSplash onComplete={() => setShowSplash(false)} />}

      {/* 2. LIVE MOVING MYSTERIOUS FOREST & COSMIC SINGULARITY SURROUNDINGS */}
      <LiveForestEnvironment
        skinId={envSkin}
        intensity={screen === 'match' ? 'match' : 'menu'}
      />

      {/* 3. TOP TACTICAL COMMAND HUD BAR (Responsive for Android Mobile, Tablet & Desktop) */}
      <header className="relative z-20 w-full px-2.5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-b from-black/95 via-black/85 to-transparent border-b border-amber-500/20 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Official Game App Icon & LUDO EMPIRE Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-400 bg-black shadow-[0_0_18px_rgba(245,158,11,0.5)] shrink-0">
              <img
                src="/images/game-icon.jpg"
                alt="LUDO EMPIRE Official App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-xl md:text-2xl tracking-[0.15em] text-amber-100 truncate drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                  LUDO EMPIRE
                </h1>
                <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-display font-bold tracking-widest uppercase rounded bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  SINGULARITY EDITION
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 truncate">
                <span className="text-amber-400/90 font-semibold">
                  {screen === 'match'
                    ? `${playerCount}P SIDE-DICE ARENA`
                    : 'SOVEREIGN TIER I'}
                </span>
                <span>•</span>
                <span className="truncate">{ENVIRONMENT_SKINS[envSkin].name}</span>
              </div>
            </div>
          </div>

          {/* Right Controls: Gold, Tabletop Flip, 24h Wheel, Armory Skins, Audio, Lobby */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Gold Balance */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/80 border border-amber-500/35">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-200">
                {goldBalance.toLocaleString()}
              </span>
            </div>

            {/* Tabletop 180° Flip North Stations Button (When in Match) */}
            {screen === 'match' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick()
                  setTabletopFlipNorth((prev) => !prev)
                }}
                title="Rotate North-side player dice stations 180° for tabletop tablet/phone play"
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] sm:text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                  tabletopFlipNorth
                    ? 'bg-amber-500 text-black border-amber-200'
                    : 'bg-black/75 border-amber-500/35 text-amber-200 hover:border-amber-400'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">TABLETOP 180°</span>
              </button>
            )}

            {/* Strict 24-Hour Spin Wheel Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick()
                setShowSpinWheel(true)
              }}
              className="imperial-button relative px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-display font-bold tracking-wider uppercase text-amber-200 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden lg:inline">24H WHEEL</span>
              {isSpinReady && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Armory / Skins Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick()
                setShowArmory(true)
              }}
              className="imperial-button px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-display font-bold tracking-wider uppercase text-amber-200 cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden lg:inline">SKINS</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label="Toggle Sound Effects"
              className="p-1.5 sm:p-2 rounded-xl bg-black/75 border border-amber-500/30 text-amber-200 hover:border-amber-400 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Fullscreen APK View Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="hidden sm:flex p-2 rounded-xl bg-black/75 border border-amber-500/30 text-amber-200 hover:border-amber-400 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-amber-300" />
            </button>

            {screen === 'match' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiClick()
                  setScreen('lobby')
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-red-900/80 cursor-pointer"
              >
                LOBBY
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* SCREEN A: AAA DARK PROFESSIONAL MAIN MENU / LOBBY                   */}
      {/* =================================================================== */}
      {screen === 'lobby' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* LEFT 7 COLUMNS: 3D CARVED CHESS-PIECE STRUCTURES & BLACK HOLE STAGE */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="imperial-panel relative rounded-2xl overflow-hidden border border-amber-500/40 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* 3D Carved Chess-Piece Structure Showcase Stage */}
                <div className="sm:col-span-7 relative rounded-xl overflow-hidden border-2 border-amber-400/50 aspect-[16/11] bg-gradient-to-b from-slate-950 via-[#090d18] to-black shadow-[0_12px_35px_rgba(0,0,0,0.9)] flex flex-col justify-between p-3">
                  {/* Top Bar: Toggle between 3D Chess Structure Model & Concept Render */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[10px] font-display font-bold tracking-widest text-amber-300 uppercase">
                      3D CHESS RELIC #{inspectedSculptMeta.index + 1}
                    </span>
                    <div className="flex rounded-lg bg-black/80 border border-white/15 p-0.5">
                      <button
                        type="button"
                        onClick={() => setLobbyPreviewMode('3d-model')}
                        className={`px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase cursor-pointer ${
                          lobbyPreviewMode === '3d-model'
                            ? 'bg-amber-400 text-black'
                            : 'text-slate-400'
                        }`}
                      >
                        3D STRUCTURE
                      </button>
                      <button
                        type="button"
                        onClick={() => setLobbyPreviewMode('render')}
                        className={`px-2 py-0.5 rounded text-[9px] font-display font-bold uppercase cursor-pointer ${
                          lobbyPreviewMode === 'render'
                            ? 'bg-amber-400 text-black'
                            : 'text-slate-400'
                        }`}
                      >
                        ART RENDER
                      </button>
                    </div>
                  </div>

                  {/* Center Display: Either Pure 3D Carved Chess Structure + Royal Dice OR Concept Render */}
                  {lobbyPreviewMode === '3d-model' ? (
                    <div className="relative flex-1 flex items-center justify-center gap-6 py-2">
                      {/* Ambient Pedestal Spotlight */}
                      <div className="w-36 h-36 rounded-full bg-amber-500/15 blur-2xl absolute pointer-events-none" />
                      <div className="w-28 h-36 sm:w-32 sm:h-40 flex items-center justify-center animate-float-slow">
                        <SculptedChessPiece3D
                          sculptType={inspectedSculptMeta.id}
                          faction="crimson"
                          skinId={pieceSkin}
                          isGlowing
                        />
                      </div>
                      <div className="flex flex-col items-center">
                        <RoyalCarvedDice
                          value={6}
                          isRolling={false}
                          canRoll={false}
                          onRoll={() => {}}
                          skinId={diceSkin}
                          activeFactionColor="#ef4444"
                          size="md"
                          showLabel={false}
                        />
                        <span className="text-[9px] font-display font-bold uppercase tracking-widest text-amber-300/80 mt-1.5">
                          SIDE DICE
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      <img
                        src={inspectedSculptMeta.image}
                        alt={inspectedSculptMeta.name}
                        className="w-full h-full object-cover"
                        style={{ filter: PIECE_SKINS[pieceSkin].imageFilter }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                  )}

                  {/* Bottom Caption */}
                  <div className="relative z-10">
                    <h2 className="text-base sm:text-lg font-display font-bold text-white">
                      {inspectedSculptMeta.name}
                    </h2>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {inspectedSculptMeta.description}
                    </p>
                  </div>
                </div>

                {/* Live Black Hole & Floating Universe Ruling Ring Preview */}
                <div className="sm:col-span-5 flex flex-col items-center text-center p-3 rounded-xl bg-black/60 border border-purple-500/30">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 relative my-1">
                    <BlackHoleSingularity
                      absorbedPieces={[]}
                      size="showcase"
                    />
                  </div>
                  <span className="text-[10px] font-display tracking-[0.2em] uppercase text-purple-300 font-bold mt-2">
                    CENTER WINNER GOAL
                  </span>
                  <h3 className="text-sm font-display font-bold text-amber-200 mt-0.5">
                    BLACK HOLE & UNIVERSE RING
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Guide your 3D sculpted chess pieces into the Singularity.
                    Each piece vanishes into the Black Hole until the victor
                    claims the Universe Ruling Ring.
                  </p>
                </div>
              </div>

              {/* 4 Sculpted 3D Chess Structures Selector Strip (Crown, Horse, Alien, Human) */}
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] sm:text-xs font-display font-bold uppercase tracking-[0.18em] text-amber-300">
                    THE 4 IN-GAME 3D CHESS PIECE STRUCTURES (CROWN • HORSE • ALIEN • HUMAN)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {SCULPTED_PIECES.map((sculpt) => {
                    const isSelected = inspectedSculpt === sculpt.id
                    return (
                      <button
                        key={sculpt.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playUiClick()
                          setInspectedSculpt(sculpt.id)
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 p-2 transition-all cursor-pointer flex flex-col items-center ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/40 scale-[1.03] shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                            : 'border-white/15 bg-black/60 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="w-12 h-15 sm:w-14 sm:h-18 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
                          <SculptedChessPiece3D
                            sculptType={sculpt.id}
                            faction="crimson"
                            skinId={pieceSkin}
                            isGlowing={isSelected}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs font-display font-bold tracking-wider text-amber-100 uppercase">
                          {sculpt.shortLabel}
                        </span>
                        <span className="text-[9px] text-slate-400 hidden sm:inline">
                          {sculpt.loreTitle}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: MULTIPLAYER (2, 4, 6 PLAYERS) & MODE COMMAND DECK */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="imperial-panel rounded-2xl p-4 sm:p-6 border border-amber-500/40 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/game-icon.jpg"
                    alt="Ludo Empire Official Icon"
                    className="w-11 h-11 rounded-xl border border-amber-400 object-cover shadow-md"
                  />
                  <div>
                    <span className="text-[10px] font-display tracking-[0.25em] uppercase text-amber-400 font-bold">
                      WAR ROOM DEPLOYMENT
                    </span>
                    <h2 className="text-lg sm:text-2xl font-display font-bold text-white">
                      SELECT BATTLE MODE
                    </h2>
                  </div>
                </div>
                <Swords className="w-6 h-6 text-amber-400 shrink-0" />
              </div>

              {/* STEP 1: CHOOSE 2, 4, OR 6 PLAYERS */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-[0.2em] text-amber-300 mb-2">
                  1. SELECT PLAYER COUNT (2, 4, OR 6 PLAYERS)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([2, 4, 6] as PlayerCountOption[]).map((count) => {
                    const active = playerCount === count
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          soundEngine.playUiClick()
                          setPlayerCount(count)
                        }}
                        className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border-2 font-display transition-all flex flex-col items-center cursor-pointer ${
                          active
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_22px_rgba(245,158,11,0.3)]'
                            : 'bg-black/60 border-white/15 text-slate-400 hover:text-amber-100'
                        }`}
                      >
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-amber-400" />
                        <span className="text-sm sm:text-lg font-black tracking-wider">
                          {count} PLAYERS
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-300/80">
                          {count === 2
                            ? '1v1 Side Dice'
                            : count === 4
                              ? '4-Side Dice'
                              : '6-Side Hex Altar'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: CHOOSE GAME MODE */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-[0.2em] text-amber-300 mb-2">
                  2. SELECT GAMEPLAY MODE
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'ai',
                      title: 'VS COMPUTER AI',
                      sub: 'Tactical Sovereign Bots',
                      icon: Bot,
                    },
                    {
                      id: 'pass-and-play',
                      title: 'PASS & PLAY',
                      sub: 'Friends Tabletop Side-Dice',
                      icon: Users,
                    },
                    {
                      id: 'quick-blitz',
                      title: 'SINGULARITY BLITZ',
                      sub: 'Crown Deployed • 2 to Win',
                      icon: Zap,
                    },
                    {
                      id: 'online-arena',
                      title: 'ONLINE ARENA',
                      sub: `Room #${roomCode} Match`,
                      icon: Compass,
                    },
                  ].map((m) => {
                    const Icon = m.icon
                    const active = matchMode === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playUiClick()
                          setMatchMode(m.id as MatchMode)
                        }}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          active
                            ? 'bg-purple-950/45 border-amber-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                            : 'bg-black/60 border-white/15 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs sm:text-sm tracking-wider truncate">
                            {m.title}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            {m.sub}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Equipped Skins Summary Bar */}
              <div className="p-3 rounded-xl bg-black/70 border border-amber-500/25 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                    ACTIVE LOADOUT
                  </span>
                  <span className="text-amber-200 font-semibold truncate block">
                    {BOARD_SKINS[boardSkin].name} • {PIECE_SKINS[pieceSkin].name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArmory(true)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-display font-bold text-[10px] uppercase tracking-wider hover:bg-amber-500/30 cursor-pointer shrink-0"
                >
                  CHANGE
                </button>
              </div>

              {/* LAUNCH MATCH CTA */}
              <button
                type="button"
                onClick={() => startMatch(playerCount, matchMode)}
                className="w-full py-3.5 sm:py-4 rounded-xl font-display font-black text-sm sm:text-lg tracking-[0.2em] uppercase text-black flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background:
                    'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #d97706 100%)',
                  boxShadow:
                    '0 10px 35px rgba(245, 158, 11, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.8)',
                }}
              >
                <Play className="w-5 h-5 fill-black" />
                ENTER THE SINGULARITY ({playerCount}P)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* SCREEN B: ACTIVE LUDO EMPIRE MATCH ARENA                            */}
      {/* PER-PLAYER SIDE-POSITIONED DICE (NORTH / SOUTH / EAST / WEST)       */}
      {/* RESPONSIVE ACROSS ALL ANDROID PHONES, TABLETS & DESKTOPS            */}
      {/* =================================================================== */}
      {screen === 'match' && (
        <section className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-1.5 sm:py-3 flex flex-col items-center justify-between gap-2">
          {/* --------------------------------------------------------------- */}
          {/* 1. NORTH SIDE PLAYER STATIONS & SIDE DICE (Directly Above Board)*/}
          {/* --------------------------------------------------------------- */}
          <div
            className={`w-full ${
              playerCount === 6 ? 'max-w-[780px]' : 'max-w-[620px]'
            }`}
          >
            {playerCount === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                {/* Empty North-West Status Card on Desktop/Tablet so Player 2 is anchored on North-East */}
                <div className="hidden sm:flex items-center gap-2.5 p-2.5 rounded-xl bg-black/65 border border-amber-500/20 text-xs text-slate-300">
                  <img
                    src="/images/game-icon.jpg"
                    alt="Ludo Empire"
                    className="w-9 h-9 rounded-lg border border-amber-400/50 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-display font-bold uppercase tracking-widest text-amber-400 block">
                      1V1 SOVEREIGN DUEL
                    </span>
                    <p className="text-[11px] text-slate-300 truncate">
                      Dice moves to each player&apos;s own side per turn.
                    </p>
                  </div>
                </div>
                {/* Player 2 at North-East (Corner 2) with their own Side Dice! */}
                <div>{renderPlayerStation(1, 'NE', true)}</div>
              </div>
            )}

            {playerCount === 4 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Player 2 at North-West (Corner 1) with their own Side Dice */}
                {renderPlayerStation(1, 'NW', true)}
                {/* Player 3 at North-East (Corner 2) with their own Side Dice */}
                {renderPlayerStation(2, 'NE', true)}
              </div>
            )}

            {playerCount === 6 && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {/* Player 2 at North-West */}
                {renderPlayerStation(1, 'NW', true)}
                {/* Player 3 at North-Center */}
                {renderPlayerStation(2, 'N', true)}
                {/* Player 4 at North-East */}
                {renderPlayerStation(3, 'NE', true)}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 2. CENTER ANCIENT RUNE ALTAR BOARD WITH 3D CHESS STRUCTURES     */}
          {/* Sized responsively for Android Portrait, Tablets, and Desktop   */}
          {/* --------------------------------------------------------------- */}
          <div className="w-full max-w-[min(94vw,47dvh)] sm:max-w-[min(82vw,54dvh)] md:max-w-[min(540px,56dvh)] aspect-square flex items-center justify-center my-0.5">
            <LudoEmpireBoard
              players={players}
              playerCount={playerCount}
              currentPlayerIndex={currentPlayerIndex}
              diceValue={diceValue}
              hasRolled={hasRolled}
              onSelectPiece={(piece) => handleMovePiece(piece, diceValue)}
              boardSkinId={boardSkin}
              pieceSkinId={pieceSkin}
              recentAbsorbedPiece={recentAbsorbedPiece}
            />
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 3. SOUTH SIDE PLAYER STATIONS & SIDE DICE (Directly Below Board)*/}
          {/* --------------------------------------------------------------- */}
          <div
            className={`w-full ${
              playerCount === 6 ? 'max-w-[780px]' : 'max-w-[620px]'
            }`}
          >
            {playerCount === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                {/* Player 1 (You) at South-West (Corner 0) with their own Side Dice! */}
                <div>{renderPlayerStation(0, 'SW', false)}</div>
                {/* Chronicle & Active Turn Info on South-East for 2P */}
                <div className="hidden sm:flex flex-col justify-center p-2.5 rounded-xl bg-black/70 border border-amber-500/25">
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-purple-300">
                    SINGULARITY CHRONICLE
                  </span>
                  <p className="text-[11px] text-amber-100/90 line-clamp-2 mt-0.5">
                    {combatLog}
                  </p>
                </div>
              </div>
            )}

            {playerCount === 4 && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* Player 1 (You) at South-West (Corner 0) with their own Side Dice */}
                {renderPlayerStation(0, 'SW', false)}
                {/* Player 4 at South-East (Corner 3) with their own Side Dice */}
                {renderPlayerStation(3, 'SE', false)}
              </div>
            )}

            {playerCount === 6 && (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {/* Player 1 (You) at South-West */}
                {renderPlayerStation(0, 'SW', false)}
                {/* Player 6 at South-Center */}
                {renderPlayerStation(5, 'S', false)}
                {/* Player 5 at South-East */}
                {renderPlayerStation(4, 'SE', false)}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------- */}
          {/* 4. COMPACT LIVE BATTLE CHRONICLE TICKER                         */}
          {/* --------------------------------------------------------------- */}
          <div className="w-full max-w-[600px] px-3 py-1.5 rounded-xl bg-black/80 border border-amber-500/25 flex items-center justify-between gap-2 text-[11px] text-amber-100/90">
            <span className="font-display font-bold uppercase tracking-wider text-purple-300 shrink-0">
              CHRONICLE:
            </span>
            <p className="truncate flex-1 text-center sm:text-left">
              {combatLog}
            </p>
            <span className="font-mono text-[10px] text-amber-300 shrink-0">
              GOAL: {requiredToWin} IN RING
            </span>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* MODALS: STRICT 24-HOUR SPIN WHEEL, SKINS ARMORY, VICTORY RING       */}
      {/* =================================================================== */}
      <DailySpinWheel
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        lastSpinTimestamp={lastSpinTimestamp}
        onClaimReward={(amount, ts) => {
          setGoldBalance((prev) => prev + amount)
          setLastSpinTimestamp(ts)
        }}
      />

      <ArmorySkinsModal
        isOpen={showArmory}
        onClose={() => setShowArmory(false)}
        goldBalance={goldBalance}
        unlockedSkins={unlockedSkins}
        boardSkin={boardSkin}
        pieceSkin={pieceSkin}
        diceSkin={diceSkin}
        envSkin={envSkin}
        onSelectOrUnlock={handleSelectOrUnlockSkin}
      />

      <VictoryRingModal
        winner={winner}
        onPlayAgain={() => startMatch(playerCount, matchMode)}
        onReturnToLobby={() => {
          setWinner(null)
          setScreen('lobby')
        }}
      />
    </main>
  )
}
