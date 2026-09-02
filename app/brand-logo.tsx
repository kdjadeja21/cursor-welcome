"use client";

import type { ThemeLogo } from "./themes";

/**
 * Renders the main welcome-stage logo. Always a static mark — for SpaceXAI
 * this is the official symbol asset used exactly as provided; the animated
 * Rive version only ever plays once, in the intro screen (see intro-loader.tsx).
 */
export function BrandLogo({
  logo,
  cycleKey,
}: {
  logo: ThemeLogo;
  cycleKey: number;
}) {
  if (logo.kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- the mark must render unscaled and unoptimised
      <img className="welcome-logo-static" src={logo.src} alt={logo.alt} />
    );
  }

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
