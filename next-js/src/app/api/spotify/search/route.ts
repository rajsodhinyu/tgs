import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken } from "@/lib/spotify-token";

const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400, headers: corsHeaders },
    );
  }

  const searchType = request.nextUrl.searchParams.get("type") || "track";

  try {
    const token = await getSpotifyToken();
    const url = `${SPOTIFY_SEARCH_URL}?${new URLSearchParams({
      q,
      type: searchType,
      limit: "5",
    })}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Spotify search error: ${res.status}`);
    }

    const data = await res.json();

    let tracks;
    if (searchType === "album") {
      tracks = (data.albums?.items || []).map((album: any) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map((a: any) => a.name).join(", "),
        albumArt: album.images?.[0]?.url || "",
        spotifyUrl: album.external_urls?.spotify || "",
      }));
    } else {
      tracks = (data.tracks?.items || []).map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => a.name).join(", "),
        albumArt: track.album?.images?.[0]?.url || "",
        spotifyUrl: track.external_urls?.spotify || "",
      }));
    }

    return NextResponse.json({ tracks }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500, headers: corsHeaders },
    );
  }
}
