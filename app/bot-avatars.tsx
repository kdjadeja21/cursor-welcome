"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";

import { unit } from "./unit";

type BotKind =
  | "circle"
  | "pebble"
  | "squircle"
  | "capsule"
  | "triangle"
  | "hexagon"
  | "cloud"
  | "droplet";

interface BotColor {
  id: string;
  hex: string;
}

const SHAPES: BotKind[] = [
  "circle",
  "pebble",
  "squircle",
  "capsule",
  "triangle",
  "hexagon",
  "cloud",
  "droplet",
];

/** Official grokbots.ai studio palette (chip row, cream first). */
const COLORS: BotColor[] = [
  { id: "creme", hex: "#f1efe9" },
  { id: "brun", hex: "#8b5e3c" },
  { id: "rouge", hex: "#e8483f" },
  { id: "orange", hex: "#f08a24" },
  { id: "ambre", hex: "#f0b429" },
  { id: "vert", hex: "#3ecf8e" },
  { id: "turquoise", hex: "#2fbfa0" },
  { id: "bleu", hex: "#3b93f0" },
  { id: "violet", hex: "#8b5cf6" },
  { id: "rose", hex: "#e152b0" },
  { id: "gris", hex: "#a3a3a3" },
];

const LIGHT_FILLS = new Set(["#f1efe9", "#f0b429", "#a3a3a3"]);

interface BotVariant {
  id: string;
  fill: string;
  kind: BotKind;
}

function BotBody({ kind, fill }: { kind: BotKind; fill: string }): ReactNode {
  switch (kind) {
    case "circle":
      return <circle cx="60" cy="60" r="46" fill={fill} />;
    case "pebble":
      return <ellipse cx="60" cy="60" rx="34" ry="50" fill={fill} />;
    case "squircle":
      return <rect x="16" y="16" width="88" height="88" rx="31" fill={fill} />;
    case "capsule":
      return <rect x="8" y="36" width="104" height="48" rx="24" fill={fill} />;
    case "triangle":
      return (
        <polygon
          points="60,20 104,100 16,100"
          fill={fill}
          stroke={fill}
          strokeWidth="14"
          strokeLinejoin="round"
        />
      );
    case "hexagon":
      return (
        <polygon
          points="60,14 100,37 100,83 60,106 20,83 20,37"
          fill={fill}
          stroke={fill}
          strokeLinejoin="round"
          strokeWidth="12"
        />
      );
    case "cloud":
      return (
        <>
          <ellipse cx="38" cy="68" rx="30" ry="28" fill={fill} />
          <ellipse cx="82" cy="68" rx="30" ry="28" fill={fill} />
          <ellipse cx="60" cy="46" rx="34" ry="30" fill={fill} />
        </>
      );
    case "droplet":
      return (
        <path
          d="M60 10C60 10 16 58 16 80a44 44 0 0 0 88 0C104 58 60 10 60 10z"
          fill={fill}
        />
      );
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function eyeFill(bodyFill: string): string {
  return LIGHT_FILLS.has(bodyFill) ? "#0a0a0c" : "#ffffff";
}

function eyeLayout(kind: BotKind): { cy: number; spread: number } {
  switch (kind) {
    case "circle":
    case "squircle":
    case "hexagon":
      return { cy: 60, spread: 14 };
    case "pebble":
      return { cy: 56, spread: 12 };
    case "capsule":
      return { cy: 64, spread: 16 };
    case "triangle":
      return { cy: 72, spread: 13 };
    case "cloud":
      return { cy: 56, spread: 15 };
    case "droplet":
      return { cy: 78, spread: 13 };
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function BotSvg({ variant }: { variant: BotVariant }) {
  const eyes = eyeFill(variant.fill);
  const { cy, spread } = eyeLayout(variant.kind);
  // Studio eye size is ~0.19 × 0.41 of the body radius (~46).
  const rx = 8.7;
  const ry = 18.9;

  return (
    <svg
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <BotBody kind={variant.kind} fill={variant.fill} />
      <ellipse cx={60 - spread} cy={cy} rx={rx} ry={ry} fill={eyes} />
      <ellipse cx={60 + spread} cy={cy} rx={rx} ry={ry} fill={eyes} />
    </svg>
  );
}

interface Floater {
  variant: BotVariant;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  opacity: string;
  rotate: number;
}

function pickFrom<T>(items: readonly T[], seed: number, label: string): T {
  const first = items[0];
  if (first === undefined) {
    throw new Error(`${label} is empty`);
  }
  return items[Math.floor(unit(seed) * items.length)] ?? first;
}

function pickVariant(seed: number): BotVariant {
  const kind = pickFrom(SHAPES, seed, "SHAPES");
  const color = pickFrom(COLORS, seed + 1, "COLORS");
  return {
    id: `${kind}-${color.id}`,
    fill: color.hex,
    kind,
  };
}

export function FloatingBotAvatars({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  const floaters = useMemo<Floater[]>(() => {
    const count = reduceMotion ? 8 : 14;

    return Array.from({ length: count }, (_, index) => {
      const size = 36 + unit(index * 11 + 1) * 52;
      const dur = 18 + unit(index * 11 + 2) * 16;

      return {
        variant: pickVariant(index * 11 + 3),
        size,
        left: unit(index * 11 + 4) * 100,
        top: reduceMotion
          ? 8 + unit(index * 11 + 5) * 84
          : 100 + unit(index * 11 + 6) * 24,
        duration: dur,
        delay: unit(index * 11 + 7) * dur,
        opacity: (0.45 + unit(index * 11 + 8) * 0.3).toFixed(2),
        rotate: Math.round((unit(index * 11 + 9) - 0.5) * 16),
      };
    });
  }, [reduceMotion]);

  return (
    <div className="welcome-bot-avatars" aria-hidden="true">
      {floaters.map((floater, index) => (
        <span
          key={`${floater.variant.id}-${index}`}
          className={
            reduceMotion ? "welcome-bot welcome-bot-static" : "welcome-bot"
          }
          style={
            {
              width: `${floater.size}px`,
              height: `${floater.size}px`,
              left: `${floater.left}vw`,
              top: `${floater.top}vh`,
              animationDuration: `${floater.duration}s`,
              animationDelay: `${floater.delay}s`,
              opacity: floater.opacity,
              "--bot-tilt": `${floater.rotate}deg`,
            } as CSSProperties
          }
        >
          <BotSvg variant={floater.variant} />
        </span>
      ))}
    </div>
  );
}
