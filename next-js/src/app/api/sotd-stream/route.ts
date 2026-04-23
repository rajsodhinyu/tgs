import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const PASSTHROUGH_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "cache-control",
  "etag",
  "last-modified",
];

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src");
  if (!src) return new Response("missing src", { status: 400 });

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new Response("invalid src", { status: 400 });
  }
  if (url.protocol !== "https:" || url.host !== "cdn.sanity.io") {
    return new Response("forbidden host", { status: 403 });
  }

  const range = req.headers.get("range");
  const upstream = await fetch(url.toString(), {
    headers: range ? { range } : undefined,
  });

  const headers = new Headers();
  for (const h of PASSTHROUGH_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("access-control-allow-origin", "*");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
