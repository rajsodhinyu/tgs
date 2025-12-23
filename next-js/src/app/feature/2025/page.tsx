import Link from "next/link";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../../client";
import { Metadata } from "next";
import AlbumGrid from "./AlbumGrid";

const ALBUMS_Q = `*[_type == "albums" && year == 2025]{_id, name, artist, thumb, writer, datetime, slug}|order(datetime asc)`;

export const metadata: Metadata = {
  title: "That Good Sh*t: Top 50 Albums of 2025",
  description:
    "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
  openGraph: {
    title: "That Good Sh*t: Top 50 Albums of 2025",
    description:
      "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
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
    description:
      "TGS Top 50 Albums of 2025. Curated album reviews and recommendations.",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/0cc8d3c5e30f8a5bf22beaece940c1f1c30e677e-4219x4219.png?w=1000&h=1000",
    ],
  },
};

export default async function Page() {
  const blogs = await sanityFetch<SanityDocument[]>({ query: ALBUMS_Q });

  return (
    <div className="mt-8 md:mt-6 pb-3">
      <div className="flex justify-between items-center mx-3 mb-8 pt-16 md:pt-0">
        <Link
          href="/feature/2024"
          className="text-lg md:text-xl font-bit text-white hover:underline"
        >
          &lt; 2024
        </Link>
        <h1 className="text-lg text-center sm:text-2xl lg:text-4xl font-bold font-title text-white absolute left-1/2 transform uppercase -translate-x-1/2">
          50 faves of 2025
        </h1>
        <div className="text-lg md:text-xl invisible">&lt; 2024</div>
      </div>
      <AlbumGrid albums={blogs as any} />
    </div>
  );
}
