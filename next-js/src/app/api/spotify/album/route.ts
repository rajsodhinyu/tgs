import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify-token";

/** Minimal Spotify album-metadata lookup for the album embed card. */

function parseAlbumId(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const i = parts.indexOf("album");
    if (i !== -1 && parts[i + 1]) return parts[i + 1].split("?")[0];
    return null;
  } catch {
    return /^[a-zA-Z0-9]{22}$/.test(url) ? url : null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
  }
  const id = parseAlbumId(url);
  if (!id) {
    return NextResponse.json({ error: "Invalid Spotify album URL" }, { status: 400 });
  }

  try {
    const token = await getSpotifyToken();
    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      // Album metadata is immutable; cache hard.
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Spotify album error: ${res.status}` },
        { status: 502 },
      );
    }
    const a = await res.json();
    return NextResponse.json({
      name: a.name as string,
      artist: (a.artists || []).map((x: any) => x.name).join(", "),
      image: a.images?.[0]?.url ?? null,
      year: typeof a.release_date === "string" ? a.release_date.slice(0, 4) : null,
      totalTracks: a.total_tracks ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
