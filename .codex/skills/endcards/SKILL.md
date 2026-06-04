---
name: endcards
description: Render endcards onto vertical clips with scripts/endcards/make-endcard-clip.sh. Use when the user wants outros, endcards, thumbnail-over-background endings, re-rendered endcard clips, or invokes /endcards.
---

# Endcards

Drive `scripts/endcards/make-endcard-clip.sh`. The script composites a thumbnail PNG into the green rectangle in `mask.png`, overlays that on a random p5 background from `scripts/endcards/backgrounds/`, then lays the endcard over a source clip from a user-provided timestamp to the end. Output lands in `<source-dir>/with-endcards/`.

## Pick the Folder and Timestamps

Infer the folder from the user's request when possible. The folder should be a subdirectory of `scripts/endcards/` containing source `.mp4` clips.

If the folder is missing, list subdirectories of `scripts/endcards/`, skipping `backgrounds`, `thumbnails`, and `node_modules`, then ask one concise question.

Timestamps may be seconds, `mm:ss`, or values with a trailing `s`; strip the trailing `s`. Use one timestamp per clip in sorted clip order. If timestamps are missing, list sorted clips and ask for a comma-separated or space-separated timestamp list.

## Resolve the Thumbnail

Try these in order and use the first match:

1. `scripts/endcards/thumbnails/<folder>.png`
2. `scripts/endcards/<folder>/<folder>.png`
3. The only `.png` directly inside `scripts/endcards/<folder>/`, if exactly one exists

If none are available or there are multiple ambiguous PNGs, ask the user which thumbnail to use. Include likely options from `scripts/endcards/thumbnails/` and the source folder.

## Render a Batch

Sort clips alphabetically and pair them with timestamps in that order. If counts do not match, stop and ask for clarification.

Run all `make-endcard-clip.sh` invocations in parallel from `scripts/endcards/` so the script's lock file can choose distinct random backgrounds:

```bash
cd scripts/endcards && rm -rf "<folder>/with-endcards" && (
  ./make-endcard-clip.sh "<folder>/clip1.mp4" <ts1> <thumb> > /tmp/ec1.log 2>&1 &
  ./make-endcard-clip.sh "<folder>/clip2.mp4" <ts2> <thumb> > /tmp/ec2.log 2>&1 &
  ./make-endcard-clip.sh "<folder>/clip3.mp4" <ts3> <thumb> > /tmp/ec3.log 2>&1 &
  wait
) && ls "<folder>/with-endcards/"
```

The `rm -rf "<folder>/with-endcards"` reset is part of the normal fresh batch workflow because the script uses existing output filenames for background deduplication. If the user asks to preserve existing outputs, skip the reset. If sandbox policy requires approval for deletion or ffmpeg writes, request it before running the render command.

The thumbnail path may be absolute, relative to `scripts/endcards/`, or just a filename inside the source clip folder.

## Re-render One Clip

When redoing a single clip, remove only the old output for that clip and rebuild `.bg-used` from the remaining outputs so the new random pick does not collide:

```bash
cd scripts/endcards && \
  rm -f "<folder>/with-endcards/<clip-name-without-ext>-endcard-"*.mp4 && \
  rm -f "<folder>/with-endcards/.bg-used" && \
  ls "<folder>/with-endcards/" | sed -E 's|.*-endcard-([^/]+)\.mp4$|\1|' > "<folder>/with-endcards/.bg-used" && \
  ./make-endcard-clip.sh "<folder>/<clip>.mp4" <ts> <thumb>
```

Ask before deleting outputs if the user did not clearly request a re-render.

## Report Results

List generated `.mp4` files in `<folder>/with-endcards/`. The chosen background is visible in each output filename.

If a render fails, read the relevant `/tmp/ec*.log` file and surface the ffmpeg or script error directly.
