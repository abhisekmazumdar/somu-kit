#!/usr/bin/env bash
# Agent Chrome: a separate Chrome with its own profile and debugging port.
# It never shows Chrome's "Allow remote debugging" dialog. Linux and macOS.
#
#   agent-chrome start     start it (does nothing if already up)
#   agent-chrome stop      close it cleanly, so it keeps its logins
#   agent-chrome status    print the address, exit 1 if down
#   agent-chrome install   copy this script to ~/.local/bin/agent-chrome
#
# Overrides: AGENT_CHROME_PORT (9223), AGENT_CHROME_DIR (~/.cache/agent-chrome),
# AGENT_CHROME_BIN (found below).
set -euo pipefail

PORT="${AGENT_CHROME_PORT:-9223}"
DIR="${AGENT_CHROME_DIR:-$HOME/.cache/agent-chrome}"
URL="http://127.0.0.1:$PORT"

find_bin() {
  if [ -n "${AGENT_CHROME_BIN:-}" ]; then echo "$AGENT_CHROME_BIN"; return; fi
  local mac="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  if [ -x "$mac" ]; then echo "$mac"; return; fi
  local b
  for b in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$b" >/dev/null 2>&1; then command -v "$b"; return; fi
  done
  echo "No Chrome found. Set AGENT_CHROME_BIN." >&2
  exit 2
}

up() { curl -fsS --max-time 2 "$URL/json/version" >/dev/null 2>&1; }
pids() { pgrep -f -- "--user-data-dir=$DIR( |$)" || true; }
gone_within() { # seconds
  local i
  for i in $(seq 1 $(($1 * 4))); do [ -z "$(pids)" ] && return 0; sleep 0.25; done
  return 1
}

case "${1:-}" in
  start)
    if up; then echo "$URL"; exit 0; fi
    mkdir -p "$DIR"
    # 127.0.0.1 only: the port has no password and controls every tab.
    nohup "$(find_bin)" --remote-debugging-port="$PORT" \
      --remote-debugging-address=127.0.0.1 --user-data-dir="$DIR" \
      --no-first-run --no-default-browser-check about:blank \
      >"$DIR/agent-chrome.log" 2>&1 &
    for _ in $(seq 1 40); do up && { echo "$URL"; exit 0; }; sleep 0.25; done
    echo "Chrome didn't start. Log: $DIR/agent-chrome.log" >&2
    exit 1
    ;;
  stop)
    if [ -z "$(pids)" ]; then echo "not running"; exit 0; fi
    # Asking Chrome to close saves its cookies. A kill can lose recent logins.
    if up && command -v node >/dev/null 2>&1; then
      ws="$(curl -fsS --max-time 2 "$URL/json/version" |
        sed -n 's/.*"webSocketDebuggerUrl": *"\([^"]*\)".*/\1/p')"
      node -e '
        const ws = new WebSocket(process.argv[1]);
        ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: "Browser.close" }));
        ws.onmessage = () => process.exit(0);
        ws.onerror = () => process.exit(1);
        setTimeout(() => process.exit(1), 5000);
      ' "$ws" || true
      gone_within 10 && { echo "stopped"; exit 0; }
    fi
    kill -TERM $(pids) 2>/dev/null || true
    gone_within 10 || kill -KILL $(pids) 2>/dev/null || true
    echo "stopped (killed: logins from the last 30 seconds may be lost)"
    ;;
  status)
    if up; then echo "$URL"; exit 0; fi
    if [ -n "$(pids)" ]; then echo "not answering on port $PORT"; else echo "not running"; fi
    exit 1
    ;;
  install)
    dest="$HOME/.local/bin/agent-chrome"
    src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
    mkdir -p "$(dirname "$dest")"
    [ "$src" = "$dest" ] || cmp -s "$src" "$dest" || install -m 755 "$src" "$dest"
    echo "$dest"
    ;;
  *)
    echo "usage: agent-chrome start | stop | status | install" >&2
    exit 2
    ;;
esac
