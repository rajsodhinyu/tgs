"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronDots from "../components/ChevronDots";

export interface AlbumPhoto {
  key: string;
  src: string;
  fullSrc: string;
  /** Lossless rendition shared on iOS — saving a JPEG to Photos re-encodes
      it (~5x smaller file), but PNGs are stored as-is. */
  pngSrc: string;
  alt: string;
  width: number;
  height: number;
}

interface PhotoAlbumProps {
  photos: AlbumPhoto[];
  title?: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export default function PhotoAlbumBlock({ photos, title }: PhotoAlbumProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileCache = useRef(new Map<string, File>());
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">(
    "idle",
  );

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    // iPadOS reports itself as MacIntel, hence the touch-points check.
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
  }, []);

  // What the share sheet gets: lossless PNG on iOS (Photos re-encodes JPEGs
  // on save, but stores PNGs as-is), the untouched original everywhere else.
  const shareSrc = (photo: AlbumPhoto) =>
    (isIOS && photo.pngSrc) || photo.fullSrc;

  const fetchFile = async (url: string, i: number) => {
    const cached = fileCache.current.get(url);
    if (cached) return cached;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1]?.split("+")[0] || "jpg";
    const file = new File([blob], `tgs-photo-${i + 1}.${ext}`, {
      type: blob.type,
    });
    fileCache.current.set(url, file);
    return file;
  };

  // navigator.share must be called while the tap's user activation is still
  // live — awaiting a full-res download first gets it rejected on iOS. So on
  // touch devices, prefetch the visible photo; Save then shares synchronously.
  useEffect(() => {
    if (!isMobile) return;
    const photo = photos[index];
    if (photo) fetchFile(shareSrc(photo), index).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isIOS, index, photos]);

  if (photos.length === 0) return null;

  // Frame follows the lead photo's shape, clamped so one extreme
  // panorama/portrait doesn't blow up the layout.
  const lead = photos[0];
  const aspect = clamp(lead.width / lead.height, 3 / 4, 16 / 9);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const target = clamp(i, 0, photos.length - 1);
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const i = clamp(
      Math.round(el.scrollLeft / el.clientWidth),
      0,
      photos.length - 1,
    );
    if (i !== index) setIndex(i);
  };

  const debugErr = (stage: string, err: any) => {
    console.error(`${stage} failed:`, err);
    // Field diagnostics: append ?savedebug to the URL to surface errors.
    if (window.location.search.includes("savedebug"))
      alert(`${stage}: ${err?.name ?? ""} ${err?.message ?? err}`);
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a); // Firefox needs the anchor in the DOM
    a.click();
    a.remove();
    // Safari cancels the download if the blob URL is revoked immediately.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  // Web Share with a file puts "Save Image" / "Save to Photos" in the
  // native sheet — the closest the web gets to writing to the gallery.
  const handleSave = async () => {
    const photo = photos[index];
    setSaveState("saving");
    try {
      // Share sheet ("Save Image") on touch devices; plain download on
      // desktop and in webviews that can't share files.
      if (isMobile && typeof navigator.share === "function") {
        try {
          // Usually a cache hit (prefetched on swipe), so share() runs inside
          // the tap's user activation instead of after a slow await.
          const file =
            fileCache.current.get(shareSrc(photo)) ??
            (await fetchFile(shareSrc(photo), index));
          await navigator.share({ files: [file] });
          setSaveState("idle");
          return;
        } catch (err: any) {
          if (err?.name === "AbortError") {
            // user closed the sheet
            setSaveState("idle");
            return;
          }
          // NotAllowedError (activation expired mid-download), TypeError
          // (file sharing unsupported), … — fall through to a download.
          debugErr("Share", err);
        }
      }
      downloadFile(await fetchFile(photo.fullSrc, index));
      setSaveState("idle");
    } catch (err) {
      debugErr("Save", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  return (
    <div className="my-4 w-full">
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goTo(index - 1);
            if (e.key === "ArrowRight") goTo(index + 1);
          }}
          className="flex w-full snap-x snap-mandatory overflow-x-auto rounded-md bg-black/10 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ aspectRatio: `${aspect}` }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.key}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {/* unoptimized: serve the Sanity CDN URL as-is — Next's
                  optimizer would re-compress to ~viewport width at q75,
                  which also ruins long-press saves on mobile. */}
              <Image
                src={photo.src}
                alt={photo.alt || `Photo ${i + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1400px) 100vw, 1400px"
                unoptimized
              />
            </div>
          ))}
        </div>

        {photos.length > 1 && index > 0 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className="absolute left-0 top-0 flex h-full items-center rounded-l-md bg-gradient-to-r from-black/25 to-transparent px-3 opacity-60 transition-opacity hover:opacity-100"
          >
            <ChevronDots direction="left" />
          </button>
        )}
        {photos.length > 1 && index < photos.length - 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
            className="absolute right-0 top-0 flex h-full items-center rounded-r-md bg-gradient-to-l from-black/25 to-transparent px-3 opacity-60 transition-opacity hover:opacity-100"
          >
            <ChevronDots direction="right" />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="min-w-0 flex-1 truncate text-sm text-white/60">
          {title}
        </div>
        {photos.length > 1 && (
          <div className="font-bit text-sm tabular-nums text-white/80">
            {index + 1} / {photos.length}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white/70 hover:bg-white/20 active:bg-white/20 disabled:opacity-50"
        >
          {saveState === "saving"
            ? "Saving…"
            : saveState === "error"
              ? "Failed"
              : "Save"}
        </button>
      </div>
    </div>
  );
}
