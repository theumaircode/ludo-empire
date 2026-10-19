'use client'

// Procedural AAA Web Audio Synthesizer for LUDO EMPIRE
class SoundEngine {
  private ctx: AudioContext | null = null
  public enabled: boolean = true

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  public playStudioIntro() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Deep sub-bass impact like KRAFTON / cinematic studio logo
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(95, now)
    osc.frequency.exponentialRampToValueAtTime(32, now + 1.8)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.45, now + 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 2.25)

    // Metallic harmonic shimmer
    const freqs = [220, 330, 440, 659.25]
    freqs.forEach((f, idx) => {
      const hOsc = ctx.createOscillator()
      const hGain = ctx.createGain()
      hOsc.type = 'triangle'
      hOsc.frequency.setValueAtTime(f, now + 0.15 + idx * 0.06)
      hGain.gain.setValueAtTime(0.001, now + 0.15 + idx * 0.06)
      hGain.gain.linearRampToValueAtTime(0.06, now + 0.4 + idx * 0.06)
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1)
      hOsc.connect(hGain)
      hGain.connect(ctx.destination)
      hOsc.start(now + 0.15 + idx * 0.06)
      hOsc.stop(now + 2.15)
    })
  }

  public playUiClick() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(620, now)
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.065)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.075)
  }

  public playDiceRoll() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    // Multiple heavy gold-on-walnut clatter impulses
    const hits = [0, 0.08, 0.16, 0.25, 0.34, 0.44, 0.54]
    hits.forEach((offset, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = i % 2 === 0 ? 'square' : 'triangle'
      osc.frequency.setValueAtTime(280 + Math.random() * 220, now + offset)
      osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.055)
      gain.gain.setValueAtTime(0.14 * (1 - i * 0.08), now + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + offset)
      osc.stop(now + offset + 0.065)
    })
  }

  public playDiceSix() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [440, 554.37, 659.25, 880]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.055)
      gain.gain.setValueAtTime(0.14, now + idx * 0.055)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.055)
      osc.stop(now + idx * 0.055 + 0.36)
    })
  }

  public playPieceStep() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(340, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09)
    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.11)
  }

  public playPieceSpawn() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const notes = [293.66, 440, 587.33]
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + i * 0.07)
      gain.gain.setValueAtTime(0.16, now + i * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.07)
      osc.stop(now + i * 0.07 + 0.32)
    })
  }

  public playPieceCapture() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    // Heavy metallic sword/relic impact + low boom
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.45)
    gain.gain.setValueAtTime(0.28, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  }

  public playBlackHoleAbsorb() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    // Cosmic gravitational sweep into singularity + ring resonance
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.65)
    osc.frequency.exponentialRampToValueAtTime(48, now + 1.15)
    gain.gain.setValueAtTime(0.01, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 1.25)
  }

  public playVictoryFanfare() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const chord = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]
    chord.forEach((f, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + idx * 0.1)
      gain.gain.setValueAtTime(0.18, now + idx * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.1 + 1.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.1)
      osc.stop(now + idx * 0.1 + 1.45)
    })
  }

  public playWheelTick() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(920, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  }
}

export const soundEngine = new SoundEngine()
