#!/usr/bin/env bash
set -euo pipefail

PORT=3000
PATH_Q="/"
OUT="/tmp/cursor-welcome-verify/shot.png"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="$2"
      shift 2
      ;;
    --path)
      PATH_Q="$2"
      shift 2
      ;;
    --out)
      OUT="$2"
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

mkdir -p /tmp/cursor-welcome-verify
mkdir -p "$(dirname "$OUT")"
CHROME="${CHROME:-google-chrome}"
if ! command -v "$CHROME" >/dev/null 2>&1; then
  CHROME="chromium"
fi

URL="http://127.0.0.1:${PORT}${PATH_Q}"
PROFILE="$(mktemp -d /tmp/cursor-welcome-verify/chrome-profile.XXXXXX)"
cleanup() {
  rm -rf "$PROFILE"
}
trap cleanup EXIT

timeout 45 "$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --no-sandbox \
  --disable-dev-shm-usage \
  --remote-debugging-port=0 \
  --user-data-dir="$PROFILE" \
  --window-size=1280,800 \
  --screenshot="$OUT" \
  "$URL"
echo "wrote $OUT"
