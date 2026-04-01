"use client";

import Image from "next/image";
import { usePlatform } from "../components/PlatformSwitcher";

interface Track {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  heading?: string;
  subheading?: string;
}

export default function TrackGrid({ tracks }: { tracks: Track[] }) {
  const [platform] = usePlatform();

  return (
    <div
      className="clear-both grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6"
      style={{ textIndent: 0 }}
    >
      {tracks.map((track, i) => {
        const href =
          platform === "apple" && track.appleMusicUrl
            ? track.appleMusicUrl
            : track.spotifyUrl || track.appleMusicUrl;

        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {track.albumArt && (
              <Image
                src={track.albumArt}
                alt={track.trackName || "Album art"}
                width={300}
                height={300}
                className="rounded-lg w-full aspect-square object-cover border-4 border-white border-opacity-0 hover:border-opacity-100 hover:scale-95 transition-all"
                unoptimized
              />
            )}
            <div className="font-title text-white mt-2 leading-tight">
              <div className="truncate text-sm lg:text-xl">
                {track.heading || track.trackName}
              </div>
              <div className="text-white/80 font-roc font-medium text-sm lg:text-lg truncate">
                {track.subheading || track.artistName}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
