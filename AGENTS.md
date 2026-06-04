# AGENTS.md

Guidance for any AI coding agent (Claude Code, Codex, etc.) working in this repo.
This file is the **single canonical guide** — `CLAUDE.md` just imports it. It's an
**index + gotchas**, not a manual: it points you to the file to read when a task
actually needs it.

## Project Overview

ThatGoodSht (TGS) is an independent music curation platform. Monorepo, three packages
(no root workspace — each has its own `pnpm-lock.yaml`):

- **`next-js/`** — Next.js 15 frontend (App Router, React 18, TypeScript, Tailwind)
- **`thatgoodsht/`** — Sanity v3 CMS (content studio)
- **`scripts/`** — Standalone media/video tooling + SOTD bulk import (Node / bash + ffmpeg). See [scripts/ tooling](#scripts-tooling).

## Commands

All **pnpm**. Run inside the relevant package.

- **`next-js/`**: `pnpm dev` (port 3000) · `pnpm build` · `pnpm start` · `pnpm lint`
- **`thatgoodsht/`**: `pnpm dev` (Studio) · `pnpm build` · `pnpm deploy` (to Sanity.io)

## Architecture

### Data flow
- **Sanity** content is fetched at request time via GROQ through the `sanityFetch()` helper in `src/app/client.tsx` (wraps `next-sanity` with ISR revalidation — 30s dev, 60s prod). Project `fnvy29id`, dataset `tgs`.
- **Shopify** Storefront API powers the shop. Shared client: `src/lib/shopify.ts` (creds via `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` / `NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN` in `.env.local`). Product data via the `getProduct(handle)` helper.

### Gotchas / non-obvious patterns
- **Persistent audio**: root `layout.tsx` fetches the current SOTD and renders one persistent `<audio>`; metadata is shared via `SotDataContext` so children don't re-fetch.
- **Server-first**: pages are server components by default; `"use client"` only for interactivity (p5 visualizer, audio controls, animations, shop carousel/variant selector). Heavy libs (p5.js, react-konva) load via `next/dynamic` with `ssr: false`.
- **Shop cart flow**: cart ID lives in a cookie. Server Components *can't* set cookies, so the cart page redirects to `/shop` (a Route Handler) with a `returnTo` param when a cart must be created or is stale. All GraphQL uses **parameterized variables — never string interpolation**.
- **Shop product pages**: server components fetch variants from Shopify, pass them to shared client components (`HorizontalCarousel`, `VariantSelector`) in `shop/product/components/`. Sold-out variants render greyed/disabled. Images are hardcoded (Sanity CDN). Route→handle map below.
- **Catch-all routes**: blog posts (`blog/[...slug]`) and feature albums (`feature/2024|2025/[...slug]`).

### Blog byline + reader background switch (`blog/[...slug]`)
Each post can carry a custom `bgColor` (Sanity, `@sanity/color-input`). On the post page:
- **`BlogBg.tsx`** — `PersistentBlogBackdrop` (the `#blog-bg` full-bleed div) lives in
  `blog/[...slug]/layout.tsx` so it **survives navigation between posts** — that's what
  lets its `background-color` cross-fade from one article to the next (a fresh element per
  page would hard-cut). The live color is pushed in by `BlogBgSync` (a render-nothing
  client cmp in `page.tsx`) via a layout-effect store; the layout resolves the first-paint
  color server-side so a hard load doesn't flash. `BlogBgSwitch` is the reader control in
  the byline — "dots" shows two circles (post color + default), tap to pick; persisted in
  localStorage (`tgs-blog-bg-mode`), mirrors `PlatformSwitcher`'s external-store pattern.
- The default (non-custom) background and switch shape are constants in **`bgStyle.ts`**.
  Byline alignment values (switch stroke `1.5px`, Spotify switcher `-7px` margin, byline
  text `translateY(2.5px)`) are hardcoded inline in the components.

**Blog byline tuner (removed).** Those alignment/sizing numbers were originally dialed in
with a dev-only live "tuner" — a draggable, ⌥B-toggled panel (`BgColorTuner.tsx`) that
hot-swapped a `<style id="blog-bg-styles">` (`BgStyles.tsx` + `generateBgCss()` emitting
`--blog-*` CSS vars) for instant preview and saved to `bgStyle.json` via a dev-only
`POST /api/bg-style` (403 in prod). Each component read `var(--blog-…, fallback)`. It's all
been ripped out and the values inlined. **To rebuild:** re-add a CSS-var layer + a stylesheet
injector + a dev-only fetch-to-disk endpoint, and a hidden panel that hot-swaps the
stylesheet and POSTs the JSON. Knobs it had: bg color, switch shape (pill/dots), switch
width + stroke, switch/Spotify bottom padding, Spotify bottom margin (±), byline text
translateY (±) + line-height, and a debug-border toggle outlining the three byline pieces.

### Sanity schema types (`thatgoodsht/schemaTypes/`)
`posts.ts` (blog; also YouTube interviews via conditional fields) · `sotd.ts` (Song of the Day: audio + datetime) · `albums.ts` (Top 50 yearly features) · `event.ts` · `playlists.ts` · `blockContent.ts` (rich text + Spotify/Apple embeds) · `writer.ts`

### Shopify product handles
| Route | Handle |
|-------|--------|
| `shop/product/tgs-hoodie` | `tgs-hoodie` |
| `shop/product/tgs-pants` | `tgs-sweatpants` |
| `shop/product/tgs-ring` | `thatgoodsh-t-ring` |
| `shop/product/quintaro` | `quintaro-dvd` + `quintaro-cd` (two separate products) |

### p5.js backgrounds (`next-js/src/app/ui/`)
Homepage backgrounds are p5 sketches loaded via `next/dynamic` (`ssr: false`), each wrapping the shared `P5Background.tsx` (handles p5 lifecycle; takes a `sketch: (s: p5) => void` prop). The active one rotates — check the import in `page.tsx`. To swap, change that line:
```tsx
const DynamicComponentWithNoSSR = dynamic(() => import("./ui/FireworksBackground"), { ssr: false });
```
Sketch files in that dir: `Backround.tsx` (grid), `FireworksBackground`, `CheckerboardBackground`, `SpiralBackground`, `GlitchBackground` (halftone pixel-sort), `HalftoneBackground`, … — each exports a default component + named sketch fn. Read the file for the specifics.

### Shared components (`next-js/src/app/components/`)
- `ChevronDots` — pixel-art dotted chevron SVG (matches bitcount-filled font). Props: `color`, `direction` (`left`/`right`), `className`. Nav arrows site-wide.
- `PlatformSwitcher` — Spotify/Apple Music toggle pill; also exports `usePlatform()`. Used on `/playlists` and `/blog`.

### Styling & conventions
- Brand tokens in `next-js/tailwind.config.ts`: `tgs-pink` #ed9df9, `tgs-purple` #6c5cbe, `tgs-dark-purple` #3D3564, `tgs-gray` #DBDBDB. Font utility classes: `font-bit` (bitcount display), `font-roc` / `font-roc-variable` (body), `font-title` (bitcount-filled titles) — backed by CSS vars over local TTFs in `next-js/` root.
- Path alias: `@/*` → `./src/*` (`tsconfig.json`).
- Sanity package Prettier: no semicolons, single quotes, 100 char width, no bracket spacing.

## scripts/ tooling

Standalone tools in `scripts/`. They're independent — chaining them (e.g. greenscreen a clip, then put a song behind it) means running the tool, then a separate `ffmpeg` step. **Read the linked skill/header/README before driving any of them**; this table is only a router.

| Plain-English ask | Tool | Read first |
|---|---|---|
| Greenscreen a video into a picture | `scripts/greenscreen/render.sh` | render.sh header — pairs `N.png` (Figma frame w/ green rect) + `N.mov\|.mp4` → `N_output.mp4`; **audio comes from the source video**, so "add a song behind it" is a separate ffmpeg mux |
| Carousel of 30s IG videos from images + mp3s | `/bg-audio` → `scripts/make-bg-audio.js` | your agent's `skills/bg-audio/SKILL.md` (`.claude/` or `.codex/`) |
| Add endcards/outros to vertical clips | `/endcards` → `scripts/endcards/make-endcard-clip.sh` | your agent's `skills/endcards/SKILL.md` (`.claude/` or `.codex/`) |
| Screen-record the homepage SOTD background | `pnpm capture` → `scripts/homepage-capture/capture-homepage.js` | file header |
| Bulk-import / unschedule SOTD songs | `scripts/sotd-import/*` | `scripts/sotd-import/README.md` |
| (retired) YouTube interview import | `scripts/retired/import-youtube.js` | parked — not in active use |
