"use client";

import { useRef, useState } from "react";

export type DemoChapter = { id: string; label: string; startSec: number };

export const PRODUCT_DEMO_CHAPTERS: DemoChapter[] = [
  { id: "welcome", label: "Welcome", startSec: 0 },
  { id: "welcome-screen", label: "Welcome Screen", startSec: 6.408 },
  { id: "brand-and-heading", label: "Brand And Heading", startSec: 15.936 },
  { id: "live-date", label: "Live Date", startSec: 21.936 },
  { id: "toolbar", label: "Toolbar", startSec: 27.288 },
  { id: "sidebar-editor", label: "Sidebar Editor", startSec: 35.304 },
  { id: "custom-event", label: "Custom Event", startSec: 47.832 },
  { id: "sponsors", label: "Sponsors", startSec: 60.12 },
  { id: "editor-sponsors", label: "Editor Sponsors", startSec: 67.848 },
  { id: "share-link", label: "Share Link", startSec: 78.336 },
  { id: "keyboard-shortcuts", label: "Keyboard Shortcuts", startSec: 85.44 },
  { id: "presentation-mode", label: "Presentation Mode", startSec: 96.12 },
  { id: "footer", label: "Footer", startSec: 105.264 }
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
  const [flashLabel, setFlashLabel] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(chapters[0]?.id ?? null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function pulse(label: string) {
    setFlashLabel(label);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashLabel(null), 350);
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

  function seekFromEvent(event: { clientX: number; currentTarget: HTMLElement }, start: number, end: number) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    seekTo(start + ratio * Math.max(end - start, 0));
  }

  function onLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;
    if (video.textTracks[0]) video.textTracks[0].mode = "showing";
    onTimeUpdate();
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", background: "#111" }}>
        <video
          ref={videoRef}
          playsInline
          preload="metadata"
          style={{ width: "100%", display: "block", background: "#111", colorScheme: "dark" }}
          onClick={togglePlay}
          onPlay={() => { setPaused(false); pulse("Play"); }}
          onPause={() => { setPaused(true); pulse("Pause"); }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onDurationChange={onTimeUpdate}
        >
          <source src="/demo/product-demo.mp4" type="video/mp4" />
          <track kind="captions" src="/demo/product-demo.vtt" srcLang="en" label="English" default />
        </video>
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
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            padding: "0.4rem 0.75rem 0.55rem",
            background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
            color: "#fff",
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
          </div>
        </div>
      </div>
    </div>
  );
}

export function WatchDemoButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-full border border-[#f54e00]/25 bg-[#14120b]/70 px-4 py-2 text-sm font-medium text-[#edecec] backdrop-blur transition hover:border-[#f54e00]/45 hover:bg-[#1b1913]/80"
      >
        Watch Demo
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(960px,96vw)] max-w-[96vw] rounded-xl border border-[#f54e00]/20 bg-[#14120b] p-4 text-[#edecec] shadow-2xl backdrop:bg-black/70"
      >
        <ProductDemoPlayer />
        <form method="dialog">
          <button
            type="submit"
            className="mt-3 rounded-md border border-[#f54e00]/25 px-3 py-1.5 text-sm font-medium text-[#edecec]/80 transition hover:bg-[#26241e] hover:text-[#edecec]"
          >
            Close
          </button>
        </form>
      </dialog>
    </span>
  );
}

