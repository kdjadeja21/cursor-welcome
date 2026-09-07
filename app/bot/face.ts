import { clamp, createRng, loopNoise } from "./math";

/**
 * Eyes are painted on a sphere, not laid flat.
 *
 * Measured: the near-limb eye is 0.69× the other in width and 0.663× in area —
 * the depth factor (z = 0.669) of a sphere point at that distance. Each eye
 * gets the sphere's tangent frame, orthographically projected.
 *
 * Constants come from fitting the model to frame-by-frame positions and sizes
 * (residual ~1 px on a 190 px radius).
 */

type Vec3 = [number, number, number];

/** Half-separation of the eyes on the sphere, degrees (total ~31°). */
export const EYE_SPLIT = 15.46;
/** Resting eye size, in ball-radius units. */
export const EYE_W = 0.186;
export const EYE_H = 0.412;

/** Resting head orientation, fitted on the reference frames. */
export const REST_GAZE: HeadGaze = { yaw: 28.49, pitch: 28.62, roll: -13 };

export interface EyePose {
  x: number;
  y: number;
  /** tangent 2×2 matrix: [a b c d] as SVG matrix(a,b,c,d,e,f) */
  a: number;
  b: number;
  c: number;
  d: number;
  /** z of the normal: > 0 = facing the camera */
  depth: number;
}

export interface HeadGaze {
  /** yaw, degrees, positive = looking right */
  yaw: number;
  /** pitch, degrees, positive = looking up */
  pitch: number;
  /** roll, degrees, head tilt */
  roll: number;
}

const deg = (d: number) => (d * Math.PI) / 180;

function spin(u: Vec3, v: Vec3, angle: number): [Vec3, Vec3] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s],
    [v[0] * c - u[0] * s, v[1] * c - u[1] * s, v[2] * c - u[2] * s],
  ];
}

/**
 * Head frame, then both eyes.
 * Screen: x right, y down, z toward the viewer.
 * Index 0 is the inner eye, 1 the outer.
 */
export function eyePoses(
  gaze: HeadGaze,
  scale: number,
  split = EYE_SPLIT,
): [EyePose, EyePose] {
  let f: Vec3 = [0, 0, 1];
  let right: Vec3 = [1, 0, 0];
  let down: Vec3 = [0, 1, 0];

  const yawed = spin(f, right, deg(gaze.yaw));
  f = yawed[0];
  right = yawed[1];
  const pitched = spin(down, f, deg(gaze.pitch));
  down = pitched[0];
  f = pitched[1];
  const rolled = spin(right, down, deg(gaze.roll));
  right = rolled[0];
  down = rolled[1];

  const build = (side: number): EyePose => {
    const [ef, er] = spin(f, right, deg(split * side));
    return {
      x: ef[0] * scale,
      y: ef[1] * scale,
      a: er[0],
      b: er[1],
      c: down[0],
      d: down[1],
      depth: ef[2],
    };
  };

  return [build(-1), build(1)];
}

export interface Liveliness {
  dYaw: number;
  dPitch: number;
  dRoll: number;
  /** 1 = open, 0 = closed (vertical squash in screen space) */
  lid: number;
  driftX: number;
  driftY: number;
  breath: number;
}

const BLINK_RNG = createRng(0x5eed);
/** Pre-drawn blink schedule: deterministic, no internal state. */
const BLINKS: number[] = (() => {
  const out: number[] = [];
  let t = 1.4;
  while (t < 900) {
    out.push(t);
    t += 1.9 + BLINK_RNG() * 2.7;
    if (BLINK_RNG() < 0.18) {
      out.push(t);
      t += 0.24;
    }
  }
  return out;
})();

/** Measured: 1–2 frames at 10 fps. */
const BLINK_DUR = 0.18;

function blinkLid(t: number): number {
  for (let i = 0; i < BLINKS.length; i++) {
    const start = BLINKS[i]!;
    if (t < start) break;
    const k = (t - start) / BLINK_DUR;
    if (k >= 0 && k <= 1) {
      return k < 0.45 ? 1 - k / 0.45 : (k - 0.45) / 0.55;
    }
  }
  return 1;
}

export interface LivelinessOptions {
  wander?: number;
  blink?: boolean;
  float?: boolean;
}

export function liveliness(t: number, opt: LivelinessOptions = {}): Liveliness {
  const { wander = 1, blink = true, float = true } = opt;

  return {
    dYaw: (loopNoise(t, 11.3, 0.4) * 5.5 + loopNoise(t, 3.7, 2.1) * 1.6) * wander,
    dPitch:
      (loopNoise(t, 9.1, 1.3) * 4.2 + loopNoise(t, 4.3, 0.7) * 1.3) * wander,
    dRoll: loopNoise(t, 13.7, 3.2) * 2.2 * wander,
    lid: blink ? blinkLid(t) : 1,
    driftX: float ? loopNoise(t, 7.9, 1.9) * 0.006 : 0,
    driftY: float ? loopNoise(t, 5.3, 0.3) * 0.007 : 0,
    breath: float ? 1 + Math.sin((t / 3.4) * Math.PI * 2) * 0.005 : 1,
  };
}

/**
 * Blink is a VERTICAL squash in screen space around the eye centre
 * (bbox width kept, height falls to ~0.35), composed after the tangent matrix.
 */
export function blinkScale(lid: number): number {
  return 0.06 + 0.94 * clamp(lid);
}
