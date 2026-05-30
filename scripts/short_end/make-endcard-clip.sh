#!/usr/bin/env bash
# Overlay an endcard (thumbnail composited into mask, over a looped bg video)
# on top of a source clip, starting at a given timestamp and lasting to the
# end of the source clip. Source clip's audio is preserved.
#
# Usage:
#   ./make-endcard-clip.sh <source.mp4> <timestamp> <thumbnail.png> [bg-substr] [out.mp4]
#   timestamp: seconds (e.g. 78) or mm:ss (e.g. 1:18)
set -e
cd "$(dirname "$0")"

SRC="${1:?usage: $0 <source.mp4> <timestamp> <thumbnail.png> [bg-substr] [out.mp4]}"
TS_RAW="${2:?need timestamp}"
THUMB="${3:?need thumbnail.png}"
BG_HINT="${4:-}"
OUT="${5:-}"

[[ ! -f "$SRC" ]] && { echo "no such file: $SRC"; exit 1; }
# Resolve thumbnail: try as given, else relative to the source clip's directory.
if [[ ! -f "$THUMB" ]]; then
  ALT="$(dirname "$SRC")/$THUMB"
  if [[ -f "$ALT" ]]; then
    THUMB="$ALT"
  else
    echo "no such file: $THUMB (also tried $ALT)"; exit 1
  fi
fi

MASK="${MASK:-mask.png}"
BG_DIR="${BG_DIR:-backgrounds}"
KEY="${KEY:-0x00EA10}"
SIM="${SIM:-0.10}"
BLEND="${BLEND:-0.08}"

# Parse mm:ss → seconds (ffmpeg accepts both, but we want a numeric for naming).
if [[ "$TS_RAW" == *:* ]]; then
  IFS=: read -r MM SS <<< "$TS_RAW"
  TS=$(echo "$MM * 60 + $SS" | bc -l)
else
  TS="$TS_RAW"
fi

SRC_BASE=$(basename "$SRC" .mp4)
SRC_DIR=$(dirname "$SRC")
OUT_DIR_DEFAULT="${SRC_DIR}/with-endcards"
mkdir -p "$OUT_DIR_DEFAULT"

# Pick bg. If no hint, prefer a bg not already used by an existing file in the
# default output dir (so parallel/repeat runs end up on distinct backgrounds).
# Uses a brief flock-guarded reservation file so concurrent invocations agree.
LOCK="${OUT_DIR_DEFAULT}/.bg-lock"
RESERVED="${OUT_DIR_DEFAULT}/.bg-used"
: > "${RESERVED}"  # ensure exists (won't truncate if exists due to noclobber? no, : > does truncate, but ok if first run)
if [[ -n "$BG_HINT" ]]; then
  VID=$(ls "$BG_DIR"/*"$BG_HINT"*.mov 2>/dev/null | head -1)
  [[ -z "$VID" ]] && { echo "no bg matching $BG_HINT"; exit 1; }
  BGNAME=$(basename "$VID" .mov)
else
  # Portable lock: spin on mkdir until acquired (works on macOS without flock).
  LOCKDIR="${LOCK}.d"
  while ! mkdir "$LOCKDIR" 2>/dev/null; do sleep 0.05; done
  trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT
  USED=$(
    { ls "$OUT_DIR_DEFAULT"/*-endcard-*.mp4 2>/dev/null | sed -E 's|.*-endcard-([^/]+)\.mp4$|\1|';
      cat "$RESERVED" 2>/dev/null; } | sort -u
  )
  POOL=$(ls "$BG_DIR"/*.mov | while read -r f; do
    n=$(basename "$f" .mov)
    grep -qxF "$n" <<<"$USED" || echo "$f"
  done)
  [[ -z "$POOL" ]] && POOL=$(ls "$BG_DIR"/*.mov)
  VID=$(echo "$POOL" | sort -R | head -1)
  BGNAME=$(basename "$VID" .mov)
  echo "$BGNAME" >> "$RESERVED"
  rmdir "$LOCKDIR"
  trap - EXIT
fi

[[ -z "$OUT" ]] && OUT="${OUT_DIR_DEFAULT}/${SRC_BASE}-endcard-${BGNAME}.mp4"

# Detect green bbox in mask (same as render.sh).
BBOX_LINE=$(ffmpeg -hide_banner -loglevel info -i "$MASK" \
    -vf "colorkey=color=${KEY}:similarity=${SIM}:blend=0,format=yuva444p,alphaextract,negate,bbox=min_val=200" \
    -f null - 2>&1 \
  | grep -m1 'Parsed_bbox.* x1:')
X=$(echo  "$BBOX_LINE" | sed -E 's/.*x1:([0-9]+).*/\1/')
Y=$(echo  "$BBOX_LINE" | sed -E 's/.*y1:([0-9]+).*/\1/')
BW=$(echo "$BBOX_LINE" | sed -E 's/.* w:([0-9]+).*/\1/')
BH=$(echo "$BBOX_LINE" | sed -E 's/.* h:([0-9]+).*/\1/')

# Normalize everything to the mask's coordinate space (the slot bbox X/Y/BW/BH
# is detected in mask pixels). Source and bg are both rescaled to W×H so source,
# background, frame, and slot all share one scale — no over/under-scaling when
# the source clip isn't already 1080×1920.
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width  -of default=nw=1:nk=1 "$MASK")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$MASK")

