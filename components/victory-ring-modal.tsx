'use client'

import React from 'react'
import { Coins, Crown, RotateCcw, Shield, Sparkles } from 'lucide-react'
import { FACTIONS, PlayerState, SCULPTED_PIECES } from '@/lib/game-types'

interface VictoryRingModalProps {
  winner: PlayerState | null
  onPlayAgain: () => void
  onReturnLobby: () => void
  rewardGold: number
}

export function VictoryRingModal({
  winner,
  onPlayAgain,
  onReturnLobby,
  rewardGold,
}: VictoryRingModalProps) {
  if (!winner) return null

  const faction = FACTIONS[winner.faction]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="imperial-panel relative w-full max-w-xl rounded-2xl p-6 sm:p-8 text-center border-2 border-amber-400/70 shadow-[0_0_80px_rgba(245,158,11,0.45)] overflow-hidden">
        {/* Background Singularity Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${faction.primaryHex} 0%, #7e22ce 45%, transparent 75%)`,
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-300/50 text-amber-200 text-xs font-display tracking-[0.25em] uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            SINGULARITY ASCENSION COMPLETE
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-wider text-white drop-shadow-[0_2px_16px_rgba(250,204,21,0.65)]">
            {winner.name}
          </h2>
          <p className="text-sm sm:text-base font-display uppercase tracking-[0.2em] text-amber-300 mt-1">
            CLAIMS THE UNIVERSE RULING RING
          </p>

          {/* The Floating Universe Control Ring Presentation */}
          <div className="relative w-44 h-44 my-5 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{
                background:
                  'conic-gradient(from 0deg, #f59e0b, #a855f7, #fde047, #7c3aed, #f59e0b)',
                filter: 'blur(10px)',
                opacity: 0.75,
              }}
            />
            <div className="relative w-36 h-36 rounded-full bg-black border-2 border-amber-300 flex items-center justify-center shadow-[inset_0_0_30px_#a855f7]">
              <svg
                viewBox="0 0 100 100"
                className="w-28 h-28 animate-float-ring drop-shadow-[0_0_16px_rgba(250,204,21,1)]"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <polygon
                  points="50,3 58,15 50,23 42,15"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* All 4 Ascended Relics */}
          <div className="w-full grid grid-cols-4 gap-2.5 my-3">
            {SCULPTED_PIECES.map((sculpt) => (
              <div
                key={sculpt.id}
                className="p-1.5 rounded-xl bg-black/70 border border-amber-400/40 flex flex-col items-center"
              >
                <img
                  src={sculpt.image}
                  alt={sculpt.name}
                  className="w-12 h-12 rounded-lg object-cover border border-amber-300/40"
                />
                <span className="text-[9px] font-display font-bold text-amber-200 mt-1">
                  {sculpt.shortLabel}
                </span>
              </div>
            ))}
          </div>

          {/* Tribute Reward */}
          <div className="flex items-center justify-center gap-6 my-4 py-2.5 px-6 rounded-xl bg-amber-950/40 border border-amber-400/40">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="font-mono font-bold text-lg text-amber-200">
                +{rewardGold} GOLD
              </span>
            </div>
            <div className="h-4 w-px bg-amber-500/30" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="font-mono text-sm text-purple-200">
                {winner.capturesCount} CAPTURES
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onReturnLobby}
              className="py-3 px-4 rounded-xl bg-slate-900/90 border border-white/15 text-slate-200 font-display font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-slate-800 cursor-pointer"
            >
              IMPERIAL LOBBY
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="imperial-button py-3 px-4 rounded-xl text-amber-200 font-display font-bold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              REMATCH
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
