/**
 * The card description for a blog post is the first sentence of the body they
 * already wrote — not a byline, and not a truncated "dek". Portable Text stores
 * that copy as `block` spans; this walks them in document order.
 */

function blockText(block: any): string {
  if (block?._type !== "block" || !Array.isArray(block.children)) return "";
  return block.children
    .map((child: any) => (typeof child?.text === "string" ? child.text : ""))
    .join("");
}

/**
 * First non-empty normal paragraph. Headings, embeds, and empty editor
 * artifacts are skipped so we don't pick "★TIMESTAMPS★" or a title over the
 * lede.
 */
export function firstBodyParagraph(content: unknown): string {
  if (!Array.isArray(content)) return "";
  for (const block of content) {
    if (block?._type !== "block") continue;
    if (block.style && block.style !== "normal") continue;
    const text = blockText(block).replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return "";
}

/**
 * First sentence of `paragraph`, including its terminator. If the paragraph
 * has no `.` / `!` / `?`, the whole paragraph is returned — that's still their
 * copy; inventing a shorter line would be worse.
 */
export function firstSentence(paragraph: string): string {
  const text = paragraph.replace(/\s+/g, " ").trim();
  if (!text) return "";
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

export function ledeFromContent(content: unknown): string | null {
  const sentence = firstSentence(firstBodyParagraph(content));
  return sentence || null;
}
