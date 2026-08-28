import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

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

/** Page background, used as the letterbox behind non-2:1 artwork. */
const OG_CARD_BG = "191A24";

export type OgImage = {
  url: string;
  width: number;
  height: number;
};

/**
 * Fit `source` inside the card frame without cropping, padding out to
 * 1200x630 with the site background. Interview/feature thumbs are square
 * Figma frames with type running to the top and bottom edges, so a
 * center-crop into a 1.91:1 card would cut the title off.
 */
export function letterboxOgImage(source: SanityImageSource): OgImage | null {
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
    .bg(OG_CARD_BG)
    .format("jpg")
    .quality(85)
    .url();

  return url ? { url, width: OG_CARD_WIDTH, height: OG_CARD_HEIGHT } : null;
}

/** Site-wide default, for content with no artwork of its own. */
export const DEFAULT_OG_IMAGE: OgImage = letterboxOgImage(
  "image-3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160-png",
) ?? {
  url: "https://cdn.sanity.io/images/fnvy29id/tgs/3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160.png",
  width: 2880,
  height: 2160,
};
