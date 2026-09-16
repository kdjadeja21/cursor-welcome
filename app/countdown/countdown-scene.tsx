"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  buildCountdownShareUrl,
  clearCountdownConfig,
  DEFAULT_COUNTDOWN,
  loadCountdownConfig,
  parseCountdownConfig,
  saveCountdownConfig,
  type CountdownConfig,
} from "./config";
import { CountdownEditor } from "./countdown-editor";
import { formatCountdown } from "./format-time";
import { RingBots } from "./ring-bots";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function CountdownTimer({
  durationSec,
  running,
}: {
  durationSec: number;
  running: boolean;
}) {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    if (!running) return;

    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const next = Math.max(0, durationSec - elapsed);
      setRemaining(next);
      if (next === 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [durationSec, running]);

  return (
    <p className="countdown-timer" role="timer" aria-atomic="true">
      {formatCountdown(remaining)}
    </p>
  );
}

export function CountdownScene() {
  const [config, setConfig] = useState<CountdownConfig>(DEFAULT_COUNTDOWN);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [timerNonce, setTimerNonce] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get("data");
    let next: CountdownConfig | null = null;

    if (sharedParam) {
      try {
        next = parseCountdownConfig(JSON.parse(sharedParam));
      } catch {
        next = null;
      }
    }

    if (!next && (params.get("title") || params.get("day") || params.get("seconds"))) {
      next = parseCountdownConfig({
        title: params.get("title") ?? undefined,
        day: params.get("day") ?? undefined,
        seconds: params.get("seconds") ?? undefined,
      });
    }

    if (!next) {
      next = loadCountdownConfig();
    }

    if (next) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved config once after mount
      setConfig(next);
    }

    if (sharedParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("data");
      window.history.replaceState({}, "", url.pathname + url.search);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCountdownConfig(config);
  }, [config, isHydrated]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore browsers that block fullscreen without user gesture.
    }
  }, []);

  const handleReset = useCallback(() => {
    if (
      !window.confirm(
        "Reset all settings to defaults? Your saved configuration will be cleared.",
      )
    ) {
      return;
    }
    clearCountdownConfig();
    setConfig(DEFAULT_COUNTDOWN);
    setTimerNonce((n) => n + 1);
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = buildCountdownShareUrl(config);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  }, [config]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "escape") {
        if (isEditing) {
          event.preventDefault();
          setIsEditing(false);
          return;
        }
        if (document.fullscreenElement) {
          event.preventDefault();
          void document.exitFullscreen();
        }
        return;
      }

      if (key === "e") {
        event.preventDefault();
        setIsEditing(true);
        return;
      }

      if (key === "f" || key === "p") {
        event.preventDefault();
        void toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, toggleFullscreen]);

  return (
    <div className="countdown-root" data-scene="countdown" data-theme="spacexai">
      <div className="countdown-stage">
        <div className="countdown-frame">
          <RingBots />
          <div className="countdown-lockup">
            <h1 className="countdown-title">{config.title}</h1>
            <CountdownTimer
              key={`${config.durationSec}-${timerNonce}-${config.running}`}
              durationSec={config.durationSec}
              running={config.running}
            />
          </div>
        </div>
      </div>
      <p className="countdown-credit">
        <span className="countdown-credit-title">{config.brand}</span>{" "}
        <span className="countdown-credit-day">{config.dayLabel}</span>
      </p>

      {isHydrated && !isFullscreen ? (
        <div className="stage-actions fixed right-5 top-5 z-30 flex flex-wrap justify-end gap-2">
          <Link href="/" className="stage-btn">
            Home
          </Link>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="stage-btn"
          >
            Edit
          </button>
          <button type="button" onClick={toggleFullscreen} className="stage-btn">
            Preview
          </button>
          <button type="button" onClick={handleShare} className="stage-btn">
            {shareCopied ? "Copied!" : "Share"}
          </button>
        </div>
      ) : null}

      {isEditing ? (
        <CountdownEditor
          config={config}
          onChange={setConfig}
          onClose={() => setIsEditing(false)}
          onReset={handleReset}
          onRestart={() => setTimerNonce((n) => n + 1)}
        />
      ) : null}
    </div>
  );
}
