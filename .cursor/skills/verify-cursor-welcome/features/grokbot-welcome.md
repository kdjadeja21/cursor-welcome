# Grok Bot welcome

`/grokbot` is the same welcome product locked to the Grok Bot theme and a separate storage key.

## Sub-features

- `grokbot-load` shows a light Grok Bot stage, not the SpaceXAI dark wordmark.
- `bots-on` can show clay bot avatars when that toggle is on (default on this route).
- `no-theme-flip` does not offer a SpaceXAI/Cursor theme switch the way `/` does for the locked theme.

## How to get to it (user POV)

- Open `/grokbot`.
- Follow the on-stage **Grok Bot** / home link from the other welcome if chrome is visible.

## Driving it with capture.sh / Chromium

Preconditions:

- Doctor reports 200 for `/grokbot`.

- **Load.** Capture `--path /grokbot --out /tmp/cursor-welcome-verify/grokbot.png`. The page is a welcome stage with Grok Bot branding, not the black countdown bumper.
- **Proof.** Heading or brand text refers to Grok Bot / Welcome.

## Gotchas

- First paint may flash the root layout's dark `data-theme` before the client sets grokbot tokens.
- Reduced motion skips motion but the stage copy must still appear.
