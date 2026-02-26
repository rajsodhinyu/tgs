import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Spotify token error: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

function parsePlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "open.spotify.com") {
      const parts = u.pathname.split("/");
      const idx = parts.indexOf("playlist");
      if (idx !== -1 && parts[idx + 1]) {
        return parts[idx + 1].split("?")[0];
      }
    }
  } catch {
    // If it's not a URL, treat it as a raw ID
    if (/^[a-zA-Z0-9]{22}$/.test(url)) return url;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing query parameter 'url'" },
      { status: 400 },
    );
  }

  const playlistId = parsePlaylistId(url);
  if (!playlistId) {
    return NextResponse.json(
      { error: "Invalid Spotify playlist URL" },
      { status: 400 },
    );
  }

  try {
    const token = await getAccessToken();
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.items(track(album(images)))`;

    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status}`);
    }

    const data = await res.json();
    const seen = new Set<string>();
    const images: string[] = [];

    for (const item of data.tracks?.items || []) {
      // Use the smallest image (last in array, typically 64px) for thumbnails
      const imgs = item.track?.album?.images;
      if (!imgs || imgs.length === 0) continue;
      const thumb = imgs[imgs.length - 1]?.url;
      const full = imgs[0]?.url;
      const url = full || thumb;
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }

    return NextResponse.json(
      { images },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err: any) {
    console.error("[spotify/playlist]", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 },
    );
  }
}
