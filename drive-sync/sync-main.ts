/**
 * N8G Drive Sync — Main Orchestrator
 *
 * Core sync logic:
 * 1. Scan all mapped Drive folders
 * 2. Detect new/changed files since last sync
 * 3. Download and route to correct processor
 * 4. Batch commit and push changes
 *
 * Usage:
 *   bun run drive-sync/sync-main.ts               # Full sync
 *   bun run drive-sync/sync-main.ts --dry-run     # Log only, no changes
 *   bun run drive-sync/sync-main.ts --once        # One sync then exit
 */

import * as fs from "fs";
import * as path from "path";
import { FOLDER_MAP, BIDIRECTIONAL_FOLDERS, classifyFile } from "./config";
import {
  getDriveClient,
  listFilesInFolder,
  downloadFile,
  loadSyncState,
  findChangedFiles,
  updateSyncState,
  SyncState,
} from "./utils/drive-client";
import { processImage } from "./processors/images";
import { processAudioFile, processAlbumDirectory } from "./processors/audio";
import {
  processDocument,
  handleBidirectionalConflict,
} from "./processors/documents";
import { fullSyncCommit } from "./utils/git-helpers";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [sync] ${message}\n`);
}

/**
 * Run a full sync pass: check all mapped folders, download new files,
 * route to processors, and commit.
 */
export async function runFullSync(dryRun: boolean = false): Promise<void> {
  const state = loadSyncState();
  const drive = getDriveClient();

  if (!drive) {
    log("Drive client not available — skipping sync");
    log("Place service account credentials at: /home/team/shared/drive-credentials.json");
    log("See drive-sync/SETUP.md for instructions");
    return;
  }

  let totalProcessed = 0;

  for (const [folderName, localPath] of Object.entries(FOLDER_MAP)) {
    log(`Scanning Drive folder: "${folderName}"`);

    try {
      const { files } = await listFilesInFolder(folderName);
      const changed = findChangedFiles(files, folderName, state);

      if (changed.length === 0) {
        log(`  No new files in "${folderName}"`);
        updateSyncState(folderName, state);
        continue;
      }

      log(`  Found ${changed.length} new/changed file(s) in "${folderName}"`);

      for (const file of changed) {
        if (!file.id || !file.name) continue;

        const type = classifyFile(file.name);
        const localFilePath = path.join(localPath, file.name);

        if (BIDIRECTIONAL_FOLDERS.has(folderName)) {
          // For bidirectional folders, check for conflicts before downloading
          const conflict = handleBidirectionalConflict(
            localFilePath,
            localFilePath, // placeholder — will be replaced after download
            dryRun
          );
          if (conflict === "local-kept") continue;
        }

        try {
          // Download the file
          if (!dryRun) {
            await downloadFile(file.id, localFilePath);
          } else {
            log(`  [DRY RUN] Would download: ${file.name} → ${localFilePath}`);
          }

          // Route to processor
          switch (type) {
            case "image":
              await processImage(localFilePath, localPath, dryRun);
              break;
            case "audio":
              processAudioFile(localFilePath, path.join(localPath, "..", "lyrics"), "", dryRun);
              break;
            case "document":
              processDocument(localFilePath, localPath, dryRun);
              break;
            case "video":
              log(`  Video file (stored as-is): ${file.name}`);
              break;
            default:
              log(`  Unknown file type, stored as-is: ${file.name}`);
          }

          totalProcessed++;
        } catch (err: any) {
          log(`  ERROR processing ${file.name}: ${err.message}`);
        }
      }

      updateSyncState(folderName, state);
    } catch (err: any) {
      log(`  ERROR scanning "${folderName}": ${err.message}`);
    }
  }

  log(`Sync pass complete — ${totalProcessed} files processed`);

  // Commit and push
  fullSyncCommit(dryRun);
}

// CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  log(`N8G Drive Sync — starting${dryRun ? " (DRY RUN)" : ""}`);

  try {
    await runFullSync(dryRun);
  } catch (err: any) {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  }
}

// If run directly (not imported by watcher)
const isMain = import.meta.url.endsWith(process.argv[1]?.split("/").pop() || "");
if (isMain || process.argv[1]?.includes("sync-main")) {
  main().catch((err) => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}
