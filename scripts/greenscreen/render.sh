#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

PAD="${PAD:-4}"           # overscan to hide chroma bleed
KEY="${KEY:-0x00EA10}"    # Figma green
SIM="${SIM:-0.10}"        # chromakey similarity (YUV; 0.05-0.20 typical)
BLEND="${BLEND:-0.08}"    # chromakey edge blend
FORCE="${FORCE:-0}"       # FORCE=1 to re-render even if up-to-date

render_one() {
  local N="$1"
  local IMG="${N}.png"
  local OUT="${N}_output.mp4"
  local VID=""

  # Find matching video: prefer .mov, fall back to .mp4 (but never the output)
  for ext in mov mp4; do
    local cand="${N}.${ext}"
    [[ "$cand" == "$OUT" ]] && continue
    [[ -f "$cand" ]] && { VID="$cand"; break; }
  done

  if [[ -z "$VID" ]]; then
    echo "skip ${N}: no video (looked for ${N}.mov / ${N}.mp4)"
    return
  fi

  # Idempotency: skip if output is newer than both inputs
  if [[ "$FORCE" != "1" && -f "$OUT" && "$OUT" -nt "$IMG" && "$OUT" -nt "$VID" ]]; then
    echo "skip ${N}: ${OUT} up-to-date"
    return
  fi

  echo "render ${N}: ${IMG} + ${VID} -> ${OUT}"

  read W H X Y BW BH < <(
    ffmpeg -hide_banner -loglevel error -i "$IMG" -f rawvideo -pix_fmt rgb24 - 2>/dev/null \
    | IMG="$IMG" PAD="$PAD" python3 -c '
import sys, os, subprocess
img = os.environ["IMG"]
pad = int(os.environ["PAD"])
out = subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0",
    "-show_entries","stream=width,height","-of","csv=p=0:s=x", img]).decode().strip()
W, H = map(int, out.split("x"))
data = sys.stdin.buffer.read()
xs_min=W; xs_max=-1; ys_min=H; ys_max=-1
for y in range(H):
    base = y*W*3
    for x in range(W):
        r=data[base+x*3]; g=data[base+x*3+1]; b=data[base+x*3+2]
        if abs(r-0)<15 and abs(g-234)<20 and abs(b-16)<20:
            if x<xs_min: xs_min=x
            if x>xs_max: xs_max=x
            if y<ys_min: ys_min=y
            if y>ys_max: ys_max=y
assert xs_max >= 0, "no green region found in " + img
x = max(0, xs_min - pad)
y = max(0, ys_min - pad)
bw = min(W - x, xs_max - xs_min + 1 + 2*pad)
bh = min(H - y, ys_max - ys_min + 1 + 2*pad)
bw -= bw % 2; bh -= bh % 2
print(W, H, x, y, bw, bh)
'
  )

  echo "  ${W}x${H}, bbox ${BW}x${BH} @ (${X},${Y})"

  ffmpeg -hide_banner -loglevel error -stats \
    -loop 1 -i "$IMG" -i "$VID" \
    -filter_complex "\
      color=black:s=${W}x${H}[bg];\
      [1:v]scale=${BW}:${BH}:force_original_aspect_ratio=increase,crop=${BW}:${BH}[v];\
      [bg][v]overlay=${X}:${Y}:shortest=1[vbg];\
      [0:v]chromakey=${KEY}:${SIM}:${BLEND},despill=type=green:mix=0.2:expand=0,format=yuva420p,split[fga][fgb];\
      [fga]alphaextract,erosion[mask];\
      [fgb][mask]alphamerge[fg];\
      [vbg][fg]overlay=0:0:shortest=1[out]" \
    -map "[out]" -map "1:a?" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset ultrafast \
    -c:a aac -b:a 192k -movflags +faststart "$OUT" -y
}

# Determine which slides to process: explicit args, or auto-discover from *.png
if [[ $# -gt 0 ]]; then
  TARGETS=("$@")
else
  TARGETS=()
  for f in *.png; do
    [[ -f "$f" ]] || continue
    TARGETS+=("${f%.png}")
  done
fi

for n in "${TARGETS[@]}"; do
  render_one "$n"
done
