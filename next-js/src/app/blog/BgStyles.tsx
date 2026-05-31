import { bgStyle, generateBgCss, type BgStyle } from "./bgStyle";

/**
 * Emits the background-color stylesheet for `#blog-bg`. Rendered once by the
 * blog post page; <BgColorTuner /> hot-swaps its contents for live preview.
 */
export default function BgStyles({
  style = bgStyle,
}: {
  style?: BgStyle;
}) {
  return (
    <style
      id="blog-bg-styles"
      dangerouslySetInnerHTML={{ __html: generateBgCss(style) }}
    />
  );
}
