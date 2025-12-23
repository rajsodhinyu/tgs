import Image from "next/image";
import Link from "next/link";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../../client";
import { Metadata } from "next";

const projectId = "fnvy29id";
const dataset = "tgs";

const ALBUMS_Q = `*[_type == "albums" && year == 2025]{_id, name, artist, thumb, writer, datetime, slug}|order(datetime asc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}
function tabResolver(isYoutube: boolean) {
  if (isYoutube) {
    return `_blank`;
  } else {
    return `_self`;
  }
}
function linkResolver(slug: any) {
  if (slug?.current == undefined) {
    return "/feature/2025";
  }
  return `/feature/2025/${slug.current}`;
}

export const metadata: Metadata = {
  title: "That Good Sh*t: Top 50 Albums of 2025",
  description: "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
  openGraph: {
    title: "That Good Sh*t: Top 50 Albums of 2025",
    description: "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/0cc8d3c5e30f8a5bf22beaece940c1f1c30e677e-4219x4219.png?w=1000&h=1000",
        width: 1000,
        height: 1000,
        alt: "TGS Top 50 Albums of 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "That Good Sh*t: Top 50 Albums of 2025",
    description: "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
    images: ["https://cdn.sanity.io/images/fnvy29id/tgs/0cc8d3c5e30f8a5bf22beaece940c1f1c30e677e-4219x4219.png?w=1000&h=1000"],
  },
};

export default async function Page() {
  const blogs = await sanityFetch<SanityDocument[]>({ query: ALBUMS_Q });

  return (
    <div className="mt-16 md:mt-14 pb-3">
      <div className="grid md:grid-cols-5 mx-3 gap-2 grid-cols-2 md:-mt-10">
        {blogs.map((blog) => (
          <div
            className="group flex flex-col text-center justify-around"
            key={blog._id}
          >
            <div className="text-white flex flex-col">
              <div className="relative">
                <Link
                  className="hover:underline decoration-tgs-purple"
                  href={linkResolver(blog.slug)}
                >
                  <Image
                    className="object-contain rounded-md border-tgs-purple border-0 hover:border-4 hover:scale-[98%]"
                    src={`${eventImage(blog)}?h=300&w=300&fit=crop&crop=center`}
                    width={300}
                    height={300}
                    alt={`${blog.name} Cover`}
                    sizes="(max-width: 400px) 100vw"
                    quality={100}
                  />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
