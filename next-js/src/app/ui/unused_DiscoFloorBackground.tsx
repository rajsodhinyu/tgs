"use client";
import p5 from "p5";
import P5Background from "./P5Background";

// Locked palette.
const BG: [number, number, number] = [61, 53, 100];
const PINK: [number, number, number] = [237, 157, 249];
const PURPLE: [number, number, number] = [108, 92, 190];
const LIGHT_PINK: [number, number, number] = [250, 200, 255];

const BALL_RADIUS = 64;
const LAT_STEPS = 11;
const LON_STEPS = 18;
const SPECK_COUNT = 220;

type AudioTap = {
  ctx: AudioContext;
  analyser: AnalyserNode;
  timeData: Uint8Array;
  audio: HTMLAudioElement;
};

declare global {
  interface HTMLAudioElement {
    __tgsAudioTap?: AudioTap;
  }
}

function getAudioTap(): AudioTap | null {
  if (typeof window === "undefined") return null;
  const audio = document.getElementById("myAudio") as HTMLAudioElement | null;
  if (!audio) return null;
  if (audio.__tgsAudioTap) return audio.__tgsAudioTap;
  if (!audio.crossOrigin) return null;

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const tap: AudioTap = {
      ctx,
      analyser,
      timeData: new Uint8Array(analyser.fftSize),
      audio,
    };
    audio.__tgsAudioTap = tap;
    return tap;
  } catch {
    return null;
  }
}

// "Disco Mirror Floor": a single mirror ball near the top-center, drawn as a
// sphere of dot facets (same projected-sphere technique as DiscoBallsBackground
// — front-facing dots only, shaded by a fixed overhead key light). As it spins
// it throws a field of light specks that drift across a dark floor below. Each
// speck orbits the ball on its own ring; its brightness flickers in sync with
// the ball's rotation (a facet catching the light) and it's projected with fake
// perspective so specks read larger/brighter in the foreground and shrink
// toward a vanishing point. Audio level spins the ball faster, pulses the
// specks brighter and scatters them wider; with no audio it drifts gently.
type Speck = {
  // Orbit parameters around the ball's screen position.
  angle: number; // starting angle on the orbit ring
  ringR: number; // base orbit radius (px)
  drop: number; // how far below ball center this speck's floor band sits (0..1)
  speed: number; // angular speed multiplier
  flickerPhase: number; // phase offset for the catch-the-light twinkle
  flickerRate: number; // twinkle frequency
  hue: number; // 0 = pink, 1 = light-pink, mixed
  baseSize: number; // intrinsic speck size
};

