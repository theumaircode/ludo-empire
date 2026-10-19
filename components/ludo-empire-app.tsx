'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bot,
  Clock,
  Coins,
  Compass,
  Crown,
  Flame,
  Maximize2,
  Palette,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react'
import {
  BOARD_SKINS,
  BoardSkinId,
  DICE_SKINS,
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
  const [roomCode, setRoomCode] = useState('849-204')

  // 5. Active Match State
  const [players, setPlayers] = useState<PlayerState[]>(() =>
    createMatchPlayers(4, 'ai')
  )
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceValue, setDiceValue] = useState<number>(6)
  const [isRolling, setIsRolling] = useState(false)
  const [hasRolled, setHasRolled] = useState(false)
  const [combatLog, setCombatLog] = useState<string>(
    'Roll the Royal Dice to command your sculpted relics toward the Singularity.'
  )
  const [recentAbsorbedPiece, setRecentAbsorbedPiece] =
    useState<PieceInstance | null>(null)
  const [winner, setWinner] = useState<PlayerState | null>(null)
  const [activeRelicPreview, setActiveRelicPreview] =
    useState<PieceSculptType>('crown')

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
        `Battle commenced (${count} Players). Roll a 6 to deploy your Crown, Horse, Alien, or Human relic!`
      )
      setScreen('match')
    },
    [playerCount, matchMode]
  )

  // Advance turn to the next player
  const advanceToNextPlayer = useCallback(
    (nextIdx: number) => {
      setCurrentPlayerIndex(nextIdx)
      setHasRolled(false)
      setIsRolling(false)
    },
    []
  )

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

      setActiveRelicPreview(pieceToMove.sculptType)

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
                // Banish opponent relic back to Sanctuary!
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

        // Update moving piece position
        targetPiece.stepsMoved = targetSteps
        if (reachedBlackHole) {
          targetPiece.isFinished = true
          targetPiece.justFinishedAt = Date.now()
          mover.finishedCount += 1
        }

        // Check if mover has won the Universe Ruling Ring!
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
          `${players[pieceToMove.playerIndex]?.name}'s ${sculptMeta.name} vanished into the Black Hole! Bonus Roll granted!`
        )
      } else if (capturedOpponentName) {
        setCombatLog(
          `${sculptMeta.name} shattered ${capturedOpponentName}'s ${capturedSculptLabel}! Bonus Roll!`
        )
      } else if (isDeploying) {
        setCombatLog(
          `${sculptMeta.name} deployed onto the Ancient Rune Track! Roll again!`
        )
      } else {
        setCombatLog(
          `${sculptMeta.name} advanced ${rolledVal} runes toward the Black Hole.`
        )
      }

      // Decide next turn
      const nextIndex = bonusTurn
        ? pieceToMove.playerIndex
        : (pieceToMove.playerIndex + 1) % players.length

      setTimeout(() => {
        advanceToNextPlayer(nextIndex)
      }, 420)
    },
    [winner, playerCount, matchMode, players, advanceToNextPlayer]
  )

  // Roll the Royal Carved Dice
  const handleRollDice = useCallback(() => {
    if (isRolling || hasRolled || winner) return
    soundEngine.playDiceRoll()
    setIsRolling(true)

    setTimeout(() => {
      // Weighted slightly forgiving roll so players don't get stuck waiting forever for a 6
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
          `${currentP.name} rolled ${roll} — no legal relic moves available.`
        )
        setTimeout(() => {
          advanceToNextPlayer((currentPlayerIndex + 1) % players.length)
        }, 900)
      } else if (currentP.isAI) {
        // AI chooses best tactical relic move
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
        // Auto-move if human only has 1 single valid move for snappy AAA UX
        setCombatLog(
          `Rolled ${roll}! Moving ${
            SCULPTED_PIECES.find((s) => s.id === movablePieces[0].sculptType)
              ?.name
          }...`
        )
        setTimeout(() => {
          handleMovePiece(movablePieces[0], roll)
        }, 480)
      } else {
        setCombatLog(
          `Rolled ${roll}! Select one of your glowing sculpted relics to advance.`
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

  // Handle unlocking or equipping a skin in the Armory
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

  const currentPlayer = players[currentPlayerIndex] || players[0]
  const currentFaction = FACTIONS[currentPlayer.faction]
  const activePieceSculptMeta =
    SCULPTED_PIECES.find((s) => s.id === activeRelicPreview) ||
    SCULPTED_PIECES[0]
  const inspectedSculptMeta =
    SCULPTED_PIECES.find((s) => s.id === inspectedSculpt) || SCULPTED_PIECES[0]

  // Check if 24h spin wheel is ready
  const isSpinReady =
    !lastSpinTimestamp || Date.now() - lastSpinTimestamp >= 24 * 60 * 60 * 1000

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col justify-between select-none">
      {/* 1. OPENING FULL-BLACK STUDIO SPLASH: ONLY "THE UMAIR CODE®" */}
      {showSplash && <StudioSplash onComplete={() => setShowSplash(false)} />}

      {/* 2. LIVE MOVING MYSTERIOUS FOREST & COSMIC SINGULARITY SURROUNDINGS */}
      <LiveForestEnvironment
        skinId={envSkin}
        intensity={screen === 'match' ? 'match' : 'menu'}
      />

      {/* 3. TOP TACTICAL COMMAND HUD BAR (AAA PUBG / Clash of Clans Dark Style) */}
      <header className="relative z-20 w-full px-3 sm:px-6 py-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Sovereign Profile & Game Title */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400/80 bg-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <img
                src="/images/piece-crown.jpg"
                alt="Ludo Empire Crest"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg sm:text-2xl tracking-[0.18em] text-amber-100 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                  LUDO EMPIRE
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-display font-bold tracking-widest uppercase rounded bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  SINGULARITY EDITION
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400/90 font-semibold">
                  SOVEREIGN TIER I
                </span>
                <span>•</span>
                <span>{ ENVIRONMENT_SKINS[envSkin].name }</span>
              </div>
            </div>
          </div>

          {/* Right: Vault Gold, 24h Wheel, Armory Skins, Audio & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gold Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/80 border border-amber-500/35">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-200">
                {goldBalance.toLocaleString()}
              </span>
            </div>

            {/* Strict 24-Hour Spin Wheel Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiClick()
                setShowSpinWheel(true)
              }}
              className="imperial-button relative px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-display font-bold tracking-wider uppercase text-amber-200 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">24H WHEEL</span>
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
              className="imperial-button px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-display font-bold tracking-wider uppercase text-amber-200 cursor-pointer"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">SKINS</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-label="Toggle Sound Effects"
              className="p-2 rounded-xl bg-black/75 border border-amber-500/30 text-amber-200 hover:border-amber-400 cursor-pointer"
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
              className="p-2 rounded-xl bg-black/75 border border-amber-500/30 text-amber-200 hover:border-amber-400 cursor-pointer"
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
                className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 font-display font-bold text-xs uppercase tracking-wider hover:bg-red-900/80 cursor-pointer"
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
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT 7 COLUMNS: 3D HYPER-REALISTIC SCULPTED RELICS & BLACK HOLE STAGE */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Hero Visual Showcase Card */}
            <div className="imperial-panel relative rounded-2xl overflow-hidden border border-amber-500/40 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Close-Up 3D Sculpted Piece + Royal Carved Dice Preview */}
                <div className="sm:col-span-7 relative rounded-xl overflow-hidden border-2 border-amber-400/50 aspect-[16/10] bg-black shadow-[0_12px_35px_rgba(0,0,0,0.9)]">
                  <img
                    src={inspectedSculptMeta.image}
                    alt={inspectedSculptMeta.name}
                    className="w-full h-full object-cover transition-all duration-500"
                    style={{
                      filter: PIECE_SKINS[pieceSkin].imageFilter,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-[10px] font-display font-bold tracking-widest text-amber-300 uppercase">
                        RELIC #{inspectedSculptMeta.index + 1} •{' '}
                        {PIECE_SKINS[pieceSkin].name}
                      </span>
                      <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-1">
                        {inspectedSculptMeta.name}
                      </h2>
                      <p className="text-xs text-slate-300 line-clamp-1">
                        {inspectedSculptMeta.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Black Hole & Floating Universe Ruling Ring Preview */}
                <div className="sm:col-span-5 flex flex-col items-center text-center p-3 rounded-xl bg-black/60 border border-purple-500/30">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 relative my-1">
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
                    Guide all 4 sculpted relics into the Singularity. Each piece
                    vanishes into the Event Horizon until the victor claims the
                    Universe Ruling Ring.
                  </p>
                </div>
              </div>

              {/* 4 Sculpted Relics Selector Strip (Crown, Horse, Alien, Human) */}
              <div className="mt-5 pt-4 border-t border-amber-500/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-display font-bold uppercase tracking-[0.2em] text-amber-300">
                    YOUR 4 COMMAND RELICS IN EVERY MATCH (TAP TO INSPECT 3D)
                  </span>
                  <span className="text-xs text-slate-400">
                    + Royal Carved Diamond Dice
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
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
                        className={`group relative rounded-xl overflow-hidden border-2 p-1.5 transition-all cursor-pointer flex flex-col items-center ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/40 scale-[1.03] shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                            : 'border-white/15 bg-black/60 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-1.5">
                          <img
                            src={sculpt.image}
                            alt={sculpt.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            style={{
                              filter: PIECE_SKINS[pieceSkin].imageFilter,
                            }}
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
            <div className="imperial-panel rounded-2xl p-5 sm:p-6 border border-amber-500/40 space-y-5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <span className="text-[10px] font-display tracking-[0.25em] uppercase text-amber-400 font-bold">
                    WAR ROOM DEPLOYMENT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                    SELECT BATTLE CONFIGURATION
                  </h2>
                </div>
                <Swords className="w-6 h-6 text-amber-400" />
              </div>

              {/* STEP 1: CHOOSE 2, 4, OR 6 PLAYERS */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-[0.2em] text-amber-300 mb-2.5">
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
                        className={`py-3 px-3 rounded-xl border-2 font-display transition-all flex flex-col items-center cursor-pointer ${
                          active
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_22px_rgba(245,158,11,0.3)]'
                            : 'bg-black/60 border-white/15 text-slate-400 hover:text-amber-100'
                        }`}
                      >
                        <Users className="w-5 h-5 mb-1 text-amber-400" />
                        <span className="text-base sm:text-lg font-black tracking-wider">
                          {count} PLAYERS
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-amber-300/80">
                          {count === 2
                            ? '1v1 Sovereign Duel'
                            : count === 4
                              ? 'Classic 4-Corner'
                              : '6-Arm Hex Altar'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: CHOOSE GAME MODE (LIKE LUDO KING + COSMIC BLITZ) */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-[0.2em] text-amber-300 mb-2.5">
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
                      sub: 'Local Multiplayer Friends',
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
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          active
                            ? 'bg-purple-950/45 border-amber-400 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                            : 'bg-black/60 border-white/15 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm tracking-wider">
                            {m.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
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
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                    ACTIVE LOADOUT
                  </span>
                  <span className="text-amber-200 font-semibold">
                    {BOARD_SKINS[boardSkin].name} • {PIECE_SKINS[pieceSkin].name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArmory(true)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-display font-bold text-[10px] uppercase tracking-wider hover:bg-amber-500/30 cursor-pointer"
                >
                  CHANGE
                </button>
              </div>

              {/* LAUNCH MATCH CTA */}
              <button
                type="button"
                onClick={() => startMatch(playerCount, matchMode)}
                className="w-full py-4 rounded-xl font-display font-black text-base sm:text-lg tracking-[0.22em] uppercase text-black flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
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
      {/* =================================================================== */}
      {screen === 'match' && (
        <section className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 py-2 sm:py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* LEFT COLUMN (3 COLS): FACTION ROSTER & PIECE ASCENSION TRACKER */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-2.5">
            <div className="imperial-panel rounded-xl p-3 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-amber-300">
                  SOVEREIGN FACTIONS ({playerCount}P)
                </span>
                <span className="text-[10px] font-mono text-purple-300">
                  {matchMode === 'quick-blitz' ? 'GOAL: 2 IN RING' : 'GOAL: 4 IN RING'}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {players.map((p) => {
                  const faction = FACTIONS[p.faction]
                  const isTurn = p.index === currentPlayerIndex
                  return (
                    <div
                      key={p.index}
                      style={{
                        borderColor: isTurn
                          ? '#fef08a'
                          : `${faction.primaryHex}55`,
                        backgroundColor: isTurn
                          ? `${faction.secondaryHex}99`
                          : 'rgba(8, 11, 18, 0.85)',
                      }}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isTurn ? 'shadow-[0_0_18px_rgba(250,204,21,0.3)]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: faction.primaryHex,
                              boxShadow: `0 0 8px ${faction.glowHex}`,
                            }}
                          />
                          <span className="font-display font-bold text-xs text-white truncate">
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-300">
                          {p.finishedCount}/4 RING
                        </span>
                      </div>

                      {/* Mini status of this player's 4 Sculpted Relics (Crown, Horse, Alien, Human) */}
                      <div className="grid grid-cols-4 gap-1">
                        {p.pieces.map((pc) => {
                          const sculpt = SCULPTED_PIECES[pc.sculptIndex]
                          const inBase = pc.stepsMoved === -1
                          const inHole = pc.isFinished
                          return (
                            <div
                              key={pc.id}
                              className={`px-1 py-0.5 rounded text-center border text-[8px] font-display font-bold ${
                                inHole
                                  ? 'bg-purple-900/70 border-amber-300 text-amber-200'
                                  : inBase
                                    ? 'bg-black/60 border-white/10 text-slate-500'
                                    : 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                              }`}
                            >
                              {sculpt.shortLabel.slice(0, 3)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live Battle Chronicle Feed */}
            <div className="imperial-panel rounded-xl p-3 border border-amber-500/30">
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-purple-300 block mb-1">
                SINGULARITY CHRONICLE
              </span>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {combatLog}
              </p>
            </div>
          </div>

          {/* CENTER COLUMN (6 COLS): THE ANCIENT RUNE ALTAR LUDO BOARD & BLACK HOLE */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex items-center justify-center">
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

          {/* RIGHT COLUMN (3 COLS): ROYAL CARVED DICE DOCK & 3D RELIC CLOSE-UP */}
          <div className="lg:col-span-3 order-3 flex flex-col gap-3">
            {/* Royal Carved Dice Command Panel */}
            <div
              className="imperial-panel rounded-2xl p-4 border-2 flex flex-col items-center text-center transition-all"
              style={{
                borderColor: currentFaction.primaryHex,
                boxShadow: `0 12px 40px rgba(0,0,0,0.85), inset 0 0 25px ${currentFaction.primaryHex}33`,
              }}
            >
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-widest border mb-1"
                style={{
                  backgroundColor: `${currentFaction.primaryHex}33`,
                  borderColor: currentFaction.primaryHex,
                  color: '#fef08a',
                }}
              >
                {currentPlayer.isAI ? 'AI SOVEREIGN TURN' : 'YOUR IMPERIAL TURN'}
              </span>
              <h3 className="text-base sm:text-lg font-display font-bold text-white mb-3">
                {currentPlayer.name}
              </h3>

              <RoyalCarvedDice
                value={diceValue}
                isRolling={isRolling}
                canRoll={!currentPlayer.isAI && !hasRolled && !winner}
                onRoll={handleRollDice}
                skinId={diceSkin}
                activeFactionColor={currentFaction.primaryHex}
                size="lg"
              />

              {/* Manual Quick-Select Buttons for Movable Sculpted Relics */}
              {hasRolled && !currentPlayer.isAI && (
                <div className="w-full mt-4 pt-3 border-t border-white/10">
                  <span className="text-[10px] font-display uppercase tracking-widest text-amber-300 block mb-2">
                    COMMAND MOVABLE RELIC:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPlayer.pieces.map((pc) => {
                      const movable = canPieceMove(pc, diceValue, playerCount)
                      const sculpt = SCULPTED_PIECES[pc.sculptIndex]
                      return (
                        <button
                          key={pc.id}
                          type="button"
                          disabled={!movable}
                          onClick={() => handleMovePiece(pc, diceValue)}
                          className={`py-2 px-2 rounded-lg font-display font-bold text-[11px] uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                            movable
                              ? 'bg-amber-500 text-black border-amber-200 hover:bg-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                              : 'bg-black/50 text-slate-600 border-white/5 cursor-not-allowed'
                          }`}
                        >
                          <span>{sculpt.shortLabel}</span>
                          {pc.stepsMoved === -1 && movable && (
                            <span className="text-[9px] bg-black/20 px-1 rounded">
                              DEPLOY
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Live 3D Hyper-Realistic Relic & Royal Dice Close-up Camera */}
            <div className="imperial-panel rounded-xl overflow-hidden border border-amber-500/30 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-amber-300">
                  3D RELIC CAMERA • {activePieceSculptMeta.shortLabel}
                </span>
                <div className="flex gap-1">
                  {SCULPTED_PIECES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveRelicPreview(s.id)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-display font-bold cursor-pointer ${
                        activeRelicPreview === s.id
                          ? 'bg-amber-400 text-black'
                          : 'bg-black/60 text-slate-400'
                      }`}
                    >
                      {s.shortLabel[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-amber-400/40">
                <img
                  src={activePieceSculptMeta.image}
                  alt={activePieceSculptMeta.name}
                  className="w-full h-full object-cover"
                  style={{ filter: PIECE_SKINS[pieceSkin].imageFilter }}
                />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-xs font-display font-bold text-amber-200">
                    {activePieceSculptMeta.name}
                  </p>
                </div>
              </div>
            </div>
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
        rewardGold={500}
        onPlayAgain={() => startMatch(playerCount, matchMode)}
        onReturnLobby={() => {
          setWinner(null)
          setScreen('lobby')
        }}
      />
    </main>
  )
}
