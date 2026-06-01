"use client";

import {
  useSyncExternalStore,
  useCallback,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import type { SwitchShape } from "./bgStyle";

// Layout effect on the client, no-op effect on the server (avoids the SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
 * Store holding the *current* post's custom color. `undefined` means "not yet
 * set by a page" (use the layout's server-resolved initial color); a string or
 * `null` is an explicit value pushed by <BlogBgSync />.
 */
type StoredColor = string | null | undefined;

let currentCustom: StoredColor = undefined;
const customListeners = new Set<() => void>();

function setCurrentCustom(c: string | null) {
  if (currentCustom === c) return;
  currentCustom = c;
  customListeners.forEach((l) => l());
}

function subscribeCustom(cb: () => void) {
  customListeners.add(cb);
  return () => customListeners.delete(cb);
}

function useCurrentCustom(): StoredColor {
  return useSyncExternalStore(
    subscribeCustom,
    () => currentCustom,
    () => undefined,
  );
}

/**
 * Persistent full-bleed backdrop for blog POSTS. It lives in
 * `[...slug]/layout.tsx`, so the same DOM element survives navigation from one
 * post to the next — that persistence is what lets `transition: background-color`
 * cross-fade between articles instead of hard-cutting (a fresh element per page
 * has nothing to transition from).
 *
 * The live color is pushed in by <BlogBgSync /> (rendered by the page).
 * `initialCustom` is the first-paint color resolved server-side in the layout,
 * used until the client store takes over — so a hard load shows the right color
 * with no flash.
 */
export function PersistentBlogBackdrop({
  defaultColor,
  initialCustom = null,
}: {
  defaultColor: string;
  initialCustom?: string | null;
}) {
  const [mode] = useBgMode();
  const stored = useCurrentCustom();
  const customColor = stored === undefined ? initialCustom : stored;
  const color = mode === "custom" && customColor ? customColor : defaultColor;

  return (
    <div
      id="blog-bg"
      className="absolute inset-0 -z-10"
      style={{ backgroundColor: color, transition: "background-color 300ms ease" }}
    />
  );
}

/**
 * Renders nothing — publishes the active post's custom color into the store the
 * persistent backdrop reads. A layout effect lands the update before paint, so
 * the color is right on load (no flash) and cross-fades on client navigation.
 */
export function BlogBgSync({ customColor }: { customColor?: string | null }) {
  useIsoLayoutEffect(() => {
    setCurrentCustom(customColor ?? null);
  }, [customColor]);
  return null;
}

/**
 * Reader control sitting inline in the byline — between the date and the
 * platform switcher — for flipping between the post's custom color and the
 * regular default. Two presentations (set in the dev tuner / bgStyle):
 *  - "pill": one wide, very rounded oval filled with the current color; tap to
 *    toggle.
 *  - "dots": two circles (custom color + default color); tap one to pick it.
 * Renders nothing if the post has no distinct custom color.
 */
export function BlogBgSwitch({
  customColor,
  defaultColor,
  shape = "pill",
}: {
  customColor?: string | null;
  defaultColor: string;
  shape?: SwitchShape;
}) {
  const [mode, setMode] = useBgMode();

  if (!customColor || customColor.toLowerCase() === defaultColor.toLowerCase()) {
    return null;
  }

  if (shape === "dots") {
    return (
      <span style={dotsRow}>
        <button
          type="button"
          onClick={() => setMode("custom")}
          aria-pressed={mode === "custom"}
          aria-label="Use the post's background color"
          title="Post color"
          style={{
            ...dot,
            background: customColor,
            ...(mode === "custom" ? dotActive : dotIdle),
          }}
        />
        <button
          type="button"
          onClick={() => setMode("default")}
          aria-pressed={mode === "default"}
          aria-label="Use the default background color"
          title="Default color"
          style={{
            ...dot,
            background: defaultColor,
            ...(mode === "default" ? dotActive : dotIdle),
          }}
        />
      </span>
    );
  }

  const current = mode === "custom" ? customColor : defaultColor;

  return (
    <button
      type="button"
      onClick={() => setMode(mode === "custom" ? "default" : "custom")}
      title={`Background: ${mode === "custom" ? "post color" : "default"} — tap to switch`}
      aria-label="Switch page background color"
      style={{ ...pill, background: current }}
    />
  );
}

// Sizing below is the locked-in look from the (removed) byline tuner.
const pill: CSSProperties = {
  flex: "none",
  width: 56,
  height: 22,
  borderRadius: 9999,
  border: "1.5px solid rgba(255,255,255,0.45)",
  cursor: "pointer",
  padding: 0,
  transition: "background-color 300ms",
};

const dotsRow: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const dot: CSSProperties = {
  flex: "none",
  width: 22,
  height: 22,
  borderRadius: 9999,
  borderStyle: "solid",
  borderWidth: 1.5,
  borderColor: "rgba(255,255,255,0.45)",
  cursor: "pointer",
  padding: 0,
  transition: "opacity 200ms, box-shadow 200ms",
};

const dotActive: CSSProperties = {
  opacity: 1,
  boxShadow: "0 0 0 2px rgba(255,255,255,0.75)",
};

const dotIdle: CSSProperties = {
  opacity: 0.5,
};
