# N8G Drive Sync — Setup Guide

How to connect the N8G Google Drive to the autonomous creative OS.

## Overview

The Drive Sync pipeline watches a shared Google Drive for new or changed files and automatically:

- Downloads them to the correct local directory
- Processes images (resize, convert to WebP, strip metadata)
- Reads audio metadata and generates markdown + JSON
- Copies documents to content directories
- Commits everything and pushes to GitHub (which triggers the site rebuild)

## Prerequisites — Google Cloud Setup

You (the owner) need to:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Note the project ID

### 2. Enable the Drive API

1. Go to **APIs & Services → Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 3. Create a Service Account

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → Service Account**
3. Give it a name like `n8g-drive-sync`
4. Skip the optional role assignments
5. Click **Done**

### 4. Download the Service Account Key

1. In the Credentials page, click on the service account you created
2. Go to the **Keys** tab
3. Click **Add Key → Create New Key → JSON**
4. Download the JSON file

### 5. Place the Credentials File

Copy the downloaded JSON file to:

```
/home/team/shared/drive-credentials.json
```

### 6. Share Your Drive Folders

1. Open the downloaded JSON file and find the `client_email` field (looks like `n8g-drive-sync@project-id.iam.gserviceaccount.com`)
2. In Google Drive, share each folder you want synced with that email address
3. Give it **Viewer** access (read-only is sufficient for syncing)

The folders must be named exactly as follows in your Drive root:

| Folder Name    | What Goes In            |
|----------------|-------------------------|
| `Albums`       | Mastered tracks         |
| `Artwork`      | Album art, posters      |
| `Photography`  | Photoshoot images       |
| `Videos`       | Performance videos      |
| `Lyrics`       | Track lyrics            |
| `Documents`    | Creative notes, releases|
| `Brand Bible`  | Brand documents         |
| `Character Bible`| Character documents   |
| `Stage Bible`  | Stage design documents  |
| `Press Kit`    | Press materials         |

## Testing — Dry Run

Before connecting real credentials, you can test the pipeline:

```bash
cd /home/team/shared
bun run sync:dry
```

With credentials in place, `--dry-run` shows what *would* happen without actually downloading or committing:

```bash
bun run drive-sync/sync-main.ts --dry-run
```

### Test the Image Processor (no credentials needed)

```bash
# Create a test image
bun -e "
import sharp from 'sharp';
await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#1a1a2e' } })
  .jpeg()
  .toFile('/tmp/test-image.jpg');
"

# Run the image processor
bun -e "
import { processImage } from './drive-sync/processors/images';
await processImage('/tmp/test-image.jpg', '/tmp/test-output');
console.log('Done — check /tmp/test-output/');
"
```

## Running the Sync

### One-time sync

```bash
cd /home/team/shared
bun run sync
```

This does one full scan of all Drive folders, downloads new files, processes them, and commits.

### Continuous watcher (background daemon)

```bash
cd /home/team/shared
./scripts/start-drive-sync.sh
```

This starts the watcher process that polls every 60 seconds. It survives terminal logout.

### Stop the watcher

```bash
kill $(cat /home/team/shared/.run/drive-sync.pid)
```

### Check the logs

```bash
tail -f /home/team/shared/.run/drive-sync.log
```

## How It Works

```
Drive folder "Artwork/"
       │
       ▼
[watcher.ts] polls every 60s
       │
       ▼
[sync-main.ts] detects new/changed files
       │
       ▼
[drive-client.ts] downloads files
       │
       ▼
[processors/] routes by file type:
  ├── images.ts    → sharp resize, WebP, strip EXIF
  ├── audio.ts     → ffprobe metadata, markdown gen
  └── documents.ts → copy to content dirs
       │
       ▼
[git-helpers.ts]  → stage, commit, push
       │
       ▼
[site watcher]    → auto-rebuilds the website
```

## File Processing Rules

### Images
- Resized to: 200px (thumb), 800px (medium), 1600px (full)
- Converted to WebP format
- EXIF metadata stripped
- Output: `{name}-thumb.webp`, `{name}-med.webp`, `{name}.webp`

### Audio
- Metadata extracted via ffprobe (falls back to filename if not installed)
- Generates markdown per track with frontmatter
- Generates `releases.json` for album folders

### Documents
- Markdown: copied as-is
- PDFs: stored in `public/documents/`
- Google Docs: stored as-is (markdown export requires additional API scope — let the team know if you need this)

### Brand Bible (Bidirectional Sync)
The Brand Bible folder syncs both ways with caution. If a file exists both locally and in Drive and they differ, the local copy is preserved and the Drive version is backed up to `{filename}.drive-backup` for manual review.

## Troubleshooting

**"Credentials file not found"**
→ You haven't placed the service account JSON at `/home/team/shared/drive-credentials.json` yet. Follow step 5 above.

**"Folder not found in Drive"**
→ Either the folder doesn't exist in the shared Drive, or the service account email hasn't been given access. Check step 6.

**Git push fails**
→ Run `get_git_credentials` to refresh the GitHub token, then retry.

**Images not processing**
→ Make sure `sharp` is installed: `cd /home/team/shared && bun install`

## Directory Structure

```
drive-sync/
├── config.ts              # Folder mappings, polling interval
├── sync-main.ts           # Main orchestrator
├── watcher.ts             # Polling daemon
├── processors/
│   ├── images.ts          # Image resize + WebP
│   ├── audio.ts           # Audio metadata + markdown
│   └── documents.ts       # Document routing
└── utils/
    ├── drive-client.ts    # Google Drive API wrapper
    └── git-helpers.ts     # Stage, commit, push
```
