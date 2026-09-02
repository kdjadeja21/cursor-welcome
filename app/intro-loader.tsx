"use client";

import { useEffect, useRef, useState } from "react";
import { Alignment, EventType, Fit, Layout, useRive } from "@rive-app/react-canvas";

import type { ThemeIntro } from "./themes";

/** Rive state machines that settle (rather than loop) fire `pause` on their own,
 * but we still cap the wait in case the file never settles. */
const MIN_DISPLAY_MS = 1200;
const MAX_DISPLAY_MS = 4500;
const FADE_MS = 450;

function StaticIntroLogo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- the mark must render unscaled and unoptimised
  return <img className="welcome-logo-static" src={src} alt={alt} />;
}

export function IntroLoader({
  intro,
  onFinish,
}: {
  intro: ThemeIntro;
  onFinish: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const finishedRef = useRef(false);
  const mountedAt = useRef(0);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const { rive, RiveComponent } = useRive({
    src: intro.src,
    artboard: intro.artboard,
    stateMachine: intro.stateMachine,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setLeaving(true);
      window.setTimeout(() => onFinishRef.current(), FADE_MS);
    };

    const maxTimer = window.setTimeout(finish, MAX_DISPLAY_MS);

    if (!rive) {
      return () => window.clearTimeout(maxTimer);
    }

    const handleSettled = () => {
      const elapsed = Date.now() - mountedAt.current;
      if (elapsed >= MIN_DISPLAY_MS) {
        finish();
      } else {
        window.setTimeout(finish, MIN_DISPLAY_MS - elapsed);
      }
    };

    rive.on(EventType.Pause, handleSettled);
    rive.on(EventType.Stop, handleSettled);

    return () => {
      window.clearTimeout(maxTimer);
      rive.off(EventType.Pause, handleSettled);
      rive.off(EventType.Stop, handleSettled);
    };
  }, [rive]);

  useEffect(() => {
    if (!failed || finishedRef.current) return;
    finishedRef.current = true;
    setLeaving(true);
    window.setTimeout(() => onFinishRef.current(), FADE_MS);
  }, [failed]);

  return (
    <div
      className={`intro-overlay${leaving ? " intro-overlay-leaving" : ""}`}
      role="presentation"
    >
      <div className="intro-logo-wrap">
        {failed ? (
          <StaticIntroLogo src={intro.fallback} alt={intro.alt} />
        ) : (
          <RiveComponent
            className="intro-rive"
            aria-label={intro.alt}
            role="img"
          />
        )}
      </div>
    </div>
  );
}
