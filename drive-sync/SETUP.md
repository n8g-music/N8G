# N8G Drive Sync — Setup Guide (Git-Native)

How the owner drops files into the repo and the autonomous creative OS processes them automatically.

## Overview

The Drive Sync pipeline watches the `drive/` folder in the N8G repo for new files and automatically:

- Detects new commits touching `drive/`
- Processes images (resize, convert to WebP, strip metadata)
- Reads audio metadata and generates markdown + JSON
- Copies documents to content directories
- Cleans up processed source files from `drive/`
- Commits everything and pushes to GitHub (which triggers the site rebuild)

**No Google Cloud setup required.** The owner just drops files into `drive/`, commits, and pushes.

## How the owner uses it

### Dropping files

1. Place files into the matching `drive/` subfolder (see table below)
2. Commit and push to `main`:
   ```bash
   git add drive/
   git commit -m "Add new artwork and tracks"
   git push origin main
   ```
3. Within 60 seconds, the git-native watcher detects the commit, pulls, processes everything, and publishes the results

That's it. No Google Drive, no service accounts, no API keys.

### Folder map

| drive/ Folder      | What to drop here              | Output goes to                  |
|--------------------|--------------------------------|---------------------------------|
| `Albums/`          | Mastered tracks (any format)   | `content/music/releases/`       |
| `Artwork/`         | Album art, posters, visuals    | `public/images/gallery/`        |
| `Photography/`     | Photoshoot images              | `public/images/photography/`    |
| `Videos/`          | Performance videos             | `public/videos/`                |
| `Lyrics/`          | Lyric files (.txt, .md)        | `content/music/lyrics/`         |
| `Documents/`       | Creative notes, press releases | `content/journal/`              |
| `Brand Bible/`     | Brand document updates         | `brand/`                        |
| `Character Bible/` | Character updates              | `brand/characters/`             |
| `Stage Bible/`     | Stage design documents         | `brand/stage/`                  |
| `Press Kit/`       | Press materials                | `content/press/`                |

## Testing — Dry Run

Test the pipeline without making any changes:

```bash
cd /home/team/shared
bun run sync:dry
```

This scans `drive/`, shows what *would* happen, but doesn't modify anything.

### Test the Image Processor (no files needed)

```bash
cd /home/team/shared

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

### End-to-end test

```bash
# Create a test file in drive/Artwork/
bun -e "
import sharp from 'sharp';
await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#1a1a2e' } })
  .jpeg()
  .toFile('./drive/Artwork/test-image.jpg');
"

# Run the sync
bun run sync

# Check that the image was processed and cleaned up
ls public/images/gallery/
ls drive/Artwork/   # Should be empty
```

## Running the Sync

### One-time sync

```bash
cd /home/team/shared
bun run sync
```

This scans `drive/`, processes all files, and commits.

### Continuous watcher (background daemon)

```bash
cd /home/team/shared
./scripts/start-git-watcher.sh
```

This starts the watcher process that polls every 60 seconds. It survives terminal logout.

### Stop the watcher

```bash
kill $(cat /home/team/shared/.run/git-watcher.pid)
```

### Check the logs

```bash
tail -f /home/team/shared/.run/git-watcher.log
```

## How It Works

```
Owner drops files into drive/
       │
       ▼
Owner commits & pushes to main
       │
       ▼
[watcher.ts] polls origin/main every 60s
       │
       ▼
git fetch → git diff HEAD..origin/main --name-only -- drive/
       │
       ▼
If changes: git pull → [sync-main.ts] scans drive/
       │
       ▼
[processors/] routes by file type:
  ├── images.ts    → sharp resize, WebP, strip EXIF
  ├── audio.ts     → ffprobe metadata, markdown gen
  └── documents.ts → copy to content dirs
       │
       ▼
Source files deleted from drive/ (processed)
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
- PDFs: stored in output directory
- DOCX: stored as-is (markdown conversion planned)

### Brand Bible (Bidirectional)
The Brand Bible folder syncs with caution. If a file exists both locally and in `drive/Brand Bible/` and they differ, the local copy is preserved and the incoming version is backed up to `{filename}.drive-backup` for manual review.

## Directory Structure

```
drive-sync/
├── config.ts              # Folder mappings, polling interval
├── sync-main.ts           # Main orchestrator (scans drive/)
├── watcher.ts             # Git-native polling daemon
├── SETUP.md               # This file
├── processors/
│   ├── images.ts          # Image resize + WebP
│   ├── audio.ts           # Audio metadata + markdown
│   └── documents.ts       # Document routing
└── utils/
    └── git-helpers.ts     # Stage, commit, push
```

## Troubleshooting

**"drive/ folder not found"**
→ The `drive/` directory structure hasn't been created yet. It should exist at the repo root with all subfolders. The watcher creates it if needed, but you can also run `mkdir -p drive/{Albums,Artwork,Photography,Videos,Lyrics,Documents,"Brand Bible","Character Bible","Stage Bible","Press Kit"}`.

**Git push fails**
→ Run `get_git_credentials` to refresh the GitHub token, then retry.

**Images not processing**
→ Make sure `sharp` is installed: `cd /home/team/shared && bun install`

**Watcher not detecting changes**
→ Check logs: `tail -f .run/git-watcher.log`. Ensure the watcher is running: `cat .run/git-watcher.pid`. Ensure the commits are on `main` and the watcher can fetch.
