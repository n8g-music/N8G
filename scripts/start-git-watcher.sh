#!/usr/bin/env bash
#
# N8G Git-Native Drive Sync — Start Script
#
# Kills any existing sync process and starts the git-native watcher in the background.
# Logs to .run/git-watcher.log
#
# Usage:
#   ./scripts/start-git-watcher.sh              # Start background watcher
#   ./scripts/start-git-watcher.sh --dry-run    # Start in dry-run mode
#   ./scripts/start-git-watcher.sh --once       # Run once, then exit
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$ROOT_DIR/.run/git-watcher.log"
PID_FILE="$ROOT_DIR/.run/git-watcher.pid"
DRY_RUN=""
SYNC_ARGS=()

cd "$ROOT_DIR"

# Parse arguments
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=" (DRY RUN)"
    SYNC_ARGS+=("--dry-run")
  elif [ "$arg" = "--once" ]; then
    SYNC_ARGS+=("--once")
  fi
done

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Kill existing watcher processes
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "[$(date -Iseconds)] Killing existing watcher process (PID: $OLD_PID)" | tee -a "$LOG_FILE"
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# Also kill any other bun processes running the watcher
pkill -f "drive-sync/watcher.ts" 2>/dev/null || true
pkill -f "drive-sync/sync-main.ts" 2>/dev/null || true

echo "[$(date -Iseconds)] Starting N8G Git-Native Drive Sync watcher${DRY_RUN}..." | tee -a "$LOG_FILE"

# Start in background with nohup
nohup bun run drive-sync/watcher.ts "${SYNC_ARGS[@]}" >> "$LOG_FILE" 2>&1 &
SYNC_PID=$!

echo "$SYNC_PID" > "$PID_FILE"

echo "[$(date -Iseconds)] Git watcher started (PID: $SYNC_PID)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE"
echo ""
echo "Commands:"
echo "  Check logs:    tail -f $LOG_FILE"
echo "  Stop watcher:  kill $SYNC_PID"
echo "  Dry run test:  bun run sync:dry"
