---
name: sotd-upload
description: Import MP3s from assets/mp3s into Sanity as SOTD documents. Run after /dl. Use when the user invokes /sotd-upload or wants to push downloaded songs to Sanity.
---

# sotd-upload

Import downloaded MP3s into Sanity as Song of the Day (`sotd`) documents. Run this after `/dl`.

## Step 1 — Check there are files to import

```bash
find /Users/rajsodhi/Documents/tgs/assets/mp3s -maxdepth 1 -name "*.mp3" | sort
```

If empty, tell the user to run `/dl` first.

## Step 2 — Check for a .env with SANITY_TOKEN

```bash
cat /Users/rajsodhi/Documents/tgs/scripts/sotd-import/.env 2>/dev/null || echo "missing"
```

If missing or `SANITY_TOKEN` is not set, tell the user to add it and stop.

## Step 3 — Run the import

```bash
cd /Users/rajsodhi/Documents/tgs/scripts/sotd-import && node import-mp3s.js /Users/rajsodhi/Documents/tgs/assets/mp3s --no-date --no-backup 2>&1
```

Watch for errors. Common issues:
- `spawn sanity ENOENT` — fixed in current code (uses `npx sanity`); if it recurs, check `thatgoodsht/node_modules` exists (`pnpm install` in `thatgoodsht/`)
- `does not exist or is not readable` — ndjson path issue; check import-mp3s.js line ~141

## Step 4 — Report

Tell the user how many documents were imported. Remind them to check Sanity Studio to verify.
