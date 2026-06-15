import { NextRequest, NextResponse } from "next/server";

/**
 * Lists every public, non-Short upload on the TGS YouTube channel so the
 * Studio's "New YouTube Interview" picker can show videos that don't yet have a
 * blog post. Holds YOUTUBE_API_KEY server-side (same pattern as the Spotify
 * routes) and is called cross-origin from the Sanity Studio, so it sends CORS
 * headers.
 *
 * Shorts filtering: the Data API has no "isShort" flag, and duration alone
 * doesn't separate them (some real interviews are shorter than some clips). So
 * we ask YouTube directly — GET youtube.com/shorts/<id> returns 200 for a Short
 * and 3xx-redirects to /watch for everything else. Shorts max out at 3 min, so
 * we only probe the <=180s candidates and trust length for the rest.
 *
 * Quota: channels.list (1) + playlistItems.list (1 per 50) + videos.list
 * (1 per 50, for durations). Cached in-process for a few minutes.
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";
const DEFAULT_HANDLE = "thatgoodshtmusic";
const CACHE_TTL_MS = 5 * 60 * 1000;
const SHORT_MAX_SECONDS = 180; // a video longer than this can't be a Short
const PROBE_CONCURRENCY = 12;
const PROBE_TIMEOUT_MS = 8000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Video {
  videoId: string;
  url: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

// One channel, so a single module-level cache keyed by handle is enough.
const cache = new Map<
  string,
  { expiry: number; videos: Video[]; shortsFiltered: number }
>();

function pickThumb(thumbnails: Record<string, { url?: string }> = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}

// ISO 8601 duration ("PT1H2M30S") -> seconds. Unparseable (e.g. "P0D" lives) -> 0.
function parseDuration(iso?: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

async function fetchUploadsPlaylistId(handle: string, key: string) {
  const url = `${API_BASE}/channels?part=contentDetails&forHandle=${encodeURIComponent(
    handle,
  )}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `YouTube channels error: ${res.status}`);
  }
  const uploads =
    data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
  if (!uploads) throw new Error(`No channel found for handle "@${handle}"`);
  return uploads as string;
}

async function fetchAllUploads(playlistId: string, key: string): Promise<Video[]> {
  const videos: Video[] = [];
  let pageToken = "";
  do {
    const url =
      `${API_BASE}/playlistItems?part=snippet,contentDetails` +
      `&playlistId=${playlistId}&maxResults=50&key=${key}` +
      (pageToken ? `&pageToken=${pageToken}` : "");
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `YouTube playlistItems error: ${res.status}`);
    }

    for (const item of data.items || []) {
      const videoId = item.contentDetails?.videoId;
      const title = item.snippet?.title || "";
      // The uploads playlist surfaces removed/hidden items as placeholders —
      // skip anything without a real, fetchable video.
      if (!videoId || title === "Private video" || title === "Deleted video") {
        continue;
      }
      videos.push({
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title,
        description: item.snippet?.description || "",
        publishedAt:
          item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt || "",
        thumbnailUrl: pickThumb(item.snippet?.thumbnails),
        durationSeconds: 0,
      });
    }
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return videos;
}

// Fill in durationSeconds via videos.list (50 ids per call).
async function fetchDurations(videoIds: string[], key: string) {
  const durations = new Map<string, number>();
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50).join(",");
    const url = `${API_BASE}/videos?part=contentDetails&id=${batch}&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `YouTube videos error: ${res.status}`);
    }
    for (const item of data.items || []) {
      durations.set(item.id, parseDuration(item.contentDetails?.duration));
    }
  }
  return durations;
}

// Ask YouTube whether a video is a Short. 200 = Short; a redirect to /watch
// (or any error/timeout, which we treat conservatively) = keep the video.
async function isShort(videoId: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    // Don't download the Shorts page body once we have the status.
    res.body?.cancel?.().catch(() => {});
    return res.status === 200;
  } catch {
    return false; // never hide a real interview because a probe failed
  } finally {
    clearTimeout(timer);
  }
}

// Probe the short-enough candidates with a small concurrency pool.
async function findShortIds(candidates: Video[]): Promise<Set<string>> {
  const shortIds = new Set<string>();
  const queue = [...candidates];
  async function worker() {
    let v: Video | undefined;
    while ((v = queue.shift())) {
      if (await isShort(v.videoId)) shortIds.add(v.videoId);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(PROBE_CONCURRENCY, queue.length) }, worker),
  );
  return shortIds;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing YOUTUBE_API_KEY" },
      { status: 500, headers: corsHeaders },
    );
  }

  const handle = (
    request.nextUrl.searchParams.get("handle") || DEFAULT_HANDLE
  ).replace(/^@/, "");

  const cached = cache.get(handle);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.json(
      { videos: cached.videos, shortsFiltered: cached.shortsFiltered },
      { headers: corsHeaders },
    );
  }

  try {
    const uploads = await fetchUploadsPlaylistId(handle, key);
    const all = await fetchAllUploads(uploads, key);

    // Attach durations, then probe only the <=180s candidates for Short status.
    const durations = await fetchDurations(all.map((v) => v.videoId), key);
    for (const v of all) v.durationSeconds = durations.get(v.videoId) ?? 0;

    const candidates = all.filter((v) => v.durationSeconds <= SHORT_MAX_SECONDS);
    const shortIds = await findShortIds(candidates);

    const videos = all.filter((v) => !shortIds.has(v.videoId));
    const shortsFiltered = shortIds.size;

    cache.set(handle, { expiry: Date.now() + CACHE_TTL_MS, videos, shortsFiltered });
    return NextResponse.json({ videos, shortsFiltered }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders },
    );
  }
}
