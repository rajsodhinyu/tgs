import { sanityFetch } from "@/app/client";
import { bgStyle } from "../bgStyle";
import { PersistentBlogBackdrop } from "../BlogBg";

/**
 * Layout shared by every blog post. Because it sits at the `[...slug]` segment,
 * it stays mounted while the reader navigates from one post to another — so the
 * single <PersistentBlogBackdrop /> element persists and its background-color
 * can cross-fade between articles (see BlogBg.tsx).
 *
 * It also resolves the first-paint color server-side (the layout receives the
 * route `params`) so a hard load shows the right color with no flash, before the
 * client store takes over for subsequent navigations.
 */
export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string | string[] }>;
}) {
  const slugParam = (await params).slug;
  const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam;
  const post = await sanityFetch<{ bgColor?: { hex?: string } } | null>({
    query: `*[_type == "post" && slug.current == "${slug}"][0]{bgColor}`,
  });
  const initialCustom = post?.bgColor?.hex ?? null;

  return (
    <>
      <PersistentBlogBackdrop
        defaultColor={bgStyle.color}
        initialCustom={initialCustom}
      />
      {children}
    </>
  );
}
