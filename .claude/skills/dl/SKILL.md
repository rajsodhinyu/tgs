---
name: dl
description: Download new songs from one or more Spotify playlists into assets/mp3s/ via sockseek. Converts any non-mp3 files to mp3. Does NOT import to Sanity. Use when the user invokes /dl (optionally with one or more Spotify playlist URLs as arguments) or wants to grab new tracks from a playlist.
---

# dl

Download new tracks from one or more Spotify playlists using sockseek. Files land flat in the output folder — no subfolders. Already-downloaded tracks are skipped automatically.

## Parsing arguments

Parse `$ARGUMENTS`:
- Extract all Spotify URLs (any token matching `https://open.spotify.com/playlist/...`). If none found, use the default TGS playlist: `https://open.spotify.com/playlist/2rcXiZ0QkT4RhmkKxeks9Z`
- The output folder is always the absolute path `/Users/rajsodhi/Documents/tgs/assets/mp3s` unless `custom` is in the arguments (see below). Never use a relative path — files will land in the wrong place.
- If the word `custom` is present:
  1. Use the first playlist URL to fetch the playlist name via Spotify API (read `spotify-id` and `spotify-secret` from `scripts/sotd-import/sockseek.conf`):
     ```bash
     curl -s -X POST "https://accounts.spotify.com/api/token" \
       -H "Content-Type: application/x-www-form-urlencoded" \
       -d "grant_type=client_credentials&client_id=<id>&client_secret=<secret>"
     curl -s -H "Authorization: Bearer <token>" \
       "https://api.spotify.com/v1/playlists/<playlist-id>?fields=name"
     ```
  2. Slugify the name (lowercase, spaces to hyphens, strip special chars), generate a random 3-char alphanumeric hash, construct `~/Downloads/<slug>-<hash>`.
  3. Ask the user with `AskUserQuestion`:
     - Header: "Download folder"
     - Option 1: `/Users/rajsodhi/Documents/tgs/assets/mp3s` — "Default TGS download folder (Recommended)"
     - Option 2: `/Users/rajsodhi/Downloads/<slug>-<hash>` — "New folder in Downloads, named by playlist"
     - Option 3 (Other): user types a custom absolute path
  4. Whatever the user picks, always use the full absolute path — never `~`.

The resolved absolute output path is referred to as `<output-folder>` below.

## Step 1 — Check prerequisites

```bash
ls /Users/rajsodhi/Documents/tgs/scripts/sotd-import/sockseek
```

If missing, tell the user to download the macOS arm64 binary from https://github.com/fiso64/sockseek/releases, place it at `scripts/sotd-import/sockseek`, and run:
```bash
codesign --sign - /Users/rajsodhi/Documents/tgs/scripts/sotd-import/sockseek && chmod +x /Users/rajsodhi/Documents/tgs/scripts/sotd-import/sockseek
```

Check `scripts/sotd-import/sockseek.conf` exists. If not, tell the user to create it (see README).

## Step 2 — Run sockseek for each playlist

Run sockseek once per playlist URL, sequentially. Use the absolute output path for `-p`. Track all `Not found` lines across all runs:

```bash
cd /Users/rajsodhi/Documents/tgs/scripts/sotd-import && ./sockseek "<playlist-url>" -c sockseek.conf -p "<output-folder>" --name-format "{artist( - )title|filename}" 2>&1
```

Collect every track reported as `Not found` into a list.

## Step 3 — Clean up sockseek leftovers

```bash
find "<output-folder>" -name "_index.csv" -delete
find "<output-folder>" -mindepth 1 -type d -exec rm -rf {} + 2>/dev/null || true
```

## Step 4 — Retry not-found tracks by title only

For each not-found track, retry with just the title (no artist). Use an incrementing port starting at 49999:

```bash
cd /Users/rajsodhi/Documents/tgs/scripts/sotd-import && ./sockseek "<title-only>" -c sockseek.conf -p "<output-folder>" --name-format "{artist( - )title|filename}" --listen-port <port> 2>&1
```

Run sequentially — never two sockseek instances with the same port. Collect any that still fail after retry into a final not-found list.

## Step 5 — Convert non-mp3 files

```bash
find "<output-folder>" \( -name "*.m4a" -o -name "*.flac" \) -print0 | while IFS= read -r -d '' f; do
  out="${f%.*}.mp3"
  ffmpeg -i "$f" -codec:a libmp3lame -q:a 2 "$out" -y && rm "$f"
done
```

## Step 6 — Report results

```bash
find "<output-folder>" -name "*.mp3" | sort
```

Tell the user:
- How many tracks downloaded successfully
- Which tracks were not found even after title-only retry (list each one so the user can source manually)
- That they can run `/sotd-upload` to import to Sanity when ready
