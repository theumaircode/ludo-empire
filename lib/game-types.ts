export type PieceSculptType = 'crown' | 'horse' | 'alien' | 'human'

export interface PieceSculptMetadata {
  id: PieceSculptType
  index: number
  name: string
  shortLabel: string
  loreTitle: string
  image: string
  description: string
}

// The 4 Mandatory Hyper-Realistic Sculpted Pieces per Player
export const SCULPTED_PIECES: PieceSculptMetadata[] = [
  {
    id: 'crown',
    index: 0,
    name: 'Sovereign Royal Crown',
    shortLabel: 'CROWN',
    loreTitle: 'The Imperial Diadem',
    image: '/images/piece-crown.jpg',
    description:
      'Forged in 24k heirloom gold with crimson velvet cushion, emeralds, sapphires, and rubies.',
  },
  {
    id: 'horse',
    index: 1,
    name: 'Royal Warhorse Head',
    shortLabel: 'HORSE',
    loreTitle: 'Destrier of the Realm',
    image: '/images/piece-horse.jpg',
    description:
      'Armored silver-and-gold filigree stallion bust set with blood-red cabochon garnets.',
  },
  {
    id: 'alien',
    index: 2,
    name: 'Extraterrestrial Archon',
    shortLabel: 'ALIEN',
    loreTitle: 'Void-Born Overseer',
    image: '/images/piece-alien.jpg',
    description:
      'Ancient cosmic bronze bust with horned filigree crest and bioluminescent cyan Singularity gems.',
  },
  {
    id: 'human',
    index: 3,
    name: 'High King Human Bust',
    shortLabel: 'HUMAN',
    loreTitle: 'First Mortal Emperor',
    image: '/images/piece-human.jpg',
    description:
      'Weathered bronze and ornate gold-engraved portrait bust crowned with crimson rubies.',
  },
]

export type FactionId = 'crimson' | 'emerald' | 'gold' | 'sapphire' | 'amethyst' | 'cyan'

export interface FactionConfig {
  id: FactionId
  name: string
  shortName: string
  primaryHex: string
  secondaryHex: string
  glowHex: string
  bgTint: string
  borderClass: string
  textClass: string
  badgeBg: string
}

export const FACTIONS: Record<FactionId, FactionConfig> = {
  crimson: {
    id: 'crimson',
    name: 'Crimson Imperium',
    shortName: 'Crimson',
    primaryHex: '#dc2626',
    secondaryHex: '#7f1d1d',
    glowHex: '#f87171',
    bgTint: 'rgba(185, 28, 28, 0.25)',
    borderClass: 'border-red-500/60',
    textClass: 'text-red-400',
    badgeBg: 'bg-red-950/80',
  },
  emerald: {
    id: 'emerald',
    name: 'Sylvan Emerald',
    shortName: 'Emerald',
    primaryHex: '#10b981',
    secondaryHex: '#064e3b',
    glowHex: '#34d399',
    bgTint: 'rgba(16, 185, 129, 0.25)',
    borderClass: 'border-emerald-500/60',
    textClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Astral Sapphire',
    shortName: 'Sapphire',
    primaryHex: '#3b82f6',
    secondaryHex: '#1e3a8a',
    glowHex: '#60a5fa',
    bgTint: 'rgba(59, 130, 246, 0.25)',
    borderClass: 'border-blue-500/60',
    textClass: 'text-blue-400',
    badgeBg: 'bg-blue-950/80',
  },
  gold: {
    id: 'gold',
    name: 'Solar Aurum',
    shortName: 'Solar Gold',
    primaryHex: '#eab308',
    secondaryHex: '#713f12',
    glowHex: '#facc15',
    bgTint: 'rgba(234, 179, 8, 0.25)',
    borderClass: 'border-amber-400/60',
    textClass: 'text-amber-300',
    badgeBg: 'bg-amber-950/80',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Void Amethyst',
    shortName: 'Amethyst',
    primaryHex: '#a855f7',
    secondaryHex: '#4c1d95',
    glowHex: '#c084fc',
    bgTint: 'rgba(168, 85, 247, 0.25)',
    borderClass: 'border-purple-500/60',
    textClass: 'text-purple-400',
    badgeBg: 'bg-purple-950/80',
  },
  cyan: {
    id: 'cyan',
    name: 'Nebula Cyan',
    shortName: 'Nebula',
    primaryHex: '#06b6d4',
    secondaryHex: '#164e63',
    glowHex: '#22d3ee',
    bgTint: 'rgba(6, 182, 212, 0.25)',
    borderClass: 'border-cyan-500/60',
    textClass: 'text-cyan-300',
    badgeBg: 'bg-cyan-950/80',
  },
}

// Working Skins System (Board, Pieces, Dice, UI/Environment)
export type BoardSkinId = 'eldergrove' | 'obsidian' | 'jade' | 'astral'
export type PieceSkinId = 'heirloom-gold' | 'dark-damascus' | 'solar-aurum' | 'sylvan-relic'
export type DiceSkinId = 'ruby-diamond' | 'singularity-void' | 'emerald-dragon' | 'celestial-ivory'
export type EnvironmentSkinId = 'bioluminescent-forest' | 'eclipse-singularity' | 'blood-moon-altar'

