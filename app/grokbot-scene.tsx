"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";

import { unit } from "./unit";

type BlobKind =
  | "circle"
  | "squircle"
  | "cloud"
  | "blob"
  | "pebble"
  | "capsule"
  | "triangle"
  | "hexagon"
  | "droplet";

interface BlobColor {
  id: string;
  hex: string;
}

/** Official grokbots.ai studio palette (chip row, cream first). */
const COLORS: BlobColor[] = [
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

interface BlobVariant {
  id: string;
  fill: string;
  kind: BlobKind;
}

function BlobBody({ kind, fill }: { kind: BlobKind; fill: string }): ReactNode {
  switch (kind) {
    case "circle":
      return <circle cx="60" cy="60" r="46" fill={fill} />;
    case "squircle":
      return (
        <rect x="14" y="14" width="92" height="92" rx="28" fill={fill} />
      );
    case "cloud":
      return (
        <>
          <ellipse cx="38" cy="68" rx="30" ry="28" fill={fill} />
          <ellipse cx="82" cy="68" rx="30" ry="28" fill={fill} />
          <ellipse cx="60" cy="46" rx="34" ry="30" fill={fill} />
        </>
      );
    case "blob":
      return (
        <path
          d="M28 108C8 86 18 28 62 14c36-12 62 18 56 58-6 42-52 62-90 36z"
          fill={fill}
        />
      );
    case "pebble":
      return <ellipse cx="60" cy="60" rx="34" ry="50" fill={fill} />;
    case "capsule":
      return <rect x="8" y="36" width="104" height="48" rx="24" fill={fill} />;
    case "triangle":
      return (
        <polygon
          points="60,18 104,100 16,100"
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

function eyeLayout(kind: BlobKind): { cy: number; spread: number; rotate: number } {
  switch (kind) {
    case "circle":
    case "squircle":
    case "hexagon":
      return { cy: 56, spread: 14, rotate: -20 };
    case "pebble":
      return { cy: 52, spread: 12, rotate: -18 };
    case "capsule":
      return { cy: 60, spread: 16, rotate: -16 };
    case "triangle":
      return { cy: 70, spread: 13, rotate: -18 };
    case "cloud":
      return { cy: 54, spread: 15, rotate: -22 };
    case "droplet":
      return { cy: 76, spread: 13, rotate: -18 };
    case "blob":
      return { cy: 52, spread: 13, rotate: -24 };
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function OvalEyes({ kind, fill }: { kind: BlobKind; fill: string }) {
  const eyes = eyeFill(fill);
  const { cy, spread, rotate } = eyeLayout(kind);

  return (
    <g className="grokbot-look">
      <g transform={`rotate(${rotate} 60 ${cy})`}>
        <ellipse
          className="grokbot-eye"
          cx={60 - spread}
          cy={cy}
          rx="7"
          ry="15"
          fill={eyes}
        />
        <ellipse
          className="grokbot-eye"
          cx={60 + spread}
          cy={cy}
          rx="7"
          ry="15"
          fill={eyes}
        />
      </g>
    </g>
  );
}

function BlobSvg({ variant }: { variant: BlobVariant }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <BlobBody kind={variant.kind} fill={variant.fill} />
      <OvalEyes kind={variant.kind} fill={variant.fill} />
    </svg>
  );
}

interface HeroBlob {
  variant: BlobVariant;
  className: string;
  size: string;
  left?: string;
  top?: string;
  right?: string;
  bottom?: string;
  tilt: number;
  duration: number;
  delay: number;
  eyeDelay: number;
  anchorX: number;
  anchorY: number;
}

const HEROES: HeroBlob[] = [
  {
    variant: { id: "hero-rose", fill: "#e152b0", kind: "squircle" },
    className: "grokbot-hero grokbot-hero-rose",
    size: "clamp(72px, 14vw, 150px)",
    left: "4%",
    top: "14%",
    tilt: -18,
    duration: 9,
    delay: 0.1,
    eyeDelay: 0.4,
    anchorX: 0.12,
    anchorY: 0.22,
  },
  {
    variant: { id: "hero-brun", fill: "#8b5e3c", kind: "circle" },
    className: "grokbot-hero grokbot-hero-brun",
    size: "clamp(36px, 6.5vw, 68px)",
    right: "9%",
    top: "7%",
    tilt: 8,
    duration: 7.5,
    delay: 0.35,
    eyeDelay: 1.6,
    anchorX: 0.86,
    anchorY: 0.12,
  },
  {
    variant: { id: "hero-bleu", fill: "#3b93f0", kind: "cloud" },
    className: "grokbot-hero grokbot-hero-bleu",
    size: "clamp(96px, 18vw, 190px)",
    right: "5%",
    top: "34%",
    tilt: 6,
    duration: 11,
    delay: 0.2,
    eyeDelay: 2.8,
    anchorX: 0.84,
    anchorY: 0.46,
  },
  {
    variant: { id: "hero-teal", fill: "#2fbfa0", kind: "blob" },
    className: "grokbot-hero grokbot-hero-teal",
    size: "clamp(180px, 34vw, 360px)",
    right: "-6%",
    bottom: "-12%",
    tilt: 12,
    duration: 13,
    delay: 0,
    eyeDelay: 0.9,
    anchorX: 0.92,
    anchorY: 0.92,
  },
];

const EXTRA_KINDS: BlobKind[] = [
  "circle",
  "pebble",
  "squircle",
  "capsule",
  "triangle",
  "hexagon",
  "droplet",
];

interface Floater {
  variant: BlobVariant;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  eyeDelay: number;
  rotate: number;
  opacity: string;
}

function pickFrom<T>(items: readonly T[], seed: number, label: string): T {
  const first = items[0];
  if (first === undefined) {
    throw new Error(`${label} is empty`);
  }
  return items[Math.floor(unit(seed) * items.length)] ?? first;
}

function pickExtraVariant(seed: number): BlobVariant {
  const kind = pickFrom(EXTRA_KINDS, seed, "EXTRA_KINDS");
  const color = pickFrom(COLORS, seed + 1, "COLORS");
  return {
    id: `${kind}-${color.id}`,
    fill: color.hex,
    kind,
  };
}

function heroStyle(hero: HeroBlob, reduceMotion: boolean): CSSProperties {
  return {
    width: hero.size,
    height: hero.size,
    left: hero.left,
    top: hero.top,
    right: hero.right,
    bottom: hero.bottom,
    animationDuration: reduceMotion ? undefined : `${hero.duration}s`,
    animationDelay: reduceMotion ? undefined : `${hero.delay}s`,
    "--bot-tilt": `${hero.tilt}deg`,
    "--eye-delay": `-${hero.eyeDelay}s`,
    "--anchor-x": String(hero.anchorX),
    "--anchor-y": String(hero.anchorY),
  } as CSSProperties;
}

export function GrokBotScene({
  reduceMotion,
  showExtras,
}: {
  reduceMotion: boolean;
  showExtras: boolean;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  const floaters = useMemo<Floater[]>(() => {
    if (!showExtras) return [];
    const count = reduceMotion ? 5 : 8;

    return Array.from({ length: count }, (_, index) => {
      const size = 28 + unit(index * 13 + 1) * 36;
      const dur = 10 + unit(index * 13 + 2) * 10;
      const side = index % 2 === 0;
      const left = side
        ? unit(index * 13 + 4) * 22
        : 78 + unit(index * 13 + 5) * 20;
      const top = 8 + unit(index * 13 + 6) * 78;

      return {
        variant: pickExtraVariant(index * 13 + 3),
        size,
        left,
        top,
        duration: dur,
        delay: unit(index * 13 + 7) * dur * 0.4,
        eyeDelay: unit(index * 13 + 10) * 7,
        opacity: (0.55 + unit(index * 13 + 8) * 0.35).toFixed(2),
        rotate: Math.round((unit(index * 13 + 9) - 0.5) * 22),
      };
    });
  }, [reduceMotion, showExtras]);

  useEffect(() => {
    const node = sceneRef.current;
    if (!node || reduceMotion) return;

    const onMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      node.style.setProperty("--look-x", String(event.clientX / width));
      node.style.setProperty("--look-y", String(event.clientY / height));
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  return (
    <div
      ref={sceneRef}
      className="grokbot-scene"
      aria-hidden="true"
      style={{ "--look-x": "0.5", "--look-y": "0.5" } as CSSProperties}
    >
      {HEROES.map((hero) => (
        <span
          key={hero.variant.id}
          className={
            reduceMotion
              ? `${hero.className} grokbot-hero-static`
              : hero.className
          }
          style={heroStyle(hero, reduceMotion)}
        >
          <BlobSvg variant={hero.variant} />
        </span>
      ))}

      {showExtras
        ? floaters.map((floater, index) => (
            <span
              key={`${floater.variant.id}-${index}`}
              className={
                reduceMotion
                  ? "grokbot-floater grokbot-floater-static"
                  : "grokbot-floater"
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
                  "--eye-delay": `-${floater.eyeDelay}s`,
                  "--anchor-x": (floater.left / 100).toFixed(3),
                  "--anchor-y": (floater.top / 100).toFixed(3),
                } as CSSProperties
              }
            >
              <BlobSvg variant={floater.variant} />
            </span>
          ))
        : null}
    </div>
  );
}
