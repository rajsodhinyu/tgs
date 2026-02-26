"use client";

import Image from "next/image";
import { usePlatform } from "../components/PlatformSwitcher";

interface PlaylistEmbedProps {
  name?: string;
  description?: string;
  coverUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
}

export default function PlaylistEmbedBlock({
  name,
  description,
  coverUrl,
  spotifyUrl,
  appleMusicUrl,
}: PlaylistEmbedProps) {
  const [platform] = usePlatform();

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  // Spotify embed URL
  const parts = spotifyUrl?.split("/") || [];
  const embedUrl =
    parts.length >= 5
      ? `https://open.spotify.com/embed/${parts[3]}/${parts[4]}`
      : null;

  return (
    <div className="clear-both pt-4 pb-2 w-full">
      {/* Custom card */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center gap-4 rounded-md transition-all p-3 group overflow-hidden mt-2"
        style={{ textIndent: 0 }}
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover scale-110 blur-2xl opacity-100"
            unoptimized
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {coverUrl && (
          <Image
            src={coverUrl}
            alt={name || "Playlist cover"}
            width={120}
            height={120}
            className="relative z-10 rounded-md w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover flex-shrink-0 transition-transform border-2 border-opacity-0 group-hover:border-opacity-100 border-white"
            unoptimized
          />
        )}
        <div className="relative z-10 min-w-0 flex-1">
          <div className="font-bit group-hover:font-title text-white text-lg sm:text-3xl leading-tight truncate">
            {name}
          </div>
          {description && (
            <div className="text-white/70 text-base sm:text-md mt-1 line-clamp-2">
              {description}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
