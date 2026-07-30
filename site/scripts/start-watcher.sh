#!/usr/bin/env bash
# Start the content watcher as a background process.
# Watches content/ for changes and triggers publish.sh automatically.
#
# Usage: bash scripts/start-watcher.sh
#
# Logs: .run/watcher.log
# PID:   .run/watcher.pid

set -euo pipefail
cd "$(dirname "$0")/.."

umask 002
mkdir -p .run

# Kill any existing watcher process
if [ -f .run/watcher.pid ]; then
  OLD_PID=$(cat .run/watcher.pid 2>/dev/null || true)
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Stopping existing watcher (PID $OLD_PID)..."
    kill "$OLD_PID" 2>/dev/null || true
    sleep 0.5
    # Force kill if still alive
    kill -9 "$OLD_PID" 2>/dev/null || true
  fi
  rm -f .run/watcher.pid
fi

# Also kill any stray bun watcher processes
pkill -f "watch-content.ts" 2>/dev/null || true

echo "Starting content watcher..."
setsid nohup bash -c 'cd /home/team/shared/site && NODE_PATH=/tmp/n8g-node-modules bun run scripts/watch-content.ts' \
  > .run/watcher.log 2>&1 < /dev/null &

WATCHER_PID=$!
echo "$WATCHER_PID" > .run/watcher.pid

# Give it a moment to start
sleep 1

if kill -0 "$WATCHER_PID" 2>/dev/null; then
  echo "Watcher started successfully (PID $WATCHER_PID)."
  echo "Logs: .run/watcher.log"
else
  echo "ERROR: Watcher failed to start. Check .run/watcher.log"
  cat .run/watcher.log 2>/dev/null || true
  exit 1
fi
