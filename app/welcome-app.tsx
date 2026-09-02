"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BrandMark } from "./brand-mark";
import { FloatingBotAvatars } from "./bot-avatars";
import { GrokBotScene } from "./grokbot-scene";
import { IntroLoader } from "./intro-loader";
import {
  DEFAULT_THEME,
  isHomeThemeId,
  isThemeId,
  THEMES,
  type HomeThemeId,
  type ThemeId,
} from "./themes";
import { unit } from "./unit";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

interface Sponsor {
  title: string;
  name: string;
}

interface Config {
  theme: ThemeId;
  brand: string;
  heading: string;
  useAutoDate: boolean;
  customDate: string;
  intervalSec: number;
  intervalEnabled: boolean;
  botAvatars: boolean;
  sponsors: Sponsor[];
}

interface WelcomePreset {
  lockedTheme?: "grokbot";
  defaultBotAvatars: boolean;
}

export interface WelcomeAppProps {
  lockedTheme?: "grokbot";
  storageKey?: string;
  defaultBotAvatars?: boolean;
}

function createDefaultConfig(preset: WelcomePreset): Config {
  const theme = preset.lockedTheme ?? DEFAULT_THEME;
  return {
    theme,
    brand: THEMES[theme].brand,
    heading: THEMES[theme].heading,
    useAutoDate: true,
    customDate: new Date().toISOString().slice(0, 10),
    intervalSec: 15,
    intervalEnabled: true,
    botAvatars: preset.defaultBotAvatars,
    sponsors: [],
  };
}

const HOME_STORAGE_KEY = "cursor-welcome-config";
const MAX_SPONSORS = 5;

function parseStoredConfig(
  raw: unknown,
  defaults: Config,
  lockedTheme?: "grokbot",
): Config | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Partial<Config>;
  const sponsors = Array.isArray(data.sponsors)
    ? data.sponsors
        .slice(0, MAX_SPONSORS)
        .map((sponsor) => ({
          title: typeof sponsor?.title === "string" ? sponsor.title : "",
          name: typeof sponsor?.name === "string" ? sponsor.name : "",
        }))
    : defaults.sponsors;

  const intervalSec =
    typeof data.intervalSec === "number"
      ? Math.min(60, Math.max(5, Math.round(data.intervalSec)))
      : defaults.intervalSec;

  let theme: ThemeId = defaults.theme;
  if (lockedTheme) {
    theme = lockedTheme;
  } else if (isHomeThemeId(data.theme)) {
    theme = data.theme;
  }

  let brand = typeof data.brand === "string" ? data.brand : defaults.brand;
  let heading =
    typeof data.heading === "string" ? data.heading : defaults.heading;

  if (lockedTheme) {
    const locked = THEMES[lockedTheme];
    const from = isThemeId(data.theme) ? THEMES[data.theme] : null;
    if (!from || brand === from.brand) brand = locked.brand;
    if (!from || heading === from.heading) heading = locked.heading;
  }

  return {
    theme,
    brand,
    heading,
    useAutoDate:
      typeof data.useAutoDate === "boolean"
        ? data.useAutoDate
        : defaults.useAutoDate,
    customDate:
      typeof data.customDate === "string"
        ? data.customDate
        : defaults.customDate,
    intervalSec,
    intervalEnabled:
      typeof data.intervalEnabled === "boolean"
        ? data.intervalEnabled
        : defaults.intervalEnabled,
    botAvatars:
      typeof data.botAvatars === "boolean"
        ? data.botAvatars
        : defaults.botAvatars,
    sponsors,
  };
}

function loadConfigFromStorage(
  storageKey: string,
  defaults: Config,
  lockedTheme?: "grokbot",
): Config | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return parseStoredConfig(JSON.parse(stored), defaults, lockedTheme);
  } catch {
    return null;
  }
}

function saveConfigToStorage(storageKey: string, config: Config) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(config));
  } catch {
    // Ignore quota or private-mode errors.
  }
}

