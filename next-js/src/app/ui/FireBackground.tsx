"use client";
import p5 from "p5";
import P5Background from "./P5Background";

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: [number, number, number];
}

const FLAME_COLORS: [number, number, number][] = [
  [237, 157, 249], // tgs-pink
  [108, 92, 190], // tgs-purple
  [180, 130, 240], // light purple
  [250, 200, 255], // light pink
  [255, 255, 255], // white (hot core)
];

export const fireSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  const embers: Ember[] = [];

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
  };

  s.draw = () => {
    // Semi-transparent background for trail/glow effect
    s.background(26, 27, 35, 45);

    // Spawn new flame particles each frame along the bottom
    const spawnCount = Math.floor(width / 16);
    for (let i = 0; i < spawnCount; i++) {
      // Cluster spawns toward center for a campfire shape, but spread across width
      const cx = width / 2;
      const spread = width * 0.45;
      const x = s.randomGaussian(cx, spread);

      // Taller flames near center
      const distFromCenter = Math.abs(x - cx) / spread;
      const maxLife = s.map(distFromCenter, 0, 1, 255, 255);

      // Pick color based on height-to-be (hotter = whiter near base)
      const colorIdx =
        distFromCenter < 0.2
          ? s.random() > 0.6
            ? 4 // white core
            : Math.floor(s.random(FLAME_COLORS.length))
          : Math.floor(s.random(FLAME_COLORS.length - 1)); // no white at edges

      embers.push({
        x,
        y: height + s.random(0, 10),
        vx: s.random(-0.6, 0.6),
        vy: s.random(-3, -1.2),
        alpha: s.random(maxLife, maxLife * 2),
        size: s.random(4, 14),
        color: FLAME_COLORS[colorIdx],
      });
    }

    // Update and draw embers
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];

      // Flickering horizontal drift
      e.vx += s.random(-0.15, 0.15);
      e.x += e.vx;
      e.y += e.vy;

      // Accelerate upward slightly, slow down over time
      e.vy *= 0.995;
      e.vy -= 0.01;

      // Shrink and fade
      e.alpha -= s.random(1.5, 3);
      e.size *= 0.995;

      // Draw glow (larger, more transparent)
      s.fill(e.color[0], e.color[1], e.color[2], e.alpha * 0.15);
      s.ellipse(e.x, e.y, e.size * 3);

      // Draw ember
      s.fill(e.color[0], e.color[1], e.color[2], e.alpha);
      s.ellipse(e.x, e.y, e.size);

      if (e.alpha <= 0 || e.size < 0.5) {
        embers.splice(i, 1);
      }
    }
  };
};

const FireBackground = () => {
  return <P5Background sketch={fireSketch} />;
};

export default FireBackground;
