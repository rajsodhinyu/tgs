"use client";

import Image from "next/image";
import { usePlatform } from "../components/PlatformSwitcher";

interface TrackEmbedProps {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  heading?: string;
  subheading?: string;
  alignment?: "left" | "right";
}

export default function TrackEmbedBlock({
  spotifyUrl,
  appleMusicUrl,
  trackName,
  artistName,
  albumArt,
  heading,
  subheading,
  alignment = "left",
}: TrackEmbedProps) {
  const [platform] = usePlatform();
  const isRight = alignment === "right";

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  return (
    <>
      <div className="clear-both pt-6" />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${isRight ? "float-right ml-4" : "float-left mr-4"} mb-2 w-[180px] block`}
        style={{ textIndent: 0 }}
      >
        {albumArt && (
          <Image
            src={albumArt}
            alt={trackName || "Album art"}
            width={180}
            height={180}
            className="rounded-lg w-[180px] h-[180px] object-cover border-4 border-white border-opacity-0 hover:border-opacity-100 hover:scale-95 transition-all"
            unoptimized
          />
        )}
        <div className="font-title text-white text-left mt-2 leading-tight truncate">
          <div className="truncate text-base lg:text-xl">
            {heading || trackName}
          </div>
          <div className="text-white/80 text-sm lg:text-md truncate font-roc font-medium">
            {subheading || artistName}
          </div>
        </div>
      </a>
    </>
  );
}
