// Deterministic seeded random - Mulberry32
export function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function randInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
