"use client";

import { useSyncExternalStore, useCallback, type CSSProperties } from "react";

/**
 * Reader-facing background switch for blog posts.
 *
 * Each post can carry its own `bgColor` (set in Sanity Studio). On the site the
 * reader can flip between that custom color and the regular site default — two
 * swatches sitting left of the byline platform switcher — so a low-contrast
 * custom color never traps anyone. The choice is a per-reader preference
 * persisted in localStorage and shared across posts.
 *
 * Mirrors PlatformSwitcher's localStorage-backed external store, so the backdrop
 * and the toggle stay in sync with no context provider wrapping the page.
 */

type BgMode = "custom" | "default";

const STORAGE_KEY = "tgs-blog-bg-mode";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): BgMode {
  return localStorage.getItem(STORAGE_KEY) === "default" ? "default" : "custom";
}

/** Default to the post's custom color until the reader opts out. */
function getServerSnapshot(): BgMode {
  return "custom";
}

export function useBgMode(): [BgMode, (m: BgMode) => void] {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = useCallback((m: BgMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  return [mode, setMode];
}

/**
 * The fixed full-bleed backdrop. In `custom` mode it paints `customColor`
 * inline (overriding the stylesheet); in `default` mode it stays bare so the
 * site-default rule from <BgStyles /> (`#blog-bg`) shows through.
 */
export function BlogBackdrop({ customColor }: { customColor?: string | null }) {
  const [mode] = useBgMode();
  const useCustom = mode === "custom" && !!customColor;

  return (
    <div
      id="blog-bg"
      className="absolute inset-0 -z-10 bg-[#191A24] transition-colors duration-300"
      style={useCustom ? { backgroundColor: customColor! } : undefined}
    />
  );
}

/**
 * A single floating button (bottom-left, same style as the dev tuner) filled
 * with the current background color. Tap to flip between the post's custom
 * color and the regular default. Renders nothing if the post has no distinct
 * custom color.
 */
export function BlogBgSwitch({
  customColor,
  defaultColor,
}: {
  customColor?: string | null;
  defaultColor: string;
}) {
  const [mode, setMode] = useBgMode();

  if (!customColor || customColor.toLowerCase() === defaultColor.toLowerCase()) {
    return null;
  }

  const current = mode === "custom" ? customColor : defaultColor;

  return (
    <button
      type="button"
      onClick={() => setMode(mode === "custom" ? "default" : "custom")}
      title={`Background: ${mode === "custom" ? "post color" : "default"} — tap to switch`}
      aria-label="Switch page background color"
      style={{ ...fab, background: current }}
    />
  );
}

const fab: CSSProperties = {
  position: "fixed",
  left: 16,
  bottom: 16,
  zIndex: 99998,
  width: 44,
  height: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.45)",
  cursor: "pointer",
  boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
  transition: "background-color 300ms",
};
