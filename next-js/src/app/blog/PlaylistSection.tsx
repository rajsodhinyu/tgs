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
    <>
      <div className="relative flex items-center justify-start  w-full py-3 sm:px-0">
        <Link
          href="/playlists"
          className="bg-tgs-purple rounded-2xl px-4 sm:px-6 text-[5vw] sm:text-4xl font-bold font-title uppercase text-white border-4 border-transparent hover:border-white hover:scale-95 text-nowrap flex items-center gap-2 transition-all"
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
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 no-scrollbar -mb-2 lg:hidden">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className="w-[150px] flex-shrink-0 snap-center"
          >
            <PlaylistCard
              title={playlist.name}
              description={playlist.description}
              cover={playlist.coverUrl}
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
      {/* Desktop: grid layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist._id}
            title={playlist.name}
            description={playlist.description}
            cover={playlist.coverUrl}
            disabled={platform === "apple" && !playlist.appleMusicURL}
            url={
              platform === "apple" && playlist.appleMusicURL
                ? playlist.appleMusicURL
                : playlist.playlistURL
            }
          />
        ))}
      </div>
    </>
  );
}
