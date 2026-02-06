# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThatGoodSht (TGS) is an independent music curation platform. The repo is a monorepo with two packages:

- **`next-js/`** — Next.js 15 frontend (App Router, React 18, TypeScript, Tailwind CSS)
- **`thatgoodsht/`** — Sanity v3 CMS backend (content studio)

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

Shopify Storefront API powers the shop. Cart state is managed via cookies and server-side route handlers (`shop/route.ts`, `shop/cart/add/route.ts`).

### Key Architectural Patterns

- **Persistent audio across navigation**: The root layout (`layout.tsx`) fetches the current Song of the Day from Sanity and renders a persistent `<audio>` element. Song metadata is shared via `SotDataContext` so child components can display it without re-fetching.
- **Server-first with selective client components**: Pages default to server components. Client components (`"use client"`) are used only for interactivity (p5.js visualizer, audio controls, animations).
- **Dynamic imports for heavy client libs**: p5.js and react-konva components are loaded with `next/dynamic` and `ssr: false`.
- **Catch-all dynamic routes**: Blog posts (`blog/post/[...slug]`) and feature albums (`feature/2024/[...slug]`, `feature/2025/[...slug]`) use catch-all segments.

### Sanity Schema Types (`thatgoodsht/schemaTypes/`)
- `posts.ts` — Blog posts (also used for YouTube interviews via conditional fields)
- `sotd.ts` — Song of the Day (audio file + scheduled datetime)
- `albums.ts` — Top 50 album reviews (yearly features)
- `event.ts` — Events with flyers
- `playlists.ts` — Playlist embeds
- `blockContent.ts` — Rich text config with Spotify/Apple Music embed support
- `writer.ts` — Authors

### Styling
Tailwind CSS with custom brand tokens defined in `next-js/tailwind.config.ts`:
- Colors: `tgs-pink` (#ed9df9), `tgs-purple` (#6c5cbe), `tgs-dark-purple` (#3D3564), `tgs-gray` (#DBDBDB)
- Fonts: `bitcount` (display), `roc` (body), `bitcount-filled` (titles) — loaded as local fonts from TTF files in `next-js/` root

### Path Alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Sanity CMS Code Style
Prettier is configured in the Sanity package: no semicolons, single quotes, 100 char width, no bracket spacing.
