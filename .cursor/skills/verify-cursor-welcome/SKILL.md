---
name: verify-cursor-welcome
description: Drive the cursor-welcome Next.js web UI (welcome, Grok Bot, countdown bumper) the way a presenter would. Use when proving a route, layout, timer, or animation on this app, not when only typechecking.
---

# Verify cursor-welcome

Primary surface is the **browser**. There is no CLI product. Proof is a loaded URL plus a screenshot (and, for the timer, two captures a second apart).

Default bind is `http://127.0.0.1:3000`. Use another port when 3000 is taken. Never attach to a server you did not start.

## Launch

From the repo root, after `npm install`:

```bash
PORT="${PORT:-3000}"
npm run dev -- --hostname 127.0.0.1 --port "$PORT"
```

Ready when `http://127.0.0.1:$PORT/` returns HTTP 200. The Next log line `Ready` is sufficient. Teardown is SIGTERM on the process you started, not `pkill next`.

For a one-shot drive, use the helper:

```bash
.cursor/skills/verify-cursor-welcome/scripts/with-dev.sh --port 3456 -- <command>
```

That script starts `next dev`, waits for `/`, runs the command, then kills only its child.

## Doctor

Read-only. Does not start or stop the app.

```bash
.cursor/skills/verify-cursor-welcome/scripts/doctor.sh --port 3000
```

Pass when all of these hold:

- `GET /` is 200
- HTML contains the welcome heading or editor chrome (not an empty error document)
- `GET /grokbot` is 200
- `GET /countdown` is 200

If doctor fails, relaunch. Do not drive a stranger's instance on 3000.

## Drive

Harness is Chromium headless via the helper (system `google-chrome` on this VM, or `chromium`). Prefer ARIA names from the feature map over CSS and coordinates.

```bash
.cursor/skills/verify-cursor-welcome/scripts/capture.sh \
  --port 3456 \
  --path /countdown \
  --out /tmp/cursor-welcome-verify/countdown.png
```

Interactive checks (theme toggle, editor) belong in the feature files. Use a real browser/CDP session when a screenshot of first paint is not enough (keyboard `E` / `T` / `F`).

Isolation: two `next dev` processes can share the same tree. Give each a distinct `--port`. They share `localStorage` only if they share an origin. Use different ports so origins differ (`127.0.0.1:3456` vs `127.0.0.1:3457`). Do not reuse a presenter's `localhost:3000` session.

`capture.sh` uses a throwaway Chrome `--user-data-dir` so a locked default profile does not abort the shot. Headless Chrome logs D-Bus noise. Ignore it if the PNG is written.

The on-screen Next.js `N` badge is off via `devIndicators: false` in `next.config.ts`.

## Evidence

Store proofs under `/tmp/cursor-welcome-verify/` (or a path the caller names). Cleanup must not delete this directory.

Standards:

- Hit the real route in a browser. `npm run build` alone is not proof.
- For `/countdown`, the screenshot must show black background, title, MM:SS timer, blob ring, and the Day 2 label.
- For the ticking timer, capture twice with ≥1s gap and assert the displayed `MM:SS` changed (or stayed `00:00` if already elapsed).
- Welcome editor persistence is `localStorage` on that origin. Prove it by reload, not by reading storage APIs from Node.

## Cleanup

Kill the PID recorded by `with-dev.sh` (the file under `/tmp/cursor-welcome-verify/run-$PORT.pid`). Do not `pkill -f next`. Leave `/tmp/cursor-welcome-verify/*.png` in place.

## Helpers

| Script | Role |
| --- | --- |
| `scripts/doctor.sh` | GET `/`, `/grokbot`, `/countdown` |
| `scripts/with-dev.sh` | Isolated `next dev` + command + teardown |
| `scripts/capture.sh` | Headless screenshot of one path |

All three are executable. Invoke them from the repo root as shown above.
