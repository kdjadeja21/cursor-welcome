"use client";

import { DEFAULT_COUNTDOWN, type CountdownConfig } from "./config";

export function CountdownEditor({
  config,
  onChange,
  onClose,
  onReset,
  onRestart,
}: {
  config: CountdownConfig;
  onChange: (next: CountdownConfig) => void;
  onClose: () => void;
  onReset: () => void;
  onRestart: () => void;
}) {
  const minutes = Math.floor(config.durationSec / 60);
  const seconds = config.durationSec % 60;

  const setDuration = (nextMinutes: number, nextSeconds: number) => {
    const m = Math.min(99, Math.max(0, Math.trunc(nextMinutes)));
    const s = Math.min(59, Math.max(0, Math.trunc(nextSeconds)));
    onChange({
      ...config,
      durationSec: Math.max(1, m * 60 + s),
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
      <aside className="sidebar-panel" aria-label="Countdown editor">
        <div className="sb-divider flex items-center justify-between border-b px-5 py-4">
          <h2 className="sb-title text-sm font-semibold uppercase tracking-[0.14em]">
            Edit Countdown
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="sb-close px-2 py-1 text-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                Title
              </span>
              <textarea
                value={config.title}
                onChange={(event) =>
                  onChange({ ...config, title: event.target.value })
                }
                rows={2}
                className="sb-input resize-none"
                placeholder={DEFAULT_COUNTDOWN.title}
              />
            </label>

            <div className="space-y-2">
              <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                Countdown start
              </span>
              <div className="flex gap-2">
                <label className="block min-w-0 flex-1 space-y-1">
                  <span className="sb-hint text-xs">Minutes</span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={minutes}
                    onChange={(event) =>
                      setDuration(Number(event.target.value), seconds)
                    }
                    className="sb-input"
                  />
                </label>
                <label className="block min-w-0 flex-1 space-y-1">
                  <span className="sb-hint text-xs">Seconds</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds}
                    onChange={(event) =>
                      setDuration(minutes, Number(event.target.value))
                    }
                    className="sb-input"
                  />
                </label>
              </div>
            </div>

            <div className="sb-divider space-y-2 border-b pb-5">
              <div className="flex items-center justify-between gap-3">
                <span className="sb-label text-xs font-medium uppercase tracking-[0.12em]">
                  Timer running
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.running}
                  aria-label="Timer running"
                  onClick={() =>
                    onChange({ ...config, running: !config.running })
                  }
                  className="sb-switch"
                />
              </div>
              <button type="button" onClick={onRestart} className="sb-chip">
                Restart timer
              </button>
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
