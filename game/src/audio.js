// WebAudio synthesized sounds for Lantern Tide. Safe to import in Node (headless
// tests): every entry point becomes a no-op when there is no AudioContext.
let ctx = null;
let muted = false;
const hasAudio = typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);

export function initAudio() {
  if (!hasAudio || ctx) return;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
}

function getCtx() {
  if (!hasAudio) return null;
  if (!ctx) initAudio();
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq, duration, type = 'sine', gain = 0.3, attack = 0.01, decay = 0.05) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.linearRampToValueAtTime(0, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

function noise(duration, gain = 0.2) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  src.connect(g);
  g.connect(c.destination);
  src.start();
}

export function setMuted(val) { muted = val; }
export function isMuted() { return muted; }

export function playChop() {
  noise(0.08, 0.15);
  beep(400, 0.05, 'square', 0.1);
  beep(600, 0.05, 'square', 0.08);
}

export function playFry() {
  noise(0.3, 0.12);
  beep(200, 0.2, 'sawtooth', 0.05);
}

export function playSteam() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      noise(0.12, 0.08);
      beep(800 + Math.random() * 200, 0.1, 'sine', 0.06);
    }, i * 80);
  }
}

export function playPickup() {
  beep(600, 0.06, 'sine', 0.15);
  beep(900, 0.06, 'sine', 0.12);
}

export function playDrop() {
  beep(400, 0.08, 'triangle', 0.12);
  beep(300, 0.08, 'triangle', 0.1);
}

export function playServe() {
  beep(523, 0.1, 'sine', 0.2);
  beep(659, 0.1, 'sine', 0.18);
  beep(784, 0.15, 'sine', 0.16);
}

export function playBurn() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      noise(0.2, 0.15);
      beep(150, 0.15, 'sawtooth', 0.06);
    }, i * 60);
  }
}

export function playOrder() {
  beep(440, 0.08, 'square', 0.15);
  setTimeout(() => beep(554, 0.08, 'square', 0.12), 100);
  setTimeout(() => beep(659, 0.12, 'square', 0.1), 200);
}

export function playTrash() {
  beep(300, 0.1, 'sawtooth', 0.1);
  beep(200, 0.15, 'sawtooth', 0.08);
}

export function playCombo(mult) {
  const freqs = [523, 659, 784, 1047];
  freqs.slice(0, Math.min(mult, 4)).forEach((f, i) => {
    setTimeout(() => beep(f, 0.12, 'sine', 0.2), i * 80);
  });
}

export function playTimer() {
  beep(330, 0.08, 'sine', 0.2);
}

export function playShiftEnd() {
  beep(440, 0.2, 'sine', 0.25);
  setTimeout(() => beep(554, 0.2, 'sine', 0.22), 200);
  setTimeout(() => beep(659, 0.3, 'sine', 0.2), 400);
}
