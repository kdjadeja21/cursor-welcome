#!/usr/bin/env bash
set -euo pipefail

PORT=3000
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

base="http://127.0.0.1:${PORT}"
fail=0
for path in / /grokbot /countdown; do
  code=$(curl -s -o /tmp/cursor-welcome-doctor-body -w "%{http_code}" "$base$path" || true)
  if [[ "$code" != "200" ]]; then
    echo "FAIL $path status=$code"
    fail=1
  else
    echo "OK $path status=200"
  fi
done
exit "$fail"
