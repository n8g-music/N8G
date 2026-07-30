/**
 * N8G Drive Sync — Watcher
 *
 * Standalone polling loop that checks Drive for changes every 60 seconds.
 * Can run as a background daemon via the start script.
 */

import { runFullSync } from "./sync-main";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [watcher] ${message}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const once = args.includes("--once");

  log(`Starting N8G Drive Sync watcher${dryRun ? " (DRY RUN)" : ""}`);
  log(`Polling every 60 seconds`);

  // Always do an initial sync
  try {
    await runFullSync(dryRun);
  } catch (err: any) {
    log(`Initial sync error: ${err.message}`);
  }

  if (once) {
    log("--once flag set, exiting after initial sync");
    process.exit(0);
  }

  // Continuous polling loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(60_000);

    try {
      await runFullSync(dryRun);
    } catch (err: any) {
      log(`Sync error: ${err.message}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
