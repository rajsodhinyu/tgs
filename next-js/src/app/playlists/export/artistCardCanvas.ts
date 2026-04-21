/**
 * Renders an artist "card" onto an offscreen canvas:
 * blurred artist image as background, square artist image on the left,
 * artist name on the right in a display font.
 */

const CARD_W = 740;
const CARD_H = 154;
const SCALE = 2; // render 2x for crisp downloads
const CORNER_RADIUS = 17;
const IMG_SIZE = 124;
const IMG_LEFT = 15;
const IMG_TOP = 15;
const TEXT_LEFT = 163;
const FONT_SIZE = 44.884;

function proxy(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

const CARD_FONT_FAMILY = "TGS Card Bitcount";
let fontPromise: Promise<void> | null = null;

function ensureFont(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (fontPromise) return fontPromise;
  fontPromise = (async () => {
    try {
      const face = new FontFace(
        CARD_FONT_FAMILY,
        "url(/fonts/bitcount-prop-single.ttf) format('truetype')",
      );
      await face.load();
      (document as any).fonts.add(face);
    } catch {
      // fall back to monospace silently
    }
  })();
  return fontPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
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

export type ArtistCardInput = {
  name: string;
  imageUrl: string; // raw spotify URL (will be proxied)
};

export async function renderArtistCard(
  input: ArtistCardInput,
): Promise<Blob> {
  await ensureFont();
  const w = CARD_W * SCALE;
  const h = CARD_H * SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  let img: HTMLImageElement | null = null;
  try {
    img = await loadImage(proxy(input.imageUrl));
  } catch {
    img = null;
  }

  // Outer rounded clip
  ctx.save();
  roundRect(ctx, 0, 0, w, h, CORNER_RADIUS * SCALE);
  ctx.clip();

  // Background: blurred cover-fit image (or fallback color)
  if (img) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih) * 1.1; // scale-110 equivalent
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.filter = "blur(32px)";
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.filter = "none";
    // black/20 overlay
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "#1a1b23";
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();

  // Artist image square (rounded)
  if (img) {
    ctx.save();
    const ix = IMG_LEFT * SCALE;
    const iy = IMG_TOP * SCALE;
    const is = IMG_SIZE * SCALE;
    roundRect(ctx, ix, iy, is, is, CORNER_RADIUS * SCALE);
    ctx.clip();
    // cover-fit
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(is / iw, is / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = ix + (is - dw) / 2;
    const dy = iy + (is - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  // Artist name text
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = `${FONT_SIZE * SCALE}px "${CARD_FONT_FAMILY}", monospace`;
  ctx.textBaseline = "middle";
  const baseY = (CARD_H / 2) * SCALE;
  // Truncate with ellipsis if too wide
  const maxTextW = w - TEXT_LEFT * SCALE - 20 * SCALE;
  let text = input.name;
  if (ctx.measureText(text).width > maxTextW) {
    const ell = "...";
    while (text.length > 1 && ctx.measureText(text + ell).width > maxTextW) {
      text = text.slice(0, -1);
    }
    text += ell;
  }
  ctx.fillText(text, TEXT_LEFT * SCALE, baseY);
  ctx.restore();

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
