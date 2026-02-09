"use client";

import { useState } from "react";

type Platform = "spotify" | "apple";

export function usePlatform() {
  return useState<Platform>("spotify");
}

export default function PlatformSwitcher({
  platform,
  setPlatform,
}: {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}) {
  return (
    <div className="flex gap-1 bg-white/10 rounded-full">
      <button
        onClick={() => setPlatform("spotify")}
        className={`px-3 py-1 rounded-full text-xs font-bold font-roc transition-colors ${
          platform === "spotify"
            ? "bg-white text-black"
            : "text-white hover:bg-white/20"
        }`}
      >
        Spotify
      </button>
      <button
        onClick={() => setPlatform("apple")}
        className={`px-3 py-1 rounded-full text-xs font-bold font-roc transition-colors ${
          platform === "apple"
            ? "bg-white text-black"
            : "text-white hover:bg-white/20"
        }`}
      >
        Apple Music
      </button>
    </div>
  );
}
