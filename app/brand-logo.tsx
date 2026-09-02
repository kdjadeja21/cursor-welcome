"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

import type { ThemeLogo } from "./themes";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

function StaticLogo({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- the mark must render unscaled and unoptimised
  return <img className="welcome-logo-static" src={src} alt={alt} />;
}

function RiveLogo({
  src,
  fallback,
  alt,
  cycleKey,
}: {
  src: string;
  fallback: string;
  alt: string;
  cycleKey: number;
}) {
  const [failed, setFailed] = useState(false);
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });

  const initialCycle = useRef(cycleKey);

  // Replaying in place avoids re-initialising the runtime on every interval tick.
  useEffect(() => {
    if (!rive || cycleKey === initialCycle.current) return;
    rive.reset({ autoplay: true });
  }, [rive, cycleKey]);

  if (failed) {
    return <StaticLogo src={fallback} alt={alt} />;
  }

  return <RiveComponent className="welcome-rive" aria-label={alt} role="img" />;
}

export function BrandLogo({
  logo,
  cycleKey,
}: {
  logo: ThemeLogo;
  cycleKey: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (logo.kind === "path") {
    // Remounting is what restarts the CSS stroke-draw on each replay.
    return (
      <svg
        key={cycleKey}
        className="welcome-logo"
        viewBox={logo.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={logo.alt}
      >
        <path d={logo.d} />
      </svg>
    );
  }

  if (prefersReducedMotion) {
    return <StaticLogo src={logo.fallback} alt={logo.alt} />;
  }

  return (
    <RiveLogo
      src={logo.src}
      fallback={logo.fallback}
      alt={logo.alt}
      cycleKey={cycleKey}
    />
  );
}