function buildShareUrl(config: Config): string {
  const params = new URLSearchParams();
  params.set("data", JSON.stringify(config));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * Copy that the presenter customised is preserved; only text still sitting at
 * the outgoing theme's default follows the theme across.
 */
function applyTheme(config: Config, next: HomeThemeId): Config {
  const from = THEMES[config.theme];
  const to = THEMES[next];

  return {
    ...config,
    theme: next,
    brand: config.brand === from.brand ? to.brand : config.brand,
    heading: config.heading === from.heading ? to.heading : config.heading,
  };
}

function resolveDate(config: Config): Date {
  return config.useAutoDate
    ? new Date()
    : new Date(`${config.customDate}T12:00:00`);
}

function formatDate(config: Config): string {
  const date = resolveDate(config);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateLines(config: Config): { weekday: string; rest: string } {
  const date = resolveDate(config);

  if (Number.isNaN(date.getTime())) {
    return { weekday: "Invalid date", rest: "" };
  }

  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "long" }),
    rest: date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

function splitHeadingWords(heading: string): string[] {
  return heading.trim().split(/\s+/).filter(Boolean);
}

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const size = unit(index * 7 + 1) * 2 + 1;
        const dur = 12 + unit(index * 7 + 2) * 16;
        return {
          size,
          left: unit(index * 7 + 3) * 100,
          top: 100 + unit(index * 7 + 4) * 20,
          duration: dur,
          delay: unit(index * 7 + 5) * dur,
          opacity: (0.3 + unit(index * 7 + 6) * 0.5).toFixed(2),
        };
      }),
    [],
  );

  return (
    <div className="welcome-particles" aria-hidden="true">
      {particles.map((particle, index) => (
        <span
          key={index}
          className="welcome-particle"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.left}vw`,
            top: `${particle.top}vh`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}

function useReplayMarkAnimation(markKey: number) {
  const markRef = useRef<HTMLDivElement>(null);

  /**
   * The mark's slot stays mounted across replays so nothing on the stage
   * shifts, which means its own entry animation has to be restarted by hand.
   */
  useEffect(() => {
    const node = markRef.current;
    if (!node) return;

    node.style.animation = "none";
    void node.offsetWidth;
    node.style.animation = "";
  }, [markKey]);

  return markRef;
}

function SponsorRow({
  sponsors,
}: {
  sponsors: Sponsor[];
}) {
  if (sponsors.length === 0) return null;

  return (
    <div className="welcome-sponsors">
      {sponsors.map((sponsor, index) => (
        <div
          key={`${sponsor.title}-${sponsor.name}-${index}`}
          className="welcome-sponsor"
          style={{ animationDelay: `${1.95 + index * 0.15}s` }}
        >
          {sponsor.title.trim() && (
            <span className="welcome-sponsor-title">{sponsor.title}</span>
          )}
          {sponsor.name.trim() && (
            <span className="welcome-sponsor-name">{sponsor.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function SpaceXAIByline({
  isVisible,
  revealKey,
}: {
  isVisible: boolean;
  revealKey: number;
}) {
  return (
    <p
      className={`grokbot-byline${isVisible ? "" : " welcome-text-waiting"}`}
      key={`byline-${revealKey}`}
      aria-hidden={!isVisible}
    >
      <span className="grokbot-byline-label">By</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- official wordmark, unscaled */}
      <img
        className="grokbot-byline-mark"
        src="/brand/spacexai/wordmark-black.svg"
        alt="SpaceXAI"
      />
    </p>
  );
}

function GrokBotDisplay({
  config,
  markKey,
  revealKey,
  isRevealed,
  reduceMotion,
  onMarkSettled,
}: {
  config: Config;
  markKey: number;
  revealKey: number;
  isRevealed: boolean;
  reduceMotion: boolean;
  onMarkSettled: () => void;
}) {
  const markRef = useReplayMarkAnimation(markKey);
  const theme = THEMES[config.theme];
  const words = splitHeadingWords(config.heading);
  const dateLines = formatDateLines(config);
  const visibleSponsors = config.sponsors.filter(
    (sponsor) => sponsor.title.trim() || sponsor.name.trim(),
  );
  const waiting = isRevealed ? "" : " welcome-text-waiting";

  return (
    <main className="welcome-stage">
      <div className="welcome-lockup">
        <div
          ref={markRef}
          className={`welcome-mark-wrap${isRevealed ? " settled" : ""}`}
        >
          <BrandMark
            key={markKey}
            logo={theme.logo}
            reduceMotion={reduceMotion}
            onSettled={onMarkSettled}
          />
        </div>
        <div
          className={`welcome-brand${waiting}`}
          key={`brand-${revealKey}`}
          aria-hidden={!isRevealed}
        >
          {config.brand}
        </div>
      </div>

      <h1
        className={`welcome-heading${waiting}`}
        key={`heading-${revealKey}`}
        aria-label={config.heading}
        aria-hidden={!isRevealed}
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="word"
            style={{ animationDelay: `${0.18 + index * 0.06}s` }}
          >
            {word}
          </span>
        ))}
      </h1>

      <div
        className={`welcome-date${waiting}`}
        key={`date-${revealKey}`}
        aria-hidden={!isRevealed}
      >
        <span className="welcome-date-weekday">{dateLines.weekday}</span>
        {dateLines.rest ? <span>{dateLines.rest}</span> : null}
      </div>

      <SpaceXAIByline isVisible={isRevealed} revealKey={revealKey} />

      <div className={waiting} key={`sponsors-${revealKey}`} aria-hidden={!isRevealed}>
        <SponsorRow sponsors={visibleSponsors} />
      </div>
    </main>
  );
}

function WelcomeDisplay({
  config,
  markKey,
  revealKey,
  isRevealed,
  reduceMotion,
  onMarkSettled,
}: {
  config: Config;
  markKey: number;
  revealKey: number;
  isRevealed: boolean;
  reduceMotion: boolean;
  onMarkSettled: () => void;
}) {
  if (config.theme === "grokbot") {
    return (
      <GrokBotDisplay
        config={config}
        markKey={markKey}
        revealKey={revealKey}
        isRevealed={isRevealed}
        reduceMotion={reduceMotion}
        onMarkSettled={onMarkSettled}
      />
    );
  }

  return (
    <ClassicWelcomeDisplay
      config={config}
      markKey={markKey}
      revealKey={revealKey}
      isRevealed={isRevealed}
      reduceMotion={reduceMotion}
      onMarkSettled={onMarkSettled}
    />
  );
}

function ClassicWelcomeDisplay({
  config,
  markKey,
  revealKey,
  isRevealed,
  reduceMotion,
  onMarkSettled,
}: {
  config: Config;
  markKey: number;
  revealKey: number;
  isRevealed: boolean;
  reduceMotion: boolean;
  onMarkSettled: () => void;
}) {
  const markRef = useReplayMarkAnimation(markKey);
  const theme = THEMES[config.theme];
  const words = splitHeadingWords(config.heading);
  const accentStart = Math.max(words.length - 3, 0);
  const visibleSponsors = config.sponsors.filter(
    (sponsor) => sponsor.title.trim() || sponsor.name.trim(),
  );

  return (
    <main className="welcome-stage">
      <div
        ref={markRef}
        className={`welcome-mark-wrap${isRevealed ? " settled" : ""}`}
      >
        <BrandMark
          key={markKey}
          logo={theme.logo}
          reduceMotion={reduceMotion}
          onSettled={onMarkSettled}
        />
      </div>

      <div
        className={`welcome-text-block${isRevealed ? "" : " welcome-text-waiting"}`}
        key={revealKey}
        aria-hidden={!isRevealed}
      >
        <div className="welcome-brand">{config.brand}</div>

        <h1 className="welcome-heading" aria-label={config.heading}>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="word"
              style={{
                animationDelay: `${0.45 + index * 0.1}s`,
                color:
                  index >= accentStart ? "var(--foreground)" : undefined,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <div className="welcome-accent" aria-hidden="true" />

        <div className="welcome-date">
          <span className="dot" />
          <span>{formatDate(config)}</span>
        </div>

        {visibleSponsors.length > 0 && (
          <SponsorRow sponsors={visibleSponsors} />
        )}
      </div>
    </main>
  );
}

function EditSidebar({
  config,
  onChange,
  onClose,
  onReset,
  onToggleTheme,
  showThemeToggle,
}: {
  config: Config;
  onChange: (next: Config) => void;
  onClose: () => void;
  onReset: () => void;
  onToggleTheme: () => void;
  showThemeToggle: boolean;
}) {
  const theme = THEMES[config.theme];
  const isSpaceXAI = config.theme === "spacexai";

  const updateSponsor = (index: number, field: keyof Sponsor, value: string) => {
    const sponsors = config.sponsors.map((sponsor, sponsorIndex) =>
      sponsorIndex === index ? { ...sponsor, [field]: value } : sponsor,
    );
    onChange({ ...config, sponsors });
  };

  const addSponsor = () => {
    if (config.sponsors.length >= MAX_SPONSORS) return;
    onChange({
      ...config,
      sponsors: [...config.sponsors, { title: "", name: "" }],
    });
  };

  const removeSponsor = (index: number) => {
    onChange({
      ...config,
      sponsors: config.sponsors.filter((_, sponsorIndex) => sponsorIndex !== index),
    });
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-backdrop"
        aria-label="Close editor"
        onClick={onClose}
      />
      <aside className="sidebar-panel" aria-label="Welcome screen editor">
        <div className="sb-divider flex items-center justify-between border-b px-5 py-4">
          <h2 className="sb-title text-sm font-semibold uppercase tracking-[0.14em]">
            Edit Welcome
          </h2>
          <button type="button" onClick={onClose} className="sb-close px-2 py-1 text-sm">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {showThemeToggle ? (
            <div className="sb-divider space-y-2 border-b pb-5">
              <div className="flex items-center justify-between gap-3">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  SpaceXAI branding
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isSpaceXAI}
                  aria-label="SpaceXAI branding"
                  onClick={onToggleTheme}
                  className="sb-switch"
                />
              </div>
              <p className="sb-hint text-xs">
                {isSpaceXAI
                  ? "Turn off for the classic Cursor welcome screen."
                  : "Showing the classic Cursor welcome screen."}
              </p>
            </div>
            ) : null}

            <div className="sb-divider space-y-2 border-b pb-5">
              <div className="flex items-center justify-between gap-3">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  {config.theme === "grokbot" ? "Extra characters" : "Bot avatars"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.botAvatars}
                  aria-label={
                    config.theme === "grokbot"
                      ? "Extra characters"
                      : "Bot avatars"
                  }
                  onClick={() =>
                    onChange({ ...config, botAvatars: !config.botAvatars })
                  }
                  className="sb-switch"
                />
              </div>
              <p className="sb-hint text-xs">
                {config.botAvatars
                  ? config.theme === "grokbot"
                    ? "Extra Grok Bot characters are floating around the stage."
                    : "Clay bot avatars are floating behind the welcome screen."
                  : config.theme === "grokbot"
                    ? "Turn on to float extra Grok Bot characters around the stage."
                    : "Turn on to float mixed bot avatars behind the stage."}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                Brand
              </span>
              <input
                type="text"
                value={config.brand}
                onChange={(event) =>
                  onChange({ ...config, brand: event.target.value })
                }
                className="sb-input"
                placeholder={theme.brand}
              />
            </label>

            <label className="block space-y-2">
              <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                Title
              </span>
              <textarea
                value={config.heading}
                onChange={(event) =>
                  onChange({ ...config, heading: event.target.value })
                }
                rows={3}
                className="sb-input resize-none"
                placeholder={theme.heading}
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  Date
                </span>
                <label className="sb-toggle-label flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.useAutoDate}
                    onChange={(event) =>
                      onChange({
                        ...config,
                        useAutoDate: event.target.checked,
                      })
                    }
                    className="sb-check"
                  />
                  Use today
                </label>
              </div>
              <input
                type="date"
                value={config.customDate}
                disabled={config.useAutoDate}
                onChange={(event) =>
                  onChange({ ...config, customDate: event.target.value })
                }
                className="sb-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  Interval Time
                </span>
                <label className="sb-toggle-label flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={config.intervalEnabled}
                    onChange={(event) =>
                      onChange({
                        ...config,
                        intervalEnabled: event.target.checked,
                      })
                    }
                    className="sb-check"
                  />
                  Auto replay
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="sb-hint text-xs">Replay every</span>
                <span className="sb-value text-xs">{config.intervalSec}s</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={config.intervalSec}
                disabled={!config.intervalEnabled}
                onChange={(event) =>
                  onChange({
                    ...config,
                    intervalSec: Number(event.target.value),
                  })
                }
                className="sb-range"
              />
              <p className="sb-hint text-xs">
                {config.intervalEnabled
                  ? "Animation replay interval (5–60 seconds)"
                  : "Auto replay is off — the animation plays once."}
              </p>
            </div>

            <div className="sb-divider space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  Additional Details
                </span>
                <button
                  type="button"
                  onClick={addSponsor}
                  disabled={config.sponsors.length >= MAX_SPONSORS}
                  className="sb-chip"
                >
                  Add Sponsor
                </button>
              </div>

              {config.sponsors.length === 0 && (
                <p className="sb-hint text-xs">
                  Add up to 5 sponsors with a title and name.
                </p>
              )}

              <div className="space-y-3">
                {config.sponsors.map((sponsor, index) => (
                  <div key={index} className="sb-card">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="sb-card-label text-xs font-medium">
                        Sponsor {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSponsor(index)}
                        className="sb-remove text-xs"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={sponsor.title}
                        onChange={(event) =>
                          updateSponsor(index, "title", event.target.value)
                        }
                        placeholder="Title (e.g. Gold Sponsor)"
                        className="sb-input sb-input-sm"
                      />
                      <input
                        type="text"
                        value={sponsor.name}
                        onChange={(event) =>
                          updateSponsor(index, "name", event.target.value)
                        }
                        placeholder="Name (e.g. Acme Corp)"
                        className="sb-input sb-input-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sb-divider border-t px-5 py-4">
          <button type="button" onClick={onReset} className="sb-reset">
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
  );
}

const DEVELOPER_LINK = "https://linktr.ee/krushnasinh";
const CURSOR_LINK = "https://cursor.com/";

function IndiaFlag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 21 14"
      width="16"
      height="11"
      aria-hidden="true"
      role="img"
    >
      <title>India flag</title>
      <rect width="21" height="14" fill="#138808" />
      <rect width="21" height="9.333" fill="#ffffff" />
      <rect width="21" height="4.667" fill="#ff9933" />
      <circle
        cx="10.5"
        cy="7"
        r="2.1"
        fill="none"
        stroke="#000080"
        strokeWidth="0.45"
      />
      <circle cx="10.5" cy="7" r="0.35" fill="#000080" />
    </svg>
  );
}

/**
 * Kept mounted while the mark is still animating — it reserves the stage's
 * height, so revealing it later never nudges the mark out of position.
 */
function WelcomeFooter({ isVisible }: { isVisible: boolean }) {
  return (
    <footer
      className={`welcome-footer${isVisible ? "" : " welcome-footer-waiting"}`}
      aria-hidden={!isVisible}
    >
      <span className="welcome-footer-line">
        Crafted by{" "}
        <a
          href={DEVELOPER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Krushnasinh Jadeja on Linktree"
        >
          Krushnasinh Jadeja
        </a>
      </span>
      <span className="welcome-footer-sep" aria-hidden="true">
        ·
      </span>
      <span className="welcome-footer-line welcome-footer-country">
        <IndiaFlag className="welcome-footer-flag" />
        India
      </span>
      <span className="welcome-footer-sep" aria-hidden="true">
        ·
      </span>
      <span className="welcome-footer-line">
        Built with{" "}
        <a
          href={CURSOR_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Cursor"
        >
          Cursor
        </a>
      </span>
    </footer>
  );
}

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

export function WelcomeApp({
  lockedTheme,
  storageKey = HOME_STORAGE_KEY,
  defaultBotAvatars = false,
}: WelcomeAppProps) {
  const [defaults] = useState(() =>
    createDefaultConfig({ lockedTheme, defaultBotAvatars }),
  );
  const [config, setConfig] = useState<Config>(defaults);
  const [isHydrated, setIsHydrated] = useState(false);
  /** Bumped to replay the stage mark; the mark remounts on every change. */
  const [markKey, setMarkKey] = useState(0);
  /** Bumped when the mark settles, restarting the copy's entry animations. */
  const [revealKey, setRevealKey] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  /**
   * The Rive file plays once as a loading overlay. After it finishes (or is
   * skipped), the welcome stage takes over and never shows the overlay again.
   */
  const [showIntro, setShowIntro] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMarkSettled = useCallback(() => {
    setIsRevealed(true);
    setRevealKey((current) => current + 1);
  }, []);

  const handleIntroFinish = useCallback(() => {
    setShowIntro(false);
    setHasLoaded(true);
  }, []);

  /** Hides the copy again and plays the stage mark from the top. */
  const replayMark = useCallback(() => {
    setIsRevealed(false);
    setMarkKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get("data");
    let nextConfig: Config | null = null;

    if (sharedParam) {
      try {
        nextConfig = parseStoredConfig(
          JSON.parse(sharedParam),
          defaults,
          lockedTheme,
        );
      } catch {
        nextConfig = null;
      }
    }

    if (!nextConfig) {
      nextConfig = loadConfigFromStorage(storageKey, defaults, lockedTheme);
    }

    if (nextConfig) {
      // Hydration from URL / localStorage is a client-only source.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved config once after mount
      setConfig(nextConfig);
    }

    if (sharedParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("data");
      window.history.replaceState({}, "", url.pathname + url.search);
    }

    const resolvedTheme = nextConfig?.theme ?? defaults.theme;
    const hasIntro = Boolean(THEMES[resolvedTheme].intro);
    const skipIntro = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (hasIntro && !skipIntro) {
      setShowIntro(true);
    } else {
      setHasLoaded(true);
    }

    setIsHydrated(true);
  }, [defaults, lockedTheme, storageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    saveConfigToStorage(storageKey, config);
  }, [config, isHydrated, storageKey]);

  /** Counts from the moment the loading screen hands over, so the first play
   * of the mark is never cut short. */
  useEffect(() => {
    if (!config.intervalEnabled || !hasLoaded) return;

    const intervalMs = Math.max(config.intervalSec, 5) * 1000;
    const timer = window.setInterval(replayMark, intervalMs);

    return () => window.clearInterval(timer);
  }, [config.intervalSec, config.intervalEnabled, hasLoaded, replayMark]);

  /**
   * The attribute lives on <html> so the themed tokens also reach <body>, and
   * the favicon is swapped here because the static metadata cannot react to it.
   */
  useEffect(() => {
    document.documentElement.dataset.theme = config.theme;

    const href = THEMES[config.theme].favicon;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.type = "image/svg+xml";
    link.href = href;

    const themeColor = config.theme === "grokbot" ? "#ffffff" : "#0a0a0a";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = themeColor;
  }, [config.theme]);

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

    setConfig(createDefaultConfig({ lockedTheme, defaultBotAvatars }));
    replayMark();
  }, [replayMark, lockedTheme, defaultBotAvatars]);

  const handleToggleTheme = useCallback(() => {
    setConfig((current) =>
      applyTheme(current, current.theme === "spacexai" ? "cursor" : "spacexai"),
    );
    replayMark();
  }, [replayMark]);

  const handleShare = useCallback(async () => {
    const shareUrl = buildShareUrl(config);

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
      if (!hasLoaded) return;
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
        return;
      }

      if (key === "t") {
        if (lockedTheme) return;
        event.preventDefault();
        handleToggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasLoaded, isEditing, toggleFullscreen, handleToggleTheme, lockedTheme]);

  const intro = THEMES[config.theme].intro;

  return (
    <div
      className="welcome-root relative min-h-screen"
      data-theme={config.theme}
      data-bot-avatars={config.botAvatars ? "" : undefined}
    >
      <div className="welcome-bg" aria-hidden="true" />

      {isHydrated && showIntro && intro ? (
        <IntroLoader intro={intro} onFinish={handleIntroFinish} />
      ) : null}

      {isHydrated && hasLoaded && (
        <>
          {config.theme === "grokbot" ? (
            <GrokBotScene
              reduceMotion={prefersReducedMotion}
              showExtras={config.botAvatars}
            />
          ) : (
            <>
              <Particles />
              {config.botAvatars && (
                <FloatingBotAvatars reduceMotion={prefersReducedMotion} />
              )}
            </>
          )}

          <WelcomeDisplay
            config={config}
            markKey={markKey}
            revealKey={revealKey}
            isRevealed={isRevealed}
            reduceMotion={prefersReducedMotion}
            onMarkSettled={handleMarkSettled}
          />

          {!isFullscreen && <WelcomeFooter isVisible />}

          {!isFullscreen && (
            <div className="stage-actions fixed right-5 top-5 z-30 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="stage-btn"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="stage-btn"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="stage-btn"
              >
                {shareCopied ? "Copied!" : "Share"}
              </button>
            </div>
          )}

          {isEditing && (
            <EditSidebar
              config={config}
              onChange={setConfig}
              onClose={() => setIsEditing(false)}
              onReset={handleReset}
              onToggleTheme={handleToggleTheme}
              showThemeToggle={!lockedTheme}
            />
          )}
        </>
      )}
    </div>
  );
}
