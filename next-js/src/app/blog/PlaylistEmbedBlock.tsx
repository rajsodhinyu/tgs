"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePlatform } from "../components/PlatformSwitcher";

/**
 * Playlist card in the album-card visual language (AlbumEmbedBlock): a
 * horizontal slab — art on the left, title + meta on the right, one click-out
 * that follows the platform switcher. The left art is a crate-style stack
 * (front playlist cover + a few album arts peeking above it), the same look as
 * the listing-page `PlaylistCard`. Meta line mirrors the album card but shows
 * track count · total playtime instead of songs · year.
 */

interface PlaylistEmbedProps {
  name?: string;
  description?: string;
  coverUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  /** Unused now — kept so existing call sites don't break. */
  hasSidebar?: boolean;
}

function formatPlaytime(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin <= 0) return "";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function PlaylistEmbedBlock({
  name,
  description,
  coverUrl,
  spotifyUrl,
  appleMusicUrl,
}: PlaylistEmbedProps) {
  const [platform] = usePlatform();
  const [trackArt, setTrackArt] = useState<string[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);

  useEffect(() => {
    if (!spotifyUrl) return;
    let cancelled = false;
    fetch(`/api/spotify/playlist?url=${encodeURIComponent(spotifyUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d || d.error) return;
        if (Array.isArray(d.images)) {
          setTrackArt(d.images.filter((u: string) => u !== coverUrl));
        }
        if (typeof d.total === "number") setTotal(d.total);
        if (typeof d.durationMs === "number") setDurationMs(d.durationMs);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [spotifyUrl, coverUrl]);

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  // Up to four album arts fan out to the LEFT of the front playlist cover, each
  // a step smaller — keeps the card one cover tall (short vertical footprint).
  const behind = trackArt.slice(0, 4);
  const count = behind.length;

  const meta = [
    total ? `${total} songs` : null,
    durationMs ? formatPlaytime(durationMs) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="clear-both w-full my-4">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-5 sm:gap-7 w-full rounded-xl overflow-hidden p-3 sm:p-4 border-4 border-white border-opacity-0 hover:border-opacity-100 transition-all"
        style={{ textIndent: 0 }}
      >
        {/* Blurred cover wash behind the card */}
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover scale-110 blur-2xl opacity-90 pointer-events-none"
            unoptimized
            draggable={false}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-black/35" />

        {/* Cover with song arts fanning out to the left, each a step smaller. */}
        {coverUrl && (
          <div
            className="relative z-10 flex-none h-[96px] sm:h-[132px] [--front:96px] sm:[--front:132px] [--peek:15px] [--shrink:2px]"
            style={
              {
                marginLeft: -40,
                width: `calc(var(--front) + ${count} * var(--peek))`,
              } as React.CSSProperties
            }
          >
            {behind.map((src, i) => (
              <div
                key={src}
                className="absolute top-1/2 -translate-y-1/2 aspect-square rounded-lg overflow-hidden shadow-[3px_3px_8px_rgba(0,0,0,0.4)] pointer-events-none"
                style={{
                  right: `calc(${i + 1} * var(--peek))`,
                  width: `calc(var(--front) - ${i + 1} * var(--shrink))`,
                  zIndex: count - i,
                }}
              >
                <Image
                  src={src}
                  alt=""
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  unoptimized
                  draggable={false}
                />
              </div>
            ))}
            <Image
              src={coverUrl}
              alt={name || "Playlist cover"}
              width={300}
              height={300}
              className="absolute right-0 top-0 aspect-square w-[--front] rounded-lg object-cover shadow-[4px_4px_14px_rgba(0,0,0,0.45)] group-hover:scale-[0.98] transition-transform"
              style={{ zIndex: count + 1 }}
              unoptimized
              draggable={false}
            />
          </div>
        )}

        {/* Text */}
        <div
          className="relative z-10 min-w-0 flex-1 text-left"
          style={{ maxWidth: 760 }}
        >
          <div className="font-bit group-hover:font-title text-white leading-tight text-base sm:text-3xl truncate">
            {name}
          </div>
          {description && (
            <div className="font-roc font-medium text-white/85 text-xs sm:text-xl line-clamp-2 mt-1">
              {description}
            </div>
          )}
          {meta && (
            <div className="font-roc text-white/55 text-[10px] sm:text-sm mt-1.5 sm:mt-2">
              {meta}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
