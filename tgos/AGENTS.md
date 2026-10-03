# AGENTS.md

tgos.app — That Good Sh*t's internal team app, team-only behind phone login. Mobile-first web app
(installable to the iPhone home screen). Lives in `tgos/` of the **public** tgs repo: never
commit real phone numbers, team lists, or secrets — members live in the DB, keys in Vercel. `CLAUDE.md` imports this file.

## Stack
Next.js 16 (App Router, `src/proxy.ts`), React 19, Tailwind 4 (CSS-first config in
`src/app/globals.css`), Drizzle + Neon Postgres, Vercel. Node 24, **pnpm** only.
Next 16 differs from older docs — read `node_modules/next/dist/docs/` before using an API.

## Commands
`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck`
`pnpm db:generate` (after editing `src/db/schema.ts`) · `pnpm db:migrate` (applies `drizzle/`)
`pnpm member:add "Name" "+1 555 010 0001" [admin]` (bootstrap a member without the UI)
Local env lives in `.env.local` (see `.env.example`).

## Auth
- Phone + 8-digit code texted through Linq (`src/lib/linq.ts`). Codes are derived from
  (phone, 5-min window) with HMAC (`src/lib/auth.ts`), never stored; the Linq idempotency key
  uses the same window so retries don't re-text. Linq rejects URLs in the first text of a new
  chat — keep the code text link-free.
- Session = HMAC-signed `tgos_session` cookie (30 days). `src/proxy.ts` only checks the
  signature; every page and server action must call `requireMember()` (`src/lib/members.ts`),
  which re-checks `tgos.members`, so removing a member logs them out.
- Non-members can verify but get no session: they land in `tgos.access_requests` (pending) and
  can add a name via a 30-min `tgos_pending` cookie. Admins (`tgos.members.admin`, currently
  only Raj) approve/deny/add/remove on `/team` (`requireAdmin()`; 404 + hidden card for
  everyone else); approval texts the person.
- Code sends are rate-limited per IP/phone/global non-member (`tgos.code_sends`); failed code
  guesses lock a number for 10 min after 5 tries (`tgos.login_failures`).

## Data
All tables are in the `tgos` Postgres schema of the regex.design Neon DB (`DATABASE_URL`).
Never touch other schemas from here. Schema changes: edit `src/db/schema.ts` → `pnpm db:generate`
→ commit the SQL in `drizzle/` → `pnpm db:migrate`.

## Tools
Add a route under `src/app/(app)/`, call `requireMember()` in the page, and add a card in
`src/app/(app)/page.tsx`. Playlist export reads the public TGS Sanity dataset over HTTP and calls
thatgoodsht.com's CORS-open `/api/spotify/playlist` and `/api/image-proxy` (`src/lib/tgs.ts`), so
it breaks if those public endpoints change.

## Regex Slack bridge
Members' numbers (except Raj) must be in regex.design's `STUDIO_COMMS_EXCLUDED_PHONES` so their
texts with the Linq line don't open Slack `txt-*` channels. Update it when adding members.

## Mobile
`src/app/manifest.ts` + `public/icon-*.png` + `apple-touch-icon.png`; `public/sw.js` caches only
immutable build assets/fonts/icons. Respect safe areas (`env(safe-area-inset-*)`). The code
input keeps `autocomplete="one-time-code"` for iOS autofill.
