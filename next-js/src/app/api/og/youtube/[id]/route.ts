import { NextResponse } from "next/server";
import {
  YOUTUBE_THUMB_QUALITIES,
  YOUTUBE_VIDEO_ID,
  youtubeThumbUrl,
} from "@/lib/youtubeThumb";

/**
 * Rehosts a YouTube thumbnail on this origin, for use as a social card image.
 *
 * X refuses to render a card image hotlinked from img.youtube.com / i.ytimg.com
 * even though the JPEG is public and answers Twitterbot with a 200 — which is
 * what left every interview post with a gray, image-less card. Serving the same
 * bytes from our own host is what makes the card appear, so this has to return
 * the image itself: redirecting upstream would just hand the crawler back to
 * the host it won't fetch from.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!YOUTUBE_VIDEO_ID.test(id)) {
    return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
  }

  for (const quality of YOUTUBE_THUMB_QUALITIES) {
    let upstream: Response;
    try {
      upstream = await fetch(youtubeThumbUrl(id, quality.name));
    } catch (err: any) {
      console.error("[og/youtube]", id, quality.name, err.message);
      continue;
    }

    if (!upstream.ok || !upstream.body) continue;

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      // Thumbnails are keyed by video id and effectively immutable; s-maxage
      // lets Vercel's CDN absorb repeat crawls instead of re-invoking this.
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    });
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);

    return new NextResponse(upstream.body, { headers });
  }

  return NextResponse.json({ error: "No thumbnail" }, { status: 404 });
}
