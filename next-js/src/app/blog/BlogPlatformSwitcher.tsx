"use client";

import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";

export default function BlogPlatformSwitcher() {
  const [platform, setPlatform] = usePlatform();

  return (
    <div className="md:absolute md:right-6">
      <PlatformSwitcher
        platform={platform}
        setPlatform={setPlatform}
        className="w-16"
      />
    </div>
  );
}
