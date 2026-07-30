# N8G

> *An anonymous South African audiovisual music collective. Music is not entertainment — it is an environment.*

**N8G** is a three-member anonymous collective based in Johannesburg, South Africa. We create immersive audiovisual worlds: every release is a space you enter, not a track you consume. The anonymity is the mechanism — when you cannot tell who is who, you stop listening to personalities and start listening to the work.

🌐 **[n8g-music.com](https://n8g-music.com)** · [Live Preview](https://ca7fc167e3a960637daed9f517665596.ctonew.app)

---

## This Repository

This repository contains the complete N8G autonomous creative operating system:

| Directory | Contents |
|-----------|----------|
| [`brand/`](brand/) | **The Brand Bible** — definitive source of truth: mission, manifesto, design language, symbol system, and character identities |
| [`site/`](site/) | **The Website** — Next.js + TypeScript + TailwindCSS + Three.js, serving as the public face of the collective |
| [`skills/`](skills/) | **Reusable agent skills** — team-shared workflows for working with the N8G codebase |

The Brand Bible includes:
- **[`brand/README.md`](brand/README.md)** — Mission, vision, core philosophy, design language, color system, typography, imagery rules
- **[`brand/symbols.md`](brand/symbols.md)** — The symbol system: glyphs, their meanings, usage rules, and visual grammar
- **[`brand/characters.md`](brand/characters.md)** — The three anonymous members: masks, roles, sonic signatures, stage presence

---

## The Autonomous Creative OS

N8G is built as an autonomous creative operating system — a network of independent AI agents that maintain brand consistency, generate visual and narrative assets, manage music catalogues, and publish everything automatically to the website.

At the centre sits the **Creative Director agent**, which maintains the Brand Bible and reviews every output against the collective's artistic vision. No asset reaches the public without passing through.

The full system comprises nine specialized agents working in concert — the website is not just a brochure; it is a living, self-updating surface that reflects the collective's creative output in real time.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js](https://nextjs.org/) 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS — dark theme, copper accents (`#B87333`) |
| **3D** | Three.js via React Three Fiber |
| **Animation** | Framer Motion |
| **Package Manager** | Bun |
| **Deployment** | Vercel + custom server |

---

## Getting Started

```bash
cd site/
bun install
bun run dev     # development server
bun run publish # production build + deploy preview
bun run go-live # deploy to custom domain (requires Vercel token)
```

---

## License

All rights reserved. N8G is an original artistic work.
