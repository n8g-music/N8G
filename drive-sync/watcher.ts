/**
 * N8G Drive Sync — Git-Native Watcher
 *
 * Standalone polling loop that fetches from origin and checks for new files
 * in the `drive/` folder every 60 seconds. When changes are detected it pulls
 * them, processes everything, and commits the results.
 *
 * Can run as a background daemon via the start script.
 */

import { execSync } from "child_process";
import { ROOT } from "./config";
import { runFullSync } from "./sync-main";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [watcher] ${message}\n`);
}

function git(args: string): string {
  try {
    return execSync(`git ${args}`, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (err: any) {
    log(`Git command failed: git ${args} — ${err.message}`);
    throw err;
  }
}

/**
 * Fetch from origin and check whether any new commits touch drive/.
 * Returns true if there are changes to process.
 */
function driveFolderHasChanges(): boolean {
  try {
    // Fetch the latest from origin
    git("fetch origin main");

    // Diff between our HEAD and what origin has
    const diff = git("diff HEAD..origin/main --name-only -- drive/");

    return diff.length > 0;
  } catch (err: any) {
    log(`Fetch/diff failed: ${err.message}`);
    return false;
  }
}

/**
 * Pull latest from origin and return the list of drive/ files changed.
 */
function pullAndGetChangedFiles(): string[] {
  try {
    // Pull the latest commits
    git("pull origin main");

    // Get the list of files changed in the last commit that are in drive/
    const files = git("diff HEAD~1..HEAD --name-only -- drive/");
    return files.split("\n").filter(Boolean);
  } catch (err: any) {
    log(`Pull failed: ${err.message}`);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const once = args.includes("--once");

  log(`Starting N8G Git-Native Drive Sync watcher${dryRun ? " (DRY RUN)" : ""}`);
  log(`Polling every 60 seconds — watching drive/ for new commits`);

  // Always do an initial sync (scan whatever is already in drive/)
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
      // Check if origin has new commits touching drive/
      if (driveFolderHasChanges()) {
        log("New commits detected in drive/ — pulling and processing");
        const changedFiles = pullAndGetChangedFiles();
        log(`Changed files: ${changedFiles.join(", ") || "none"}`);

        await runFullSync(dryRun);
      }
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
