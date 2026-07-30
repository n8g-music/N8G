#!/usr/bin/env bash
# Rebuild the Next.js site and (re)start the production server on port 3000.
# Build runs in the foreground so errors surface; the server is launched in a new
# session (setsid) so it keeps running after this script — and your shell — exits.
set -euo pipefail
cd "$(dirname "$0")"

# Group-writable so any team member can publish over another member's build.
umask 002
mkdir -p .run

# Ensure node_modules is on the root filesystem (not the small /home mount)
NODE_MODULES_TARGET="/tmp/n8g-node-modules"
if [ ! -L node_modules ] || [ "$(readlink node_modules)" != "$NODE_MODULES_TARGET" ]; then
  rm -rf node_modules
  mkdir -p "$NODE_MODULES_TARGET"
  ln -sf "$NODE_MODULES_TARGET" node_modules
fi
# Also ensure the target directory exists (in case /tmp was cleaned)
mkdir -p "$NODE_MODULES_TARGET"

# Install deps (no-op once node_modules is current)
bun install --frozen-lockfile

# Build the Next.js production bundle
bun run build

# Kill anything on port 3000 (across user boundaries)
sudo lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the Next.js production server
setsid nohup bun run start > .run/server.log 2>&1 < /dev/null &

# Wait for the new server to actually answer before reporting success
for _ in $(seq 1 50); do
  if curl -sf -o /dev/null http://localhost:3000; then
    echo "site published; serving on port 3000"
    exit 0
  fi
  sleep 0.2
done
echo "warning: published, but the server isn't responding — check .run/server.log" >&2
exit 1