echo "source: $SRC_BASE (${W}x${H})"
echo "ts:     ${TS_RAW} (${TS}s)"
echo "thumb:  $(basename "$THUMB")"
echo "bg:     $BGNAME"
echo "slot:   ${BW}x${BH} @ (${X},${Y})"
echo "out:    $OUT"

# Build the endcard composite as a single layer, then overlay onto source with
# enable='gte(t,TS)'. Bg is stream-looped so it covers any duration after TS.
# The endcard's time origin is shifted by -TS via setpts so the loop starts
# fresh at the timestamp.
ffmpeg -hide_banner -loglevel fatal -stats -y \
  -i "$SRC" \
  -stream_loop -1 -i "$VID" \
  -loop 1 -i "$THUMB" \
  -loop 1 -i "$MASK" \
  -filter_complex "\
    [0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=lanczos,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1[srcv];\
    [1:v]scale=${W}:${H}:flags=lanczos,setsar=1,setpts=PTS-STARTPTS+${TS}/TB,format=rgba[bg];\
    [2:v]scale=${BW}:${BH}:force_original_aspect_ratio=increase:flags=lanczos,crop=${BW}:${BH},format=rgba[thumbRgb];\
    [3:v]format=rgba,split=3[m_orig][m_ck][m_rgb];\
    [m_orig]alphaextract[origA];\
    [m_ck]chromakey=${KEY}:${SIM}:${BLEND},format=yuva420p,alphaextract,erosion,split[ckA1][ckA2];\
    [origA][ckA1]blend=all_expr='A*B/255'[combA];\
    [m_rgb]despill=type=green:mix=0.2:expand=0,format=rgba[rgbOnly];\
    [rgbOnly][combA]alphamerge,format=rgba[fg];\
    [ckA2]negate,crop=${BW}:${BH}:${X}:${Y}[thumbA];\
    [thumbRgb][thumbA]alphamerge[thumb];\
    [bg][thumb]overlay=${X}:${Y}:format=auto[withthumb];\
    [withthumb][fg]overlay=0:0:format=auto[endcard];\
    [srcv][endcard]overlay=0:0:enable='gte(t,${TS})':format=auto[outv]" \
  -map "[outv]" -map "0:a" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset ultrafast \
  -c:a copy \
  -movflags +faststart \
  -shortest \
  "$OUT"

echo "✓ $OUT"
