"use client";

import { useCallback, useEffect, useRef } from "react";

import { GrokBotAvatar } from "./grokbot-avatar";
import type { ThemeLogo } from "./themes";

/** Matches the CSS stroke-draw plus fill on the Cursor mark. */
const PATH_DRAW_MS = 2900;
/** The wordmark is already the highlight; copy can follow after a short beat. */
const IMAGE_HOLD_MS = 280;
/** Face marks pop in quickly; copy follows after a short bounce. */
const FACE_HOLD_MS = 720;
const REDUCED_MOTION_HOLD_MS = 150;

type ImageLogo = Extract<ThemeLogo, { kind: "image" }>;
type PathLogo = Extract<ThemeLogo, { kind: "path" }>;
type FaceLogo = Extract<ThemeLogo, { kind: "face" }>;

function useSettleOnce(onSettled: () => void) {
  const hasSettled = useRef(false);
  const latest = useRef(onSettled);

  useEffect(() => {
    latest.current = onSettled;
  }, [onSettled]);

  return useCallback(() => {
    if (hasSettled.current) return;
    hasSettled.current = true;
    latest.current();
  }, []);
}

function useSettleAfter(settle: () => void, delayMs: number) {
  useEffect(() => {
    const timer = window.setTimeout(settle, delayMs);
    return () => window.clearTimeout(timer);
  }, [settle, delayMs]);
}

function ImageMark({
  logo,
  settle,
  holdMs,
}: {
  logo: ImageLogo;
  settle: () => void;
  holdMs: number;
}) {
  useSettleAfter(settle, holdMs);

  // eslint-disable-next-line @next/next/no-img-element -- the mark must render unscaled and unoptimised
  return <img className="brand-mark" src={logo.src} alt={logo.alt} />;
}

function DrawnMark({
  logo,
  settle,
  reduceMotion,
}: {
  logo: PathLogo;
  settle: () => void;
  reduceMotion: boolean;
}) {
  useSettleAfter(settle, reduceMotion ? REDUCED_MOTION_HOLD_MS : PATH_DRAW_MS);

  return (
    <svg
      className="brand-mark"
      viewBox={logo.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={logo.alt}
    >
      <path d={logo.d} />
    </svg>
  );
}

function FaceMark({
  logo,
  settle,
  holdMs,
  reduceMotion,
}: {
  logo: FaceLogo;
  settle: () => void;
  holdMs: number;
  reduceMotion: boolean;
}) {
  useSettleAfter(settle, holdMs);

  return (
    <GrokBotAvatar
      className="brand-mark grokbot-mark"
      alt={logo.alt}
      fill={logo.fill}
      reduceMotion={reduceMotion}
    />
  );
}

/**
 * Renders the welcome-stage logo. Remount (via `key`) to replay its entrance.
 */
export function BrandMark({
  logo,
  reduceMotion,
  onSettled,
}: {
  logo: ThemeLogo;
  reduceMotion: boolean;
  onSettled: () => void;
}) {
  const settle = useSettleOnce(onSettled);

  switch (logo.kind) {
    case "image":
      return (
        <ImageMark
          logo={logo}
          settle={settle}
          holdMs={reduceMotion ? REDUCED_MOTION_HOLD_MS : IMAGE_HOLD_MS}
        />
      );
    case "path":
      return (
        <DrawnMark logo={logo} settle={settle} reduceMotion={reduceMotion} />
      );
    case "face":
      return (
        <FaceMark
          logo={logo}
          settle={settle}
          holdMs={reduceMotion ? REDUCED_MOTION_HOLD_MS : FACE_HOLD_MS}
          reduceMotion={reduceMotion}
        />
      );
    default: {
      const exhaustive: never = logo;
      return exhaustive;
    }
  }
}
