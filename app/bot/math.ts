export const TAU = Math.PI * 2;

export const clamp = (v: number, lo = 0, hi = 1) =>
  v < lo ? lo : v > hi ? hi : v;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Easing = (t: number) => number;

/**
 * Measured from the reference video: transitions are exponential ease-outs
 * with no body overshoot. Local spring effects (notification pop, eye open)
 * live in the state that needs them.
 */
export const easings = {
  easeOutCubic: (t: number) => 1 - (1 - t) ** 3,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
  easeOutQuint: (t: number) => 1 - (1 - t) ** 5,
} satisfies Record<string, Easing>;

/** Seamless looping 1D noise, used for gaze drift. */
export function loopNoise(t: number, period: number, seed = 0): number {
  const p = (t / period) * TAU;
  return (
    0.55 * Math.sin(p + seed) +
    0.3 * Math.sin(2 * p + seed * 1.7 + 1.1) +
    0.15 * Math.sin(3 * p + seed * 2.3 + 2.4)
  );
}

/** Deterministic PRNG (mulberry32). */
export function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Short rounding: halves generated path-string weight at 60 fps. */
export const r2 = (v: number) => Math.round(v * 100) / 100;

export function mixHex(from: string, to: string, t: number): string {
  const parse = (hex: string): [number, number, number] => {
    const h = hex.replace("#", "");
    if (h.length === 3) {
      return [
        parseInt(h[0]! + h[0], 16),
        parseInt(h[1]! + h[1], 16),
        parseInt(h[2]! + h[2], 16),
      ];
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const a = parse(from);
  const b = parse(to);
  const k = clamp(t);
  const mix = (i: number) => Math.round(a[i]! + (b[i]! - a[i]!) * k);
  const hex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hex(mix(0))}${hex(mix(1))}${hex(mix(2))}`;
}
