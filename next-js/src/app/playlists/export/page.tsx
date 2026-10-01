import { Metadata } from "next";
import PlaylistExporter from "./PlaylistExporter";
import { loadExportPlaylists } from "./loadPlaylists";

export const metadata: Metadata = {
  title: "Export Playlist Crate | That Good Sh*t",
  description: "Export a playlist crate as a shareable PNG image.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return (
    <div className="md:mt-6 pb-3">
      <PlaylistExporter playlists={await loadExportPlaylists()} />
    </div>
  );
}
