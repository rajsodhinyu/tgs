"use client";

import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";

export default function BlogPlatformSwitcher() {
  const [platform, setPlatform] = usePlatform();

  // -7px nudge is the locked-in alignment from the (removed) byline tuner.
  return (
    <div style={{ marginBottom: -7 }}>
      <PlatformSwitcher
        platform={platform}
        setPlatform={setPlatform}
        className="w-16"
      />
    </div>
  );
}
