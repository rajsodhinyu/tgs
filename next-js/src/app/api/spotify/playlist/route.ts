import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify-token";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
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
      { status: 400, headers: corsHeaders },
    );
  }

  const playlistId = parsePlaylistId(url);
  if (!playlistId) {
    return NextResponse.json(
      { error: "Invalid Spotify playlist URL" },
      { status: 400, headers: corsHeaders },
    );
  }

  const includeArtists =
    request.nextUrl.searchParams.get("includeArtists") === "1";

  try {
    const token = await getSpotifyToken();
    const trackFields =
      "items(track(id,name,external_urls.spotify,artists(name,id),album(images),duration_ms)),next,total";
    const apiUrl = `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,images,external_urls.spotify,tracks(${trackFields})`;

    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Spotify API error: ${res.status}${body ? ` ${body}` : ""}`,
      );
    }

    const data = await res.json();
    const playlistItems = [...(data.tracks?.items || [])];
    let nextUrl = data.tracks?.next;

    while (nextUrl) {
      const pagedRes = await fetch(
        `${nextUrl}&fields=${encodeURIComponent(trackFields)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!pagedRes.ok) break;
      const pagedData = await pagedRes.json();
      playlistItems.push(...(pagedData.items || []));
      nextUrl = pagedData.next;
    }

    const seen = new Set<string>();
    const images: string[] = [];
    const tracks: {
      id?: string;
      name: string;
      artist: string;
      art: string;
      spotifyUrl?: string;
      artistId?: string;
    }[] = [];
    let durationMs = 0;

    for (const item of playlistItems) {
      const track = item.track;
      if (!track) continue;

      durationMs += track.duration_ms || 0;
      const name = track.name;
      const artist =
        track.artists?.map((a: any) => a.name).join(", ") || "Unknown";
      const firstArtistId = track.artists?.[0]?.id;
      const imgs = track.album?.images;
      const trackArt = imgs?.[0]?.url || imgs?.[imgs.length - 1]?.url || "";
      tracks.push({
        id: track.id,
        name,
        artist,
        art: trackArt,
        spotifyUrl: track.external_urls?.spotify,
        artistId: firstArtistId,
      });

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
      {
        playlist: {
          name: data.name || "",
          description: data.description || "",
          image: data.images?.[0]?.url || "",
          spotifyUrl: data.external_urls?.spotify || url,
        },
        images,
        tracks,
        total: data.tracks?.total ?? tracks.length,
        durationMs,
        ...(artists ? { artists } : {}),
      },
      {
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err: any) {
    console.error("[spotify/playlist]", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders },
    );
  }
}
