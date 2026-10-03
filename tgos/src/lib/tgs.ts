// Public thatgoodsht.com APIs (CORS-open GETs) the tools reuse: Spotify
// playlist lookup and a CORS-safe image proxy for canvas exports.
export const TGS_ORIGIN = "https://www.thatgoodsht.com";

export const tgsApi = (path: string) => `${TGS_ORIGIN}${path}`;

export const proxyImage = (url: string) =>
  tgsApi(`/api/image-proxy?url=${encodeURIComponent(url)}`);
