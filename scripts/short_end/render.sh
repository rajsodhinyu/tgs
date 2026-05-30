#!/usr/bin/env bash
# One-shot: thumbnail.png → composited into mask.png's green slot → overlaid on a
# random background video from backgrounds/ → mp4.
#
# Usage:
#   ./render.sh <thumbnail.png> [output.mp4]
#   BG=Spiral ./render.sh thumbnail.png   # pick a specific bg by substring
set -e
cd "$(dirname "$0")"

THUMB="${1:?usage: $0 <thumbnail.png> [output.mp4]}"
[[ ! -f "$THUMB" ]] && { echo "no such file: $THUMB"; exit 1; }

MASK="${MASK:-mask.png}"
BG_DIR="${BG_DIR:-backgrounds}"
KEY="${KEY:-0x00EA10}"     # green of mask's chroma rect
SIM="${SIM:-0.10}"
BLEND="${BLEND:-0.08}"

THUMB_BASE=$(basename "$THUMB")
THUMB_NAME="${THUMB_BASE%.*}"

# Pick bg.
if [[ -n "$BG" ]]; then
  VID=$(ls "$BG_DIR"/*"$BG"*.mov 2>/dev/null | head -1)
  [[ -z "$VID" ]] && { echo "no bg matching $BG"; exit 1; }
else
  VID=$(ls "$BG_DIR"/*.mov | sort -R | head -1)
fi
BGNAME=$(basename "$VID" .mov)
OUT="${2:-${THUMB_NAME}-over-${BGNAME}.mp4}"

# Detect green bbox in mask.
BBOX_LINE=$(ffmpeg -hide_banner -loglevel info -i "$MASK" \
    -vf "colorkey=color=${KEY}:similarity=${SIM}:blend=0,format=yuva444p,alphaextract,negate,bbox=min_val=200" \
    -f null - 2>&1 \
  | grep -m1 'Parsed_bbox.* x1:')
X=$(echo  "$BBOX_LINE" | sed -E 's/.*x1:([0-9]+).*/\1/')
Y=$(echo  "$BBOX_LINE" | sed -E 's/.*y1:([0-9]+).*/\1/')
BW=$(echo "$BBOX_LINE" | sed -E 's/.* w:([0-9]+).*/\1/')
BH=$(echo "$BBOX_LINE" | sed -E 's/.* h:([0-9]+).*/\1/')

# Output at mask's native res (1080x1920); scale bg up with lanczos.
W=1080; H=1920

echo "thumb: $THUMB_BASE"
echo "bg:    $BGNAME"
echo "slot:  ${BW}x${BH} @ (${X},${Y})"
echo "out:   $OUT"

# Single ffmpeg pass:
#   [0] bg video    → scale to WxH
#   [1] thumbnail   → scale + crop to bbox
#   [2] mask        → preserve original alpha AND chromakey green; despill green spill
#   composite: bg ⊕ thumbnail @ (X,Y) ⊕ mask
ffmpeg -hide_banner -loglevel fatal -stats -y \
  -i "$VID" -loop 1 -i "$THUMB" -loop 1 -i "$MASK" \
  -filter_complex "\
    [0:v]scale=${W}:${H}:flags=lanczos,setsar=1,format=rgba[bg];\
    [1:v]scale=${BW}:${BH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${BW}:${BH},format=rgba[thumbRgb];\
    [2:v]format=rgba,split=3[m_orig][m_ck][m_rgb];\
    [m_orig]alphaextract[origA];\
    [m_ck]chromakey=${KEY}:${SIM}:${BLEND},format=yuva420p,alphaextract,erosion,split[ckA1][ckA2];\
    [origA][ckA1]blend=all_expr='A*B/255'[combA];\
    [m_rgb]despill=type=green:mix=0.2:expand=0,format=rgba[rgbOnly];\
    [rgbOnly][combA]alphamerge,format=rgba[fg];\
    [ckA2]negate,crop=${BW}:${BH}:${X}:${Y}[thumbA];\
    [thumbRgb][thumbA]alphamerge[thumb];\
    [bg][thumb]overlay=${X}:${Y}:shortest=1:format=auto[withthumb];\
    [withthumb][fg]overlay=0:0:shortest=1:format=auto[out]" \
  -map "[out]" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset ultrafast \
  -movflags +faststart "$OUT"

echo "✓ $OUT"
