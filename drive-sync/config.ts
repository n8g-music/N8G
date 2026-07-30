/**
 * N8G Drive Sync — Configuration
 *
 * Maps Google Drive folders to local filesystem paths.
 * Controls polling intervals, processing rules, and sync behavior.
 */

import * as path from "path";

export const ROOT = path.resolve(import.meta.dir, "..");

export const POLL_INTERVAL_MS = 60_000; // 60 seconds
export const BATCH_WINDOW_MS = 30_000; // group changes within 30s into one commit

export const CREDENTIALS_PATH = path.join(ROOT, "drive-credentials.json");
export const SYNC_STATE_PATH = path.join(
  import.meta.dir,
  ".sync-state.json"
);
export const LOG_PATH = path.join(ROOT, ".run", "drive-sync.log");

/**
 * Drive folder → local filesystem mapping.
 * Keys are folder names inside the shared Drive.
 */
export const FOLDER_MAP: Record<string, string> = {
  "Albums": path.join(ROOT, "content", "music", "releases"),
  "Artwork": path.join(ROOT, "public", "images", "gallery"),
  "Photography": path.join(ROOT, "public", "images", "photography"),
  "Videos": path.join(ROOT, "public", "videos"),
  "Lyrics": path.join(ROOT, "content", "music", "lyrics"),
  "Documents": path.join(ROOT, "content", "journal"),
  "Brand Bible": path.join(ROOT, "brand"),
  "Character Bible": path.join(ROOT, "brand", "characters"),
  "Stage Bible": path.join(ROOT, "brand", "stage"),
  "Press Kit": path.join(ROOT, "content", "press"),
};

/**
 * Which folders to treat as bidirectional sync.
 * "Brand Bible" is bidirectional with caution — conflicts preserve local copy.
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

export interface SyncStateFile {
  lastChecked: string; // ISO timestamp
  lastPageToken?: string;
}

export interface SyncState {
  [folderName: string]: SyncStateFile;
}