export interface BoardSkinConfig {
  id: BoardSkinId
  name: string
  subtitle: string
  woodGradient: string
  stoneBorder: string
  tileBase: string
  tileBorder: string
  runeColor: string
  goldTrim: string
  costGold: number
}

export const BOARD_SKINS: Record<BoardSkinId, BoardSkinConfig> = {
  eldergrove: {
    id: 'eldergrove',
    name: 'Ancient Eldergrove Altar',
    subtitle: 'Carved walnut, antique brass filigree & glowing Futhark runes',
    woodGradient: 'linear-gradient(135deg, #2d1c10 0%, #1a1008 50%, #26170c 100%)',
    stoneBorder: 'linear-gradient(180deg, #2c302e 0%, #141715 100%)',
    tileBase: 'rgba(34, 22, 12, 0.92)',
    tileBorder: 'rgba(212, 175, 55, 0.42)',
    runeColor: '#f59e0b',
    goldTrim: '#d4af37',
    costGold: 0,
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Void Monolith',
    subtitle: 'Volcanic black basalt, brushed platinum & singularity violet runes',
    woodGradient: 'linear-gradient(135deg, #11131a 0%, #07080d 50%, #151722 100%)',
    stoneBorder: 'linear-gradient(180deg, #1e1b2e 0%, #09080f 100%)',
    tileBase: 'rgba(15, 17, 26, 0.94)',
    tileBorder: 'rgba(168, 85, 247, 0.48)',
    runeColor: '#c084fc',
    goldTrim: '#cbd5e1',
    costGold: 0,
  },
  jade: {
    id: 'jade',
    name: 'Imperial Jade Sanctuary',
    subtitle: 'Polished deep emerald jadeite, 24k royal gold & bioluminescent runes',
    woodGradient: 'linear-gradient(135deg, #092218 0%, #04120c 50%, #0c2b1e 100%)',
    stoneBorder: 'linear-gradient(180deg, #132a20 0%, #07120d 100%)',
    tileBase: 'rgba(8, 28, 20, 0.93)',
    tileBorder: 'rgba(52, 211, 153, 0.45)',
    runeColor: '#34d399',
    goldTrim: '#facc15',
    costGold: 500,
  },
  astral: {
    id: 'astral',
    name: 'Celestial Astral Marble',
    subtitle: 'Starlight dark veined marble, rose-gold constellations & solar runes',
    woodGradient: 'linear-gradient(135deg, #1e162b 0%, #0d0914 50%, #241934 100%)',
    stoneBorder: 'linear-gradient(180deg, #2b1d38 0%, #120b18 100%)',
    tileBase: 'rgba(26, 18, 38, 0.93)',
    tileBorder: 'rgba(244, 114, 182, 0.45)',
    runeColor: '#fbbf24',
    goldTrim: '#f472b6',
    costGold: 1000,
  },
}

export interface PieceSkinConfig {
  id: PieceSkinId
  name: string
  subtitle: string
  imageFilter: string
  rimGradient: string
  pedestalGlow: string
  costGold: number
}

export const PIECE_SKINS: Record<PieceSkinId, PieceSkinConfig> = {
  'heirloom-gold': {
    id: 'heirloom-gold',
    name: 'Royal Heirloom Gold',
    subtitle: 'Original hyper-realistic antique gold, ruby velvet & turquoise cabochons',
    imageFilter: 'contrast(1.08) saturate(1.12)',
    rimGradient: 'linear-gradient(135deg, #fde68a, #b45309, #fef08a)',
    pedestalGlow: 'rgba(245, 158, 11, 0.55)',
    costGold: 0,
  },
  'dark-damascus': {
    id: 'dark-damascus',
    name: 'Dark Matter Damascus',
    subtitle: 'Shadow-forged obsidian bronze with plasma violet luminescence',
    imageFilter: 'contrast(1.22) saturate(1.25) hue-rotate(255deg) brightness(0.95)',
    rimGradient: 'linear-gradient(135deg, #e9d5ff, #6b21a8, #c084fc)',
    pedestalGlow: 'rgba(168, 85, 247, 0.65)',
    costGold: 0,
  },
  'solar-aurum': {
    id: 'solar-aurum',
    name: 'Solar Sovereign Aurum',
    subtitle: 'Radiant sun-forged 24k gold with blazing diamond fire',
    imageFilter: 'contrast(1.15) saturate(1.45) sepia(0.28) brightness(1.12)',
    rimGradient: 'linear-gradient(135deg, #ffffff, #eab308, #fef08a)',
    pedestalGlow: 'rgba(250, 204, 21, 0.7)',
    costGold: 600,
  },
  'sylvan-relic': {
    id: 'sylvan-relic',
    name: 'Bioluminescent Sylvan',
    subtitle: 'Ancient forest bronze infused with living emerald & cyan mana',
    imageFilter: 'contrast(1.15) saturate(1.3) hue-rotate(115deg)',
    rimGradient: 'linear-gradient(135deg, #a7f3d0, #047857, #22d3ee)',
    pedestalGlow: 'rgba(16, 185, 129, 0.65)',
    costGold: 800,
  },
}

