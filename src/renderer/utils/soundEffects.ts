/**
 * Sound Effects Utility
 * 
 * Creates spooky sound effects using Web Audio API.
 * No external audio files needed - all sounds are synthesized.
 */

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play a deep, ominous rumble sound (for Initiate Exorcism)
 */
export function playExorcismSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Deep bass rumble
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(60, now);
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.8);
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.8);
  
  // Eerie high tone
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(200, now + 0.6);
  gain2.gain.setValueAtTime(0.15, now);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.6);
}

/**
 * Play a victory/banish sound
 */
export function playVictorySound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Rising triumphant tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

/**
 * Play a defeat/death sound
 */
export function playDefeatSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Descending doom tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);
}

/**
 * Play a click/select sound
 */
export function playClickSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

/**
 * Play a hover sound (subtle)
 */
export function playHoverSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

/**
 * Play a scan/detect sound
 */
export function playScanSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Radar ping
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

/**
 * Play an attack/hit sound
 */
export function playAttackSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Impact sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/**
 * Play a warning/alert sound
 */
export function playWarningSound(): void {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Two-tone alert
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(i === 0 ? 800 : 600, now + i * 0.15);
    gain.gain.setValueAtTime(0.2, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.1);
  }
}
