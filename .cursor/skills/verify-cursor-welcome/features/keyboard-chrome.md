# Keyboard chrome

Welcome stages (`/` and `/grokbot`) listen for `E`, `T`, `F`/`P`, and `Esc`. `/countdown` uses `E`, `F`/`P`, and `Esc` (no theme toggle).

## Sub-features

- `open-editor` opens the sidebar with `E`.
- `toggle-theme` on `/` switches SpaceXAI and Cursor.
- `fullscreen` enters presentation with `F` or `P`.
- `countdown-keys` opens the countdown editor with `E` and preview with `F`/`P`.

## How to get to it (user POV)

- Focus the page (not an input) and press the key.
- On `/countdown`, `E` opens the countdown editor.

## Driving it with capture.sh / Chromium

Preconditions:

- Interactive CDP or Playwright page, not a static screenshot helper.

- **Editor.** On `/`, press `E`. Sidebar is visible.
- **Countdown.** On `/countdown`, press `E`. The countdown editor sidebar appears.

## Gotchas

- Keys are ignored while typing in the sidebar fields.
- Fullscreen may be blocked in headless Chrome. Report that limitation instead of faking it.