export interface DiceSkinConfig {
  id: DiceSkinId
  name: string
  subtitle: string
  frameGradient: string
  coreBg: string
  pipColor: string
  pipGlow: string
  costGold: number
}

export const DICE_SKINS: Record<DiceSkinId, DiceSkinConfig> = {
  'ruby-diamond': {
    id: 'ruby-diamond',
    name: 'Imperial Ruby & Diamond',
    subtitle: 'Carved 24k gold filigree shell over crimson ruby core & diamond pips',
    frameGradient: 'linear-gradient(135deg, #fef08a 0%, #b45309 50%, #78350f 100%)',
    coreBg: 'radial-gradient(circle, #7f1d1d 0%, #2a0606 100%)',
    pipColor: '#ffffff',
    pipGlow: '#fde047',
    costGold: 0,
  },
  'singularity-void': {
    id: 'singularity-void',
    name: 'Singularity Eventide',
    subtitle: 'Blackened celestial gold filigree over dark matter core & violet starlight pips',
    frameGradient: 'linear-gradient(135deg, #e9d5ff 0%, #581c87 50%, #1e1b4b 100%)',
    coreBg: 'radial-gradient(circle, #3b0764 0%, #090314 100%)',
    pipColor: '#f3e8ff',
    pipGlow: '#c084fc',
    costGold: 0,
  },
  'emerald-dragon': {
    id: 'emerald-dragon',
    name: 'Emerald Dragonscale',
    subtitle: 'Ornate brass scrollwork over deep forest emerald & solar gold pips',
    frameGradient: 'linear-gradient(135deg, #fde68a 0%, #065f46 55%, #022c22 100%)',
    coreBg: 'radial-gradient(circle, #064e3b 0%, #021c15 100%)',
    pipColor: '#fef08a',
    pipGlow: '#34d399',
    costGold: 450,
  },
  'celestial-ivory': {
    id: 'celestial-ivory',
    name: 'Astral Platinum Relic',
    subtitle: 'Engraved platinum filigree with deep sapphire core & cyan diamond pips',
    frameGradient: 'linear-gradient(135deg, #f8fafc 0%, #475569 55%, #0f172a 100%)',
    coreBg: 'radial-gradient(circle, #1e3a8a 0%, #070e24 100%)',
    pipColor: '#e0f2fe',
    pipGlow: '#38bdf8',
    costGold: 750,
  },
}

export interface EnvironmentSkinConfig {
  id: EnvironmentSkinId
  name: string
  subtitle: string
  sporeColor1: string
  sporeColor2: string
  fogTint: string
  accentHex: string
  costGold: number
}

export const ENVIRONMENT_SKINS: Record<EnvironmentSkinId, EnvironmentSkinConfig> = {
  'bioluminescent-forest': {
    id: 'bioluminescent-forest',
    name: 'Mysterious Eldergrove Forest',
    subtitle: 'Ancient misty roots, glowing mushrooms, fireflies & cosmic singularity',
    sporeColor1: '#f59e0b',
    sporeColor2: '#10b981',
    fogTint: 'rgba(6, 24, 18, 0.45)',
    accentHex: '#d4af37',
    costGold: 0,
  },
  'eclipse-singularity': {
    id: 'eclipse-singularity',
    name: 'Singularity Horizon Forest',
    subtitle: 'Deep twilight forest bathed in violet accretion radiation & starlight',
    sporeColor1: '#c084fc',
    sporeColor2: '#38bdf8',
    fogTint: 'rgba(18, 8, 36, 0.5)',
    accentHex: '#a855f7',
    costGold: 0,
  },
  'blood-moon-altar': {
    id: 'blood-moon-altar',
    name: 'Crimson Eclipse Sanctuary',
    subtitle: 'Ember-lit ancient woods under a sovereign blood eclipse',
    sporeColor1: '#ef4444',
    sporeColor2: '#f59e0b',
    fogTint: 'rgba(34, 8, 10, 0.5)',
    accentHex: '#ef4444',
    costGold: 600,
  },
}

// Piece state in an active match
export interface PieceInstance {
  id: string
  playerIndex: number
  faction: FactionId
  sculptIndex: number // 0 = crown, 1 = horse, 2 = alien, 3 = human
  sculptType: PieceSculptType
  // progress: -1 = in Sanctuary Base, 0..trackMax = on outer track / home lane, 999 = Ascended into Black Hole
  stepsMoved: number
  isFinished: boolean
  justFinishedAt?: number
}

export interface PlayerState {
  index: number
  name: string
  faction: FactionId
  isAI: boolean
  avatarSculpt: PieceSculptType
  pieces: PieceInstance[]
  finishedCount: number
  capturesCount: number
  rank?: number
}

export type PlayerCountOption = 2 | 4 | 6
export type MatchMode = 'ai' | 'pass-and-play' | 'quick-blitz' | 'online-arena'
