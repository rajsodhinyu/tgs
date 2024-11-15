import Image from "next/image";

export default function PlaylistCard({ url }: { url: string }) {
  return (
    <div className="w-30 h-30 inline-flex pb-3">
      <div className=" content-center">
        <img className='rounded-xl' src="http://via.placeholder.com/300x300" alt="" />
      </div>
      <div className="p-4 flex-col justify-start">
        <div className="text-justify text-black text-3xl font-medium font-bit leading-7 flex ">Playlist Title</div>
        <div className="text-black text-balance text-sm font-semibold font-roc leading-none flex pt-3">Playlist details: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eleifend magna id lectus efficitur pellentesque. </div>
      </div>
    </div>
  )
}