#!/usr/bin/env bash
set -euo pipefail

PORT=3456
CMD=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="$2"
      shift 2
      ;;
    --)
      shift
      CMD=("$@")
      break
      ;;
    *)
      echo "usage: with-dev.sh --port N -- command" >&2
      exit 2
      ;;
  esac
done

if [[ ${#CMD[@]} -eq 0 ]]; then
  echo "usage: with-dev.sh --port N -- command" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
mkdir -p /tmp/cursor-welcome-verify
PIDFILE="/tmp/cursor-welcome-verify/run-${PORT}.pid"
LOG="/tmp/cursor-welcome-verify/dev-${PORT}.log"

cd "$ROOT"
npm run dev -- --hostname 127.0.0.1 --port "$PORT" >"$LOG" 2>&1 &
echo $! >"$PIDFILE"
DEV_PID=$(cat "$PIDFILE")

cleanup() {
  if kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
  rm -f "$PIDFILE"
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null; then
    break
  fi
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "dev server exited early" >&2
    cat "$LOG" >&2
    exit 1
  fi
  sleep 0.5
done

curl -sf "http://127.0.0.1:${PORT}/" >/dev/null

export PORT
"${CMD[@]}"
