---
name: n8g-site-workflow
description: How to build, publish, and work on the N8G Next.js site. Covers the node_modules symlink workaround, build commands, and project structure conventions.
---

# N8G Site Workflow

## Critical: node_modules symlink

The `/home` filesystem is only 300MB — too small for Next.js deps. `node_modules` MUST be symlinked to `/tmp/n8g-node-modules` on the root filesystem (3.1GB).

```bash
# Always ensure the symlink exists before working
if [ ! -L node_modules ] || [ "$(readlink node_modules)" != "/tmp/n8g-node-modules" ]; then
  rm -rf node_modules
  mkdir -p /tmp/n8g-node-modules
  ln -sf /tmp/n8g-node-modules node_modules
fi
bun install
```

## Build & Publish

All package.json scripts include `NODE_PATH=/tmp/n8g-node-modules` prefix (Node.js needs this to resolve symlinked modules). Use:

```bash
cd /home/team/shared/site
bun run build       # builds only (dev/test)
bun run publish     # builds + deploys to port 3000 (runs publish.sh)
```

`publish.sh` handles symlink creation, install, build, port takeover, and server launch.

## Project structure

```
src/app/          — App Router pages (one folder per route)
src/components/   — layout/, ui/, three/, content/, seo/
src/lib/          — content.ts, constants.ts, utils.ts
src/hooks/        — useScrollProgress, useMediaQuery, useReducedMotion
src/styles/       — globals.css (single consolidated Tailwind file)
content/          — manifesto.md, brand/, music/, gallery/, journal/, press/
scripts/          — watch-content.ts, sync-brand.ts
```

## Theme

Dark theme enforced via `darkMode: "class"` with `class="dark"` permanent on `<html>`.
- Copper: #B87333 (Tailwind: copper-400, copper-500)
- Background: #0A0A0A (Tailwind: bg-background)
- Surface: #111111 (Tailwind: bg-surface)
- Text primary: #F5F0EB
- Text secondary: #A89F91

## Known issues

- Webpack cache warnings about `styled-jsx` and `graceful-fs` are benign — the symlink causes them but builds succeed
- TypeScript strict mode is ON — all component props need explicit types
- Do NOT import from `tailwindcss/types/config` (ClassValue doesn't exist in v3)
