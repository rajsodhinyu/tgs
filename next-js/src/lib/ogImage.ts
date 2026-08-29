import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { bgStyle } from "@/app/blog/bgStyle";

const projectId = "fnvy29id";
const dataset = "tgs";

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Social card images.
 *
 * Every card has to be an absolute HTTPS URL that a crawler can fetch
 * anonymously. Third-party CDNs are off the table — X's card renderer will not
 * hotlink `img.youtube.com`, so a YouTube thumbnail produces a card with no
 * image at all. Everything here is served from cdn.sanity.io, which X does
 * render (the /blog card has always worked).
 */

/** X/Facebook's preferred `summary_large_image` frame. */
export const OG_CARD_WIDTH = 1200;
export const OG_CARD_HEIGHT = 630;

/** Artwork for content that has none of its own. */
export const DEFAULT_OG_ARTWORK =
  "image-3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160-png";

export type OgImage = {
  url: string;
  width: number;
  height: number;
};

/**
 * `bg=` takes a bare 3/4/6/8-digit hex; anything else makes the CDN reject the
 * transform and serve nothing, which would put us back to an image-less card.
 */
function bgParam(color: string): string {
  const hex = color.trim().replace(/^#/, "");
  return /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)
    ? hex
    : bgStyle.color.replace(/^#/, "");
}

/**
 * Fit `source` inside the card frame without cropping, padding out to 1200x630
 * with `fillColor`. Interview thumbs are square Figma frames with type running
 * to the top and bottom edges, so a center-crop into a 1.91:1 card would cut
 * the title off.
 *
 * `fillColor` should be the background the post is read against — a post's
 * Sanity `bgColor`, so the card's padding is continuous with its page — and
 * defaults to the same fallback the page itself uses.
 */
export function letterboxOgImage(
  source: SanityImageSource,
  fillColor: string = bgStyle.color,
): OgImage {
  const url = builder
    .image(source)
    // Given both a width and a height, the builder derives a `rect=` that
    // crops the source to the target aspect ratio before the CDN ever sees
    // `fit=fill` — which is exactly the crop this is meant to avoid.
    // ignoreImageParams() suppresses that (and the editor's crop/hotspot).
    .ignoreImageParams()
    .width(OG_CARD_WIDTH)
    .height(OG_CARD_HEIGHT)
    .fit("fill")
    .bg(bgParam(fillColor))
    .format("jpg")
    .quality(85)
    .url();

  return { url, width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT };
}
