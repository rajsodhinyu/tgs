/**
 * Origin that relative metadata URLs resolve against (`og:image` and friends
 * have to be absolute for a crawler to fetch them).
 *
 * Production is pinned to the www host: the apex 308s to it, and a card image
 * that answers with a redirect is one more thing for a crawler to refuse.
 * Preview deploys resolve to their own deployment so their cards point at the
 * build being reviewed instead of at production.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === "production") return "https://www.thatgoodsht.com";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
