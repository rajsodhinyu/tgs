/**
 * Renders a crate-style stack of album covers sideways onto an offscreen canvas.
 * Covers sit side-by-side like records in a crate, peeking out to the left
 * with the playlist cover at the front (right side).
 */

const WIDTH = 2000;
const HEIGHT = 500;
const PADDING = 0;
const CORNER_RADIUS = 12;
const MARGIN_STEP = 0; // px shorter per layer from front

export type CrateCanvasConfig = {
  width?: number;
  height?: number;
  reverse?: boolean; // flip stacking direction (vertical only)
};

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function loadAllImages(urls: string[]): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = [];
  for (const url of urls) {
    try {
      images.push(await loadImage(url));
    } catch {
      // skip broken images
    }
  }
  return images;
}

/**
 * Horizontal crate: covers peek left-to-right, playlist cover at front-left.
 */
export async function renderCrateHorizontal(
  imageUrls: string[],
  config: CrateCanvasConfig = {},
): Promise<Blob> {
  const w = config.width ?? WIDTH;
  const h = config.height ?? HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const images = await loadAllImages(imageUrls);
  if (images.length === 0) return canvasToBlob(canvas);

  const coverSize = h - PADDING * 2;
  const peekZone = w - PADDING * 2 - coverSize;
  const trackImages = images.slice(0, -1);
  const coverImage = images[images.length - 1];

  let tracksToShow = trackImages.length;
  let peek = 0;
  if (tracksToShow > 0 && peekZone > 0) {
    const minPeek = 80;
    const maxTracks = Math.floor(peekZone / minPeek);
    tracksToShow = Math.min(tracksToShow, maxTracks);
    peek = peekZone / tracksToShow;
  }

  const stack = [...trackImages.slice(0, tracksToShow), coverImage];

  for (let i = 0; i < stack.length; i++) {
    const fromFront = stack.length - 1 - i;
    const tbMargin = PADDING + fromFront * MARGIN_STEP;
    const coverH = h - tbMargin * 2;
    const coverW = coverH;
    const x = PADDING + fromFront * peek;
    const y = tbMargin;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 4;
    roundRect(ctx, x, y, coverW, coverH, CORNER_RADIUS);
    ctx.clip();
    ctx.drawImage(stack[i], x, y, coverW, coverH);
    ctx.restore();

    ctx.save();
    roundRect(ctx, x, y, coverW, coverH, CORNER_RADIUS);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  return canvasToBlob(canvas);
}

const V_WIDTH = 500;
const V_HEIGHT = 2400;

/**
 * Vertical crate: covers peek top-to-bottom, playlist cover at front-top.
 */
export async function renderCrateVertical(
  imageUrls: string[],
  config: CrateCanvasConfig = {},
): Promise<Blob> {
  const w = config.width ?? V_WIDTH;
  const h = config.height ?? V_HEIGHT;
  const reverse = config.reverse ?? false;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const images = await loadAllImages(imageUrls);
  if (images.length === 0) return canvasToBlob(canvas);

  const coverSize = w - PADDING * 2;
  const peekZone = h - PADDING * 2 - coverSize;
  const trackImages = images.slice(0, -1);
  const coverImage = images[images.length - 1];

  let tracksToShow = trackImages.length;
  let peek = 0;
  if (tracksToShow > 0 && peekZone > 0) {
    const minPeek = 80;
    const maxTracks = Math.floor(peekZone / minPeek);
    tracksToShow = Math.min(tracksToShow, maxTracks);
    peek = peekZone / tracksToShow;
  }

  const stack = [...trackImages.slice(0, tracksToShow), coverImage];

  for (let i = 0; i < stack.length; i++) {
    const fromFront = stack.length - 1 - i;
    const lrMargin = PADDING + fromFront * 3;
    const coverW = w - lrMargin * 2;
    const coverH = coverW;
    const x = lrMargin;
    // Normal: cover at top, tracks peek down. Reverse: cover at bottom, tracks peek up.
    const y = reverse
      ? h - PADDING - coverH - fromFront * peek
      : PADDING + fromFront * peek;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = reverse ? -4 : 4;
    roundRect(ctx, x, y, coverW, coverH, CORNER_RADIUS);
    ctx.clip();
    ctx.drawImage(stack[i], x, y, coverW, coverH);
    ctx.restore();

    ctx.save();
    roundRect(ctx, x, y, coverW, coverH, CORNER_RADIUS);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  return canvasToBlob(canvas);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}
