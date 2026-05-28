"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Sponsor {
  title: string;
  name: string;
}

interface Config {
  brand: string;
  heading: string;
  useAutoDate: boolean;
  customDate: string;
  intervalSec: number;
  sponsors: Sponsor[];
}

function createDefaultConfig(): Config {
  return {
    brand: "Cursor Ahmedabad",
    heading: "Welcome to the Cursor Community Workshop",
    useAutoDate: true,
    customDate: new Date().toISOString().slice(0, 10),
    intervalSec: 15,
    sponsors: [],
  };
}

const DEFAULT_CONFIG: Config = createDefaultConfig();

const STORAGE_KEY = "cursor-welcome-config";
const MAX_SPONSORS = 5;

function parseStoredConfig(raw: unknown): Config | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Partial<Config>;
  const sponsors = Array.isArray(data.sponsors)
    ? data.sponsors
        .slice(0, MAX_SPONSORS)
        .map((sponsor) => ({
          title: typeof sponsor?.title === "string" ? sponsor.title : "",
          name: typeof sponsor?.name === "string" ? sponsor.name : "",
        }))
    : DEFAULT_CONFIG.sponsors;

  const intervalSec =
    typeof data.intervalSec === "number"
      ? Math.min(60, Math.max(5, Math.round(data.intervalSec)))
      : DEFAULT_CONFIG.intervalSec;

  return {
    brand:
      typeof data.brand === "string" ? data.brand : DEFAULT_CONFIG.brand,
    heading:
      typeof data.heading === "string" ? data.heading : DEFAULT_CONFIG.heading,
    useAutoDate:
      typeof data.useAutoDate === "boolean"
        ? data.useAutoDate
        : DEFAULT_CONFIG.useAutoDate,
    customDate:
      typeof data.customDate === "string"
        ? data.customDate
        : DEFAULT_CONFIG.customDate,
    intervalSec,
    sponsors,
  };
}

function loadConfigFromStorage(): Config | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return parseStoredConfig(JSON.parse(stored));
  } catch {
    return null;
  }
}

function saveConfigToStorage(config: Config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore quota or private-mode errors.
  }
}
const LOGO_PATH =
  "m466.383 137.073-206.469-119.2034c-6.63-3.8287-14.811-3.8287-21.441 0l-206.4586 119.2034c-5.5734 3.218-9.0144 9.169-9.0144 15.615v240.375c0 6.436 3.441 12.397 9.0144 15.615l206.4686 119.203c6.63 3.829 14.811 3.829 21.441 0l206.468-119.203c5.574-3.218 9.015-9.17 9.015-15.615v-240.375c0-6.436-3.441-12.397-9.015-15.615zm-12.969 25.25-199.316 345.223c-1.347 2.326-4.904 1.376-4.904-1.319v-226.048c0-4.517-2.414-8.695-6.33-10.963l-195.7577-113.019c-2.3263-1.347-1.3764-4.905 1.3182-4.905h398.6305c5.661 0 9.199 6.136 6.368 11.041h-.009z";

