"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const PINK: [number, number, number] = [237, 157, 249];
const HIGHLIGHT: [number, number, number] = [255, 235, 255];
const BG: [number, number, number] = [61, 53, 100];

const BALL_RADIUS = 70;
const LAT_STEPS = 11;
const LON_STEPS = 18;
const SWITCH_MS = 2000;

export const discoBallsSketch = (s: p5) => {
  const positions: { x: number; y: number; phaseOffset: number }[] = [];
  let litIndex = 0;
  let lightSrcX = 0;
  let lightSrcY = 0;
  let lastSwitch = 0;

  function pickLight() {
    // Pick a new lit ball (different from current) and a light source on
    // a random screen edge so the beam direction changes each switch.
    if (positions.length > 1) {
      let next = litIndex;
      while (next === litIndex) next = Math.floor(s.random(positions.length));
      litIndex = next;
    }
    // Random point along the perimeter of the canvas.
    const w = s.windowWidth;
    const h = s.windowHeight;
    const side = Math.floor(s.random(4));
    if (side === 0) {
      lightSrcX = s.random(w);
      lightSrcY = 0;
    } else if (side === 1) {
      lightSrcX = w;
      lightSrcY = s.random(h);
    } else if (side === 2) {
      lightSrcX = s.random(w);
      lightSrcY = h;
    } else {
      lightSrcX = 0;
      lightSrcY = s.random(h);
    }
  }

  function seed() {
    positions.length = 0;
    const cols = 2;
    const rows = 3;
    const xSpan = s.windowWidth;
    const ySpan = s.windowHeight;
    for (let i = 0; i < cols * rows; i++) {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      positions.push({
        x: (xSpan / cols) * (cx + 0.5),
        y: (ySpan / rows) * (cy + 0.5),
        phaseOffset: s.random(s.TWO_PI),
      });
    }
  }

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.noStroke();
    seed();
    pickLight();
    lastSwitch = s.millis();
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    seed();
  };

  function drawSpotlight(targetX: number, targetY: number) {
    const sx = lightSrcX;
    const sy = lightSrcY;
    const dx = targetX - sx;
    const dy = targetY - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;
    // Perpendicular for cone width
    const px = -ny;
    const py = nx;
    const startWidth = 6;
    const endWidth = BALL_RADIUS * 1.4;

    // Outer soft glow
    s.fill(HIGHLIGHT[0], HIGHLIGHT[1], HIGHLIGHT[2], 22);
    s.quad(
      sx + px * (startWidth + 8),
      sy + py * (startWidth + 8),
      targetX + px * (endWidth + 14),
      targetY + py * (endWidth + 14),
      targetX - px * (endWidth + 14),
      targetY - py * (endWidth + 14),
      sx - px * (startWidth + 8),
      sy - py * (startWidth + 8),
    );
    // Inner brighter beam
    s.fill(HIGHLIGHT[0], HIGHLIGHT[1], HIGHLIGHT[2], 44);
    s.quad(
      sx + px * startWidth,
      sy + py * startWidth,
      targetX + px * endWidth,
      targetY + py * endWidth,
      targetX - px * endWidth,
      targetY - py * endWidth,
      sx - px * startWidth,
      sy - py * startWidth,
    );

    // Lamp glyph at the source
    s.fill(HIGHLIGHT[0], HIGHLIGHT[1], HIGHLIGHT[2], 220);
    s.ellipse(sx, sy, 40, 40);
  }

  function drawReflections(cx: number, cy: number, rotation: number) {
    // Light bounces off the ball: cast a few bright streaks/dots radiating
    // outward, with phase tied to rotation so they crawl as the ball spins.
    const r = BALL_RADIUS;
    const beams = 7;
    for (let i = 0; i < beams; i++) {
      const angle = (i / beams) * Math.PI * 2 + rotation * 0.5;
      const flicker = 0.5 + 0.5 * Math.sin(rotation * 4 + i * 1.7);
      if (flicker < 0.45) continue;
      const reach = r * (1.6 + flicker * 1.2);
      const ex = cx + Math.cos(angle) * reach;
      const ey = cy + Math.sin(angle) * reach;
      // Streak: a few small squares marching outward
      const steps = 5;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps;
        const x = cx + Math.cos(angle) * (r * 1.05 + (reach - r * 1.05) * t);
        const y = cy + Math.sin(angle) * (r * 1.05 + (reach - r * 1.05) * t);
        const sz = 4 * (1 - t * 0.6);
        const a = 200 * (1 - t) * flicker;
        s.fill(HIGHLIGHT[0], HIGHLIGHT[1], HIGHLIGHT[2], a);
        s.rect(x - sz / 2, y - sz / 2, sz, sz);
      }
      // Bright tip
      s.fill(HIGHLIGHT[0], HIGHLIGHT[1], HIGHLIGHT[2], 220 * flicker);
      s.rect(ex - 3, ey - 3, 6, 6);
    }
  }

  function drawBall(
    cx: number,
    cy: number,
    rotation: number,
    lit: boolean,
    lightDirX: number,
    lightDirY: number,
  ) {
    const r = BALL_RADIUS;
    const cellH = (Math.PI * r) / LAT_STEPS;
    const dotSize = cellH * 0.55;

    for (let i = 0; i < LAT_STEPS; i++) {
      const phi = ((i + 0.5) / LAT_STEPS) * Math.PI - Math.PI / 2;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const ringR = r * cosPhi;
      const fy = cy + r * sinPhi;

      for (let j = 0; j < LON_STEPS; j++) {
        if ((i + j) % 2 !== 0) continue;
        const theta = (j / LON_STEPS) * Math.PI * 2 + rotation;
        const facing = Math.cos(theta);
        if (facing < 0.05) continue;
        const fx = cx + ringR * Math.sin(theta);
        const w = dotSize * facing;

        let col: [number, number, number] = PINK;
        if (lit) {
          // Surface normal in screen space (approx): horizontal from sin(theta),
          // vertical from sinPhi. Dot with light direction for brightness.
          const nxSurf = Math.sin(theta) * cosPhi;
          const nySurf = sinPhi;
          const dot = nxSurf * lightDirX + nySurf * lightDirY;
          if (dot > 0.2) {
            col = HIGHLIGHT;
          } else if (dot > -0.1) {
            col = [
              PINK[0] + (HIGHLIGHT[0] - PINK[0]) * 0.4,
              PINK[1] + (HIGHLIGHT[1] - PINK[1]) * 0.4,
              PINK[2] + (HIGHLIGHT[2] - PINK[2]) * 0.4,
            ];
          }
        }
        s.fill(col[0], col[1], col[2]);
        s.rect(fx - w / 2, fy - dotSize / 2, w, dotSize);
      }
    }
  }

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2]);
    const t = s.frameCount * 0.03;

    if (s.millis() - lastSwitch >= SWITCH_MS) {
      pickLight();
      lastSwitch = s.millis();
    }

    const lit = positions[litIndex];
    if (lit) drawSpotlight(lit.x, lit.y);

    let lightDirX = 0;
    let lightDirY = 0;
    if (lit) {
      const dx = lit.x - lightSrcX;
      const dy = lit.y - lightSrcY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      lightDirX = -dx / len;
      lightDirY = -dy / len;
    }

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      drawBall(
        p.x,
        p.y,
        t + p.phaseOffset,
        i === litIndex,
        lightDirX,
        lightDirY,
      );
    }

    if (lit) drawReflections(lit.x, lit.y, t + lit.phaseOffset);
  };
};

const DiscoBallsBackground = () => {
  return <P5Background sketch={discoBallsSketch} />;
};

export default DiscoBallsBackground;
