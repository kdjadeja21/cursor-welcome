# cursor-welcome verification map

This directory is the maintained source for verifying presenter-facing routes. Read this index, then the matching feature file.

## Baseline preconditions

- Install with `npm install` at the repo root.
- Launch with `.cursor/skills/verify-cursor-welcome/scripts/with-dev.sh` or `npm run dev -- --hostname 127.0.0.1 --port $PORT`.
- Run `.cursor/skills/verify-cursor-welcome/scripts/doctor.sh --port $PORT` and require 200 on `/`, `/grokbot`, and `/countdown`.
- Never drive an instance this run did not start.
- Proof images go to `/tmp/cursor-welcome-verify/` and survive cleanup.

## Driving conventions

- Start from a cold load of the route under test.
- Prefer ARIA roles and accessible names listed in the feature file.
- Treat query strings as literal (`title`, `seconds` on `/countdown`).
- Welcome and Grok Bot persist config in `localStorage` per storage key. Use a fresh port when you need a clean store.

## Features

- [Welcome stage](./welcome-stage.md) is `/` with SpaceXAI/Cursor themes, editor, and share.
- [Grok Bot welcome](./grokbot-welcome.md) is `/grokbot` with the locked Grok Bot theme.
- [Countdown bumper](./countdown-bumper.md) is `/countdown` with title, timer, and a perspective bot ring.
- [Keyboard chrome](./keyboard-chrome.md) is `E` / `T` / `F` on the welcome stages (not on `/countdown`).
