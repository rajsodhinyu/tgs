"use client";

import Link from "next/link";
import PlaylistCard from "./playlistCards";
import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";
import ChevronDots from "../components/ChevronDots";

type Playlist = {
  _id: string;
  name: string;
  description: string;
  playlistURL: string;
  appleMusicURL?: string;
  coverUrl: string;
};

export default function PlaylistSection({
  playlists,
}: {
  playlists: Playlist[];
}) {
  const [platform, setPlatform] = usePlatform();

  return (
    // Cap the section (heading + crates) at the feature image's 1440px width and
    // center it, so the crate row lines up edge-to-edge with the image above.
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="relative flex items-center justify-start  w-full py-3 sm:px-0">
        <Link
          href="/playlists"
          className="bg-tgs-dark-purple rounded-2xl px-4 sm:px-6 text-[5vw] sm:text-4xl font-bold font-title uppercase text-white border-4 border-transparent hover:border-white hover:scale-95 text-nowrap flex items-center gap-2 transition-all"
        >
          Playlists
          <ChevronDots className="inline-block mt-1" />
        </Link>
        <div className="absolute right-3 sm:right-4">
          <PlatformSwitcher
            platform={platform}
            setPlatform={setPlatform}
            className="w-[20vw] sm:w-28 lg:w-32"
          />
        </div>
      </div>
      {/* Mobile: horizontal scroll carousel */}
      <div className="flex pt-2 w-full overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar md:hidden">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="w-[150px] flex-shrink-0 snap-center"
          >
            <PlaylistCard
              title={playlist.name}
              description={playlist.description}
              cover={playlist.coverUrl}
              playlistURL={playlist.playlistURL}
              disabled={platform === "apple" && !playlist.appleMusicURL}
              url={
                platform === "apple" && playlist.appleMusicURL
                  ? playlist.appleMusicURL
                  : playlist.playlistURL
              }
            />
          </div>
        ))}
      </div>
      {/* Desktop: crates cap at 500px and spread (justify-between) within the
          1440px column. Note: 3×500 > 1440, so at full width they fill the row
          evenly; drop the cap below ~480px to reopen gaps between them. */}
      <div className="hidden md:grid grid-cols-[repeat(3,minmax(0,500px))] justify-between gap-2">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist._id}
            title={playlist.name}
            description={playlist.description}
            cover={playlist.coverUrl}
            playlistURL={playlist.playlistURL}
            disabled={platform === "apple" && !playlist.appleMusicURL}
            url={
              platform === "apple" && playlist.appleMusicURL
                ? playlist.appleMusicURL
                : playlist.playlistURL
            }
          />
        ))}
      </div>
    </div>
  );
}
