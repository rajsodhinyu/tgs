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

  const includeArtists =
    request.nextUrl.searchParams.get("includeArtists") === "1";

  try {
    const token = await getAccessToken();
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.items(track(name,artists(name,id),album(images)))`;

    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Spotify API error: ${res.status}`);
    }

    const data = await res.json();
    const seen = new Set<string>();
    const images: string[] = [];
    const tracks: {
      name: string;
      artist: string;
      art: string;
      artistId?: string;
    }[] = [];

    for (const item of data.tracks?.items || []) {
      const track = item.track;
      if (!track) continue;

      const name = track.name;
      const artist =
        track.artists?.map((a: any) => a.name).join(", ") || "Unknown";
      const firstArtistId = track.artists?.[0]?.id;
      const imgs = track.album?.images;
      const trackArt = imgs?.[0]?.url || imgs?.[imgs.length - 1]?.url || "";
      tracks.push({ name, artist, art: trackArt, artistId: firstArtistId });

      if (!imgs || imgs.length === 0) continue;
      const url = trackArt;
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }

    let artists:
      | { id: string; name: string; image: string }[]
      | undefined;
    if (includeArtists) {
      const ids: string[] = [];
      const idSeen = new Set<string>();
      for (const t of tracks) {
        if (t.artistId && !idSeen.has(t.artistId)) {
          idSeen.add(t.artistId);
          ids.push(t.artistId);
        }
      }

      const byId = new Map<string, { name: string; image: string }>();
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const r = await fetch(
          `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!r.ok) continue;
        const j = await r.json();
        for (const a of j.artists || []) {
          if (!a?.id) continue;
          const image = a.images?.[0]?.url || "";
          byId.set(a.id, { name: a.name, image });
        }
      }

      // Preserve playlist order via first-appearance of each artist id
      artists = ids
        .map((id) => {
          const info = byId.get(id);
          return info ? { id, name: info.name, image: info.image } : null;
        })
        .filter((x): x is { id: string; name: string; image: string } => !!x);
    }

    return NextResponse.json(
      { images, tracks, ...(artists ? { artists } : {}) },
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
