"use client";

import { useEffect, useRef, useState } from "react";

export type DemoChapter = { id: string; label: string; startSec: number };

export const PRODUCT_DEMO_CHAPTERS: DemoChapter[] = [
  { id: "welcome", label: "Welcome", startSec: 0 },
  { id: "home", label: "Home", startSec: 6.768 },
  { id: "brand-focus", label: "Brand Focus", startSec: 16.224 },
  { id: "heading-focus", label: "Heading Focus", startSec: 22.488 },
  { id: "date-focus", label: "Date Focus", startSec: 30.072 },
  { id: "controls", label: "Controls", startSec: 35.328 },
  { id: "keyboard-edit", label: "Keyboard Edit", startSec: 42.096 },
  { id: "open-editor", label: "Open Editor", startSec: 50.64 },
  { id: "editor-fields", label: "Editor Fields", startSec: 60.84 },
  { id: "customized", label: "Customized", startSec: 73.632 },
  { id: "sponsors-focus", label: "Sponsors Focus", startSec: 86.52 },
  { id: "editor-sponsors", label: "Editor Sponsors", startSec: 93.168 },
  { id: "share", label: "Share", startSec: 101.928 },
  { id: "preview", label: "Preview", startSec: 111.024 },
  { id: "footer", label: "Footer", startSec: 119.304 }
];

