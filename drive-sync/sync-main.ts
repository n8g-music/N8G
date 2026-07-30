/**
 * N8G Drive Sync — Main Orchestrator (Git-native)
 *
 * Scans the `drive/` folder for new files dropped by the owner via git,
 * routes them to the correct processor, then cleans up processed sources
 * and commits the result.
 *
 * Usage:
 *   bun run drive-sync/sync-main.ts               # Full sync
 *   bun run drive-sync/sync-main.ts --dry-run     # Log only, no changes
 *   bun run drive-sync/sync-main.ts --once        # One sync then exit
 */

import * as fs from "fs";
import * as path from "path";
import { DRIVE_ROOT, FOLDER_MAP, BIDIRECTIONAL_FOLDERS, classifyFile } from "./config";
import { processImage } from "./processors/images";
import { processAudioFile } from "./processors/audio";
import { processDocument, handleBidirectionalConflict } from "./processors/documents";
import { fullSyncCommit } from "./utils/git-helpers";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [sync] ${message}\n`);
}

/**
 * Run a full sync pass: scan drive/ folders, process files, clean up, commit.
 */
export async function runFullSync(dryRun: boolean = false): Promise<void> {
  if (!fs.existsSync(DRIVE_ROOT)) {
    log(`drive/ folder not found at ${DRIVE_ROOT} — nothing to sync`);
    log("Create it and add subfolders matching the mapped names, then commit.");
    return;
  }

  let totalProcessed = 0;

  for (const [folderName, localPath] of Object.entries(FOLDER_MAP)) {
    const driveFolder = path.join(DRIVE_ROOT, folderName);

    if (!fs.existsSync(driveFolder)) continue;

    const files = fs.readdirSync(driveFolder, { withFileTypes: true });

    if (files.length === 0) continue;

    log(`Scanning drive/${folderName}/ — ${files.length} item(s)`);

    for (const entry of files) {
      // Skip marker files
      if (entry.name === ".gitkeep") continue;

      // Handle subdirectories (e.g. album folders with tracks inside)
      if (entry.isDirectory()) {
        const albumDir = path.join(driveFolder, entry.name);
        const subEntries = fs.readdirSync(albumDir, { withFileTypes: true });
        for (const sub of subEntries) {
          if (!sub.isFile()) continue;
          if (sub.name === ".gitkeep") continue;
          const inputPath = path.join(albumDir, sub.name);
          await processFile(sub.name, inputPath, folderName, localPath, entry.name, dryRun);
          totalProcessed++;
        }
        // Remove album dir after processing
        if (!dryRun) {
          fs.rmSync(albumDir, { recursive: true, force: true });
        }
        continue;
      }

      // Regular file
      const inputPath = path.join(driveFolder, entry.name);
      await processFile(entry.name, inputPath, folderName, localPath, "", dryRun);
      totalProcessed++;
    }
  }

  log(`Sync pass complete — ${totalProcessed} files processed`);

  // Commit and push
  fullSyncCommit(dryRun);
}

/**
 * Route a single file to the correct processor, then clean up the source.
 */
async function processFile(
  filename: string,
  inputPath: string,
  folderName: string,
  localPath: string,
  albumName: string,
  dryRun: boolean
): Promise<void> {
  const type = classifyFile(filename);

  // Bidirectional conflict check
  if (BIDIRECTIONAL_FOLDERS.has(folderName)) {
    const localFilePath = path.join(localPath, filename);
    if (fs.existsSync(localFilePath)) {
      const conflict = handleBidirectionalConflict(localFilePath, inputPath, dryRun);
      if (conflict === "local-kept") {
        // Still clean up the drive source
        if (!dryRun) fs.unlinkSync(inputPath);
        return;
      }
    }
  }

  try {
    switch (type) {
      case "image":
        await processImage(inputPath, localPath, dryRun);
        break;
      case "audio":
        processAudioFile(inputPath, path.join(localPath, "..", "lyrics"), albumName, dryRun);
        break;
      case "document":
        processDocument(inputPath, localPath, dryRun);
        break;
      case "video":
        if (!dryRun) {
          fs.mkdirSync(localPath, { recursive: true });
          fs.copyFileSync(inputPath, path.join(localPath, filename));
        }
        log(`  Video file (copied as-is): ${filename}`);
        break;
      default:
        if (!dryRun) {
          fs.mkdirSync(localPath, { recursive: true });
          fs.copyFileSync(inputPath, path.join(localPath, filename));
        }
        log(`  Unknown file type, copied as-is: ${filename}`);
    }

    // Clean up the source file from drive/ after processing
    if (!dryRun && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  } catch (err: any) {
    log(`  ERROR processing ${filename}: ${err.message}`);
  }
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  log(`N8G Drive Sync (git-native) — starting${dryRun ? " (DRY RUN)" : ""}`);

  try {
    await runFullSync(dryRun);
  } catch (err: any) {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

// If run directly (not imported by watcher)
const scriptName = process.argv[1]?.split("/").pop() || "";
if (scriptName === "sync-main.ts" || process.argv[1]?.includes("sync-main")) {
  main().catch((err) => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}
