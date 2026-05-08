"use client";
import p5 from "p5";
import P5Background from "./P5Background";

const BG: [number, number, number] = [61, 53, 100];

const LEAF_COLORS: [number, number, number][] = [
  [237, 157, 249], // tgs-pink
  [108, 92, 190], // tgs-purple
  [250, 200, 255], // light pink
  [180, 130, 240], // light purple
  [255, 235, 255], // highlight
];

interface Leaf {
  x: number;
  y: number;
  baseY: number;
  size: number;
  speed: number;
  rotation: number;
  spin: number;
  wobbleAmp: number;
  wobbleFreq: number;
  wobblePhase: number;
  color: [number, number, number];
  layer: number; // 0 = far/small, 1 = mid, 2 = near/big
}

export const leavesSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  const leaves: Leaf[] = [];
  let gustPhase = 0;

  function makeLeaf(fromLeft: boolean): Leaf {
    const layer = Math.floor(s.random(3));
    const sizeBase = layer === 0 ? 10 : layer === 1 ? 18 : 28;
    const size = sizeBase + s.random(-4, 8);
    const speedBase = layer === 0 ? 0.3 : layer === 1 ? 0.6 : 1.0;
    const baseY = s.random(-20, height + 20);
    return {
      x: fromLeft ? s.random(-200, width) : -size * 2 - s.random(0, 200),
      y: baseY,
      baseY,
      size,
      speed: speedBase + s.random(-0.1, 0.2),
      rotation: s.random(s.TWO_PI),
      spin: s.random(-0.015, 0.015),
      wobbleAmp: s.random(20, 70),
      wobbleFreq: s.random(0.0015, 0.005),
      wobblePhase: s.random(s.TWO_PI),
      color: LEAF_COLORS[Math.floor(s.random(LEAF_COLORS.length))],
      layer,
    };
  }

  function seed() {
    leaves.length = 0;
    const count = Math.floor((width * height) / 14000);
    for (let i = 0; i < count; i++) {
      leaves.push(makeLeaf(true));
    }
  }

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    seed();
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    seed();
  };

  function drawLeaf(leaf: Leaf) {
    s.push();
    s.translate(leaf.x, leaf.y);
    s.rotate(leaf.rotation);
    // Foreshorten when "tumbling" — squish horizontally based on rotation
    const squish = 0.45 + 0.55 * Math.abs(Math.cos(leaf.rotation * 1.7));
    const w = leaf.size * squish;
    const h = leaf.size * 1.6;

    // Drop shadow on near layer
    if (leaf.layer === 2) {
      s.fill(0, 0, 0, 50);
      s.ellipse(2, 3, w, h);
    }

    // Leaf body
    s.fill(leaf.color[0], leaf.color[1], leaf.color[2]);
    s.ellipse(0, 0, w, h);

    // Center vein (slightly darker / pixel strip)
    const v = leaf.color;
    s.fill(v[0] * 0.65, v[1] * 0.65, v[2] * 0.65);
    s.rect(-Math.max(0.5, w * 0.04), -h / 2, Math.max(1, w * 0.08), h);

    // Tiny stem
    s.fill(v[0] * 0.5, v[1] * 0.5, v[2] * 0.5);
    s.rect(-1, h / 2, 2, leaf.size * 0.35);

    s.pop();
  }

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2]);

    gustPhase += 0.003;
    const gust = 1 + 0.5 * Math.sin(gustPhase) + 0.3 * Math.sin(gustPhase * 2.3);

    // Sort by layer so far leaves draw first
    leaves.sort((a, b) => a.layer - b.layer);

    for (let i = leaves.length - 1; i >= 0; i--) {
      const leaf = leaves[i];

      // Wind: horizontal drift + slight vertical wobble (skimming)
      leaf.x += leaf.speed * gust;
      const t = s.frameCount;
      leaf.y =
        leaf.baseY +
        Math.sin(t * leaf.wobbleFreq + leaf.wobblePhase) * leaf.wobbleAmp;
      // Drift baseline gently downward then loop
      leaf.baseY += 0.02 * (leaf.layer + 1) * 0.3;
      leaf.rotation += leaf.spin * gust;

      drawLeaf(leaf);

      // Recycle when off-screen right
      if (leaf.x - leaf.size > width + 40) {
        const fresh = makeLeaf(false);
        Object.assign(leaf, fresh);
      }
      // Wrap baseY if it drifts off bottom
      if (leaf.baseY > height + 40) {
        leaf.baseY = -20;
      }
    }
  };
};

const LeavesBackground = () => {
  return <P5Background sketch={leavesSketch} />;
};

export default LeavesBackground;
