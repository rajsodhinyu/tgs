#!/usr/bin/env bash
# Downloads new tracks from the TGS Spotify playlist via sockseek,
# converts any non-mp3s to mp3, then runs the Sanity import.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MP3_DIR="$SCRIPT_DIR/../../assets/mp3s"
PLAYLIST="https://open.spotify.com/playlist/2rcXiZ0QkT4RhmkKxeks9Z"

# 1. Download new tracks (skips anything already in assets/mp3s)
SOCKSEEK="${SOCKSEEK_BIN:-$SCRIPT_DIR/sockseek}"
"$SOCKSEEK" "$PLAYLIST" -c "$SCRIPT_DIR/sockseek.conf"

# 2. Convert any non-mp3 audio files to mp3
find "$MP3_DIR" \( -name "*.m4a" -o -name "*.flac" \) | while read -r f; do
  out="${f%.*}.mp3"
  ffmpeg -i "$f" -codec:a libmp3lame -q:a 2 "$out" -y && rm "$f"
done

# 3. Import to Sanity (sockseek downloads into a soulseek/ subdir)
node "$SCRIPT_DIR/import-mp3s.js" "$MP3_DIR/soulseek" --keep-order --no-backup
