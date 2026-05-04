"use client";
import p5 from "p5";
import P5Background from "./P5Background";

type Note = {
  x: number;
  y: number;
  hueOffset: number;
};

export const shinyNotesSketch = (s: p5) => {
  let noteTex: p5.Graphics;
  const notes: Note[] = [];
  const NOTE_SIZE = 110;
  const SPIN_SPEED = 0.0085;
  // Spin angle and shine sweep are both integrated only while the SOTD audio
  // is playing. spinAngle starts at π/2 (edge-on) so notes are invisible
  // until playback begins.
  let spinAngle = Math.PI / 2;
  let shinePhase = 0;

  // Draws the note glyph at a dim base, then composites a moving diagonal
  // white stripe ON TOP — masked to the note shape via source-atop. After
  // per-note tinting, the dim base reads ~70% brightness and the stripe
  // peaks at 100%, so a brighter band of the tint color sweeps across.
  const paintStripe = (
    ctx: CanvasRenderingContext2D,
    sweep: number,
    stripeW: number,
  ) => {
    const stripeX = -100 + sweep * 456;
    const tilt = 60;
    const grad = ctx.createLinearGradient(
      stripeX - stripeW,
      0,
      stripeX + stripeW,
      tilt,
    );
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  };

  const drawShinyNote = (g: p5.Graphics, sweep: number) => {
    g.clear();
    g.noStroke();
    // Mid-base — bright enough to still read when no stripe is on top.
    g.fill(170);
    g.push();
    g.translate(72, 195);
    g.rotate(-0.35);
    g.ellipse(0, 0, 70, 50);
    g.pop();
    g.push();
    g.translate(182, 195);
    g.rotate(-0.35);
    g.ellipse(0, 0, 70, 50);
    g.pop();
    g.rect(90, 65, 11, 130);
    g.rect(200, 65, 11, 130);
    g.rect(90, 55, 121, 18);

    const ctx = (g as unknown as { drawingContext: CanvasRenderingContext2D })
      .drawingContext;
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    // Two stripes 180° out of phase: as one exits, the next enters, so the
    // note always has some shine somewhere.
    paintStripe(ctx, sweep, 55);
    paintStripe(ctx, (sweep + 0.5) % 1, 55);
    ctx.restore();
  };

  const seedNotes = () => {
    notes.length = 0;
    const cols = 3;
    const rows = 3;
    const margin = 1.0;
    const xSpan = s.windowWidth * margin;
    const ySpan = s.windowHeight * margin;
    for (let i = 0; i < cols * rows; i++) {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      const baseX = -xSpan / 2 + (xSpan / cols) * (cx + 0.5);
      const baseY = -ySpan / 2 + (ySpan / rows) * (cy + 0.5);
      notes.push({
        x: baseX,
        y: baseY,
        hueOffset: s.random(s.TWO_PI),
      });
    }
  };

  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight, s.WEBGL);
    s.noStroke();
    noteTex = s.createGraphics(256, 256);
    seedNotes();
  };

  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    seedNotes();
  };

  s.draw = () => {
    s.background(61, 53, 100);
    s.ortho();

    const audio = document.getElementById(
      "myAudio",
    ) as HTMLAudioElement | null;
    const isPlaying = !!audio && !audio.paused && !audio.ended;
    if (isPlaying) {
      spinAngle += SPIN_SPEED;
      shinePhase += 0.008;
    }

    const t = s.frameCount * 0.02;
    drawShinyNote(noteTex, shinePhase % 1);

    for (const n of notes) {
      const r = 200 + 55 * Math.sin(t * 0.9 + n.hueOffset);
      const g = 130 + 55 * Math.sin(t * 1.1 + n.hueOffset + 2.0);
      const b = 230 + 25 * Math.sin(t * 0.7 + n.hueOffset + 4.0);

      s.push();
      s.translate(n.x, n.y, 0);
      s.rotateY(spinAngle);
      s.tint(r, g, b);
      s.texture(noteTex);
      s.plane(NOTE_SIZE, NOTE_SIZE);
      s.pop();
    }
    s.noTint();
  };
};

const ShinyNotesBackground = () => {
  return <P5Background sketch={shinyNotesSketch} />;
};

export default ShinyNotesBackground;
