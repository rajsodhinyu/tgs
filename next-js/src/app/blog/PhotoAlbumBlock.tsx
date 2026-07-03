"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChevronDots from "../components/ChevronDots";

export interface AlbumPhoto {
  key: string;
  src: string;
  fullSrc: string;
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
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

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

  // Web Share with a file puts "Save Image" / "Save to Photos" in the
  // native sheet — the closest the web gets to writing to the gallery.
  const handleSave = async () => {
    const photo = photos[index];
    setSaving(true);
    try {
      const res = await fetch(photo.fullSrc);
      const blob = await res.blob();
      const ext = blob.type.split("/")[1]?.split("+")[0] || "jpg";
      const file = new File([blob], `tgs-photo-${index + 1}.${ext}`, {
        type: blob.type,
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") console.error("Save failed:", err);
    } finally {
      setSaving(false);
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
              <Image
                src={photo.src}
                alt={photo.alt || `Photo ${i + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1400px) 100vw, 1400px"
              />
            </div>
          ))}
        </div>

        {/* Overlay arrows are desktop-only; mobile swipes the snap scroller. */}
        {!isMobile && photos.length > 1 && index > 0 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className="absolute left-0 top-0 flex h-full items-center rounded-l-md bg-gradient-to-r from-black/25 to-transparent px-3 opacity-60 transition-opacity hover:opacity-100"
          >
            <ChevronDots direction="left" />
          </button>
        )}
        {!isMobile && photos.length > 1 && index < photos.length - 1 && (
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
        {isMobile && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-white/70 active:bg-white/20 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
