import "server-only";

/**
 * Shared Spotify client-credentials token, cached in-process until just before
 * expiry. Used by the spotify API routes (album / playlist / search).
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

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

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  // Expire 60s early to avoid edge cases.
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}
