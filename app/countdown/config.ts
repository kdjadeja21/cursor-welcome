export interface CountdownConfig {
  title: string;
  brand: string;
  dayLabel: string;
  durationSec: number;
  running: boolean;
}

export interface OrbitBot {
  id: string;
  fill: string;
  size: number;
  angleDeg: number;
}

export const COUNTDOWN_STORAGE_KEY = "cursor-welcome-countdown-config";

export const DEFAULT_COUNTDOWN: CountdownConfig = {
  title: "Grok Bot Galaxy",
  brand: "Grok Bot Galaxy",
  dayLabel: "Day 2",
  durationSec: 60,
  running: true,
};

const MIN_DURATION_SEC = 1;
const MAX_DURATION_SEC = 99 * 60;
const STEP_DEG = 360 / 15;

function firstValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function parseText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  return value;
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

function parseRunning(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (value === "false" || value === "0") return false;
  if (value === "true" || value === "1") return true;
  return DEFAULT_COUNTDOWN.running;
}

export function parseCountdownConfig(raw: unknown): CountdownConfig {
  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};

  const title = parseText(
    firstValue(record.title),
    DEFAULT_COUNTDOWN.title,
  );
  const brandRaw = firstValue(record.brand);
  const brand =
    typeof brandRaw === "string"
      ? brandRaw
      : title;

  return {
    title,
    brand,
    dayLabel: parseText(
      firstValue(record.dayLabel) ?? firstValue(record.day),
      DEFAULT_COUNTDOWN.dayLabel,
    ),
    durationSec: parseDuration(
      firstValue(record.durationSec) ?? firstValue(record.seconds),
    ),
    running: parseRunning(firstValue(record.running)),
  };
}

export function loadCountdownConfig(): CountdownConfig | null {
  try {
    const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    if (!stored) return null;
    return parseCountdownConfig(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveCountdownConfig(config: CountdownConfig) {
  try {
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore quota or private-mode errors.
  }
}

export function clearCountdownConfig() {
  try {
    localStorage.removeItem(COUNTDOWN_STORAGE_KEY);
  } catch {
    // Ignore private-mode errors.
  }
}

export function buildCountdownShareUrl(config: CountdownConfig): string {
  const params = new URLSearchParams();
  params.set("data", JSON.stringify(config));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export const ORBIT_BOTS: readonly OrbitBot[] = [
  { id: "1", fill: "#8b5cf6", size: 52, angleDeg: 0 },
  { id: "2", fill: "#7ec8ff", size: 50, angleDeg: STEP_DEG },
  { id: "3", fill: "#1d4ed8", size: 74, angleDeg: STEP_DEG * 2 },
  { id: "4", fill: "#f08a24", size: 108, angleDeg: STEP_DEG * 3 },
  { id: "5", fill: "#8b5cf6", size: 104, angleDeg: STEP_DEG * 4 },
  { id: "6", fill: "#3ecf8e", size: 136, angleDeg: STEP_DEG * 5 },
  { id: "7", fill: "#2ad4e0", size: 72, angleDeg: STEP_DEG * 6 },
  { id: "8", fill: "#8b5e3c", size: 76, angleDeg: STEP_DEG * 7 },
  { id: "9", fill: "#1d4ed8", size: 90, angleDeg: STEP_DEG * 8 },
  { id: "10", fill: "#f08a24", size: 110, angleDeg: STEP_DEG * 9 },
  { id: "11", fill: "#2ad4e0", size: 48, angleDeg: STEP_DEG * 10 },
  { id: "12", fill: "#3ecf8e", size: 50, angleDeg: STEP_DEG * 11 },
  { id: "13", fill: "#e8483f", size: 34, angleDeg: STEP_DEG * 12 },
  { id: "14", fill: "#8b5e3c", size: 48, angleDeg: STEP_DEG * 13 },
  { id: "15", fill: "#f08a24", size: 50, angleDeg: STEP_DEG * 14 },
];
