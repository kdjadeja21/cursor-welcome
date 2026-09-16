# Countdown bumper

`/countdown` is a black bumper with a perspective ring of morphing Grok bots. Title and timer are editable through the same Edit sidebar pattern as `/`. There is no corner brand or day label.

## Sub-features

- `countdown-default` loads `/countdown` with title `Grok Bot Galaxy` and a timer starting at `01:00`.
- `countdown-tick` advances MM:SS about once per second when the timer is running.
- `countdown-params` honors `title` and `seconds` query params, and `?data=` share JSON.
- `countdown-edit` opens the sidebar from **Edit** or `E` and persists to `localStorage` key `cursor-welcome-countdown-config-v2`.

## How to get to it (user POV)

- Open `/countdown`.
- Click **Edit** or press `E`.
- Open `/countdown?title=Grok%20Bot%20Galaxy&seconds=60` for the video defaults as query params.
- Open a Share link with `?data=` JSON.

## Driving it with capture.sh / Chromium

Preconditions:

- Doctor reports 200 for `/countdown`.
- Use a fresh origin (new port) when you need an empty store.

- **Load bumper.** Capture `--path /countdown`. The screenshot shows a black background, centered title, MM:SS timer, a perspective ellipse of colored morphing bots (larger at bottom-right), and top-right **Edit**. There is no bottom-left brand or Day 2.
- **Open editor.** Click **Edit**. The sidebar named `Countdown editor` shows Title and Countdown start only.
- **Proof.** Keep the screenshot after teardown.

## Gotchas

- Fullscreen hides Edit / Share / Home. Press `Esc` or `F` to leave it.
- `E` while a text field is focused types the letter instead of opening the sidebar.
- Older `cursor-welcome-countdown-config` keys are ignored. The live key is `…-v2`.
- Simple `title` / `seconds` params apply only when `data` is absent.
- Orbit is CSS perspective. Morphing faces are rAF. A still proves presence, not clockwise motion.
