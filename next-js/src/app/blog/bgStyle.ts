/**
 * Locked-in design values for the blog byline + reader background switch.
 *
 * These numbers were dialed in with a dev-only live "tuner" (a draggable panel
 * that hot-swapped a stylesheet via CSS vars and saved to a JSON file). That
 * tuner has been removed to keep the shipped code simple — the values it
 * produced are now hardcoded directly in the components. See CLAUDE.md ›
 * "Blog byline tuner (removed)" for how it worked and how to rebuild it.
 */

/** Reader switch presentation: one oval pill, or two colored circles. */
export type SwitchShape = "pill" | "dots";

export const bgStyle = {
  /** Default blog-post background — used when a post has no custom `bgColor`. */
  color: "#292929",
  /** How the reader's background switch renders in the byline. */
  switchShape: "dots" as SwitchShape,
};
