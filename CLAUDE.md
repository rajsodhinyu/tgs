# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThatGoodSht (TGS) is an independent music curation platform. The repo is a monorepo with two packages:

- **`next-js/`** — Next.js 15 frontend (App Router, React 18, TypeScript, Tailwind CSS)
- **`thatgoodsht/`** — Sanity v3 CMS backend (content studio)
- **`scripts/`** — Song of the Day (SOTD) bulk import tooling (Node.js)

## Commands

All commands use **pnpm**. Each package has its own `pnpm-lock.yaml`; there is no root workspace config.

### Frontend (`next-js/`)
```bash
pnpm dev      # Start dev server (port 3000)
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # ESLint (next/core-web-vitals)
```

### Sanity CMS (`thatgoodsht/`)
```bash
pnpm dev      # Start Sanity Studio dev server
pnpm build    # Build studio
pnpm deploy   # Deploy studio to Sanity.io
```

## Architecture

### Data Flow
Content is authored in Sanity CMS and fetched at request time via GROQ queries using the `sanityFetch()` helper in `src/app/client.tsx`. This helper wraps `next-sanity`'s client with ISR revalidation (30s dev, 60s prod). Sanity project ID is `fnvy29id`, dataset `tgs`.

Shopify Storefront API powers the shop. The shared client lives in `src/lib/shopify.ts` (credentials via `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN` env vars in `.env.local`). Cart state is managed via cookies and server-side route handlers (`shop/route.ts`, `shop/cart/add/route.ts`). Product data (variants, prices, availability) is fetched at render time via the `getProduct(handle)` helper.

### Key Architectural Patterns

- **Persistent audio across navigation**: The root layout (`layout.tsx`) fetches the current Song of the Day from Sanity and renders a persistent `<audio>` element. Song metadata is shared via `SotDataContext` so child components can display it without re-fetching.
- **Server-first with selective client components**: Pages default to server components. Client components (`"use client"`) are used only for interactivity (p5.js visualizer, audio controls, animations, shop carousel/variant selector).
- **Dynamic imports for heavy client libs**: p5.js and react-konva components are loaded with `next/dynamic` and `ssr: false`.
- **Catch-all dynamic routes**: Blog posts (`blog/post/[...slug]`) and feature albums (`feature/2024/[...slug]`, `feature/2025/[...slug]`) use catch-all segments.
- **Shop product pages**: Server components that fetch variant data from Shopify, passing it to shared client components (`HorizontalCarousel`, `VariantSelector`) in `shop/product/components/`. Sold-out variants render greyed out and disabled. Images stay hardcoded (hosted on Sanity CDN).
- **Shop cart flow**: Cart ID stored in a cookie. Server Components cannot set cookies, so the cart page redirects to `/shop` (a Route Handler) with a `returnTo` param when a cart needs to be created or is stale. All GraphQL queries use parameterized variables (never string interpolation).

### Sanity Schema Types (`thatgoodsht/schemaTypes/`)
- `posts.ts` — Blog posts (also used for YouTube interviews via conditional fields)
- `sotd.ts` — Song of the Day (audio file + scheduled datetime)
- `albums.ts` — Top 50 album reviews (yearly features)
- `event.ts` — Events with flyers
- `playlists.ts` — Playlist embeds
- `blockContent.ts` — Rich text config with Spotify/Apple Music embed support
- `writer.ts` — Authors

### Shopify Product Handles
| Route | Shopify Handle |
|-------|---------------|
| `shop/product/tgs-hoodie` | `tgs-hoodie` |
| `shop/product/tgs-pants` | `tgs-sweatpants` |
| `shop/product/tgs-ring` | `thatgoodsh-t-ring` |
| `shop/product/quintaro` | `quintaro-dvd` + `quintaro-cd` (two separate products) |

### Styling
Tailwind CSS with custom brand tokens defined in `next-js/tailwind.config.ts`:
- Colors: `tgs-pink` (#ed9df9), `tgs-purple` (#6c5cbe), `tgs-dark-purple` (#3D3564), `tgs-gray` (#DBDBDB)
- Fonts: `bitcount` (display), `roc` (body), `bitcount-filled` (titles) — loaded as local fonts from TTF files in `next-js/` root

### Path Alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Sanity CMS Code Style
Prettier is configured in the Sanity package: no semicolons, single quotes, 100 char width, no bracket spacing.

## SOTD Bulk Import Scripts (`scripts/`)

Tooling for bulk-importing Song of the Day MP3s into Sanity. Reads ID3 tags from MP3 files, assigns scheduled release dates, and imports as `sotd` documents.

### Setup
```bash
cd scripts
pnpm install
```
Requires a `.env` file in `scripts/` with `SANITY_TOKEN` (for backup/import).

### Quick Start (all-in-one)
```bash
node import-mp3s.js <mp3-directory> [options]
```
This runs the full pipeline: extract metadata → generate NDJSON → backup existing data → import to Sanity.

**Options:**
- `--start-date <ISO>` — First release date (default: configured in `config.js`, currently `2025-10-09`)
- `--keep-order` — Use original file order instead of shuffling
- `--random-dates` — Assign random dates instead of sequential daily releases
- `--dry-run` — Generate files but skip the actual Sanity import
- `--no-backup` — Skip backing up existing Sanity data before import

**Examples:**
```bash
node import-mp3s.js ../assets/mp3s/                          # Shuffle songs, daily releases
node import-mp3s.js ./mp3s --keep-order                       # Keep file order
node import-mp3s.js ./mp3s --start-date 2025-02-01T08:00:00Z  # Custom start date
node import-mp3s.js ./mp3s --dry-run                          # Preview without importing
```

### Step-by-step (manual pipeline)
If you want to inspect/edit between steps:

1. **Extract metadata** — reads ID3 tags, shuffles order, assigns daily release dates, writes `mp3-data.json`:
   ```bash
   node extract-metadata.js <mp3-directory> [--keep-order] [--random-dates] [--start-date <ISO>]
   ```

2. **Generate NDJSON** — converts `mp3-data.json` into `import.ndjson` (Sanity import format with `sotd` document type and file asset references):
   ```bash
   node generate-ndjson.js [mp3-data.json] [import.ndjson]
   ```

3. **Import to Sanity** — run from the `thatgoodsht/` directory:
   ```bash
   cd ../thatgoodsht
   sanity dataset import ../scripts/import.ndjson tgs --replace
   ```

### Config (`config.js`)
- `import.startDate` — default first release date
- `import.releaseTimeOfDay` — time of day for releases (default `12:00` UTC)
- `import.daysInterval` — days between releases (default `1`)
- `sanity.*` — project ID, dataset, API version (defaults to `fnvy29id` / `tgs`)
