#!/usr/bin/env node
/**
 * Pair images with mp3s in a folder and render 30-second videos.
 *
 * Usage:
 *   node make-carousel-videos.js <folder>
 *
 * Interactive flow:
 *   1. Lists images and mp3s in the folder.
 *   2. For each image, asks which mp3 to pair it with.
 *   3. For each pair, asks the start timestamp in the song (mm:ss or seconds).
 *   4. Renders <image-basename>.mp4 next to the source files.
 *
 * Output: native image resolution, H.264 CRF 14, AAC 320k, 30s duration.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync, spawn } = require('child_process');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.heic', '.tif', '.tiff']);
const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.wav', '.flac', '.aac']);
const CLIP_SECONDS = 30;

function listByExt(dir, exts) {
  return fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith('.') && exts.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function parseTimestamp(input) {
  const s = input.trim();
  if (!s) return 0;
  if (s.includes(':')) {
    const parts = s.split(':').map(Number);
    if (parts.some(Number.isNaN)) return null;
    let total = 0;
    for (const p of parts) total = total * 60 + p;
    return total;
  }
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, (a) => resolve(a)));
}

function ffprobeDuration(file) {
  const r = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
    { encoding: 'utf8' }
  );
  const d = parseFloat(r.stdout);
  return Number.isFinite(d) ? d : null;
}

function fmt(sec) {
  if (sec == null) return '?:??';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function render(image, audio, startSec, output) {
  return new Promise((resolve, reject) => {
    // -loop 1 still image; -ss before -i on audio for fast seek;
    // -tune stillimage tells x264 this is a static picture; CRF 14 = near-lossless visually.
    // Pad to even dimensions (yuv420p requires it). yuv420p for IG compat.
    // -t as an output option (not input) so it truncates BOTH streams to 30s.
    // Previously -t was before -i audio (input limiter), leaving video ~32.5s
    // and audio 30s — a ~2.5s silent tail.
    const args = [
      '-y',
      '-loop', '1',
      '-framerate', '30',
      '-i', image,
      '-ss', String(startSec),
      '-i', audio,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-t', String(CLIP_SECONDS),
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-tune', 'stillimage',
      '-crf', '14',
      '-pix_fmt', 'yuv420p',
      '-r', '30',
      '-c:a', 'aac',
      '-b:a', '320k',
      '-ar', '48000',
      '-movflags', '+faststart',
      output,
    ];
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'inherit', 'inherit'] });
    proc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

function parseArgs(argv) {
  const args = { folder: null, auto: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--auto') {
      args.auto = argv[++i];
    } else if (!args.folder) {
      args.folder = a;
    }
  }
  return args;
}

async function main() {
  const { folder, auto } = parseArgs(process.argv);
  if (!folder) {
    console.error('Usage: node make-carousel-videos.js <folder> [--auto t1,t2,t3,...]');
    process.exit(1);
  }
  const dir = path.resolve(folder);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`);
    process.exit(1);
  }

  const images = listByExt(dir, IMAGE_EXTS);
  const audios = listByExt(dir, AUDIO_EXTS);
  if (images.length === 0 || audios.length === 0) {
    console.error('Need at least one image and one audio file in the folder.');
    process.exit(1);
  }

  console.log(`\nFolder: ${dir}`);
  console.log(`\nImages (${images.length}):`);
  images.forEach((f, i) => console.log(`  [${i + 1}] ${f}`));
  console.log(`\nAudio (${audios.length}):`);
  const audioDurations = audios.map((f) => ffprobeDuration(path.join(dir, f)));
  audios.forEach((f, i) => console.log(`  [${i + 1}] ${f}  (${fmt(audioDurations[i])})`));

  const jobs = [];
  const usedAudio = new Set();

  // --auto mode: pair image N with audio N, use comma-separated timestamps.
  if (auto != null) {
    const parts = auto.split(',').map((s) => s.trim());
    if (parts.length !== images.length) {
      console.error(
        `--auto needs ${images.length} timestamps (got ${parts.length}): ${parts.join(',')}`
      );
      process.exit(1);
    }
    for (let i = 0; i < images.length; i++) {
      if (i >= audios.length) break;
      const startSec = parseTimestamp(parts[i]);
      if (startSec === null) {
        console.error(`Could not parse timestamp "${parts[i]}" for image ${i + 1}.`);
        process.exit(1);
      }
      jobs.push({ image: images[i], audio: audios[i], startSec });
    }
  } else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n— Image [${i + 1}] ${img}`);
    let audioIdx = null;
    while (audioIdx === null) {
      const defaultIdx = i < audios.length && !usedAudio.has(i) ? i + 1 : null;
      const prompt = defaultIdx
        ? `  Audio # to pair (1-${audios.length}, blank = ${defaultIdx}, 's' to skip): `
        : `  Audio # to pair (1-${audios.length}, 's' to skip): `;
      const ans = (await ask(rl, prompt)).trim();
      if (ans.toLowerCase() === 's') {
        audioIdx = 'skip';
        break;
      }
      const n = ans === '' ? defaultIdx : Number(ans);
      if (!n || n < 1 || n > audios.length) {
        console.log('  Invalid choice.');
        continue;
      }
      audioIdx = n - 1;
    }
    if (audioIdx === 'skip') continue;
    usedAudio.add(audioIdx);

    const audio = audios[audioIdx];
    const dur = audioDurations[audioIdx];
    let startSec = null;
    while (startSec === null) {
      const ans = (
        await ask(rl, `  Start timestamp in "${audio}" (mm:ss or seconds, blank = 0:00): `)
      ).trim();
      const parsed = parseTimestamp(ans);
      if (parsed === null) {
        console.log('  Could not parse. Try "1:23" or "83".');
        continue;
      }
      if (dur != null && parsed + CLIP_SECONDS > dur) {
        console.log(
          `  Warning: clip would run past end of audio (audio is ${fmt(dur)}, clip ends at ${fmt(
            parsed + CLIP_SECONDS
          )}).`
        );
      }
      startSec = parsed;
    }

    jobs.push({ image: img, audio, startSec });
  }
  rl.close();
  }

  if (jobs.length === 0) {
    console.log('\nNothing to render.');
    return;
  }

  const renderDir = path.join(dir, 'render');
  fs.mkdirSync(renderDir, { recursive: true });

  console.log(`\nRendering ${jobs.length} video(s) into ${renderDir}/\n`);
  for (const job of jobs) {
    const imageBase = path.basename(job.image, path.extname(job.image));
    const output = path.join(renderDir, `${imageBase}.mp4`);
    console.log(`→ ${path.basename(output)}  (image: ${job.image}, audio: ${job.audio} @ ${fmt(job.startSec)})`);
    try {
      await render(path.join(dir, job.image), path.join(dir, job.audio), job.startSec, output);
      console.log(`  done.\n`);
    } catch (err) {
      console.error(`  failed: ${err.message}\n`);
    }
  }
  console.log('All done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