function formatDate(config: Config): string {
  const date = config.useAutoDate
    ? new Date()
    : new Date(`${config.customDate}T12:00:00`);

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

function splitHeadingWords(heading: string): string[] {
  return heading.trim().split(/\s+/).filter(Boolean);
}

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, () => {
        const size = Math.random() * 2 + 1;
        const dur = 12 + Math.random() * 16;
        return {
          size,
          left: Math.random() * 100,
          top: 100 + Math.random() * 20,
          duration: dur,
          delay: Math.random() * dur,
          opacity: (0.3 + Math.random() * 0.5).toFixed(2),
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

function WelcomeDisplay({ config }: { config: Config }) {
  const logoRef = useRef<HTMLDivElement>(null);
  const words = splitHeadingWords(config.heading);
  const accentStart = Math.max(words.length - 3, 0);
  const visibleSponsors = config.sponsors.filter(
    (sponsor) => sponsor.title.trim() || sponsor.name.trim(),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      logoRef.current?.classList.add("lit");
    }, 2800);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="welcome-stage">
      <div
        ref={logoRef}
        className="welcome-logo-wrap"
        aria-label="Cursor logo"
      >
        <svg
          className="welcome-logo"
          viewBox="0 0 476 530"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <path d={LOGO_PATH} />
        </svg>
      </div>

      <div className="welcome-text-block">
        <div className="welcome-brand">{config.brand}</div>

        <h1 className="welcome-heading" aria-label={config.heading}>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="word"
              style={{
                animationDelay: `${4.7 + index * 0.12}s`,
                color: index >= accentStart ? "#f54e00" : undefined,
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
          <div className="welcome-sponsors">
            {visibleSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor.title}-${sponsor.name}-${index}`}
                className="welcome-sponsor"
                style={{ animationDelay: `${6.5 + index * 0.15}s` }}
              >
                {sponsor.title.trim() && (
                  <span className="welcome-sponsor-title">
                    {sponsor.title}
                  </span>
                )}
                {sponsor.name.trim() && (
                  <span className="welcome-sponsor-name">{sponsor.name}</span>
                )}
              </div>
            ))}
          </div>
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
}: {
  config: Config;
  onChange: (next: Config) => void;
  onClose: () => void;
  onReset: () => void;
}) {
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
        <div className="flex items-center justify-between border-b border-[#f54e00]/15 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f54e00]">
            Edit Welcome
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[#edecec]/60 transition hover:bg-[#26241e] hover:text-[#edecec]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#edecec]/60">
                Brand
              </span>
              <input
                type="text"
                value={config.brand}
                onChange={(event) =>
                  onChange({ ...config, brand: event.target.value })
                }
                className="w-full rounded-lg border border-[#f54e00]/20 bg-[#1b1913]/80 px-3 py-2 text-sm text-[#edecec] outline-none transition focus:border-[#f54e00]/50"
                placeholder="Cursor Ahmedabad"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#edecec]/60">
                Title
              </span>
              <textarea
                value={config.heading}
                onChange={(event) =>
                  onChange({ ...config, heading: event.target.value })
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-[#f54e00]/20 bg-[#1b1913]/80 px-3 py-2 text-sm text-[#edecec] outline-none transition focus:border-[#f54e00]/50"
                placeholder="Welcome to the Cursor Community Workshop"
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#edecec]/60">
                  Date
                </span>
                <label className="flex items-center gap-2 text-xs text-[#edecec]/80">
                  <input
                    type="checkbox"
                    checked={config.useAutoDate}
                    onChange={(event) =>
                      onChange({
                        ...config,
                        useAutoDate: event.target.checked,
                      })
                    }
                    className="rounded border-[#f54e00]/30 bg-[#1b1913]"
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
                className="w-full rounded-lg border border-[#f54e00]/20 bg-[#1b1913]/80 px-3 py-2 text-sm text-[#edecec] outline-none transition focus:border-[#f54e00]/50 disabled:cursor-not-allowed disabled:opacity-45"
              />
            </div>

            <label className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#edecec]/60">
                  Interval Time
                </span>
                <span className="text-xs text-[#f54e00]">
                  {config.intervalSec}s
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={1}
                value={config.intervalSec}
                onChange={(event) =>
                  onChange({
                    ...config,
                    intervalSec: Number(event.target.value),
                  })
                }
                className="w-full accent-[#f54e00]"
              />
              <p className="text-xs text-[#edecec]/50">
                Animation replay interval (5–60 seconds)
              </p>
            </label>

            <div className="space-y-3 border-t border-[#f54e00]/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#edecec]/60">
                  Additional Details
                </span>
                <button
                  type="button"
                  onClick={addSponsor}
                  disabled={config.sponsors.length >= MAX_SPONSORS}
                  className="rounded-md border border-[#f54e00]/25 px-2.5 py-1 text-xs font-medium text-[#f54e00] transition hover:bg-[#f54e00]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add Sponsor
                </button>
              </div>

              {config.sponsors.length === 0 && (
                <p className="text-xs text-[#edecec]/50">
                  Add up to 5 sponsors with a title and name.
                </p>
              )}

              <div className="space-y-3">
                {config.sponsors.map((sponsor, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#f54e00]/15 bg-[#1b1913]/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#edecec]/60">
                        Sponsor {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSponsor(index)}
                        className="text-xs text-[#edecec]/50 transition hover:text-red-300"
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
                        className="w-full rounded-md border border-[#f54e00]/20 bg-[#14120b]/80 px-3 py-2 text-sm text-[#edecec] outline-none transition focus:border-[#f54e00]/50"
                      />
                      <input
                        type="text"
                        value={sponsor.name}
                        onChange={(event) =>
                          updateSponsor(index, "name", event.target.value)
                        }
                        placeholder="Name (e.g. Acme Corp)"
                        className="w-full rounded-md border border-[#f54e00]/20 bg-[#14120b]/80 px-3 py-2 text-sm text-[#edecec] outline-none transition focus:border-[#f54e00]/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#f54e00]/10 px-5 py-4">
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-lg border border-red-400/25 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-400/45 hover:bg-red-400/10"
          >
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
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

export default function Home() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cycleKey, setCycleKey] = useState(0);

  useEffect(() => {
    const stored = loadConfigFromStorage();
    if (stored) setConfig(stored);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveConfigToStorage(config);
  }, [config, isHydrated]);

  useEffect(() => {
    const intervalMs = Math.max(config.intervalSec, 5) * 1000;
    const timer = window.setInterval(() => {
      setCycleKey((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [config.intervalSec]);

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

    setConfig(createDefaultConfig());
    setCycleKey((current) => current + 1);
  }, []);

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
    <div className="welcome-root relative min-h-screen">
      <div className="welcome-bg" aria-hidden="true" />
      <Particles />
      <WelcomeDisplay key={cycleKey} config={config} />

      {!isFullscreen && (
        <div className="fixed right-5 top-5 z-30 flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-[#f54e00]/25 bg-[#14120b]/70 px-4 py-2 text-sm font-medium text-[#edecec] backdrop-blur transition hover:border-[#f54e00]/45 hover:bg-[#1b1913]/80"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-[#f54e00]/25 bg-[#14120b]/70 px-4 py-2 text-sm font-medium text-[#edecec] backdrop-blur transition hover:border-[#f54e00]/45 hover:bg-[#1b1913]/80"
          >
            Preview
          </button>
        </div>
      )}

      {isEditing && (
        <EditSidebar
          config={config}
          onChange={setConfig}
          onClose={() => setIsEditing(false)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
