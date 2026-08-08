"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const HILITE: [number, number, number] = [255, 235, 255];
const DEEP: [number, number, number] = [28, 20, 60];

// "Lava (static)" — the non-audio-reactive sibling of LavaBackground, same
// relationship as CheckerboardStatic to Checkerboard. Identical metaball field
// and color banding, but with no audio tap at all: the blobs drift on their own
// velocities and breathe on a fixed sine, so the look is the same whether or not
// the Song of the Day is playing. Use this one when the background shouldn't
// respond to the music (or when there's no audio on the page to sample).
type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // base radius
  ph: number; // phase offset for the breathing wobble
  cur: number; // radius this frame (base * wobble)
};

export const lavaStaticSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  const CELL = 7; // field sample + fill size in px
  const blobs: Blob[] = [];

  // One blob per this much canvas area, so a narrow phone viewport gets a few
  // well-spaced blobs instead of the same 7 crammed together. A fixed count was
  // what made the vertical form factor read as mostly white: overlapping fields
  // sum, so packing them tight pushes f past the top (HILITE) threshold nearly
  // everywhere.
  const AREA_PER_BLOB = 62000;
  // Centers must sit at least this multiple of their combined radii apart.
  const SEPARATION = 1.15;

  // Toroidal separation — must match the wrapped metric used in draw().
  const tooClose = (x: number, y: number, r: number) =>
    blobs.some((b) => {
      let dx = Math.abs(x - b.x);
      if (dx > width / 2) dx = width - dx;
      let dy = Math.abs(y - b.y);
      if (dy > height / 2) dy = height - dy;
      const min = (r + b.r) * SEPARATION;
      return dx * dx + dy * dy < min * min;
    });

  const seed = () => {
    blobs.length = 0;
    const count = Math.max(
      3,
      Math.min(8, Math.round((width * height) / AREA_PER_BLOB)),
    );
    for (let i = 0; i < count; i++) {
      const r = s.random(45, 105);
      let x = 0;
      let y = 0;
      // Rejection-sample a spot that clears the blobs already placed. Give up
      // after a bounded number of tries so a crowded canvas can't spin here.
      for (let attempt = 0; attempt < 120; attempt++) {
        x = s.random(width);
        y = s.random(height);
        if (!tooClose(x, y, r)) break;
      }
      blobs.push({
        x,
        y,
        vx: s.random(-0.35, 0.35),
        vy: s.random(-0.3, 0.3),
        r,
        ph: s.random(s.TWO_PI),
        cur: 0,
      });
    }
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    seed();
  };

  s.windowResized = () => {
    const prevW = width;
    const prevH = height;
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    // Remap the existing blobs into the new box rather than reseeding. Mobile
    // browsers fire resize every time the address bar shows/hides while
    // scrolling, and a reseed would reshuffle the whole field each time.
    if (prevW > 0 && prevH > 0) {
      const sx = width / prevW;
      const sy = height / prevH;
      for (const b of blobs) {
        b.x *= sx;
        b.y *= sy;
      }
    }
    if (!blobs.length) seed();
  };

  s.draw = () => {
    const t = s.millis() / 1000;

    s.background(DEEP[0], DEEP[1], DEEP[2]);

    for (const b of blobs) {
      // Keep centers inside [0,w) x [0,h) and let the field itself wrap, below.
      b.x = (((b.x + b.vx) % width) + width) % width;
      b.y = (((b.y + b.vy) % height) + height) % height;
      b.cur = b.r * (1 + 0.12 * Math.sin(t * 0.6 + b.ph));
    }

    for (let y = 0; y < height; y += CELL) {
      for (let x = 0; x < width; x += CELL) {
        let f = 0;
        for (const b of blobs) {
          // Toroidal distance: measure to the nearest copy of the blob across
          // the seam, so a blob leaving one edge is already bleeding in at the
          // opposite one. Wrapping the center is then invisible — the old
          // "teleport at one radius off-screen" popped, because a blob's
          // visible reach is ~1.5r, so it still lit up the edge as it jumped.
          let dx = Math.abs(x + CELL / 2 - b.x);
          if (dx > width / 2) dx = width - dx;
          let dy = Math.abs(y + CELL / 2 - b.y);
          if (dy > height / 2) dy = height - dy;
          f += (b.cur * b.cur) / (dx * dx + dy * dy + 1);
        }
        if (f < 0.55) continue; // outside the field — leave the deep backdrop
        let c: [number, number, number];
        let a: number;
        if (f > 1.9) {
          c = HILITE;
          a = 235;
        } else if (f > 1.25) {
          c = PINK;
          a = 225;
        } else if (f > 0.85) {
          c = PURPLE;
          a = 215;
        } else {
          c = BG;
          a = 200;
        }
        s.fill(c[0], c[1], c[2], a);
        s.rect(x, y, CELL - 1, CELL - 1);
      }
    }
  };
};

const LavaStaticBackground = () => {
  return <P5Background sketch={lavaStaticSketch} />;
};

export default LavaStaticBackground;
