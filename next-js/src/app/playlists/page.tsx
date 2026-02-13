import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { Metadata } from "next";
import PlaylistGrid from "./PlaylistGrid";

const projectId = "fnvy29id";
const dataset = "tgs";

const PLAYLIST_Q = `*[_type == "playlist"] | order(order asc) {_id, thumb, name, description, playlistURL, appleMusicURL}`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

export const metadata: Metadata = {
  title: "That Good Sh*t: Playlists",
  description:
    "Curated playlists from That Good Sh*t. Because good music transcends genre.",
  openGraph: {
    title: "That Good Sh*t: Playlists",
    description:
      "Curated playlists from That Good Sh*t. Because good music transcends genre.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "That Good Sh*t: Playlists",
    description:
      "Curated playlists from That Good Sh*t. Because good music transcends genre.",
  },
};

export default async function Page() {
  const playlists = await sanityFetch<SanityDocument[]>({ query: PLAYLIST_Q });

  return (
    <div className="md:mt-6 pb-3 pt-12 md:pt-0">
      <PlaylistGrid
        playlists={playlists.map((playlist) => ({
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
