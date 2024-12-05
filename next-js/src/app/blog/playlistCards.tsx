import Link from "next/link";



export default function PlaylistCard({ title, description, cover, url }: { title: string, description: string, cover: string, url: string }) {
  return (
    <div className=" align-middle pb-3 group">
      <Link className=""
        href={url}>
        <img className='rounded-lg place-self-center flex shrink border-tgs-purple border-0 group-hover:border-4 md:group-hover:border-6 group-hover:scale-[98%]' src={cover} alt="" />
        <div className="flex-col justify-between ">
          <div className="pt-4 text-center text-pretty text-black text-xl font-bold font-bit leading-4 lg:text-3xl group-hover:underline decoration-tgs-purple">{title}</div>
          <div className="w-11/12 place-self-center text-center align-center text-black group-hover:text-tgs-purple text-balance text-xs lg:text-lg font-semibold font-roc leading-none pt-2">{description}</div>
        </div>
      </Link>
    </div>

  )
}

/* border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple */ 