import {
  FactionId,
  MatchMode,
  PieceInstance,
  PlayerCountOption,
  PlayerState,
  SCULPTED_PIECES,
} from './game-types'

export interface BoardCoord {
  x: number // 0..100 percentage of board width
  y: number // 0..100 percentage of board height
}

// Convert 15x15 row, col to 0..100 percentage
function rcToPercent(row: number, col: number): BoardCoord {
  return {
    x: ((col + 0.5) / 15) * 100,
    y: ((row + 0.5) / 15) * 100,
  }
}

// 52-tile clockwise outer track on standard 15x15 grid
// Index 0 is Bottom-Left (Crimson) start at (row 13, col 6)
export const OUTER_TRACK_4P_RC: [number, number][] = [
  // Bottom arm going up left column (col 6, rows 13..9)
  [13, 6],
  [12, 6],
  [11, 6],
  [10, 6],
  [9, 6],
  // Left arm going left along bottom row (row 8, cols 5..0)
  [8, 5],
  [8, 4],
  [8, 3],
  [8, 2],
  [8, 1],
  [8, 0],
  // Left turn up (row 7, col 0)
  [7, 0],
  // Left arm going right along top row (row 6, cols 0..5) -> index 13 is (6,1) Top-Left start
  [6, 0],
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  // Top arm going up left column (col 6, rows 5..0)
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  // Top turn right (row 0, col 7)
  [0, 7],
  // Top arm going down right column (col 8, rows 0..5) -> index 26 is (1,8) Top-Right start
  [0, 8],
  [1, 8],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  // Right arm going right along top row (row 6, cols 9..14)
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [6, 13],
  [6, 14],
  // Right turn down (row 7, col 14)
  [7, 14],
  // Right arm going left along bottom row (row 8, cols 14..9) -> index 39 is (8,13) Bottom-Right start
  [8, 14],
  [8, 13],
  [8, 12],
  [8, 11],
  [8, 10],
  [8, 9],
  // Bottom arm going down right column (col 8, rows 9..14)
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  // Bottom turn left (row 14, col 7)
  [14, 7],
  // Last outer square before Crimson home stretch (row 14, col 6)
  [14, 6],
]

export const SAFE_INDICES_4P = new Set([0, 8, 13, 21, 26, 34, 39, 47])

// Home stretch lanes for each of the 4 corners (5 steps + 6th step is Black Hole center [7,7])
export const HOME_STRETCH_4P_RC: Record<number, [number, number][]> = {
  // Corner 0 (Bottom-Left / Crimson): goes up col 7 from row 13 to row 9
  0: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
  // Corner 1 (Top-Left / Emerald): goes right along row 7 from col 1 to col 5
  1: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
  ],
  // Corner 2 (Top-Right / Sapphire): goes down col 7 from row 1 to row 5
  2: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
  // Corner 3 (Bottom-Right / Gold): goes left along row 7 from col 13 to col 9
  3: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
  ],
}

// Sanctuary Base 4 pedestal coordinates for each corner on 15x15 board
export const BASE_PEDESTALS_4P_RC: Record<number, [number, number][]> = {
  // Corner 0: Bottom-Left (rows 9..14, cols 0..5)
  0: [
    [10.9, 1.55],
    [10.9, 3.55],
    [13.1, 1.55],
    [13.1, 3.55],
  ],
  // Corner 1: Top-Left (rows 0..5, cols 0..5)
  1: [
    [1.9, 1.55],
    [1.9, 3.55],
    [4.1, 1.55],
    [4.1, 3.55],
  ],
  // Corner 2: Top-Right (rows 0..5, cols 9..14)
  2: [
    [1.9, 10.55],
    [1.9, 12.55],
    [4.1, 10.55],
    [4.1, 12.55],
  ],
  // Corner 3: Bottom-Right (rows 9..14, cols 9..14)
  3: [
    [10.9, 10.55],
    [10.9, 12.55],
    [4.1 + 9, 10.55],
    [4.1 + 9, 12.55],
  ],
}

// ---------------------------------------------------------------------------
// 6-Player Radial Hex-Star Board Geometry (0..100%)
// Aligned so p=0 is Bottom-Left (150°), p=1 is Top-Left (210°), p=2 is North (270°),
// p=3 is Top-Right (330°), p=4 is Bottom-Right (30°), p=5 is South (90°)
// ---------------------------------------------------------------------------
// 48 outer track tiles, 8 per player sector
export const OUTER_TRACK_6P_COORDS: BoardCoord[] = (() => {
  const coords: BoardCoord[] = []
  const total = 48
  for (let i = 0; i < total; i++) {
    // Start at 150 deg (Bottom-Left / South-West) for Player 0
    const angleDeg = 150 + (i / total) * 360
    const angleRad = (angleDeg * Math.PI) / 180
    const sectorPhase = (i % 8) / 8
    // Subtle hex-star indentation
    const starMod = Math.cos(sectorPhase * Math.PI * 2) * 3.8
    const radius = 34.5 + starMod
    coords.push({
      x: 50 + Math.cos(angleRad) * radius,
      y: 50 + Math.sin(angleRad) * radius,
    })
  }
  return coords
})()

