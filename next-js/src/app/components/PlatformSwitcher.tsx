"use client";

import { useSyncExternalStore, useCallback } from "react";

type Platform = "spotify" | "apple";

const STORAGE_KEY = "tgs-platform";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): Platform {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "apple" ? "apple" : "spotify";
}

function getServerSnapshot(): Platform {
  return "spotify";
}

export function usePlatform(): [Platform, (p: Platform) => void] {
  const platform = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setPlatform = useCallback((p: Platform) => {
    localStorage.setItem(STORAGE_KEY, p);
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  return [platform, setPlatform];
}

const SWITCHER_SRC =
  "https://cdn.sanity.io/images/fnvy29id/tgs/b66fb12a38cefd233b0ec4ce181e21bc19358187-2048x779.png";
const DOT_SRC =
  "https://cdn.sanity.io/images/fnvy29id/tgs/99d06c48fd9516f9867456a9b4055eed2da1cdfb-2048x779.png";

export default function PlatformSwitcher({
  platform,
  setPlatform,
  className,
}: {
  platform: Platform;
  setPlatform: (p: Platform) => void;
  className?: string;
}) {
  const isApple = platform === "apple";

  return (
    <button
      onClick={() => setPlatform(isApple ? "spotify" : "apple")}
      className={`relative cursor-pointer ${className ?? "w-32"}`}
      style={{ aspectRatio: "2048 / 779" }}
      aria-label={`Switch to ${isApple ? "Spotify" : "Apple Music"}`}
    >
      {/* Track with logos */}
      <img
        src={SWITCHER_SRC}
        alt=""
        className="w-full h-full"
        draggable={false}
      />
      {/* Sliding dot */}
      <img
        src={DOT_SRC}
        alt=""
        className="absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(${isApple ? "25%" : "1%"})` }}
        draggable={false}
      />
    </button>
  );
}
