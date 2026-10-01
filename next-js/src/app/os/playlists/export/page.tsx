import { Metadata } from "next";
import PlaylistExporter from "../../../playlists/export/PlaylistExporter";
import { loadExportPlaylists } from "../../../playlists/export/loadPlaylists";

export const metadata: Metadata = {
  title: "Playlist export | TGOS",
};

export default async function Page() {
  return (
    <div className="pt-6 pb-3">
      <PlaylistExporter playlists={await loadExportPlaylists()} backHref="/" />
    </div>
  );
}
