/**
 * N8G Drive Sync — Document Processor
 *
 * Handles markdown, text, PDF, and other document files:
 * - Markdown: copies to the correct content directory
 * - Google Docs: exports as markdown (requires additional Drive scope)
 * - PDFs: stored in public/documents/
 */

import * as fs from "fs";
import * as path from "path";

function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [processor:documents] ${message}\n`);
}

/**
 * Process a single document file.
 * Routes based on extension:
 * - .md → copy to output dir with frontmatter preservation
 * - .pdf → copy to public/documents
 * - .txt, .csv → copy to output dir
 * - .docx → logged for future conversion
 */
export function processDocument(
  inputPath: string,
  outputDir: string,
  dryRun: boolean = false
): string {
  const filename = path.basename(inputPath);
  const ext = path.extname(filename).toLowerCase();
  const destPath = path.join(outputDir, filename);

  if (dryRun) {
    log(`[DRY RUN] Would copy: ${filename} → ${destPath}`);
    return destPath;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  switch (ext) {
    case ".md":
      // Copy markdown as-is (preserves frontmatter)
      fs.copyFileSync(inputPath, destPath);
      log(`Copied markdown: ${filename}`);
      break;

    case ".pdf":
      fs.copyFileSync(inputPath, destPath);
      log(`Copied PDF: ${filename}`);
      break;

    case ".txt":
    case ".csv":
      fs.copyFileSync(inputPath, destPath);
      log(`Copied document: ${filename}`);
      break;

    case ".docx":
      // Google Docs → Markdown conversion requires the drive.file scope
      // and the export endpoint. For now, copy the .docx as-is.
      fs.copyFileSync(inputPath, destPath);
      log(
        `Copied DOCX: ${filename} (note: for automatic markdown conversion, ` +
        `the service account needs the drive.file scope and the owner should ` +
        `consider uploading .md files directly or using Google Docs export)`
      );
      break;

    default:
      // Unknown format — copy as-is
      fs.copyFileSync(inputPath, destPath);
      log(`Copied (unknown format): ${filename}`);
  }

  return destPath;
}

/**
 * Process all documents in a directory.
 */
export function processDocumentsInDirectory(
  dirPath: string,
  outputDir: string,
  dryRun: boolean = false
): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dirPath)) {
    log(`Directory not found: ${dirPath}`);
    return results;
  }

  const docExts = [".md", ".pdf", ".docx", ".txt", ".csv"];
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const ext = path.extname(entry).toLowerCase();
    if (!docExts.includes(ext)) continue;

    const inputPath = path.join(dirPath, entry);
    if (!fs.statSync(inputPath).isFile()) continue;

    try {
      const dest = processDocument(inputPath, outputDir, dryRun);
      results.push(dest);
    } catch (err: any) {
      log(`ERROR processing ${entry}: ${err.message}`);
    }
  }

  return results;
}

/**
 * Handle bidirectional sync for the Brand Bible folder.
 * When a Drive file conflicts with a local file, preserve the local version
 * and create a backup of the Drive version for review.
 */
export function handleBidirectionalConflict(
  localPath: string,
  driveInputPath: string,
  dryRun: boolean = false
): "local-kept" | "drive-copied" | "no-conflict" {
  if (!fs.existsSync(localPath)) {
    return "no-conflict";
  }

  const localContent = fs.readFileSync(localPath, "utf-8");
  const driveContent = fs.readFileSync(driveInputPath, "utf-8");

  if (localContent === driveContent) {
    return "no-conflict";
  }

  // Conflict: preserve local, backup Drive version
  if (dryRun) {
    log(`[DRY RUN] Conflict detected for ${path.basename(localPath)} — would preserve local`);
    return "local-kept";
  }

  const backupPath = localPath + ".drive-backup";
  fs.copyFileSync(driveInputPath, backupPath);
  log(
    `CONFLICT: ${path.basename(localPath)} — local version preserved, ` +
    `Drive version backed up to ${backupPath}`
  );
  return "local-kept";
}
