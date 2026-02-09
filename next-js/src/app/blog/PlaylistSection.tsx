"use client";

import { useState } from "react";
import PlaylistCard from "./playlistCards";

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
  const [platform, setPlatform] = useState<"spotify" | "apple">("spotify");

  return (
    <>
      <div className="flex items-center pb-3 justify-between w-full px-3">
        <div className="text-3xl font-bold text-black font-bit leading-10">
          PLAYLISTS
        </div>
        <div className="flex gap-1 bg-gray-200 rounded-full">
          <button
            onClick={() => setPlatform("spotify")}
            className={`px-3 py-1 rounded-full text-xs font-bold font-roc transition-colors ${
              platform === "spotify"
                ? "bg-tgs-purple text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Spotify
          </button>
          <button
            onClick={() => setPlatform("apple")}
            className={`px-3 py-1 rounded-full text-xs font-bold font-roc transition-colors ${
              platform === "apple"
                ? "bg-tgs-purple text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Apple Music
          </button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 grid-cols-2 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist._id}
            title={playlist.name}
            description={playlist.description}
            cover={playlist.coverUrl}
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