export const discoFloorSketch = (s: p5) => {
  let width = s.windowWidth;
  let height = s.windowHeight;

  let ballX = 0;
  let ballY = 0;

  let rotation = 0;
  const specks: Speck[] = [];

  let tap: AudioTap | null = null;
  let smoothedLevel = 0;
  // Beat detector: track a slow envelope; when level jumps above it, it's a hit.
  let beatEnv = 0;
  let beatPulse = 0; // decays each frame, spikes on a beat

  const resumeCtx = () => {
    if (tap && tap.ctx.state === "suspended") tap.ctx.resume().catch(() => {});
  };

  function placeBall() {
    ballX = width * 0.5;
    ballY = height * 0.2;
  }

  function seedSpecks() {
    specks.length = 0;
    const maxReach = Math.max(width, height);
    for (let i = 0; i < SPECK_COUNT; i++) {
      // Bias rings outward so the floor below the ball fills up.
      const t = Math.pow(s.random(), 0.65);
      specks.push({
        angle: s.random(s.TWO_PI),
        ringR: BALL_RADIUS * 1.4 + t * maxReach * 0.85,
        drop: s.random(),
        speed: s.random(0.5, 1.4),
        flickerPhase: s.random(s.TWO_PI),
        flickerRate: s.random(3, 7),
        hue: s.random(),
        baseSize: s.random(2, 6),
      });
    }
  }

  s.setup = () => {
    s.createCanvas(width, height);
    s.background(BG[0], BG[1], BG[2]);
    s.noStroke();
    placeBall();
    seedSpecks();
    tap = getAudioTap();
    window.addEventListener("pointerdown", resumeCtx);
    window.addEventListener("keydown", resumeCtx);
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    width = s.windowWidth;
    height = s.windowHeight;
    placeBall();
    seedSpecks();
  };

  const sampleLevel = (): number => {
    if (!tap || tap.ctx.state !== "running" || tap.audio.paused) return 0;
    tap.analyser.getByteTimeDomainData(tap.timeData);
    let sumSq = 0;
    for (let i = 0; i < tap.timeData.length; i++) {
      const v = (tap.timeData[i] - 128) / 128;
      sumSq += v * v;
    }
    return Math.sqrt(sumSq / tap.timeData.length);
  };

  // Soft glow halo behind the ball so it reads as the room's light source.
  function drawHalo(cx: number, cy: number, energy: number) {
    const layers = 5;
    const maxR = BALL_RADIUS * (3.2 + energy * 1.6);
    for (let i = layers; i >= 1; i--) {
      const t = i / layers;
      const r = maxR * t;
      const a = 10 * (1 - t) * (1 + energy);
      s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], a);
      s.ellipse(cx, cy, r, r);
    }
  }

  // Mirror ball: projected sphere of dot facets (reused from DiscoBalls),
  // shaded by a fixed overhead key light. Front-facing dots only.
  function drawBall(cx: number, cy: number, rot: number, energy: number) {
    const r = BALL_RADIUS;
    const cellH = (Math.PI * r) / LAT_STEPS;
    const dotSize = cellH * 0.55;

    // Key light comes from above-front (screen up): brightens top facets.
    const lightDirX = 0;
    const lightDirY = -1;

    for (let i = 0; i < LAT_STEPS; i++) {
      const phi = ((i + 0.5) / LAT_STEPS) * Math.PI - Math.PI / 2;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const ringR = r * cosPhi;
      const fy = cy + r * sinPhi;

      for (let j = 0; j < LON_STEPS; j++) {
        if ((i + j) % 2 !== 0) continue;
        const theta = (j / LON_STEPS) * Math.PI * 2 + rot;
        const facing = Math.cos(theta);
        if (facing < 0.05) continue;
        const fx = cx + ringR * Math.sin(theta);
        const w = dotSize * facing;

        // Surface normal in screen space → brightness via dot with key light.
        const nxSurf = Math.sin(theta) * cosPhi;
        const nySurf = sinPhi;
        const dot = nxSurf * lightDirX + nySurf * lightDirY;

        let col: [number, number, number];
        if (dot > 0.35) {
          col = LIGHT_PINK;
        } else if (dot > -0.05) {
          const m = 0.45 + energy * 0.3;
          col = [
            PINK[0] + (LIGHT_PINK[0] - PINK[0]) * m,
            PINK[1] + (LIGHT_PINK[1] - PINK[1]) * m,
            PINK[2] + (LIGHT_PINK[2] - PINK[2]) * m,
          ];
        } else {
          // Shadowed underside leans toward purple.
          col = [
            PINK[0] + (PURPLE[0] - PINK[0]) * 0.35,
            PINK[1] + (PURPLE[1] - PINK[1]) * 0.35,
            PINK[2] + (PURPLE[2] - PINK[2]) * 0.35,
          ];
        }
        s.fill(col[0], col[1], col[2]);
        s.rect(fx - w / 2, fy - dotSize / 2, w, dotSize);
      }
    }

    // Specular hot-spot near the top where the key light hits dead on.
    s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 200);
    s.ellipse(cx - r * 0.25, cy - r * 0.45, dotSize * 1.4, dotSize * 1.4);

    // A thin stem/pivot up to the ceiling so it reads as hung.
    s.fill(LIGHT_PINK[0], LIGHT_PINK[1], LIGHT_PINK[2], 60);
    s.rect(cx - 1, 0, 2, cy - r);
  }

  // The scattered reflected specks sweeping across the floor.
  function drawSpecks(
    cx: number,
    cy: number,
    rot: number,
    energy: number,
    pulse: number,
  ) {
    // Foreground band starts a bit below the ball; specks projected onto the
    // floor get larger & brighter the lower (closer) they are.
    const floorTop = cy + BALL_RADIUS * 1.1;
    const floorSpan = Math.max(1, height - floorTop);
    // Wider scatter when energy is high.
    const spread = 1 + energy * 0.6 + pulse * 0.5;

    for (let i = 0; i < specks.length; i++) {
      const sp = specks[i];
      // Each speck orbits the ball; rotation drives the sweep.
      const a = sp.angle + rot * sp.speed;
      const reach = sp.ringR * spread;
      let x = cx + Math.cos(a) * reach;
      // Specks rain down onto the floor band: vertical position blends the
      // orbit with a downward drop so the field reads as the floor, not a ring.
      const orbitY = cy + Math.sin(a) * reach * 0.45;
      let y = orbitY + sp.drop * floorSpan;

      // Wrap horizontally so the floor stays full as specks sweep off-edge.
      if (x < -20) x += width + 40;
      else if (x > width + 20) x -= width + 40;
      if (y > height + 20) y = floorTop + ((y - floorTop) % floorSpan);

      // Perspective depth: 0 at floorTop (far/vanishing) → 1 at bottom (near).
      const depth = Math.min(1, Math.max(0, (y - floorTop) / floorSpan));
      const persp = 0.25 + depth * 1.05;

      // Twinkle: facet catches the light as the ball spins.
      const flicker =
        0.5 + 0.5 * Math.sin(rot * sp.flickerRate + sp.flickerPhase);
      if (flicker < 0.2) continue;

      const intensity = flicker * (0.55 + energy * 0.6 + pulse * 0.8);
      const alpha = Math.min(255, 40 + intensity * 215);
      const size = sp.baseSize * persp * (0.8 + flicker * 0.6);

      // Color: blend pink → light-pink, hottest specks go light-pink.
      const hot = Math.min(1, sp.hue * 0.5 + intensity * 0.6);
      const cr = PINK[0] + (LIGHT_PINK[0] - PINK[0]) * hot;
      const cg = PINK[1] + (LIGHT_PINK[1] - PINK[1]) * hot;
      const cb = PINK[2] + (LIGHT_PINK[2] - PINK[2]) * hot;

      // Soft glow under the bright core for the punchiest specks.
      if (intensity > 0.7) {
        s.fill(cr, cg, cb, alpha * 0.25);
        s.ellipse(x, y, size * 3, size * 3);
      }
      s.fill(cr, cg, cb, alpha);
      s.rect(x - size / 2, y - size / 2, size, size);
    }
  }

  s.draw = () => {
    // Slight trail so specks leave a faint smear (motion blur) without a heavy
    // buildup — redraw a near-opaque bg each frame.
    s.background(BG[0], BG[1], BG[2], 235);

    const level = sampleLevel();
    smoothedLevel += (level - smoothedLevel) * 0.15;

    // Beat detection: when the live level pops above a slow envelope, fire a
    // pulse. Envelope tracks up slowly, decays slowly.
    beatEnv += (smoothedLevel - beatEnv) * 0.05;
    if (smoothedLevel > beatEnv * 1.35 + 0.01) {
      beatPulse = Math.min(1, beatPulse + 0.6);
    }
    beatPulse *= 0.9;

    // Energy drives rotation speed & speck behavior. Gentle floor when silent.
    const energy = Math.min(1.5, smoothedLevel * 2.2);
    const spinSpeed = 0.006 + energy * 0.05 + beatPulse * 0.04;
    rotation += spinSpeed;

    drawHalo(ballX, ballY, energy + beatPulse * 0.5);
    drawSpecks(ballX, ballY, rotation, energy, beatPulse);
    drawBall(ballX, ballY, rotation, energy + beatPulse * 0.4);
  };
};

const DiscoFloorBackground = () => {
  return <P5Background sketch={discoFloorSketch} />;
};

export default DiscoFloorBackground;
