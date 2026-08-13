"use client";

import { useRef } from "react";

export type DemoChapter = { id: string; label: string; startSec: number };

export const PRODUCT_DEMO_CHAPTERS: DemoChapter[] = [
  { id: "welcome", label: "Welcome", startSec: 0 },
  { id: "home", label: "Home", startSec: 6.768 },
  { id: "brand-focus", label: "Brand Focus", startSec: 16.224 },
  { id: "heading-focus", label: "Heading Focus", startSec: 22.488 },
  { id: "date-focus", label: "Date Focus", startSec: 30.072 },
  { id: "controls", label: "Controls", startSec: 35.328 },
  { id: "keyboard-edit", label: "Keyboard Edit", startSec: 44.784 },
  { id: "open-editor", label: "Open Editor", startSec: 55.128 },
  { id: "editor-fields", label: "Editor Fields", startSec: 64.392 },
  { id: "customized", label: "Customized", startSec: 77.184 },
  { id: "sponsors-focus", label: "Sponsors Focus", startSec: 90.072 },
  { id: "editor-sponsors", label: "Editor Sponsors", startSec: 96.72 },
  { id: "share", label: "Share", startSec: 105.48 },
  { id: "preview", label: "Preview", startSec: 114.576 },
  { id: "footer", label: "Footer", startSec: 122.856 },
];

export function ProductDemoPlayer({
  chapters = PRODUCT_DEMO_CHAPTERS,
}: {
  chapters?: DemoChapter[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function seekTo(startSec: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = startSec;
    void video.play();
  }

  return (
    <div data-pd-root className="w-full">
      <video
        ref={videoRef}
        className="pd-video block w-full bg-[#111]"
        controls
        playsInline
        preload="metadata"
      >
        <source src="/demo/product-demo.mp4" type="video/mp4" />
        <track
          kind="captions"
          src="/demo/product-demo.vtt"
          srcLang="en"
          label="English"
          default
        />
      </video>
      {chapters.length > 0 ? (
        <div
          aria-label="Demo chapters"
          className="mt-2.5 flex flex-wrap gap-1.5"
        >
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              data-pd-start={chapter.startSec}
              onClick={() => seekTo(chapter.startSec)}
              className="rounded-md border border-[#f54e00]/25 bg-[#1b1913] px-2.5 py-1 text-xs font-medium text-[#edecec] transition hover:border-[#f54e00]/45 hover:bg-[#26241e]"
            >
              {chapter.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WatchDemoButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function stopPlayback() {
    const video = dialogRef.current?.querySelector("video");
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

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
        onClose={stopPlayback}
        className="w-[min(960px,96vw)] max-w-[96vw] rounded-xl border border-[#f54e00]/20 bg-[#14120b] p-4 text-[#edecec] shadow-2xl backdrop:bg-black/70"
      >
        <ProductDemoPlayer />
        <form method="dialog">
          <button
            type="submit"
            className="mt-3 rounded-md border border-[#f54e00]/25 bg-[#1b1913] px-3 py-1.5 text-sm font-medium text-[#edecec] transition hover:border-[#f54e00]/45 hover:bg-[#26241e]"
          >
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}
