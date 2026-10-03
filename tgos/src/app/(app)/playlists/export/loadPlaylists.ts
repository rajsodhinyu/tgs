import "server-only";

// Public TGS Sanity dataset, read over the HTTP API (no client lib needed).
const QUERY_URL = "https://fnvy29id.apicdn.sanity.io/v2024-01-01/data/query/tgs";
const QUERY = `*[_type == "playlist"] | order(order asc) {_id, name, description, playlistURL, "ref": thumb.asset._ref}`;

type Row = { _id: string; name: string; description: string; playlistURL: string; ref?: string };

// image-<id>-<w>x<h>-<ext> → https://cdn.sanity.io/images/<project>/<dataset>/<id>-<w>x<h>.<ext>
function imageUrl(ref: string): string | null {
  const m = /^image-([a-zA-Z0-9]+-\d+x\d+)-(\w+)$/.exec(ref);
  return m ? `https://cdn.sanity.io/images/fnvy29id/tgs/${m[1]}.${m[2]}` : null;
}

export async function loadExportPlaylists() {
  const res = await fetch(`${QUERY_URL}?query=${encodeURIComponent(QUERY)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const { result } = (await res.json()) as { result: Row[] };
  return result.flatMap((p) => {
    const cover = p.ref ? imageUrl(p.ref) : null;
    if (!cover) return [];
    return [
      {
        _id: p._id,
        name: p.name,
        description: p.description,
        playlistURL: p.playlistURL,
        coverUrl: `${cover}?h=700&w=700&fit=crop&crop=center`,
      },
    ];
  });
}
