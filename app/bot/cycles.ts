import { SEQUENCE, STATES, STATE_BY_ID, type StateId } from "./states";

export interface Block {
  state: StateId;
  duration: number;
}

export interface Cycle {
  id: string;
  name: string;
  blocks: Block[];
}

/** Floor derived from the longest catalogue morph (`orbit`, 0.6 s). */
export const MIN_BLOCK = Math.max(...STATES.map((s) => s.morph));

export const MAX_BLOCK = 10;
export const STEP = 0.1;

export function minDurationOf(state: StateId): number {
  return Math.max(MIN_BLOCK, STATE_BY_ID.get(state)?.minDuration ?? MIN_BLOCK);
}

export function clampDuration(state: StateId, seconds: number): number {
  const snapped = Math.round(seconds / STEP) * STEP;
  const bounded = Math.min(MAX_BLOCK, Math.max(minDurationOf(state), snapped));
  return Math.round(bounded * 100) / 100;
}

export function makeBlock(state: StateId): Block {
  return {
    state,
    duration: clampDuration(state, STATE_BY_ID.get(state)?.duration ?? 2),
  };
}

/** Montage measured from the reference video: SEQUENCE order, each state's duration. */
export function defaultCycle(): Cycle {
  return {
    name: "",
    id: "default",
    blocks: SEQUENCE.map(makeBlock),
  };
}

export function totalDuration(blocks: Block[]): number {
  return blocks.reduce((sum, b) => sum + b.duration, 0);
}

export function offsetOf(blocks: Block[], index: number): number {
  let acc = 0;
  for (let i = 0; i < index && i < blocks.length; i++) acc += blocks[i]!.duration;
  return acc;
}

export function blockAt(
  blocks: Block[],
  t: number,
): { index: number; elapsed: number } {
  const total = totalDuration(blocks);
  if (!blocks.length || total <= 0) return { index: 0, elapsed: 0 };
  const wrapped = t >= 0 && t < total ? t : ((t % total) + total) % total;
  let acc = 0;
  for (let i = 0; i < blocks.length; i++) {
    const end = acc + blocks[i]!.duration;
    if (wrapped < end) return { index: i, elapsed: wrapped - acc };
    acc = end;
  }
  return { index: blocks.length - 1, elapsed: 0 };
}
