import type { Look } from "./engine";
import { clamp, easings } from "./math";

export const YAW_MAX = 16;
export const PITCH_MAX = 13;
export const PITCH = 10;
export const TURN = 26;
export const SPIN = 360;
export const TURN_TIME = 1.1;

export type GazeScript = (t: number) => Look;

/**
 * Arrival spin: the ball looks like it turns in place.
 * `mix` stays 0 — no direction is imposed, only `spin` melts, so the eyes
 * pass behind the ball and land exactly where the rest pose puts them.
 */
export const TOUR_TIME = 1.5;

export const tourLook: GazeScript = (t) => ({
  yaw: 0,
  pitch: 0,
  mix: 0,
  spin: SPIN * (1 - easings.easeInOutCubic(clamp(t / TOUR_TIME))),
  wander: 1,
});

export interface Aim {
  nx: number;
  ny: number;
  tour: number;
  pointer: boolean;
}

export function lookTarget({ nx, ny, tour, pointer }: Aim): Look {
  return {
    yaw: -TURN + nx * YAW_MAX,
    pitch: PITCH - ny * PITCH_MAX,
    mix: tour,
    spin: SPIN * (1 - tour),
    wander: pointer ? 0 : 1,
  };
}

/** Welcome-stage follow: pointer aims in place, no settings-panel turn. */
export function followLook({
  nx,
  ny,
  pointer,
}: {
  nx: number;
  ny: number;
  pointer: boolean;
}): Look {
  if (!pointer) {
    return { yaw: 0, pitch: 0, mix: 0, spin: 0, wander: 1 };
  }
  return {
    yaw: nx * YAW_MAX,
    pitch: PITCH - ny * PITCH_MAX,
    mix: 1,
    spin: 0,
    wander: 0,
  };
}
