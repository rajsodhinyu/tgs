/**
 * YouTube thumbnails, sized largest first. Not every upload gets every size —
 * YouTube 404s the ones it doesn't hold — so both the metadata and the rehost
 * route walk this list until something answers.
 *
 * Only `maxresdefault` is 16:9. The smaller fallbacks are 4:3 with the video
 * letterboxed inside, which is why the resolved size travels with the URL
 * instead of every caller assuming 1280x720.
 */
export const YOUTUBE_THUMB_QUALITIES = [
  { name: "maxresdefault", width: 1280, height: 720 },
  { name: "sddefault", width: 640, height: 480 },
  { name: "hqdefault", width: 480, height: 360 },
] as const;

export type YoutubeThumbQuality = (typeof YOUTUBE_THUMB_QUALITIES)[number];

export function youtubeThumbUrl(id: string, quality: string): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/** Same-origin URL that rehosts the thumbnail — see `api/og/youtube/[id]`. */
export function youtubeThumbCardPath(id: string): string {
  return `/api/og/youtube/${id}`;
}

export const YOUTUBE_VIDEO_ID = /^[\w-]{11}$/;

const ID_FROM_URL =
  /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;

export function youtubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(ID_FROM_URL);
  return match && match[7].length === 11 ? match[7] : null;
}

const resolved = new Map<string, YoutubeThumbQuality>();

/**
 * Largest thumbnail YouTube actually holds for `id`, or null if it holds none
 * (deleted or private video, in which case the caller should fall back to its
 * own artwork). Worth asking rather than assuming maxresdefault: 6 of the 129
 * interview videos top out at sddefault or lower.
 *
 * Only hits are memoized, so a video that was merely unreachable gets another
 * chance on the next render.
 */
export async function resolveYoutubeThumb(
  id: string,
): Promise<YoutubeThumbQuality | null> {
  const cached = resolved.get(id);
  if (cached) return cached;

  for (const quality of YOUTUBE_THUMB_QUALITIES) {
    try {
      const res = await fetch(youtubeThumbUrl(id, quality.name), {
        method: "HEAD",
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        resolved.set(id, quality);
        return quality;
      }
    } catch {
      // Timed out or the network hiccuped — try the next size down rather than
      // failing the whole page render over a card image.
    }
  }

  return null;
}
