'use client'

import React, { useState } from 'react'
import { Check, Coins, Lock, Palette, Shield, Sparkles, X } from 'lucide-react'
import {
  BOARD_SKINS,
  BoardSkinId,
  DICE_SKINS,
  DiceSkinId,
  ENVIRONMENT_SKINS,
  EnvironmentSkinId,
  PIECE_SKINS,
  PieceSkinId,
  SCULPTED_PIECES,
} from '@/lib/game-types'
import { SculptedChessPiece3D } from './sculpted-chess-piece-3d'
import { soundEngine } from '@/lib/sound-engine'

interface ArmorySkinsModalProps {
  isOpen: boolean
  onClose: () => void
  goldBalance: number
  unlockedSkins: string[]
  boardSkin: BoardSkinId
  pieceSkin: PieceSkinId
  diceSkin: DiceSkinId
  envSkin: EnvironmentSkinId
  onSelectOrUnlock: (
    category: 'board' | 'piece' | 'dice' | 'env',
    skinId: string,
    cost: number
  ) => void
}

export function ArmorySkinsModal({
  isOpen,
  onClose,
  goldBalance,
  unlockedSkins,
  boardSkin,
  pieceSkin,
  diceSkin,
  envSkin,
  onSelectOrUnlock,
}: ArmorySkinsModalProps) {
  const [activeTab, setActiveTab] = useState<'piece' | 'board' | 'dice' | 'env'>(
    'piece'
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="imperial-panel relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border border-amber-500/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-black/50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-400/80">
              IMPERIAL VAULT & CUSTOMIZATION
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-amber-100">
              ROYAL ARMORY & SKINS
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-950/60 border border-amber-400/40">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-200">
                {goldBalance.toLocaleString()} GOLD
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-black/40 border-b border-amber-500/15">
          {[
            { id: 'piece', label: '3D Sculpted Pieces', icon: Shield },
            { id: 'board', label: 'Altar Boards', icon: Palette },
            { id: 'dice', label: 'Royal Carved Dice', icon: Sparkles },
            { id: 'env', label: 'Forest & UI Realm', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEngine.playUiClick()
                  setActiveTab(tab.id as typeof activeTab)
                }}
                className={`py-2.5 px-3 rounded-xl font-display text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-black/50 border-white/10 text-slate-400 hover:text-amber-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. PIECE SKINS (Preserves exact 4 Sculpted Structures: Crown, Horse, Alien, Human) */}
          {activeTab === 'piece' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-display font-bold text-amber-200 uppercase tracking-wider">
                    THE FOUR SOVEREIGN SCULPTURES (STRUCTURE LOCKED)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Every faction commands 1 Royal Crown, 1 Royal Horse Head, 1
                    Extraterrestrial Alien Head, and 1 Human King Head. Skins
                    transform their metal & gemstone forging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(PIECE_SKINS).map((skin) => {
                  const isUnlocked =
                    skin.costGold === 0 || unlockedSkins.includes(skin.id)
                  const isEquipped = pieceSkin === skin.id

                  return (
                    <div
                      key={skin.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                          : 'bg-black/60 border-white/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-display font-bold text-base text-amber-100">
                            {skin.name}
                          </h4>
                          {isEquipped && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-400 text-black">
                              EQUIPPED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-3">
                          {skin.subtitle}
                        </p>

                        {/* Live Preview of all 4 3D Sculpted Chess-Piece Structures with this Skin */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          {SCULPTED_PIECES.map((sculpt) => (
                            <div
                              key={sculpt.id}
                              className="rounded-lg overflow-hidden border border-amber-400/40 bg-gradient-to-b from-slate-900/90 to-black p-1.5 flex flex-col items-center"
                            >
                              <div className="w-12 h-14 flex items-center justify-center">
                                <SculptedChessPiece3D
                                  sculptType={sculpt.id}
                                  faction="crimson"
                                  skinId={skin.id}
                                />
                              </div>
                              <span className="text-[9px] font-display font-bold pt-1 text-amber-200">
                                {sculpt.shortLabel}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onSelectOrUnlock('piece', skin.id, skin.costGold)
                        }
                        disabled={isEquipped || (!isUnlocked && goldBalance < skin.costGold)}
                        className={`w-full py-2.5 rounded-lg font-display font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : isUnlocked
                              ? 'imperial-button text-amber-200'
                              : goldBalance >= skin.costGold
                                ? 'bg-amber-500 text-black hover:bg-amber-400'
                                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" /> ACTIVE RELIC FINISH
                          </>
                        ) : isUnlocked ? (
                          'EQUIP SKIN'
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> UNLOCK FOR{' '}
                            {skin.costGold} GOLD
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. BOARD SKINS */}
          {activeTab === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(BOARD_SKINS).map((skin) => {
                const isUnlocked =
                  skin.costGold === 0 || unlockedSkins.includes(skin.id)
                const isEquipped = boardSkin === skin.id

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-950/30 border-amber-400'
                        : 'bg-black/60 border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display font-bold text-base text-amber-100">
                          {skin.name}
                        </h4>
                        {isEquipped && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-black">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        {skin.subtitle}
                      </p>

                      {/* Board Material Swatch Preview */}
                      <div
                        className="h-24 rounded-lg border-2 p-3 flex items-center justify-between mb-4"
                        style={{
                          background: skin.woodGradient,
                          borderColor: skin.goldTrim,
                        }}
                      >
                        <div className="flex gap-2">
                          {['I', 'V', 'X', 'M'].map((r, i) => (
                            <div
                              key={i}
                              className="w-9 h-9 rounded border flex items-center justify-center font-mono font-bold"
                              style={{
                                backgroundColor: skin.tileBase,
                                borderColor: skin.tileBorder,
                                color: skin.runeColor,
                              }}
                            >
                              {r}
                            </div>
                          ))}
                        </div>
                        <span
                          className="text-xs font-display font-bold uppercase px-2.5 py-1 rounded bg-black/70 border"
                          style={{
                            color: skin.runeColor,
                            borderColor: skin.goldTrim,
                          }}
                        >
                          LIVE ALTAR
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectOrUnlock('board', skin.id, skin.costGold)
                      }
                      disabled={isEquipped || (!isUnlocked && goldBalance < skin.costGold)}
                      className={`w-full py-2.5 rounded-lg font-display font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : isUnlocked
                            ? 'imperial-button text-amber-200'
                            : goldBalance >= skin.costGold
                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped
                        ? 'EQUIPPED BOARD'
                        : isUnlocked
                          ? 'EQUIP BOARD SKIN'
                          : `UNLOCK (${skin.costGold} GOLD)`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* 3. ROYAL DICE SKINS */}
          {activeTab === 'dice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(DICE_SKINS).map((skin) => {
                const isUnlocked =
                  skin.costGold === 0 || unlockedSkins.includes(skin.id)
                const isEquipped = diceSkin === skin.id

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-950/30 border-amber-400'
                        : 'bg-black/60 border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl p-1.5 shrink-0 flex items-center justify-center"
                        style={{ background: skin.frameGradient }}
                      >
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center border border-white/30"
                          style={{ background: skin.coreBg }}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{
                              backgroundColor: skin.pipColor,
                              boxShadow: `0 0 10px ${skin.pipGlow}`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-amber-100">
                          {skin.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {skin.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectOrUnlock('dice', skin.id, skin.costGold)
                      }
                      disabled={isEquipped || (!isUnlocked && goldBalance < skin.costGold)}
                      className={`w-full py-2.5 rounded-lg font-display font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : isUnlocked
                            ? 'imperial-button text-amber-200'
                            : goldBalance >= skin.costGold
                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped
                        ? 'EQUIPPED ROYAL DICE'
                        : isUnlocked
                          ? 'EQUIP DICE SKIN'
                          : `UNLOCK (${skin.costGold} GOLD)`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* 4. ENVIRONMENT & UI SKINS */}
          {activeTab === 'env' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(ENVIRONMENT_SKINS).map((skin) => {
                const isUnlocked =
                  skin.costGold === 0 || unlockedSkins.includes(skin.id)
                const isEquipped = envSkin === skin.id

                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-950/30 border-amber-400'
                        : 'bg-black/60 border-white/15'
                    }`}
                  >
                    <div>
                      <div
                        className="h-24 rounded-lg mb-3 relative overflow-hidden border border-white/20 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('/images/forest-arena.jpg')`,
                        }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: skin.fogTint }}
                        />
                      </div>
                      <h4 className="font-display font-bold text-base text-amber-100">
                        {skin.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 mb-4">
                        {skin.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSelectOrUnlock('env', skin.id, skin.costGold)
                      }
                      disabled={isEquipped || (!isUnlocked && goldBalance < skin.costGold)}
                      className={`w-full py-2.5 rounded-lg font-display font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : isUnlocked
                            ? 'imperial-button text-amber-200'
                            : goldBalance >= skin.costGold
                              ? 'bg-amber-500 text-black hover:bg-amber-400'
                              : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped
                        ? 'ACTIVE FOREST REALM'
                        : isUnlocked
                          ? 'EQUIP REALM'
                          : `UNLOCK (${skin.costGold} GOLD)`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
