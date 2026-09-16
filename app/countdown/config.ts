export interface CountdownConfig {
  title: string;
  dayLabel: string;
  durationSec: number;
}

export type BlobKind = "oval" | "teardrop" | "hex" | "triangle" | "circle";

export interface OrbitBlob {
  id: string;
  kind: BlobKind;
  fill: string;
  size: number;
  angleDeg: number;
}

export const DEFAULT_COUNTDOWN: CountdownConfig = {
  title: "Grok Bot Galaxy",
  dayLabel: "Day 2",
  durationSec: 60,
};

const MIN_DURATION_SEC = 1;
const MAX_DURATION_SEC = 99 * 60;
const STEP_DEG = 360 / 15;

function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function parseText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function parseDuration(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_COUNTDOWN.durationSec;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_COUNTDOWN.durationSec;
  const int = Math.trunc(n);
  if (int < MIN_DURATION_SEC) return MIN_DURATION_SEC;
  if (int > MAX_DURATION_SEC) return MAX_DURATION_SEC;
  return int;
}

export function parseCountdownConfig(raw: unknown): CountdownConfig {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  return {
    title: parseText(firstValue(record.title), DEFAULT_COUNTDOWN.title),
    dayLabel: parseText(firstValue(record.day), DEFAULT_COUNTDOWN.dayLabel),
    durationSec: parseDuration(firstValue(record.seconds)),
  };
}

export const ORBIT_BLOBS: readonly OrbitBlob[] = [
  { id: "1", kind: "oval", fill: "#8b5cf6", size: 52, angleDeg: 0 },
  { id: "2", kind: "teardrop", fill: "#7ec8ff", size: 50, angleDeg: STEP_DEG },
  { id: "3", kind: "oval", fill: "#1d4ed8", size: 74, angleDeg: STEP_DEG * 2 },
  { id: "4", kind: "teardrop", fill: "#f08a24", size: 108, angleDeg: STEP_DEG * 3 },
  { id: "5", kind: "oval", fill: "#8b5cf6", size: 104, angleDeg: STEP_DEG * 4 },
  { id: "6", kind: "hex", fill: "#3ecf8e", size: 136, angleDeg: STEP_DEG * 5 },
  { id: "7", kind: "circle", fill: "#2ad4e0", size: 72, angleDeg: STEP_DEG * 6 },
  { id: "8", kind: "triangle", fill: "#8b5e3c", size: 76, angleDeg: STEP_DEG * 7 },
  { id: "9", kind: "triangle", fill: "#1d4ed8", size: 90, angleDeg: STEP_DEG * 8 },
  { id: "10", kind: "oval", fill: "#f08a24", size: 110, angleDeg: STEP_DEG * 9 },
  { id: "11", kind: "oval", fill: "#2ad4e0", size: 48, angleDeg: STEP_DEG * 10 },
  { id: "12", kind: "oval", fill: "#3ecf8e", size: 50, angleDeg: STEP_DEG * 11 },
  { id: "13", kind: "oval", fill: "#e8483f", size: 34, angleDeg: STEP_DEG * 12 },
  { id: "14", kind: "oval", fill: "#8b5e3c", size: 48, angleDeg: STEP_DEG * 13 },
  { id: "15", kind: "oval", fill: "#f08a24", size: 50, angleDeg: STEP_DEG * 14 },
];
