import Image from "next/image";
import Link from "next/link";



export default function PlaylistCard({ title, description, cover, url, disabled }: { title: string, description: string, cover: string, url: string, disabled?: boolean }) {
  return (
    <div className={`align-middle pb-3 group ${disabled ? "opacity-30 pointer-events-none" : ""}`}>
      <Link className=""
        href={url}>
        <Image className='rounded-lg place-self-center flex shrink border-white border-0 group-hover:border-4 md:group-hover:border-6 group-hover:scale-[98%]' src={cover} alt="" width={400} height={400} />
        <div className="flex-col justify-between ">
          <div className="pt-4 text-center text-pretty text-white text-xl font-bold font-bit group-hover:font-title leading-4 lg:text-3xl">{title}</div>
          <div className="w-11/12 place-self-center text-center align-center text-white/80 group-hover:text-white text-balance text-xs lg:text-lg font-semibold font-roc leading-none pt-2">{description}</div>
        </div>
      </Link>
    </div>

  )
}

/* border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple */ 