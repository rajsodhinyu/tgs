import PlaylistCard from "../blog/playlistCards"



export default function Post() {
  return (<div className="m-10 sm:-mt-8">
    <div className="text-4xl font-bit font-bold text-black text-left flex justify-between"> {/* Title */}
      <div className="">SHOP</div>
      <div className=""><a href="/shop/cart">CART</a></div>
    </div>
    <br />
    <img src="" alt="" />
    <div className="grid gap-10 grid-cols-1 sm:grid-cols-3">
      <PlaylistCard title='GOOD SH*T WEEKLY' description='A weekly selection of our favorite tunes. Updated every Monday!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/0444701d722139f1e6cfb9afc65427cc8a151ff0-2159x2159.jpg" url="https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39"></PlaylistCard>
      <PlaylistCard title='GOOD SH*T WEEKLY' description='A weekly selection of our favorite tunes. Updated every Monday!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/0444701d722139f1e6cfb9afc65427cc8a151ff0-2159x2159.jpg" url="https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39"></PlaylistCard>
      <PlaylistCard title='GOOD SH*T WEEKLY' description='A weekly selection of our favorite tunes. Updated every Monday!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/0444701d722139f1e6cfb9afc65427cc8a151ff0-2159x2159.jpg" url="https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39"></PlaylistCard>
    </div>
  </div>)
}