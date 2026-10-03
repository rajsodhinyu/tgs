"use client";

import { useSyncExternalStore } from "react";

function shouldShow(): boolean {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone =
    ("standalone" in navigator && navigator.standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches;
  return ios && !standalone;
}

const subscribe = () => () => {};

export default function HomeScreenHint() {
  const show = useSyncExternalStore(subscribe, shouldShow, () => false);
  if (!show) return null;
  return (
    <p className="mt-8 font-roc text-sm text-white/60">
      Put tgos on your home screen: tap Share, then &ldquo;Add to Home Screen&rdquo;.
    </p>
  );
}
