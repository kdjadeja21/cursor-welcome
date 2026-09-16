# Welcome stage

The home route is a full-viewport workshop welcome with brand mark, heading, date, optional bot avatars, and an editor sidebar.

## Sub-features

- `home-load` shows the SpaceXAI welcome stage after any intro.
- `theme-toggle` switches SpaceXAI and Cursor branding from the editor or `T`.
- `editor-persist` keeps Brand and Title across reload on the same origin.
- `share-link` copies a `?data=` URL that restores config.

## How to get to it (user POV)

- Open `/` in the browser.
- Click **Edit** or press `E`.
- Press `T` to toggle branding while the editor is closed and focus is not in a field.

## Driving it with capture.sh / Chromium

Preconditions:

- Doctor reports 200 for `/`.
- This origin was started by the current run.

- **Load home.** Open `/`. Capture `.cursor/skills/verify-cursor-welcome/scripts/capture.sh --port $PORT --path / --out /tmp/cursor-welcome-verify/welcome.png`. The image shows the brand wordmark or logo and a welcome heading.
- **Open editor.** Press `E` in an interactive CDP session. The sidebar heading related to editing is visible.
- **Proof.** The screenshot path still exists after `with-dev.sh` teardown.

## Gotchas

- SpaceXAI may play a one-time Rive intro. Wait until the stage heading is visible before asserting copy.
- `/` and `/grokbot` use different `localStorage` keys. A setting on one does not appear on the other.
- `T` does nothing useful if a text field is focused.
