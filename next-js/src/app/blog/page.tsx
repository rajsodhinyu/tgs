import Image from "next/image";
import PlaylistSection from "./PlaylistSection";
import Sidebar from "./sidebar";
import { sanityFetch } from "../client";
import { SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "That Good Sh*t!",
  description:
    "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
  openGraph: {
    title: "That Good Sh*t!",
    description:
      "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
    type: "website",
    images: [
      {
        url: "https://cdn.sanity.io/images/fnvy29id/tgs/3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160.png",
        width: 1440,
        height: 1080,
        alt: "That Good Sh*t! Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "That Good Sh*t!",
    description:
      "That Good Sh*t! because good music transcends genre. Our mission is to build community around shared love of music.",
    images: [
      "https://cdn.sanity.io/images/fnvy29id/tgs/3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160.png",
    ],
  },
};

const projectId = "fnvy29id";
const dataset = "tgs";

const PLAYLIST_Q = `
*[_type == "playlist"] | order(order asc) {_id, thumb, name, description, playlistURL, appleMusicURL}`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

export default async function Page() {
  const blogs = await sanityFetch<SanityDocument[]>({ query: PLAYLIST_Q });
  return (
    <div className="place-items-center overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-tgs-dark-purple to-tgs-pink" />
      <Link href={"/feature/2025"}>
        <div>
          <Image
            className="rounded-md border-opacity-0 hover:scale-[0.98] hover:border-opacity-100 border-white border-4 transition-all"
            priority={true}
            src="https://cdn.sanity.io/images/fnvy29id/tgs/3f865c1d27dc5d299ea783001c22015f5d45b3c6-2880x2160.png"
            alt=""
            width={1440}
            quality={100}
            height={1080}
          />
        </div>
      </Link>
      <PlaylistSection
        playlists={blogs.map((playlist) => ({
          _id: playlist._id,
          name: playlist.name,
          description: playlist.description,
          playlistURL: playlist.playlistURL,
          appleMusicURL: playlist.appleMusicURL,
          coverUrl: `${eventImage(playlist)}?h=700&w=700&fit=crop&crop=center`,
        }))}
      />
    </div>
  );
}
