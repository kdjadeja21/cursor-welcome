"use client";

import { useEffect, useRef, useState } from "react";
import { Alignment, EventType, Fit, Layout, useRive } from "@rive-app/react-canvas";

import type { ThemeIntro } from "./themes";

/**
 * A beat of dark before the Rive logo starts, so the wordmark writes itself
 * after the page has faded up rather than while the browser is still busy.
 */
const RIVE_HOLD_MS = 1300;
/** How long the finished mark holds still before the welcome stage appears. */
const RIVE_LINGER_MS = 1100;
/** Backstop in case the state machine loops instead of settling. */
const RIVE_MAX_MS = 5500;
const RIVE_LOAD_TIMEOUT_MS = 2500;
const FADE_MS = 450;

export function IntroLoader({
  intro,
  onFinish,
}: {
  intro: ThemeIntro;
  onFinish: () => void;
}) {
  const [isArmed, setIsArmed] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const hasFinished = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsArmed(true), RIVE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const finish = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    setIsLeaving(true);
    window.setTimeout(() => onFinishRef.current(), FADE_MS);
  };

  useEffect(() => {
    if (hasFailed) finish();
  }, [hasFailed]);

  return (
    <div
      className={`intro-overlay${isLeaving ? " intro-overlay-leaving" : ""}`}
      role="presentation"
    >
      <div className="intro-logo-wrap">
        {isArmed && !hasFailed ? (
          <IntroRive
            intro={intro}
            onFailed={() => setHasFailed(true)}
            onSettled={finish}
          />
        ) : null}
      </div>
    </div>
  );
}

function IntroRive({
  intro,
  onFailed,
  onSettled,
}: {
  intro: ThemeIntro;
  onFailed: () => void;
  onSettled: () => void;
}) {
  const { rive, RiveComponent } = useRive({
    src: intro.src,
    artboard: intro.artboard,
    stateMachine: intro.stateMachine,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: onFailed,
  });

  useEffect(() => {
    const maxTimer = window.setTimeout(onSettled, RIVE_MAX_MS);
    return () => window.clearTimeout(maxTimer);
  }, [onSettled]);

  useEffect(() => {
    if (rive) return;

    const timer = window.setTimeout(onFailed, RIVE_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [rive, onFailed]);

  useEffect(() => {
    if (!rive) return;

    let lingerTimer = 0;
    const handleSettled = () => {
      lingerTimer = window.setTimeout(onSettled, RIVE_LINGER_MS);
    };

    rive.on(EventType.Pause, handleSettled);
    rive.on(EventType.Stop, handleSettled);

    return () => {
      window.clearTimeout(lingerTimer);
      rive.off(EventType.Pause, handleSettled);
      rive.off(EventType.Stop, handleSettled);
    };
  }, [rive, onSettled]);

  return (
    <RiveComponent className="intro-rive" aria-label={intro.alt} role="img" />
  );
}
