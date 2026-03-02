"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { renderCrateHorizontal, renderCrateVertical } from "./crateCanvas";
import ChevronDots from "../../components/ChevronDots";

type Playlist = {
  _id: string;
  name: string;
  description: string;
  playlistURL: string;
  coverUrl: string;
};

type Track = { name: string; artist: string; art?: string };
type Mode = "crate" | "smoke-break";

type ExportState =
  | { step: "select" }
  | { step: "loading"; playlistId: string }
  | {
      step: "preview";
      playlistId: string;
      allUrls: string[]; // full proxied URL list
      tracks: Track[];
    }
  | { step: "error"; message: string };

function proxyUrl(url: string) {
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export default function PlaylistExporter({
  playlists,
}: {
  playlists: Playlist[];
}) {
  const [mode, setMode] = useState<Mode>("crate");
  const [state, setState] = useState<ExportState>({ step: "select" });
  const [copied, setCopied] = useState<string | null>(null);
  const [albumCount, setAlbumCount] = useState(10);
  const [showCover, setShowCover] = useState(true);
  const [verticalReverse, setVerticalReverse] = useState(false);
  const [rendering, setRendering] = useState(false);

  // URL input
  const [urlInput, setUrlInput] = useState("");

  // Smoke break state
  const [sbPlaylist, setSbPlaylist] = useState<Playlist | null>(null);
  const [sbTracks, setSbTracks] = useState<Track[]>([]);
  const [sbLoading, setSbLoading] = useState(false);

  // Rendered blobs + preview URLs
  const [hBlob, setHBlob] = useState<Blob | null>(null);
  const [vBlob, setVBlob] = useState<Blob | null>(null);
  const [hPreview, setHPreview] = useState<string | null>(null);
  const [vPreview, setVPreview] = useState<string | null>(null);
  const previewRefs = useRef<string[]>([]);

  const cleanup = useCallback(() => {
    previewRefs.current.forEach((u) => URL.revokeObjectURL(u));
    previewRefs.current = [];
    setHBlob(null);
    setVBlob(null);
    setHPreview(null);
    setVPreview(null);
  }, []);

  function handleUrlSubmit() {
    const url = urlInput.trim();
    if (!url.includes("spotify.com/playlist")) return;
    const playlist: Playlist = {
      _id: `url-${Date.now()}`,
      name: "Custom Playlist",
      description: "",
      playlistURL: url,
      coverUrl: "",
    };
    if (mode === "crate") {
      handleSelect(playlist);
    } else {
      handleSbSelect(playlist);
    }
  }

  async function handleSelect(playlist: Playlist) {
    cleanup();
    setActivePlaylist(playlist);
    setState({ step: "loading", playlistId: playlist._id });

    try {
      const res = await fetch(
        `/api/spotify/playlist?url=${encodeURIComponent(playlist.playlistURL)}`,
      );
      const data = await res.json();
      const trackImages: string[] = data.images || [];
      const tracks: Track[] = data.tracks || [];

      const stack = playlist.coverUrl
        ? [
            ...trackImages
              .filter((u: string) => u !== playlist.coverUrl)
              .reverse(),
            playlist.coverUrl,
          ]
        : [...trackImages.reverse()];

      const proxiedUrls = stack.map(proxyUrl);

      setAlbumCount(Math.min(10, proxiedUrls.length));
      setState({
        step: "preview",
        playlistId: playlist._id,
        allUrls: proxiedUrls,
        tracks,
      });
    } catch (err: any) {
      console.error("[PlaylistExporter]", err);
      setState({ step: "error", message: err.message || "Export failed" });
    }
  }

  // Re-render canvases when albumCount or allUrls changes
  useEffect(() => {
    if (state.step !== "preview") return;

    const { allUrls } = state;
    const hasCover = activePlaylist?.coverUrl ? true : false;
    // allUrls is ordered: track art reversed... then cover last (if hasCover)
    const cover = hasCover ? allUrls[allUrls.length - 1] : null;
    const trackArt = hasCover ? allUrls.slice(0, -1) : allUrls;
    const trackCount =
      showCover && hasCover ? Math.max(0, albumCount - 1) : albumCount;
    const selected = [
      ...trackArt.slice(0, trackCount),
      ...(showCover && cover ? [cover] : []),
    ];

    let cancelled = false;
    setRendering(true);

    Promise.all([
      renderCrateHorizontal(selected),
      renderCrateVertical(selected, { reverse: verticalReverse }),
    ]).then(([h, v]) => {
      if (cancelled) return;
      // Clean up old previews
      previewRefs.current.forEach((u) => URL.revokeObjectURL(u));
      const hp = URL.createObjectURL(h);
      const vp = URL.createObjectURL(v);
      previewRefs.current = [hp, vp];
      setHBlob(h);
      setVBlob(v);
      setHPreview(hp);
      setVPreview(vp);
      setRendering(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, albumCount, showCover, verticalReverse]);

  function handleDownload(blob: Blob, name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `tgs-${slug}-crate.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleSbSelect(playlist: Playlist) {
    setSbPlaylist(playlist);
    setSbLoading(true);
    setSbTracks([]);
    try {
      const res = await fetch(
        `/api/spotify/playlist?url=${encodeURIComponent(playlist.playlistURL)}`,
      );
      const data = await res.json();
      setSbTracks(data.tracks || []);
    } catch {
      // ignore
    } finally {
      setSbLoading(false);
    }
  }

  function copyImageFromUrl(url: string, label: string) {
    fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
      .then((r) => r.blob())
      .then((blob) => {
        const pngBlob = new Blob([blob], { type: "image/png" });
        navigator.clipboard
          .write([new ClipboardItem({ "image/png": pngBlob })])
          .then(() => {
            setCopied(label);
            setTimeout(() => setCopied(null), 1500);
          });
      });
  }

  function copyImage(blob: Blob, label: string) {
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": blob })])
      .then(() => {
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
      });
  }

  function handleBack() {
    cleanup();
    setCopied(null);
    setActivePlaylist(null);
    setState({ step: "select" });
  }

  // Keep track of the active playlist (including custom URL playlists)
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  const selectedPlaylist =
    activePlaylist ??
    (state.step !== "select" && state.step !== "error"
      ? playlists.find((p) => p._id === state.playlistId) ?? null
      : null);

  const maxAlbums =
    state.step === "preview" ? state.allUrls.length : 0;

  return (
    <div className="mx-3 sm:mx-6">
      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-6">
        {(mode === "crate" && state.step === "preview") ? (
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center justify-self-start"
          >
            <ChevronDots direction="left" color="white" />
          </button>
        ) : (mode === "smoke-break" && sbPlaylist) ? (
          <button
            onClick={() => { setSbPlaylist(null); setSbTracks([]); }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center justify-self-start"
          >
            <ChevronDots direction="left" color="white" />
          </button>
        ) : (
          <Link
            href="/playlists"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center justify-self-start"
          >
            <ChevronDots direction="left" color="white" />
          </Link>
        )}
        <div className="flex items-center justify-center">
          <div className="flex bg-white/10 rounded-full">
            <button
              onClick={() => setMode("crate")}
              className={`px-4 py-1.5 rounded-full font-title text-sm uppercase transition-colors ${
                mode === "crate" ? "bg-white text-black" : "text-white hover:bg-white/20"
              }`}
            >
              Export Crate
            </button>
            <button
              onClick={() => setMode("smoke-break")}
              className={`px-4 py-1.5 rounded-full font-title text-sm uppercase transition-colors ${
                mode === "smoke-break" ? "bg-white text-black" : "text-white hover:bg-white/20"
              }`}
            >
              Smoke Break
            </button>
          </div>
        </div>
        <div />
      </div>

      {mode === "crate" && state.step === "select" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="Paste a Spotify playlist URL..."
              className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm placeholder:text-white/30 outline-none focus:ring-2 ring-tgs-pink"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.includes("spotify.com/playlist")}
              className="px-4 py-2 rounded-full bg-tgs-pink text-black font-bold font-roc text-sm hover:bg-tgs-pink/80 transition-colors disabled:opacity-30"
            >
              Go
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <button
                key={playlist._id}
                onClick={() => handleSelect(playlist)}
                className="group text-left"
              >
                <Image
                  className="rounded-lg border-2 border-transparent group-hover:border-tgs-pink transition-all"
                  src={playlist.coverUrl}
                  width={400}
                  height={400}
                  alt={playlist.name}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="pt-2 text-white text-sm font-bold font-bit leading-tight group-hover:text-tgs-pink transition-colors">
                  {playlist.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "crate" && state.step === "loading" && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-white/60 font-roc text-sm mt-4">
            Building crate for {selectedPlaylist?.name}...
          </p>
        </div>
      )}

      {mode === "crate" && state.step === "preview" &&
        selectedPlaylist &&
        (() => {
          const { tracks } = state;
          const name = selectedPlaylist.name;
          return (
            <div className="flex flex-col gap-6">
              {/* Top bar: back, copy buttons, album counter */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => copyText(name, "title")}
                  className="px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm hover:bg-white/20 transition-colors"
                >
                  {copied === "title" ? "Copied!" : "Copy Title"}
                </button>
                <button
                  onClick={() =>
                    copyText(selectedPlaylist.description, "desc")
                  }
                  className="px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm hover:bg-white/20 transition-colors"
                >
                  {copied === "desc" ? "Copied!" : "Copy Description"}
                </button>
                <button
                  onClick={() =>
                    copyText(
                      tracks
                        .map((t) => `${t.name} — ${t.artist}`)
                        .join("\n"),
                      "tracks",
                    )
                  }
                  className="px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm hover:bg-white/20 transition-colors"
                >
                  {copied === "tracks" ? "Copied!" : "Copy Tracklist"}
                </button>

                {/* Cover toggle */}
                <button
                  onClick={() => setShowCover((v) => !v)}
                  className={`px-4 py-2 rounded-full font-roc text-sm transition-colors ${
                    showCover
                      ? "bg-tgs-pink text-black font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Cover {showCover ? "On" : "Off"}
                </button>
                {/* Vertical stack direction */}
                <button
                  onClick={() => setVerticalReverse((v) => !v)}
                  className={`px-4 py-2 rounded-full font-roc text-sm transition-colors ${
                    verticalReverse
                      ? "bg-tgs-pink text-black font-bold"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {verticalReverse ? "Crate Style" : "Stack Down"}
                </button>

                {/* Album count stepper */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-white/60 font-roc text-sm">Albums:</span>
                  <button
                    onClick={() => setAlbumCount((c) => Math.max(1, c - 1))}
                    disabled={albumCount <= 1}
                    className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-white font-roc text-lg w-8 text-center">
                    {albumCount}
                  </span>
                  <button
                    onClick={() => setAlbumCount((c) => Math.min(maxAlbums, c + 1))}
                    disabled={albumCount >= maxAlbums}
                    className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Images side by side */}
              <div className="grid grid-cols-2 gap-6 items-start">
                {/* Horizontal */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 font-roc text-xs uppercase">Horizontal</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => hBlob && copyImage(hBlob, "h-img")}
                        disabled={!hBlob || rendering}
                        className="px-4 py-1.5 rounded-full bg-white/10 text-white font-roc text-xs hover:bg-white/20 transition-colors disabled:opacity-30"
                      >
                        {copied === "h-img" ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() =>
                          hBlob && handleDownload(hBlob, `${name}-horizontal`)
                        }
                        disabled={!hBlob || rendering}
                        className="px-4 py-1.5 rounded-full bg-tgs-pink text-black font-bold font-roc text-xs hover:bg-tgs-pink/80 transition-colors disabled:opacity-30"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  {hPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={hPreview}
                      alt={`${name} horizontal`}
                      className={`w-full rounded-lg shadow-2xl transition-opacity ${rendering ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <div className="w-full aspect-[4/1] bg-white/5 rounded-lg animate-pulse" />
                  )}
                </div>

                {/* Vertical */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 font-roc text-xs uppercase">Vertical</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => vBlob && copyImage(vBlob, "v-img")}
                        disabled={!vBlob || rendering}
                        className="px-4 py-1.5 rounded-full bg-white/10 text-white font-roc text-xs hover:bg-white/20 transition-colors disabled:opacity-30"
                      >
                        {copied === "v-img" ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() =>
                          vBlob && handleDownload(vBlob, `${name}-vertical`)
                        }
                        disabled={!vBlob || rendering}
                        className="px-4 py-1.5 rounded-full bg-tgs-pink text-black font-bold font-roc text-xs hover:bg-tgs-pink/80 transition-colors disabled:opacity-30"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  {vPreview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={vPreview}
                      alt={`${name} vertical`}
                      className={`w-full rounded-lg shadow-2xl transition-opacity ${rendering ? "opacity-50" : ""}`}
                    />
                  ) : (
                    <div className="w-full aspect-[1/4] bg-white/5 rounded-lg animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {mode === "crate" && state.step === "error" && (
        <div className="flex flex-col items-center py-20">
          <p className="text-red-400 font-roc text-sm mb-4">{state.message}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Smoke Break mode */}
      {mode === "smoke-break" && !sbPlaylist && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="Paste a Spotify playlist URL..."
              className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white font-roc text-sm placeholder:text-white/30 outline-none focus:ring-2 ring-tgs-pink"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!urlInput.includes("spotify.com/playlist")}
              className="px-4 py-2 rounded-full bg-tgs-pink text-black font-bold font-roc text-sm hover:bg-tgs-pink/80 transition-colors disabled:opacity-30"
            >
              Go
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {playlists.map((p) => (
              <button
                key={p._id}
                onClick={() => handleSbSelect(p)}
                className="group text-left"
              >
                <Image
                  className="rounded-lg border-2 border-transparent group-hover:border-tgs-pink transition-all"
                  src={p.coverUrl}
                  width={400}
                  height={400}
                  alt={p.name}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="pt-2 text-white text-sm font-bold font-bit leading-tight group-hover:text-tgs-pink transition-colors">
                  {p.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "smoke-break" && sbPlaylist && sbLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-tgs-pink rounded-full animate-spin" />
          <p className="text-white/60 font-roc text-sm mt-4">
            Loading {sbPlaylist.name}...
          </p>
        </div>
      )}

      {mode === "smoke-break" && sbPlaylist && !sbLoading && sbTracks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sbTracks.map((track, i) => (
            <div key={i} className="flex flex-col gap-1">
              <button
                onClick={() => track.art && copyImageFromUrl(track.art, `art-${i}`)}
                className="relative group"
              >
                {track.art && (
                  <Image
                    src={track.art}
                    alt={track.name}
                    width={300}
                    height={300}
                    className="w-full rounded-lg group-hover:ring-2 ring-tgs-pink transition-all"
                    unoptimized
                  />
                )}
                {copied === `art-${i}` && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <span className="text-tgs-pink font-roc text-sm font-bold">Copied!</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => copyText(track.name, `name-${i}`)}
                className="text-white text-sm font-bold font-bit leading-tight text-left hover:text-tgs-pink transition-colors truncate"
              >
                {copied === `name-${i}` ? (
                  <span className="text-tgs-pink">Copied!</span>
                ) : (
                  track.name
                )}
              </button>
              <button
                onClick={() => copyText(track.artist, `artist-${i}`)}
                className="text-white/60 text-xs font-roc leading-tight text-left hover:text-tgs-pink transition-colors truncate"
              >
                {copied === `artist-${i}` ? (
                  <span className="text-tgs-pink">Copied!</span>
                ) : (
                  track.artist
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
