"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { OrbitBlobSvg } from "./blobs";
import {
  ORBIT_BLOBS,
  type CountdownConfig,
  type OrbitBlob,
} from "./config";
import { formatCountdown } from "./format-time";

function useRemainingSeconds(durationSec: number): number {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    setRemaining(durationSec);
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const next = Math.max(0, durationSec - elapsed);
      setRemaining(next);
      if (next === 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [durationSec]);

  return remaining;
}

function BlobSlot({ blob }: { blob: OrbitBlob }) {
  const style = {
    "--size": `${blob.size}px`,
    "--angle": `${blob.angleDeg}deg`,
    "--bob-delay": `${(blob.angleDeg / 24) * -0.07}s`,
  } as CSSProperties;

  return (
    <div className="countdown-slot" style={style}>
      <div className="countdown-upright">
        <div className="countdown-bob">
          <OrbitBlobSvg blob={blob} />
        </div>
      </div>
    </div>
  );
}

export function CountdownScene({ config }: { config: CountdownConfig }) {
  const remaining = useRemainingSeconds(config.durationSec);

  return (
    <div className="countdown-root" data-scene="countdown">
      <div className="countdown-stage">
        <div className="countdown-frame">
          <div className="countdown-ring" aria-hidden="true">
            {ORBIT_BLOBS.map((blob) => (
              <BlobSlot key={blob.id} blob={blob} />
            ))}
          </div>
          <div className="countdown-lockup">
            <h1 className="countdown-title">{config.title}</h1>
            <p className="countdown-timer" role="timer" aria-atomic="true">
              {formatCountdown(remaining)}
            </p>
          </div>
        </div>
      </div>
      <p className="countdown-credit">
        <span className="countdown-credit-title">{config.title}</span>{" "}
        <span className="countdown-credit-day">{config.dayLabel}</span>
      </p>
    </div>
  );
}
