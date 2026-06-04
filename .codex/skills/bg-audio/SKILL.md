---
name: bg-audio
description: Render 30-second Instagram carousel videos from paired images and audio in scripts/bg-audio/. Use when the user wants playlist carousel videos, background-audio videos, re-rendered carousel items, or invokes /bg-audio.
---

# BG Audio

Drive the repo's existing `pnpm bg-audio` workflow. The script pairs images with audio files and renders 1080x1350 H.264 videos. Do not edit `scripts/make-bg-audio.js` unless the script is broken.

## Pick the Folder

List subdirectories of `scripts/bg-audio/`.

If the user named a folder and it matches a subdirectory, use it. If there is exactly one candidate, use it. Otherwise ask one concise question listing the folder names.

## Inspect Contents

List files in `scripts/bg-audio/<folder>/` and identify:

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`
- Audio: `.mp3`, `.m4a`, `.wav`

Pair files by trailing number in the filename, such as `quincy post 1.png` with `song 1.mp3`. If the counts or numbering do not line up, show the detected files and ask the user to confirm the intended pairings before rendering.

For each audio file, get the duration:

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "scripts/bg-audio/<folder>/<song>.mp3"
```

Run independent `ffprobe` calls in parallel when possible.

## Collect Timestamps

Show the detected pairings and durations in one short message. Ask for one start timestamp per image, unless the user already provided them.

Accept timestamps as seconds or `mm:ss`. Parse comma-separated or space-separated lists, for example `0:30, 1:15, 45, 2:00`.

## Render All Items

Use `--auto` when rendering the default one-to-one pairings:

```bash
pnpm bg-audio "scripts/bg-audio/<folder>" --auto 29,0,24,0
```

Quote folder paths. The script needs exactly one timestamp per image.

If a command fails because dependencies, ffmpeg, or sandbox permissions are missing, surface the error and request the needed approval rather than retrying silently.

## Re-render Specific Items

Use `--only` when the user asks to redo one or more videos:

```bash
pnpm bg-audio "scripts/bg-audio/<folder>" --only 6:8
pnpm bg-audio "scripts/bg-audio/<folder>" --only 6:0:08,3:1:15
```

Each spec is `index:timestamp`. The index is 1-based and matches the numbered image list printed by the script, not necessarily the trailing number in the filename.

Translate common references:

- `Instagram post - 0.png` is index `1`
- `Instagram post - 1.png` is index `2`
- "post 5" usually means index `6` for zero-based filenames

Only the first colon splits the `--only` spec, so `6:1:15` means image index `6` at timestamp `1:15`.

## Report Results

After rendering, list generated `.mp4` files in `scripts/bg-audio/<folder>/render/`. For `--only`, report only the re-rendered videos when that is clear from the command output.
