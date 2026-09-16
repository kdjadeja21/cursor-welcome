# Keyboard chrome

Welcome stages (`/` and `/grokbot`) listen for `E`, `T`, `F`/`P`, and `Esc`. The countdown bumper does not.

## Sub-features

- `open-editor` opens the sidebar with `E`.
- `toggle-theme` on `/` switches SpaceXAI and Cursor.
- `fullscreen` enters presentation with `F` or `P`.
- `countdown-ignores` is outdated. `/countdown` now uses the same `E` / `F` / `Esc` chrome as `/`.

## How to get to it (user POV)

- Focus the welcome page (not an input) and press the key.
- On `/countdown`, there is no editor to open.

## Driving it with capture.sh / Chromium

Preconditions:

- Interactive CDP or Playwright page, not a static screenshot helper.

- **Editor.** On `/`, press `E`. Sidebar is visible.
- **Countdown.** On `/countdown`, press `E`. The countdown editor sidebar appears.

## Gotchas

- Keys are ignored while typing in the sidebar fields.
- Fullscreen may be blocked in headless Chrome. Report that limitation instead of faking it.
