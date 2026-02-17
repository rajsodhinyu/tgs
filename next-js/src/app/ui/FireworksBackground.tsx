"use client";
import p5 from "p5";
import P5Background from "./P5Background";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: [number, number, number];
  size: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Firework {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: [number, number, number];
  exploded: boolean;
}

const COLORS: [number, number, number][] = [
  [237, 157, 249], // tgs-pink
  [108, 92, 190], // tgs-purple
  [255, 255, 255], // white
  [180, 130, 240], // light purple
  [250, 200, 255], // light pink
];

export const fireworksSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;
  const fireworks: Firework[] = [];
  const particles: Particle[] = [];
  let lastLaunch = 0;

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
  };

  s.setup = () => {
    s.createCanvas(width, height);
    s.noStroke();
  };

  function launchFirework() {
    const color = COLORS[Math.floor(s.random(COLORS.length))];
    fireworks.push({
      x: s.random(width * 0.15, width * 0.85),
      y: height,
      vy: s.random(-14, -10),
      targetY: s.random(height * 0.15, height * 0.45),
      color,
      exploded: false,
    });
  }

  function explode(fw: Firework) {
    const count = Math.floor(s.random(60, 100));
    for (let i = 0; i < count; i++) {
      const angle = s.random(s.TWO_PI);
      const speed = s.random(1, 7);
      // Mix in a secondary color for some particles
      const color =
        s.random() > 0.3
          ? fw.color
          : COLORS[Math.floor(s.random(COLORS.length))];
      particles.push({
        x: fw.x,
        y: fw.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 255,
        color,
        size: s.random(2, 5),
        trail: [],
      });
    }
  }

  s.draw = () => {
    // Semi-transparent background for motion trails
    s.background(26, 27, 35, 40);

    // Launch new fireworks periodically
    if (s.frameCount - lastLaunch > s.random(30, 70)) {
      launchFirework();
      // Sometimes launch 2-3 together
      if (s.random() > 0.5) launchFirework();
      if (s.random() > 0.8) launchFirework();
      lastLaunch = s.frameCount;
    }

    // Update and draw fireworks (rising)
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.y += fw.vy;

      // Draw rising trail
      s.fill(fw.color[0], fw.color[1], fw.color[2], 200);
      s.rect(fw.x - 1.5, fw.y, 3, 8);

      if (fw.y <= fw.targetY) {
        explode(fw);
        fireworks.splice(i, 1);
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Save trail position
      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.5 });
      if (p.trail.length > 5) p.trail.shift();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.vx *= 0.985; // air resistance
      p.alpha -= 2.5;

      // Draw trail
      for (const t of p.trail) {
        s.fill(p.color[0], p.color[1], p.color[2], t.alpha * 0.3);
        s.ellipse(t.x, t.y, p.size * 0.6);
      }

      // Draw particle
      s.fill(p.color[0], p.color[1], p.color[2], p.alpha);
      s.ellipse(p.x, p.y, p.size);

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  };
};

const FireworksBackground = () => {
  return <P5Background sketch={fireworksSketch} />;
};

export default FireworksBackground;
