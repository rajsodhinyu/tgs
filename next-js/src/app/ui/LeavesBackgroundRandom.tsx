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
  layer: number;
}

// A curving gust: a particle traveling along an arc from bottom-left.
// Velocity vector rotates each frame so the path bends from up-right toward
// horizontal. Leaves within `radius` get pushed in the gust's velocity direction.
interface GustFront {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  strength: number;
  age: number;
  life: number;
  curveRate: number;
}

// Visible wind streaks. Each streak is shed by the gust as it moves, so a
// curving trail of streaks marks the gust's path.
interface Streak {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  alpha: number;
  fade: number;
  thickness: number;
}

export const leavesSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  const leaves: Leaf[] = [];
  const gusts: GustFront[] = [];
  const streaks: Streak[] = [];
  let baseGustPhase = 0;
  let nextGustAt = 0;

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

  function spawnGust() {
    // Origin: clustered around bottom-left corner.
    const startX = s.random(-40, width * 0.18);
    const startY = s.random(height * 0.6, height + 30);
    const speed = s.random(2.6, 4.6);
    // Initial direction: up and to the right. In screen coords y grows
    // downward, so "up-right" is angle in roughly [-100°, -55°].
    const angle = s.random(-Math.PI * 0.58, -Math.PI * 0.3);
    // Positive curveRate rotates the velocity toward 0 rad (pure right) over
    // time — i.e., the path arcs from steep-rising to flat sweeping.
    const curveRate = s.random(0.004, 0.012);

    gusts.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: s.random(150, 280),
      strength: s.random(1.6, 3.2),
      age: 0,
      life: s.random(260, 420),
      curveRate,
    });
  }

  function gustAt(x: number, y: number): { fx: number; fy: number } {
    let fx = 0;
    let fy = 0;
    for (const g of gusts) {
      const dx = x - g.x;
      const dy = y - g.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > g.radius) continue;
      const t = dist / g.radius;
      const energy = (1 - t) * (1 - t);
      const sp = Math.sqrt(g.vx * g.vx + g.vy * g.vy) || 1;
      fx += (g.vx / sp) * g.strength * energy;
      fy += (g.vy / sp) * g.strength * energy;
    }
    return { fx, fy };
  }

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
    seed();
    nextGustAt = s.frameCount + 30;
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
    const squish = 0.45 + 0.55 * Math.abs(Math.cos(leaf.rotation * 1.7));
    const w = leaf.size * squish;
    const h = leaf.size * 1.6;

    if (leaf.layer === 2) {
      s.fill(0, 0, 0, 50);
      s.ellipse(2, 3, w, h);
    }

    s.fill(leaf.color[0], leaf.color[1], leaf.color[2]);
    s.ellipse(0, 0, w, h);

    const v = leaf.color;
    s.fill(v[0] * 0.65, v[1] * 0.65, v[2] * 0.65);
    s.rect(-Math.max(0.5, w * 0.04), -h / 2, Math.max(1, w * 0.08), h);

    s.fill(v[0] * 0.5, v[1] * 0.5, v[2] * 0.5);
    s.rect(-1, h / 2, 2, leaf.size * 0.35);

    s.pop();
  }

  function drawStreaks() {
    for (let i = streaks.length - 1; i >= 0; i--) {
      const sk = streaks[i];
      sk.x += sk.vx;
      sk.y += sk.vy;
      sk.alpha -= sk.fade;
      if (
        sk.alpha <= 0 ||
        sk.x - sk.len > width + 60 ||
        sk.y < -80 ||
        sk.y > height + 80
      ) {
        streaks.splice(i, 1);
        continue;
      }
      // Oriented dash: rotate to velocity direction so streaks read as
      // motion lines along the curve.
      const ang = Math.atan2(sk.vy, sk.vx);
      s.push();
      s.translate(sk.x, sk.y);
      s.rotate(ang);
      const segments = 6;
      for (let k = 0; k < segments; k++) {
        const t = k / segments;
        const a = sk.alpha * (1 - t);
        s.fill(255, 255, 255, a);
        s.rect(-sk.len * t, -sk.thickness / 2, 2, sk.thickness);
      }
      s.pop();
    }
  }

  s.draw = () => {
    s.background(BG[0], BG[1], BG[2]);

    // Slow ambient base wind (gentle continuous drift)
    baseGustPhase += 0.003;
    const baseGust =
      1 + 0.4 * Math.sin(baseGustPhase) + 0.25 * Math.sin(baseGustPhase * 2.3);

    if (s.frameCount >= nextGustAt) {
      spawnGust();
      if (s.random() > 0.6) spawnGust();
      nextGustAt = s.frameCount + Math.floor(s.random(80, 220));
    }

    // Advance gusts along their curved paths and shed streak particles
    for (let i = gusts.length - 1; i >= 0; i--) {
      const g = gusts[i];

      // Rotate velocity vector — this is what curves the path
      const c = Math.cos(g.curveRate);
      const sn = Math.sin(g.curveRate);
      const nvx = g.vx * c - g.vy * sn;
      const nvy = g.vx * sn + g.vy * c;
      g.vx = nvx;
      g.vy = nvy;
      g.x += g.vx;
      g.y += g.vy;
      g.age += 1;

      // Emit streaks along the path. Spread them across the gust's footprint
      // so the wind reads as a band, not a single line.
      const spawnCount = s.random() < 0.85 ? 1 : 2;
      for (let k = 0; k < spawnCount; k++) {
        // Perpendicular-to-velocity offset for spread
        const sp = Math.sqrt(g.vx * g.vx + g.vy * g.vy) || 1;
        const px = -g.vy / sp;
        const py = g.vx / sp;
        const off = s.random(-g.radius * 0.7, g.radius * 0.7);
        streaks.push({
          x: g.x + px * off,
          y: g.y + py * off,
          vx: g.vx * s.random(0.85, 1.2),
          vy: g.vy * s.random(0.85, 1.2),
          len: s.random(18, 55),
          alpha: s.random(70, 150),
          fade: s.random(1.4, 2.8),
          thickness: s.random(1, 2.4),
        });
      }

      // Cull when the gust has aged out or sailed offscreen-right/top
      if (
        g.age > g.life ||
        g.x - g.radius > width + 40 ||
        g.y + g.radius < -40
      ) {
        gusts.splice(i, 1);
      }
    }

    leaves.sort((a, b) => a.layer - b.layer);

    for (let i = leaves.length - 1; i >= 0; i--) {
      const leaf = leaves[i];

      const force = gustAt(leaf.x, leaf.y);
      const layerWeight = 0.5 + leaf.layer * 0.35;
      const localMag = Math.sqrt(force.fx * force.fx + force.fy * force.fy);

      // Horizontal: ambient drift + gust push
      leaf.x += leaf.speed * baseGust + force.fx * layerWeight;

      // Vertical: gust kick on baseline + ambient wobble
      leaf.baseY += force.fy * layerWeight;
      const t = s.frameCount;
      const wobble =
        Math.sin(t * leaf.wobbleFreq + leaf.wobblePhase) * leaf.wobbleAmp;
      leaf.y = leaf.baseY + wobble;

      // Tiny constant downward drift so leaves don't perpetually rise
      leaf.baseY += 0.02 * (leaf.layer + 1) * 0.3;

      // Spin scales with total wind force on this leaf
      const totalWind = baseGust + localMag * layerWeight;
      leaf.rotation += leaf.spin * totalWind;

      drawLeaf(leaf);

      if (leaf.x - leaf.size > width + 40) {
        const fresh = makeLeaf(false);
        Object.assign(leaf, fresh);
      }
      if (leaf.baseY > height + 40) {
        leaf.baseY = -20;
      } else if (leaf.baseY < -60) {
        leaf.baseY = height + 20;
      }
    }

    // Streaks on top so wind reads above leaves
    drawStreaks();
  };
};

const LeavesBackground = () => {
  return <P5Background sketch={leavesSketch} />;
};

export default LeavesBackground;
