import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../../client";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { Metadata } from "next";
import PlaylistExporter from "./PlaylistExporter";

const projectId = "fnvy29id";
const dataset = "tgs";

const PLAYLIST_Q = `*[_type == "playlist"] | order(order asc) {_id, thumb, name, description, playlistURL}`;

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
  title: "Export Playlist Crate | That Good Sh*t",
  description: "Export a playlist crate as a shareable PNG image.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const playlists = await sanityFetch<SanityDocument[]>({ query: PLAYLIST_Q });

  return (
    <div className="md:mt-6 pb-3">
      <PlaylistExporter
        playlists={playlists.map((playlist) => ({
          _id: playlist._id,
          name: playlist.name,
          description: playlist.description,
          playlistURL: playlist.playlistURL,
          coverUrl: `${eventImage(playlist)}?h=700&w=700&fit=crop&crop=center`,
        }))}
      />
    </div>
  );
}
