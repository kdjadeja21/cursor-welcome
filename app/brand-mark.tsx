"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alignment, EventType, Fit, Layout, useRive } from "@rive-app/react-canvas";

import type { ThemeMark } from "./themes";

/**
 * A beat of dark before the Rive logo starts. Playing it the instant the page
 * paints means the wordmark writes itself while the browser is still busy and
 * the page is still fading up, which is what made it unreadable. The hold also
 * outlasts the page fade, so the write-on happens at full opacity.
 */
const RIVE_HOLD_MS = 1300;
/** Replays have no page fade to wait out, and a long gap would read as a stall. */
const RIVE_REPLAY_HOLD_MS = 250;
/** How long the finished wordmark holds still before the page is revealed. */
const RIVE_LINGER_MS = 1100;
/** Backstop in case the state machine loops instead of settling. */
const RIVE_MAX_MS = 5500;
/**
 * The mark stays on screen for the whole session, so a runtime that never
 * reports either a load or an error must not leave the stage empty.
 */
const RIVE_LOAD_TIMEOUT_MS = 2500;
/** Matches the CSS stroke-draw plus fill on the Cursor mark. */
const PATH_DRAW_MS = 2900;
/** Nothing animates, so the still mark only needs long enough to be noticed. */
const STILL_HOLD_MS = 700;
const REDUCED_MOTION_HOLD_MS = 150;

type RiveMark = Extract<ThemeMark, { kind: "rive" }>;
type PathMark = Extract<ThemeMark, { kind: "path" }>;

/** Wraps a callback so it runs at most once for the lifetime of the mark. */
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

function StillMark({
  src,
  alt,
  settle,
  holdMs,
}: {
  src: string;
  alt: string;
  settle: () => void;
  holdMs: number;
}) {
  useSettleAfter(settle, holdMs);

  // eslint-disable-next-line @next/next/no-img-element -- the mark must render unscaled and unoptimised
  return <img className="brand-mark" src={src} alt={alt} />;
}

function RivePlayer({ mark, settle }: { mark: RiveMark; settle: () => void }) {
  const [hasFailed, setHasFailed] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: mark.src,
    artboard: mark.artboard,
    stateMachine: mark.stateMachine,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setHasFailed(true),
  });

  useSettleAfter(settle, RIVE_MAX_MS);

  useEffect(() => {
    if (rive) return;

    const timer = window.setTimeout(
      () => setHasFailed(true),
      RIVE_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [rive]);

  /** A state machine that settles rather than loops reports it as a pause. */
  useEffect(() => {
    if (!rive) return;

    let lingerTimer = 0;
    const handleSettled = () => {
      lingerTimer = window.setTimeout(settle, RIVE_LINGER_MS);
    };

    rive.on(EventType.Pause, handleSettled);
    rive.on(EventType.Stop, handleSettled);

    return () => {
      window.clearTimeout(lingerTimer);
      rive.off(EventType.Pause, handleSettled);
      rive.off(EventType.Stop, handleSettled);
    };
  }, [rive, settle]);

  if (hasFailed) {
    return (
      <StillMark
        src={mark.still}
        alt={mark.alt}
        settle={settle}
        holdMs={STILL_HOLD_MS}
      />
    );
  }

  return (
    <RiveComponent className="brand-mark" aria-label={mark.alt} role="img" />
  );
}

function HeldRiveMark({
  mark,
  settle,
  holdMs,
}: {
  mark: RiveMark;
  settle: () => void;
  holdMs: number;
}) {
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsArmed(true), holdMs);
    return () => window.clearTimeout(timer);
  }, [holdMs]);

  /** The empty box keeps the mark's slot from shifting during the hold. */
  if (!isArmed) {
    return <div className="brand-mark" aria-hidden="true" />;
  }

  return <RivePlayer mark={mark} settle={settle} />;
}

function DrawnMark({
  mark,
  settle,
  reduceMotion,
}: {
  mark: PathMark;
  settle: () => void;
  reduceMotion: boolean;
}) {
  useSettleAfter(settle, reduceMotion ? REDUCED_MOTION_HOLD_MS : PATH_DRAW_MS);

  return (
    <svg
      className="brand-mark"
      viewBox={mark.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={mark.alt}
    >
      <path d={mark.d} />
    </svg>
  );
}

/**
 * Renders a theme's brand mark and reports when it has finished animating, so
 * the rest of the welcome screen can wait for it and then take over.
 *
 * Remount this component (via `key`) to replay the mark.
 */
export function BrandMark({
  mark,
  reduceMotion,
  isReplay,
  onSettled,
}: {
  mark: ThemeMark;
  reduceMotion: boolean;
  isReplay: boolean;
  onSettled: () => void;
}) {
  const settle = useSettleOnce(onSettled);

  switch (mark.kind) {
    case "rive":
      return reduceMotion ? (
        <StillMark
          src={mark.still}
          alt={mark.alt}
          settle={settle}
          holdMs={REDUCED_MOTION_HOLD_MS}
        />
      ) : (
        <HeldRiveMark
          mark={mark}
          settle={settle}
          holdMs={isReplay ? RIVE_REPLAY_HOLD_MS : RIVE_HOLD_MS}
        />
      );
    case "path":
      return (
        <DrawnMark mark={mark} settle={settle} reduceMotion={reduceMotion} />
      );
    default: {
      const exhaustive: never = mark;
      return exhaustive;
    }
  }
}
