/**
 * Morphing mascot engine, ported from the MIT-licensed bloub recreation
 * (jeremy-prt/bloub). Constants are measurements from the x.ai/bot reference
 * video — rounding them breaks the resemblance.
 *
 * `sample(t)` is a pure function of time: pause, resume, and jumping to an
 * arbitrary date produce the same image.
 */

import { arcRender, type ArcRender, type DotRender } from "./decor";
import { blinkScale, eyePoses, liveliness } from "./face";
import { clamp, easings, lerp, r2 } from "./math";
import {
  blend,
  capsulePath,
  closedPath,
  radiusAtAngle,
  toPoints,
  type Point,
  type Silhouette,
} from "./shape";
import { STATE_BY_ID, type Pose, type StateDef, type StateId } from "./states";

export interface RenderedEye {
  d: string;
  matrix: string;
  alpha: number;
}

export interface BotFrame {
  bodyPath: string;
  bodyAlpha: number;
  eyes: RenderedEye[];
  dots: DotRender[];
  dotsBehind: boolean;
  arcs: ArcRender[];
  notif: { x: number; y: number; r: number } | null;
  notch: { x: number; y: number; r: number } | null;
}

/**
 * External gaze (pointer). `yaw`/`pitch` are ABSOLUTE and replace the pose's
 * as `mix` rises. `wander` is leftover automatic drift — not the same as mix.
 * `spin` is a turn taken on the way, in degrees; -360° lands on the same pose.
 */
export interface Look {
  yaw: number;
  pitch: number;
  mix: number;
  spin: number;
  wander: number;
}

const NO_LOOK: Look = { yaw: 0, pitch: 0, mix: 0, spin: 0, wander: 1 };

const lerpLook = (a: Look, b: Look, t: number): Look => ({
  yaw: lerp(a.yaw, b.yaw, t),
  pitch: lerp(a.pitch, b.pitch, t),
  mix: lerp(a.mix, b.mix, t),
  spin: lerp(a.spin, b.spin, t),
  wander: lerp(a.wander, b.wander, t),
});

const lerpEye = (a: Pose["eyes"][number], b: Pose["eyes"][number], t: number) => ({
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  open: lerp(a.open, b.open, t),
  tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, t),
});

function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out = 1 - t;
  return {
    sil: blend(a.sil, b.sil, t),
    offX: lerp(a.offX, b.offX, t),
    offY: lerp(a.offY, b.offY, t),
    gaze: {
      yaw: lerp(a.gaze.yaw, b.gaze.yaw, t),
      pitch: lerp(a.gaze.pitch, b.gaze.pitch, t),
      roll: lerp(a.gaze.roll, b.gaze.roll, t),
    },
    split: lerp(a.split, b.split, t),
    eyes: [lerpEye(a.eyes[0], b.eyes[0], t), lerpEye(a.eyes[1], b.eyes[1], t)],
    eyeAlpha: lerp(a.eyeAlpha, b.eyeAlpha, t),
    bodyAlpha: lerp(a.bodyAlpha, b.bodyAlpha, t),
    dots: [
      ...a.dots.map((d) => ({ ...d, opacity: d.opacity * out })),
      ...b.dots.map((d) => ({ ...d, opacity: d.opacity * t })),
    ],
    arcs: [
      ...a.arcs.map((r) => ({ ...r, id: `a${r.id}`, opacity: r.opacity * out })),
      ...b.arcs.map((r) => ({ ...r, id: `b${r.id}`, opacity: r.opacity * t })),
    ],
    notif: t < 0.5 ? a.notif : b.notif,
    dotsBehind: t < 0.5 ? a.dotsBehind : b.dotsBehind,
  };
}

function requireState(id: StateId): StateDef {
  const def = STATE_BY_ID.get(id);
  if (!def) throw new Error(`Unknown bot state: ${id}`);
  return def;
}

export class BotEngine {
  readonly scale: number;

  private cur: StateId;
  private prev: StateId | null = null;
  private frozenOrigin: Pose | null = null;
  private tCur = 0;
  private tPrev = 0;
  private blinkAt = -10;
  private pts: Point[] = [];
  private look: Look = NO_LOOK;
  private lookPrev: Look = NO_LOOK;
  private lookAt = -10;
  private lookMorph = 0.24;

  static readonly LOOK_MORPH = 0.24;

  constructor(scale = 100, initial: StateId = "idle") {
    this.scale = scale;
    this.cur = initial;
  }

  setLook(look: Look | null, now: number, morph = BotEngine.LOOK_MORPH) {
    if (
      look &&
      !Number.isFinite(look.yaw + look.pitch + look.mix + look.spin + look.wander)
    ) {
      return;
    }
    this.lookPrev = this.lookAtTime(now);
    this.look = look ?? NO_LOOK;
    this.lookAt = now;
    this.lookMorph = morph;
  }

  private lookAtTime(now: number): Look {
    const k = (now - this.lookAt) / this.lookMorph;
    if (k >= 1) return this.look;
    return lerpLook(this.lookPrev, this.look, easings.easeOutQuint(clamp(k)));
  }

  private posed(def: StateDef, t: number): Pose {
    return def.pose(t);
  }

  get state(): StateId {
    return this.cur;
  }

