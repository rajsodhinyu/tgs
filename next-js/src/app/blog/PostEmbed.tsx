"use client";

import { usePlatform } from "../components/PlatformSwitcher";

function spotifyEmbedUrl(url: string) {
  const parts = url.split("/");
  return `https://open.spotify.com/embed/${parts[3]}/${parts[4]}`;
}

function appleMusicEmbedUrl(url: string) {
  const base = url.replace(
    "https://music.apple.com",
    "https://embed.music.apple.com",
  );
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}app=music&theme=dark`;
}

export default function PostEmbed({
  spotifyURL,
  appleMusicURL,
}: {
  spotifyURL?: string;
  appleMusicURL?: string;
}) {
  const [platform] = usePlatform();

  if (!spotifyURL && !appleMusicURL) {
    return <div className="-my-4"></div>;
  }

  const showApple = platform === "apple" && !!appleMusicURL;

  return (
    <div className="w-full">
      <div className="place-items-center mt-3 mb-3 max-sm:ml-2">
        {showApple ? (
          <iframe
            key="apple"
            src={appleMusicEmbedUrl(appleMusicURL!)}
            width="100%"
            height="450"
            title="Apple Music Player"
            allow="autoplay *; encrypted-media *; clipboard-write"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            style={{ border: 0, borderRadius: "12px" }}
          ></iframe>
        ) : spotifyURL ? (
          <iframe
            key="spotify"
            src={spotifyEmbedUrl(spotifyURL)}
            width="100%"
            height="450"
            allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        ) : null}
      </div>
    </div>
  );
}
