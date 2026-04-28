"use client";
import { useEffect, useRef, useState } from "react";

type LogEntry = { t: number; kind: string; msg: string };

const READY_STATES = [
  "HAVE_NOTHING",
  "HAVE_METADATA",
  "HAVE_CURRENT_DATA",
  "HAVE_FUTURE_DATA",
  "HAVE_ENOUGH_DATA",
];
const NETWORK_STATES = [
  "NETWORK_EMPTY",
  "NETWORK_IDLE",
  "NETWORK_LOADING",
  "NETWORK_NO_SOURCE",
];

const TRACKED_AUDIO_EVENTS = [
  "loadstart",
  "loadedmetadata",
  "loadeddata",
  "canplay",
  "canplaythrough",
  "play",
  "playing",
  "waiting",
  "pause",
  "stalled",
  "suspend",
  "error",
  "ended",
  "seeking",
  "seeked",
  "ratechange",
  "emptied",
  "abort",
];

export default function DiagnosticOverlay() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [, setTick] = useState(0);
  const [open, setOpen] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t0Ref = useRef<number>(0);

  useEffect(() => {
    const audio = document.getElementById("myAudio") as HTMLAudioElement | null;
    if (!audio) return;
    audioRef.current = audio;
    t0Ref.current = performance.now();

    const push = (kind: string, msg: string) => {
      const entry: LogEntry = {
        t: performance.now() - t0Ref.current,
        kind,
        msg,
      };
      setLog((l) => [...l.slice(-49), entry]);
    };

    push("init", `src=${audio.currentSrc || audio.src || "(none)"}`);

    const handlers = TRACKED_AUDIO_EVENTS.map((ev) => {
      const fn = () => {
        const extra =
          ev === "error" && audio.error
            ? ` code=${audio.error.code} "${audio.error.message}"`
            : ev === "waiting" || ev === "canplay" || ev === "playing"
              ? ` rs=${audio.readyState}`
              : "";
        push("audio", `${ev}${extra}`);
      };
      audio.addEventListener(ev, fn);
      return { ev, fn };
    });

    const clickFn = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-disc]")) {
        push("click", `disc (paused=${audio.paused}, rs=${audio.readyState})`);
      }
    };
    document.addEventListener("click", clickFn, true);

    const origPlay = audio.play.bind(audio);
    audio.play = () => {
      push("call", "audio.play()");
      return origPlay().then(
        (v) => {
          push("resolve", "play() ok");
          return v;
        },
        (err) => {
          push("reject", `play() ${err?.name}: ${err?.message}`);
          throw err;
        },
      );
    };
    const origPause = audio.pause.bind(audio);
    audio.pause = () => {
      push("call", "audio.pause()");
      return origPause();
    };

    const iv = window.setInterval(() => setTick((t) => t + 1), 200);

    return () => {
      handlers.forEach((h) => audio.removeEventListener(h.ev, h.fn));
      document.removeEventListener("click", clickFn, true);
      audio.play = origPlay;
      audio.pause = origPause;
      window.clearInterval(iv);
    };
  }, []);

  const audio = audioRef.current;
  const bufferedEnd =
    audio && audio.buffered && audio.buffered.length
      ? audio.buffered.end(audio.buffered.length - 1)
      : 0;

  const tap = audio
    ? (audio as unknown as { __tgsAudioTap?: { ctx: AudioContext } })
        .__tgsAudioTap
    : undefined;
  const ctxState = tap?.ctx?.state ?? "no tap";

  if (!open) {
    return (
      <button
        className="fixed top-2 right-2 z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded"
        onClick={() => setOpen(true)}
      >
        diag
      </button>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-[9999] bg-black/85 text-white font-mono text-[10px] p-3 rounded max-w-[360px] min-w-[320px] leading-tight">
      <div className="flex justify-between mb-2">
        <b>TGS audio pipeline</b>
        <button onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="mb-1">
        <b>&lt;audio&gt;</b>
      </div>
      <div className="break-all">
        src:{" "}
        {audio?.currentSrc
          ? audio.currentSrc.replace(window.location.origin, "")
          : "(none)"}
      </div>
      <div>
        paused={String(audio?.paused)} · t={audio?.currentTime?.toFixed(2)}/
        {Number.isFinite(audio?.duration)
          ? audio?.duration.toFixed(2)
          : "?"}
      </div>
      <div>
        readyState={audio?.readyState} (
        {READY_STATES[audio?.readyState ?? 0]})
      </div>
      <div>
        networkState={audio?.networkState} (
        {NETWORK_STATES[audio?.networkState ?? 0]})
      </div>
      <div>buffered end: {bufferedEnd.toFixed(2)}s</div>
      <div>error: {audio?.error ? `code=${audio.error.code}` : "—"}</div>
      <div>crossOrigin: {audio?.crossOrigin ?? "—"}</div>

      <div className="mt-2 mb-1">
        <b>web audio</b>
      </div>
      <div>tap: {tap ? "connected" : "not connected"}</div>
      <div>ctx.state: {ctxState}</div>

      <div className="mt-2 flex flex-wrap gap-1">
        <button
          className="bg-white/20 px-2 py-0.5 rounded"
          onClick={() => audio?.play()}
        >
          play
        </button>
        <button
          className="bg-white/20 px-2 py-0.5 rounded"
          onClick={() => audio?.pause()}
        >
          pause
        </button>
        <button
          className="bg-white/20 px-2 py-0.5 rounded"
          onClick={() => {
            if (audio) audio.currentTime = 0;
          }}
        >
          seek0
        </button>
        <button
          className="bg-white/20 px-2 py-0.5 rounded"
          onClick={() => audio?.load()}
        >
          load()
        </button>
        <button
          className="bg-white/20 px-2 py-0.5 rounded"
          onClick={() => setLog([])}
        >
          clear log
        </button>
      </div>

      <div className="mt-2 mb-1">
        <b>log</b> (latest first)
      </div>
      <div className="max-h-56 overflow-auto">
        {log
          .slice()
          .reverse()
          .map((l, i) => (
            <div key={i}>
              [{(l.t / 1000).toFixed(2)}s] <span className="opacity-70">{l.kind}</span>:{" "}
              {l.msg}
            </div>
          ))}
      </div>
    </div>
  );
}
