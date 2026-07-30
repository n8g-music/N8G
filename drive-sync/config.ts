/**
 * N8G Drive Sync — Configuration
 *
 * Git-native pipeline: the owner drops files into `drive/` folders
 * and commits to the repo. The watcher detects new commits and
 * processes them automatically.
 */

import * as path from "path";

export const ROOT = path.resolve(import.meta.dir, "..");

export const POLL_INTERVAL_MS = 60_000; // 60 seconds
export const BATCH_WINDOW_MS = 30_000;  // group changes within 30s into one commit

export const LOG_PATH = path.join(ROOT, ".run", "git-watcher.log");

/** Root of the incoming drive/ folder (dropped by owner via git). */
export const DRIVE_ROOT = path.join(ROOT, "drive");

/**
 * Drive folder → local output mapping.
 * Files dropped into `drive/<key>` are processed and output to the matching local path.
 */
export const FOLDER_MAP: Record<string, string> = {
  "Albums":          path.join(ROOT, "content", "music", "releases"),
  "Artwork":         path.join(ROOT, "public", "images", "gallery"),
  "Photography":     path.join(ROOT, "public", "images", "photography"),
  "Videos":          path.join(ROOT, "public", "videos"),
  "Lyrics":          path.join(ROOT, "content", "music", "lyrics"),
  "Documents":       path.join(ROOT, "content", "journal"),
  "Brand Bible":     path.join(ROOT, "brand"),
  "Character Bible": path.join(ROOT, "brand", "characters"),
  "Stage Bible":     path.join(ROOT, "brand", "stage"),
  "Press Kit":       path.join(ROOT, "content", "press"),
};

/**
 * Which folders are bidirectional (local edits may conflict with incoming).
 * Brand Bible is bidirectional — local changes should be preserved if they differ.
 */
export const BIDIRECTIONAL_FOLDERS = new Set(["Brand Bible"]);

/**
 * File extensions → processor routing.
 */
export const IMAGE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".tiff", ".bmp", ".svg",
]);
export const AUDIO_EXTENSIONS = new Set([
  ".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a", ".aiff",
]);
export const DOCUMENT_EXTENSIONS = new Set([
  ".md", ".pdf", ".docx", ".txt", ".csv",
]);
export const VIDEO_EXTENSIONS = new Set([
  ".mp4", ".mov", ".avi", ".webm", ".mkv",
]);

export function classifyFile(filename: string): "image" | "audio" | "document" | "video" | "unknown" {
  const ext = path.extname(filename).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  if (DOCUMENT_EXTENSIONS.has(ext)) return "document";
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  return "unknown";
}