  reset(id: StateId, now: number) {
    this.cur = id;
    this.prev = null;
    this.frozenOrigin = null;
    this.tCur = now;
    this.tPrev = now;
    this.blinkAt = -10;
  }

  private origin(now: number): Pose | null {
    if (this.frozenOrigin) return this.frozenOrigin;
    if (!this.prev) return null;
    const prevDef = requireState(this.prev);
    return this.posed(prevDef, Math.max(0, now - this.tPrev));
  }

  private composedPose(now: number): Pose {
    const def = requireState(this.cur);
    const pose = this.posed(def, Math.max(0, now - this.tCur));
    const since = now - this.tCur;
    if (since >= def.morph) return pose;
    const from = this.origin(now);
    if (!from) return pose;
    return blendPose(from, pose, easings.easeOutQuint(clamp(since / def.morph)));
  }

  setState(id: StateId, now: number) {
    if (id === this.cur) return;
    const morph = requireState(this.cur).morph;
    const midFade = this.prev !== null && now - this.tCur < morph;
    this.frozenOrigin = midFade ? this.composedPose(now) : null;
    this.prev = this.cur;
    this.tPrev = this.tCur;
    this.cur = id;
    this.tCur = now;
    if (requireState(id).blinkIn) this.blinkAt = now;
  }

  sample(now: number): BotFrame {
    const R = this.scale;
    const def = requireState(this.cur);
    let pose = this.posed(def, Math.max(0, now - this.tCur));

    const since = now - this.tCur;
    const from = since < def.morph ? this.origin(now) : null;
    if (from) {
      const ratio = easings.easeOutQuint(clamp(since / def.morph));
      pose = blendPose(from, pose, ratio);
    }

    const alive = pose.eyeAlpha > 0.01;
    const look = this.lookAtTime(now);
    const life = liveliness(now, { wander: alive ? look.wander : 0, blink: alive });

    const gaze = {
      yaw: lerp(pose.gaze.yaw, look.yaw, look.mix) + life.dYaw - look.spin,
      pitch: lerp(pose.gaze.pitch, look.pitch, look.mix) + life.dPitch,
      roll: pose.gaze.roll + life.dRoll,
    };

    const forced = clamp((now - this.blinkAt) / 0.2);
    const forcedLid = forced < 1 ? Math.abs(forced * 2 - 1) : 1;
    const lid = Math.min(life.lid, forcedLid);

    const offX = pose.offX + life.driftX;
    const offY = pose.offY + life.driftY;

    const sil: Silhouette = {
      ...pose.sil,
      cx: pose.sil.cx + offX,
      cy: pose.sil.cy + offY,
      sy: pose.sil.sy * life.breath,
    };
    const bodyPath = closedPath(toPoints(sil, R, this.pts));

    const bodyRadius = (x: number, y: number) =>
      radiusAtAngle(pose.sil.radii, Math.atan2(y, x) - pose.sil.rot);

    const eyes: RenderedEye[] = [];
    if (pose.eyeAlpha > 0.01) {
      const poses = eyePoses(gaze, R, pose.split);
      for (let i = 0; i < 2; i++) {
        const e = poses[i]!;
        if (e.depth <= 0.02) continue;
        const cfg = pose.eyes[i]!;
        const fit = bodyRadius(e.x, e.y);
        const phi = ((cfg.tilt ?? 0) * Math.PI) / 180;
        const cp = Math.cos(phi);
        const sp = Math.sin(phi);
        const ax = e.a * cp + e.c * sp;
        const ay = e.b * cp + e.d * sp;
        const cx2 = -e.a * sp + e.c * cp;
        const cy2 = -e.b * sp + e.d * cp;
        const k = blinkScale(Math.min(lid, cfg.open));
        eyes.push({
          d: capsulePath(cfg.w * R, cfg.h * R),
          matrix: `matrix(${r2(ax)},${r2(ay * k)},${r2(cx2)},${r2(cy2 * k)},${r2(e.x * fit + offX * R)},${r2(e.y * fit + offY * R)})`,
          alpha: pose.eyeAlpha * clamp(e.depth / 0.12),
        });
      }
    }

    const dots = pose.dots
      .filter((p) => p.opacity > 0.01 && p.r > 0.0005)
      .map((p) => ({
        ...p,
        x: (p.x + offX) * R,
        y: (p.y + offY) * R,
        r: p.r * R,
      }));

    const nFit = pose.notif ? bodyRadius(pose.notif.x, pose.notif.y) : 1;
    const nx = pose.notif ? (pose.notif.x * nFit + offX) * R : 0;
    const ny = pose.notif ? (pose.notif.y * nFit + offY) * R : 0;
    const notif = pose.notif ? { x: nx, y: ny, r: pose.notif.r * R } : null;
    const notch = pose.notif
      ? { x: nx, y: ny, r: pose.notif.notch * R }
      : null;

    return {
      bodyPath,
      bodyAlpha: pose.bodyAlpha,
      eyes,
      dots,
      dotsBehind: pose.dotsBehind,
      arcs: pose.arcs
        .filter((a) => a.opacity > 0.01)
        .map((a) => arcRender(a.seed, a.t, R, a.id, a.opacity)),
      notif,
      notch,
    };
  }
}
