/**
 * Sync the Brand Bible from the shared brand directory into the site.
 *
 * Usage: bun run scripts/sync-brand.ts
 *
 * Reads brand assets from /home/team/shared/brand/ and copies
 * relevant files into content/brand/ for the site to consume.
 */

import { cp, readdir, mkdir } from "fs/promises";
import path from "path";

const SHARED_BRAND = "/home/team/shared/brand";
const SITE_BRAND = path.join(process.cwd(), "content", "brand");

async function main() {
  console.log("[sync-brand] Syncing brand assets...");

  await mkdir(SITE_BRAND, { recursive: true });

  try {
    const entries = await readdir(SHARED_BRAND, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const src = path.join(SHARED_BRAND, entry.name);
        const dest = path.join(SITE_BRAND, entry.name);
        await cp(src, dest, { force: true });
        console.log(`[sync-brand] Synced: ${entry.name}`);
      }
    }

    console.log("[sync-brand] Brand sync complete.");
  } catch (err) {
    console.error("[sync-brand] Sync failed:", err);
    process.exit(1);
  }
}

main();
