"use client";

import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";

export default function BlogPlatformSwitcher() {
  const [platform, setPlatform] = usePlatform();

  return (
    <div>
      <PlatformSwitcher
        platform={platform}
        setPlatform={setPlatform}
        className="w-16"
      />
    </div>
  );
}
