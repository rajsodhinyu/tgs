"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePlatform } from "../components/PlatformSwitcher";

/**
 * Full-width album card — the same language as the inline floated TrackEmbed
 * (square art + title + artist, one click-out that follows the platform
 * switcher), but stretched to the full content width as a centerpiece for
 * album-led posts (interviews / Artist of the Week). Replaces the old 450px
 * Spotify/Apple slab.
 *
 * Metadata (name / artist / cover) is fetched from the Spotify album URL, so
 * the only stored data is the two links — like PlaylistEmbedBlock.
 */

interface AlbumEmbedProps {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  /** Optional overrides if you'd rather store metadata than fetch it. */
  name?: string;
  artist?: string;
  albumArt?: string;
}

type Meta = {
  name: string;
  artist: string;
  image: string | null;
  year: string | null;
  totalTracks: number | null;
};

export default function AlbumEmbedBlock({
  spotifyUrl,
  appleMusicUrl,
  name,
  artist,
  albumArt,
}: AlbumEmbedProps) {
  const [platform] = usePlatform();
  const [meta, setMeta] = useState<Meta | null>(null);

  useEffect(() => {
    if (!spotifyUrl || (name && albumArt)) return;
    let cancelled = false;
    fetch(`/api/spotify/album?url=${encodeURIComponent(spotifyUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d && !d.error) setMeta(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [spotifyUrl, name, albumArt]);

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  const title = name ?? meta?.name ?? "";
  const sub = artist ?? meta?.artist ?? "";
  const art = albumArt ?? meta?.image ?? null;
  const year = meta?.year ?? null;
  const tracks = meta?.totalTracks ?? null;

  return (
    <div className="clear-both w-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-4 sm:gap-5 w-full rounded-xl overflow-hidden p-3 sm:p-4 border-4 border-white border-opacity-0 hover:border-opacity-100 transition-all"
        style={{ textIndent: 0 }}
      >
        {/* Blurred cover wash behind the card */}
        {art && (
          <Image
            src={art}
            alt=""
            fill
            className="object-cover scale-110 blur-2xl opacity-90 pointer-events-none"
            unoptimized
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-black/35" />

        {/* Cover */}
        {art && (
          <Image
            src={art}
            alt={title || "Album art"}
            width={200}
            height={200}
            className="relative z-10 flex-none rounded-lg w-[110px] h-[110px] sm:w-[150px] sm:h-[150px] object-cover shadow-[4px_4px_14px_rgba(0,0,0,0.45)] group-hover:scale-[0.98] transition-transform"
            unoptimized
          />
        )}

        {/* Text */}
        <div className="relative z-10 min-w-0 flex-1 text-left">
          <div className="font-bit group-hover:font-title text-white leading-tight text-xl sm:text-3xl truncate">
            {title}
          </div>
          <div className="font-roc font-medium text-white/85 text-base sm:text-xl truncate mt-1">
            {sub}
          </div>
          <div className="font-roc text-white/55 text-xs sm:text-sm mt-2">
            {[tracks ? `${tracks} songs` : null, year].filter(Boolean).join(" · ")}
          </div>
        </div>
      </a>
    </div>
  );
}
