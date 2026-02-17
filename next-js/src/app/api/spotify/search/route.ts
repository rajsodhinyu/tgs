import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search";

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
  // Expire 60s early to avoid edge cases
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

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
    const token = await getAccessToken();
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
