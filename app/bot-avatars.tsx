"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";

import { unit } from "./unit";

type BotKind = "round" | "wide" | "tall" | "peanut" | "bean" | "stack" | "drop";

interface BotVariant {
  id: string;
  fill: string;
  kind: BotKind;
}

/**
 * Original clay-blob sprites inspired by the Grok Bot thumbnail / studio
 * language (blob body + two eyes). Geometry is not copied from those sites.
 */
const BOT_VARIANTS: BotVariant[] = [
  { id: "round-blue", fill: "#1084FE", kind: "round" },
  { id: "peanut-orange", fill: "#FF6700", kind: "peanut" },
  { id: "wide-teal", fill: "#00BCA6", kind: "wide" },
  { id: "tall-pink", fill: "#FF309B", kind: "tall" },
  { id: "bean-amber", fill: "#FF9800", kind: "bean" },
  { id: "stack-white", fill: "#F4F4F4", kind: "stack" },
  { id: "round-sky", fill: "#3D9BFF", kind: "round" },
  { id: "drop-coral", fill: "#FF5A4A", kind: "drop" },
  { id: "wide-mint", fill: "#2EE6B0", kind: "wide" },
  { id: "peanut-violet", fill: "#8B6CFF", kind: "peanut" },
  { id: "tall-navy", fill: "#1B4FD8", kind: "tall" },
  { id: "bean-gold", fill: "#F5C518", kind: "bean" },
];

function BotBody({ kind, fill }: { kind: BotKind; fill: string }): ReactNode {
  switch (kind) {
    case "round":
      return <ellipse cx="60" cy="78" rx="42" ry="46" fill={fill} />;
    case "wide":
      return <ellipse cx="60" cy="82" rx="50" ry="34" fill={fill} />;
    case "tall":
      return <ellipse cx="60" cy="76" rx="32" ry="54" fill={fill} />;
    case "peanut":
      return (
        <>
          <ellipse cx="60" cy="48" rx="34" ry="30" fill={fill} />
          <ellipse cx="60" cy="96" rx="40" ry="36" fill={fill} />
        </>
      );
    case "bean":
      return (
        <ellipse
          cx="60"
          cy="78"
          rx="46"
          ry="36"
          fill={fill}
          transform="rotate(-28 60 78)"
        />
      );
    case "stack":
      return (
        <>
          <ellipse cx="60" cy="44" rx="30" ry="28" fill={fill} />
          <ellipse cx="60" cy="96" rx="42" ry="38" fill={fill} />
        </>
      );
    case "drop":
      return (
        <ellipse
          cx="60"
          cy="82"
          rx="36"
          ry="48"
          fill={fill}
          transform="rotate(12 60 82)"
        />
      );
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function eyeFill(bodyFill: string): string {
  return bodyFill === "#F4F4F4" || bodyFill === "#F5C518" ? "#1a1a1a" : "#ffffff";
}

function eyeCy(kind: BotKind): number {
  switch (kind) {
    case "peanut":
    case "stack":
      return 44;
    case "wide":
      return 78;
    case "tall":
      return 62;
    case "bean":
      return 70;
    case "drop":
      return 72;
    case "round":
      return 70;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function BotSvg({ variant }: { variant: BotVariant }) {
  const eyes = eyeFill(variant.fill);
  const cy = eyeCy(variant.kind);

  return (
    <svg
      viewBox="0 0 120 140"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <BotBody kind={variant.kind} fill={variant.fill} />
      <ellipse cx="46" cy={cy} rx="8" ry="13" fill={eyes} />
      <ellipse cx="74" cy={cy} rx="8" ry="13" fill={eyes} />
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

function pickVariant(seed: number): BotVariant {
  const first = BOT_VARIANTS[0];
  if (!first) {
    throw new Error("BOT_VARIANTS is empty");
  }
  const index = Math.floor(unit(seed) * BOT_VARIANTS.length);
  return BOT_VARIANTS[index] ?? first;
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
              height: `${floater.size * (140 / 120)}px`,
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
