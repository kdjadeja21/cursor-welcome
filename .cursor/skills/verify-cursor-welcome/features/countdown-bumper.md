# Countdown bumper

`/countdown` is a black, chrome-free bumper. Centered title, MM:SS timer, clockwise blob ring, bottom-left day label.

## Sub-features

- `countdown-default` loads `/countdown` with title `Grok Bot Galaxy`, timer starting at `01:00`, and `Day 2` in purple.
- `countdown-tick` advances MM:SS about once per second.
- `countdown-params` honors `title`, `day`, and `seconds` query params.
- `countdown-no-chrome` has no Edit / Share / theme controls on the scene.

## How to get to it (user POV)

- Open `/countdown`.
- Open `/countdown?title=Grok%20Bot%20Galaxy&day=Day%202&seconds=60` for the video defaults made explicit.
- Open `/countdown?seconds=5` to watch a short remaining time.

## Driving it with capture.sh / Chromium

Preconditions:

- Doctor reports 200 for `/countdown`.
- `prefers-reduced-motion` is not forced unless you are testing the static ring.

- **Load bumper.** Run `.cursor/skills/verify-cursor-welcome/scripts/capture.sh --port $PORT --path /countdown --out /tmp/cursor-welcome-verify/countdown.png`. The screenshot shows a black background, the title `Grok Bot Galaxy`, a `MM:SS` timer, a ring of colored blobs with pill eyes, and bottom-left `Grok Bot Galaxy` plus purple `Day 2`.
- **Tick.** Capture twice, 1500ms apart. The accessible timer text changes unless it is already `00:00`.
- **Params.** Open `/countdown?title=Hello&day=Day%209&seconds=90`. Title is `Hello`, day label includes `Day 9`, timer starts at `01:30`.
- **Proof.** Keep `/tmp/cursor-welcome-verify/countdown.png` after teardown.

## Gotchas

- `/countdown` must not show the welcome editor or particle field. If you see Edit or a Rive intro, you are on the wrong route.
- Timer first paint is the configured duration. Do not assert a value from wall-clock `Date.now()` in Node.
- Blob orbit is CSS. A single screenshot proves presence of the ring, not clockwise direction. Direction needs two frames or a short video.
