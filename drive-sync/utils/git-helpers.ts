/**
 * N8G Drive Sync — Git Helpers
 *
 * Stage changed files, create descriptive commits, and push to origin.
 * Used after processing to trigger the site rebuild pipeline.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { ROOT } from "../config";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [git] ${message}\n`);
}

/**
 * Run a git command from the repository root and return stdout.
 */
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
 * Check whether the working tree has any changes (staged or unstaged).
 */
export function hasChanges(): boolean {
  const status = git("status --porcelain");
  return status.length > 0;
}

/**
 * Get a summary of pending changes for the commit message.
 */
export function getChangeSummary(): string {
  const status = git("status --short");
  const lines = status
    .split("\n")
    .filter(Boolean)
    .map((l) => l.trim());
  const added = lines.filter((l) => l.startsWith("A") || l.startsWith("??")).length;
  const modified = lines.filter((l) => l.startsWith("M")).length;
  const deleted = lines.filter((l) => l.startsWith("D")).length;

  const parts: string[] = [];
  if (added > 0) parts.push(`${added} added`);
  if (modified > 0) parts.push(`${modified} modified`);
  if (deleted > 0) parts.push(`${deleted} deleted`);

  if (parts.length === 0) return "no changes";

  // Try to figure out which folder(s) changed
  const dirs = new Set<string>();
  for (const line of lines) {
    const filePath = line.slice(3).trim();
    const topDir = filePath.split("/")[0];
    if (topDir && topDir !== ".") dirs.add(topDir);
  }
  const folderStr = dirs.size > 0 ? `[${[...dirs].join(", ")}] ` : "";

  return `${folderStr}${parts.join(", ")}`;
}

/**
 * Stage all changes in the working tree.
 */
export function stageAll(): void {
  git("add -A");
  log("All changes staged");
}

/**
 * Commit with a generated message.
 * Returns the commit hash or null if nothing to commit.
 */
export function commit(message?: string): string | null {
  if (!hasChanges()) {
    log("Nothing to commit");
    return null;
  }

  const summary = message || getChangeSummary();
  const commitMsg = `sync: ${summary}`;

  git(`commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  const hash = git("rev-parse HEAD").slice(0, 7);
  log(`Committed: ${hash} — "${commitMsg}"`);
  return hash;
}

/**
 * Push to origin main.
 */
export function push(): void {
  git("push origin main");
  log("Pushed to origin/main");
}

/**
 * Full pipeline: stage, commit, push.
 * Used in dry-run mode, just logs what would happen.
 */
export function fullSyncCommit(dryRun: boolean = false): void {
  if (!hasChanges()) {
    log("No changes to commit — skipping");
    return;
  }

  const summary = getChangeSummary();
  log(`Changes detected: ${summary}`);

  if (dryRun) {
    const status = git("status --short");
    log(`[DRY RUN] Would stage and commit:\n${status}`);
    return;
  }

  stageAll();
  const hash = commit();
  if (hash) push();

  log("Sync commit complete");
}

/**
 * Get the current git status for logging.
 */
export function getStatus(): string {
  return git("status --short") || "(clean)";
}

/**
 * Revert any uncommitted changes (used after test commits).
 */
export function resetHard(commitish: string = "HEAD~1"): void {
  try {
    git(`reset --hard ${commitish}`);
    log(`Reset to ${commitish}`);
  } catch {
    log("Nothing to reset");
  }
}

/**
 * Revert a test commit that was just made and force-push.
 */
export function revertTestCommit(): void {
  try {
    const lastMsg = git("log -1 --format=%s");
    if (lastMsg.includes("sync: test")) {
      git("reset --hard HEAD~1");
      git("push origin main --force");
      log("Reverted test commit");
    }
  } catch (err: any) {
    log(`Revert failed: ${err.message}`);
  }
}
