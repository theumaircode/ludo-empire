'use client'

import React from 'react'
import { FactionId, FACTIONS, PieceSculptType, PieceSkinId } from '@/lib/game-types'

interface SculptedChessPiece3DProps {
  sculptType: PieceSculptType
  faction: FactionId
  skinId?: PieceSkinId
  className?: string
  isGlowing?: boolean
}

/**
 * Pure 3D-Shaded Carved Chess-Piece Structure Models for the 4 Relics:
 * 1. 'crown' — Sovereign Imperial Crown on Jeweled Pedestal
 * 2. 'horse' — Royal Warhorse Knight Head on Jeweled Pedestal
 * 3. 'alien' — Extraterrestrial Archon Bust on Jeweled Pedestal
 * 4. 'human' — High King Human Bust on Jeweled Pedestal
 *
 * Rendered as standalone 3D sculpted silhouettes with transparent backgrounds,
 * multi-stop metallic gradients, specular highlights, and faction gemstone inlays.
 */
export function SculptedChessPiece3D({
  sculptType,
  faction,
  skinId = 'heirloom-gold',
  className = 'w-full h-full',
  isGlowing = false,
}: SculptedChessPiece3DProps) {
  const factionMeta = FACTIONS[faction] || FACTIONS.crimson
  const uid = `${sculptType}-${faction}-${skinId}`

  // Adjust metallic palette based on equipped piece finish skin
  const metalPalettes: Record<
    PieceSkinId,
    {
      dark: string
      mid: string
      light: string
      highlight: string
      rim: string
    }
  > = {
    'heirloom-gold': {
      dark: '#3b2306',
      mid: '#9a6b1f',
      light: '#eab308',
      highlight: '#fef08a',
      rim: '#ca8a04',
    },
    'dark-damascus': {
      dark: '#0f172a',
      mid: '#334155',
      light: '#94a3b8',
      highlight: '#f1f5f9',
      rim: '#64748b',
    },
    'celestial-jade': {
      dark: '#062e22',
      mid: '#0d7a58',
      light: '#34d399',
      highlight: '#d1fae5',
      rim: '#10b981',
    },
    'blood-emperor': {
      dark: '#2e070d',
      mid: '#881327',
      light: '#f59e0b',
      highlight: '#fde68a',
      rim: '#e11d48',
    },
    'void-archon': {
      dark: '#190b33',
      mid: '#5b21b6',
      light: '#c084fc',
      highlight: '#f3e8ff',
      rim: '#9333ea',
    },
  }

  const metal = metalPalettes[skinId] || metalPalettes['heirloom-gold']

  return (
    <svg
      viewBox="0 0 120 155"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} overflow-visible select-none`}
      style={{
        filter: isGlowing
          ? `drop-shadow(0 6px 8px rgba(0,0,0,0.92)) drop-shadow(0 0 10px ${factionMeta.glowHex})`
          : 'drop-shadow(0 6px 7px rgba(0,0,0,0.92))',
      }}
    >
      <defs>
        {/* 3D Cylindrical Metallic Body Gradient */}
        <linearGradient id={`metal-cyl-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={metal.dark} />
          <stop offset="22%" stopColor={metal.mid} />
          <stop offset="45%" stopColor={metal.highlight} />
          <stop offset="68%" stopColor={metal.light} />
          <stop offset="88%" stopColor={metal.mid} />
          <stop offset="100%" stopColor={metal.dark} />
        </linearGradient>

        {/* Vertical Sculpted Relief Gradient */}
        <linearGradient id={`metal-vert-${uid}`} x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor={metal.highlight} />
          <stop offset="35%" stopColor={metal.light} />
          <stop offset="75%" stopColor={metal.mid} />
          <stop offset="100%" stopColor={metal.dark} />
        </linearGradient>

        {/* Silver / Aged Platinum Gradient for Bust Faces & Mane */}
        <linearGradient id={`sculpt-silver-${uid}`} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#cbd5e1" />
          <stop offset="62%" stopColor="#64748b" />
          <stop offset="88%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Faction Velvet & Gemstone Gradient */}
        <radialGradient id={`gem-${uid}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor={factionMeta.glowHex} />
          <stop offset="70%" stopColor={factionMeta.primaryHex} />
          <stop offset="100%" stopColor={factionMeta.secondaryHex} />
        </radialGradient>

        {/* Deep Faction Velvet Cushion Gradient */}
        <radialGradient id={`velvet-${uid}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={factionMeta.glowHex} />
          <stop offset="45%" stopColor={factionMeta.primaryHex} />
          <stop offset="100%" stopColor={factionMeta.secondaryHex} />
        </radialGradient>

        {/* Alien Bioluminescent Cyan Gem */}
        <radialGradient id={`cyan-gem-${uid}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>
      </defs>

      {/* ================================================================= */}
      {/* SHARED 3D CARVED CHESS PEDESTAL BASE (Bottom Y: 102 -> 150)       */}
      {/* ================================================================= */}
      <g>
        {/* Ground Contact Shadow Ellipse */}
        <ellipse cx="60" cy="146" rx="44" ry="8" fill="rgba(0,0,0,0.75)" />

        {/* Faction Identification Aura Rim on Ground */}
        <ellipse
          cx="60"
          cy="143"
          rx="41"
          ry="7.5"
          fill={`url(#gem-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1.5"
        />

        {/* Lower Flared Plinth Ring */}
        <path
          d="M21 140 C21 133, 99 133, 99 140 L96 144 C96 149, 24 149, 24 144 Z"
          fill={`url(#metal-cyl-${uid})`}
          stroke={metal.dark}
          strokeWidth="1.2"
        />

        {/* Tiered Baroque Pedestal Body */}
        <path
          d="M26 136 C28 122, 34 114, 37 105 L83 105 C86 114, 92 122, 94 136 C94 142, 26 142, 26 136 Z"
          fill={`url(#metal-cyl-${uid})`}
          stroke={metal.dark}
          strokeWidth="1.4"
        />

        {/* Faction Enamel Band Around Pedestal */}
        <path
          d="M29 130 C29 125, 91 125, 91 130 L89 136 C89 140, 31 140, 31 136 Z"
          fill={`url(#velvet-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1"
        />

        {/* Carved Filigree Scrollwork on Pedestal */}
        <path
          d="M34 118 Q47 112 60 119 Q73 112 86 118"
          stroke={metal.highlight}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M36 106 C36 102, 84 102, 84 106 C84 109, 36 109, 36 106 Z"
          fill={`url(#metal-cyl-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1.2"
        />

        {/* 3 Recessed Gemstone Cabochons in Pedestal Base */}
        <circle
          cx="39"
          cy="132"
          r="4.2"
          fill={`url(#gem-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1.2"
        />
        <circle
          cx="60"
          cy="133.5"
          r="5"
          fill={`url(#gem-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1.4"
        />
        <circle
          cx="81"
          cy="132"
          r="4.2"
          fill={`url(#gem-${uid})`}
          stroke={metal.highlight}
          strokeWidth="1.2"
        />
      </g>

      {/* ================================================================= */}
      {/* SCULPT 1: SOVEREIGN ROYAL CROWN 3D CHESS STRUCTURE                */}
      {/* ================================================================= */}
      {sculptType === 'crown' && (
        <g>
          {/* Fluted Golden Neck Pillar */}
          <path
            d="M39 105 L43 78 L77 78 L81 105 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.dark}
            strokeWidth="1.3"
          />
          {/* Decorative Fleur-de-Lis Relief on Neck */}
          <path
            d="M46 95 Q60 85 74 95 M50 86 L60 98 L70 86"
            stroke={metal.highlight}
            strokeWidth="1.8"
            fill="none"
          />
          <circle
            cx="60"
            cy="91"
            r="3.5"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1"
          />

          {/* Crown Jeweled Circlet Band */}
          <path
            d="M27 72 C27 67, 93 67, 93 72 L90 80 C90 84, 30 84, 30 80 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.5"
          />
          {/* Jewels on Circlet Band */}
          <circle cx="38" cy="75" r="3" fill="#10b981" stroke={metal.highlight} strokeWidth="1" />
          <rect
            x="56"
            y="72"
            width="8"
            height="6"
            rx="1.5"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1"
          />
          <circle cx="82" cy="75" r="3" fill="#3b82f6" stroke={metal.highlight} strokeWidth="1" />

          {/* Royal Puffed Velvet Cap Inside Crown */}
          <path
            d="M28 69 C18 42, 42 28, 60 32 C78 28, 102 42, 92 69 Z"
            fill={`url(#velvet-${uid})`}
            stroke={factionMeta.secondaryHex}
            strokeWidth="1.5"
          />
          {/* Velvet Lobes Shading */}
          <path
            d="M44 68 C40 48, 48 34, 60 32 C72 34, 80 48, 76 68"
            fill={`url(#velvet-${uid})`}
            opacity="0.85"
          />

          {/* 3D Golden Pearl-Studded Crown Arches */}
          {/* Outer Left Arch */}
          <path
            d="M28 69 C19 42, 39 24, 60 25"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="6.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M28 69 C19 42, 39 24, 60 25"
            stroke={metal.highlight}
            strokeWidth="2.2"
            strokeDasharray="1 5.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Outer Right Arch */}
          <path
            d="M92 69 C101 42, 81 24, 60 25"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="6.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M92 69 C101 42, 81 24, 60 25"
            stroke={metal.highlight}
            strokeWidth="2.2"
            strokeDasharray="1 5.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Inner Left Arch */}
          <path
            d="M44 69 C41 44, 49 27, 60 25"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M44 69 C41 44, 49 27, 60 25"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="1 5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Inner Right Arch */}
          <path
            d="M76 69 C79 44, 71 27, 60 25"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="5.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M76 69 C79 44, 71 27, 60 25"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="1 5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Central Vertical Spine Arch */}
          <path
            d="M60 69 L60 24"
            stroke={`url(#metal-cyl-${uid})`}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M60 66 L60 27"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />

          {/* Fleur-de-Lis Crest Spikes Along the Rim */}
          <path
            d="M27 70 L24 58 L32 65 L44 55 L52 65 L60 53 L68 65 L76 55 L88 65 L96 58 L93 70 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.2"
          />

          {/* Top Sovereign Globus Cruciger (Orb + Cross Finial) */}
          <circle
            cx="60"
            cy="20"
            r="6.5"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.3"
          />
          <path
            d="M53.5 20 L66.5 20 M60 13.5 L60 26.5"
            stroke={metal.highlight}
            strokeWidth="1.4"
          />
          {/* Top Cross */}
          <path
            d="M60 3 L60 14 M55 8 L65 8"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="8" r="1.8" fill="#ffffff" />
        </g>
      )}

      {/* ================================================================= */}
      {/* SCULPT 2: ROYAL WARHORSE KNIGHT 3D CHESS STRUCTURE                */}
      {/* ================================================================= */}
      {sculptType === 'horse' && (
        <g>
          {/* Armored Chest Barding & Collar */}
          <path
            d="M35 105 C32 86, 36 68, 42 52 L78 66 C82 80, 84 94, 85 105 Z"
            fill={`url(#velvet-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.5"
          />

          {/* Sculpted Metallic Silver/Bronze Horse Head & Neck Silhouette */}
          <path
            d="M36 104 C28 82, 26 56, 36 34 C40 24, 48 18, 56 16 L60 7 L65 16 L72 6 L73 18 C84 22, 92 33, 96 46 C99 55, 104 62, 101 69 C98 75, 91 76, 85 72 C79 68, 74 62, 68 62 C69 76, 76 90, 84 104 Z"
            fill={`url(#sculpt-silver-${uid})`}
            stroke={metal.dark}
            strokeWidth="1.5"
          />

          {/* Flowing 3D Sculpted Silver/Gold Mane Locks (Left Side) */}
          <path
            d="M52 16 C34 18, 20 30, 18 46 C24 42, 30 42, 34 45 C20 52, 14 66, 18 80 C24 75, 30 74, 34 77 C23 84, 22 95, 28 103 C34 98, 39 95, 42 98"
            fill={`url(#sculpt-silver-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />

          {/* Ornate Golden Armor Plates & Bridle Straps on Horse Head */}
          {/* Chanfron (Forehead & Nose Armor Plate) */}
          <path
            d="M62 18 C75 24, 86 38, 95 56 L88 62 C78 46, 68 34, 56 26 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.3"
          />

          {/* Cheek & Jaw Gold Bridle Strap */}
          <path
            d="M54 28 L72 56 L92 64 M72 56 L50 68"
            stroke={`url(#metal-vert-${uid})`}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M54 28 L72 56 L92 64 M72 56 L50 68"
            stroke={metal.highlight}
            strokeWidth="1.4"
            strokeDasharray="2 4"
            strokeLinecap="round"
          />

          {/* Neck Crinet Golden Armor Bands */}
          <path
            d="M38 66 Q58 58 74 72"
            stroke={`url(#metal-cyl-${uid})`}
            strokeWidth="5"
            fill="none"
          />
          <path
            d="M36 82 Q58 74 79 88"
            stroke={`url(#metal-cyl-${uid})`}
            strokeWidth="5.5"
            fill="none"
          />
          <path
            d="M35 97 Q60 90 84 101"
            stroke={`url(#metal-cyl-${uid})`}
            strokeWidth="6"
            fill="none"
          />

          {/* Horse Eye (Fierce Glowing Amber/White) */}
          <ellipse
            cx="73"
            cy="37"
            rx="4.2"
            ry="2.6"
            transform="rotate(18 73 37)"
            fill="#fef08a"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          <circle cx="74" cy="37" r="1.4" fill="#0f172a" />

          {/* Ruby & Sapphire Gemstones Set Into Horse Armor */}
          <circle
            cx="78"
            cy="29"
            r="3.2"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.1"
          />
          <circle
            cx="71"
            cy="55"
            r="3.8"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.2"
          />
          <ellipse
            cx="64"
            cy="88"
            rx="5.5"
            ry="7"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.5"
          />
        </g>
      )}

      {/* ================================================================= */}
      {/* SCULPT 3: EXTRATERRESTRIAL ARCHON 3D CHESS STRUCTURE              */}
      {/* ================================================================= */}
      {sculptType === 'alien' && (
        <g>
          {/* High Biomechanical Royal Collar & Pauldrons */}
          <path
            d="M16 74 C24 68, 36 72, 43 82 L40 105 L80 105 L77 82 C84 72, 96 68, 104 74 C98 88, 89 98, 82 105 L38 105 C31 98, 22 88, 16 74 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.5"
          />

          {/* Inner Sculpted Neck & Chest Core */}
          <path
            d="M36 78 L60 98 L84 78 L80 105 L40 105 Z"
            fill={`url(#sculpt-silver-${uid})`}
            stroke={metal.light}
            strokeWidth="1.2"
          />

          {/* Dual Sweeping Carved Golden Horns (Left & Right) */}
          {/* Left Outer Horn */}
          <path
            d="M38 44 C18 36, 12 18, 23 6 C22 18, 29 27, 44 33 Z"
            fill={`url(#metal-vert-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.4"
          />
          {/* Right Outer Horn */}
          <path
            d="M82 44 C102 36, 108 18, 97 6 C98 18, 91 27, 76 33 Z"
            fill={`url(#metal-vert-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.4"
          />
          {/* Inner Crown Crest Spires */}
          <path
            d="M46 28 L42 10 L54 22 L60 8 L66 22 L78 10 L74 28 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.2"
          />

          {/* Chiseled Extraterrestrial Archon Cranium & Face */}
          <path
            d="M35 38 C35 20, 85 20, 85 38 C87 54, 77 70, 68 80 C63 85, 57 85, 52 80 C43 70, 33 54, 35 38 Z"
            fill={`url(#sculpt-silver-${uid})`}
            stroke={metal.dark}
            strokeWidth="1.5"
          />

          {/* Golden Forehead Filigree Crest */}
          <path
            d="M42 32 Q60 18 78 32 Q68 44 60 52 Q52 44 42 32 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.2"
          />

          {/* Large Slanted Almond Alien Eyes */}
          <path
            d="M39 48 Q47 43 55 52 Q46 56 39 48 Z"
            fill="#090d16"
            stroke="#22d3ee"
            strokeWidth="1.4"
          />
          <ellipse cx="47" cy="49.5" rx="3.5" ry="1.8" fill="#67e8f9" />

          <path
            d="M81 48 Q73 43 65 52 Q74 56 81 48 Z"
            fill="#090d16"
            stroke="#22d3ee"
            strokeWidth="1.4"
          />
          <ellipse cx="73" cy="49.5" rx="3.5" ry="1.8" fill="#67e8f9" />

          {/* Cheekbone & Chin Sculpted Contours */}
          <path
            d="M41 58 L54 68 L60 66 L66 68 L79 58 M54 73 L66 73"
            stroke={metal.highlight}
            strokeWidth="1.4"
            fill="none"
          />

          {/* Bioluminescent Cyan & Faction Jewels */}
          <circle
            cx="60"
            cy="35"
            r="3.8"
            fill={`url(#cyan-gem-${uid})`}
            stroke="#ffffff"
            strokeWidth="1"
          />
          <circle
            cx="60"
            cy="92"
            r="5"
            fill={`url(#cyan-gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.4"
          />
          {/* Neural Bioluminescent Dots on Temples */}
          <circle cx="38" cy="55" r="1.6" fill="#22d3ee" />
          <circle cx="42" cy="60" r="1.4" fill="#22d3ee" />
          <circle cx="82" cy="55" r="1.6" fill="#22d3ee" />
          <circle cx="78" cy="60" r="1.4" fill="#22d3ee" />
        </g>
      )}

      {/* ================================================================= */}
      {/* SCULPT 4: HIGH KING HUMAN BUST 3D CHESS STRUCTURE                 */}
      {/* ================================================================= */}
      {sculptType === 'human' && (
        <g>
          {/* Broad Imperial Armored Breastplate & Pauldrons */}
          <path
            d="M17 78 C24 68, 37 64, 48 64 L72 64 C83 64, 96 68, 103 78 C98 92, 88 99, 82 105 L38 105 C32 99, 22 92, 17 78 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.5"
          />

          {/* V-Shaped Baroque Scrollwork Gorget on Chest */}
          <path
            d="M26 74 Q60 94 94 74"
            stroke={metal.highlight}
            strokeWidth="2.2"
            fill="none"
          />
          <path
            d="M34 84 Q60 102 86 84"
            stroke={metal.highlight}
            strokeWidth="1.8"
            fill="none"
          />
          {/* Central Chest Ruby Cabochon */}
          <circle
            cx="60"
            cy="92"
            r="4.8"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.4"
          />
          <circle
            cx="43"
            cy="83"
            r="2.8"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1"
          />
          <circle
            cx="77"
            cy="83"
            r="2.8"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1"
          />

          {/* Sculpted Metallic Neck & High Collar */}
          <path
            d="M45 66 L47 54 L73 54 L75 66 C68 72, 52 72, 45 66 Z"
            fill={`url(#sculpt-silver-${uid})`}
            stroke={metal.dark}
            strokeWidth="1.2"
          />
          <path
            d="M44 63 C44 68, 76 68, 76 63"
            stroke={metal.highlight}
            strokeWidth="3"
            fill="none"
          />

          {/* Sculpted Classical Emperor Head & Jawline */}
          <path
            d="M39 30 C38 44, 41 56, 49 61 C55 64, 65 64, 71 61 C79 56, 82 44, 81 30 Z"
            fill={`url(#sculpt-silver-${uid})`}
            stroke="#1e293b"
            strokeWidth="1.5"
          />

          {/* Sculpted Wavy Imperial Hair & Sideburns */}
          <path
            d="M36 30 C33 38, 34 48, 39 53 C40 46, 40 38, 41 32 Z M84 30 C87 38, 86 48, 81 53 C80 46, 80 38, 79 32 Z M38 20 C45 12, 75 12, 82 20 Z"
            fill="#475569"
            stroke="#1e293b"
            strokeWidth="1.1"
          />

          {/* Chiseled Facial Features (Brow, Nose Bridge, Eyes, Stern Mouth) */}
          {/* Brow & Nose */}
          <path
            d="M45 36 L56 37 M64 37 L75 36 M60 36 L58 48 L63 48"
            stroke="#1e293b"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Nose Highlight */}
          <path d="M60 36 L60 47" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          {/* Eyes */}
          <ellipse cx="50" cy="40" rx="3.2" ry="1.6" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
          <circle cx="50" cy="40" r="1.2" fill="#0f172a" />
          <ellipse cx="70" cy="40" rx="3.2" ry="1.6" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
          <circle cx="70" cy="40" r="1.2" fill="#0f172a" />
          {/* Stern Imperial Mouth & Chin Dimple */}
          <path
            d="M52 54 Q60 52.5 68 54 M57 58 Q60 59.5 63 58"
            stroke="#1e293b"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Royal Golden Diadem Crown on the King's Head */}
          <path
            d="M36 29 L35 19 L45 24 L52 16 L60 23 L68 16 L75 24 L85 19 L84 29 C72 32, 48 32, 36 29 Z"
            fill={`url(#metal-cyl-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Jewels in the King's Diadem */}
          <circle
            cx="60"
            cy="26"
            r="3"
            fill={`url(#gem-${uid})`}
            stroke={metal.highlight}
            strokeWidth="1"
          />
          <circle cx="46" cy="27" r="2.2" fill={`url(#gem-${uid})`} />
          <circle cx="74" cy="27" r="2.2" fill={`url(#gem-${uid})`} />
        </g>
      )}
    </svg>
  )
}
