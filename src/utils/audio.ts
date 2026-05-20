// Web Audio API Synthesizer to output live sound effects
// Keeps the app fully immersive and responsive with no external audio file load risks.

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Woody tick / click sound
export function playTick(pitch: number = 200, duration: number = 0.05, volume: number = 0.4) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Realistic woodblock click: short wood decay
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// Bell chime success sound
export function playSuccess() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Arpeggio chime sound
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4-E4-G4-C5-E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// Low wood bump (fail / try again)
export function playLowBump() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}

// Block tossing/rolling physical sound
export function playToss() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Simulate multiple fast rattle clicks before landing
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.06;
      setTimeout(() => {
        const pitch = 220 - i * 15 + Math.random() * 40;
        playTick(pitch, 0.04, 0.25 - i * 0.02);
      }, delay * 1000);
    }
  } catch (e) {
    console.warn('Audio play failed', e);
  }
}
