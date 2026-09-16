# Countdown bumper

`/countdown` is a black bumper with a morphing bot ring. Title, timer, and corner copy are editable through the same Edit sidebar pattern as `/`.

## Sub-features

- `countdown-default` loads `/countdown` with title `Grok Bot Galaxy`, timer starting at `01:00`, corner brand `Grok Bot Galaxy`, and `Day 2` in purple.
- `countdown-tick` advances MM:SS about once per second when the timer is running.
- `countdown-params` honors `title`, `day`, and `seconds` query params, and `?data=` share JSON.
- `countdown-edit` opens the sidebar from **Edit** or `E` and persists to `localStorage` key `cursor-welcome-countdown-config`.

## How to get to it (user POV)

- Open `/countdown`.
- Click **Edit** or press `E`.
- Open `/countdown?title=Grok%20Bot%20Galaxy&day=Day%202&seconds=60` for the video defaults as query params.
- Open a Share link with `?data=` JSON.

## Driving it with capture.sh / Chromium

Preconditions:

- Doctor reports 200 for `/countdown`.
- Use a fresh origin (new port) when you need an empty store.

- **Load bumper.** Capture `--path /countdown`. The screenshot shows a black background, title, MM:SS timer, colored morphing bots, bottom-left brand plus purple day, and top-right **Edit**.
- **Open editor.** Click **Edit**. The sidebar named `Countdown editor` shows Title, Corner brand, Day, and Countdown start.
- **Proof.** Keep the screenshot after teardown.

## Gotchas

- Fullscreen hides Edit / Share / Home. Press `Esc` or `F` to leave it.
- `E` while a text field is focused types the letter instead of opening the sidebar.
- Simple `title` / `day` / `seconds` params apply only when `data` is absent.
- Blob orbit is CSS. Morphing faces are rAF. A still proves presence, not clockwise motion.
