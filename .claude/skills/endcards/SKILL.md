---
name: endcards
description: Render endcards (thumbnail composited into mask, overlaid on a random p5 background) onto a folder of vertical clips. Each clip gets its own endcard starting at a user-provided timestamp. Use when the user wants to make endcards, add outros to clips, or invokes /endcards.
---

# Endcards

You are driving `scripts/short_end/make-endcard-clip.sh` for the user. It composites a thumbnail PNG into the green rectangle in `mask.png`, overlays that on a random background video from `scripts/short_end/backgrounds/`, and lays the whole endcard over a source clip from a given timestamp to the end. Output lands in `<source-dir>/with-endcards/`.

## Step 1 — Pick the folder and parse timestamps

The user invokes the skill like:

```
/endcards <folder> [ts1 ts2 ts3 ...]
```

- `<folder>` is a subdirectory of `scripts/short_end/` (e.g. `liim`, `april`). It contains the source `.mp4` clips.
- Timestamps are in `mm:ss` or seconds (e.g. `1:18`, `25`, `25s`). Strip a trailing `s`. One per clip, in clip-order.

If `$ARGUMENTS` contains the folder name plus timestamps, use them directly. If timestamps are missing, list the clips with `ls scripts/short_end/<folder>/*.mp4` (sorted alphabetically) and ask the user via `AskUserQuestion` for one timestamp per clip — phrase the question so they can answer with a single comma- or space-separated list.

If `<folder>` is missing, list subdirectories of `scripts/short_end/` (skip `backgrounds`, `thumbnails`, `node_modules`) and ask.

## Step 2 — Resolve the thumbnail

Try in order, use the first match:

1. `scripts/short_end/thumbnails/<folder>.png`
2. `scripts/short_end/<folder>/<folder>.png`
3. Any `.png` file directly inside `scripts/short_end/<folder>/` (if exactly one).
4. Otherwise ask the user via `AskUserQuestion`, listing pngs in `thumbnails/` and inside `<folder>/`.

## Step 3 — Pair clips to timestamps and run in parallel

Sort the clips alphabetically and pair with the timestamps in order. If counts don't match, stop and ask the user to clarify the mapping.

Run all `make-endcard-clip.sh` invocations in parallel inside one Bash call so they pick distinct random backgrounds (the script uses a lock file in the output dir to avoid bg collisions). Don't pass a bg hint — let the script pick.

```bash
cd scripts/short_end && rm -rf "<folder>/with-endcards" && (
  ./make-endcard-clip.sh "<folder>/clip1.mp4" <ts1> <thumb> > /tmp/ec1.log 2>&1 &
  ./make-endcard-clip.sh "<folder>/clip2.mp4" <ts2> <thumb> > /tmp/ec2.log 2>&1 &
  ./make-endcard-clip.sh "<folder>/clip3.mp4" <ts3> <thumb> > /tmp/ec3.log 2>&1 &
  wait
) && ls "<folder>/with-endcards/"
```

Why `rm -rf <folder>/with-endcards`: the script's bg-deduplication reads existing filenames in that dir. Wiping it ensures all three runs see the same starting state and the lock file picks distinct bgs. If the user explicitly says "add another endcard, don't wipe the others," skip the `rm`.

The thumbnail path can be absolute, relative to `scripts/short_end/`, or just a filename living in the source clip's directory (the script falls back to `<source-dir>/<filename>`).

## Step 4 — Re-render a single clip

If the user dislikes one bg ("rerun harlem, that bg sucks, I removed it from backgrounds/"):

```bash
cd scripts/short_end && \
  rm -f "<folder>/with-endcards/<clip-name-without-ext>-endcard-"*.mp4 && \
  rm -f "<folder>/with-endcards/.bg-used" && \
  ls "<folder>/with-endcards/" | sed -E 's|.*-endcard-([^/]+)\.mp4$|\1|' > "<folder>/with-endcards/.bg-used" && \
  ./make-endcard-clip.sh "<folder>/<clip>.mp4" <ts> <thumb>
```

Rebuilding `.bg-used` from the surviving filenames keeps the rerun's random pick from colliding with the kept clips.

## Step 5 — Report

List the generated `.mp4` files in `<folder>/with-endcards/` with their chosen backgrounds visible in the filenames.

## Notes

- All paths are relative to the repo root unless noted. The script `cd`s to its own directory internally, so always invoke it as `./make-endcard-clip.sh` from `scripts/short_end/`.
- Clip timestamps refer to the source clip's playhead, not the endcard's. The endcard plays from `ts` to end-of-clip with the bg looping.
- Source clip audio is preserved (copy). Video is re-encoded as libx264 crf 18 ultrafast.
- ffmpeg and ffprobe are already allowlisted.
- If a render fails, surface the ffmpeg error from the `/tmp/ec*.log` files directly.