function formatChapterTimestamp(seconds: number): string {
  const clamped = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs)}`;
  return `${minutes}:${pad(secs)}`;
}

function formatPlaybackClock(currentSec: number, durationSec: number): string {
  return `${formatChapterTimestamp(currentSec)} / ${formatChapterTimestamp(durationSec)}`;
}

export function ProductDemoPlayer({
  chapters = PRODUCT_DEMO_CHAPTERS,
}: {
  chapters?: DemoChapter[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const trackBoundRef = useRef(false);
  const [flashLabel, setFlashLabel] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(chapters[0]?.id ?? null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [controlsHeight, setControlsHeight] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [activeCue, setActiveCue] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setControlsHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function pulse(label: string) {
    setFlashLabel(label);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashLabel(null), 350);
  }

  function scheduleIdle() {
    clearTimeout(idleTimer.current);
    if (videoRef.current?.paused) return;
    idleTimer.current = setTimeout(() => setShowControls(false), 2500);
  }

  function wake() {
    setShowControls(true);
    scheduleIdle();
  }

  function seekTo(startSec: number, id?: string) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = startSec;
    void video.play();
    setCurrentTime(startSec);
    if (id) setActiveId(id);
  }

  function syncClock(video: HTMLVideoElement) {
    setCurrentTime(video.currentTime);
    if (Number.isFinite(video.duration)) setDuration(video.duration);
  }

  function onTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    syncClock(video);
    if (chapters.length === 0) return;
    let current = chapters[0]!;
    for (const chapter of chapters) {
      if (chapter.startSec <= video.currentTime + 0.05) current = chapter;
    }
    setActiveId(current.id);
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }

  function toggleFullscreen() {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (document.fullscreenElement === wrap) void document.exitFullscreen();
    else void wrap.requestFullscreen();
  }

  function seekFromEvent(event: { clientX: number; currentTarget: HTMLElement }, start: number, end: number) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    seekTo(start + ratio * Math.max(end - start, 0));
  }

  function onLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    const track = video.textTracks[0];
    if (track && !trackBoundRef.current) {
      trackBoundRef.current = true;
      track.mode = "hidden";
      track.addEventListener("cuechange", () => {
        const cue = track.activeCues?.[0] as (TextTrackCue & { text?: string }) | undefined;
        setActiveCue(cue?.text ? cue.text.replace(/<[^>]*>/g, "") : "");
      });
    }
    onTimeUpdate();
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={wrapRef}
        style={{ position: "relative", background: "#111" }}
        onPointerMove={wake}
        onPointerDown={wake}
        onFocus={wake}
        onPointerLeave={() => { if (!videoRef.current?.paused) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          playsInline
          preload="metadata"
          style={{ width: "100%", display: "block", background: "#111", colorScheme: "dark" }}
          onClick={togglePlay}
          onPlay={() => { setPaused(false); pulse("Play"); scheduleIdle(); }}
          onPause={() => { setPaused(true); pulse("Pause"); clearTimeout(idleTimer.current); setShowControls(true); }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onDurationChange={onTimeUpdate}
        >
          <source src="/demo/product-demo.mp4" type="video/mp4" />
          <track kind="captions" src="/demo/product-demo.vtt" srcLang="en" label="English" default />
        </video>
        {captionsOn && activeCue ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: showControls ? controlsHeight : 0,
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              padding: "0 1rem 0.5rem",
              pointerEvents: "none",
              transition: "bottom 200ms ease",
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                maxWidth: "100%",
                font: "500 0.85rem/1.4 system-ui, sans-serif",
                padding: "0.15rem 0.6rem",
                borderRadius: "0.25rem",
                textAlign: "center",
                whiteSpace: "pre-line",
              }}
            >
              {activeCue}
            </span>
          </div>
        ) : null}
        {flashLabel ? (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              color: "#fff",
              fontWeight: 600,
              textShadow: "0 1px 8px rgba(0,0,0,.6)",
            }}
          >
            {flashLabel}
          </div>
        ) : null}
        <div
          ref={chromeRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            padding: "0.4rem 0.75rem 0.55rem",
            background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
            color: "#fff",
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? "auto" : "none",
            transition: "opacity 200ms ease",
          }}
        >
          {chapters.length > 0 ? (
            <div aria-label="Demo chapters" style={{ display: "flex", gap: "0.4rem", alignItems: "flex-end" }}>
              {chapters.map((chapter, index) => {
                const start = chapter.startSec;
                const end = chapters[index + 1]?.startSec ?? (duration > 0 ? duration : start);
                const span = Math.max(end - start, 0.01);
                let ratio = 0;
                if (duration > 0 && currentTime >= end - 0.001) ratio = 1;
                else if (currentTime > start) ratio = Math.min(1, (currentTime - start) / span);
                const active = chapter.id === activeId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    aria-label={chapter.label}
                    aria-current={active ? "true" : undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      seekFromEvent(event, start, end);
                      setActiveId(chapter.id);
                    }}
                    style={{
                      flex: span,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.22rem",
                      padding: 0,
                      border: 0,
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        font: "500 0.7rem/1.2 system-ui, sans-serif",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        opacity: active ? 1 : 0.8,
                      }}
                    >
                      {chapter.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        height: 3,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.28)",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          width: `${ratio * 100}%`,
                          background: "#fff",
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              data-pd-progress
              onClick={(event) => seekFromEvent(event, 0, duration)}
              style={{
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.28)",
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: duration > 0 ? `${(100 * currentTime) / duration}%` : "0%",
                  background: "#fff",
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.45rem" }}>
            <button
              type="button"
              aria-label={paused ? "Play" : "Pause"}
              onClick={(event) => {
                event.stopPropagation();
                togglePlay();
              }}
              style={{
                display: "grid",
                placeItems: "center",
                width: "1.5rem",
                height: "1.5rem",
                padding: 0,
                border: 0,
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              )}
            </button>
            <div data-pd-time style={{ font: "500 0.8125rem/1 system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}>
              {formatPlaybackClock(currentTime, duration)}
            </div>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              aria-label="Toggle captions"
              aria-pressed={captionsOn}
              onClick={(event) => { event.stopPropagation(); setCaptionsOn((on) => !on); }}
              style={{
                display: "grid",
                placeItems: "center",
                width: "1.5rem",
                height: "1.5rem",
                padding: 0,
                border: 0,
                background: "transparent",
                color: "#fff",
                opacity: captionsOn ? 0.85 : 0.5,
                cursor: "pointer",
              }}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path fill="currentColor" d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7.5H9.5v-.5h-2v3h2v-.5H11v1.5c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v.5zm7 0h-1.5v-.5h-2v3h2v-.5H18v1.5c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v.5z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={(event) => { event.stopPropagation(); toggleFullscreen(); }}
              style={{
                display: "grid",
                placeItems: "center",
                width: "1.5rem",
                height: "1.5rem",
                padding: 0,
                border: 0,
                background: "transparent",
                color: "#fff",
                opacity: 0.85,
                cursor: "pointer",
              }}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WatchDemoButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full border border-[#f54e00]/25 bg-[#14120b]/70 px-4 py-2 text-sm font-medium text-[#edecec] backdrop-blur transition hover:border-[#f54e00]/45 hover:bg-[#1b1913]/80"
      >
        Watch Demo
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(960px,96vw)] max-w-[96vw] rounded-xl border border-[#f54e00]/20 bg-[#14120b] p-4 text-[#edecec] shadow-2xl"
      >
        <ProductDemoPlayer />
        <form method="dialog">
          <button
            type="submit"
            className="mt-3 rounded-lg border border-[#f54e00]/25 px-3 py-2 text-sm font-medium text-[#edecec] transition hover:border-[#f54e00]/45 hover:bg-[#1b1913]"
          >
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}

