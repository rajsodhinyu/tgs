# SOTD Bulk Import (`scripts/sotd-import/`)

Bulk-import Song of the Day MP3s into Sanity. Reads ID3 tags from MP3 files,
assigns scheduled release dates, and imports them as `sotd` documents.

## Setup

```bash
cd scripts/sotd-import
pnpm install   # deps live in scripts/ — run pnpm install there if needed
```

Requires a `.env` file in this directory with `SANITY_TOKEN` (write-scoped, used
for backup + import).

## Quick start (all-in-one)

```bash
node import-mp3s.js <mp3-directory> [options]
```

Runs the full pipeline: extract metadata → generate NDJSON → back up existing
data → import to Sanity.

**Options:**

- `--start-date <ISO>` — First release date (default in `config.js`, currently `2025-10-09`)
- `--keep-order` — Use original file order instead of shuffling
- `--random-dates` — Assign random dates instead of sequential daily releases
- `--dry-run` — Generate files but skip the actual Sanity import
- `--no-backup` — Skip backing up existing Sanity data before import
- `--no-date` — Import songs without dates (unscheduled; visible in the SOTD calendar sidebar)

**Examples:**

```bash
node import-mp3s.js ../assets/mp3s/                           # Shuffle songs, daily releases
node import-mp3s.js ./mp3s --keep-order                       # Keep file order
node import-mp3s.js ./mp3s --start-date 2025-02-01T08:00:00Z  # Custom start date
node import-mp3s.js ./mp3s --dry-run                          # Preview without importing
node import-mp3s.js ./mp3s --no-date                          # Import as unscheduled
```

## Step-by-step (manual pipeline)

Use this if you want to inspect/edit between steps:

1. **Extract metadata** — reads ID3 tags, shuffles order, assigns daily release
   dates, writes `mp3-data.json`:
   ```bash
   node extract-metadata.js <mp3-directory> [--keep-order] [--random-dates] [--start-date <ISO>] [--no-date]
   ```

2. **Generate NDJSON** — converts `mp3-data.json` into `import.ndjson` (Sanity
   import format with `sotd` document type and file asset references):
   ```bash
   node generate-ndjson.js [mp3-data.json] [import.ndjson]
   ```

3. **Import to Sanity** — run from the `thatgoodsht/` directory:
   ```bash
   cd ../../thatgoodsht
   sanity dataset import ../scripts/sotd-import/import.ndjson tgs --replace
   ```

## Unschedule songs (`unset-dates.js`)

Clears the `datetime` field on existing `sotd` docs, making them unscheduled
(drops off the release calendar, stays in the SOTD sidebar — same end state as
`--no-date`). Needs a write-scoped `SANITY_TOKEN`.

```bash
node unset-dates.js <id> [<id> ...]            # unset by doc ID
node unset-dates.js --file unset-dates.json    # replay a saved mutations payload
node unset-dates.js <ids...> --dry-run         # preview, no writes
```

`unset-dates.json` is a sample payload (Sanity mutations format) kept as an example.

## Config (`config.js`)

- `import.startDate` — default first release date
- `import.releaseTimeOfDay` — time of day for releases (default `12:00` UTC)
- `import.daysInterval` — days between releases (default `1`)
- `sanity.*` — project ID, dataset, API version (defaults to `fnvy29id` / `tgs`)
