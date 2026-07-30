# N8G Drive — Drop Zone

This is where the owner drops files for the autonomous creative OS. Every file placed here gets automatically processed and published to the website.

## How it works

1. **Drop files** into the matching folder below
2. **Commit and push** to `main`
3. The **git-native watcher** detects the new commit within 60 seconds
4. Files are **processed** (images resized, audio metadata extracted, etc.)
5. Output lands in the right content directories, source files are **cleaned up**
6. A new commit is pushed, triggering the **site rebuild**

## Folder map

| Folder            | What to drop here              | Output goes to                  |
|-------------------|--------------------------------|---------------------------------|
| `Albums/`         | Mastered tracks (any format)   | `content/music/releases/`       |
| `Artwork/`        | Album art, posters, visuals    | `public/images/gallery/`        |
| `Photography/`    | Photoshoot images              | `public/images/photography/`    |
| `Videos/`         | Performance videos             | `public/videos/`                |
| `Lyrics/`         | Lyric files (.txt, .md)        | `content/music/lyrics/`         |
| `Documents/`      | Creative notes, press releases | `content/journal/`              |
| `Brand Bible/`    | Brand document updates         | `brand/`                        |
| `Character Bible/`| Character updates              | `brand/characters/`             |
| `Stage Bible/`    | Stage design documents         | `brand/stage/`                  |
| `Press Kit/`      | Press materials                | `content/press/`                |

## Processing rules

### Images
- Resized to 200px (thumb), 800px (medium), 1600px (full)
- Converted to WebP
- EXIF metadata stripped

### Audio
- Metadata extracted via ffprobe (falls back to filename)
- Markdown generated per track with frontmatter
- `releases.json` updated for album folders

### Documents
- Markdown: copied as-is
- PDFs: stored in output directory
- DOCX: stored as-is (markdown conversion planned)

### Videos
- Copied as-is to `public/videos/`

## Watch the watcher

```bash
# Check logs
tail -f .run/git-watcher.log

# Start the watcher daemon
./scripts/start-git-watcher.sh

# Stop the watcher
kill $(cat .run/git-watcher.pid)

# Run a one-time sync
bun run sync
```
