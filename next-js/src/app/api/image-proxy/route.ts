import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["i.scdn.co", "cdn.sanity.io"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' param" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const headers = new Headers({
      "Content-Type": res.headers.get("content-type") || "image/jpeg",
      // Asset URLs are content-addressed; s-maxage lets Vercel's CDN
      // absorb repeat hits instead of re-invoking the function.
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
    });
    const len = res.headers.get("content-length");
    if (len) headers.set("Content-Length", len);

    // Stream — buffering full-res originals can blow the response size limit.
    return new NextResponse(res.body, { headers });
  } catch (err: any) {
    console.error("[image-proxy]", err.message);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
