/**
 * Walks portable text content and groups consecutive trackEmbed blocks
 * into synthetic { _type: "trackGrid", tracks: [...] } objects.
 * Single trackEmbed blocks pass through unchanged.
 *
 * Also marks text blocks that follow a floated track embed with
 * _afterTrack so the renderer can remove text-indent on those paragraphs.
 */

function isEmptyTextBlock(block: any): boolean {
  if (block._type !== "block") return false;
  const children = block.children;
  if (!Array.isArray(children) || children.length === 0) return true;
  return children.every(
    (c: any) => c._type === "span" && (!c.text || c.text.trim() === ""),
  );
}

export function preprocessContent(content: any[]): any[] {
  if (!Array.isArray(content)) return content;

  const result: any[] = [];
  let trackRun: any[] = [];
  let afterTrackAlignment: string | false = false;
  let afterTrackCount = 0;
  const MAX_AFTER_TRACK = 3; // ~enough paragraphs to cover float height

  function flushRun() {
    if (trackRun.length >= 2) {
      result.push({
        _type: "trackGrid",
        _key: trackRun.map((t) => t._key).join("-"),
        tracks: trackRun,
      });
      afterTrackAlignment = false; // grid doesn't float
      afterTrackCount = 0;
    } else if (trackRun.length === 1) {
      result.push(trackRun[0]);
      afterTrackAlignment = trackRun[0].alignment || "left";
      afterTrackCount = 0;
    }
    trackRun = [];
  }

  for (const block of content) {
    if (block._type === "trackEmbed") {
      trackRun.push(block);
    } else if (trackRun.length > 0 && isEmptyTextBlock(block)) {
      // Skip empty paragraphs between tracks (Sanity editor artifact)
      continue;
    } else {
      flushRun();
      if (afterTrackAlignment && block._type === "block" && !isEmptyTextBlock(block) && afterTrackCount < MAX_AFTER_TRACK) {
        afterTrackCount++;
        result.push({ ...block, _afterTrack: true, _afterTrackAlignment: afterTrackAlignment });
      } else {
        afterTrackAlignment = false;
        afterTrackCount = 0;
        result.push(block);
      }
    }
  }

  flushRun();
  return result;
}
