let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function playBell(): void {
  const ctx = getAudioContext()

  // Create a pleasant bell-like sound using Web Audio API
  const now = ctx.currentTime

  // Fundamental tone
  const osc1 = ctx.createOscillator()
  const gain1 = ctx.createGain()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(830, now) // ~G#5
  gain1.gain.setValueAtTime(0.3, now)
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 2)
  osc1.connect(gain1)
  gain1.connect(ctx.destination)

  // Harmonic
  const osc2 = ctx.createOscillator()
  const gain2 = ctx.createGain()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1245, now) // ~D#6
  gain2.gain.setValueAtTime(0.15, now)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)

  // High sparkle
  const osc3 = ctx.createOscillator()
  const gain3 = ctx.createGain()
  osc3.type = 'sine'
  osc3.frequency.setValueAtTime(2490, now) // ~D#7
  gain3.gain.setValueAtTime(0.08, now)
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 1)
  osc3.connect(gain3)
  gain3.connect(ctx.destination)

  osc1.start(now)
  osc2.start(now)
  osc3.start(now)
  osc1.stop(now + 2)
  osc2.stop(now + 1.5)
  osc3.stop(now + 1)
}

export function vibrate(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 400])
  }
}

export function tickVibrate(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(8)
  }
}
