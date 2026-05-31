import savedStyle from "./bgStyle.json";

/**
 * Live-tweakable background color for blog post (`[...slug]`) pages.
 *
 * The value generates one stylesheet rule targeting `#blog-bg` (the fixed
 * full-bleed backdrop on the post page). The dev-only <BgColorTuner /> hot-swaps
 * that stylesheet for live preview and POSTs back via `/api/bg-style`.
 */

export type BgStyle = {
  /** Page background color (any CSS color; the tuner emits hex). */
  color: string;
};

export const bgStyle: BgStyle = savedStyle as BgStyle;

/** Generate the `#blog-bg { … }` rule for the current config. */
export function generateBgCss(style: BgStyle): string {
  return `#blog-bg{background-color:${style.color};}`;
}
