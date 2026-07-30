/**
 * Watch content directory for changes and trigger site rebuild.
 * This script is the bridge between content authors and the live site.
 *
 * Usage: bun run scripts/watch-content.ts
 *
 * Watches content/ for markdown changes, brand asset changes,
 * and configuration changes. Triggers publish.sh on detected changes.
 */

import { watch } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "content");

const DEBOUNCE_MS = 2000;
let timeout: ReturnType<typeof setTimeout> | null = null;
let isRebuilding = false;

function log(msg: string) {
  const ts = new Date().toISOString();
  console.log(`[watch-content ${ts}] ${msg}`);
}

function rebuild() {
  if (isRebuilding) {
    log("Rebuild already in progress, skipping this trigger.");
    return;
  }

  isRebuilding = true;
  log("Change detected, triggering rebuild...");

  try {
    execSync("bash ./publish.sh", {
      cwd: process.cwd(),
      stdio: "inherit",
      timeout: 300_000, // 5 minute timeout
    });
    log("Rebuild completed successfully.");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Rebuild failed: ${msg}`);
  } finally {
    isRebuilding = false;
  }
}

function debouncedRebuild() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(rebuild, DEBOUNCE_MS);
}

async function main() {
  log("Watching for content changes in " + CONTENT_DIR);

  const contentWatcher = watch(CONTENT_DIR, { recursive: true });

  for await (const event of contentWatcher) {
    const filename = event?.filename ?? "unknown";
    log(`File change: ${filename}`);
    debouncedRebuild();
  }

  log("Watcher stopped.");
}

main().catch((err) => {
  console.error("[watch-content] Fatal error:", err);
  process.exit(1);
});