export const SAFE_INDICES_6P = new Set([0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44])

export const HOME_STRETCH_6P_COORDS: Record<number, BoardCoord[]> = (() => {
  const stretches: Record<number, BoardCoord[]> = {}
  for (let p = 0; p < 6; p++) {
    const angleDeg = 150 + p * 60
    const angleRad = (angleDeg * Math.PI) / 180
    const radii = [27.5, 22.5, 17.5, 13.0]
    stretches[p] = radii.map((r) => ({
      x: 50 + Math.cos(angleRad) * r,
      y: 50 + Math.sin(angleRad) * r,
    }))
  }
  return stretches
})()

export const BASE_PEDESTALS_6P_COORDS: Record<number, BoardCoord[]> = (() => {
  const bases: Record<number, BoardCoord[]> = {}
  for (let p = 0; p < 6; p++) {
    // Place sanctuaries in the 6 outer alcoves aligned with each player's side station
    const centerAngleDeg = 150 + p * 60 - 22
    const centerRad = (centerAngleDeg * Math.PI) / 180
    const baseCenterX = 50 + Math.cos(centerRad) * 43.2
    const baseCenterY = 50 + Math.sin(centerRad) * 43.2
    const offsets = [
      [-3.5, -4.5],
      [3.5, -4.5],
      [-3.5, 4.5],
      [3.5, 4.5],
    ]
    bases[p] = offsets.map(([dx, dy]) => ({
      x: Math.max(5, Math.min(95, baseCenterX + dx)),
      y: Math.max(5, Math.min(95, baseCenterY + dy)),
    }))
  }
  return bases
})()

// Max steps to reach the Black Hole Singularity
export function getGoalSteps(playerCount: PlayerCountOption): number {
  // 4P/2P: steps 0..50 on outer track (51 tiles), 51..55 on home stretch (5 tiles), 56 = Black Hole Center!
  // 6P: steps 0..45 on outer track (46 tiles), 46..49 on home stretch (4 tiles), 50 = Black Hole Center!
  return playerCount === 6 ? 50 : 56
}

export function getHomeStretchStartStep(playerCount: PlayerCountOption): number {
  return playerCount === 6 ? 46 : 51
}

// Get the corner index (0..3) for a player on the 4-arm board
export function getCornerForPlayer(
  playerIndex: number,
  playerCount: PlayerCountOption
): number {
  if (playerCount === 2) {
    // Opposite corners: Player 0 at Bottom-Left (0), Player 1 at Top-Right (2)
    return playerIndex === 0 ? 0 : 2
  }
  return playerIndex
}

// Get global outer track index for a piece on the outer track
export function getGlobalOuterIndex(
  playerIndex: number,
  stepsMoved: number,
  playerCount: PlayerCountOption
): number | null {
  if (stepsMoved < 0 || stepsMoved >= getHomeStretchStartStep(playerCount)) {
    return null
  }
  if (playerCount === 6) {
    const startOffset = playerIndex * 8
    return (startOffset + stepsMoved) % 48
  } else {
    const corner = getCornerForPlayer(playerIndex, playerCount)
    const startOffset = corner * 13
    return (startOffset + stepsMoved) % 52
  }
}

// Get exact percentage coordinates (0..100) on the board for any piece state
export function getPieceBoardCoord(
  piece: PieceInstance,
  playerCount: PlayerCountOption
): BoardCoord {
  const goalStep = getGoalSteps(playerCount)
  if (piece.isFinished || piece.stepsMoved >= goalStep) {
    // Inside the Black Hole Singularity!
    return { x: 50, y: 50 }
  }

  if (playerCount === 6) {
    if (piece.stepsMoved < 0) {
      return BASE_PEDESTALS_6P_COORDS[piece.playerIndex][piece.sculptIndex]
    }
    if (piece.stepsMoved < 46) {
      const globalIdx = getGlobalOuterIndex(piece.playerIndex, piece.stepsMoved, 6)!
      return OUTER_TRACK_6P_COORDS[globalIdx]
    }
    const stretchIdx = piece.stepsMoved - 46
    return (
      HOME_STRETCH_6P_COORDS[piece.playerIndex][stretchIdx] || { x: 50, y: 50 }
    )
  }

  // 2P or 4P on the 15x15 Altar Board
  const corner = getCornerForPlayer(piece.playerIndex, playerCount)
  if (piece.stepsMoved < 0) {
    const [r, c] = BASE_PEDESTALS_4P_RC[corner][piece.sculptIndex]
    return rcToPercent(r, c)
  }

  if (piece.stepsMoved < 51) {
    const globalIdx = getGlobalOuterIndex(
      piece.playerIndex,
      piece.stepsMoved,
      playerCount
    )!
    const [r, c] = OUTER_TRACK_4P_RC[globalIdx]
    return rcToPercent(r, c)
  }

  const stretchIdx = piece.stepsMoved - 51
  const stretch = HOME_STRETCH_4P_RC[corner]
  if (stretch && stretch[stretchIdx]) {
    const [r, c] = stretch[stretchIdx]
    return rcToPercent(r, c)
  }

  return { x: 50, y: 50 }
}

