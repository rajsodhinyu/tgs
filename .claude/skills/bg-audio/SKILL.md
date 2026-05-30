---
name: bg-audio
description: Render a carousel of 30-second Instagram videos from images + mp3s in scripts/bg-audio/. Use when the user wants to make playlist carousel videos, render carousel videos, or invokes /bg-audio.
---

# bg-audio

You are babysitting the interactive `pnpm bg-audio` script for the user. It pairs images with mp3s and renders 30-second 1080x1350 H.264 videos.

## Step 1 — Pick the folder

1. List subdirectories of `scripts/bg-audio/` with `ls scripts/bg-audio/`.
2. If there is exactly one, use it. Otherwise use `AskUserQuestion` to let the user pick. The question header should be "Carousel" and each option should be a folder name.
3. If `$ARGUMENTS` (the text after `/bg-audio`) contains a folder name that matches, skip the question and use that.

## Step 2 — Inspect contents

Run `ls scripts/bg-audio/<folder>/` and identify the images (`.png`, `.jpg`, `.jpeg`, `.webp`) and audio (`.mp3`, `.m4a`, `.wav`). Files are typically named like `quincy post 1.png` and `song 1.mp3` — the trailing number determines the pairing.

For each mp3, get its duration with `ffprobe`:

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "scripts/bg-audio/<folder>/<song>.mp3"
```

Run all ffprobe calls in parallel.

## Step 3 — Confirm pairings and collect timestamps

Show the user the detected pairings (image N ↔ song N by trailing number) in a single message, with each song's duration. Then ask for timestamps with a single `AskUserQuestion` if there are ≤4 songs, or by asking in plain text if there are more.

Accept timestamps in `mm:ss` or seconds. If the user gives them all at once like "0:30, 1:15, 0:45, 2:00", parse that.

If a pairing isn't 1↔1 (e.g. mismatched counts, non-sequential names), ask the user to confirm pairings first.

## Step 4 — Run the script with --auto

Use the `--auto` flag with comma-separated timestamps (assumes 1↔1 default pairings):

```bash
pnpm bg-audio "scripts/bg-audio/<folder>" --auto 29,0,24,0
```

Quote the folder path (it usually has spaces or underscores). Timestamps can be `mm:ss` or seconds (e.g. `1:23` or `83`). The script needs exactly one timestamp per image.

If the user wanted non-default pairings (rare), fall back to running the interactive prompts manually in their own terminal — Claude's piped stdin doesn't work reliably with readline.

## Re-rendering individual videos with --only

When the user wants to redo just one (or a few) videos — e.g. "redo post 5 with an 8s start" — use `--only` instead of `--auto`. It renders only the listed images and leaves the rest untouched:

```bash
pnpm bg-audio "scripts/bg-audio/<folder>" --only 6:8
pnpm bg-audio "scripts/bg-audio/<folder>" --only 6:0:08,3:1:15
```

Each spec is `index:timestamp`, comma-separated. The **index is 1-based**, matching the `[N]` image list the script prints — it is *not* the trailing number in the filename. Translate the user's reference into the right index:

- Files sort numerically, so `Instagram post - 0.png` is index `[1]`, `post - 1` is `[2]`, … `post - N` is `[N+1]`.
- So "post 5" → index `6`, "post 0" → index `1`.

Timestamps accept `mm:ss` or seconds; only the first colon splits the spec, so `6:1:15` means image 6 at `1:15`.

## Step 5 — Report results

When ffmpeg finishes, list the generated `.mp4` files in `scripts/bg-audio/<folder>/render/` and tell the user they're ready to AirDrop. For an `--only` re-render, just report the videos that were re-rendered.

## Notes

- Don't read or edit `scripts/make-bg-audio.js` unless something is broken — just drive it.
- ffmpeg and ffprobe are already allowlisted in `.claude/settings.local.json`.
- If a render fails, surface the ffmpeg error directly; don't retry silently.
