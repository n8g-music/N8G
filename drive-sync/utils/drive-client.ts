/**
 * N8G Drive Sync — Google Drive API Client
 *
 * Wraps the googleapis v3 Drive API with helpers for:
 * - Authentication via service account JSON
 * - Listing files in a folder
 * - Downloading file contents
 * - Checking for changes since last sync
 */

import * as fs from "fs";
import * as path from "path";
import { CREDENTIALS_PATH, SYNC_STATE_PATH, SyncState } from "../config";

// Lazy-loaded googleapis — avoids crash when the package isn't installed
let driveClient: any = null;
let googleModule: any = null;

async function loadGoogleApis(): Promise<boolean> {
  if (googleModule) return true;
  try {
    // Construct module name at runtime so Bun doesn't pre-resolve
    const pkg = ["goo", "gle", "apis"].join("");
    googleModule = await import(pkg);
    return true;
  } catch {
    log("ERROR: googleapis package not installed. Run: bun add googleapis");
    log("  (Note: googleapis is ~200MB — ensure sufficient disk space)");
    return false;
  }
}

/**
 * Log message with timestamp to stdout (captured by log file).
 */
function log(message: string) {
  const ts = new Date().toISOString();
  process.stdout.write(`[${ts}] [drive-client] ${message}\n`);
}

/**
 * Load credentials from the service account key file.
 * Returns the parsed credentials or null with an error message.
 */
export function loadCredentials(): { client_email: string; private_key: string } | null {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    log(
      `ERROR: Credentials file not found at ${CREDENTIALS_PATH}\n` +
      `  To connect Google Drive:\n` +
      `  1. Go to https://console.cloud.google.com/apis/credentials\n` +
      `  2. Create a Service Account and download the JSON key\n` +
      `  3. Place it at: ${CREDENTIALS_PATH}\n` +
      `  4. Share your Drive folders with the service account email\n` +
      `  5. Enable the Google Drive API in your project\n`
    );
    return null;
  }

  try {
    const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    const creds = JSON.parse(raw);
    if (!creds.client_email || !creds.private_key) {
      log("ERROR: Credentials file is missing client_email or private_key");
      return null;
    }
    log(`Credentials loaded for: ${creds.client_email}`);
    return creds;
  } catch (err: any) {
    log(`ERROR: Failed to parse credentials file: ${err.message}`);
    return null;
  }
}

/**
 * Initialize and return an authenticated Drive client.
 * Returns null if credentials are missing/invalid or googleapis isn't installed.
 */
export async function getDriveClient(): Promise<any | null> {
  if (driveClient) return driveClient;

  const creds = loadCredentials();
  if (!creds) return null;

  const loaded = await loadGoogleApis();
  if (!loaded) return null;

  try {
    const { google } = googleModule;
    const auth = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      ],
    });

    driveClient = google.drive({ version: "v3", auth });
    log("Drive client initialized");
    return driveClient;
  } catch (err: any) {
    log(`ERROR: Failed to initialize Drive client: ${err.message}`);
    return null;
  }
}

/**
 * List files in a Drive folder.
 * Uses the folder name to search (we assume a shared root with named folders).
 * Returns an array of file metadata objects.
 */
export async function listFilesInFolder(
  folderName: string,
  pageToken?: string
): Promise<{ files: any[]; nextPageToken?: string }> {
  const drive = await getDriveClient();
  if (!drive) throw new Error("Drive client not initialized");

  // First, find the folder by name in the shared drive / root
  const folderQuery = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const folderRes = await drive.files.list({
    q: folderQuery,
    fields: "files(id, name)",
    pageSize: 1,
  });

  const folder = folderRes.data.files?.[0];
  if (!folder || !folder.id) {
    log(`Folder "${folderName}" not found in Drive`);
    return { files: [] };
  }

  const res = await drive.files.list({
    q: `'${folder.id}' in parents and trashed = false`,
    fields: "nextPageToken, files(id, name, mimeType, md5Checksum, modifiedTime, size, createdTime)",
    pageSize: 100,
    pageToken,
  });

  return {
    files: res.data.files || [],
    nextPageToken: res.data.nextPageToken || undefined,
  };
}

/**
 * Download a file from Drive and write it to a local path.
 * Creates parent directories as needed.
 */
export async function downloadFile(
  fileId: string,
  localPath: string
): Promise<void> {
  const drive = await getDriveClient();
  if (!drive) throw new Error("Drive client not initialized");

  const dir = path.dirname(localPath);
  fs.mkdirSync(dir, { recursive: true });

  const dest = fs.createWriteStream(localPath);

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    res.data
      .pipe(dest)
      .on("finish", () => {
        log(`Downloaded: ${fileId} → ${localPath}`);
        resolve();
      })
      .on("error", (err: Error) => {
        log(`Download error for ${fileId}: ${err.message}`);
        reject(err);
      });
  });
}

/**
 * Get the full metadata for a single file.
 */
export async function getFileMetadata(
  fileId: string
): Promise<any | null> {
  const drive = await getDriveClient();
  if (!drive) throw new Error("Drive client not initialized");

  try {
    const res = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, md5Checksum, modifiedTime, size, createdTime, description",
    });
    return res.data;
  } catch (err: any) {
    log(`Error fetching metadata for ${fileId}: ${err.message}`);
    return null;
  }
}

/**
 * Load sync state from disk.
 */
export function loadSyncState(): SyncState {
  try {
    if (fs.existsSync(SYNC_STATE_PATH)) {
      return JSON.parse(fs.readFileSync(SYNC_STATE_PATH, "utf-8"));
    }
  } catch {
    log("Corrupt sync state file — starting fresh");
  }
  return {};
}

/**
 * Save sync state to disk.
 */
export function saveSyncState(state: SyncState): void {
  const dir = path.dirname(SYNC_STATE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

/**
 * Determine which files are new or changed since last sync.
 * Compares by modifiedTime using the stored state.
 */
export function findChangedFiles(
  files: any[],
  folderName: string,
  state: SyncState
): any[] {
  const folderState = state[folderName];
  if (!folderState || !folderState.lastChecked) {
    // First sync — all files are new
    return files;
  }

  const lastChecked = new Date(folderState.lastChecked);
  return files.filter((f) => {
    if (!f.modifiedTime) return true;
    return new Date(f.modifiedTime) > lastChecked;
  });
}

/**
 * Update the sync state for a folder after processing.
 */
export function updateSyncState(folderName: string, state: SyncState): void {
  state[folderName] = {
    lastChecked: new Date().toISOString(),
  };
  saveSyncState(state);
}