// Create initial players for a match
export function createMatchPlayers(
  playerCount: PlayerCountOption,
  mode: MatchMode,
  customNames?: string[]
): PlayerState[] {
  const factionOrder: FactionId[] =
    playerCount === 2
      ? ['crimson', 'gold']
      : playerCount === 4
        ? ['crimson', 'emerald', 'sapphire', 'gold']
        : ['crimson', 'emerald', 'sapphire', 'gold', 'amethyst', 'cyan']

  const aiNames = [
    'Lord Malakor',
    'Empress Vaelen',
    'Archon Xylar',
    'Sovereign Kael',
    'Valkyrie Nyx',
  ]

  return factionOrder.map((faction, idx) => {
    const isHuman =
      mode === 'pass-and-play'
        ? true
        : idx === 0 // In AI, Quick Blitz, and Online Arena, Player 0 is the user

    const defaultName =
      idx === 0
        ? customNames?.[0] || 'Emperor (You)'
        : mode === 'pass-and-play'
          ? customNames?.[idx] || `Sovereign ${idx + 1}`
          : aiNames[(idx - 1) % aiNames.length]

    const pieces: PieceInstance[] = SCULPTED_PIECES.map((sculpt, sIdx) => ({
      id: `${faction}-${sculpt.id}`,
      playerIndex: idx,
      faction,
      sculptIndex: sIdx,
      sculptType: sculpt.id,
      // In Quick Blitz mode, the Royal Crown starts ready on the launch rune (step 0)!
      stepsMoved: mode === 'quick-blitz' && sIdx === 0 ? 0 : -1,
      isFinished: false,
    }))

    return {
      index: idx,
      name: defaultName,
      faction,
      isAI: !isHuman,
      avatarSculpt: SCULPTED_PIECES[idx % 4].id,
      pieces,
      finishedCount: 0,
      capturesCount: 0,
    }
  })
}

// Check if a piece can legally move given a dice value (1..6)
export function canPieceMove(
  piece: PieceInstance,
  diceValue: number,
  playerCount: PlayerCountOption
): boolean {
  if (piece.isFinished) return false
  const goalStep = getGoalSteps(playerCount)
  if (piece.stepsMoved === -1) {
    return diceValue === 6
  }
  return piece.stepsMoved + diceValue <= goalStep
}

// Choose the best tactical move for an AI player
export function selectBestAIMove(
  player: PlayerState,
  allPlayers: PlayerState[],
  diceValue: number,
  playerCount: PlayerCountOption
): PieceInstance | null {
  const movable = player.pieces.filter((p) =>
    canPieceMove(p, diceValue, playerCount)
  )
  if (movable.length === 0) return null
  if (movable.length === 1) return movable[0]

  const goalStep = getGoalSteps(playerCount)
  const safeSet = playerCount === 6 ? SAFE_INDICES_6P : SAFE_INDICES_4P

  let bestPiece = movable[0]
  let bestScore = -9999

  for (const piece of movable) {
    let score = 0
    const nextStep = piece.stepsMoved === -1 ? 0 : piece.stepsMoved + diceValue

    // 1. Highest priority: Entering the Black Hole Singularity!
    if (nextStep === goalStep) {
      score += 1000
    }

    // 2. Check if this move captures an opponent's piece
    const nextGlobalIdx = getGlobalOuterIndex(
      player.index,
      nextStep,
      playerCount
    )
    if (nextGlobalIdx !== null && !safeSet.has(nextGlobalIdx)) {
      const opponentsOnTarget = allPlayers
        .filter((op) => op.index !== player.index)
        .flatMap((op) => op.pieces)
        .filter(
          (opPiece) =>
            getGlobalOuterIndex(
              opPiece.playerIndex,
              opPiece.stepsMoved,
              playerCount
            ) === nextGlobalIdx
        )
      if (opponentsOnTarget.length === 1) {
        score += 750
      }
    }

    // 3. Spawning a new sculpted relic from the Sanctuary on a 6
    if (piece.stepsMoved === -1 && diceValue === 6) {
      score += 420
    }

    // 4. Landing on a Star Safe Rune
    if (nextGlobalIdx !== null && safeSet.has(nextGlobalIdx)) {
      score += 240
    }

    // 5. Entering the protected Home Stretch
    if (nextStep >= getHomeStretchStartStep(playerCount)) {
      score += 310
    }

    // 6. Advancing pieces closer to the Black Hole
    score += nextStep * 4

    if (score > bestScore) {
      bestScore = score
      bestPiece = piece
    }
  }

  return bestPiece
}
