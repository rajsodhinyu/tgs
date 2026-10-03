import type { Metadata } from "next";
import { requireMember } from "@/lib/members";
import PlaylistExporter from "./PlaylistExporter";
import { loadExportPlaylists } from "./loadPlaylists";

export const metadata: Metadata = { title: "Playlist export · tgos" };

export default async function Page() {
  await requireMember();
  return (
    <div className="pt-3">
      <PlaylistExporter playlists={await loadExportPlaylists()} backHref="/" />
    </div>
  );
}
